var path = require('path');
var fs = require('fs');
var test = require('tap').test;
var toVfile = require('to-vfile');
var styledoc = require('../');

test('basic', t => {
  var result = styledoc.extract([toVfile.readSync(path.join(__dirname, '/fixture/basic.css'))]);
  t.equal(result.length, 1, 'Returns one documentation group');
  t.end();
});

test('categories', t => {
  var result = styledoc.extract([toVfile.readSync(path.join(__dirname, '/fixture/categories.css'))]);
  fs.writeFileSync(path.join(__dirname, '../../test.json'), JSON.stringify(result, null, 2));
  t.end();
});
