const express = require('express');
const app =  express();
const crypto = require('crypto');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

require('dotenv').config();

const mongoUrl =  process.env.MONGO_URL;
let db;
const dbName = 'jobs-board-db'
let jobsCollection;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

MongoClient.connect(mongoUrl, (err, client) => {
    if (err) return console.log(err);
    console.log(`Connected MongoDB: ${mongoUrl}`);
    db = client.db(dbName);
    jobsCollection = db.collection('jobs');
  })

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
        res.render('index.ejs', { jobs: results })
        //res.send(results);
      });
});

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
    let responseMessage ;
    jobsCollection.insertOne(job)
    .then(result => {
      //TODO: fix response to return only the job inserted not the whole collection
      
      console.log(result)
      res.json(result);
    })
    .catch(error => {console.error(error)
      res.status(500).send();
    })
    
    
});

app.listen(process.env.PORT || 3000, 
    () => console.log("Server is running..."));
    
    