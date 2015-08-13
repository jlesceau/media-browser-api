var fs = require('fs'),
    tree = require('./tree.js'),
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
  var serie;

  if ((serie = matchEpisode(path)))
    return [ serie ];

  else if ((serie = matchSeason(path)))
    return serie;

  return false;
}

function matchEpisode(path, parent) {
  var episode = false,
      match;

  // S01E01
  if ((match = /(.+)s([0-9]+)e([0-9]+)/i.exec(path)))
    episode = {
      title: cleanTitle(match[1]),
      season: parseInt(match[2]),
      episode: parseInt(match[3])
    };
  // 1x01
  else if ((match = /(.+)\.[0-9]+x[0-9]+/i.exec(path)))
    episode = {
      title: cleanTitle(match[1]),
      season: parseInt(match[2]),
      episode: parseInt(match[3])
    };

  if (episode) {
    episode.pathToVideo = findVideo((parent || '') + path);

    if (episode.pathToVideo) {
      episode.size = size(episode.pathToVideo);
      episode.extension = /.*\.([^.]+)$/.exec(episode.pathToVideo)[1];
      episode.definition = findDefinition(episode.pathToVideo);
      episode.videoCodec = findVideoCodec(episode.pathToVideo);
      episode.audioCodec = findAudioCodec(episode.pathToVideo);
    }
  }

  return episode;
}

function matchSeason(path) {
  var episodes = [],
      epi;

  // S01 || S2014 || season.01 || season.2014
  if ((
    /(.+)s([0-9]{2,4})/i.exec(path) ||
    /(.+)season\.([0-9]{2,4})/i.exec(path)) &&
    fs.statSync(tree.get('topDirectory') + path).isDirectory()
  )
    fs.readdirSync(tree.get('topDirectory') + path).forEach(function(file) {
      epi = matchEpisode(file, path + '/');
      if (epi)
        episodes.push(epi);
    });

  if (episodes.length)
    return episodes;
  else
    return false;
}

function isMovie(path) {
  var movie = false,
      pathToVideo,
      match;

  if (
    (match = /(.+)([0-9]{4}).+(BluRay|BRRip|BDRip|DVDRip)/i.exec(path)) &&
    (pathToVideo = findVideo(path))
  )
    movie = {
      title: cleanTitle(match[1]),
      year: parseInt(match[2]),
      rip: match[3],
      videoCodec: findVideoCodec(path),
      audioCodec: findAudioCodec(path),
      definition: findDefinition(path),
      pathToVideo: pathToVideo,
      extension: /.*\.([^.]+)$/.exec(pathToVideo)[1],
      size: size(pathToVideo)
    };

  return movie;
}

function size(path) {
  var stats = fs.statSync(tree.get('topDirectory') + path);
  if (stats.isDirectory())
    return fs.readdirSync(tree.get('topDirectory') + path)
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
    .toLowerCase();
}

function findVideo(path) {
  if (fs.statSync(tree.get('topDirectory') + path).isDirectory())
    return fs.readdirSync(tree.get('topDirectory') + path)
        .reduce(function(prev, file) {
          var videoPath = findVideo(path + '/' + file);
          return videoPath ? videoPath : prev;
        }, false);
  else {
    if (
      videoExt.some(function(ext) {
        return ext === /.*\.([^.]+)$/.exec(path)[1];
      })
    )
      return path;
    else
      return false;
  }
}

function findDefinition(path) {
  if (path.match(/720p/i))
    return 'hd';
  else if (path.match(/1080p/i))
    return 'fhd';
  else
    return 'sd';
}

function findVideoCodec(path) {
  if (path.match(/xvid/i))
    return 'XviD';
  else if (path.match(/(x264|h264)/i))
    return 'x264';
  else if (path.match(/(x265|h265|HEVC)/i))
    return 'x265';
  else
    return 'Unknown';
}

function findAudioCodec(path) {
  if (path.match(/ac3/i))
    return 'AC3';
  else if (path.match(/DTS/i))
    return 'DTS';
  else 'mp3';
}

module.exports = function(path) {
  var episodes,
      movie;

  if ((episodes = isSerie(path))) {
    var objSerie;

    episodes.forEach(function(serie) {
      objSerie = tree.get('series').reduce(function(a,b) {
        return (b.title === serie.title) ? b : a;
      }, null);

      // Existing serie
      if (objSerie !== null) {
        var objSeason = objSerie.seasons.reduce(function(a,b) {
          return (b.number === serie.season) ? b : a;
        }, null);

        // Existing season
        if (objSeason !== null) {
          var objEpisode = objSeason.episodes.reduce(function(a,b) {
            return (b.number === serie.episode) ? b : a;
          }, null);

          // Existing episode
          if (objEpisode !== null) {
            objEpisode.files.push({
              path: path,
              pathToVideo: serie.pathToVideo,
              size: serie.size,
              definition: serie.definition,
              extension: serie.extension,
              codec: serie.codec
            });
          }
          // New episode
          else {
            objSeason.episodes.push({
              number: serie.episode,
              files: [{
                path: path,
                pathToVideo: serie.pathToVideo,
                size: serie.size,
                definition: serie.definition,
                extension: serie.extension,
                codec: serie.codec
              }]
            });
          }
        }
        // New season
        else {
          objSerie.seasons.push({
            number: serie.season,
            episodes: [{
              number: serie.episode,
              files: [{
                path: path,
                pathToVideo: serie.pathToVideo,
                size: serie.size,
                definition: serie.definition,
                extension: serie.extension,
                codec: serie.codec
              }]
            }]
          });
        }
      }
      // New serie
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
                definition: serie.definition,
                extension: serie.extension,
                codec: serie.codec
              }]
            }]
          }]
        });
      }
    });
  }
  else if ((movie = isMovie(path)))
    tree.get('movies').push(movie);
};
