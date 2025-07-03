const path = require("path");

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
  // set this to true for detailed logging:
  logger: false,
});

// Setup our static files
fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "public"),
  prefix: "/", // optional: default '/'
});

// fastify-formbody lets us parse incoming forms
fastify.register(require("@fastify/formbody"));

// point-of-view is a templating manager for fastify
fastify.register(require("@fastify/view"), {
  engine: {
    handlebars: require("handlebars"),
  },
  root: path.join(__dirname, "src/pages"),
});

// Our main GET home page route, pulls from src/pages/index.hbs
fastify.get("/", function (request, reply) {
  // params is an object we'll pass to our handlebars template
  let params = {
    greeting: "Hello Node!",
  };
  // request.query.paramName <-- a querystring example
  reply.view("index.hbs", params);
});

// A POST route to handle form submissions
fastify.post("/", async function (request, reply) {
  let textGot = request.body.textTheyTyped;
  let sendBack = await findQuestions(textGot);
  let params = {
    results: sendBack,
  };
  //let testResult = nlp.string.sentences(testText);
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

// For Vercel serverless deployment
if (process.env.VERCEL) {
  module.exports = async (req, res) => {
    await fastify.ready();
    fastify.server.emit('request', req, res);
  };
} else {
  // Run the server locally
  const start = async () => {
    try {
      await fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' });
      console.log(`Your app is listening on port ${process.env.PORT || 3000}`);
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  };
  start();
}