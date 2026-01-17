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
  user: "group_1",
  password: "12345678",
  database: "haramaya_employee_management",
});

connection.connect((err) => {
  if (err) console.log(err);
  console.log("✅ Connected to MySQL");
  runSchemaMigrations();
});

const runSchemaMigrations = () => {
  // List of columns to drop from 'employees' table
  const columnsToDrop = ["date_of_birth", "employment_type"];

  columnsToDrop.forEach((col) => {
    connection.query(
      "SELECT COUNT(*) as count FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'haramaya_employee_management' AND TABLE_NAME = 'employees' AND COLUMN_NAME = ?",
      [col],
      (err, results) => {
        if (!err && results[0].count > 0) {
          console.log(`Column ${col} exists, dropping...`);
          connection.query(
            `ALTER TABLE employees DROP COLUMN ${col}`,
            (err) => {
              if (err) console.error(`Error dropping ${col}:`, err);
              else console.log(`✅ Successfully dropped ${col}`);
            }
          );
        }
      }
    );
  });
};

app.get("/", (req, res) => res.send("HU Employee Management System API"));

app.get("/create-tables", (req, res) => {
  const tables = [
    `CREATE TABLE IF NOT EXISTS departments (
      id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100) NOT NULL,
      head_id INT NULL, description TEXT, status ENUM('active','inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS admins (
      id INT PRIMARY KEY AUTO_INCREMENT,
      admin_id VARCHAR(20) UNIQUE NOT NULL,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      status ENUM('active','inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS employees (
      id INT PRIMARY KEY AUTO_INCREMENT, employee_id VARCHAR(20) UNIQUE NOT NULL,
      first_name VARCHAR(50) NOT NULL, last_name VARCHAR(50) NOT NULL,
      gender ENUM('male','female') NOT NULL,
      phone VARCHAR(20) NOT NULL, email VARCHAR(100) UNIQUE NOT NULL,
      position VARCHAR(100) NOT NULL, department_id INT,
      hire_date DATE NOT NULL, salary DECIMAL(12,2) NOT NULL,
      status ENUM('active') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id) REFERENCES departments(id))`,
    `CREATE TABLE IF NOT EXISTS leave_requests (
      id INT PRIMARY KEY AUTO_INCREMENT, employee_id INT NOT NULL,
      leave_type ENUM('annual','sick','maternity','paternity','unpaid') NOT NULL,
      start_date DATE NOT NULL, end_date DATE NOT NULL, days_requested INT NOT NULL,
      reason TEXT NOT NULL, status ENUM('pending','approved','rejected') DEFAULT 'pending',
      approved_by INT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id))`,
    `CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      employee_id INT NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('super_admin','admin','head','employee','hr_officer','registrar','cafe_service') DEFAULT 'employee',
      status ENUM('active','inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS attendance (
      id INT PRIMARY KEY AUTO_INCREMENT,
      employee_id INT NOT NULL,
      date DATE NOT NULL,
      status ENUM('present','absent','late','permission') DEFAULT 'present',
      check_in_time TIME,
      check_out_time TIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE)`,
  ];
  tables.forEach((t) =>
    connection.query(t, (err) => {
      if (err) console.log(err);
    })
  );
  res.send("✅ All Tables Created");
});

