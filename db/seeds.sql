
INSERT INTO department (name)
VALUES 
  ('Sales'),
  ('Finance'),
  ('Human Resources'),
  ('Legal');

INSERT INTO role (title, salary, department_id)
VALUES 
  ('Saleslead', 90000, 1),
  ('Salesperson', 50000, 1),
  ('Accountant', 70000, 2),
  ('HR Specialist', 50000, 3),
  ('HR Manager', 80000, 3),
  ('Lawyer', 80000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
  ('John', 'Doe', 1, NULL), 
  ('Sarah', 'Lourd', 2, 1),
  ('Jane', 'Smith', 3, 1), 
  ('Tom', 'Allen', 4, 6), 
  ('William', 'Chan', 6, NULL),
  ('Sally', 'White', 5, NULL);

SELECT * FROM role;
SELECT * FROM employee;