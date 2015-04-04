var express = require('express'),
    controller = require('./controller.js');

module.exports = function(server) {
  server.get('/series', function (req, res) {
    res.send(controller.getSeries());
  });
  server.get('/series/:serie_id', function (req, res) {
    res.send(controller.getSerie(req.params.serie_id));
  });
  server.get('/series/:serie_id/:season_id', function (req, res) {
    res.send(controller.getSeason(req.params.serie_id, req.params.season_id));
  });
  server.get('/series/:serie_id/:season_id/:episode_id', function (req, res) {
    res.send(
      controller.getEpisode(
        req.params.serie_id,
        req.params.season_id,
        req.params.episode_id
      )
    );
  });
  server.get('/movies', function (req, res) {
    res.send(controller.getMovies());
  });
  server.get('/movies/:movie_id', function (req, res) {
    res.send(controller.getMovie(req.params.movie_id));
  });
};
