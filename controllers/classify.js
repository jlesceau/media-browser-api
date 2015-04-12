var fs = require('fs'),
    tree = require('../data/tree.js'),
    videoExt = [
      'avi',
      'wmv',
      'mkv',
      'mka',
      'mks',
      'mp4',
      'mov',
      'flv'
    ];

function isSerie(path) {
  var serie = false;

  // S01E01
  if(path.match(/(.+)s[0-9]+e[0-9]+/i))
    serie = {
      title: /(.+)s[0-9]+e[0-9]+/i.exec(path)[1],
      season: /s([0-9]+)e[0-9]+/i.exec(path)[1],
      episode: /s[0-9]+e([0-9]+)/i.exec(path)[1]
    };
  // 1x01
  else if(path.match(/(.+)\.[0-9]+x[0-9]+/i))
    serie = {
      title: /(.+)\.[0-9]+x[0-9]+/i.exec(path)[1],
      season: /\.([0-9]+)x[0-9]+/i.exec(path)[1],
      episode: /\.[0-9]+x([0-9]+)/i.exec(path)[1]
    };

  if(serie) {
    serie.title = cleanTitle(serie.title);
    serie.season = parseInt(serie.season);
    serie.episode = parseInt(serie.episode);
    serie.size = size(path);
    serie.pathToVideo = findVideo(path);
    serie.definition = serie.pathToVideo ?
                          findDefinition(serie.pathToVideo) :
                          findDefinition(path);
  }

  return serie;
}

function isSeason(path) {

  // S01 || S2014
  if(path.match(/(.+)s[0-9]{2,4}/i))
    serie = {
      title: /(.+)s[0-9]{2,4}/i.exec(path)[1],
      season: /s([0-9]{2,4})/i.exec(path)[1],
    };
  // Season.01 || Season.2014
  else if(path.match(/(.+)season\.[0-9]{2,4}/i))
    serie = {
      title: /(.+)season\.[0-9]{2,4}/i.exec(path)[1],
      season: /season\.([0-9]{2,4})/i.exec(path)[1],
    };
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

function findVideo(path) {
  if(fs.statSync(tree.get('topDirectory') + '/' + path).isDirectory())
    return fs.readdirSync(tree.get('topDirectory') + '/' + path)
        .reduce(function(prev, file) {
          var videoPath = findVideo(path + '/' + file);
          return videoPath ? videoPath : prev;
        }, false);
  else {
    if(videoExt.some(function(ext) {
          return ext === /.*\.([^.]+)$/.exec(path)[1];
        }))
      return path;
    else
      return false;
  }
}

function findDefinition(path) {
  if(path.match(/720p/i))
    return 'hd';
  else if(path.match(/1080p/i))
    return 'fhd';
  else
    return 'sd';
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
        var objEpisode = objSeason.episodes.reduce(function(a,b) {
          return (b.number === serie.episode) ? b : a;
        }, null);

        if(objEpisode !== null) {
          objEpisode.files.push({
            path: path,
            pathToVideo: serie.pathToVideo,
            size: serie.size,
            definition: serie.definition
          });
        }
        else {
          objSeason.episodes.push({
            number: serie.episode,
            files: [{
              path: path,
              pathToVideo: serie.pathToVideo,
              size: serie.size,
              definition: serie.definition
            }]
          });
        }
      }
      else {
        objSerie.seasons.push({
          number: serie.season,
          episodes: [{
            number: serie.episode,
            files: [{
              path: path,
              pathToVideo: serie.pathToVideo,
              size: serie.size,
              definition: serie.definition
            }]
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
            files: [{
              path: path,
              pathToVideo: serie.pathToVideo,
              size: serie.size,
              definition: serie.definition
            }]
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
