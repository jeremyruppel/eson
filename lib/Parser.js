
/**
 * Module dependencies.
 */

var fs = require('fs');

/**
 * Expose `Parser`.
 */

module.exports = Parser;

/**
 * Initialize a new `Parser`.
 *
 * @api public
 */

function Parser() {
  if (!(this instanceof Parser)) return new Parser;
  this.plugins = [];
}

/**
 * Use the given plugin `fn()`.
 *
 * @param {Function} fn
 * @return {Parser}
 * @api public
 */

Parser.prototype.use = function(fn){
  this.plugins.push(fn);
  return this;
};

/**
 * Return a clone of this `Parser`.
 *
 * @return {Parser}
 * @api public
 */

Parser.prototype.clone = function(){
  var clone = new Parser;
  this.plugins.forEach(function(plugin){
    clone.use(plugin);
  });
  return clone;
};

/**
 * Parse the JSON file at `path`.
 *
 * @param {String} path
 * @return {Object}
 * @api public
 */

Parser.prototype.read = function(path){
  this.path = path;
  if (!~path.indexOf('.json')) path += '.json';
  return this.parse(fs.readFileSync(path, 'utf8'));
};

/**
 * Parse the given `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

Parser.prototype.parse = function(str){
  var self = this
    , plugins = this.plugins
    , format = this.format;

  if (typeof str !== 'string') str = format.stringify(str);

  return format.parse(str, function(key, val){
    var plugin, ret;
    if ('' === key) return val;
    for (var i = 0, len = plugins.length; i < len; ++i) {
      plugin = plugins[i];
      ret = plugin(key, val, self);
      if (undefined != ret) val = ret;
    }
    return val;
  });
};

/**
 * The parser's serialization format.
 * By default, exposes the JSON API, but not the actual object,
 * so that individual methods may be overwritten.
 *
 * @api public
 */

Parser.prototype.format = {
  parse: JSON.parse,
  stringify: JSON.stringify
};
