const express = require('express');
const app =  express();
const crypto = require('crypto');
const bodyParser = require('body-parser');

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
app.post('/jobs', function(req, res){
    console.log(req.body);
    let job = {};
    job.responsibility = req.body.responsibility
    job.position = req.body.position
    job.requirements = req.body.requirements
    job.companyname = req.body.companyname
    job.website = req.body.website
    job.email = req.body.email
    job.about = req.body.about
    console.log(job);
    res.json(req.body);
});

app.listen(process.env.PORT || 3000, 
    () => console.log("Server is running..."));
    
    