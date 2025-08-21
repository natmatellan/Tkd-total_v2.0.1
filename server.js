var express = require("express")
var app = express()
var http = require('http').Server(app)
var https = require('https')
var fs = require("fs")
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')//<---- Necesito realmente esto?
var session = require('express-session')
var mongoose = require('mongoose')
var multer  = require('multer')
var upload = multer({ dest: 'tmp/' })

var server = http.listen(80, function(){
  
  var port = server.address().port
  console.log("Server Running in http://127.0.0.1:"+port)
  console.log("Base dir: "+__dirname)
})

var options = {
  key: fs.readFileSync('keys/key.pem'),
    cert: fs.readFileSync('keys/fullchain.pem')
}

var s = https.createServer(options, app).listen(443, function(){
  console.log("Secure conction Established - HTTPS - SSL")
})
var io = require('socket.io')(s)


/********************* Global Variables && uses ***********************/

var sessionMiddleware = session({
  secret:'S3KR3T',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
})

app.use(bodyParser.json()) // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // to support URL-encoded bodies
app.use(express.static(__dirname+"/public"))
app.use(sessionMiddleware)
/********************* Global Variables && uses ***********************/



/********************* Mongoose ***********************/
mongoose.connect('mongodb://127.0.0.1/taekwondo')
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
  console.log("we're connected to Mongo!")
})

/****             Schemas               ****/
var User = require(__dirname+'/model/user')
/****             Schemas               ****/
/********************* Mongoose ***********************/





/********************* Socket.io ***********************/
io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res || {}, next)
})

io.on('connection', function(socket){
  console.log("a user's connected")
  var cookie_string = socket.request.headers.cookie
  console.log("socket.request.headers.cookie : "+cookie_string)
  var session = socket.request.session
  console.log("io.sockets.sockets : "+io.sockets.sockets)
  /*var connect_sid = parsed_cookies['connect.sid']
  if (connect_sid) {
    session_store.get(connect_sid, function (error, session) {
      console.log("msg emited by: "+session.userID)
    console.log("session number: "+session.id)
  })
  }*/
  socket.on('chat message', function(msg){
      console.log("Usuario que emite el msg: "+session.userID)
    console.log("msg: "+msg)
    socket.broadcast.emit('chat message', msg)
  })
  
  socket.on('disconnect', function(){
    console.log('user disconnected')
  })
})
/********************* Socket.io ***********************/







/********************* Router ***********************/

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});




app.get('/arigatougozaimatsu', function(req, res){
  if(!req.session.userID){
    res.sendFile(__dirname+"/login.html")
    console.log("req: "+req.toString())
    console.log("req.session: "+req.session.id)
    console.log("req.session.userID: "+req.session.userID)
  }else{
    res.sendFile(__dirname+"/FBchat.html")
    console.log("req: "+req.toString())
    console.log("req.session: "+req.session.id)
    console.log("req.session.userID: "+req.session.userID)
  }
})

app.post('/login', async (req, res) => {
  console.log(req.body);
  try {
    const user = await User.findOne({ name: req.body.user }).exec();
    if (!user) {
      console.log("User doesn't exist --> do you want to create a user?");
      return res.json({ isERROR: true });
    }
    
    if (req.body.user === user.name && req.body.password === user.password) {
      console.log("Login status: OK - req.session.id: " + req.session.id);
      req.session.userID = user._id;
      console.log("_id: " + req.session.userID);
      return res.sendFile(__dirname+"/public/index.html");
    } else {
      console.log("User or password not valid");
      return res.json({ isERROR: true });
    }
  } catch (err) {
    console.log("DANGER: 'There was a problem querying Mongo': ");
    console.log(err);
    return res.json({ isERROR: true });
  }
});


//SESSION
app.get('/profile', function(req, res){
  res.sendFile(__dirname+"/profile.html")
})

app.get('/session', async (req, res) => {
  try {
    const user = await User.findById(req.session.userID).exec();
    if (!user) {
      console.log("User not found in session");
      return res.json({ isERROR: true });
    }
    console.log(user);
    res.send(user);
  } catch (err) {
    console.log("DANGER: 'There was a problem finding Session in SessionStorage': ");
    console.log(err);
    res.json({ isERROR: true });
  }
});

app.get('/endSession', function(req, res){
  req.session.destroy()
  res.redirect('/')
})

//END SESSION





//USER

//CREATE User
app.post('/user', async (req, res) => {
  console.log(req.body);
  console.log("ENDPOINT: /user POST")
  const user = new User({
    name: req.body.name,
    lastName: req.body.lastName,
    nickname: req.body.nickname,
    email: req.body.email,
    password: req.body.password,
    age: 23, // Placeholder for age, consider calculating based on birthdate
    gender: req.body.gender,
  });

  try {
    await user.save();
    console.log("User " + user.name + " created successfully!");
    req.session.userID = user._id;
    res.sendFile(__dirname + "/public/index.html");
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).send("Error creating user");
  }
});

//GET User
app.get('/user/:_id', function(req, res){
  User.findById(req.params._id, function(err, user) {
    if (err) throw err
    console.log("Obteniendo usuario "+user.name+" desde: /user/:_id")
    res.json(user)
  })
})

//GET Users
app.get('/users', function(req, res){
  User.find({}, function(err, users) {
    if (err) throw err
    console.log("Obteniendo todos los usuarios desde: /users")
    res.json(users)
  })
})

// END USER

/********************* END Router ***********************/





