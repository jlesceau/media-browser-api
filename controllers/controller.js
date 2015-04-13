var tree = require('../data/tree.js'),
    diskspace = require('diskspace'),
    controller = {};

controller.getDisk = function(callback) {
  diskspace.check(
      tree.get('topDirectory'),
      function (err, total, free, status) {
        callback({
          total: total,
          free: free
        });
      }
  );
};

controller.getSeries = function() {
  return tree.get('series');
};

controller.getSerie = function(serie_id) {
  return tree.get('series', { title: serie_id });
};

controller.getSeason = function(serie_id, season_id) {
  return tree.get('series',
      { title: serie_id },
      'seasons',
      { number: parseInt(season_id) }
    );
};
controller.getEpisode = function(serie_id, season_id, episode_id) {
  return tree.get('series',
      { title: serie_id },
      'seasons',
      { number: parseInt(season_id) },
      'episodes',
      { number: parseInt(episode_id) }
    );
};
controller.getMovies = function() {
  return tree.get('movies');
};
controller.getMovie = function(movie_id) {
  return tree.get('movies', { title: movie_id });
};

module.exports = controller;
