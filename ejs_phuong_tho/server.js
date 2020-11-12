// load the things we need
var express = require('express');
var app = express();
var randomId = require('random-id');
var len = 10;
var pattern = 'aA0';

const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092']
});

const producer = kafka.producer();

const run = async () => {
  await producer.connect();
}
run().catch(e => console.error(e));

// set the view engine to ejs
app.set('view engine', 'ejs');

// use res.render to load up an ejs view file
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })


// index page
app.get('/', function(req, res) {
    var mascots = [
        { name: 'Sammy', organization: "DigitalOcean", birth_year: 2012},
        { name: 'Tux', organization: "Linux", birth_year: 1996},
        { name: 'Moby Dock', organization: "Docker", birth_year: 2013}
    ];
    var tagline = "No programming concept is complete without a cute animal mascot.";

    res.render('pages/index', {
        mascots: mascots,
        tagline: tagline
    });
});

// save image
let data = [];

const sendMessage = (blob) => {
  return producer
    .send({
      topic: 'quickstart-events',
      messages: [{
        key: randomId(len, pattern),
        value: blob
      }]
    })
    .then(console.log('image published to kafka'))
    .catch(e => console.error('failed to publish image', e))
};

app.post('/saveimage', upload.any(), function(req, res) {
    let file = req.files;
    let blob = file[0];
    data.push(blob);
    sendMessage(blob);

    res.send("success");
})

// about page
app.get('/about', function(req, res) {
    res.render('pages/about');
});

app.listen(8080);
console.log('8080 is the magic port');
