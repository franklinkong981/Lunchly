/** Express app for Lunchly. */

const express = require("express");
const nunjucks = require("nunjucks");
const bodyParser = require("body-parser");
const routes = require("./routes");
const ExpressError = require("./errors/expressError");

const app = express();

// Parse body for urlencoded (non-JSON) data
app.use(bodyParser.urlencoded({ extended: false }));

nunjucks.configure("templates", {
  autoescape: true,
  express: app
});

// Use middleware logging function and prevent printing favicon.ico error to terminal
app.use(morgan('dev'));
app.get('/favicon.ico', (req, res) => res.sendStatus(204));


app.use(routes);

/** 404 handler */

app.use(function(req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;

  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.render("error.html", { err });
});

module.exports = app;