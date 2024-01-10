import mysql from "mysql2";

const dbConnection = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "ems",
  connectionLimit: 10,
});

dbConnection.getConnection((err, connection) => {
  if (!err) {
    console.log("Database connected successfully");
  } else {
    console.log("Database connection unsuccessful");
  }
});

const role = `CREATE TABLE if not exists roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role VARCHAR(20) NULL
)`;

const admin = `CREATE TABLE if not exists admin(
  id int auto_increment,
  email varchar(255) not null,
  password varchar(255) not null,
  PRIMARY KEY (id),
  role_id INT NOT NULL,
  FOREIGN KEY (role_id) REFERENCES roles(id)
)`;

const category = `CREATE TABLE if not exists category (
  id int auto_increment,
  name varchar(255) not null,     
  PRIMARY KEY (id)
)`;

const employee = `CREATE TABLE if not exists employee (
  id int auto_increment,
  category_id int not null,
  name varchar(255) not null,
  email varchar(255) not null,
  password varchar(255) not null, 
  salary varchar(255) not null,
  address varchar(255) not null,
  image varchar(255) not null,       
  PRIMARY KEY (id),
  role_id INT NOT NULL,
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (category_id) REFERENCES category(id)
)`;

dbConnection.query(role, (err, result) => {
  if (err) {
    console.log("Error creating role table");
  } else {
    console.log("Role table created");
    dbConnection.query(admin, (err, result) => {
      if (err) {
        console.log("Error creating admin table");
      } else {
        console.log("Admin table created");
      }
    });

    dbConnection.query(category, (err, result) => {
      if (err) {
        console.log("Error creating category table");
      } else {
        console.log("Category table created");
      }
    });

    dbConnection.query(employee, (err, result) => {
      if (err) {
        console.log("Error creating employee table");
      } else {
        console.log("Employee table created");
      }
    });
  }
});

export default dbConnection;