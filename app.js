const express = require('express');
const app = express();

app.use(express.static('public'));
app.use(express.static('views'));

app.listen(3000, () => {
  console.log(`server is listing.`);
});