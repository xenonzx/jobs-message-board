const express = require('express');
const app =  express();
const crypto = require('crypto');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
// TODO get it from env var
const mongoUrl = 'mongodb://127.0.0.1:27017'
const dbName = 'jobs-board-db'
let db;
let jobsCollection;
MongoClient.connect(mongoUrl, (err, client) => {
    if (err) return console.log(err);
    console.log(`Connected MongoDB: ${mongoUrl}`);
    console.log(`Database: ${dbName}`);
    db = client.db(dbName)
    jobsCollection = db.collection('jobs');

  })

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
app.get('/', function(req, res){
    res.send("helloworld");
});

app.put('/message/:ID', function(req, res){
    const id = req.params.ID;
    res.send(crypto.createHash('sha1')
      .update(new Date().toDateString() + id)
      .digest('hex'));
});
app.get('/jobs', function(req, res){
    jobsCollection.find().toArray().then(results => {
        console.log(results)
        res.send(results);
      });
})
app.post('/jobs', function(req, res){
    console.log(req.body);
    let job = {};
    // TODO server side validation
    if (!db||!jobsCollection){
        res.status(500).send();
        return console.log("error in creating  job in jobs collection");
    }
    job.responsibility = req.body.responsibility
    job.position = req.body.position
    job.requirements = req.body.requirements
    job.companyname = req.body.companyname
    job.website = req.body.website
    job.email = req.body.email
    job.about = req.body.about
    jobsCollection.insertOne(req.body)
    .then(result => {
      console.log(result)
    })
    .catch(error => console.error(error))
    console.log(job);
    res.json(req.body);
});

app.listen(process.env.PORT || 3000, 
    () => console.log("Server is running..."));
    
    