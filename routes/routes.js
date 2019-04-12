var express = require('express');
var router = express.Router();

//pitometer modules required
const DynatraceSource = require('@pitometer/source-dynatrace').Source;
const ThresholdGrader = require('@pitometer/grader-threshold').Grader;
const Pitometer = require ("@pitometer/pitometer").Pitometer;

// create instance of Pitometer
var pitometer = new Pitometer();

router.use(function(req, res, next) {
    console.log('Processing request');
    next();
  });
  
  router.get('/', function(req, res) {
    res.status(400).json({ status: 'fail', message: 'Please, use pitometer calling /api/pitometer' }); 
  });


  router.route('/pitometer').post(async function(req, res) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Content-Type', 'application/json');
    var perfSpecJson = req.body.perfSpecJson.monspec;
    var timeStart = req.body.timeStart;
    var timeEnd = req.body.timeEnd;

    // validate required arguments
    if(!process.env.DYNATRACE_BASEURL)
    {
      res.status(400).json({ status: 'fail', message: 'Missing environment variable: BASEURL.' });
    }
    if(!process.env.DYNATRACE_APITOKEN)
    {
      res.status(400).json({ status: 'fail', message: 'Missing environment variable: PROVIDERKEY.' });
    }
    if(!perfSpecJson)
    {
      res.status(400).json({ status: 'fail', message: 'Missing perfSpecJson. Please check your request body and try again.' });
    }
    if(!timeStart)
    {
      res.status(400).json({ status: 'fail', message: 'Missing timeStart. Please check your request body and try again.' });
    }
    if(!timeEnd)
    {
      res.status(400).json({ status: 'fail', message: 'Missing timeEnd. Please check your request body and try again.' });
    }

    // start processing 
    if(process.env.BASEURL == null || process.env.PROVIDERKEY == null || process.env.BASEURL == "" || process.env.PROVIDERKEY == "")
    {
      const dotenv = require('dotenv');
      dotenv.config();
    }

    // configure the DynatraceSource
    pitometer.addSource('Dynatrace', new DynatraceSource({
      baseUrl: process.env.DYNATRACE_BASEURL,
      apiToken: process.env.DYNATRACE_APITOKEN,

    }));

    // configure the ThresholdGrader
    pitometer.addGrader('Threshold', new ThresholdGrader());

    // debug output
    var perfSpecJsonString = JSON.stringify(perfSpecJson);
    console.log("Passed in timeStart: " + timeStart + "  timeEnd: " + timeEnd)
    console.log("Passed in perfSpecJsonString: " + perfSpecJsonString)

    // make the pitometer request
    var telemetryErr ="";
    await pitometer.run(perfSpecJson, { timeStart: timeStart, timeEnd: timeEnd} )
    .then((results) => telemetryResult = results)
    .catch((err) => telemetryErr = err);

    if(telemetryErr)
    {
      console.log("Result: " + telemetryErr.message)
      res.status(500).json({ status: 'error', message: telemetryErr.message });
    }
    else
    {
      console.log("Result: " + JSON.stringify(telemetryResult.result))
      res.send(JSON.stringify(telemetryResult));
    }
});  

module.exports.router = router;
