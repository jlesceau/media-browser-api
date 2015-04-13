var express = require('express'),
    controller = require('./controller.js'),
    fs = require('fs');

module.exports = function(server) {
  server.get('/disk', function (req, res) {
    controller.getDisk(function(disk) {
      res.send(disk);
    });
  });

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
  server.get(
    '/series/:serie_id/:season_id/:episode_id/:file_id',
    function (req, res) {
      res.download(
        controller.getEpisodeFile(
          req.params.serie_id,
          req.params.season_id,
          req.params.episode_id,
          req.params.file_id
        )
      );
    }
  );
  server.get(
    '/series/:serie_id/:season_id/:episode_id/:file_id/stream',
    function (req, res) {
      res.setHeader('content-type', 'video/mp4');
      fs.createReadStream(
        controller.getEpisodeFile(
          req.params.serie_id,
          req.params.season_id,
          req.params.episode_id,
          req.params.file_id
        )
      ).pipe(res);
    }
  );

  server.get('/movies', function (req, res) {
    res.send(controller.getMovies());
  });
  server.get('/movies/:movie_id', function (req, res) {
    res.send(controller.getMovie(req.params.movie_id));
  });
};
