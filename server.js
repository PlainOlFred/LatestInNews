const 
  express = require('express'),
  mongojs = require('mongojs'),
  axios = require('axios'),
  cheerio = require('cheerio'),
  mongoose = require('mongoose');
  

const 
  app = express(),
  PORT = process.env.PORT || 3500;

app.use(express.static('public'));

const 
  dbURL = 'lastestInNews',
  collections = ['articles', 'trailers']; 

const db = mongojs(dbURL, collections)
db.on("error", error => console.log(`Database Error: ${error}`));

/*************************
   HOME PAGE
**************************/
app.get('/', (req, res) => {
  res.send("HomePage")
})

/*************************
   GET ARTICLES 
**************************/
app.get('/articles', (req, res) => {
  db.articles.find({}, (err, data) => {
    err ? console.log(err) : res.send(data);
  })
})

/*************************
   GET TRAILER 
**************************/
app.get('/trailers', (req, res) => {
  db.trailers.find({}, (err, data) => {
    err ? console.log(err) : res.send(data);
  })

})

//ADD CHECK FOR ARTICLES ALREADY IF DB
//check Headline and author
/*************************
   SCRAPING ARTICLES
**************************/
app.get('/scrape-articles', (req, res) => {
  console.log('*****Scarpping Articles from Cinemblend *****');

  axios.get('https://www.cinemablend.com/news.php').then(response => {

    const $ = cheerio.load(response.data)

    $('div.story_item').each((i, element) => {

      let 
        headline = $(element)
          .children('a')
          .attr('title'),
        summary = $(element)
          .children('div.content')
          .children('div.story_summary')
          .children('p').text(),
        url = $(element)
          .children('a')
          .attr('href'), 
        author = $(element)
          .children('div.author')
          .children('.story_author').text(),    
        date = $(element)
          .children('.author')
          .children('.story_published').text(),
        img = $(element)
          .children('a')
          .children('img')['0']
          .attribs.src;

      
      if (headline && summary && url && author && date && img ) {
        db.articles.insert({
            headline,
            summary,
            url,
            author,
            date,
            img
        },
          (err, inserted) => err ? console.log(err) : console.log(inserted));
      }
      
    });
  })
})
/*************************
   SCRAPING TRAILERS
**************************/
app.get('/scrape-trailers', (req, res) => {
  console.log('*****Scarpping Trailers from Cinemblend *****');

  axios.get('https://www.cinemablend.com/trailers/').then(response => {

    let $ = cheerio.load(response.data)
    $('div.story_item').each((i, element) => {
      
      let 
        headline = $(element)
          .children('a')
          .attr('title'),
        summary = $(element)
          .children('div.content')
          .children('div.story_summary')
          .children('p').text(),
        url = $(element)
          .children('a')
          .attr('href'), 
        author = $(element)
          .children('div.author')
          .children('.story_author').text(),    
        date = $(element)
          .children('.author')
          .children('.story_published').text(),
        img = $(element)
          .children('a')
          .children('img')['0']
          .attribs.src;
   
      if (headline && summary && url && author && date && img ) {
        db.trailers.insert({
            headline,
            summary,
            url,
            author,
            date,
            img
        },
          (err, inserted) => err ? console.log(err) : console.log(inserted));
      }
    });
  })

})


app.listen(PORT, () => {console.log(`App running on http://localhost:${PORT}`)})