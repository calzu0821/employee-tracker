DROP DATABASE IF EXISTS employees_db;
CREATE DATABASE employees_db;

USE employees_db;

CREATE TABLE department (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) -- to hold department name
);

CREATE TABLE role (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(30), -- to hold role title
  salary DECIMAL, -- to hold role salary
  department_id INT, -- to hold reference to department role belongs to
  FOREIGN KEY (department_id) REFERENCES department (id)
    ON DELETE CASCADE
);

CREATE TABLE employee (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(30), -- to hold employee first name
  last_name VARCHAR(30), -- to hold employee last name
  role_id INT, -- to hold reference to employee role
  manager_id INT, -- to hold reference to another employee that is the manager of the current employee (null if the employee has no manager)
  FOREIGN KEY (role_id) REFERENCES role (id)
    ON DELETE CASCADE,
  FOREIGN KEY (manager_id) REFERENCES employee (id)
    ON DELETE SET NULL
);