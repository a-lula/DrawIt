const express = require('express');
const mongoose = require("mongoose");
const config = require("./config/database");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');


/* Import Models */
const Draw = require('./models/draw');
/* Import Routes */
const draw = require('./routes/draw');

mongoose
  .connect(
    config.database,
    { useNewUrlParser: true }
  )
  .then(() => console.log("Connected to mongoDB"))
  .catch(err => console.log(err));


var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());


app.use('/draw', draw);

/// catch 404
app.use(function(req, res, next) {
    res.json({success: false,msg: "404"});
});


module.exports = app;
