const express = require('express'); 
const app = express(); 
const port = 443;

var currentTemp = 25;
var currentFlow = 80;

var targetTemp = 25;
var targetFlow = 90;

var currentShower = []
var showerTime = -1;

var on = false;

app.get('/', (req, res) => {
    res.sendFile('main.html', {root: __dirname}); 
});

app.get('/on', (req, res) => {
    on = true;
    console.log("Shower turned on");
    res.send("Shower turned on");
});

app.get('/off', (req, res) => {
    on = false;
    currentShower = []
    console.log("Shower turned off");
    res.send("Shower turned off");
});

app.get('/set', (req, res) => {
    const temp = req.query.temp;
    const flow = req.query.flow;

    if(temp != null)
        currentTemp = temp;
    if(flow != null)
        currentFlow = flow;

    res.send("Set successful");
});

app.get('/get', (req, res) => {
    var status;

    if(on) status = "on"; else status="off";

    var response = {status: status, time:currentShower.length, currentTemperature: currentTemp, currentFlow:currentFlow,
        targetTemperature:targetTemp, targetFlow:targetFlow}

    res.send(response);
});

app.get('/history', (req, res) => {
    var history_feed = "";
    currentShower.forEach(element => {
        history_feed += element.toString() + ",";
    });

    console.log(currentShower.length);

    res.send(history_feed);
});

app.listen(port, '0.0.0.0', function() {
    console.log(`Listening to port ${port}`);
});

setInterval(function(){
    if(on)
    {
        showerTime++;
        currentShower.push(currentTemp);
    }
}, 1000);