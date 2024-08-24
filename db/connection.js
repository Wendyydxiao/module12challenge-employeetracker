const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'Test1234',
  host: 'localhost',
  database: 'employee_db'
});

module.exports = pool;