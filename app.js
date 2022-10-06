require("dotenv").config();
const bcrpyt = require("bcrypt");
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
var encrypt = require("mongoose-encryption");
const saltRound = 10;

const app = express();

mongoose.connect("mongodb://0.0.0.0:27017/userDB", { useNewUrlParser: true });
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});
//a secret key-string for encryption
//var secret = "wehavehulk"; this is now in .env file for safe.
//by this plugin we will able to encrypt our password field, commenting this line because I am using md5 hashing.
//userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });
//mongoos-encryption will encrypt at user.save state/function when we call that function.
// and will decrypt when we user user.find function.

const user = mongoose.model("User", userSchema);

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  bcrpyt.hash(req.body.password, saltRound, function (err, hash) {
    const newUser = new user({
      email: req.body.username,
      password: hash,
    });
    //this of encryption
    newUser.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        res.render("secrets");
        console.log("Success newUser");
      }
    });
  });
});

app.post("/login", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  //stage of decryption.
  user.findOne({ email: username }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      // so that we can compare our passowrds.
      bcrpyt.compare(password, foundUser.password, function (err, result) {
        if (result) {
          res.render("secrets");
        }
      });
    }
  });
});

app.listen(3000, function () {
  console.log("Server on 3000");
});
