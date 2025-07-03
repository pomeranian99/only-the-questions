const path = require("path");
const fs = require("fs");

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

// Require the fastify framework and instantiate it
const fastify = require("fastify")({
  logger: false,
});

// Setup our static files
fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "../public"),
  prefix: "/",
});

// fastify-formbody lets us parse incoming forms
fastify.register(require("@fastify/formbody"));

// point-of-view is a templating manager for fastify
fastify.register(require("@fastify/view"), {
  engine: {
    handlebars: require("handlebars"),
  },
  root: path.join(__dirname, "../src/pages"),
});

// Our main GET home page route, pulls from src/pages/index.hbs
fastify.get("/", function (request, reply) {
  let params = {
    greeting: "Hello Node!",
  };
  reply.view("index.hbs", params);
});

// A POST route to handle form submissions
fastify.post("/", async function (request, reply) {
  let textGot = request.body.textTheyTyped;
  let sendBack = await findQuestions(textGot);
  let params = {
    results: sendBack,
  };
  reply.view("results.hbs", params);
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

// Export the fastify instance for Vercel
module.exports = async (req, res) => {
  await fastify.ready();
  fastify.server.emit('request', req, res);
};