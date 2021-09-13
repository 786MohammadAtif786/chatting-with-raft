const express = require('express');
const ejs = require('ejs');
const app = express();

app.use(express.static('public'));
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.set('views', './views');


app.get('/', (req, res) => {
  res.render('chat');
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