app.get("/seed-data", (req, res) => {
  connection.query(
    "INSERT IGNORE INTO departments (name, description) VALUES ('Computer Science','CS Dept'),('HR','Human Resources'),('Finance','Finance Dept')"
  );

  // Create admin account with ADMIN ID format (separate from employees)
  connection.query(
    "INSERT IGNORE INTO admins (admin_id, username, email, password, first_name, last_name) VALUES ('ADMIN001','admin','admin@hu.edu.et','password123','System','Administrator')"
  );

  // Clean up any old admin records from employees table
  connection.query(
    "DELETE e FROM employees e JOIN users u ON u.employee_id = e.id WHERE u.role = 'admin'"
  );

  // Create sample employee with HU ID format
  connection.query(
    "INSERT IGNORE INTO employees (employee_id,first_name,last_name,gender,phone,email,position,department_id,hire_date,salary) VALUES ('HU001','Abebe','Kebede','male','+251911234567','abebe.kebede@hu.edu.et','HR Director',2,'2010-01-15',45000.00)",
    (err, r) => {
      if (!err && r?.insertId) {
        connection.query(
          "INSERT IGNORE INTO users (employee_id,email,password,role) VALUES (?,'abebe.kebede@hu.edu.et','HU001','hr_officer')",
          [r.insertId],
          () => {
            // Force update in case it already existed
            connection.query(
              "UPDATE users SET password = 'HU001' WHERE email = 'abebe.kebede@hu.edu.et'"
            );
          }
        );
      } else {
        // If employee existed, just update the user password
        connection.query(
          "UPDATE users SET password = 'HU001' WHERE email = 'abebe.kebede@hu.edu.et'"
        );
      }
    }
  );

  res.send(
    "✅ Data Seeded - Admin: ADMIN001, Employee: HU001 (Password: HU001)"
  );
});

app.get("/debug/fix-users", (req, res) => {
  connection.query("SELECT * FROM employees", (err, employees) => {
    if (err) return res.status(500).send("Db error");

    let createdCount = 0;
    let errors = [];

    const processEmployee = (index) => {
      if (index >= employees.length) {
        return res.json({
          success: true,
          message: `Processed ${employees.length} employees. Created ${createdCount} missing user accounts.`,
          errors,
        });
      }

      const emp = employees[index];
      // Check if user exists
      connection.query(
        "SELECT * FROM users WHERE employee_id = ?",
        [emp.id],
        (err, users) => {
          if (!err && users.length === 0) {
            // Create missing user
            connection.query(
              "INSERT INTO users (employee_id, email, password, role) VALUES (?, ?, ?, ?)",
              [emp.id, emp.email, emp.employee_id, "employee"], // Password = HUxxx
              (err) => {
                if (err)
                  errors.push(`Failed for ${emp.employee_id}: ${err.message}`);
                else createdCount++;
                processEmployee(index + 1);
              }
            );
          } else {
            processEmployee(index + 1);
          }
        }
      );
    };

    processEmployee(0);
  });
});

app.get("/debug/fix-attendance", (req, res) => {
  const query = `CREATE TABLE IF NOT EXISTS attendance (
      id INT PRIMARY KEY AUTO_INCREMENT,
      employee_id INT NOT NULL,
      date DATE NOT NULL,
      status ENUM('present','absent','late','permission') DEFAULT 'present',
      check_in_time TIME,
      check_out_time TIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE)`;
  connection.query(query, (err) => {
    if (err)
      return res.status(500).send("Error creating table: " + err.message);
    res.send("✅ Attendance table created successfully");
  });
});

