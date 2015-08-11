var express = require('express'),
    chokidar = require('chokidar'),
    config = require('../conf/config.json'),
    routes = require('../controllers/routes.js'),
    controller = require('../controllers/controller.js'),
    tree = require('../controllers/tree.js'),
    watcher,
    server;

// Init the data tree
config.directory = config.directory.match(/\/$/) ?
  config.directory :
  config.directory + '/';

tree.set('topDirectory', config.directory);
tree.commit();
controller.fillTree();

watcher = chokidar.watch(config.directory, {
  ignored: /[\/\\]\./,
  ignoreInitial: true
});
watcher
  .on('add', function (path, stats) {
    controller.fillTree();
  })
  .on('change', function (path, stats) {
    controller.fillTree();
  })
  .on('unlink', function (path, stats) {
    controller.fillTree();
  });

server = express();

routes(server, config['client-ip-allowed']);

server.listen(config.port, function() {
  console.log('Listening on port ' + config.port);
});
