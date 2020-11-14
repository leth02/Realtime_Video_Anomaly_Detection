// load the things we need
var express = require('express');
var app = express();
var randomId = require('random-id');
var len = 10;
var pattern = 'aA0';

var toBuffer = require('blob-to-buffer')

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


var multer  = require('multer')
var storage = multer.memoryStorage();
var upload = multer({storage: storage});

// use res.render to load up an ejs view file
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


const sendToKafka = (bufferArray) => {
    return producer
            .send({
                topic: 'test',
                messages: [{
                    key: randomId(len, pattern),
                    value: bufferArray
                }]
            })
            .then(console.log('send request to Kafka executed'))
            .catch(e => console.error('failed to publish image', e))
};

app.post('/saveimage', upload.any(), function(req, res) {
    sendToKafka(req.files[0]['buffer']);

    res.send("success");
})

// about page
app.get('/about', function(req, res) {
    res.render('pages/about');
});

app.listen(8111);
console.log('8111 is the magic port');
