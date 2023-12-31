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
  ws.on('message', (msgStr) => {
    msgStr = msgStr.toString();
    const message = JSON.parse(msgStr);
    console.log(message);
    if (message.type === 'open') {
      id = message.id;
      wsList[message.id] = ws;
      ws.send(msgStr);
    } else if (message.type === 'chat') {
      if (wsList[message.toUser]) {
        wsList[message.toUser].send(msgStr);
        const msgQuery = `INSERT INTO messages(toUser, fromUser, message) VALUES(${message.toUser}, ${message.fromUser}, "${message.message}")`;
        connection.query(msgQuery, (err) => {
          if (err) {
            console.log(err);
          }
        });
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
    connection.query(query, (err, users) => {
      res.render('chat', {users, messages: [], toUser: null});
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
    const messageQuery = `SELECT messages.message, messages.toUser, messages.fromUser, messages.created, users.name
                          FROM messages
                          LEFT JOIN users 
                          ON messages.fromUser=users.id
                          WHERE  (messages.toUser=${req.session.user.id} OR messages.toUser=${req.params.id}) AND (messages.fromUser=${req.session.user.id} OR messages.fromUser=${req.params.id})
                          order by messages.created asc;`;
    connection.query(query, (err, users) => {
      connection.query(messageQuery, (err, messages) => {
        res.render('chat', {users, messages, toUser: req.params.id});
      });
    });
  } else {
    res.redirect('/');
  }
});

app.post('/api/v1/login', (req, res) => {
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
      res.cookie('user',result[0].id);
    }
    res.redirect('/');
  });
});
app.post('/api/v1/register', (req, res) => {
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
      res.cookie('user', result.insertId);
    }
    res.redirect('/');
  });
});


app.listen(3000, () => {
  console.log(`server is listening on 3000.`);
});

