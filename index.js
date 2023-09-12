const express = require('express');
const app = express();
const mysql = require('mysql2');
const session = require("express-session");
const multer = require('multer');
const path = require('path');
const connection = mysql.createConnection({
     host : "localhost",
     user : "root",
     password: "root",
     database: "task2"
});
// Parse JSON data in the request body
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// ... Your additional code and routes go here ...
app.use(express.urlencoded({ extended: true }));

// Set up session middleware
app.use(session({
  secret: 'fkw45lrk2oP3RG3240QFPO34H6U894R',
  resave: false,
  saveUninitialized: true,
}));


  
app.get("/",(req,res)=>{
    res.render("index.ejs");
});

app.post("/", (req, res) => {
    const { username, password } = req.body;
    
    // Correct the typo in the SQL query ("passwprd" -> "password")
    connection.query("SELECT * FROM user WHERE username = ? AND password = ?", [username, password], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        res.status(500).send('Internal server error');
        return;
      }
  
      if (results.length === 1) {
        // User is logged in successfully
        req.session.username = username;
        req.session.loggedIn = true;
        res.render("page1.ejs",{username});
       
      } else {
        // Incorrect username or password
        res.send('Incorrect username or password');
      }
    });
  });
  
app.get("/signup",(req,res)=>{
    res.render("signup.ejs");
});


app.post('/signup', (req, res) => {
    const { username, password } = req.body;
  
    // Insert data into the 'data' table
    const query = 'INSERT INTO user (username, password) VALUES (?, ?)';
    connection.query(query, [username, password], (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        res.status(500).json({ error: 'Failed to insert data' });
        return;
      }
  
      // Data inserted successfully
      console.log('Data inserted:', result);
      res.redirect("/signup");
    });
  });

   app.get("/message",(req,res)=>{
    res.render("message.ejs",{username : req.session.username});
   });
  
   app.post("/message",(req,res)=>{
    const {username , message} = req.body;
    console.log(username);
    console.log(message);
    connection.query("insert into data values(?,?,?)",[req.session.username,username,message],(err,result)=>{
      if (err) {
        console.error('Error inserting message:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
      res.redirect("/message");
    });
   });

   app.get("/ymessage",(req,res)=>{
    connection.query("Select fromusername,message from data where tousername = ?",[req.session.username],(err,results)=>{
      if (err) {
        console.error('Error inserting message:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
      console.log(results);
      res.render("ymessage.ejs",{username : req.session.username , results});

    });
   });

app.get("/assign",(req,res)=>{
  res.render("assign.ejs",{username : req.session.username});
});

app.post("/assign",(req,res)=>{
  const {username , task} = req.body;
  connection.query("insert into data1 values(?,?,?)",[req.session.username,username,task],(err,results)=>{
    if (err) {
      console.error('Error inserting message:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.redirect("/assign");
  });
})

app.get("/task",(req,res)=>{
  connection.query("Select fromusername,task from data1 where tousername = ?",[req.session.username],(err,results)=>{
    if (err) {
      console.error('Error inserting message:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    console.log(results);
    res.render("task.ejs",{username : req.session.username , results});

  });
 });



     app.get('/logout', (req, res) => {
    
       req.session.destroy((err) => {
       if (err) {
        console.error('Error destroying session:', err);
       }
    
          res.redirect('/');
    });
  });



app.listen(3000,()=>{
    console.log("Server opened at 3000");
});