var express = require('express'),
    controller = require('./controller.js'),
    cors = require('cors'),
    fs = require('fs');

module.exports = function(server, whitelist) {
  server.use(cors({
    origin: function(origin, callback) {
      callback(null, whitelist.indexOf(origin) !== -1);
    }
  }));

  server.get('/disk', controller.getDisk);

  // Series
  server.get('/series', controller.getSeries);
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
  server.get('/movies/:movie_id/dl', controller.downloadMovie);
  server.get('/movies/:movie_id/stream', controller.streamMovie);
};
