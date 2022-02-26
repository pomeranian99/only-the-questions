const path = require("path");

// Load wink-nlp-utils
var nlp = require( 'wink-nlp-utils' );


// Require the fastify framework and instantiate it
const fastify = require("fastify")({
  // set this to true for detailed logging:
  logger: false
});

// Setup our static files
fastify.register(require("fastify-static"), {
  root: path.join(__dirname, "public"),
  prefix: "/" // optional: default '/'
});

// fastify-formbody lets us parse incoming forms
fastify.register(require("fastify-formbody"));

// point-of-view is a templating manager for fastify
fastify.register(require("point-of-view"), {
  engine: {
    handlebars: require("handlebars")
  }
});

// Our main GET home page route, pulls from src/pages/index.hbs
fastify.get("/", function(request, reply) {
  // params is an object we'll pass to our handlebars template
  let params = {
    greeting: "Hello Node!"
  };
  // request.query.paramName <-- a querystring example
  reply.view("/src/pages/index.hbs", params);
});

// A POST route to handle form submissions
fastify.post("/", async function(request, reply) {
  let textGot = request.body.textTheyTyped;
  let params = await findQuestions(textGot);
  //let params = {
  //  results: textGot
  // }
  
  let testText = "TThe historian of the English people asserts that what made Alfred great, small as was his sphere of action, was “the moral grandeur of his life. He lived solely for the good of his people.” He laid the foundations for a uniform system of law,[Pg 4] and he started schools, wishing that every free-born youth who had the means should “abide at his book till he can understand English writing.” He invited scholars from other lands to settle in England; but what most told on English culture was done not by them but by the king himself. ";
  let testResult = nlp.string.sentences(testText);
  console.log(testResult);
  
  reply.view("/src/pages/results.hbs", params);
});

// Run the server and report out to the logs
fastify.listen(process.env.PORT, '0.0.0.0', function(err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
  fastify.log.info(`server listening on ${address}`);
});


async function findQuestions(text) {
  let sentences = nlp.string.sentences(text);
  console.log(sentences);
  return sentences[3];
}