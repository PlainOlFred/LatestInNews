const 
  express = require("express"),
  mongojs = require("mongojs"),
  axios = require("axios"),
  cheerio = require("cheerio"),
  mongoose = require("mongoose");

const
  app = express(),
  PORT = process.env.PORT || 3500;

app.use(express.static("public"));

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
    url: String
  })

  const trailersSchema = new mongoose.Schema({
    headline: String,
    summary: String,
    url: String
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
  app.get("/", (req, res) => {
    res.send("HomePage");
  });

  /*************************
    GET ARTICLES 
  **************************/
  app.get("/articles", (req, res) => {
    Article.find({}, (err, articles) => {
      err ? console.log(err) : res.send(articles);
    });
   
  });


 


  /*************************
     GET TRAILER 
  **************************/
  app.get("/trailers", (req, res) => {
    Trailer.find({}, (err, trailers) => {
      err ? console.log(err) : res.send(trailers);
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
        let headline = $(element)
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

        if (headline && summary && url && author && date && img) {
          let newArticle = new Article({ headline, summary, url });
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
        let headline = $(element)
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

        if (headline && summary && url && author && date && img) {
          let newTrailer = new Trailer({ headline, summary, url });

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
