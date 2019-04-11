//setup
var express = require("express");
var app = express();
var bodyParser = require('body-parser');

//configuration 
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// routes =======================================================================
app.use('/api', require('./routes/routes').router);

// listen (start app with node server.js) 
app.listen(8080, () => {
 console.log("Server running on port 8080");
});

module.exports = app;