// AUTH
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ success: false, message: "Email and password required" });

  // First check if it's an admin
  connection.query(
    "SELECT * FROM admins WHERE email = ?",
    [email],
    (err, adminResults) => {
      if (err) {
        console.error("Database error during admin login:", err);
        return res
          .status(500)
          .json({ success: false, message: "Database error" });
      }

      if (adminResults.length > 0) {
        // Admin login
        const admin = adminResults[0];
        if (password !== admin.password)
          return res
            .status(401)
            .json({ success: false, message: "Invalid credentials" });

        const token = jwt.sign(
          {
            userId: admin.id,
            email: admin.email,
            role: "admin",
            isAdmin: true,
          },
          "hu_ems_secret_key_2025",
          { expiresIn: "24h" }
        );
        return res.json({
          success: true,
          data: {
            token,
            user: {
              id: admin.id,
              admin_id: admin.admin_id,
              email: admin.email,
              role: "admin",
              firstName: admin.first_name,
              lastName: admin.last_name,
              position: "Administrator",
              isAdmin: true,
            },
          },
        });
      }

      // If not admin, check employees/users
      connection.query(
        "SELECT u.*, e.id as employee_pk, e.employee_id, e.first_name, e.last_name, e.position, e.department_id FROM users u JOIN employees e ON u.employee_id = e.id WHERE u.email = ?",
        [email],
        (err, results) => {
          if (err) {
            console.error("Database error during user login:", err);
            return res
              .status(500)
              .json({ success: false, message: "Database error" });
          }
          if (results.length === 0)
            return res
              .status(401)
              .json({ success: false, message: "Invalid credentials" });
          const user = results[0];
          if (password !== user.password)
            return res
              .status(401)
              .json({ success: false, message: "Invalid credentials" });

          // Check if this employee is a department head
          connection.query(
            "SELECT id FROM departments WHERE head_id = ?",
            [user.employee_pk],
            (err, headResults) => {
              let role = user.role;
              if (!err && headResults.length > 0) {
                role = "head";
              }

              const token = jwt.sign(
                {
                  userId: user.id,
                  email: user.email,
                  role: role,
                  isAdmin: false,
                },
                "hu_ems_secret_key_2025",
                { expiresIn: "24h" }
              );
              res.json({
                success: true,
                data: {
                  token,
                  user: {
                    id: user.id,
                    employeeDbId: user.employee_pk, // Integer ID for FKs
                    employee_id: user.employee_id, // String Code (HU001)
                    email: user.email,
                    role: role,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    position: user.position,
                    departmentId: user.department_id,
                    isAdmin: false,
                  },
                },
              });
            }
          );
        }
      );
    }
  );
});

app.post("/api/auth/change-password", (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, "hu_ems_secret_key_2025");
    const userId = decoded.userId;

    // Check current password first
    connection.query(
      "SELECT * FROM users WHERE id = ?",
      [userId],
      (err, results) => {
        if (err || results.length === 0) {
          // Try admin table if not in users
          connection.query(
            "SELECT * FROM admins WHERE id = ?",
            [userId],
            (err, adminResults) => {
              if (err || adminResults.length === 0)
                return res
                  .status(404)
                  .json({ success: false, message: "User not found" });

              const admin = adminResults[0];
              if (admin.password !== currentPassword) {
                return res.status(400).json({
                  success: false,
                  message: "Incorrect current password",
                });
              }

              // Update admin password
              connection.query(
                "UPDATE admins SET password = ? WHERE id = ?",
                [newPassword, userId],
                (err) => {
                  if (err)
                    return res
                      .status(500)
                      .json({ success: false, message: "Failed to update" });
                  res.json({
                    success: true,
                    message: "Password updated successfully",
                  });
                }
              );
            }
          );
          return;
        }

        const user = results[0];
        if (user.password !== currentPassword) {
          return res
            .status(400)
            .json({ success: false, message: "Incorrect current password" });
        }

        // Update user password
        connection.query(
          "UPDATE users SET password = ? WHERE id = ?",
          [newPassword, userId],
          (err) => {
            if (err)
              return res
                .status(500)
                .json({ success: false, message: "Failed to update" });
            res.json({
              success: true,
              message: "Password updated successfully",
            });
          }
        );
      }
    );
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
});

// EMPLOYEES
app.get("/api/employees", (req, res) => {
  const { department_id } = req.query;
  let query =
    "SELECT e.*, d.name as department_name, u.role FROM employees e LEFT JOIN departments d ON e.department_id = d.id LEFT JOIN users u ON e.id = u.employee_id";
  const params = [];

  if (department_id) {
    query += " WHERE e.department_id = ?";
    params.push(department_id);
  }

  const { search } = req.query;
  if (search) {
    const searchTerm = `%${search}%`;
    if (department_id) {
      query +=
        " AND (e.first_name LIKE ? OR e.last_name LIKE ? OR e.email LIKE ? OR e.phone LIKE ? OR e.employee_id LIKE ?)";
    } else {
      query +=
        " WHERE (e.first_name LIKE ? OR e.last_name LIKE ? OR e.email LIKE ? OR e.phone LIKE ? OR e.employee_id LIKE ?)";
    }
    params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
  }

  query += " ORDER BY e.created_at DESC";

  // Get all employees - admins are now in separate admins table
  connection.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Failed" });
    res.json({ success: true, data: results, count: results.length });
  });
});

