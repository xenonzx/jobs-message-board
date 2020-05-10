// TODO Add validation and sanitization for form input
// TODO use ORM
const express = require('express');
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const session = require("express-session");
const crypto = require('crypto');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const app = express();
const env = require('dotenv');

env.config();
const mongoUrl = process.env.MONGO_URL;
let db;
const dbName = 'jobs-board-db'
let jobsCollection;
let usersCollection;

configExpress();
configPassport();

MongoClient.connect(mongoUrl, (err, client) => {
  if (err) return console.log(err);
  console.log(`Connected MongoDB: ${mongoUrl}`);
  db = client.db(dbName);
  jobsCollection = db.collection('jobs');
  usersCollection = db.collection('users');
});

app.get('/', function (req, res) {
  res.redirect('/jobs')
});

app.put('/message/:ID', function (req, res) {
  const id = req.params.ID;
  res.send(crypto.createHash('sha1')
    .update(new Date().toDateString() + id)
    .digest('hex'));
});

app.get('/jobs', function (req, res) {
  jobsCollection.find({ state: 'approved' }).toArray().then(results => {
    console.log(results)
    res.render('jobs-list.ejs', { jobs: results })
  });
});

app.post('/jobs', function (req, res) {
  console.log(req.body);
  let job = {};
  // TODO server side validation
  if (!db || !jobsCollection) {
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
  job.state = 'new'; // todo move constants file
  let responseMessage;
  jobsCollection.insertOne(job)
    .then(result => {
      //TODO: fix response to return only the job inserted not the whole collection

      console.log(result)
      res.json(result);
    })
    .catch(error => {
      console.error(error)
      res.status(500).send();
    })
});

app.post('/jobs/:id/approve', function (req, res) {
  console.log("approve")
  const id = req.params.id;
  console.log(id)
  // TODO record who approved 
  let query = { _id: ObjectId(id) };
  let newVal = { $set: { state: 'approved' } }
  jobsCollection.updateOne(query, newVal, function (err, result) {
    if (err) {
      console.error(err);
      res.status(500).send();
    }
    res.redirect('/new-job-posts');
  });
});

app.get('/login', (req, res) => {
  res.render("login.ejs");
});

app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
  res.redirect('/admin');
});

app.get('/register', checkAuthenticated, (req, res) => {
  res.render("register.ejs");
});

app.post('/register', checkAuthenticated, (req, res) => {
  // TODO make a model
  let user = {}
  user.email = req.body.email;
  user.name = req.body.name;
  user.password = req.body.password;

  usersCollection.insertOne(user)
    .then(result => {
      res.redirect('/admin');
    })
    .catch(error => {
      console.error(error)
      res.status(500).send();
    })
});

function checkAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/login')
  }
  next();
}

app.get('/admin', checkAuthenticated, (req, res) => {
  console.log(req.user);
  res.render('admin',{email:req.user.email, name : req.user.name});
});

app.get('/new-job-posts', checkAuthenticated, (req, res) => {
  jobsCollection.find({ $or: [{ state: null }, { state: 'new' }] }).toArray().then(results => {
    res.render('new-job-posts.ejs', { jobs: results });
  });
});
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
});


let port = process.env.PORT || 3000
app.listen(port,
  () => console.log(`Server is running on port ${port}`));

function configExpress() {
  app.set('view engine', 'ejs');
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(express.static('public'));
  app.use(require('cookie-parser')());
  app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
  }));
  app.use(passport.initialize());
  app.use(passport.session());

}

function configPassport() {
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
  },
    function (email, password, done) {
      usersCollection.findOne({ email: email }, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        //TODO use bcrypt and make verification  a method in class objec
        if (user.password != password) { return done(null, false); }
        console.log(user)
        return done(null, user);
      });
    }
  ));

  passport.serializeUser(function (user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function (id, done) {
    usersCollection.findOne({ _id: ObjectId(id) }, function (err, user) {
      console.log('deserializeUser user')
      console.log(user)
      return done(null, user);
    });
  });

}

