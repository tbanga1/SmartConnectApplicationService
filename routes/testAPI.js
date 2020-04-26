var express = require("express");
var router = express.Router();

router.get("/", function(req, res, next) {
  res.json({
    data:
      "Household appliances can play a major role in your overall comfort within your home. From dishwashers to freezers, these appliances can take care of a variety of items for us. While it can be easy to forget how much work our appliances do for us, it becomes clear very quickly when they break down. From piles of dishes to work through to melting ice, appliance problems can bring an onslaught of issues. Instead of trying to deal with the mess all on your own, book a service appointment with us for expert appliance repair service."
  });
});

module.exports = router;
