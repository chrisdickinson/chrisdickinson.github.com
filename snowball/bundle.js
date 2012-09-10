(function(){var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var cached = require.cache[resolved];
    var res = cached? cached.exports : mod();
    return res;
};

require.paths = [];
require.modules = {};
require.cache = {};
require.extensions = [".js",".coffee"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        cwd = path.resolve('/', cwd);
        var y = cwd || '/';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            x = path.normalize(x);
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = path.normalize(x + '/package.json');
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key);
        return res;
    })(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

(function () {
    var process = {};
    
    require.define = function (filename, fn) {
        if (require.modules.__browserify_process) {
            process = require.modules.__browserify_process();
        }
        
        var dirname = require._core[filename]
            ? ''
            : require.modules.path().dirname(filename)
        ;
        
        var require_ = function (file) {
            var requiredModule = require(file, dirname);
            var cached = require.cache[require.resolve(file, dirname)];

            if (cached && cached.parent === null) {
                cached.parent = module_;
            }

            return requiredModule;
        };
        require_.resolve = function (name) {
            return require.resolve(name, dirname);
        };
        require_.modules = require.modules;
        require_.define = require.define;
        require_.cache = require.cache;
        var module_ = {
            id : filename,
            filename: filename,
            exports : {},
            loaded : false,
            parent: null
        };
        
        require.modules[filename] = function () {
            require.cache[filename] = module_;
            fn.call(
                module_.exports,
                require_,
                module_,
                module_.exports,
                dirname,
                filename,
                process
            );
            module_.loaded = true;
            return module_.exports;
        };
    };
})();


require.define("path",function(require,module,exports,__dirname,__filename,process){function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};
});

