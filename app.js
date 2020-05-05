const express = require('express');
const passport =  require('passport')
const LocalStrategy = require('passport-local').Strategy;
const app =  express();
const crypto = require('crypto');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

require('dotenv').config();

const mongoUrl =  process.env.MONGO_URL;
let db;
const dbName = 'jobs-board-db'
let jobsCollection;
let usersCollection;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(require('cookie-parser')());
app.use(require('express-session')({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  
},
  function(email, password, done) {
    // usersCollection.findOne({ email: email }, function (err, user) {
    //   if (err) { return done(err); }
    //   if (!user) { return done(null, false); }
    //   //TODO use bcrypt and make verification  a method in class objec
    //   if (user.password!=password) { return done(null, false); }
    //   return done(null, user);
    // });
    if (email =="a" && password== "a"){

      let user = {}
      user.email = "a";
      user.name =  "a";
      user.password = "a";
      return done (null, user)
    }
  }
));

MongoClient.connect(mongoUrl, (err, client) => {
    if (err) return console.log(err);
    console.log(`Connected MongoDB: ${mongoUrl}`);
    db = client.db(dbName);
    jobsCollection = db.collection('jobs');
    usersCollection = db.collection('users');
  })

app.get('/', function(req, res){
    res.redirect('/jobs')
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
        res.render('jobs-list.ejs', { jobs: results })
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

app.get('/login', (req,res) => {
  res.render("login.ejs");
});

// TODO remove session variable = false
app.post('/login', passport.authenticate('local', { failureRedirect: '/login' ,session: false}),(req,res) => {
  res.redirect('/admin');
});

app.get('/register', (req,res) => {
  res.render("register.ejs");
});

app.post('/register', (req,res) => {
  // make a model
  let user = {}
  user.email = req.body.email;
  user.name =  req.body.name;
  user.password = req.body.password;
  
  usersCollection.insertOne(user)
    .then(result => {
      res.redirect('/');
    })
    .catch(error => {console.error(error)
      res.status(500).send();
    })
    
});
let port = process.env.PORT || 3000
app.listen(port, 
    () => console.log(`Server is running on port ${port}`));
    
    