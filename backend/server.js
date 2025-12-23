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

app.get("/", (req, res) =>
  res.send("Welcome to HU Employee Management System")
);

app.get("/create-tables", (req, res) => {
  let departments = `CREATE TABLE IF NOT EXISTS departments (
		id INT PRIMARY KEY AUTO_INCREMENT,
		name VARCHAR(100) NOT NULL,
		head_id INT NULL,
		description TEXT,
		status ENUM('active', 'inactive') DEFAULT 'active',
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	)`;

  let employees = `CREATE TABLE IF NOT EXISTS employees (
		id INT PRIMARY KEY AUTO_INCREMENT,
		employee_id VARCHAR(20) UNIQUE NOT NULL,
		first_name VARCHAR(50) NOT NULL,
		last_name VARCHAR(50) NOT NULL,
		gender ENUM('male', 'female') NOT NULL,
		date_of_birth DATE NOT NULL,
		phone VARCHAR(20) NOT NULL,
		email VARCHAR(100) UNIQUE NOT NULL,
		position VARCHAR(100) NOT NULL,
		department_id INT,
		employment_type ENUM('academic', 'admin', 'support') NOT NULL,
		hire_date DATE NOT NULL,
		salary DECIMAL(12, 2) NOT NULL,
		status ENUM('active', 'inactive') DEFAULT 'active',
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (department_id) REFERENCES departments(id)
	)`;

  let users = `CREATE TABLE IF NOT EXISTS users (
		id INT PRIMARY KEY AUTO_INCREMENT,
		employee_id INT NOT NULL UNIQUE,
		email VARCHAR(100) UNIQUE NOT NULL,
		password VARCHAR(255) NOT NULL,
		role ENUM('admin', 'hr_officer', 'department_head', 'finance_officer', 'employee') DEFAULT 'employee',
		status ENUM('active', 'inactive') DEFAULT 'active',
		last_login TIMESTAMP NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (employee_id) REFERENCES employees(id)
	)`;

  let leave_requests = `CREATE TABLE IF NOT EXISTS leave_requests (
		id INT PRIMARY KEY AUTO_INCREMENT,
		employee_id INT NOT NULL,
		leave_type ENUM('annual', 'sick', 'maternity', 'paternity', 'unpaid') NOT NULL,
		start_date DATE NOT NULL,
		end_date DATE NOT NULL,
		days_requested INT NOT NULL,
		reason TEXT NOT NULL,
		status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
		approved_by INT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (employee_id) REFERENCES employees(id),
		FOREIGN KEY (approved_by) REFERENCES employees(id)
	)`;

  let attendance = `CREATE TABLE IF NOT EXISTS attendance (
		id INT PRIMARY KEY AUTO_INCREMENT,
		employee_id INT NOT NULL,
		date DATE NOT NULL,
		status ENUM('present', 'absent', 'late') NOT NULL,
		check_in_time TIME NULL,
		check_out_time TIME NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (employee_id) REFERENCES employees(id),
		UNIQUE KEY (employee_id, date)
	)`;

  connection.query(departments, (err) => {
    if (err) console.log(`Error: ${err}`);
  });

  connection.query(employees, (err) => {
    if (err) console.log(`Error: ${err}`);
  });

  connection.query(users, (err) => {
    if (err) console.log(`Error: ${err}`);
  });

  connection.query(leave_requests, (err) => {
    if (err) console.log(`Error: ${err}`);
  });

  connection.query(attendance, (err) => {
    if (err) console.log(`Error: ${err}`);
  });

  res.send("✅ Tables Created Successfully");
  console.log("✅ Tables Created");
});

app.get("/seed-data", (req, res) => {
  connection.query(
    "INSERT IGNORE INTO departments (name, description) VALUES ('Computer Science', 'CS Department'), ('HR', 'Human Resources'), ('Finance', 'Finance Department')",
    (err) => {
      if (err) console.log(err);
    }
  );

  connection.query(
    "INSERT IGNORE INTO employees (employee_id, first_name, last_name, gender, date_of_birth, phone, email, position, department_id, employment_type, hire_date, salary) VALUES ('HU001', 'Abebe', 'Kebede', 'male', '1975-03-15', '+251911234567', 'abebe.kebede@hu.edu.et', 'HR Director', 2, 'admin', '2010-01-15', 45000.00)",
    (err, results) => {
      if (err) console.log(err);

      const id = results.insertId || 1;
      connection.query(
        "INSERT IGNORE INTO users (employee_id, email, password, role) VALUES (?, 'admin@hu.edu.et', 'password123', 'admin')",
        [id],
        (err) => {
          if (err) console.log(err);
        }
      );
    }
  );

  res.send("✅ Sample Data Inserted");
  console.log("✅ Data Seeded");
});

