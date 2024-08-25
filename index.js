const inquirer = require('inquirer');
const db = require('./db/queries');
const pool = require('./db/connection'); 

const mainMenu = () => {
  inquirer.prompt({
    type: 'list',
    name: 'action',
    message: 'What would you like to do?',
    choices: [
      'View All Departments',
      'View All Roles',
      'View All Employees',
      'Add a Department',
      'Add a Role',
      'Add an Employee',
      'Update Employee Role',
      'Update Employee Manager',
      'Delete Department',
      'Delete Role',
      'Delete Employee',
      'Exit'
    ]
  }).then(choice => {
    switch (choice.action) {
      case 'View All Departments':
        viewDepartments();
        break;
      case 'View All Roles':
        viewRoles();
        break;
      case 'View All Employees':
        viewEmployees();
        break;
      case 'Add a Department':
        addDepartment();
        break;
      case 'Add a Role':
        addRole();
        break;
      case 'Add an Employee':
        addEmployee();
        break;
      case 'Update Employee Role':
        updateEmployeeRole();
        break;
      case 'Update Employee Manager':
        updateEmployeeManager();
        break;
      case 'Delete Department':
        deleteDepartment();
        break;
      case 'Delete Role':
        deleteRole();
        break;
      case 'Delete Employee':
        deleteEmployee();
        break;
      default:
        console.log('Goodbye!');
        process.exit();
    }
  });
};

const viewDepartments = async () => {
  const { rows } = await db.getDepartments();
  console.table(rows);
  mainMenu();
};

const viewRoles = async () => {
  const { rows } = await db.getRoles();
  console.table(rows);
  mainMenu();
};

const viewEmployees = async () => {
  const { rows } = await db.getEmployees();
  console.table(rows);
  mainMenu();
};

const addDepartment = () => {
  inquirer.prompt({
    name: 'name',
    message: 'Enter the name of the new department:'
  }).then(async ({ name }) => {
    await db.addDepartment(name);
    console.log(`Added ${name} to the database`);
    mainMenu();
  });
};

const addRole = async () => {
  try {
    const deptQuery = `SELECT name FROM department`;
    const deptResult = await pool.query(deptQuery);
    const departmentNames = deptResult.rows.map(row => row.name);

    if (departmentNames.length === 0) {
      console.log("No departments available. Please add a department first.");
      return mainMenu();
    }

    const answers = await inquirer.prompt([
      { name: 'title', type: 'input', message: "Role title:" },
      { name: 'salary', type: 'input', message: "Role salary:" },
      { 
        name: 'departmentName', 
        type: 'list', 
        message: "Select department name:", 
        choices: departmentNames 
      }
    ]);

    const selectedDeptQuery = `SELECT id FROM department WHERE name = $1`;
    const selectedDeptResult = await pool.query(selectedDeptQuery, [answers.departmentName]);
    const departmentId = selectedDeptResult.rows[0]?.id;

    if (!departmentId) {
      console.error('Department not found.');
      return;
    }

    const sql = `INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)`;
    const params = [answers.title, answers.salary, departmentId];

    await pool.query(sql, params);
    console.log('Role added successfully.');
  } catch (err) {
    console.error(err);
  }
  mainMenu();
};


