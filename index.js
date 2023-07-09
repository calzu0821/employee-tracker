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

// Create a function to execute SQL queries
function runQuery(query, params) {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

async function promptUser() {
  console.log('Connected to the employees_db database.');
  console.log('Welcome to the Employee Tracker System!');
  
  // Prompt the user with options
  const answer = await inquirer.prompt({
    name: 'action',
    type: 'list',
    message: 'What would you like to do?',
    choices: [
      'View all departments',
      'View all roles',
      'View all employees',
      'Add a department',
      'Add a role',
      'Add an employee',
      'Update an employee role',
      'Exit',
    ],
  });
      switch (answer.action) {
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
    }

    async function viewAllDepartments() {
      try {
        const department = await runQuery('SELECT * FROM department');
        console.table(department);
      } catch (err) {
        console.error('Error viewing departments:', err);
      }
      promptUser();
    }
// // same function but async
// function viewAllDepartments() {
//   return new Promise((resolve, reject) => {
//     const query = 'SELECT * FROM departments';

//     connection.query(query, (err, res) => {
//       if (err) reject(err);

//       // Display the formatted table showing department names and ids
//       console.table(res);

//       resolve();
//     });
//   });
// }

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
    // Display the table showing employee data, including employee ids, first names, last names, job titles, departments, salaries, and managers that the employees report to
    console.table(res);
    // Prompt the user again
    promptUser();
  });
}

function addDepartment() {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'departmentName',
        message: 'Enter the name of the department:',
      },
    ])
    .then((answers) => {
      const { departmentName } = answers;
      const query = 'INSERT INTO department SET ?';
      
      db.query(query, { name: departmentName }, (err) => {
        if (err) throw err;
        console.log('Department added successfully!');
        // Prompt the user again
        promptUser();
      });
    });
}

function addRole() {
  inquirer
    .prompt([
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
    ])
    .then((answers) => {
      const { roleTitle, roleSalary, roleDepartment } = answers;
      const query = 'INSERT INTO role SET ?';
      
      db.query(
        query,
        { title: roleTitle, salary: roleSalary, department_id: roleDepartment },
        (err) => {
          if (err) throw err;
          console.log('Role added successfully!');
          // Prompt the user again
          promptUser();
        }
      );
    });
}

function addEmployee() {
  db.query('SELECT * FROM role', (err, roles) => {
    if (err) throw err;

    db.query(
      'SELECT * FROM employee WHERE manager_id IS NULL',
      (err, managers) => {
        if (err) throw err;

        inquirer
          .prompt([
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
          ])
          .then((answers) => {
            const selectedRole = roles.find(
              (role) => role.title === answers.role
            );
            const selectedManager = managers.find(
              (manager) => manager.id === answers.manager
            );

            db.query(
              'INSERT INTO employee SET ?',
              {
                first_name: answers.firstName,
                last_name: answers.lastName,
                role_id: selectedRole.id,
                manager_id: selectedManager.id,
              },
              (err) => {
                if (err) throw err;
                console.log('Employee added successfully!');
                promptUser();
              }
            );
          });
      }
    );
  });
}

function updateEmployeeRole() {
  const query = `
    SELECT employee.id, CONCAT(employee.first_name, ' ', employee.last_name) AS employee_name
    FROM employee
  `;
  
  db.query(query, (err, res) => {
    if (err) throw err;
    
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'employeeId',
          message: 'Select the employee to update:',
          choices: res.map((employee) => ({
            name: employee.employee_name,
            value: employee.id,
          })),
        },
        {
          type: 'input',
          name: 'newRoleId',
          message: 'Enter the new role ID:',
        },
      ])
      .then((answers) => {
        const { employeeId, newRoleId } = answers;
        const updateQuery = 'UPDATE employee SET role_id = ? WHERE id = ?';
        
        db.query(updateQuery, [newRoleId, employeeId], (err) => {
          if (err) throw err;
          
          console.log('Employee role updated successfully!');
          
          // Prompt the user again
          promptUser();
        });
      });
  });
}

// Call the start function to begin the application
promptUser();

