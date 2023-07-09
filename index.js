// Import necessary modules and dependencies
const inquirer = require('inquirer');
const consoleTable = require('console.table');
const mysql = require('mysql2');

// Connection to SQL database
const db = mysql.createConnection(
  {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'employees_db',
  },
);

// Start the application
const init = () => {
  db.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      throw err;
    }
    console.log('Connected to the employees_db database.');
    console.log('Welcome to the Employee Tracker System!');
    promptUser();
  });
};

// Initialize the application
init();

// Prompt the user with options and handle their choices
function promptUser() {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          'View all departments',
          'View all roles',
          'View all employees',
          'Add a department',
          'Add a role',
          'Add an employee',
          'Update an employee role',
          'Quit',
        ],
      },
    ])
    .then((answers) => {
      switch (answers.action) {
        case 'View all departments':
          viewAllDepartments();
          break;
        case 'View all roles':
          viewAllRoles();
          break;
        case 'View all employees':
          viewAllEmployees();
          break;
        case 'Add a department':
          addDepartment();
          break;
        case 'Add a role':
          addRole();
          break;
        case 'Add an employee':
          addEmployee();
          break;
        case 'Update an employee role':
          updateEmployeeRole();
          break;
        case 'Quit':
          console.log('Goodbye!');
          db.end(); // Close the database connection
          break;
      }
    });
}

function viewAllDepartments() {
  const query = 'SELECT * FROM department';
  
  db.query(query, (err, res) => {
    if (err) throw err;

    // Display the formatted table showing department names and ids
    console.table(res);
    
    // Prompt the user again
    promptUser();
  });
}

function viewAllRoles() {
  const query = `
  SELECT role.id, role.title, department.name AS department, role.salary
  FROM role
  INNER JOIN department ON role.department_id = department.id
`;
  
  db.query(query, (err, res) => {
    if (err) throw err;

    // Display the table showing all role job titles, role id's, the department that role belongs to, and the salary for that role
    console.table(res);
    
    // Prompt the user again
    promptUser();
  });
}

function viewAllEmployees() {
  const query = `
  SELECT 
    employee.id,
    employee.first_name,
    employee.last_name,
    role.title AS job_title,
    department.name AS department,
    role.salary,
    CONCAT(manager.first_name, ' ', manager.last_name) AS manager
  FROM employee
  INNER JOIN role ON employee.role_id = role.id
  INNER JOIN department ON role.department_id = department.id
  LEFT JOIN employee manager ON employee.manager_id = manager.id
`;
  
  db.query(query, (err, res) => {
    if (err) throw err;

    // Display the table showing all role job title, role id, the department that role belongs to, and the salary for that role
    console.table(res);
    
    // Prompt the user again
    promptUser();
  });
}