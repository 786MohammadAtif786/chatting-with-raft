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
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(session({secret: 'this is my secret key'}));

//template engine
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.set('views', './views');


app.get('/', (req, res) => {
  if (req.session.user) {
    res.render('chat');
  } else {
    res.render('login-register');
  }
});
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});
app.get('/user/:id', (req, res) => {
  res.render('chat');
});
app.post('/register', (req, res) => {
  const query = `INSERT INTO users (name, email, password, profileType) VALUES ("${req.body.name}", "${req.body.email}", "${req.body.password}", "${req.body['profile-type']}")`;
  connection.query(query, (err, result) => {
    if (err) {
      console.log(err);
    }
    req.session.user = {
      id: result.insertId,
      name: req.body.name,
      email: req.body.email
    }
    res.redirect('/');
  });
});

app.listen(3000, () => {
  console.log(`server is listening on 3000.`);
});