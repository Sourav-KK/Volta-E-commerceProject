let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
// let logger = require('morgan');
let expresslayouts = require('express-ejs-layouts');
let userRouter = require('./routes/user');
let adminRouter = require('./routes/admin');
let db = require('./config/connection');
let fileUpload = require('express-fileupload')
let session = require('express-session');
let twilio = require('twilio');
let multer = require('multer')
let app = express();

let ConnectMongoDBSession = require("connect-mongodb-session");
let mongoDbSesson = new ConnectMongoDBSession(session);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expresslayouts)
// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/adminFile')));

app.use(fileUpload());
app.use(
  session({
    saveUninitialized: false,
    secret: 'process.env.SECRET_KEY',
    resave: false,
    store: new mongoDbSesson({
      uri: 'mongodb://127.0.0.1:27017/volta',
      collection: "session",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 10, // 10 days
    },
  })
);


app.use('/', userRouter);
app.use('/admin', adminRouter);

let store = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '/public/productImages'))
  }, filename: function (req, file, cb) {
    let name = Date.now() + '-' + file.originalname;
    cb(null, name)
  }
})
let upload = multer({ storage: store })


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3000)