const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const itemSchema = new Schema({
  name: {
    type: String,
    required: [true, 'What is the item\'s name?']
  },
  brand: {
    type: String,
    required: [true, 'Brand is required']
  },
  image: {
    type: String,
    required: [true, "Please provider and image for the item"]
  },
  value: {
    type: Number,
    required: [true, "Please enter an aproximated value for the item"]
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: Boolean
  },
  auctionVal: {
    type: Number
  },
  currentBid: {
    type: Number
  },
  currentBidder: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  auctionTime: {
    type: Number
  },
  finalDate: {
    type: Date
  }
});

const ItemModel = mongoose.model('Item', itemSchema);

module.exports = ItemModel;
