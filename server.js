const dotenv = require("dotenv")
dotenv.config()
const express = require("express")
const logger = require("morgan")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const compress = require("compression")
const path = require("path")
const app = express()
var session = require("express-session")

app.use(compress())




// Connect JSON Middleware
//NB: limit property is to set the size limit of the http request(in the event of sending files/images)
app.use(
  express.json({
    extended: false,
    limit: "5mb",
  })
)

app.use(
  cors({
    origin: [
      'http://localhost:3000',
    ],
    optionsSuccessStatus: 200,
  })
)

require("./config/index")

// Initialize passport
app.use(passport.initialize())

app.use(
  session({
    secret: "keyboard cat",
    resave: false, // don't save session if unmodified
    saveUninitialized: true, // don't create session until something stored
  })
)

// Init Middleware
app.use(logger("dev"))

app.use(express.json())

app.use(express.urlencoded({ extended: false }))

app.use(cookieParser())

app.all("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  next()
})

// Specials

app.use('/payment',require('./routes/paymentRoutes'))

app.get("/inapp", function (req, res) {
  res.sendFile(path.join(__dirname + "/in-app.html"))
  //__dirname : It will resolve to your project folder.
});

app.get("/", async (req, res) => {
  res.send(`Server started successfully`)
});



// Req Logger
const reqLogger = (req, res, next) => {
  logger(
    `Req from: ${req.connection.remoteAddress} ${req.method} '${
      req.url
    }' ${JSON.stringify(req.params)} ${JSON.stringify(req.body)}`
  );
  next();
}
app.use(reqLogger)

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error("Not Found error handled")
  err.status = 404
  next(err)
})

// ERROR HANDLERS
// Development error handler
// will print stacktrace
if (app.get("env") === "development") {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500)
    res.json({
      message: err.message,
      error: err,
    })
  })
}
// Producti
// on error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500)

  console.log("error handled", err)

  res.render("error", {
    message: err.message,
    error: {},
  })
})

const PORT = process.env.PORT 


app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
