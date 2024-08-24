const inquirer = require('inquirer');
const db = require('./db/queries');

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

const addRole = () => {
  inquirer.prompt([
    { name: 'title', message: 'Enter the title of the new role:' },
    { name: 'salary', message: 'Enter the salary for this role:' },
    { name: 'department_id', message: 'Enter the department ID for this role:' }
  ]).then(async ({ title, salary, department_id }) => {
    await db.addRole(title, salary, department_id);
    console.log(`Added ${title} to the database`);
    mainMenu();
  });
};

const addEmployee = () => {
  inquirer.prompt([
    { name: 'firstName', message: 'Enter the employee\'s first name:' },
    { name: 'lastName', message: 'Enter the employee\'s last name:' },
    { name: 'roleId', message: 'Enter the role ID for this employee:' },
    { name: 'managerId', message: 'Enter the manager ID for this employee (null for none):' }
  ]).then(async ({ firstName, lastName, roleId, managerId }) => {
    await db.addEmployee(firstName, lastName, roleId, managerId || null);
    console.log(`Added ${firstName} ${lastName} to the database`);
    mainMenu();
  });
};

const updateEmployeeRole = () => {
  inquirer.prompt([
    { name: 'employeeId', message: 'Enter the ID of the employee to update:' },
    { name: 'roleId', message: 'Enter the new role ID for this employee:' }
  ]).then(async ({ employeeId, roleId }) => {
    await db.updateEmployeeRole(employeeId, roleId);
    console.log('Employee role updated');
    mainMenu();
  });
};

const updateEmployeeManager = () => {
  inquirer.prompt([
    { name: 'employeeId', message: 'Enter the ID of the employee to update:' },
    { name: 'managerId', message: 'Enter the new manager ID for this employee:' }
  ]).then(async ({ employeeId, managerId }) => {
    await db.updateEmployeeManager(employeeId, managerId);
    console.log('Employee manager updated');
    mainMenu();
  });
};

const deleteDepartment = () => {
  inquirer.prompt({
    name: 'id',
    message: 'Enter the ID of the department to delete:'
  }).then(async ({ id }) => {
    await db.deleteDepartment(id);
    console.log('Department deleted');
    mainMenu();
  });
};

const deleteRole = () => {
  inquirer.prompt({
    name: 'id',
    message: 'Enter the ID of the role to delete:'
  }).then(async ({ id }) => {
    await db.deleteRole(id);
    console.log('Role deleted');
    mainMenu();
  });
};

const deleteEmployee = () => {
  inquirer.prompt({
    name: 'id',
    message: 'Enter the ID of the employee to delete:'
  }).then(async ({ id }) => {
    await db.deleteEmployee(id);
    console.log('Employee deleted');
    mainMenu();
  });
};

mainMenu();
