const express = require('express');
const inquirer = require('inquirer');
const {Pool} = require('pg');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.urlencoded({extended: false}));
app.use(express.json());

const pool = new Pool(
    {
        user: 'postgres',
        password: 'Test1234',
        host: 'localhost',
        database: 'employee_db',
    },
    console.log('Connected to the employee_db database.')
)

pool.connect();

// Get all departments
app.get('/api/departments', (req, res) => {
    const sql = 'SELECT * FROM department';
    pool.query(sql)
      .then(({ rows }) => res.json({ message: 'success', data: rows }))
      .catch(err => res.status(500).json({ error: err.message }));
  });

// Get all roles
app.get('/api/roles', (req, res) => {
    const sql = 
    'SELECT role.id, role.title, department.name AS department, role.salary FROM role JOIN department ON role.department_id = department.id';
    pool.query(sql)
      .then(({ rows }) => res.json({ message: 'success', data: rows }))
      .catch(err => res.status(500).json({ error: err.message }));
  });

// Get all employees
app.get('/api/employees', (req, res) => {
    const sql = `
      SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, 
      CONCAT(manager.first_name, ' ', manager.last_name) AS manager 
      FROM employee 
      JOIN role ON employee.role_id = role.id 
      JOIN department ON role.department_id = department.id 
      LEFT JOIN employee manager ON manager.id = employee.manager_id
    `;
    pool.query(sql)
      .then(({ rows }) => res.json({ message: 'success', data: rows }))
      .catch(err => res.status(500).json({ error: err.message }));
  });