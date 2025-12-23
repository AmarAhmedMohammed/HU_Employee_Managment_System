const express = require("express");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

const connection = mysql.createConnection({
  host: "localhost",
  user: "hu_employee_system",
  password: "12345678",
  database: "hu_employee_system",
});

connection.connect((err) => {
  if (err) console.log(err);
  console.log("✅ Connected to MySQL");
});

app.get("/", (req, res) => res.send("HU Employee Management System API"));

app.get("/create-tables", (req, res) => {
  const tables = [
    `CREATE TABLE IF NOT EXISTS departments (
      id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100) NOT NULL,
      head_id INT NULL, description TEXT, status ENUM('active','inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS employees (
      id INT PRIMARY KEY AUTO_INCREMENT, employee_id VARCHAR(20) UNIQUE NOT NULL,
      first_name VARCHAR(50) NOT NULL, last_name VARCHAR(50) NOT NULL,
      gender ENUM('male','female') NOT NULL, date_of_birth DATE NOT NULL,
      phone VARCHAR(20) NOT NULL, email VARCHAR(100) UNIQUE NOT NULL,
      position VARCHAR(100) NOT NULL, department_id INT,
      employment_type ENUM('academic','admin','support') NOT NULL,
      hire_date DATE NOT NULL, salary DECIMAL(12,2) NOT NULL,
      status ENUM('active','inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id) REFERENCES departments(id))`,
    `CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT, employee_id INT NOT NULL UNIQUE,
      email VARCHAR(100) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL,
      role ENUM('admin','hr_officer','department_head','finance_officer','employee') DEFAULT 'employee',
      status ENUM('active','inactive') DEFAULT 'active', last_login TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id))`,
    `CREATE TABLE IF NOT EXISTS leave_requests (
      id INT PRIMARY KEY AUTO_INCREMENT, employee_id INT NOT NULL,
      leave_type ENUM('annual','sick','maternity','paternity','unpaid') NOT NULL,
      start_date DATE NOT NULL, end_date DATE NOT NULL, days_requested INT NOT NULL,
      reason TEXT NOT NULL, status ENUM('pending','approved','rejected') DEFAULT 'pending',
      approved_by INT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id))`,
    `CREATE TABLE IF NOT EXISTS attendance (
      id INT PRIMARY KEY AUTO_INCREMENT, employee_id INT NOT NULL, date DATE NOT NULL,
      status ENUM('present','absent','late') NOT NULL, check_in_time TIME NULL,
      check_out_time TIME NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id), UNIQUE KEY (employee_id, date))`,
    `CREATE TABLE IF NOT EXISTS performance_reviews (
      id INT PRIMARY KEY AUTO_INCREMENT, employee_id INT NOT NULL, reviewer_id INT NOT NULL,
      review_period ENUM('quarterly','annual') NOT NULL, rating INT NOT NULL,
      strengths TEXT, improvements TEXT, goals TEXT, comments TEXT, review_date DATE NOT NULL,
      status ENUM('draft','submitted','acknowledged') DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id),
      FOREIGN KEY (reviewer_id) REFERENCES employees(id))`
  ];
  tables.forEach(t => connection.query(t, err => { if(err) console.log(err); }));
  res.send("✅ All Tables Created");
});

app.get("/seed-data", (req, res) => {
  connection.query("INSERT IGNORE INTO departments (name, description) VALUES ('Computer Science','CS Dept'),('HR','Human Resources'),('Finance','Finance Dept')");
  connection.query("INSERT IGNORE INTO employees (employee_id,first_name,last_name,gender,date_of_birth,phone,email,position,department_id,employment_type,hire_date,salary) VALUES ('HU001','Abebe','Kebede','male','1975-03-15','+251911234567','abebe.kebede@hu.edu.et','HR Director',2,'admin','2010-01-15',45000.00)", (err, r) => {
    if(!err && r?.insertId) connection.query("INSERT IGNORE INTO users (employee_id,email,password,role) VALUES (?,'admin@hu.edu.et','password123','admin')", [r.insertId]);
  });
  res.send("✅ Data Seeded");
});

// AUTH
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required" });
  connection.query("SELECT u.*, e.first_name, e.last_name, e.position, e.department_id FROM users u JOIN employees e ON u.employee_id = e.id WHERE u.email = ?", [email], (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ success: false, message: "Invalid credentials" });
    const user = results[0];
    if (password !== user.password) return res.status(401).json({ success: false, message: "Invalid credentials" });
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, "hu_ems_secret_key_2025", { expiresIn: "24h" });
    res.json({ success: true, data: { token, user: { id: user.id, email: user.email, role: user.role, firstName: user.first_name, lastName: user.last_name, position: user.position, departmentId: user.department_id }}});
  });
});

// EMPLOYEES
app.get("/api/employees", (req, res) => {
  connection.query("SELECT e.*, d.name as department_name FROM employees e LEFT JOIN departments d ON e.department_id = d.id ORDER BY e.created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Failed" });
    res.json({ success: true, data: results, count: results.length });
  });
});

