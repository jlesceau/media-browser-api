var fs = require('fs');

function isSerie(path) {
  var serie = false;

  if(path.match(/(.+)s[0-9]+e[0-9]+/i))
    serie = {
      title: /(.+)s[0-9]+e[0-9]+/i.exec(path)[1],
      season: /(.+)s[0-9]+e[0-9]+/i.exec(path)[2],
      episode: /(.+)s[0-9]+e[0-9]+/i.exec(path)[3]
    };
  else if(path.match(/(.+)\.[0-9]+x[0-9]+/i))
    serie = {
      title: /(.+)\.[0-9]+x[0-9]+/i.exec(path)[1],
      season: /(.+)\.[0-9]+x[0-9]+/i.exec(path)[2],
      episode: /(.+)\.[0-9]+x[0-9]+/i.exec(path)[3]
    };
  else if(path.match(/(.+)s[0-9]{2,4}/i))
    serie = {
      title: /(.+)s[0-9]{2,4}/i.exec(path)[1],
      season: /(.+)s[0-9]{2,4}/i.exec(path)[2],
      episode: 0
    };
  else if(path.match(/(.+)season\.[0-9]{2,4}/i))
    serie = {
      title: /(.+)season\.[0-9]{2,4}/i.exec(path)[1],
      season: /(.+)season\.[0-9]{2,4}/i.exec(path)[2],
      episode: 0
    };

  if(serie) {
    serie.title = serie.title.replace(/\./g, ' ').trim().toLowerCase();
    serie.season = parseInt(serie.season);
    serie.episode = parseInt(serie.episode);
  }

  return serie;
}

function isMovie(path) {
  return false;
}

module.exports = function(tree, path) {
  var serie = isSerie(path);

  if(serie) {
    var objSerie = tree.get('series').reduce(function(a,b) {
      return (b.title === serie.title) ? b : a;
    }, null);

    if(objSerie !== null) {
      var objSeason = objSerie.seasons.reduce(function(a,b) {
        return (b.number === serie.season) ? b : a;
      }, null);

      if(objSeason !== null) {
        objSeason.episodes.push({
          number: serie.episode,
          path: path
        });
      }
      else {
        objSerie.seasons.push({
          number: serie.season,
          episodes: [{
            number: serie.episode,
            path: path
          }]
        });
      }
    }
    else {
      tree.get('series').push({
        title: serie.title,
        seasons: [{
          number: serie.season,
          episodes: [{
            number: serie.episode,
            path: path
          }]
        }]
      });
    }
  }
  else if(isMovie(path))
    tree.get('movies').push(path);
  else
    tree.get('storage').push(path);
};
