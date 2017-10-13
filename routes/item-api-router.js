const express = require('express');
const multer = require('multer');
const ItemModel = require('../models/item-model');

const router = express.Router();

const myUploader =
  multer(
    {
      dest: __dirname + '/../public/uploads'
    }
  );

//   GET/api/items
router.get('/items', (req, res, next) => {
  ItemModel.find()
    .limit(20)
    .sort({_id: -1})
    .exec((err, recentItems) => {
      if (err) {
        console.log('Error finding the items', err);
        res.status(500).json({ errorMessage: 'Finding items went wrong 💩'});
        return;
      }
      res.status(200).json(recentItems);
    });
}); // GET / phones

// POST/api/items
router.post('/items', myUploader.single('itemImage'), (req, res, next) => {
  if(!req.user) {
    res.status(401).json({ errorMessage: 'Not logged in'});
    return;
  }

  const theItem = new ItemModel({
    name: req.body.itemName,
    brand: req.body.itemBrand,
    value: req.body.itemValue,
    user: req.user._id
  })

  if (req.file) {
    theItem.image = '/uploads/' + req.file.filename;
  }

  theItem.save((err) => {
    if (theItem.errors) {
      res.status(400).json({
        errorMessage: 'Validation failed 😝',
        validationErrors: theItem.errors
      });
      return;
    }
    if (err) {
      console.log('Error Posting item', err);
      res.status(500).json({ errorMessage: 'New phone went wrong 💩'});
      return;
    }
    res.status(200).json(theItem);
  })
});

// GET/api/items/ID
router.get('/items/:itemId', (req, res, next) => {
  ItemModel.findById(
    req.params.itemId,
    (err, itemFromDb) => {
      if (err) {
        console.log("Item details ERROR");
        res.status(500).json({ errorMessage: 'Item details went wrong 👹'});
        return;
      }
      res.status(200).json(itemFromDb);
    }
  );
});

// PUT/api/items/ID
router.put('/items/:itemId', (req, res, next) => {
  ItemModel.findById(
    req.params.itemId,
    (err, itemFromDb) => {
      if (err) {
        console.log('Phone details ERROR', err);
        res.status(500).json({ errorMessage: 'Item details went wrong 👽'});
        return;
      }
      itemFromDb.set({
        name: req.body.itemName,
        brand: req.body.itemBrand,
        image: req.body.itemImage,
        value: req.body.value
      });

      itemFromDb.save((err) => {
        if (itemFromDb.errors) {
          res.status(400).json({
            errorMessage: "Update validation failed 😭",
            validationErrors: itemFromDb.errors
          });
          return;
        }

        if (err) {
          console.log('Item update ERROR', err);
          res.status(500).json({ errorMessage: 'Item update went wrong 😦'});
          return;
        }
        res.status(200).json(itemFromDb);
      });
    }
  );
});

// DELETE/api/items/ID
router.delete('/items/:itemId', (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ errorMesage: 'Not logged in'});
    return;
  }
  ItemModel.findById(
    req.params.itemId,
    (err, itemFromDb) => {
      if (err) {
        console.log('Item owner confirm ERROR', err);
        res.status(500).json(
          { errorMessage: 'Item owner confirm went wrong 👾'}
        );
        return;
    }

    if (itemFromDb.user.toString() !== req.user._id.toString()) {
      res.status(403).json({ errorMessage: 'This item is not yours. 😼'});
      return;
    }

    ItemModel.findByIdAndRemove(
      req.params.itemId,
      (err, itemFromDb) => {
        if (err) {
            console.log('Item delete error', err);
            res.status(500).json({ errorMessage: 'Item delete went wrong'});
          }
          res.status(200).json(itemFromDb);
        }
      );
    }
  );
});

// PUT/items/auction/:itemId
router.put('/items/auction/:itemId', (req, res, next) => {
  var new_today = new Date();
  var new_tomorrow = new Date(new_today.getTime() + (24 * 60 * 60 * 1000));
                        //<= this is meant to change the 'auction status of the item'
  ItemModel.findById(
    req.params.itemId,
    (err, itemFromDb) => {
      if (err) {
        console.log("Error, the item couldn't be updated");
        res.status(500).json({ errorMessage: "Item details went wrong "});
        return;
      }

      if(itemFromDb.status) {
        res.status(400).json({ errorMessage: "The Item was allready in an auction" })
        return;

      }
      if(itemFromDb.user.toString() !== req.user._id.toString()) {
        res.status(400).json({ errorMessage: "The user is not the owner of the item"})
        return;
      }

      itemFromDb.set({
        status: true, // I just want to set to true when clicked | should I run a function to check if it has allready been clicked? if ... () {} etc?
        auctionVal: itemFromDb.value * .50,  //
        finalDate: new_tomorrow
      });
      itemFromDb.save((err) => {
        if (itemFromDb.errors) {
          res.status(400).json({
            errorMessage: "Update validation failed ",
            validationErrors: itemFromDb.errors
          });
          return;
        }
        if (err) {
          console.log('Item update ERROR', err);
          res.status(500).json({ errorMessage: 'Item update went wrong'});
          return;
        }
        res.status(200).json(itemFromDb);
      });
    }
  )
});

// PUT/items/bid/:itemId
router.put('/items/bid/:itemId', (req, res, next) => {
  // var bidAmount = req.body.bidAmount;
  if (req.body.bidAmount > req.user.credits) {
    res.status(400).json({errorMessage: "Not enough credits"});
    return;
  }
  ItemModel.findById(
    req.params.itemId,
    (err, itemFromDb) => {
      if (err) {
        console.log("Error, couldn't submit the bidding");
        res.status(500).json({ errorMessage: "Item details went wrong"});
        return;
      }
      if (req.body.bidAmount < itemFromDb.auctionVal) {
        res.status(400).json({errorMessage: "Current bid is not a valid bid"})
        return;
      }
      itemFromDb.set({
      auctionVal: req.body.bidAmount
      });
      itemFromDb.save((err) => {
        if (itemFromDb.errors) {
          res.status(400).json({
            errorMessage: 'Bid Submission Saving failed',
            validationErrors: itemFromDb.errors
          });
          return;
        }
        if(err) {
          console.log("Bid update Error", err);
          res.status(500).json({ errorMessage: 'Item update went wrong'});
          return;
        }
        req.user.set({
          credits: req.user.credits - req.body.bidAmount
        });
        req.user.save((err) => {
          if(err) {
            console.log(err);
            console.log("User credits saving error");
            res.status(500).json({ errorMessage: 'User Credits went wrong'})
            return;
          }
          res.status(200).json(itemFromDb);
        })
      });
    }
  )
});

// my items route
router.get('/myitems', (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ errorMessage: 'Not logged in ☠️'});
    return;
  }
  ItemModel.find({ user: req.user._id})
    .sort({ _id: -1})
    .exec((err, myItemResults) => {
      if (err) {
        res.status(500).json(
          {errorMessage: 'My items went wrong 💀'}
        );
        return;
      }
      res.status(200).json(myItemResults);
    });
});

module.exports = router;
