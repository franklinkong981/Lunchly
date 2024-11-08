/** Database setup for Lunchly*/
const {Client} = require("pg");

let DB_URI = "postgres://franklinkong981:123456789@127.0.0.1:5432/lunchly";

let db = new Client({
  connectionString: DB_URI
});

db.connect();

module.exports = db;
