// const express = require("express");
// const mysql = require("mysql2");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const cors = require("cors");
// require("dotenv").config();

// const app = express();
// app.use(express.json());


// // Start server
// app.listen(process.env.PORT || 3000, () =>
//   console.log(`Auth service running on port ${process.env.PORT || 3000}`)
// );

// // MySQL connection
// const db = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

// db.connect((err) => {
//   if (err) {
//     console.error("DB connection failed:", err);
//     return;
//   }
//   console.log("Connected to MySQL database");
// });

// // ================= REGISTER =================
// app.post("/register", async (req, res) => {
//   const { username, password, email, fullName, contactNo } = req.body;

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     db.query(
//       "INSERT INTO users (username, password, email, fullName, contactNo) VALUES (?, ?, ?, ?, ?)",
//       [username, hashedPassword, email, fullName, contactNo],
//       (err) => {
//         if (err) {
//           console.error("DB Error:", err);
//           if (err.code === "ER_DUP_ENTRY") {
//             return res.status(400).json({ message: "Username already exists" });
//           }
//           return res.status(500).json({ message: "Database error" });
//         }
//         res.status(201).json({ message: "User registered successfully" });
//       }
//     );
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // ================= LOGIN =================
// app.post("/login", (req, res) => {
//   const { username, password } = req.body;

//   db.query(
//     "SELECT * FROM users WHERE username = ?",
//     [username],
//     async (err, results) => {
//       if (err) return res.status(500).json({ message: "Database error" });
//       if (results.length === 0)
//         return res.status(400).json({ message: "Invalid credentials" });

//       const user = results[0];
//       const isPasswordValid = await bcrypt.compare(password, user.password);
//       if (!isPasswordValid)
//         return res.status(400).json({ message: "Invalid credentials" });

//       const token = jwt.sign(
//         { id: user.id.toString(), username: user.username },
//         process.env.JWT_SECRET,
//         { algorithm: "HS256", expiresIn: "3h" }
//       );

//       res.json({ token });
//     }
//   );
// });

// // ================= PROFILE =================
// app.get("/profile", (req, res) => {
//   const userId = req.headers["x-user-id"]; // Comes from Gateway filter
//   if (!userId) {
//     return res.status(400).json({ message: "Missing user ID from gateway" });
//   }

//   db.query(
//     "SELECT id, username, email, fullName, contactNo FROM users WHERE id = ?",
//     [userId],
//     (err, results) => {
//       if (err) {
//         console.error("DB error:", err);
//         return res.status(500).json({ message: "Database error" });
//       }

//       if (results.length === 0) {
//         return res.status(404).json({ message: "User not found" });
//       }

//       res.json(results[0]);
//     }
//   );
// });
// // ================= UPDATE PROFILE =================
// app.put("/profile", (req, res) => {
//   const userId = req.headers["x-user-id"];
//   const { fullName, email, contactNo } = req.body;

//   if (!userId) {
//     return res.status(400).json({ message: "Missing user ID from gateway" });
//   }

//   db.query(
//     "UPDATE users SET fullName = ?, email = ?, contactNo = ? WHERE id = ?",
//     [fullName, email, contactNo, userId],
//     (err, result) => {
//       if (err) {
//         console.error("DB error:", err);
//         return res.status(500).json({ message: "Database error" });
//       }

//       if (result.affectedRows === 0) {
//         return res.status(404).json({ message: "User not found" });
//       }

//       res.json({ message: "Profile updated successfully" });
//     }
//   );
// });
/**
 * Auth Service - server.js
 * Production-ready, Docker-safe implementation
 */

const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const cors = require("cors");
require("dotenv").config();

const app = express();

// ================= MIDDLEWARE =================
// app.use(cors());
app.use(express.json());

// ================= MYSQL CONNECTION POOL =================
const db = mysql
  .createPool({
    host: process.env.DB_HOST || "auth-db",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "example",
    database: process.env.DB_NAME || "userdb",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })
  .promise();

// Optional: verify DB connectivity at startup (non-fatal)
(async () => {
  try {
    await db.query("SELECT 1");
    console.log("Connected to MySQL database (pool ready)");
  } catch (err) {
    console.error("MySQL not ready yet, will retry on requests:", err.message);
  }
})();

// ================= REGISTER =================
app.post("/register", async (req, res) => {
  const { username, password, email, fullName, contactNo } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (username, password, email, fullName, contactNo) VALUES (?, ?, ?, ?, ?)",
      [username, hashedPassword, email, fullName, contactNo]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("DB Error:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Username already exists" });
    }

    res.status(500).json({ message: "Database error" });
  }
});

// ================= LOGIN =================
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id.toString(), username: user.username },
      process.env.JWT_SECRET,
      { algorithm: "HS256", expiresIn: "3h" }
    );

    res.json({ token });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
});

// ================= PROFILE =================
app.get("/profile", async (req, res) => {
  const userId = req.headers["x-user-id"]; // set by gateway

  if (!userId) {
    return res.status(400).json({ message: "Missing user ID from gateway" });
  }

  try {
    const [rows] = await db.query(
      "SELECT id, username, email, fullName, contactNo FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
});

// ================= UPDATE PROFILE =================
app.put("/profile", async (req, res) => {
  const userId = req.headers["x-user-id"];
  const { fullName, email, contactNo } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "Missing user ID from gateway" });
  }

  try {
    const [result] = await db.query(
      "UPDATE users SET fullName = ?, email = ?, contactNo = ? WHERE id = ?",
      [fullName, email, contactNo, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  }
});

// ================= HEALTH CHECK =================
app.get("/health", (req, res) => {
  res.json({ status: "UP" });
});

// ================= GRACEFUL SHUTDOWN =================
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Closing DB pool...");
  await db.end();
  process.exit(0);
});

// ================= START SERVER =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});
