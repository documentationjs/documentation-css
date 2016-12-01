var postcss = require('postcss');
var doctrine = require('doctrine');

/*
 * Rules thus far:
 *
 * - You can never have two comments in a row
 */

function postProcessComment(comment) {
  var examples = comment.tags.filter(function (tag) {
    return tag.title === 'example';
  });
  if (examples.length > 1) {
    throw new Error('Only one @example tag is permitted');
  }
  if (examples.length === 1) {
    comment.example = examples[0];
  }
  return comment;
}

/**
 * Group documentation, parsing comment nodes with doctrine
 * and attaching them to referenced code.
 *
 * @param {Array} files parsed nodes from postcss
 * @return {Array} raw parsed documentation
 */
function parseAndGroupDocs(files) {
  var docs = [];

  files.forEach(function (file) {
    var nodes = file.nodes;
    for (var i = 0; i < nodes.length - 1; i++) {
      var node = nodes[i];

      if (node.type === 'comment' && node.text[0] === '*') {
        var parsedComment = postProcessComment(doctrine.parse(node.text, { unwrap: true }));

        if (nodes[i + 1].type === 'comment') {
          throw new Error('Unexpected comment after comment: comments should be followed by CSS');
        }

        var referencedSource = nodes[i + 1];

        docs.push({
          parsedComment: parsedComment,
          referencedSource: referencedSource
        });
      }
    }
  });

  return docs;

}

/**
 * Given CSS files as input, generate documentation
 *
 * @param {Array<{ contents: string, path: string }>} files CSS files
 * @return {Array<Array>} raw documentation
 */
function extract(files) {

  var parsedCSS = files.map(function (file) {
    return postcss.parse(file.contents, { from: file.path });
  });

  var groupedRawDocs = parseAndGroupDocs(parsedCSS);

  return groupedRawDocs;

}

module.exports.extract = extract;
