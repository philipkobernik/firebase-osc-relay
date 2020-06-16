'use strict';

var Firebase = require("firebase");
var osc = require('osc');
var cliProgress = require('cli-progress');

// Initialize Firebase
var firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  };

  Firebase.initializeApp(firebaseConfig);
  var db = Firebase.database();
  var rootRef = db.ref();

// create multibar container
var multibar = new cliProgress.MultiBar({
    format: '[{bar}] {percentage}% | {user}',
    clearOnComplete: false,
    hideCursor: true

}, cliProgress.Presets.shades_grey);

// add bars
var bars = {};
var members = [
  'ocean', 'davina', 'stefanie',
  'madi', 'grace', 'sam',
  'maritza', 'mikhail', 'ashley',
  'maya', 'oswaldo', 'breana',
  'max', 'jiahui', 'maiqi',
  'crystal', 'michelle', 'mckenna',
  'yichen', 'bristol'
].sort()

for(var i = 0; i < members.length; i++){
  bars[members[i]] = multibar.create(1000, 0, {user: members[i]});
}

// config and open udp port
var udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 57122,
    remoteAddress: "0.0.0.0",
    remotePort: 5557,
    metadata: true
});
udpPort.open();

rootRef.on("value", function(snapshot) {
  var controllers = snapshot.val();

  for (var uid in controllers) {
    // send float value, OSC over udp
    var userData = controllers[uid];
    udpPort.send({
      address: `/${uid}`,
      args: [
        {
          type: "f",
          value: userData
        }
      ]
    });

    // update the prog bar
    if(bars[uid]) {
      bars[uid].update(parseInt(userData * 1000), {user: uid});
    }
  }
});