app.get("/api/employees/:id", (req, res) => {
  connection.query(
    "SELECT e.*, d.name as department_name FROM employees e LEFT JOIN departments d ON e.department_id = d.id WHERE e.id = ?",
    [req.params.id],
    (err, results) => {
      if (err || results.length === 0)
        return res.status(404).json({ success: false, message: "Not found" });
      res.json({ success: true, data: results[0] });
    }
  );
});

// Helper function to generate next employee ID
function generateEmployeeId(lastEmployeeId) {
  if (!lastEmployeeId) {
    return "HU001";
  }

  // Extract numeric part (e.g., "HU099" -> "099")
  const numericPart = lastEmployeeId.replace("HU", "");
  const nextNumber = parseInt(numericPart, 10) + 1;

  // Pad with zeros to minimum 3 digits
  const paddedNumber = String(nextNumber).padStart(3, "0");

  return `HU${paddedNumber}`;
}

app.post("/api/employees", (req, res) => {
  const {
    first_name,
    last_name,
    gender,
    phone,
    email,
    position,
    department_id,
    hire_date,
    salary,
    role,
  } = req.body;

  // Get the highest employee_id to generate the next one
  connection.query(
    "SELECT employee_id FROM employees ORDER BY employee_id DESC LIMIT 1",
    (err, results) => {
      if (err)
        return res
          .status(500)
          .json({ success: false, message: "Failed to generate employee ID" });

      const lastEmployeeId = results.length > 0 ? results[0].employee_id : null;
      const newEmployeeId = generateEmployeeId(lastEmployeeId);

      // Insert employee with generated ID
      connection.query(
        "INSERT INTO employees (employee_id, first_name, last_name, gender, phone, email, position, department_id, hire_date, salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          newEmployeeId,
          first_name,
          last_name,
          gender,
          phone,
          email,
          position,
          department_id || null,
          hire_date,
          salary || 0,
        ],
        (err, result) => {
          if (err)
            return res
              .status(500)
              .json({ success: false, message: err.message });

          const newEmpDbId = result.insertId;

          // AUTO-CREATE USER ACCOUNT
          // Password is the generated Employee ID (e.g., 'HU001')
          // Role depends on input or default 'employee'
          const role = req.body.role || "employee";

          connection.query(
            "INSERT INTO users (employee_id, email, password, role) VALUES (?, ?, ?, ?)",
            [newEmpDbId, email, newEmployeeId, role],
            (err) => {
              if (err) {
                console.error("Failed to auto-create user:", err);
                // Don't fail the whole request, but log it.
                // Ideally we might want to rollback the employee creation, but for this simple app, we'll proceed.
              }
              res.json({
                success: true,
                message: "Employee and User account created",
                data: { id: newEmpDbId, employee_id: newEmployeeId },
              });
            }
          );
        }
      );
    }
  );
});

app.put("/api/employees/:id", (req, res) => {
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
      req.params.id,
    ],
    (err) => {
      if (err)
        return res.status(500).json({ success: false, message: "Failed" });
      res.json({ success: true, message: "Updated" });
    }
  );
});