const addEmployee = async () => {
  
  try {
   
    const roleResult = await pool.query('SELECT id, title FROM role');
    const managerResult = await pool.query('SELECT id, CONCAT(first_name, \' \', last_name) AS name FROM employee');

    const roleNames = roleResult.rows.map(row => row.title);
    const managerNames = managerResult.rows.map(row => row.name);

    
    const answers = await inquirer.prompt([
      { name: 'firstName', type: 'input', message: "Employee's first name:" },
      { name: 'lastName', type: 'input', message: "Employee's last name:" },
      { name: 'roleName', type: 'list', message: "Select employee's role:", choices: roleNames },
      { name: 'managerName', type: 'list', message: "Select manager name (optional):", choices: managerNames.concat('None') }
    ]);

   
    const roleQuery = `SELECT id FROM role WHERE title = $1`;
    const roleIdResult = await pool.query(roleQuery, [answers.roleName]);
    const roleId = roleIdResult.rows[0]?.id;

    if (!roleId) {
      console.error('Role not found.');
      return;
    }

    let managerId = null;
    if (answers.managerName && answers.managerName !== 'None') {
      const [firstName, lastName] = answers.managerName.split(' ');
      const managerQuery = `SELECT id FROM employee WHERE first_name = $1 AND last_name = $2`;
      const managerResult = await pool.query(managerQuery, [firstName, lastName]);
      managerId = managerResult.rows[0]?.id;

      if (!managerId) {
        console.error('Manager not found.');
        return;
      }
    }

    const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)`;
    const params = [answers.firstName, answers.lastName, roleId, managerId];

    await pool.query(sql, params);
    console.log('Employee added successfully.');
    mainMenu();
  } catch (error) {
    console.error('Error adding employee:', error);
  }
};


const updateEmployeeRole = async () => {

  const empQuery = 'SELECT id, first_name, last_name FROM employee';
  const empResult = await pool.query(empQuery);
  const employees = empResult.rows;

  
  const roleQuery = 'SELECT id, title FROM role';
  const roleResult = await pool.query(roleQuery);
  const roles = roleResult.rows;

  const answers = await inquirer.prompt([
    {
      name: 'employeeId',
      type: 'list',
      message: "Select the employee whose role you want to update:",
      choices: employees.map(emp => ({
        name: `${emp.first_name} ${emp.last_name}`,
        value: emp.id
      }))
    },
    {
      name: 'roleId',
      type: 'list',
      message: "Select the employee's new role:",
      choices: roles.map(role => ({
        name: role.title,
        value: role.id
      }))
    }
  ]);

  const sql = `UPDATE employee SET role_id = $1 WHERE id = $2`;
  await pool.query(sql, [answers.roleId, answers.employeeId]);

  console.log('Employee role updated successfully.');
  mainMenu();
};



const updateEmployeeManager = async () => {

  const employeesQuery = `SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employee`;
  const empResult = await pool.query(employeesQuery);
  const employees = empResult.rows;

  const employeeChoices = employees.map(emp => ({ name: emp.name, value: emp.id }));

  const { employeeId } = await inquirer.prompt([
    {
      name: 'employeeId',
      type: 'list',
      message: 'Select the employee whose manager you want to update:',
      choices: employeeChoices,
    },
  ]);

  const managerChoices = [{ name: 'No Manager', value: null }, ...employeeChoices];

  const { managerId } = await inquirer.prompt([
    {
      name: 'managerId',
      type: 'list',
      message: 'Select the new manager for this employee (or choose "No Manager"):',
      choices: managerChoices,
    },
  ]);

  const updateQuery = `UPDATE employee SET manager_id = $1 WHERE id = $2`;
  const updateParams = [managerId, employeeId];

  await pool.query(updateQuery, updateParams);

  console.log(`Employee's manager updated successfully.`);
  mainMenu();
};


const deleteDepartment = async () => {
  try {
    const departmentResult = await pool.query('SELECT id, name FROM department');
    const departmentChoices = departmentResult.rows.map(row => ({ name: row.name, value: row.id }));

    const { departmentId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'departmentId',
        message: 'Select the department to delete:',
        choices: departmentChoices
      }
    ]);

    await pool.query('DELETE FROM department WHERE id = $1', [departmentId]);
    console.log('Department deleted successfully.');
    mainMenu();
  } catch (error) {
    console.error('Error deleting department:', error);
  }
};


const deleteRole = async () => {
  try {
    const roleQuery = 'SELECT id, title FROM role';
    const roleResult = await pool.query(roleQuery);
    const roles = roleResult.rows;

    const roleNames = roles.map(role => ({
      name: role.title,
      value: role.id
    }));

    const { roleId } = await inquirer.prompt([
      {
        name: 'roleId',
        type: 'list',
        message: 'Select the role to delete:',
        choices: roleNames
      }
    ]);

    const sql = 'DELETE FROM role WHERE id = $1';
    await pool.query(sql, [roleId]);

    console.log('Role deleted successfully.');
    mainMenu();
  } catch (error) {
    console.error('Error deleting role:', error);
  }
};



const deleteEmployee = async () => {
  
  try {
  const empQuery = 'SELECT id, first_name, last_name FROM employee';
  const empResult = await pool.query(empQuery);
  const employees = empResult.rows;

  const employeeNames = employees.map(emp => ({
    name: `${emp.first_name} ${emp.last_name}`,
    value: emp.id
  }));

  const { employeeId } = await inquirer.prompt([
    {
      name: 'employeeId',
      type: 'list',
      message: 'Select the employee to delete:',
      choices: employeeNames
    }
  ]);

  const sql = 'DELETE FROM employee WHERE id = $1';
  await pool.query(sql, [employeeId]);

  console.log('Employee deleted successfully.');
  mainMenu();

} catch (error) {
  console.error('Error deleting employee:', error);
}
};

mainMenu();
