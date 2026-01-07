const mysql = require('mysql');
const util = require('util');
require('dotenv').config();

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ala-eh-scape',
});

db.query = util.promisify(db.query).bind(db);

module.exports = db;