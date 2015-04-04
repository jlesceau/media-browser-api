var fs = require('fs'),
    serie = new Regex(''),
    movie = new Regex('');

function isSerie(path) {
  return path.match(serie);
}

function isMovie(path) {
  return path.match(movie);
}

function buildSerie(path) {
  return {
    path: path
  };
}

function buildMovie(path) {
  return {
    path: path
  };
}

module.exports = function(tree, path) {
  if(isSerie(path))
    tree.get('series').push(buildSerie(path));
  else if(isMovie(path))
    tree.get('movies').push(buildMovie(path));
  else
    tree.get('storage').push(path);
};
