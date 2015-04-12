var fs = require('fs'),
    tree = require('../data/tree.js');

function isSerie(path) {
  var serie = false;

  // S01E01
  if(path.match(/(.+)s[0-9]+e[0-9]+/i))
    serie = {
      title: /(.+)s[0-9]+e[0-9]+/i.exec(path)[1],
      season: /s([0-9]+)e[0-9]+/i.exec(path)[1],
      episode: /s[0-9]+e([0-9]+)/i.exec(path)[1],
      size: size(path)
    };
  // 1x01
  else if(path.match(/(.+)\.[0-9]+x[0-9]+/i))
    serie = {
      title: /(.+)\.[0-9]+x[0-9]+/i.exec(path)[1],
      season: /\.([0-9]+)x[0-9]+/i.exec(path)[1],
      episode: /\.[0-9]+x([0-9]+)/i.exec(path)[1],
      size: size(path)
    };
  // S01 || S2014
  else if(path.match(/(.+)s[0-9]{2,4}/i))
    serie = {
      title: /(.+)s[0-9]{2,4}/i.exec(path)[1],
      season: /s([0-9]{2,4})/i.exec(path)[1],
      episode: 0,
      size: size(path)
    };
  // Season.01 || Season.2014
  else if(path.match(/(.+)season\.[0-9]{2,4}/i))
    serie = {
      title: /(.+)season\.[0-9]{2,4}/i.exec(path)[1],
      season: /season\.([0-9]{2,4})/i.exec(path)[1],
      episode: 0,
      size: size(path)
    };

  if(serie) {
    serie.title = cleanTitle(serie.title);
    serie.season = parseInt(serie.season);
    serie.episode = parseInt(serie.episode);
  }

  return serie;
}

function isMovie(path) {
  return false;
}

function size(path) {
  var stats = fs.statSync(tree.get('topDirectory') + '/' + path);
  if(stats.isDirectory())
    return fs.readdirSync(tree.get('topDirectory') + '/' + path)
        .reduce(function(sum, file) {
          return sum + size(path + '/' + file);
        }, 0);
  else
    return stats.size;
}

function cleanTitle(title) {
  return title
      .replace(/[\.|_]/g, ' ')
      .trim()
      .toLowerCase()
      .split(' ')
      .map(function(w) {
        return w.charAt(0).toUpperCase() + w.substr(1);
      })
      .join(' ');
}

module.exports = function(path) {
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
          path: path,
          size: serie.size
        });
      }
      else {
        objSerie.seasons.push({
          number: serie.season,
          episodes: [{
            number: serie.episode,
            path: path,
            size: serie.size
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
            path: path,
            size: serie.size
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
