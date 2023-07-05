INSERT INTO department (id, name)
VALUES (1, 'Management'),
       (2, 'Sales'),
       (3, 'Accounting'),
       (4, 'Customer Service');

INSERT INTO role (id, title, salary, department_id)
VALUES (1, 'Regional Manager', 100000, 1),
       (2, 'Salesman', 80000, 2),
       (3, 'Accountant', 70000, 3),
       (4, 'Customer Service Representative', 40000, 4)

INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES (1, 'Michael', 'Scott', 1, NULL),
       (2, 'Jim', 'Halpert', 2, 1),
       (3, 'Oscar', 'Martinez', 3, 1),
       (4, 'Kelly', 'Kapoor', 4, 1);