const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User, validate } = require("../models/user");
const express = require("express");
const router = express.Router();
var MongoClient = require("mongodb").MongoClient;
const { mongodb } = require("../config/default.json");

//registration
router.post("/", async (req, res) => {
  console.log("inside register service");
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let user = new User(_.pick(req.body, ["name", "email", "password"]));
  console.log(" user ", user);
  const salt = await bcrypt.genSalt(10);
  console.log(" user.salt ", salt);
  user.password = await bcrypt.hash(user.password, salt);
  //await user.save();
  console.log(" user.password ", user.password);
  MongoClient.connect(mongodb, function (err, client) {
    var db = client.db("mydb");
    var collectionObj = db.collection("Users");
    collectionObj.findOne({ email: user.email }, function (err, userObj) {
      if (err) throw err;
      if (userObj) {
        return res.status(400).send("User already registered.");
      } else {
        collectionObj.insertOne({
          name: user.name,
          password: user.password,
          email: user.email,
        });
        const token = user.generateAuthToken();
        res
          .header("x-auth-token", token)
          .header("access-control-expose-headers", "x-auth-token") // to allow customer header to be read by client
          .send(_.pick(user, ["_id", "name", "email"]));
      }
    });
  });
});
//login
router.post("/auth", async (req, res) => {
  console.log("inside login service");
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  MongoClient.connect(mongodb, async function (err, client) {
    var db = client.db("mydb");
    var collectionObj = db.collection("Users");
    collectionObj.findOne({ email: req.body.email }, async function (
      err,
      userObj
    ) {
      if (err) throw err;
      console.log("userObj", userObj);
      if (!userObj) {
        console.log("in if");
        return res.status(400).send("Invalid email or password.");
      } else {
        let user = new User(_.pick(userObj, [("name", "email", "password")]));
        console.log("in else", req.body.password, ":", userObj.password);
        const validPassword = await bcrypt.compare(
          req.body.password,
          userObj.password
        );
        console.log("validPassword", validPassword);
        if (!validPassword)
          return res.status(400).send("Invalid email or password.");
        const tempUserObj = {
          name: userObj.name,
          email: userObj.email,
          _id: userObj._id,
        };
        let newUser = new User(tempUserObj);
        const token = newUser.generateAuthToken();
        res.json({ token: token });
      }
    });
  });
  function validate(req) {
    const schema = {
      email: Joi.string().min(5).max(255).required().email(),
      password: Joi.string().min(5).max(255).required(),
    };
    return Joi.validate(req, schema);
  }
});

module.exports = router;
router.post("/", async (req, res) => {
  console.log("inside register service");
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let user = new User(_.pick(req.body, ["name", "email", "password"]));
  console.log(" user ", user);
  const salt = await bcrypt.genSalt(10);
  console.log(" user.salt ", salt);
  user.password = await bcrypt.hash(user.password, salt);
  //await user.save();
  console.log(" user.password ", user.password);
  MongoClient.connect(mongodb, function (err, client) {
    var db = client.db("mydb");
    var collectionObj = db.collection("Users");
    collectionObj.findOne({ email: user.email }, function (err, userObj) {
      if (err) throw err;
      if (userObj) {
        return res.status(400).send("User already registered.");
      } else {
        collectionObj.insertOne({
          name: user.name,
          password: user.password,
          email: user.email,
        });
        const token = user.generateAuthToken();
        res
          .header("x-auth-token", token)
          .header("access-control-expose-headers", "x-auth-token") // to allow customer header to be read by client
          .send(_.pick(user, ["_id", "name", "email"]));
      }
    });
  });
});
