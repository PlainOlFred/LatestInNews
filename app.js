const 
  express = require("express"),
  exphbs  = require('express-handlebars');
  mongojs = require("mongojs"),  //???
  axios = require("axios"),
  cheerio = require("cheerio"),
  mongoose = require("mongoose");

  const Article = require('./models/articleSchema');
  const Trailer = require('./models/trailerSchema');
  const Comment = require('./models/commentSchema');

const 
  app = express(),
  PORT = process.env.PORT || 3000;

app.use(express.static("public")); //???
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine('handlebars', exphbs({ defaultLayout: "main" }));
app.set('view engine', 'handlebars');
 

/*************************
   Mongoose ORM
**************************/
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
} );

// mongoose.connect("mongodb://localhost/latestInNews", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

const db = mongoose.connection;
db.on("error", error => console.log(`Database Error: ${error}`));



/*************************
 ***DATABASE CONNCECTED***
**************************/
db.once("open", () => {
  console.log("Database connection sucessful");


  /*************************
   HOME PAGE
  **************************/
  app.get('/', function (req, res) {
      res.render('home');


  });

  /*************************
    SCRAPE AND GET ARTICLES 
  **************************/
  app.get("/articles", (req, res) => {

    //ADD CHECK FOR ARTICLES ALREADY IF DB
  //check Headline and author
  /*************************
     SCRAPING ARTICLES
  **************************/
  
    console.log("*****Scarpping Articles from Cinemblend *****");
    axios.get("https://www.cinemablend.com/news.php").then(response => {
      const $ = cheerio.load(response.data);
      $("div.story_item").each((i, element) => {
        let 
          postType = 'article',
          headline = $(element)
            .children("a")
            .attr("title"),
          summary = $(element)
            .children("div.content")
            .children("div.story_summary")
            .children("p")
            .text(),
          url = $(element)
            .children("a")
            .attr("href"),
          author = $(element)
            .children("div.author")
            .children(".story_author")
            .text(),
          date = $(element)
            .children(".author")
            .children(".story_published")
            .text(),
          img = $(element)
            .children("a")
            .children("img")["0"].attribs.src;

        if (headline && summary && url && author && date && img && postType) {

          let newArticleObj = {
            headline,
            summary,
            url,
            postType
          } 

    
          Article.findOneAndUpdate({url},newArticleObj,{upsert: true})
            .then(article => console.log(article))
            .catch(err => console.log(err))  
        }
      });
    });
  

    /*************************
       GETTING ARTICLES
    **************************/
    Article.find({}, function (err, articles){
      
      if (err) {
        console.log(err)
      } else {
         let hbsObject = {
            articles
          };
          console.log("Here" + hbsObject.articles);
          res.render("index", hbsObject)
      }
    }); 
  });

  /*************************
     SCRAPE AND GET TRAILER 
  **************************/
  app.get("/trailers", (req, res) => {

    /*************************
       SCRAPING TRAILERS
    **************************/
    console.log("*****Scarpping Trailers from Cinemblend *****");
    axios.get("https://www.cinemablend.com/trailers/").then(response => {
      let $ = cheerio.load(response.data);
      $("div.story_item").each((i, element) => {
        let 
          postType = 'trailer',
          headline = $(element)
            .children("a")
            .attr("title"),
          summary = $(element)
            .children("div.content")
            .children("div.story_summary")
            .children("p")
            .text(),
          url = $(element)
            .children("a")
            .attr("href"),
          author = $(element)
            .children("div.author")
            .children(".story_author")
            .text(),
          date = $(element)
            .children(".author")
            .children(".story_published")
            .text(),
          img = $(element)
            .children("a")
            .children("img")["0"].attribs.src;

        if (headline && summary && url && author && date && img && postType) {
         
          let newTrailerObj = {
            headline,
            summary,
            url,
            postType
          } 
        Trailer.findOneAndUpdate({url},newTrailerObj,{upsert: true})
          .then(trailer => console.log(trailer))
          .catch(err => console.log(err));
        }
      });
    });
  
    Trailer.find({}, (err, trailers) => {
       if (err) {
        console.log(err)
      } else {
         let hbsObject = {
            trailers
          };
          console.log("Here" + hbsObject.trailers);
          res.render("index", hbsObject)
      }
    });
  });




  /*************************
  *****COMMENT PAGE*********
  **************************/

 /*************************
     Display Comments 
  **************************/
 app.get("/comments/:postType/:postId", (req, res) => {
   

   let postType = req.params.postType;
   let postId = req.params.postId;
   let hbsObject = {};
  
   
   switch(postType) {
     case 'article':
      Article.find({_id: postId} , function (err, post){
        if (err) {
          console.log(err)
        } else {
          hbsObject.post = post;
          // res.render("comments", hbsObject)
        } 
      });
      break;
    
    case 'trailer':
      Trailer.find({_id: postId} , function (err, post){
        if (err) {
          console.log(err)
        } else {
          hbsObject.post = post;
            // res.render("comments", hbsObject)
        }
        
      });

      break;
    default:
      console.log('no page')
   }


   Comment.find({post_id: postId}, /*null, {sort: {timestate: -1}}, */ function (err, comments) {
    if (err) {
          console.log(err)
        } else {
          hbsObject.comments = comments;
           console.log(hbsObject); 
          res.render("comments", hbsObject)
        }
  })
 })

/*************************
     Create Comments 
  **************************/
 app.post("/api/comments/", (req,res) => {
   let 
    post_id = req.body.post_id,
    user_id = 'DEFAULT USER',
    text = req.body.user_comment;

  console.log("posting comment");
  
  
  //  let comment = new Comment({user_id, text, post_id});
  //  comment.save(function(err, comment) {
  //    err ? console.error(err) : console.log(comment)
  //  })

    let newCommentObj = {
            user_id,
            text,
            post_id
          } 
    Comment.create(newCommentObj)
      .then(comment => {
        console.log("Here is a new comment"+comment);
      })
      .then(() => res.redirect('back'))
      .catch(err => console.log(err));

 })

/*************************
    Delete Comment 
  **************************/
app.get("/api/comments/delete/:postId", (req, res) => {
  let postId = req.params.postId;

  console.log("deleting comment" + postId);

  Comment.deleteOne({_id: postId})
    .then(() => res.redirect('back'))
    .catch(err => console.log(err));


})

/*************************
 *****Server STARTED*****
**************************/
app.listen(PORT, () => {
  console.log(`App running on http://localhost:${PORT}`);
});

  
});


