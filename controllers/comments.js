var MongoClient = require("mongodb").MongoClient;
const auth = require("../middleware/auth");
const { ObjectId } = require("mongodb");
//const { mongodb } = require("../config/custom-environment-variables.json");
const mongodb = process.env.smartConnect_db;
var express = require("express"),
  router = express.Router();

//router.get("/getReviews", [auth], function(req, res) {
router.get("/getReviews", function (req, res) {
  // Connect to the db

  const client = new MongoClient(mongodb);
  client.connect((err) => {
    console.log("clientclientclientclient", client);

    const db = client
      .db("SC")
      .collection("Reviews", function (err, collection) {
        console.log("insideeeeeeeee", client);

        collection.find().toArray(function (err, items) {
          if (err) throw err;
          console.log("result is an array :: ", typeof items);
          res.send(items);
        });
      });
    client.close();
  });
});

router.get("/insertReviews", function (req, res) {
  const client = new MongoClient(
    mongodb,

    { useNewUrlParser: true }
  );
  console.log("clientclientclientclient", client);

  client.connect((err) => {
    const collection = client
      .db("SC")
      .collection("Reviews", function (err, collection) {
        collection.insertOne({
          id: 1,
          userInfo: "John Doe - Baltimore, MD",
          comment:
            "Services from Smart Connect are amazing and very professional. Best part is that they came, they repaired and they left without me getting any nusciance. Neat and clean. Highly Recommended",
        });

        res.send("items inserted successfully");
      });
    // perform actions on the collection object

    console.log("1111111111111111111111111", collection);
    client.close();
  });
});

router.put("/saveServiceRequest", [auth], function (req, res) {
  console.log("storing request", req.body);
  MongoClient.connect(mongodb, function (err, client) {
    var db = client.db("mydb");
    db.collection("ServiceRequests", function (err, collection) {
      collection.insertOne({
        appliance: req.body.appliance,
        underWarrenty: req.body.underWarrenty,
        issue: req.body.issue,
        additionalNotes: req.body.additionalNotes,
        dateOfService: req.body.dateOfService,
        timeOfService: req.body.timeOfService,
        _userId: req.user._id,
      });
    });
  });
  res.send("service request inserted successfully");
});

router.put("/editServiceRequest", [auth], function (req, res) {
  console.log("storing request", req.body);
  MongoClient.connect(mongodb, function (err, client) {
    var db = client.db("mydb");
    db.collection("ServiceRequests", function (err, collection) {
      collection.update(
        { _id: ObjectId(req.body._id) },
        {
          appliance: req.body.appliance,
          underWarrenty: req.body.underWarrenty,
          issue: req.body.issue,
          additionalNotes: req.body.additionalNotes,
          dateOfService: req.body.dateOfService,
          timeOfService: req.body.timeOfService,
          _userId: req.user._id,
        },
        { upsert: true }
      );
    });
  });
  res.send("service request inserted successfully");
});

router.get("/schedule/history", [auth], function (req, res) {
  console.log("req.body._userId:: fetched from middleware/auth ", req.user._id);
  MongoClient.connect(mongodb, function (err, client) {
    var db = client.db("mydb");
    var collectionObj = db.collection("ServiceRequests");
    console.log("collectionObj ", collectionObj);
    collectionObj
      .find({ _userId: req.user._id })
      .toArray(function (err, serviceObjs) {
        if (err) throw err;
        if (!serviceObjs) {
          return res.status(400).send("No service requests");
        } else {
          console.log("result is an array :: ", typeof serviceObjs);
          res.send(serviceObjs);
        }
      });
  });
});

router.delete("/schedule/delete/:_id", [auth], function (req, res) {
  console.log(
    "req.body._userId:: fetched from middleware/auth ",
    req.params._id
  );
  MongoClient.connect(mongodb, function (err, client) {
    var db = client.db("mydb");
    db.collection("ServiceRequests", function (err, collection) {
      collection.remove({ _id: ObjectId(req.params._id) });
    });
  });
  res.send("service request deleted successfully");
});
module.exports = router;
