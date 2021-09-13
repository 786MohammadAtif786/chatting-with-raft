const express = require('express');
const ejs = require('ejs');
const session = require('express-session');
const mysql = require('mysql');

const app = express();
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'chatting'
});
connection.connect();

//appliction level middlweres
app.use(express.static('public'));
app.use(session({secret: 'this is my secret key'}));

//template engine
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.set('views', './views');


app.get('/', (req, res) => {
  res.render('login-register');
});
app.get('/logout', (req, res) => {
  res.redirect('/');
});
app.get('/user/:id', (req, res) => {
  res.render('chat');
});

app.listen(3000, () => {
  console.log(`server is listening on 3000.`);
});