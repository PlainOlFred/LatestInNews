const mongoose = require("mongoose");

 const trailersSchema = new mongoose.Schema({
    headline: String,
    summary: String,
    url: String,
    postType: String,
    comments: Array
  });




const Trailer = mongoose.model("Trailer", trailersSchema);

module.exports = Trailer;
  