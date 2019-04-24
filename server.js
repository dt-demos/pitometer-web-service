//setup
var express = require("express");
var app = express();
var bodyParser = require('body-parser');

//configuration 
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// routes =======================================================================
var router = express.Router();
app.use('/api', require('./routes/routes').router);
app.use("/health", router);

router.get('/', function (req, res, next) {
  res.json({status: 'UP'});
});

// listen (start app with node server.js) 
app.listen(process.env.PORT || 8080, () => {
  console.log("Server running!");
});

module.exports = app;

