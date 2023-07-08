// Import the necessary package
const mysql = require('mysql2');

// Create a connection pool
// The connection pool allows you to manage multiple connections to the database, which can improve performance and scalability.
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'your_username',
  password: 'your_password',
  database: 'employee_db',
  connectionLimit: 10
});

// Export the connection pool
//The .promise() method is called on the connection pool to enable the use of promises for asynchronous queries.
module.exports = pool.promise();
