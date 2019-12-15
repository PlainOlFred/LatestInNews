const 
  express = require('express'),
  mongojs = require('mongojs'),
  axios = require('axios'),
  cheerio = require('cheerio');

const 
  app = express(),
  PORT = process.env.PORT || 3500;

const 
  dbURL = 'lastestInNews',
  collections = ['articles']; // only on collection so far

const db = mongojs(dbURL, collections)
db.on("error", error => console.log(`Database Error: ${error}`));

app.get('/', (req, res) => {
  res.send("HomePage")
})

app.get('/scrape-articles', (req, res) => {
  console.log('*****Scarpping Articles from Cinemblend *****');

  const results = []; 

  axios.get('https://www.cinemablend.com/news.php').then(response => {

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
   
      results.push({
        i,
        headline,
        summary,
        url,
        author,
        date,
        img
      
      });
    });

    // Log the results once you've looped through each of the elements found with cheerio
    console.log(results[0]);
    res.json(results)
  })
  
})

app.get('/scrape-trailers', (req, res) => {
  console.log('*****Scarpping Trailers from Cinemblend *****');

  const results = []; 

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
   
      results.push({
        i,
        headline,
        summary,
        url,
        author,
        date,
        img
      
      });
    });

    // Log the results once you've looped through each of the elements found with cheerio
    console.log(results[0]);

    
    res.json(results)
  })


})


app.listen(PORT, () => {console.log(`App running on http://localhost:${PORT}`)})