app.get("/api/employees/:id", (req, res) => {
  connection.query("SELECT e.*, d.name as department_name FROM employees e LEFT JOIN departments d ON e.department_id = d.id WHERE e.id = ?", [req.params.id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: results[0] });
  });
});

app.post("/api/employees", (req, res) => {
  const { employee_id, first_name, last_name, gender, date_of_birth, phone, email, position, department_id, employment_type, hire_date, salary } = req.body;
  connection.query("INSERT INTO employees (employee_id, first_name, last_name, gender, date_of_birth, phone, email, position, department_id, employment_type, hire_date, salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [employee_id, first_name, last_name, gender, date_of_birth, phone, email, position, department_id || null, employment_type, hire_date, salary || 0], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Employee created", data: { id: results.insertId }});
  });
});

app.put("/api/employees/:id", (req, res) => {
  const { first_name, last_name, gender, phone, email, position, department_id, employment_type, salary, status } = req.body;
  connection.query("UPDATE employees SET first_name=?, last_name=?, gender=?, phone=?, email=?, position=?, department_id=?, employment_type=?, salary=?, status=? WHERE id=?",
    [first_name, last_name, gender, phone, email, position, department_id, employment_type, salary, status, req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Failed" });
    res.json({ success: true, message: "Updated" });
  });
});

app.delete("/api/employees/:id", (req, res) => {
  connection.query("DELETE FROM employees WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Failed" });
    res.json({ success: true, message: "Deleted" });
  });
});

// DEPARTMENTS
app.get("/api/departments", (req, res) => {
  connection.query("SELECT d.*, CONCAT(e.first_name, ' ', e.last_name) as head_name, (SELECT COUNT(*) FROM employees WHERE department_id = d.id AND status = 'active') as employee_count FROM departments d LEFT JOIN employees e ON d.head_id = e.id ORDER BY d.name", (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Failed" });
    res.json({ success: true, data: results, count: results.length });
  });
});

app.get("/api/departments/:id", (req, res) => {
  connection.query("SELECT d.*, CONCAT(e.first_name, ' ', e.last_name) as head_name FROM departments d LEFT JOIN employees e ON d.head_id = e.id WHERE d.id = ?", [req.params.id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: results[0] });
  });
});

app.post("/api/departments", (req, res) => {
  const { name, description, head_id, status } = req.body;
  connection.query("INSERT INTO departments (name, description, head_id, status) VALUES (?, ?, ?, ?)", [name, description, head_id || null, status || 'active'], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Department created", data: { id: results.insertId }});
  });
});

app.put("/api/departments/:id", (req, res) => {
  const { name, description, head_id, status } = req.body;
  connection.query("UPDATE departments SET name=?, description=?, head_id=?, status=? WHERE id=?", [name, description, head_id || null, status, req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Failed" });
    res.json({ success: true, message: "Updated" });
  });
});

app.delete("/api/departments/:id", (req, res) => {
  connection.query("DELETE FROM departments WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Deleted" });
  });
});

// LEAVE REQUESTS
app.get("/api/leave-requests", (req, res) => {
  connection.query("SELECT lr.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.employee_id as emp_code, CONCAT(a.first_name, ' ', a.last_name) as approved_by_name FROM leave_requests lr JOIN employees e ON lr.employee_id = e.id LEFT JOIN employees a ON lr.approved_by = a.id ORDER BY lr.created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Failed" });
    res.json({ success: true, data: results, count: results.length });
  });
});

app.post("/api/leave-requests", (req, res) => {
  const { employee_id, leave_type, start_date, end_date, reason } = req.body;
  const start = new Date(start_date);
  const end = new Date(end_date);
  const days_requested = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  connection.query("INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, days_requested, reason) VALUES (?, ?, ?, ?, ?, ?)",
    [employee_id, leave_type, start_date, end_date, days_requested, reason], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Leave request created", data: { id: results.insertId }});
  });
});

app.put("/api/leave-requests/:id", (req, res) => {
  const { status, approved_by } = req.body;
  connection.query("UPDATE leave_requests SET status=?, approved_by=? WHERE id=?", [status, approved_by || null, req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Failed" });
    res.json({ success: true, message: "Updated" });
  });
});

app.delete("/api/leave-requests/:id", (req, res) => {
  connection.query("DELETE FROM leave_requests WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Failed" });
    res.json({ success: true, message: "Deleted" });
  });
});

// ATTENDANCE
app.get("/api/attendance", (req, res) => {
  const { date, employee_id } = req.query;
  let query = "SELECT a.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.employee_id as emp_code FROM attendance a JOIN employees e ON a.employee_id = e.id";
  let params = [];
  let conditions = [];
  if (date) { conditions.push("a.date = ?"); params.push(date); }
  if (employee_id) { conditions.push("a.employee_id = ?"); params.push(employee_id); }
  if (conditions.length > 0) query += " WHERE " + conditions.join(" AND ");
  query += " ORDER BY a.date DESC";
  connection.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Failed" });
    res.json({ success: true, data: results, count: results.length });
  });
});

