var postcss = require('postcss');
var doctrine = require('doctrine');

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
 * Find a tag in a doctrine-parsed comment.
 *
 * @param {Comment} entry - a documentation entry
 * @param {string} tagTitle - title of the tag to find
 * @return {?Object} tag
 */
function findTag(entry, tagTitle) {
  return entry.tags && entry.tags.find(function (tag) {
    return tag.title === tagTitle;
  });
}

/**
 * Returns all the rules, starting with a provided rule,
 * separated only by a newline.
 *
 * @param {Rule} rule PostCSS rule node
 * @return {Array<Rule>} The group of rules
 */
function getRuleGroup(rule) {
  var group = [rule];
  var nextNode = rule.next();
  while (nextNode.type === 'rule') {
    if (nextNode.raws.before !== '\n') {
      break;
    }
    group.push(nextNode);
    nextNode = nextNode.next();
  }
  return group;
}

/**
 * Group documentation, parsing comment nodes with doctrine
 * and attaching them to referenced code.
 *
 * @param {Array<Root>} roots parsed Root objects from postcss
 * @return {Array} raw parsed documentation
 */
function parseAndGroupDocs(roots) {
  var categories = {};
  var docs = [];

  roots.forEach(function (root) {
    root.walkComments(function (node) {
      if (node.text[0] !== '*') {
        return;
      }

      var entry = {};

      entry.parsedComment = postProcessComment(doctrine.parse(node.text, { unwrap: true }));

      var namespaceTag = findTag(entry.parsedComment, 'namespace');

      // Assuming that members come after their namespace ...

      var nextNode = node.next();

      if (namespaceTag !== undefined) {
        categories[namespaceTag.name] = entry;
        entry.members = [];

        if (nextNode && nextNode.type === 'rule') {
          getRuleGroup(nextNode).forEach(function (rule) {
            var ruleEntry = {
              parsedComment: {
                description: '',
                tags: [{
                  title: 'memberof',
                  description: namespaceTag.name
                }]
              },
              referencedSource: rule
            };
            entry.members.push(ruleEntry);
          });
        }

        return docs.push(entry);
      }

      if (nextNode.type !== 'comment') {
        entry.referencedSource = nextNode;
      }

      var memberofTag = findTag(entry.parsedComment, 'memberof');

      if (memberofTag !== undefined) {
        var parentCategory = categories[memberofTag.description];
        if (parentCategory === undefined) {
          throw new Error('The @namespace "' + memberofTag.description + '" has not been declared');
        }
        parentCategory.members.push(entry);
        return;
      }

      docs.push(entry);
    });
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
