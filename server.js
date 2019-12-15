const 
  express = require('express'),
  mongojs = require('mongojs'),
  axios = require('axios'),
  cheerio = require('cheerio');

const app = express();

const 
  dbURL = 'lastestInNews',
  collections = ['articles']; // only on collection so far

const db = mongojs(dbURL, collections)
db.on("error", error => console.log(`Database Error: ${error}`));


console.log('*****Scarpping from Cinemblend *****');
axios.get('https://www.cinemablend.com/news.php').then(response => {
// axios.get('https://old.reddit.com/r/webdev/').then(response => {
  // console.log(response.data)
  let $ = cheerio.load(response.data)
  
  
  const results = [];
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
})