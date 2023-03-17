// this file will be used to update the database manually in case of errors

const db_helper = require("./helpers/database_functions.js");

console.log("update_database.js started");
db_helper.startUpdateDatabase();
