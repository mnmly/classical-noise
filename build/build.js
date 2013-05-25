
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
  }

  if (require.aliases.hasOwnProperty(index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("classical-noise/index.js", Function("exports, require, module",
"// Ported from Stefan Gustavson's java implementation\n// http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf\n// Read Stefan's excellent paper for details on how this code works.\n//\n// Sean McCullough banksean@gmail.com\n\n/**\n * You can pass in a random number generator object if you like.\n * It is assumed to have a random() method.\n */\n\nmodule.exports = ClassicalNoise;\n\nfunction ClassicalNoise(r) { // Classic Perlin noise in 3D, for comparison \n  if (r == undefined) r = Math;\n  this.grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0], \n                [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1], \n                [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]]; \n  this.p = [];\n  for (var i=0; i<256; i++) {\n    this.p[i] = Math.floor(r.random()*256);\n  }\n  // To remove the need for index wrapping, double the permutation table length \n  this.perm = []; \n  for(var i=0; i<512; i++) {\n    this.perm[i]=this.p[i & 255];\n  }\n};\n\nClassicalNoise.prototype.dot = function(g, x, y, z) { \n  return g[0]*x + g[1]*y + g[2]*z; \n};\n\nClassicalNoise.prototype.mix = function(a, b, t) { \n  return (1.0-t)*a + t*b; \n};\n\nClassicalNoise.prototype.fade = function(t) { \n  return t*t*t*(t*(t*6.0-15.0)+10.0); \n};\n\n  // Classic Perlin noise, 3D version \nClassicalNoise.prototype.noise = function(x, y, z) { \n  // Find unit grid cell containing point \n  var X = Math.floor(x); \n  var Y = Math.floor(y); \n  var Z = Math.floor(z); \n  \n  // Get relative xyz coordinates of point within that cell \n  x = x - X; \n  y = y - Y; \n  z = z - Z; \n  \n  // Wrap the integer cells at 255 (smaller integer period can be introduced here) \n  X = X & 255; \n  Y = Y & 255; \n  Z = Z & 255;\n  \n  // Calculate a set of eight hashed gradient indices \n  var gi000 = this.perm[X+this.perm[Y+this.perm[Z]]] % 12; \n  var gi001 = this.perm[X+this.perm[Y+this.perm[Z+1]]] % 12; \n  var gi010 = this.perm[X+this.perm[Y+1+this.perm[Z]]] % 12; \n  var gi011 = this.perm[X+this.perm[Y+1+this.perm[Z+1]]] % 12; \n  var gi100 = this.perm[X+1+this.perm[Y+this.perm[Z]]] % 12; \n  var gi101 = this.perm[X+1+this.perm[Y+this.perm[Z+1]]] % 12; \n  var gi110 = this.perm[X+1+this.perm[Y+1+this.perm[Z]]] % 12; \n  var gi111 = this.perm[X+1+this.perm[Y+1+this.perm[Z+1]]] % 12; \n  \n  // The gradients of each corner are now: \n  // g000 = grad3[gi000]; \n  // g001 = grad3[gi001]; \n  // g010 = grad3[gi010]; \n  // g011 = grad3[gi011]; \n  // g100 = grad3[gi100]; \n  // g101 = grad3[gi101]; \n  // g110 = grad3[gi110]; \n  // g111 = grad3[gi111]; \n  // Calculate noise contributions from each of the eight corners \n  var n000= this.dot(this.grad3[gi000], x, y, z); \n  var n100= this.dot(this.grad3[gi100], x-1, y, z); \n  var n010= this.dot(this.grad3[gi010], x, y-1, z); \n  var n110= this.dot(this.grad3[gi110], x-1, y-1, z); \n  var n001= this.dot(this.grad3[gi001], x, y, z-1); \n  var n101= this.dot(this.grad3[gi101], x-1, y, z-1); \n  var n011= this.dot(this.grad3[gi011], x, y-1, z-1); \n  var n111= this.dot(this.grad3[gi111], x-1, y-1, z-1); \n  // Compute the fade curve value for each of x, y, z \n  var u = this.fade(x); \n  var v = this.fade(y); \n  var w = this.fade(z); \n   // Interpolate along x the contributions from each of the corners \n  var nx00 = this.mix(n000, n100, u); \n  var nx01 = this.mix(n001, n101, u); \n  var nx10 = this.mix(n010, n110, u); \n  var nx11 = this.mix(n011, n111, u); \n  // Interpolate the four results along y \n  var nxy0 = this.mix(nx00, nx10, v); \n  var nxy1 = this.mix(nx01, nx11, v); \n  // Interpolate the two last results along z \n  var nxyz = this.mix(nxy0, nxy1, w); \n\n  return nxyz; \n};\n//@ sourceURL=classical-noise/index.js"
));

