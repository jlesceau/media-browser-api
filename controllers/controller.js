var tree = require('../data/tree.js'),
    controller = {};

controller.getSeries = function() {
  return tree.get('series');
};
controller.getSerie = function(serie_id) {
  return {};
};
controller.getSeason = function(serie_id, season_id) {
  return {};
};
controller.getEpisode = function(serie_id, season_id, episode_id) {
  return {};
};
controller.getMovies = function() {
  return [];
};
controller.getMovie = function(movie_id) {
  return {};
};

module.exports = controller;