require.define("__browserify_process",function(require,module,exports,__dirname,__filename,process){var process = module.exports = {};

process.nextTick = (function () {
    var queue = [];
    var canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener
    ;
    
    if (canPost) {
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'browserify-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);
    }
    
    return function (fn) {
        if (canPost) {
            queue.push(fn);
            window.postMessage('browserify-tick', '*');
        }
        else setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    if (name === 'evals') return (require)('vm')
    else throw new Error('No such module. (Possibly not yet loaded)')
};

(function () {
    var cwd = '/';
    var path;
    process.cwd = function () { return cwd };
    process.chdir = function (dir) {
        if (!path) path = require('path');
        cwd = path.resolve(dir, cwd);
    };
})();
});

require.define("vm",function(require,module,exports,__dirname,__filename,process){module.exports = require("vm-browserify")});

require.define("/node_modules/vm-browserify/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {"main":"index.js"}});

require.define("/node_modules/vm-browserify/index.js",function(require,module,exports,__dirname,__filename,process){var Object_keys = function (obj) {
    if (Object.keys) return Object.keys(obj)
    else {
        var res = [];
        for (var key in obj) res.push(key)
        return res;
    }
};

var forEach = function (xs, fn) {
    if (xs.forEach) return xs.forEach(fn)
    else for (var i = 0; i < xs.length; i++) {
        fn(xs[i], i, xs);
    }
};

var Script = exports.Script = function NodeScript (code) {
    if (!(this instanceof Script)) return new Script(code);
    this.code = code;
};

Script.prototype.runInNewContext = function (context) {
    if (!context) context = {};
    
    var iframe = document.createElement('iframe');
    if (!iframe.style) iframe.style = {};
    iframe.style.display = 'none';
    
    document.body.appendChild(iframe);
    
    var win = iframe.contentWindow;
    
    forEach(Object_keys(context), function (key) {
        win[key] = context[key];
    });
     
    if (!win.eval && win.execScript) {
        // win.eval() magically appears when this is called in IE:
        win.execScript('null');
    }
    
    var res = win.eval(this.code);
    
    forEach(Object_keys(win), function (key) {
        context[key] = win[key];
    });
    
    document.body.removeChild(iframe);
    
    return res;
};

Script.prototype.runInThisContext = function () {
    return eval(this.code); // maybe...
};

Script.prototype.runInContext = function (context) {
    // seems to be just runInNewContext on magical context objects which are
    // otherwise indistinguishable from objects except plain old objects
    // for the parameter segfaults node
    return this.runInNewContext(context);
};

forEach(Object_keys(Script.prototype), function (name) {
    exports[name] = Script[name] = function (code) {
        var s = Script(code);
        return s[name].apply(s, [].slice.call(arguments, 1));
    };
});

exports.createScript = function (code) {
    return exports.Script(code);
};

exports.createContext = Script.createContext = function (context) {
    // not really sure what this one does
    // seems to just make a shallow copy
    var copy = {};
    if(typeof context === 'object') {
        forEach(Object_keys(context), function (key) {
            copy[key] = context[key];
        });
    }
    return copy;
};
});

require.define("/node_modules/shader.js/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {"main":"index.js"}});

require.define("shader.js",function(require,module,exports,__dirname,__filename,process){module.exports = createModule

function createModule(gl) {

  function GLShader(vertexSRC, fragmentSRC) {
    this._vertexSRC = vertexSRC
    this._fragmentSRC = fragmentSRC

    this._uniforms = 
    this._attributes =
    this._vertexHandle =
    this._fragmentHandle =
    this._handle = null

    this.compile()
  }

  var cons = GLShader
    , proto = cons.prototype

  cons.fromURLs = function(vertex_url, fragment_url, ready) {
    var xhr_vertex = new XMLHttpRequest
      , xhr_fragment = new XMLHttpRequest
      , vertexSRC 
      , fragmentSRC

    xhr_vertex.open('GET', vertex_url)
    xhr_fragment.open('GET', fragment_url)

    xhr_fragment.onreadystatechange =
    xhr_vertex.onreadystatechange = check_done

    xhr_vertex.send(null)
    xhr_fragment.send(null)

    function check_done() {
      if(this.readyState === 4) {
        if(this.status > 299 || this.status < 200) {
          return ready(new Error('non-200 response'))
        }

        if(this === xhr_vertex) vertexSRC = this.responseText
        if(this === xhr_fragment) fragmentSRC = this.responseText

        if(vertexSRC && fragmentSRC) {
          return ready(null, new GLShader(vertexSRC, fragmentSRC))
        }      
      }
    }
  }

  cons.fromIds = function(vertex_id, fragment_id, ready) {
    var vertex_el = document.getElementById(vertex_id)
      , fragment_el = document.getElementById(fragment_id)

    return ready(null, new GLShader(text(vertex_el), text(fragment_el)))

    function text(el) {
      var data = []
      for(var i = 0, len = el.childNodes.length; i < len; ++i) {
        data.push(el.childNodes[i].data)
      }

      return data.join('')
    }
  }

  proto.vertex = function(_) {
    if(_) {
      if(this._vertexHandle) {
        gl.deleteShader(this._vertexHandle)
        this._vertexHandle = null
      }
      this._vertexSRC = _
      this.compile()
    }
    return this._vertexSRC
  }

  proto.fragment = function(_) {
    if(_) {
      if(this._fragmentHandle) {
        gl.deleteShader(this._fragmentHandle)
        this._fragmentHandle = null
      }
      this._fragmentSRC = _
      this.compile()
    }
    return this._fragmentSRC
  }

  proto.handle = function() {
    return this._handle
  }

  proto.compile = function() {
    var handle = this.handle()
      , attributes = {}
      , uniforms = {}

    if(this._fragmentSRC && !this._fragmentHandle) {
      this._fragmentHandle = gl.createShader(gl.FRAGMENT_SHADER)
      gl.shaderSource(this._fragmentHandle, this._fragmentSRC)
      gl.compileShader(this._fragmentHandle)
    }

    if(this._vertexSRC && !this._vertexHandle) {
      this._vertexHandle = gl.createShader(gl.VERTEX_SHADER)
      gl.shaderSource(this._vertexHandle, this._vertexSRC)
      gl.compileShader(this._vertexHandle)
    }

    if(handle) {
      gl.deleteProgram(handle)
    }

    handle = gl.createProgram()
    gl.attachShader(handle, this._vertexHandle)
    gl.attachShader(handle, this._fragmentHandle)
    gl.linkProgram(handle)

    this._handle = handle
    this.attachAttributes()
    this.attachUniforms()
  }

  proto.attachAttributes = function() {
    var rex = /\s*attribute\s*([\w\d]+)\s*([\w\d]+);/g
      , src = this._fragmentSRC + '\n' + this._vertexSRC
      , handle = this._handle
      , map = {}
      , attribs = {}
      , match
      , type
      , name

    map.float = 1
    map.vec2 = 2
    map.vec3 = 3
    map.vec4 = 4

    while(match = rex.exec(src)) {
      type = match[1]
      name = match[2]

      attribs[name] = [map[type], gl.getAttribLocation(handle, name)] 
    }

    this._attributes = attribs
  }

  proto.attachUniforms = function() {
    var rex = /\s*uniform\s*([\w\d]+)\s*([\w\d]+);/g
      , src = this._fragmentSRC + '\n' + this._vertexSRC
      , handle = this._handle
      , map = {}
      , uniforms = {}
      , match
      , type
      , name

    map.vec2 = 'uniform2fv'
    map.vec3 = 'uniform3fv'
    map.vec4 = 'uniform4fv'
    map.mat4 = 'uniformMatrix4fv'
    map.float = 'uniform1f'
    map.int = 'uniform1i'
    map.sampler2D = 'uniform1i'

    while(match = rex.exec(src)) {
      type = match[1]
      name = match[2]

      uniforms[name] = [map[type], gl.getUniformLocation(handle, name)] 
    }

    this._uniforms = uniforms
  }

  proto.uniform = function(name, val) {
    var meta = this._uniforms[name]
      , handle = this._handle
      , name = meta[0]
      , loc = meta[1]

    if(name === 'uniformMatrix4fv') {
      gl[meta[0]](meta[1], false, val)
    } else {
      gl[meta[0]](meta[1], val)
    }
  }

  proto.attribute = function(name, type, normalized, stride, offset) {
    var meta = this._attributes[name]
      , handle = this._handle

    gl.enableVertexAttribArray(meta[1])
    gl.vertexAttribPointer(meta[1], meta[0], type || gl.FLOAT, normalized || false, stride || 0, offset || 0) 
    gl.bindAttribLocation(handle, meta[1], name)
  }

  return GLShader
}
});

require.define("/node_modules/texture.js/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {"main":"lib/index.js"}});

require.define("/node_modules/texture.js/lib/index.js",function(require,module,exports,__dirname,__filename,process){module.exports = createModule

var GLOptions = require('./options')

function createModule(gl) {

  function GLTexture(dimensions, handle) {
    this.dimensions = dimensions
    this._handle = handle
  }

  var cons = GLTexture
    , proto = cons.prototype

  cons._defaults = new GLOptions({
    'wrap_width':   'clamp'
  , 'wrap_height':  'clamp'
  , 'mag':          'linear'
  , 'min':          'linear'
  }) 

  cons.defaults = function(opts) {
    return this._defaults = opts ? this._defaults.extend(opts) : this._defaults
  }

  cons.fromCanvas = 
  cons.fromImage = function(image, options, ready) {
    if(ready === undefined) {
      ready = options
      options = this.defaults()
    } else {
      options = this.defaults().extend(options)
    }

    var err = options.validate(image)
      , handle

    if(err) {
      return ready(err)
    }

    handle = gl.createTexture()

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
    gl.bindTexture(gl.TEXTURE_2D, handle)

    if(image.fb) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    } else {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image) 
    }

    options.toGL(gl, handle, image) 

    gl.bindTexture(gl.TEXTURE_2D, null)

    return ready(null, new this([image.width, image.height], handle))
  }

  cons.fromURL = function(url, opts, ready) {
    var self = this
      , img = new Image

    img.src = url
    img.onload = function() {
      self.fromImage(img, opts, ready)
    }

    img.onerror = function() {
      ready(new Error('Could not load texture from '+img.src))
    }
  }

  cons.create = function(dimensions, color, opts, ready) {
    var canvas = document.createElement('canvas')
      , ctx

    if(color === null) {
      return this.fromImage({width: dimensions[0], height: dimensions[1], fb:true}, opts, ready)
    }

    canvas.width = dimensions[0]
    canvas.height = dimensions[1]

    ctx = canvas.getContext('2d')

    ctx.fillStyle = color

    ctx.fillRect(0, 0, canvas.width, canvas.height)

    return this.fromCanvas(canvas, opts, ready) 
  }

  proto.handle = function() { 
    return this._handle
  }

  proto.createWriteStream = function(dx, dy, dw, dh) {
    return new GLTextureStream(
        this
      , 0
      , 0
      , 0
      , 0
      , dx || 0, dy || 0
      , dw || this.dimensions[0]
      , dh || this.dimensions[1]
    )
  }

  proto.writeImage = function(image, sx, sy, sw, sh, dx, dy, dw, dh) {
    var cvs = document.createElement('canvas')
      , ctxt
      , data
    
    gl.bindTexture(gl.TEXTURE_2D, this.handle())

    var width = this.dimensions[0]
      , height = this.dimensions[1]
      , dxw = dx + dw
      , dyh = dy + dh

    if(dw === sw && dh === sh && sx === 0 && sy === 0 && dxw <= width && dyh <= height) {
      // do a quick copy
      gl.texSubImage2D(gl.TEXTURE_2D, 0, dx, dy, gl.RGBA, gl.UNSIGNED_BYTE, image) 
      gl.bindTexture(gl.TEXTURE_2D, null)
      return
    }

    var sxw = sx + sw
      , syh = sy + sh

    cvs.width = Math.abs(dw)
    cvs.height = Math.abs(dh)

    ctxt = cvs.getContext('2d')

    ctxt.drawImage(image, sx, sy, sw, sh, 0, 0, cvs.width, cvs.height)

    var dims = [Math.max(0, dx), Math.max(0, dy), Math.min(width, cvs.width), Math.min(height, cvs.height)]

    if(dims[2] + dims[0] > width) {
      dims[2] = width - dims[0]
    }

    if(dims[3] + dims[1] > height) {
      dims[3] = height - dims[1]
    }

    data = ctxt.getImageData.apply(ctxt, [0, 0, dims[2], dims[3]])

    var out = new Uint8Array(data.data.length)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)

    gl.texSubImage2D(
        gl.TEXTURE_2D
      , 0
      , dims[0]
      , dims[1]
      , dims[2]
      , dims[3]
      , gl.RGBA
      , gl.UNSIGNED_BYTE
      , data.data
    )
    gl.bindTexture(gl.TEXTURE_2D, null)
  }

  proto.asFramebuffer = function() {
    var buf = gl.createRenderbuffer()
      , hnd = this.handle()

    gl.bindTexture(gl.TEXTURE_2D, hnd)
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer)
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.dimensions[0], this.dimensions[1])
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, hnd, 0)
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, buf)

    gl.bindTexture(gl.TEXTURE_2D, null)
    gl.bindRenderbuffer(gl.RENDERBUFFER, null)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    return buf
  }

  proto.enable = function(on) {
    on = on || 0

    gl.activeTexture(gl['TEXTURE'+on])
    gl.bindTexture(gl.TEXTURE_2D, this._handle)

    return on 
  }

  proto.width = function() {
    return this.dimensions[0]
  }

  proto.height = function() {
    return this.dimensions[1]
  }

  return GLTexture
}
});

