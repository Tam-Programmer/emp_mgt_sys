import express from 'express'
import dbConnection from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'

const router = express.Router()
router.post("/employee_login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ loginStatus: false, error: "Email and password are required" });
  }

  const sql = "SELECT * FROM employee WHERE email = ?";
  dbConnection.query(sql, [email], (err, result) => {
    if (err) {
      return res.json({ loginStatus: false, error: "Query error" });
    }

    if (result.length === 0) {
      return res.json({ loginStatus: false, error: "Wrong email or password" });
    }

    bcrypt.compare(password, result[0].password, (err, response) => {
      if (err) {
        return res.json({ loginStatus: false, error: "Query error" });
      }

      if (response) {
        const email = result[0].email;
        const token = jwt.sign(
          { role: "employee", email: email, id: result[0].id },
          "jwt_secret_key",
          { expiresIn: "1d" }
        );
        res.cookie("token", token);
        return res.json({ loginStatus: true, id: result[0].id });
      }

      return res.json({ loginStatus: false, error: "Wrong email or password" });
    });
  });
});

  router.get('/detail/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM employee where id = ?"
    dbConnection.query(sql, [id], (err, result) => {
        if(err) return res.json({Status: false});
        return res.json(result)
    })
  })

  router.get('/logout', (req, res) => {
    res.clearCookie('token')
    return res.json({Status: true})
  })

  export {router as EmployeeRouter}