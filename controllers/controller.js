var fs = require('fs'),
    diskspace = require('diskspace'),
    tree = require('./tree.js'),
    classify = require('../controllers/classify.js'),
    controller = {};

function fail(res, err, message) {
  res.statusCode = 500;
  res.send({
    result: null,
    message: ( message || '' ),
    error: err
  });
}

function success(res, result, message) {
  res.statusCode = 200;
  res.send({
    result: result,
    message: ( message || '' ),
    error: null
  });
}

controller.getDisk = function(req, res) {
  diskspace.check(
    tree.get('topDirectory'),
    function (err, total, free, status) {
      if (err)
        fail(res, err);
      else
        success(res, {
          total: total,
          free: free
        });
    }
  );
};

controller.resetTree = function() {
  tree.set('series', []);
  tree.set('movies', []);
  tree.set('storage', []);
  tree.commit();
};

controller.fillTree = function() {
  controller.resetTree();
  fs.readdir(tree.get('topDirectory'), function(err, files) {
    files.forEach(function(file) {
      classify(file);
    });
  });
};

// Series
controller.getSeries = function(req, res) {
  success(
    res,
    tree.get('series').map(function(serie) {
      return {
        title: serie.title,
        seasons: serie.seasons.map(function(season) {
          return season.number;
        })
      };
    })
  );
};
controller.downloadEpisode = function(req, res) {
  var episode;

  if ((
    episode = tree.get(
      'series',
      { title: req.params.serie_id },
      'seasons',
      { number: parseInt(req.params.season_id) },
      'episodes',
      { number: parseInt(req.params.episode_id) },
      'files',
      req.params.file_id,
      'pathToVideo'
    )
  ))
    res.download(tree.get('topDirectory') + episode);
  else
    fail(res, null, 'Episode not found');
};
controller.streamEpisode = function (req, res) {
  var episode;

  if ((
    episode = tree.get(
      'series',
      { title: req.params.serie_id },
      'seasons',
      { number: parseInt(req.params.season_id) },
      'episodes',
      { number: parseInt(req.params.episode_id) },
      'files',
      req.params.file_id,
      'pathToVideo'
    )
  )) {
    res.setHeader('content-type', 'video/mp4');
    fs.createReadStream(tree.get('topDirectory') + episode )
      .pipe(res);
  }
  else
    fail(res, null, 'Episode not found');
};

// Movies
controller.getMovies = function(req, res) {
  success(res, tree.get('movies'));
};
controller.downloadMovie = function(req, res) {
  var movie;

  if ((
    movie = tree.get(
      'movies',
      { title: req.params.movie_id },
      'pathToVideo'
    )
  ))
    res.download(tree.get('topDirectory') + movie);
  else
    fail(res, null, 'Movie not found');
};
controller.streamMovie = function (req, res) {
  var movie;

  if ((
    movie = tree.get(
      'movies',
      { title: req.params.movie_id },
      'pathToVideo'
    )
  )) {
    res.setHeader('content-type', 'video/mp4');
    fs.createReadStream(tree.get('topDirectory') + movie )
      .pipe(res);
  }
  else
    fail(res, null, 'Movie not found');
};

module.exports = controller;
