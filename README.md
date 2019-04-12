# Overview

Microservice web application that provides the processing logic of a passed in "perf spec" and start/end time frame. This service can be used as a software quality gate within continuous integration software pipelines. 

The "perf spec" processing logic uses the [Keptn Pitometer NodeJS modules](https://github.com/keptn/pitometer). This web application uses these specific modules.
* [pitometer](https://github.com/pitometer/pitometer) - Core module that acts as monspec processor to the request
* [source-dynatrace](https://github.com/pitometer/source-dynatrace) - interfaces to Dynatrace API to collect metrics
* [grader-thresholds](https://github.com/pitometer/grader-thresholds) - evaluates the threasholds and scores the request

# Interface design

## Request - Perf Spec evaluation
* POST request to https://[baseurl]/api/pitometer
* Content-Type: application/json
* Body Structure
  * timeStart - start time in [UTC unix seconds format](https://cloud.google.com/dataprep/docs/html/UNIXTIME-Function_57344718) used for the query
  * timeEnd - end time in [UTC unix seconds format](https://cloud.google.com/dataprep/docs/html/UNIXTIME-Function_57344718) used for the query
  * perfSpec - a JSON structure containing the performance signature
    * spec_version - string property with pitometer version.  Use 1.0
    * indicator - array of each indicator objects
    * objectives - object with pass and warning properties
    * <details><summary>Body Structure Format</summary>

        ```
        {
            "timeStart": 1551398400,
            "timeEnd": 1555027200,
            "perfSpec": {
                "spec_version": "1.0",
                "indicators": [ { <Indicator object 1> } ],
                "objectives": {
                    "pass": 100,
                    "warning": 50
                }
            }
        }
        ```

        </details>

    * [Complete Body example](samples/pitometer.rest)


## Response of valid lookup

A valid response will return an HTTP 200 with a JSON body containing these properties:
* totalScore - numeric property with the sum of the passsing indicator metricScores
* objectives - object with pass and warning properties passed in from the request
* indicatorResults - array of each indicator and their specific scores and values
* result - string property with value of 'pass', 'warn' or 'warning'

<details><summary>
Example response message
</summary>

```
{
    "totalScore": 100,
    "objectives": {
        "pass": 100,
        "warning": 50
    },
    "indicatorResults": [
        {
            "id": "P90_ResponseTime_Frontend",
            "violations": [
                {
                    "value": 12773344.5,
                    "key": "SERVICE-CA9FE330E85EE73B",
                    "breach": "upper_critical",
                    "threshold": 4000000
                }]
            ],
            "score": 50
        },
        {
            "id": "AVG_ResponseTime_Frontend",
            "violations": [
                {
                    "value": 4308886.6,
                    "key": "SERVICE-CA9FE330E85EE73B",
                    "breach": "upper_critical",
                    "threshold": 4000000
                }
            ],
            "score": 50
        }
    ],
    "result": "pass"
}
```

</details>

## Example response of invalid arguments

A valid response will return an HTTP 400 with a JSON body containing these properties:
* result - string property with value of 'error'
* message - string property with error messsage

<details><summary>
Example response message
</summary>

```
{
  "status": "error",
  "message": "Missing timeStart. Please check your request body and try again."
}
```
</details>

## Example response of processing error

A valid response will return an HTTP 500 with a JSON body containing these properties:
* result - string property with value of 'error'
* message - string property with error messsage

<details><summary>
Example response message
</summary>

```
{
  "status": "error",
  "message": "The given timeseries id is not configured."
}
```
</details>

# Run the app from Docker

You can just pull a pre-built image from [docker hub](https://hub.docker.com/r/robjahn/pitometer-web-service)

1. Start a docker a container with the environment variables for the Dyntrace configuration.  The web application will be listening on port 8080
    * option 1: explicitly passing in values
        ```
        docker run -p 8080:8080 -d -e DYNATRACE_BASEURL=<dynatrace tenant url> -e DYNATRACE_APITOKEN=<dynatrace api token> robjahn/pitometer-web-service
        ```
    * option 2: set OS variables
        ```
        export DYNATRACE_BASEURL=<dynatrace tenant url, example: https://abc.live.dynatrace.com>

        export DYNATRACE_APITOKEN=<dynatrace API token>

        docker run -p 8080:8080 -d -e DYNATRACE_BASEURL=$DYNATRACE_BASEURL -e DYNATRACE_APITOKEN=$DYNATRACE_APITOKEN robjahn/pitometer-web-service
        ```
1. make post request using a tool like [Postman](https://www.getpostman.com/downloads/) or the [VS Code REST client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) and the [Complete Body example](samples/pitometer.rest)

# Build your own Docker image

This repo has a [Dockerfile](Dockerfile) to build the application.  

To build and run a container locally:
1. You must have [docker](https://runnable.com/docker/) installed 
1. run this command to build an image 
    ```
    # this example assuming public dockerhub register format
    docker build -t <account/pitometer-web-service> .

    # optional push image to registry
    docker push account/pitometer-web-service
    ```
3. follow steps above in the section 'Run the app from Docker'

# Local development

1. You must have [node](https://nodejs.org/en/download/) installed locally.
1. Once you clone the repo, you need to run ```npm install``` to download the required modules
1. Confugure these environment variables
  * option 1: set environment variables in the shell
    ```
    export DYNATRACE_BASEURL=<dynatrace tenant url, example: https://abc.live.dynatrace.com>

    export DYNATRACE_APITOKEN=<dynatrace API token>
    ```
  * option 2: make a ```.env``` file in the root project folder wit these values
    ```
    DYNATRACE_BASEURL=<dynatrace tenant url, example: https://abc.live.dynatrace.com> 
    DYNATRACE_APITOKEN=<dynatrace API token>
    ```
1. run ```npm start```
1. make post request using a tool like [Postman](https://www.getpostman.com/downloads/) or the [VS Code REST client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) and the [Complete Body example](samples/pitometer.rest)


