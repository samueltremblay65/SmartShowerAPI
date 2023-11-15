const express = require('express'); 
const app = express(); 
const port = 443;

var currentTemp = 25;
var currentFlow = 80;

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
    res.send(`temp=${currentTemp},flow=${currentFlow}`);
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
        console.log(`Current Temperature: ${currentTemp}`);
        console.log(`Current Flow: ${currentFlow}`);
        showerTime++;
        currentShower.push(currentTemp);
    }
}, 1000);