var express = require('express'),
    controller = require('./controller.js'),
    fs = require('fs');

module.exports = function(server) {
  server.get('/disk', controller.getDisk);

  // Series
  server.get('/series', controller.getSeries);
  server.get('/series/:serie_id/:season_id', controller.getSeason);
  server.get(
    '/series/:serie_id/:season_id/:episode_id/:file_id',
    controller.downloadEpisode
  );
  server.get(
    '/series/:serie_id/:season_id/:episode_id/:file_id/stream',
    controller.streamEpisode
  );

  // Movies
  server.get('/movies', controller.getMovies);
  server.get('/movies/:movie_id', controller.getMovie);
  server.get('/movies/:movie_id/dl', controller.downloadMovie);
  server.get('/movies/:movie_id/stream', controller.streamMovie);
};
