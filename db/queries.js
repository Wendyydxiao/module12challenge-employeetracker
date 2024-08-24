const pool = require('./connection');

const getDepartments = () => pool.query('SELECT * FROM department');
const getRoles = () => pool.query('SELECT * FROM role');
const getEmployees = () => pool.query(`
       SELECT 
          e.id, 
          e.first_name, 
          e.last_name, 
          r.title, 
          d.name AS department, 
          r.salary, 
          CONCAT(m.first_name, ' ', m.last_name) AS manager
        FROM 
          employee e
        JOIN 
          role r ON e.role_id = r.id
        JOIN 
          department d ON r.department_id = d.id
        LEFT JOIN 
          employee m ON e.manager_id = m.id
        ORDER BY 
          e.id
`);

const addDepartment = (name) => pool.query('INSERT INTO department (name) VALUES ($1)', [name]);
const addRole = (title, salary, department_id) => pool.query('INSERT INTO role (title, salary, department) VALUES ($1, $2, $3)', [title, salary, department_id]);
const addEmployee = (firstName, lastName, roleId, managerId) => pool.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [firstName, lastName, roleId, managerId]);

const updateEmployeeRole = (employeeId, roleId) => pool.query('UPDATE employee SET role_id = $1 WHERE id = $2', [roleId, employeeId]);
const updateEmployeeManager = (employeeId, managerId) => pool.query('UPDATE employee SET manager_id = $1 WHERE id = $2', [managerId, employeeId]);

const deleteDepartment = (id) => pool.query('DELETE FROM department WHERE id = $1', [id]);
const deleteRole = (id) => pool.query('DELETE FROM role WHERE id = $1', [id]);
const deleteEmployee = (id) => pool.query('DELETE FROM employee WHERE id = $1', [id]);

module.exports = {
  getDepartments,
  getRoles,
  getEmployees,
  addDepartment,
  addRole,
  addEmployee,
  updateEmployeeRole,
  updateEmployeeManager,
  deleteDepartment,
  deleteRole,
  deleteEmployee,
};