require.define("/node_modules/texture.js/lib/options.js",function(require,module,exports,__dirname,__filename,process){module.exports = Options

function Options(opts) {
  this.opts = opts
}

var cons = Options
  , proto = cons.prototype

proto.map_values = {
    'repeat':   'REPEAT'
  , 'clamp':    'CLAMP_TO_EDGE'
  , 'mirror':   'MIRRORED_REPEAT'
  , 'linear':   'LINEAR'
  , 'nearest':  'NEAREST'
  , 'mipmap':   'LINEAR_MIPMAP_LINEAR'
}

proto.map_keys = {
    'mag':          ['TEXTURE_2D', 'TEXTURE_MAG_FILTER']
  , 'min':          ['TEXTURE_2D', 'TEXTURE_MIN_FILTER']
  , 'wrap_width':   ['TEXTURE_2D', 'TEXTURE_WRAP_S']
  , 'wrap_height':  ['TEXTURE_2D', 'TEXTURE_WRAP_T']
}

proto.toGL = function(gl) {
  var out = []
  for(var key in this.opts) {
    var value = this.map_values[this.opts[key]]
      , key = this.map_keys[key]

    key.push(value)

    for(var i = 0, len = key.length; i < len; ++i) {
      key[i] = typeof key[i] === 'string' ? gl[key[i]] : key[i]
    }

    gl.texParameteri.apply(gl, key)
  }

  if(this.opts.min === 'mipmap') {
    gl.generateMipmap(gl.TEXTURE_2D)
  }
}

proto.validate = function(img) {
  if(this.opts.min === 'mipmap') {
    if(this.opts.wrap_width !== 'clamp' || this.opts.wrap_height !== 'clamp') {
      return new Error('Cannot use mipmaps unless both wrap_height and wrap_width are set to clamp')
    }
  
    var npot = image.width !== image.height || (image.width & (image.width - 1)) !== 0

    if(npot) {
      return new Error('Cannot use a non-power of two texture with mipmaps.')
    }
  }
}

proto.extend = function(opts) {
  var out = {}
  for(var key in this.opts) {
    out[key] = this.opts[key]
  }

  for(var key in opts) {
    out[key] = opts[key]
  }

  return new Options(out)
}
});

