const path = require("path");

// Load wink-nlp
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
fastify.register(require("fastify-static"), {
  root: path.join(__dirname, "public"),
  prefix: "/", // optional: default '/'
});

// fastify-formbody lets us parse incoming forms
fastify.register(require("fastify-formbody"));

// point-of-view is a templating manager for fastify
fastify.register(require("point-of-view"), {
  engine: {
    handlebars: require("handlebars"),
  },
});

// Our main GET home page route, pulls from src/pages/index.hbs
fastify.get("/", function (request, reply) {
  // params is an object we'll pass to our handlebars template
  let params = {
    greeting: "Hello Node!",
  };
  // request.query.paramName <-- a querystring example
  reply.view("/src/pages/index.hbs", params);
});

// A POST route to handle form submissions
fastify.post("/", async function (request, reply) {
  let textGot = request.body.textTheyTyped;
  let sendBack = await findQuestions(textGot);
  let params = {
    results: sendBack,
  };
  //let testResult = nlp.string.sentences(testText);
  reply.view("/src/pages/results.hbs", params);
});

// Run the server and report out to the logs
fastify.listen(process.env.PORT, "0.0.0.0", function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
  fastify.log.info(`server listening on ${address}`);
});

async function findQuestions(text) {
  let questionList = "";
  // create the Wink doc of the text
  const doc = nlp.readDoc(text);
  let sentences = doc.sentences().out();
  console.log(sentences);
  let z = 10;
  for (const item in sentences) {
    console.log("In item number "  + z + " the final character is ");
    console.log(item.charAt(item.length - 1));
    
    // let notFound = true;
    //let a = 0;
    /*
    while (a < 4 && notFound) {
      if (item.charAt(item.length - a) == "?") {
        questionList += item;
        notFound = false;
      }
      a++;
    }
    */
  }
  //console.log(questionList);
  // return sentences[0];
  // return questionList;
  return sentences[0];
}

