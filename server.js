const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');

// Load wink-nlp, the natural-language tool that we'll use to identify the sentences inside a piece of text
const winkNLP = require("wink-nlp");
// Load "its" helper to extract item properties.
const its = require("wink-nlp/src/its.js");
// Load "as" reducer helper to reduce a collection.
const as = require("wink-nlp/src/as.js");
// Load english language model — light version.
const model = require("wink-eng-lite-model");
// Instantiate winkNLP.
const nlp = winkNLP(model);

const app = express();

// Set up Handlebars as the view engine
app.engine('hbs', engine({ 
  extname: '.hbs',
  defaultLayout: false
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'src/pages'));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: "Hello from Vercel Express!" });
});

// Our main GET home page route
app.get('/', (req, res) => {
  const params = {
    greeting: "Hello Node!",
  };
  res.render('index', params);
});

// A POST route to handle form submissions
app.post('/', async (req, res) => {
  try {
    const textGot = req.body.textTheyTyped;
    const sendBack = await findQuestions(textGot);
    const params = {
      results: sendBack,
    };
    res.render('results', params);
  } catch (error) {
    console.error('Error processing form:', error);
    res.status(500).send('Error processing your request');
  }
});

async function findQuestions(text) {
  let questionList = "";
  // create the Wink doc of the text
  const doc = nlp.readDoc(text);
  // split it into sentences
  let sentences = doc.sentences().out();
  for (let a = 0; a < sentences.length; a++) {
    let notFound = true;
    let z = 0;
    while (z < 4 && notFound) {
      // if it's got a ? within four characters of the end of the sentence, add it
      if (sentences[a].charAt(sentences[a].length - z) == "?") {
        questionList += sentences[a] + " ";
        notFound = false;
      }
      z++;
    }
  }
  return questionList;
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;