require.define("/package.json",function(require,module,exports,__dirname,__filename,process){module.exports = {"main":"index.js"}});

require.define("/gensphere.js",function(require,module,exports,__dirname,__filename,process){var sin = Math.sin
  , cos = Math.cos
  , sqrt = Math.sqrt

module.exports = sphere

sphere.stitch = stitch

function sphere(radius, thetaResolution, phiResolution, stride, offset, buffer) {

  offset = offset || 0
  stride = stride || 0
  buffer = buffer || new Float32Array(thetaResolution * (phiResolution + 1) * 3)

  var idx = offset
    , thetaDelta = Math.PI * 2 / thetaResolution
    , phiDelta = Math.PI / phiResolution
    , pd

  for(var phi = 0; phi < phiResolution + 1; ++phi) {
    pd = phi * phiDelta
    for(var theta = 0; theta < thetaResolution; ++theta) {
      idx = point(buffer, idx, radius, pd, theta * thetaDelta - Math.PI / 2)
      idx += stride
    }
  }

  return buffer
}

function stitch(thetaResolution, phiResolution, buffer) {
  var max = thetaResolution * phiResolution
    , thetaResolution_2 = thetaResolution >>> 1
    , idx = 0
    , first
    , second
    , _

  buffer = buffer || new Uint16Array(max << 1 + 1)

  for(var j = 0; j < phiResolution; ++j) {
    for(var i = 0; i < thetaResolution_2; ++i) {
      buffer[idx++] = thetaResolution * j + i
      buffer[idx++] = (_ = thetaResolution * (j + 1) + i) < max + thetaResolution ? _ :
        thetaResolution - i
    }

    for(; i < thetaResolution; ++i) {
      buffer[idx++] = (_ = thetaResolution * (j + 1) + i) < max + thetaResolution ? _ :
        thetaResolution - i

      buffer[idx++] = thetaResolution * j + i
    }

  }

  buffer[idx++] = 0 

  return buffer

}

function point(buffer, idx, radius, phi, theta) {
  // x, y, z

  var x = cos(theta) * cos(phi)
    , y = cos(theta) * sin(phi)
    , z = sin(theta)

  var mag = sqrt(x * x + y * y + z * z)

  buffer[idx++] = x / mag * radius
  buffer[idx++] = y / mag * radius
  buffer[idx++] = z / mag * radius

  return idx
}
});