app.get("/fix-db", (req, res) => {
  const log = [];
  connection.query("DROP TABLE IF EXISTS Admin", (err) => {
    if (err) log.push("Drop Admin fail: " + err.message);

    connection.query("DROP TABLE IF EXISTS users", (err) => {
      if (err) log.push("Drop users fail: " + err.message);

      const usersTable = `CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                employee_id INT NOT NULL UNIQUE,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'hr_officer', 'department_head', 'finance_officer', 'employee') DEFAULT 'employee',
                status ENUM('active', 'inactive') DEFAULT 'active',
                last_login TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (employee_id) REFERENCES employees(id)
            )`;

      connection.query(usersTable, (err) => {
        if (err) {
          log.push("Create users fail: " + err.message);
          return res.json({ success: false, log });
        }
        log.push("Users table created");
        res.json({ success: true, log });
      });
    });
  });
});

app.get("/login-user", (req, res) => {
  let logInUser = `SELECT * FROM users`;
  connection.query(logInUser, (err, results, fields) => {
    if (err) console.log(`Error : ${err}`);
    res.send(results);
  });
});
app.get("/check-setup", (req, res) => {
  let status = {};

  connection.query("SHOW TABLES", (err, tables) => {
    if (err) {
      return res.json({
        error: "Database not found or not connected",
        details: err.message,
      });
    }

    status.tables = tables.map((t) => Object.values(t)[0]);

    connection.query("SELECT * FROM users", (err, users) => {
      if (err) {
        status.users = "Users table not found or error: " + err.message;
      } else {
        status.users = users.map((u) => ({
          id: u.id,
          email: u.email,
          password: u.password,
          role: u.role,
        }));
      }

      connection.query(
        "SELECT COUNT(*) as count FROM employees",
        (err, empCount) => {
          if (err) {
            status.employees = "Error: " + err.message;
          } else {
            status.employees = empCount[0].count + " employees";
          }

          res.json(status);
        }
      );
    });
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    console.log("❌ Missing email or password");
    return res
      .status(400)
      .json({ success: false, message: "Email and password required" });
  }

  connection.query(
    "SELECT u.*, e.first_name, e.last_name, e.position, e.department_id FROM users u JOIN employees e ON u.employee_id = e.id WHERE u.email = ?",
    [email],
    (err, results) => {
      if (err) {
        console.log("❌ Database query error:", err);
        return res
          .status(500)
          .json({ success: false, message: "Login failed" });
      }

      if (results.length === 0) {
        console.log("❌ No user found with email:", email);
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }

      const user = results[0];

      if (password !== user.password) {
        console.log("❌ Password mismatch");
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }

      console.log("✅ Login successful!");

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        "hu_ems_secret_key_2025",
        { expiresIn: "24h" }
      );

      res.json({
        success: true,
        message: "Login successful",
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.first_name,
            lastName: user.last_name,
            position: user.position,
            departmentId: user.department_id,
          },
        },
      });
    }
  );
});

app.get("/api/employees", (req, res) => {
  connection.query(
    "SELECT e.*, d.name as department_name FROM employees e LEFT JOIN departments d ON e.department_id = d.id ORDER BY e.created_at DESC",
    (err, results) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ success: false, message: "Failed to fetch employees" });
      }
      res.json({ success: true, data: results, count: results.length });
    }
  );
});

app.get("/api/employees/:id", (req, res) => {
  const { id } = req.params;

  connection.query(
    "SELECT e.*, d.name as department_name FROM employees e LEFT JOIN departments d ON e.department_id = d.id WHERE e.id = ?",
    [id],
    (err, results) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ success: false, message: "Failed to fetch employee" });
      }

      if (results.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Employee not found" });
      }

      res.json({ success: true, data: results[0] });
    }
  );
});

