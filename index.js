import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from 'dotenv';
dotenv.config()
console.log("ENV:", process.env.DB_USER, process.env.DB_NAME);
const app = express();
const port = 3000;

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
});
db.connect()
  .then(() => console.log("Connected to:", process.env.DB_NAME))
  .catch(err => console.error("Connection error:", err));



var currentUserId=2;
async function getcurrentuser() {
  if (currentUserId === null) {
    // No user selected → pick the first available user
    const allUsers = await db.query("SELECT * FROM users ORDER BY id ASC");
    if (allUsers.rows.length > 0) {
      currentUserId = allUsers.rows[0].id;
      return allUsers.rows[0];
    }
    return null; // no users at all
  }

  // If we have a currentUserId, check if it still exists
  const result = await db.query("SELECT * FROM users WHERE id = $1", [currentUserId]);
  if (result.rows.length > 0) {
    return result.rows[0]; // valid user
  }

  // If currentUserId was invalid (user deleted), pick the first available one
  const allUsers = await db.query("SELECT * FROM users ORDER BY id ASC");
  if (allUsers.rows.length > 0) {
    currentUserId = allUsers.rows[0].id;
    return allUsers.rows[0];
  }

  // Still no users
  currentUserId = null;
  return null;
}

var currentUser;
var currentdeadline='daily';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

app.get("/", async (req, res) => {
  currentUser=await getcurrentuser();
  const userresult= await db.query("SELECT * FROM users;")
  const result= await db.query("SELECT * from todo WHERE user_id=$1 AND deadline=$2 ORDER BY id ASC;",[currentUser.id,currentdeadline]);
  console.log(result.rows);
  const users=userresult.rows;
  items=result.rows;
  res.render("index.ejs", {
    currentdeadline,
    listTitle: "Today",
    listItems: items,
    users:users,
    color:currentUser.color,
  });
});

app.post("/add", async(req, res) => {
  const item = req.body.newItem;
  const user= (await getcurrentuser()).id;
  const deadline=currentdeadline;
  const result = await db.query("INSERT INTO todo (task,user_id,deadline) VALUES ($1,$2,$3);",[item,user,currentdeadline]);
  res.redirect("/");
});

app.post("/edit", async(req, res) => {
  const item = req.body.updatedItemTitle;
  const id = req.body.updatedItemId;

  try {
    await db.query("UPDATE todo SET task = ($1) WHERE id = $2", [item, id]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
  
});
app.post("/user", async (req, res) => {
  if (req.body.add === "new") {
    res.render("new.ejs");
} else {
  currentUserId = req.body.user;
  res.redirect("/");
}
});

app.post("/new", async (req, res) => {
  //Hint: The RETURNING keyword can return the data that was inserted.
  //https://www.postgresql.org/docs/current/dml-returning.html
  const name=req.body.name;
  const color=req.body.color;

  const result = await db.query("INSERT INTO users (name,color) VALUES ($1,$2) RETURNING *;",[name,color]);
  const id = result.rows[0].id;
  currentUserId = id;
  
  res.redirect("/");
});

app.post("/delete", async(req, res) => {
  const item=req.body.deleteItemId;
  console.log(item);
  await db.query("DELETE FROM todo WHERE id=$1;",[item]);
  res.redirect("/");
});

app.post("/deadline", async (req,res) =>{
  currentdeadline=req.body.deadline;
  console.log(currentdeadline);
  res.redirect("/");
})

app.post("/delete-user", async (req, res) => { 
  const currentUser = await getcurrentuser();

  // Delete that user's todos
  await db.query("DELETE FROM todo WHERE user_id=$1", [currentUser.id]); 
  // Delete the user itself
  await db.query("DELETE FROM users WHERE id=$1", [currentUser.id]); 

  // Pick the next available user
  const latest = await db.query("SELECT * FROM users ORDER BY id ASC"); 
  if (latest.rows.length > 0) { 
    currentUserId = latest.rows[0].id;   // ✅ use .id only
    console.log("New current user:", currentUserId); 
  } else { 
    currentUserId = null; // no users left
  } 
  
  res.redirect("/"); 
});





app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});