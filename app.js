
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
mongoose.connect("mongodb://localhost/lastestInNews", {
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
    postType: String
  })

  const trailersSchema = new mongoose.Schema({
    headline: String,
    summary: String,
    url: String,
    postType: String
  });

  const CommentsSchema = new mongoose.Schema({
    user: {
      type: String,
      required: "Must have"
    },
    comment: String,
    type: String,
    targetID: {
      type: String,
      required: "Must have"
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

  /*************************
   HOME PAGE
  **************************/
  app.get('/', function (req, res) {
      res.render('home');
  });

  /*************************
    GET ARTICLES 
  **************************/
  app.get("/articles", (req, res) => {
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
     GET TRAILER 
  **************************/
  app.get("/trailers", (req, res) => {
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

  //ADD CHECK FOR ARTICLES ALREADY IF DB
  //check Headline and author
  /*************************
     SCRAPING ARTICLES
  **************************/
  app.get("/scrape-articles", (req, res) => {
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
  });
  /*************************
     SCRAPING TRAILERS
  **************************/
  app.get("/scrape-trailers", (req, res) => {
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
  });
});

/*************************
 *****Server STARTED*****
**************************/
app.listen(PORT, () => {
  console.log(`App running on http://localhost:${PORT}`);
});
