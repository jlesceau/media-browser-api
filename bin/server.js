var express = require('express'),
    config = require('../conf/config.json'),
    routes = require('../controllers/routes.js'),
    classify = require('../controllers/classify.js'),
    tree = require('../data/tree.js'),
    fs = require('fs'),
    server;

// Init the data tree
fs.readdirSync(config.directory).forEach(function(file) {
  classify(tree, file);
});

server = express();

routes(server);

server.listen(config.port, function() {
  console.log('Listening on port ' + config.port);
});
