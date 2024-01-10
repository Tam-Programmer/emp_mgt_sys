import express from "express";
import dbConnection from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'
import multer from "multer";
import path from "path";
const router = express.Router();


router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ loginStatus: false, error: 'Fill email and password' });
  }
  // const query='SELECT admin.role_id, role.roles FROM admin JOIN roles ON admin.role_id = roles.id';
  const adminSql = 'SELECT * FROM admin WHERE email = ?';
  dbConnection.query(adminSql, [email], (err, adminResult) => {
    if (err) {
      return res.json({ loginStatus: false, error: 'Query error' });
    }
    if (adminResult.length > 0) {
      // Admin login
      bcrypt.compare(password, adminResult[0].password, (err, passwordMatched) => {
        if (err) {
          return res.json({ loginStatus: false, error: 'Query error' });
        }

        if (passwordMatched) {
          const email = adminResult[0].email;
          const token = jwt.sign(
            { role: adminResult[0].role_id, email: email, id: adminResult[0].id },
            'jwt_secret_key',
            { expiresIn: '1d' }
          );
          res.cookie('token', token);
          return res.json({ loginStatus: true, role: adminResult[0].role_id, id: adminResult[0].id });
        }

        return res.json({ loginStatus: false, error: ' Wrong email or password' });
      });
    } else {
      // Employee login
      const employeeSql = 'SELECT * FROM employee WHERE email = ?';
      dbConnection.query(employeeSql, [email], (err, employeeResult) => {
        if (err) {
          return res.json({ loginStatus: false, error: 'Query error' });
        }

        if (employeeResult.length === 0) {
          return res.json({ loginStatus: false, error: 'Wrong email or password' });
        }

        bcrypt.compare(password, employeeResult[0].password, (err, passwordMatched) => {
          if (err) {
            return res.json({ loginStatus: false, error: 'Query error' });
          }

          if (passwordMatched) {
            const email = employeeResult[0].email;
            const token = jwt.sign(
              { role: employeeResult[0].role_id, email: email, id: employeeResult[0].id },
              'jwt_secret_key',
              { expiresIn: '1d' }
            );
            res.cookie('token', token);

            // Fetch user's role from the role table
            const roleId = employeeResult[0].role_id;
            const roleSql = 'SELECT * FROM roles WHERE id = ?';
            dbConnection.query(roleSql, [roleId], (err, roleResult) => {
              if (err) {
                return res.json({ loginStatus: false, error: 'Query error' });
              }

              if (roleResult.length === 0) {
                return res.json({ loginStatus: false, error: 'Role not found' });
              }

              const role = roleResult[0].role;
              return res.json({ loginStatus: true, role: role, id: employeeResult[0].id });
            });
          } else {
            return res.json({ loginStatus: false, error: 'Wrong email or password' });
          }
        });
      });
    }
  });
});
// router.post("/adminlogin", (req, res) => {
//   const sql = "SELECT * from admin Where email = ? and password = ?";
//   dbConnection.query(sql, [req.body.email, req.body.password], (err, result) => {
//     if (err) return res.json({ loginStatus: false, Error: "Query error" });
//     if (result.length > 0) {
//       const email = result[0].email;
//       const token = jwt.sign(
//         { role: "admin", email: email, id: result[0].id },
//         "jwt_secret_key",
//         { expiresIn: "1d" }
//       );
//       res.cookie('token', token)
//       return res.json({ loginStatus: true });
//     } else {
//         return res.json({ loginStatus: false, Error:"wrong email or password" });
//     }
//   });
// });

router.get('/category', (req, res) => {
    const sql = "SELECT * FROM category";
    dbConnection.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
})

router.post('/add_category', (req, res) => {
    const sql = "INSERT INTO category (`name`) VALUES (?)"
    dbConnection.query(sql, [req.body.category], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true})
    })
})

// image upload 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Public/Images')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({
    storage: storage
})
// end imag upload 

router.post('/add_employee',upload.single('image'), (req, res) => {
    const sql = `INSERT INTO employee 
    (name,email,password, salary, address,image, category_id) 
    VALUES (?)`;
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        const values = [
            req.body.name,
            req.body.email,
            hash,
            req.body.salary, 
            req.body.address,
            req.file.filename,
            req.body.category_id
        ]
        dbConnection.query(sql, [values], (err, result) => {
            if(err) return res.json({Status: false, Error: err})
            return res.json({Status: true})
        })
    })
})

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

router.get('/employee', (req, res) => {
    const sql = "SELECT * FROM employee";
    dbConnection.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
})

router.get('/employee/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM employee WHERE id = ?";
    dbConnection.query(sql,[id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"})
        return res.json({Status: true, Result: result})
    })
})

router.put('/edit_employee/:id', (req, res) => {
    const id = req.params.id;
    const sql = `UPDATE employee 
        set name = ?, email = ?, salary = ?, address = ?, category_id = ? 
        Where id = ?`
    const values = [
        req.body.name,
        req.body.email,
        req.body.salary,
        req.body.address,
        req.body.category_id
    ]
    dbConnection.query(sql,[...values, id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.delete('/delete_employee/:id', (req, res) => {
    const id = req.params.id;
    const sql = "delete from employee where id = ?"
    dbConnection.query(sql,[id], (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/admin_count', (req, res) => {
    const sql = "select count(id) as admin from admin";
    dbConnection.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/employee_count', (req, res) => {
    const sql = "select count(id) as employee from employee";
    dbConnection.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/salary_count', (req, res) => {
    const sql = "select sum(salary) as totalSalary from employee";
    dbConnection.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/admin_records', (req, res) => {
    const sql = "select * from admin"
    dbConnection.query(sql, (err, result) => {
        if(err) return res.json({Status: false, Error: "Query Error"+err})
        return res.json({Status: true, Result: result})
    })
})

router.get('/logout', (req, res) => {
    res.clearCookie('token')
    return res.json({Status: true})
})

export { router as adminRouter };










