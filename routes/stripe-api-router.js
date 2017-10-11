const express = require('express');
const request = require('request');
const router  = express.Router();

router.post('/payment', (req, res, next) => {
  //user submitting payment
  // through form 'req.body._insert-word-here'
});

router.post('/payment/accepting/:userId', (req, res, next) => { // not user if it's done like this
    //backend revieves the payment and accepts it
    //substrackt token amount to user.
})



modules.export = router;