app.delete("/api/employees/:id", (req, res) => {
  const employeeId = req.params.id;

  // Delete from all related tables first due to foreign key constraints
  // 1. Delete from users table
  connection.query(
    "DELETE FROM users WHERE employee_id=?",
    [employeeId],
    (err) => {
      // 2. Delete from leave_requests table
      connection.query(
        "DELETE FROM leave_requests WHERE employee_id=?",
        [employeeId],
        (err) => {
          // 3. Delete from attendance table
          connection.query(
            "DELETE FROM attendance WHERE employee_id=?",
            [employeeId],
            (err) => {
              // 4. Delete from performance_reviews table (both employee_id and reviewer_id)
              connection.query(
                "DELETE FROM performance_reviews WHERE employee_id=? OR reviewer_id=?",
                [employeeId, employeeId],
                (err) => {
                  // 5. Finally delete from employees table
                  connection.query(
                    "DELETE FROM employees WHERE id=?",
                    [employeeId],
                    (err) => {
                      if (err) {
                        console.error("Delete error:", err);
                        return res.status(500).json({
                          success: false,
                          message: "Failed to delete employee: " + err.message,
                        });
                      }
                      res.json({
                        success: true,
                        message: "Employee deleted successfully",
                      });
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

// DEPARTMENTS
app.get("/api/departments", (req, res) => {
  const { search } = req.query;
  let query =
    "SELECT d.*, CONCAT(e.first_name, ' ', e.last_name) as head_name, (SELECT COUNT(*) FROM employees WHERE department_id = d.id AND status = 'active') as employee_count FROM departments d LEFT JOIN employees e ON d.head_id = e.id";
  const params = [];

  if (search) {
    query += " WHERE d.name LIKE ? OR d.description LIKE ?";
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }

  query += " ORDER BY d.name";

  connection.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Failed" });
    res.json({ success: true, data: results, count: results.length });
  });
});

app.get("/api/departments/:id", (req, res) => {
  connection.query(
    "SELECT d.*, CONCAT(e.first_name, ' ', e.last_name) as head_name FROM departments d LEFT JOIN employees e ON d.head_id = e.id WHERE d.id = ?",
    [req.params.id],
    (err, results) => {
      if (err || results.length === 0)
        return res.status(404).json({ success: false, message: "Not found" });
      res.json({ success: true, data: results[0] });
    }
  );
});

app.post("/api/departments", (req, res) => {
  const { name, description, head_id, status } = req.body;
  connection.query(
    "INSERT INTO departments (name, description, head_id, status) VALUES (?, ?, ?, ?)",
    [name, description, head_id || null, status || "active"],
    (err, results) => {
      if (err)
        return res.status(500).json({ success: false, message: err.message });
      res.json({
        success: true,
        message: "Department created",
        data: { id: results.insertId },
      });
    }
  );
});

app.put("/api/departments/:id", (req, res) => {
  const { name, description, head_id, status } = req.body;
  connection.query(
    "UPDATE departments SET name=?, description=?, head_id=?, status=? WHERE id=?",
    [name, description, head_id || null, status, req.params.id],
    (err) => {
      if (err)
        return res.status(500).json({ success: false, message: "Failed" });
      res.json({ success: true, message: "Updated" });
    }
  );
});

app.delete("/api/departments/:id", (req, res) => {
  connection.query(
    "DELETE FROM departments WHERE id=?",
    [req.params.id],
    (err) => {
      if (err)
        return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, message: "Deleted" });
    }
  );
});

// LEAVE REQUESTS
app.get("/api/leave-requests", (req, res) => {
  const { employee_id } = req.query;
  let query =
    "SELECT lr.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.employee_id as emp_code, CONCAT(a.first_name, ' ', a.last_name) as approved_by_name FROM leave_requests lr JOIN employees e ON lr.employee_id = e.id LEFT JOIN employees a ON lr.approved_by = a.id";
  const params = [];

  if (employee_id) {
    query += " WHERE lr.employee_id = ?";
    params.push(employee_id);
  }

  const { search } = req.query;
  if (search) {
    const searchTerm = `%${search}%`;
    if (employee_id) {
      query +=
        " AND (e.first_name LIKE ? OR e.last_name LIKE ? OR lr.leave_type LIKE ? OR lr.status LIKE ?)";
    } else {
      query +=
        " WHERE (e.first_name LIKE ? OR e.last_name LIKE ? OR lr.leave_type LIKE ? OR lr.status LIKE ?)";
    }
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  query += " ORDER BY lr.created_at DESC";

  connection.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Failed" });
    res.json({ success: true, data: results, count: results.length });
  });
});

app.post("/api/leave-requests", (req, res) => {
  const { employee_id, leave_type, start_date, end_date, reason } = req.body;
  const start = new Date(start_date);
  const end = new Date(end_date);
  const days_requested = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  connection.query(
    "INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, days_requested, reason) VALUES (?, ?, ?, ?, ?, ?)",
    [employee_id, leave_type, start_date, end_date, days_requested, reason],
    (err, results) => {
      if (err)
        return res.status(500).json({ success: false, message: err.message });
      res.json({
        success: true,
        message: "Leave request created",
        data: { id: results.insertId },
      });
    }
  );
});

app.put("/api/leave-requests/:id", (req, res) => {
  const { status, approved_by } = req.body;
  connection.query(
    "UPDATE leave_requests SET status=?, approved_by=? WHERE id=?",
    [status, approved_by || null, req.params.id],
    (err) => {
      if (err)
        return res.status(500).json({ success: false, message: "Failed" });
      res.json({ success: true, message: "Updated" });
    }
  );
});

app.delete("/api/leave-requests/:id", (req, res) => {
  connection.query(
    "DELETE FROM leave_requests WHERE id=?",
    [req.params.id],
    (err) => {
      if (err)
        return res.status(500).json({ success: false, message: "Failed" });
      res.json({ success: true, message: "Deleted" });
    }
  );
});

// ATTENDANCE
app.get("/api/attendance", (req, res) => {
  const { date, employee_id } = req.query;
  let query =
    "SELECT a.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.employee_id as emp_code FROM attendance a JOIN employees e ON a.employee_id = e.id";
  let params = [];
  let conditions = [];
  if (date) {
    conditions.push("a.date = ?");
    params.push(date);
  }
  if (employee_id) {
    conditions.push("a.employee_id = ?");
    params.push(employee_id);
  }
  if (conditions.length > 0) query += " WHERE " + conditions.join(" AND ");
  query += " ORDER BY a.date DESC";
  connection.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Failed" });
    res.json({ success: true, data: results, count: results.length });
  });
});

app.post("/api/attendance", (req, res) => {
  const { employee_id, date, status, check_in_time, check_out_time } = req.body;
  connection.query(
    "INSERT INTO attendance (employee_id, date, status, check_in_time, check_out_time) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status=?, check_in_time=?, check_out_time=?",
    [
      employee_id,
      date,
      status,
      check_in_time || null,
      check_out_time || null,
      status,
      check_in_time || null,
      check_out_time || null,
    ],
    (err, results) => {
      if (err)
        return res.status(500).json({ success: false, message: err.message });
      res.json({
        success: true,
        message: "Attendance recorded",
        data: { id: results.insertId },
      });
    }
  );
});

app.put("/api/attendance/:id", (req, res) => {
  const { status, check_in_time, check_out_time } = req.body;
  connection.query(
    "UPDATE attendance SET status=?, check_in_time=?, check_out_time=? WHERE id=?",
    [status, check_in_time, check_out_time, req.params.id],
    (err) => {
      if (err)
        return res.status(500).json({ success: false, message: "Failed" });
      res.json({ success: true, message: "Updated" });
    }
  );
});

app.delete("/api/attendance/:id", (req, res) => {
  connection.query(
    "DELETE FROM attendance WHERE id=?",
    [req.params.id],
    (err) => {
      if (err)
        return res.status(500).json({ success: false, message: "Failed" });
      res.json({ success: true, message: "Deleted" });
    }
  );
});

// PERFORMANCE
app.get("/api/performance", (req, res) => {
  const { employee_id } = req.query;
  let query =
    "SELECT pr.*, CONCAT(e.first_name, ' ', e.last_name) as employee_name, e.employee_id as emp_code, CONCAT(r.first_name, ' ', r.last_name) as reviewer_name FROM performance_reviews pr JOIN employees e ON pr.employee_id = e.id JOIN employees r ON pr.reviewer_id = r.id";
  const params = [];

  if (employee_id) {
    query += " WHERE pr.employee_id = ?";
    params.push(employee_id);
  }

  query += " ORDER BY pr.review_date DESC";

  connection.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Failed" });
    res.json({ success: true, data: results, count: results.length });
  });
});

app.post("/api/performance", (req, res) => {
  const {
    employee_id,
    reviewer_id,
    review_period,
    rating,
    strengths,
    improvements,
    goals,
    comments,
    review_date,
    status,
  } = req.body;
  connection.query(
    "INSERT INTO performance_reviews (employee_id, reviewer_id, review_period, rating, strengths, improvements, goals, comments, review_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      employee_id,
      reviewer_id,
      review_period,
      rating,
      strengths,
      improvements,
      goals,
      comments,
      review_date,
      status || "draft",
    ],
    (err, results) => {
      if (err)
        return res.status(500).json({ success: false, message: err.message });
      res.json({
        success: true,
        message: "Performance review created",
        data: { id: results.insertId },
      });
    }
  );
});

app.put("/api/performance/:id", (req, res) => {
  const { rating, strengths, improvements, goals, comments, status } = req.body;
  connection.query(
    "UPDATE performance_reviews SET rating=?, strengths=?, improvements=?, goals=?, comments=?, status=? WHERE id=?",
    [rating, strengths, improvements, goals, comments, status, req.params.id],
    (err) => {
      if (err)
        return res.status(500).json({ success: false, message: "Failed" });
      res.json({ success: true, message: "Updated" });
    }
  );
});

app.delete("/api/performance/:id", (req, res) => {
  connection.query(
    "DELETE FROM performance_reviews WHERE id=?",
    [req.params.id],
    (err) => {
      if (err)
        return res.status(500).json({ success: false, message: "Failed" });
      res.json({ success: true, message: "Deleted" });
    }
  );
});

// REPORTS
app.get("/api/reports/dashboard-stats", (req, res) => {
  const stats = {};
  connection.query(
    "SELECT COUNT(*) as count FROM employees WHERE status = 'active'",
    (err, r) => {
      stats.totalEmployees = r?.[0]?.count || 0;
      connection.query(
        "SELECT COUNT(*) as count FROM leave_requests WHERE status = 'pending'",
        (err, r) => {
          stats.pendingLeaveRequests = r?.[0]?.count || 0;
          connection.query(
            "SELECT COUNT(*) as count FROM attendance WHERE date = CURDATE() AND status = 'present'",
            (err, r) => {
              stats.todayPresent = r?.[0]?.count || 0;
              connection.query(
                "SELECT COUNT(*) as count FROM departments WHERE status = 'active'",
                (err, r) => {
                  stats.totalDepartments = r?.[0]?.count || 0;
                  connection.query(
                    "SELECT employment_type, COUNT(*) as count FROM employees WHERE status = 'active' GROUP BY employment_type",
                    (err, r) => {
                      stats.employeesByType = r || [];
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

app.get("/api/reports/department-distribution", (req, res) => {
  connection.query(
    "SELECT d.name, COUNT(e.id) as employee_count FROM departments d LEFT JOIN employees e ON d.id = e.department_id AND e.status = 'active' WHERE d.status = 'active' GROUP BY d.id, d.name ORDER BY employee_count DESC",
    (err, results) => {
      if (err)
        return res.status(500).json({ success: false, message: "Failed" });
      res.json({ success: true, data: results });
    }
  );
});

app.get("/api/reports/attendance-summary", (req, res) => {
  const { start_date, end_date } = req.query;
  let query = "SELECT status, COUNT(*) as count FROM attendance";
  let params = [];
  if (start_date && end_date) {
    query += " WHERE date BETWEEN ? AND ?";
    params = [start_date, end_date];
  }
  query += " GROUP BY status";
  connection.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Failed" });
    res.json({ success: true, data: results });
  });
});

app.get("/api/reports/leave-summary", (req, res) => {
  connection.query(
    "SELECT leave_type, status, COUNT(*) as count FROM leave_requests GROUP BY leave_type, status ORDER BY leave_type, status",
    (err, results) => {
      if (err)
        return res.status(500).json({ success: false, message: "Failed" });
      res.json({ success: true, data: results });
    }
  );
});

const port = 5000;
app.listen(port, () => {
  console.log(`\nServer: http://localhost:${port}`);
  // console.log(`Setup: http://localhost:${port}/create-tables`);
  // console.log(`Seed: http://localhost:${port}/seed-data`);
});
