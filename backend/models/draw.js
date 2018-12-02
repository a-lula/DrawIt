const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DrawSchema = new Schema({
  image: { //IMGUR URL
    type: String,
    required: true
  },
  altID: {
    type: String,
    required: true
  },
});

const Draw = module.exports = mongoose.model("Draw", DrawSchema);