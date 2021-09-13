const express = require('express');
const ejs = require('ejs');

const app = express();

//appliction level middlweres
app.use(express.static('public'));

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