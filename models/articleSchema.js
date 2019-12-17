const mongoose = require("mongoose");



  const articlesSchema = new mongoose.Schema({
    headline: String,
    summary: String,
    url: String,
    postType: String,
    comments: Array
  })

 

const Article = mongoose.model("Article", articlesSchema);

module.exports = Article;
  
    
