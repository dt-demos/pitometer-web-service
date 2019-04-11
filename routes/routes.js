var express = require('express');
var router = express.Router();

//pitometer modules required
const DynatraceSource = require('@pitometer/source-dynatrace').Source;
const PrometheusSource = require('@pitometer/source-prometheus').Source;
const ThresholdGrader = require('@pitometer/grader-threshold').Grader;
const Pitometer = require ("@pitometer/pitometer").Pitometer;

var pitometer = new Pitometer();

router.use(function(req, res, next) {
    console.log('Triggered a new call...');
    next();
  });
  
  router.get('/', function(req, res) {
    res.json({ message: 'Please, use pitometer calling /api/pitometer' });  
  });


  router.route('/pitometer').post(async function(req, res) {
    var monspecfile = req.body.monspec;
    if(monspecfile)
    {
      if(process.env.BASEURL == null || process.env.PROVIDERKEY == null || process.env.BASEURL == "" || process.env.PROVIDERKEY == "")
      {
        const dotenv = require('dotenv');
        dotenv.config();
      }
  
      pitometer.addSource('Dynatrace', new DynatraceSource({
        baseUrl: process.env.BASEURL,
        apiToken: process.env.PROVIDERKEY,
  
      }));

      pitometer.addSource('Prometheus', new PrometheusSource({
        baseUrl: process.env.BASEURL,
        apiToken: process.env.PROMETHEUSKEY,
    
      }));
  
      pitometer.addGrader('Threshold', new ThresholdGrader());
  
      await pitometer.run(monspecfile)
      .then((results) => telemetryresult = results)
      .catch((err) => console.error(err));
  
      var monspecstring = JSON.stringify(monspecfile);
  
      console.log(monspecstring);
  
      res.send(JSON.stringify(telemetryresult));
  }
  {
    res.status(400).json({ status: 'fail', message: 'The Perfspec file is empty, please check your request body and try again.' });
  }
});  

module.exports.router = router;