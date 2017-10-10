const express = require('express');
const request = require('request');
const router  = express.Router();


// localhost:3000/prices/backpack
  // router.get('/prices/:queryTerm'
            // req.params.queryTerm

           // req.params.term
// localhost:3000/prices?term=backpack
  // router.get('/prices'


// request wallmart api data
router.get('/prices/:queryTerm', (req, res, next) => {
  var query = req.params.queryTerm;
  request(
    // console.log(req.query.search),
    'https://api.walmartlabs.com/v1/search?query='+ query + '&format=json&apiKey=mjtgxh3678gc5x2nzxu42fxj',

    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var dataFromWalmart = JSON.parse(body);
        // console.log(dataFromWalmart.items[0].salePrice);
        res.send(dataFromWalmart["items"]);
      } else {
        console.warn(error);
      }
    }
  );
});

router.get('/products/search', (req, res, next) => {
    res.render('variations-views/product-search.ejs');
});

// router.get('/products/search-results', (req, res, next) => {
//     const mySearchRegex = new RegExp(req.query.searchTerm, 'i');
//                                                  //         |
//     ProductModel.find(                           // ignore case
//       { name: mySearchRegex },
//       // |
//       // field from the schema to search
//       // (check the model)
//
//       (err, searchResults) => {
//           if (err) {
//               next(err);
//               return;
//           }
//
//           res.locals.lastSearch = req.query.searchTerm;
//           res.locals.listOfResults = searchResults;
//           res.render('variations-views/results.ejs');
//       }
//     );
// }); // close GET /products/search-results

module.exports = router;
