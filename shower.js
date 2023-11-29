const express = require('express');

const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

const app = express(); 
const port = 443;

var admin = require("firebase-admin");

var serviceAccount = require("/opt/render/project/src/smartshower-d62ba-firebase-adminsdk-qco43-5049ad15a1.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = getFirestore();

// Get latest user to use the application
var currentUser = 0;
getCurrentUser();

// Push statistics to firebase
async function pushToDatabase(statistic)
{
    const docRef = db.collection('statistics').doc(currentUser.toString());

    const statisticDict = new Object();

    statisticDict[statistic.uid.toString()] = statistic;

    await docRef.set(statisticDict, { merge: true });

    console.log("Pushing shower data to database");
}

// Set current user
async function setCurrentUser(userId)
{
    const docRef = db.collection('settings').doc("node");

    await docRef.set({currentUser: userId});

    console.log("Setting current user: " + userId);
}

// Get active user
async function getCurrentUser()
{
    const settingsRef = db.collection('settings').doc('node');
    const doc = await settingsRef.get();
    
    if (!doc.exists) {
        console.log('Could not get currentUser. Using default shower user');
    } else {
        currentUser = doc.data().currentUser;
        console.log("Current user: " + currentUser);
    }
}

// Mock shower status
var targetTemperature = 25;
var targetFlow = 90;

var currentTemperature = 20;
var currentFlow = 50;

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
        targetTemperature = parseInt(temp);
    if(flow != null)
        targetFlow = parseInt(flow);

    res.send("Set successful");
});

app.get('/get', (req, res) => {
    var status;

    if(on) status = "on"; else status="off";

    var response = {status: status, time:currentShower.length, currentTemperature: currentTemperature, currentFlow:currentFlow,
        targetTemperature:targetTemperature, targetFlow:targetFlow}

    res.send(response);
});

// Methods used by real shower
app.get('/user', (req, res) => {
    const userId = parseInt(req.query.user);
    if(userId != null)
    {
        currentUser = userId;
    }

    setCurrentUser(currentUser);

    var response = "current user set successfully";
    res.send(response);
});

app.get('/push', (req, res) => {

    const queryTemperature = req.query.temp;
    const queryFlow = req.query.flow;
    const queryDuration = req.query.duration;
    const queryWaterUsage = req.query.usage;

    const currentDate = new Date();
    let uid = Math.floor(Math.random() * 4000000000);
    let temperature = 0;
    let flow = 0;
    let duration = 0;
    let month = currentDate.getMonth();
    let presetId = 0;
    let waterUsage = 0;

    if(queryTemperature != null)
    {
        temperature = parseInt(queryTemperature);
    }
    if(queryFlow != null)
    {
        flow = parseInt(queryFlow);
    }
    if(queryDuration != null)
    {
        duration = parseInt(queryDuration);
    }
    if(queryWaterUsage != null)
    {
        waterUsage = parseInt(queryWaterUsage);
    }

    const statistic = {averageFlow: flow, averageTemperature: temperature, dateTime: currentDate.getTime(), duration: duration, energy:0, month:month, presetId: presetId, uid: uid, waterUsage:waterUsage};

    pushToDatabase(statistic);

    res.send("Set successful");
});

app.listen(port, '0.0.0.0', function() {
    console.log(`Listening to port ${port}`);
});

// Mock shower behaviour
setInterval(function(){
    if(on)
    {
        showerTime++;

        currentTemperature = Math.round((currentTemperature + targetTemperature) / 2);
        currentFlow = Math.round((currentFlow + targetFlow) / 2);

        currentShower.push(currentTemperature);
    }
}, 1000);