// POST /api/employees - Create employee
app.post("/api/employees", (req, res) => {
  const {
    employee_id,
    first_name,
    last_name,
    gender,
    date_of_birth,
    phone,
    email,
    position,
    department_id,
    employment_type,
    hire_date,
    salary,
  } = req.body;

  console.log("Creating employee with data:", req.body);

  // Convert department_id and salary to numbers
  const deptId = department_id ? parseInt(department_id) : null;
  const salaryNum = salary ? parseFloat(salary) : 0;

  connection.query(
    "INSERT INTO employees (employee_id, first_name, last_name, gender, date_of_birth, phone, email, position, department_id, employment_type, hire_date, salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      employee_id,
      first_name,
      last_name,
      gender,
      date_of_birth,
      phone,
      email,
      position,
      deptId,
      employment_type,
      hire_date,
      salaryNum,
    ],
    (err, results) => {
      if (err) {
        console.log("❌ Error creating employee:", err);
        console.log("Error details:", err.message);
        return res.status(500).json({
          success: false,
          message: "Failed to create employee: " + err.message,
        });
      }
      console.log(
        "✅ Employee created successfully with ID:",
        results.insertId
      );
      res.json({
        success: true,
        message: "Employee created",
        data: { id: results.insertId },
      });
    }
  );
});

// PUT /api/employees/:id
app.put("/api/employees/:id", (req, res) => {
  const { id } = req.params;
  const {
    first_name,
    last_name,
    gender,
    phone,
    email,
    position,
    department_id,
    employment_type,
    salary,
    status,
  } = req.body;

  connection.query(
    "UPDATE employees SET first_name=?, last_name=?, gender=?, phone=?, email=?, position=?, department_id=?, employment_type=?, salary=?, status=? WHERE id=?",
    [
      first_name,
      last_name,
      gender,
      phone,
      email,
      position,
      department_id,
      employment_type,
      salary,
      status,
      id,
    ],
    (err) => {
      if (err)
        return res
          .status(500)
          .json({ success: false, message: "Update failed" });
      res.json({ success: true, message: "Employee updated" });
    }
  );
});

// DELETE /api/employees/:id
app.delete("/api/employees/:id", (req, res) => {
  connection.query(
    "DELETE FROM employees WHERE id=?",
    [req.params.id],
    (err) => {
      if (err)
        return res
          .status(500)
          .json({ success: false, message: "Delete failed" });
      res.json({ success: true, message: "Employee deleted" });
    }
  );
});

app.get("/api/reports/dashboard-stats", (req, res) => {
  const stats = {};

  connection.query(
    "SELECT COUNT(*) as count FROM employees WHERE status = 'active'",
    (err, results) => {
      stats.totalEmployees = results[0].count;

      connection.query(
        "SELECT COUNT(*) as count FROM leave_requests WHERE status = 'pending'",
        (err, results) => {
          stats.pendingLeaveRequests = results[0].count;

          connection.query(
            "SELECT COUNT(*) as count FROM attendance WHERE date = CURDATE() AND status = 'present'",
            (err, results) => {
              stats.todayPresent = results[0].count;

              connection.query(
                "SELECT COUNT(*) as count FROM departments WHERE status = 'active'",
                (err, results) => {
                  stats.totalDepartments = results[0].count;

                  connection.query(
                    "SELECT employment_type, COUNT(*) as count FROM employees WHERE status = 'active' GROUP BY employment_type",
                    (err, results) => {
                      stats.employeesByType = results;

                      res.json({ success: true, data: stats });
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
});

app.get("/api/departments", (req, res) => {
  connection.query(
    "SELECT d.*, (SELECT COUNT(*) FROM employees WHERE department_id = d.id AND status = 'active') as employee_count FROM departments d ORDER BY d.name",
    (err, results) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ success: false, message: "Failed to fetch departments" });
      }
      res.json({ success: true, data: results, count: results.length });
    }
  );
});

const port = 5000;
app.listen(port, () => {
  console.log(`\nServer: http://localhost:${port}`);
  console.log(`Setup: http://localhost:${port}/create-tables`);
  console.log(`Seed: http://localhost:${port}/seed-data`);
});
