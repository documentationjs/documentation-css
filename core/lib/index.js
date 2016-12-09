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

function parseComment(node) {
  return postProcessComment(doctrine.parse(node.text, { unwrap: true }));
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
 * Group documentation, parsing comment nodes with doctrine
 * and attaching them to referenced code.
 *
 * @param {Array<Root>} roots parsed Root objects from postcss
 * @return {Array} raw parsed documentation
 */
function getEntries(roots) {
  // Accumulates references to sections,
  // so we can add members to their members arrays
  var sections = {};

  // Lists all entries, in order
  var entries = [];

  function addEntry(entry) {
    // @memberof tags
    var memberofTag = findTag(entry.parsedComment, 'memberof');
    if (memberofTag !== undefined) {
      var parentCategory = sections[memberofTag.description];
      if (parentCategory === undefined) {
        throw entry.error('The section "' + memberofTag.description + '" has not been declared');
      }
      return parentCategory.members.push(entry);
    }

    entries.push(entry);
  }

  function addToGroup(group, node) {
    if (node === undefined) {
      return;
    }
    // Prevent this node from being revisited by processComment
    node.visited = true;

    if (node.type === 'rule') {
      group.members.push(node.selector);
      return addToGroup(group, node.next());
    }

    if (node.type === 'comment') {
      var parsedComment = parseComment(node);

      // @endgroup tags
      var endgroupTag = findTag(parsedComment, 'endgroup');
      if (endgroupTag !== undefined) {
        return;
      }
    }

    throw node.error('You should have ended your group');
  }

  function processComment(commentNode) {
    // In case this node was already visited as part of a group
    if (commentNode.visited) {
      return;
    }
    commentNode.visited = true;

    if (commentNode.text[0] !== '*') {
      return;
    }

    var entry = {};

    entry.node = commentNode;
    entry.parsedComment = parseComment(commentNode);

    // @section tags
    var sectionTag = findTag(entry.parsedComment, 'section');
    if (sectionTag !== undefined) {
      if (sections[sectionTag.description] !== undefined) {
        throw commentNode.error('The section "' + sectionTag.description + '" has already been declared');
      }
      sections[sectionTag.description] = entry;
      entry.type = 'section';
      entry.title = sectionTag.description;
      entry.members = [];
      return addEntry(entry);
    }

    // @group tags
    var groupTag = findTag(entry.parsedComment, 'group');
    if (groupTag !== undefined) {
      entry.type = 'group';
      entry.members = [];
      addToGroup(entry, commentNode.next());
      return addEntry(entry);
    }

    var endgroupTag = findTag(entry.parsedComment, 'endgroup');
    if (endgroupTag !== undefined) {
      throw commentNode.error('You cannot end a group you never started');
    }

    // Regular old members
    entry.type = 'member';
    var nextNode = commentNode.next();
    if (nextNode !== undefined && nextNode.type !== 'rule') {
      entry.referencedSource = nextNode;
    }
    addEntry(entry);
  }

  roots.forEach(function (root) {
    root.walkComments(processComment);
  });

  return entries;

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

  var groupedRawDocs = getEntries(parsedCSS);

  return groupedRawDocs;

}

module.exports.extract = extract;
