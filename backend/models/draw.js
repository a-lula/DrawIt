const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DrawSchema = new Schema({
  image: { //IMGUR URL
    type: String,
    required: false
  },
  altID: {
    type: String,
    required: true
  },
  history: {
    type: [],
    required: false,
  }
});

const Draw = module.exports = mongoose.model("Draw", DrawSchema);