require.define("/index.js",function(require,module,exports,__dirname,__filename,process){
var canvas = document.createElement('canvas')
  , gl

canvas.height = window.innerHeight
canvas.width = window.innerWidth

document.body.appendChild(canvas)

gl = canvas.getContext('experimental-webgl')

var Shader = require('shader.js')(gl)
  , Texture = require('texture.js')(gl)

var theta = 360
  , phi = 180

var sphere = require('./gensphere')
  , buffer = sphere(0.5, theta, phi)
  , idx = sphere.stitch(theta, phi)
  , glbuf = gl.createBuffer()
  , indexbuf = gl.createBuffer()
  , texbuf = gl.createBuffer()
  , next = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame 
  , model = mat4.create()
  , perspective = mat4.create()

function texbufdata(thetaResolution, phiResolution) {

  var buffer = new Float32Array(thetaResolution * (phiResolution + 1) * 2)

  var idx = 0
    , thetaDelta = Math.PI * 2 / thetaResolution
    , phiDelta = Math.PI / phiResolution
    , pd
    , val

  for(var phi = 0; phi < phiResolution + 1; ++phi) {
    pd = phi / phiResolution
    for(var theta = 0; theta < thetaResolution >>> 1; ++theta) {
      val = theta / thetaResolution
      buffer[idx++] = pd / 2. 
      buffer[idx++] = 1.0 - val * 2.0
    }
    for(; theta < thetaResolution; ++theta) {
      val = 1.0 - theta / thetaResolution
      buffer[idx++] = pd / 2. + 0.5 
      buffer[idx++] = 1.0 - val * 2.0
    }
  }


  return buffer
}

Texture.fromURL('media/earth_day.jpg', gotDay)

function gotDay(err, day_texture) {

Texture.fromURL('media/earth_night.jpg', gotNight)

function gotNight(err, night_texture) {

Shader.fromURLs('vertex.vs', 'fragment.fs', gotShader)

function gotShader(err, shader) {
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexbuf)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW)

  gl.bindBuffer(gl.ARRAY_BUFFER, glbuf)
  gl.bufferData(gl.ARRAY_BUFFER, buffer, gl.STATIC_DRAW)

  gl.useProgram(shader.handle())
  gl.enable(gl.CULL_FACE)

  shader.uniform('model', model)

  day_texture.enable(0)
  night_texture.enable(1)

  shader.uniform('texture_day', 0)
  shader.uniform('texture_night', 1)

  shader.attribute('a_position')
  gl.bindBuffer(gl.ARRAY_BUFFER, texbuf)
  gl.bufferData(gl.ARRAY_BUFFER, texbufdata(theta, phi), gl.STATIC_DRAW)

  shader.attribute('a_texcoord')

  mat4.perspective(45, canvas.width / canvas.height, 0.1, 10, perspective)

  gl.clearColor(0, 0, 0, 1);
  next(function draw() {
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)

    mat4.identity(model)
    mat4.rotate(model, -Math.PI/2, [1.0, .0, 0.0])
    mat4.translate(model, [0.0, 2, 0, 0])
    mat4.rotate(model, Date.now() / 3333, [0.0, 0.0, 1.0])
    mat4.rotate(model, Math.PI/2 * Date.now() / 2000, [0.0, 0.0, 1.0])

    // 43200000
    shader.uniform('clock', (Date.now() % 4000) / 4000)
    shader.uniform('model', model)
    shader.uniform('perspective', perspective)
    gl.drawElements(gl.TRIANGLE_STRIP, idx.length, gl.UNSIGNED_SHORT, 0) 
    next(draw)
  }, canvas)
}
}
}
});
require("/index.js");
})();

