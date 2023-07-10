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

// Promisify the query function to make it asynchronous
const queryAsync = (query, params) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

// Connect to the database & start the application
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    throw err;
  }
  console.log('Connected to the employees_db database.');
  console.log('Welcome to the Employee Tracker System!');
  promptUser();
});

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
        case 'Exit':
         console.log('Goodbye!');
          db.end(); // Close the database connection
          break;
      }
    });
};

async function viewAllDepartments() {
  try {
    const departments = await queryAsync("SELECT * FROM department");
    console.table(departments);
  } catch (err) {
    console.error("Error viewing departments:", err);
  }

  promptUser();
}

async function viewAllRoles() {
  try {
    const query = `
      SELECT role.id, role.title, department.name AS department, role.salary
      FROM role
      INNER JOIN department ON role.department_id = department.id
    `;

    const roles = await queryAsync(query);
    console.table(roles);
  } catch (err) {
    console.error('Error viewing roles:', err);
  }

  promptUser();
}

async function viewAllEmployees() {
  try {
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

    const employees = await queryAsync(query);
    console.table(employees);
  } catch (err) {
    console.error('Error viewing employees:', err);
  }

  promptUser();
}

async function addDepartment() {
  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'departmentName',
        message: 'Enter the name of the department:',
      },
    ]);

    const query = 'INSERT INTO department SET ?';
    await queryAsync(query, { name: answers.departmentName });

    console.log('Department added successfully!');
  } catch (err) {
    console.error('Error adding department:', err);
  }

  promptUser();
}

async function addRole() {
  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'roleTitle',
        message: 'Enter the title of the role:',
      },
      {
        type: 'input',
        name: 'roleSalary',
        message: 'Enter the salary for the role:',
      },
      {
        type: 'input',
        name: 'roleDepartment',
        message: 'Enter the department ID for the role:',
      },
    ]);

    const { roleTitle, roleSalary, roleDepartment } = answers;
    const query = 'INSERT INTO role SET ?';
    await queryAsync(query, { title: roleTitle, salary: roleSalary, department_id: roleDepartment });

    console.log('Role added successfully!');
  } catch (err) {
    console.error('Error adding role:', err);
  }

  promptUser();
}

async function addEmployee() {
  try {
    const [roles, managers] = await Promise.all([
      queryAsync('SELECT * FROM role'),
      queryAsync('SELECT * FROM employee WHERE manager_id IS NULL')
    ]);

    const answers = await inquirer.prompt([
      {
        name: 'firstName',
        type: 'input',
        message: "Enter the employee's first name:",
      },
      {
        name: 'lastName',
        type: 'input',
        message: "Enter the employee's last name:",
      },
      {
        name: 'role',
        type: 'list',
        message: "Select the employee's role:",
        choices: roles.map((role) => role.title),
      },
      {
        name: 'manager',
        type: 'list',
        message: "Select the employee's manager:",
        choices: managers.map((manager) => manager.id),
      },
    ]);

    const selectedRole = roles.find((role) => role.title === answers.role);
    const selectedManager = managers.find((manager) => manager.id === answers.manager);

    await queryAsync('INSERT INTO employee SET ?', {
      first_name: answers.firstName,
      last_name: answers.lastName,
      role_id: selectedRole.id,
      manager_id: selectedManager.id,
    });

    console.log('Employee added successfully!');
  } catch (err) {
    console.error('Error adding employee:', err);
  }

  promptUser();
}


async function updateEmployeeRole() {
  try {
    const query = `
      SELECT employee.id, CONCAT(employee.first_name, ' ', employee.last_name) AS employee_name
      FROM employee
    `;

    const employees = await queryAsync(query);

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'employeeId',
        message: 'Select the employee to update:',
        choices: employees.map((employee) => ({
          name: employee.employee_name,
          value: employee.id,
        })),
      },
      {
        type: 'input',
        name: 'newRoleId',
        message: 'Enter the new role ID:',
      },
    ]);

    const { employeeId, newRoleId } = answers;
    const updateQuery = 'UPDATE employee SET role_id = ? WHERE id = ?';

    await queryAsync(updateQuery, [newRoleId, employeeId]);

    console.log('Employee role updated successfully!');
  } catch (err) {
    console.error('Error updating employee role:', err);
  }

  promptUser();
}


