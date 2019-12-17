
const 
  express = require("express"),
  exphbs  = require('express-handlebars');
  mongojs = require("mongojs"),
  axios = require("axios"),
  cheerio = require("cheerio"),
  mongoose = require("mongoose");

const 
  app = express(),
  PORT = process.env.PORT || 3500;

app.use(express.static("public")); //???
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine('handlebars', exphbs({ defaultLayout: "main" }));
app.set('view engine', 'handlebars');
 

/*************************
   Mongoose ORM
**************************/
mongoose.connect("mongodb://localhost/latestInNews", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", error => console.log(`Database Error: ${error}`));


/*************************
 ***DATABASE CONNCECTED***
**************************/
db.once("open", () => {
  console.log("Database connection sucessful");

  /*************************
    SCHEMAS
  **************************/
  const articlesSchema = new mongoose.Schema({
    headline: String,
    summary: String,
    url: String,
    postType: String,
    comments: Array
  })

  const trailersSchema = new mongoose.Schema({
    headline: String,
    summary: String,
    url: String,
    postType: String,
    comments: Array
  });

  const commentsSchema = new mongoose.Schema({
    user_id: {
      type: String,
      required: "Must have" 
    },
    text: {
      type: String
    },
    post_id: {
      type: String
    }
    
  });

  const usersSchema = new mongoose.Schema({
    firstName: {
      type: String,
      trim: true,
      required: "Must have"
    },
    lasttName: {
      type: String, 
      trim: true,
      required: "Must have"
    },
    userName: {
      type: String,
      trim: true,
      required: "Must have"
    }
  });

  // can add methods to Schemas to handle data

  /*************************
    MODELS
  **************************/
  const Article = mongoose.model("Article", articlesSchema);
  const Trailer = mongoose.model("Trailer", trailersSchema);
  const Comment = mongoose.model("Comment", commentsSchema)

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
          let newArticle = new Article({ headline, summary, url, postType});
          // (err, inserted) => err ? console.log(err) : console.log(inserted);

          newArticle.save(function(err, newArticle) {
            err ? console.error(err) : console.log(newArticle);
          });
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
        res.render("home", hbsObject)
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
          let newTrailer = new Trailer({ headline, summary, url, postType});

          newTrailer.save((err, newTrailer) => {
            err ? console.error(err) : console.log(newTrailer);
          });
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
        res.render("home", hbsObject)
      }
    });
  });

  /*************************
     COMMENT PAGE
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
          console.log(hbsObject.post);
          // res.render("comments", hbsObject)
        }
        
      });
      
       break;
    case 'trailer':
      

       Trailer.find({_id: postId} , function (err, post){
      
        if (err) {
          console.log(err)
        } else {
          console.log(hbsObject)
            
          // res.render("comments", hbsObject)
        }
        
      });

      break;
    default:
      console.log('no page')
   }


   Comment.find({post_id: postId},  function (err, comments) {
    if (err) {
          console.log(err)
        } else {
          hbsObject.comments = comments;
            
           console.log(hbsObject); 
          res.render("comments", hbsObject)
        }

  })

  
 })

 app.post("/api/comments/", (req,res) => {
   let 
    post_id = req.body.post_id,
    user_id = 'USER DEFAULT',
    text = req.body.user_comment;

  console.log("posting comment");
  
  
   let comment = new Comment({user_id, text, post_id});

   comment.save(function(err, comment) {
     err ? console.error(err) : console.log(comment)
   })


 })

app.get("comments/:postId", (req, res) => {
  let postId = req.params.postId;

  

})

  
});

/*************************
 *****Server STARTED*****
**************************/
app.listen(PORT, () => {
  console.log(`App running on http://localhost:${PORT}`);
});
