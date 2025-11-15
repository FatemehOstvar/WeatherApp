const pool = require('./pool');

async function getAllCities(user){
  const {rows} = await pool.query("SELECT * FROM cities");
  return rows;
}

