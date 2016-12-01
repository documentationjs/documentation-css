var path = require('path');
var test = require('tap').test;
var toVfile = require('to-vfile');
var styledoc = require('../');

test('styledoc', t => {
  var result = styledoc.extract([toVfile.readSync(path.join(__dirname, '/fixture/basic.css'))]);
  t.equal(result.length, 1, 'Returns one documentation group');
  t.end();
});
