var mysql = require("mysql");
var express = require("express");
var app = express();
var cors = require("cors");
var bodyparser = require("body-parser");
var nodemailer = require('nodemailer');
app.use(bodyparser.json());
app.use(cors());
app.listen(3003, () => console.log("server up and running"));

var mysqlConnection = mysql.createConnection({
  host: "localhost",
  user: 'root',
  password: "mysql123",
  database: "gmaildb"
});

app.post('/postdata', (req, res) => {
  var postData = req.body;
  mysqlConnection.query('INSERT INTO gmailusers SET ?', postData, (err, result, fields) => {
    if (!err) {
      console.log("Record saved");
      res.status(200).send({
        message: "success",
      })
    }
    else {
      console.log("No data")
    }
  })
});

app.post('/validateUser', (req, res) => {
  mysqlConnection.query('SELECT * FROM gmailusers where gmailid = ? AND Userpassword = ? ', [req.body.gmailid, req.body.Userpassword], (err, rows, fields) => {
    if (rows && rows.length) {
      res.status(200).send({
        message: "Success",
      })
    }
    else {
      console.log("No data")
    }
  })
});

app.post('/sendEmail', (req, res) => {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: req.body.gmailid,
      pass: req.body.Userpassword
    }
  });

  var mailOptions = {
    from: req.body.gmailid,
    to: req.body.recepient,
    subject: req.body.subject,
    text: req.body.body
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
      let postData = {
        reciver: req.body.recepient,
        heading: req.body.subject,
        content: req.body.body,
        sender: req.body.gmailid
      }
      mysqlConnection.query('INSERT INTO gmailhistory SET ?', postData, (err, result, fields) => {
        if (!err) {
          console.log("Record saved");
          res.status(200).send({
            message: "Success",
          })
        }
        else {
          console.log("No data")
        }
      })
    }
  });

});


app.post('/mymails', (req, res) => {
  console.log("req list", req);
  mysqlConnection.query("SELECT * FROM gmailhistory WHERE sender = ?", [req.body.sender], (err, rows, fields) => {
    if (rows) {
      res.status(200).send({
        message: rows,
      })
    }
    else {
      console.log("No data")
    }
  })
});