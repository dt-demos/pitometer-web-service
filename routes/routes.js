var express = require('express');
var router = express.Router();

//pitometer modules required
const DynatraceSource = require('@pitometer/source-dynatrace').Source;
const ThresholdGrader = require('@pitometer/grader-threshold').Grader;
const Pitometer = require ("@pitometer/pitometer").Pitometer;

var pitometer = new Pitometer();

router.use(function(req, res, next) {
    console.log('Triggered a new call...');
    next();
  });
  
  router.get('/', function(req, res) {
    res.json({ message: 'Please choose your API to call /api/pitometer/dynatrace or /api/pitometer/prometheus' });  
  });


  router.route('/pitometer/dynatrace').post(async function(req, res) {
    var monspecfile = req.body.monspec;

    const dotenv = require('dotenv');
    dotenv.config();

    pitometer.addSource('Dynatrace', new DynatraceSource({
      baseUrl: process.env.BASEURL,
      apiToken: process.env.DYNATRACEKEY,

    }));

    pitometer.addGrader('Threshold', new ThresholdGrader());

    await pitometer.run(monspecfile)
    .then((results) => telemetryresult = results)
    .catch((err) => console.error(err));

    var monspecstring = JSON.stringify(monspecfile);

    console.log(monspecstring);

    res.send(JSON.stringify(telemetryresult));
});

module.exports.router = router;