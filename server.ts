import { Client } from "pg";
import { config } from "dotenv";
import express from "express";
import cors from "cors";

config(); //Read .env file lines as though they were env vars.

//Call this script with the environment variable LOCAL set if you want to connect to a local db (i.e. without SSL)
//Do not set the environment variable LOCAL if you want to connect to a heroku DB.

//For the ssl property of the DB connection config, use a value of...
// false - when connecting to a local DB
// { rejectUnauthorized: false } - when connecting to a heroku DB
const herokuSSLSetting = { rejectUnauthorized: false }
const sslSetting = process.env.LOCAL ? false : herokuSSLSetting
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: sslSetting,
};

const app = express();

app.use(express.json()); //add body parser to each following route handler
app.use(cors()) //add CORS support to each following route handler

const client = new Client(dbConfig);
client.connect();

app.get("/", async (req, res) => {
  const dbres = await client.query('SELECT * FROM votes');
  res.json(dbres.rows);
});

app.post("/votes/:breed", async (req, res) => {
  console.log("post made")
  const breed = req.params.breed;
  let dbres;
  let currentVoteCount: any = await client.query("SELECT vote_count FROM votes WHERE breed = $1;", [breed]);
  const intVoteCount = currentVoteCount.rows.length === 0 ? 1 : parseInt(currentVoteCount.rows[0].vote_count) 
  dbres = await client.query("INSERT INTO votes(breed, vote_count) VALUES($1, 1) ON CONFLICT (breed) DO UPDATE SET vote_count = ($2 + 1) RETURNING *;", [breed, intVoteCount])
  res.json(dbres.rows);
})


// function convertDashSql(breed: string) {
//   if (breed.includes("-")) {
//     const arrOfBreed = breed.split("-");
//     return `${arrOfBreed[0]}||'-'||${arrOfBreed[1]}`
//   } else {
//     return breed
//   }
// }


//Start the server on the given port
const port = process.env.PORT;
if (!port) {
  throw 'Missing PORT environment variable.  Set it in .env file.';
}
app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});
