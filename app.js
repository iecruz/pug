const express = require('express');
const api = require('./api');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('res'));
app.use(express.json('*/*'));

app.set('view engine', 'pug');
app.set('views', 'views');

app.use('/api', api);

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(port);
