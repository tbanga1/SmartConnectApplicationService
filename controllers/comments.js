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
  console.log("clientclientclientclient", client);
  client.connect((err) => {
    const db = client
      .db("SC")
      .collection("Reviews", function (err, collection) {
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
  const MongoClient = require("mongodb").MongoClient;
  let client = new MongoClient(mongodb, { useNewUrlParser: true });
  client.connect((err) => {
    const collection = client.db("SC").collection("Reviews");
    console.log("collectioncollectioncollectioncollection", collection);
    client.close();
  });

  client = new MongoClient(
    mongodb,
    {
      server: {
        // sets how many times to try reconnecting
        reconnectTries: Number.MAX_VALUE,
        // sets the delay between every retry (milliseconds)
        reconnectInterval: 1000,
      },
    },
    { useNewUrlParser: true }
  );
  console.log("clientclientclientclient", client);

  client.connect((err) => {
    const collection = client
      .db("SC")
      .collection("Reviews", function (err, collection) {
        collection.insert({
          id: 1,
          userInfo: "John Doe - Baltimore, MD",
          comment:
            "Services from Smart Connect are amazing and very professional. Best part is that they came, they repaired and they left without me getting any nusciance. Neat and clean. Highly Recommended",
        });
        collection.insert({
          id: 2,
          userInfo: "Anna Aston - Columbia, MD",
          comment:
            "Tech was on time on a Saturday morning. He diagnosed the problem quickly, ordered parts that day and was back on Monday afternoon to install the new parts. Quick and efficient service. Thank you.",
        });
        collection.insert({
          id: 3,
          userInfo: "Maria Kate - Laurel, MD",
          comment:
            "Cal was on time, professional and efficient with his time. He offered an appropriate level of explanation related to the repair effort and was conscientious about cleaning up a small amount of water released during repair. Great job.",
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
