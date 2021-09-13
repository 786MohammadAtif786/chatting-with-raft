const express = require('express');
const ejs = require('ejs');
const session = require('express-session');
const mysql = require('mysql');
const { WebSocketServer } = require('ws');

const app = express();
const wss = new WebSocketServer({port: 8080});
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

const wsList = {};
wss.on('connection', (ws) => {
  let id;
  ws.on('message', (message) => {
    message = JSON.parse(message.toString());
    if (message.type === 'open') {
      id = message.id;
      wsList[message.id] = ws;
    } else if (message.type === 'chat') {
      if (wsList[message.to]) {
        wsList[message.to].send(JSON.stringify(message));
      }
    }
  });
  ws.on('close', () => {
    delete wsList[id];
  });
});

app.get('/', (req, res) => {
  if (req.session.user) {
    const query = `SELECT id, name FROM users WHERE id !=${req.session.user.id}`;
    console.log(query);
    connection.query(query, (err, users) => {
      res.render('chat', {users, messages: []});
    });
  } else {
    res.render('login-register');
  }
});
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});
app.get('/user/:id', (req, res) => {
  if (req.session.user) {
    const query = `SELECT id, name FROM users WHERE id !=${req.session.user.id}`;
    console.log(query);
    const messageQuery = `SELECT messages.message, messages.created, users.name`;
    connection.query(query, (err, users) => {
      res.render('chat', {users});
    });
  } else {
    res.redirect('/');
  }
});

app.post('/login', (req, res) => {
  console.log(req.body);
  const query = `SELECT * FROM users WHERE email="${req.body.email}" AND password="${req.body.password}" limit 1`;
  console.log(query);
  connection.query(query, (err, result) => {
    if (err) {
      console.log(err);
    } 
    if (result.length > 0) {
      req.session.user = {
        id: result[0].id,
        name: result[0].name,
        email: result[0].email
      }
    }
    console.log(result);
    res.redirect('/');
  });
});
app.post('/register', (req, res) => {
  const query = `INSERT INTO users (name, email, password, profileType) VALUES ("${req.body.name}", "${req.body.email}", "${req.body.password}", "${req.body['profile-type']}")`;
  connection.query(query, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      req.session.user = {
        id: result.insertId,
        name: req.body.name,
        email: req.body.email
      }
    }
    res.redirect('/');
  });
});

app.listen(3000, () => {
  console.log(`server is listening on 3000.`);
});