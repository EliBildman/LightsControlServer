const express = require('express');
const app = express();
const join = require('path').join;
const bodyParser = require('body-parser');

const port = 3000;

//middleware (?)
app.use(express.static(join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));



//routes
const apiRoute = require('./routes/apirouter');

app.use('/api', apiRoute);


//index
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '/views/index.html'));
});


app.listen(port, () => console.log(`Hosted on port ${port}`));