app.post("/api/attendance", (req, res) => {
  const { employee_id, date, status, check_in_time, check_out_time } = req.body;
  connection.query("INSERT INTO attendance (employee_id, date, status, check_in_time, check_out_time) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status=?, check_in_time=?, check_out_time=?",
    [employee_id, date, status, check_in_time || null, check_out_time || null, status, check_in_time || null, check_out_time || null], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Attendance recorded", data: { id: results.insertId }});
  });
});

app.put("/api/attendance/:id", (req, res) => {
  const { status, check_in_time, check_out_time } = req.body;
  connection.query("UPDATE attendance SET status=?, check_in_time=?, check_out_time=? WHERE id=?", [status, check_in_time, check_out_time, req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Failed" });
    res.json({ success: true, message: "Updated" });
  });
});

app.delete("/api/attendance/:id", (req, res) => {
  connection.query("DELETE FROM attendance WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Failed" });
    res.json({ success: true, message: "Deleted" });
  });
});

// PERFORMANCE
app.get("/api/performance", (req, res) => {
  connection.query("SELECT pr.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.employee_id as emp_code, CONCAT(r.first_name, ' ', r.last_name) as reviewer_name FROM performance_reviews pr JOIN employees e ON pr.employee_id = e.id JOIN employees r ON pr.reviewer_id = r.id ORDER BY pr.review_date DESC", (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Failed" });
    res.json({ success: true, data: results, count: results.length });
  });
});

app.post("/api/performance", (req, res) => {
  const { employee_id, reviewer_id, review_period, rating, strengths, improvements, goals, comments, review_date, status } = req.body;
  connection.query("INSERT INTO performance_reviews (employee_id, reviewer_id, review_period, rating, strengths, improvements, goals, comments, review_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [employee_id, reviewer_id, review_period, rating, strengths, improvements, goals, comments, review_date, status || 'draft'], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Performance review created", data: { id: results.insertId }});
  });
});

app.put("/api/performance/:id", (req, res) => {
  const { rating, strengths, improvements, goals, comments, status } = req.body;
  connection.query("UPDATE performance_reviews SET rating=?, strengths=?, improvements=?, goals=?, comments=?, status=? WHERE id=?",
    [rating, strengths, improvements, goals, comments, status, req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Failed" });
    res.json({ success: true, message: "Updated" });
  });
});

app.delete("/api/performance/:id", (req, res) => {
  connection.query("DELETE FROM performance_reviews WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "Failed" });
    res.json({ success: true, message: "Deleted" });
  });
});

// REPORTS
app.get("/api/reports/dashboard-stats", (req, res) => {
  const stats = {};
  connection.query("SELECT COUNT(*) as count FROM employees WHERE status = 'active'", (err, r) => {
    stats.totalEmployees = r?.[0]?.count || 0;
    connection.query("SELECT COUNT(*) as count FROM leave_requests WHERE status = 'pending'", (err, r) => {
      stats.pendingLeaveRequests = r?.[0]?.count || 0;
      connection.query("SELECT COUNT(*) as count FROM attendance WHERE date = CURDATE() AND status = 'present'", (err, r) => {
        stats.todayPresent = r?.[0]?.count || 0;
        connection.query("SELECT COUNT(*) as count FROM departments WHERE status = 'active'", (err, r) => {
          stats.totalDepartments = r?.[0]?.count || 0;
          connection.query("SELECT employment_type, COUNT(*) as count FROM employees WHERE status = 'active' GROUP BY employment_type", (err, r) => {
            stats.employeesByType = r || [];
            res.json({ success: true, data: stats });
          });
        });
      });
    });
  });
});

app.get("/api/reports/department-distribution", (req, res) => {
  connection.query("SELECT d.name, COUNT(e.id) as employee_count FROM departments d LEFT JOIN employees e ON d.id = e.department_id AND e.status = 'active' WHERE d.status = 'active' GROUP BY d.id, d.name ORDER BY employee_count DESC", (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Failed" });
    res.json({ success: true, data: results });
  });
});

app.get("/api/reports/attendance-summary", (req, res) => {
  const { start_date, end_date } = req.query;
  let query = "SELECT status, COUNT(*) as count FROM attendance";
  let params = [];
  if (start_date && end_date) { query += " WHERE date BETWEEN ? AND ?"; params = [start_date, end_date]; }
  query += " GROUP BY status";
  connection.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Failed" });
    res.json({ success: true, data: results });
  });
});

app.get("/api/reports/leave-summary", (req, res) => {
  connection.query("SELECT leave_type, status, COUNT(*) as count FROM leave_requests GROUP BY leave_type, status ORDER BY leave_type, status", (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Failed" });
    res.json({ success: true, data: results });
  });
});

const port = 5000;
app.listen(port, () => {
  console.log(`\n🚀 Server: http://localhost:${port}`);
  console.log(`📦 Setup: http://localhost:${port}/create-tables`);
  console.log(`🌱 Seed: http://localhost:${port}/seed-data`);
});
