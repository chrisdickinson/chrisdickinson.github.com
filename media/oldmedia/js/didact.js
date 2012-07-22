var Didact = window.Didact || {};

(function(exports) {
  var slice = Array.prototype.slice,
      EventEmitter = SimplEE.EventEmitter,
      $ = jQuery;

  Function.prototype.bind ||
   (Function.prototype.bind = function(to) {
      var args = slice.call(arguments, 1),
          self = this;
      return function() {
        self.apply(to, args.concat(slice.call(arguments)));
      };
   });

  var endpoints = {
    'tags':'http://github.com/api/v2/json/repos/show/{user}/{repo}/tags',
    'tree':'http://github.com/api/v2/json/tree/show/{user}/{repo}/{hash}',
    'file':'http://github.com/api/v2/json/blob/show/{user}/{repo}/{hash}{path}'
  },
  jsonp = [],
  jsonpReceiver = function(data) {
    jsonp.push(data); 
  },
  jsonpname = 'jsonp'+~~Math.random()*100;
  window[jsonpname] = jsonpReceiver;

  var githubRequest = function(endpoint, kwargs) {
    var ep = endpoints[endpoint]
        resolved = ep && ep.replace(/\{.*?\}/g, function(m) {
          return kwargs[m.slice(1,-1)];
        }),
        ee = new EventEmitter();

    if(resolved) {
      var script = document.createElement('script');
      script.src = resolved + '?callback=' + jsonpname;
      script.onload = function() {
        ee.emit('data', jsonp.pop());
        document.body.removeChild(script);
      }; 
      document.body.appendChild(script);
    } else {
      setTimeout(function() {
        ee.emit('error', new Error("Could not resolve endpoint "+endpoint));
      });
    }
    return ee;
  };

  var Tree = function(hash, name, parent, meta) {
    this.hash = hash;
    this.name = name;
    this.parent = parent;
    this.meta = meta || {};
    this.children = null;
    EventEmitter.call(this);
  };

  Tree.prototype = new EventEmitter();

  Tree.prototype.root = function() {
    var t = this;
    while(t.parent) {
      t = t.parent;
    }
    return t;
  };

  Tree.prototype.loadChildren = function(data) {
    this.children = [];

    data = data.sort(function(lhs, rhs) {
      if(lhs.type === rhs.type) {
        if(lhs.name < rhs.name) return -1;
        if(lhs.name > rhs.name) return 1;
        return 0;
      } else {
        if(lhs.type === 'tree') return -1;
        return 1;
      }
    });
    for(var i = 0, len = data.length; i < len; ++i) {
      var child = new Tree(data[i].sha, data[i].name, this, data[i]);
      this.emit('child', child);
      this.children.push(child);
    }
    return this.children;
  };

  Tree.prototype.load_tree = function() {
    var ee = new EventEmitter(),
        root = this.root();

    if(this.children) setTimeout(function() {
      ee.emit('ready', this);
    }.bind(this));
    else 
      githubRequest('tree', {user:root.USER, repo:root.REPO, hash:this.hash}).
        on('data', function(data) {
          this.loadChildren(data.tree);
          ee.emit('ready', this);
        }.bind(this)); 

    return ee;
  };

  Tree.prototype.load_blob = function() {
    var ee = new EventEmitter(),
        root = this.root();

    if(this.meta.data) setTimeout(function() {
        ee.emit('ready', this);
      }.bind(this));
    else
      githubRequest('file', {user:root.USER, repo:root.REPO, hash:this.parent.hash, path:'/'+this.name}).
        on('data', function(data) {
          if(data.blob) {
          this.meta.data = data.blob.data;
          ee.emit('ready', this);
          this.emit('ready', this);
          }
        }.bind(this));

    return ee;
  };

  Tree.prototype.load = function() {
    return this['load_'+(this.meta.type || 'tree')]();
  };

  Tree.prototype.name = function() {
    var names = [],
        t = this;

    while(t) {
      names.shift(t.name);
      t = t.parent;
    }

    return names.join('/');
  };

  Tree.prototype.childByName = function(name) {
    for(var i = 0, len = this.children.length; i < len && this.children[i].name !== name; ++i) {
      // no-op
    }
    return this.children[i];
  };

  Tree.prototype.navigate = function(path) {
    var bits = path.split('/'),
        ee = new EventEmitter(),
        t = this,
        recurse = function() {
          if(!bits.length) {
            ee.emit('ready', t);
          } else {
            var name = bits.shift(),
                child = t.childByName(name);
            child && child.load().on('ready', function(tree) {
              t = tree;
              recurse();
            });
	    if(name === '') {
	      t.load().on('ready', ee.emit.bind(ee, 'ready', t));
	    }
          }
        };
    setTimeout(recurse);
    return ee;
  };

  Tree.ROOTNAME = '';
  Tree.ROOT = null;

  var Renderer = function(browser, frame) {
    this.frame = frame;

    browser.on('root', function(tree) {
      var item = $('#tree_'+tree.hash);
      if(!item.length) {
        item = this.renderTree(tree);
      }

      var renderTree = function(child) {
        this.renderTree(child);
        child.on('child', arguments.callee.bind(this));
        child.on('ready', this.renderData.bind(this));
      }.bind(this);

      tree.on('child', renderTree);
      item.addClass('active');
    }.bind(this));

    browser.on('focus', function(tree, lines) {
      this.frame.find('.active').removeClass('active');
      var t = tree;
      while(t) {
        this.frame.find('#tree_'+t.hash).addClass('active');
        t = t.parent;
      }

    }.bind(this));
  };

  Renderer.prototype.renderData = function(tree) {
    var target = this.frame.find('#tree_'+tree.hash),
        bits = tree.meta.data.split('\n'),
	line_nos = [],
	lines = [];


    for(var i = 0, len = bits.length; i < len; ++i) {
      bits[i] = bits[i].replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
      line_nos.push('<span id="L'+(i+1)+'">'+(i+1)+'</span>');
      lines.push('<div class="line">'+(bits[i].length?bits[i]:'&nbsp;')+'</div>');
    }

    var html = '<table cellpadding="0" cellspacing="0"><tr><td><pre class="line_numbers">'+line_nos.join('\n')+'</pre></td><td width="100%"><pre>'+lines.join('')+'</pre></td></table>';
    target.html('<a href="#">..</a><br />'+html);
    target.find('a').click(function(ev) {
      ev.preventDefault();
      target.removeClass('active');
    });
  };

  Renderer.prototype.renderTree = function(tree) {
    var template = $('<li><a href="#">'+tree.name+'</a></li>'),
        targetStr = '<ul id="tree_'+tree.hash+'"></ul>',
        target;
  
    if(tree.meta.type === 'blob') {
      targetStr = targetStr.replace(/ul/g, 'div');
      template.addClass(tree.meta.mime_type.replace('/', '_'));
      template.addClass(tree.name.split('.').slice(-1)[0]);
    } else {
      template.addClass('directory');
    }

    target = $(targetStr);

    if(tree.parent) {
      $('#tree_'+tree.parent.hash).append(template);

      template.click(function(ev) {
        ev.preventDefault();
        tree.load().on('ready', target.addClass.bind(target, 'active'));
      });
      target.append($('<li class="directory"><a href="#">..</a></li>').click(function(ev) {
        ev.preventDefault();
        target.removeClass('active');
      }));
    }

    this.frame.append(target);
    return target; 
  };


  var Browser = function(username, repository) {
    githubRequest('tags', {user:username, repo:repository}).on('data', function(data) {
      this.tags = data.tags;
      this.emit('ready');
    }.bind(this));

    EventEmitter.call(this);
    this.user = username;
    this.repo = repository;
    this.trees = {};
    this.tree = null;
    this.renderer = new Renderer(this, $('#didact'));
  };

  Browser.prototype = new EventEmitter();

  Browser.prototype.setRoot = function(hash) {
    var ee = new EventEmitter();

    var continuation = function() {
      if((/^tag:/g).test(hash)) {
        hash = this.tags[hash.slice(4)];
      }

      if(this.trees[hash]) {
        setTimeout(ee.emit.bind(ee, 'tree', this.trees[hash]));
        this.tree = this.trees[hash]; 
      } else {
        githubRequest('tree', {user:this.user, repo:this.repo, hash:hash}).
          on('data', function(data) {
            this.tree = this.trees[hash] = new Tree(hash, Tree.ROOTNAME, Tree.ROOT);
            this.tree.REPO = this.repo;
            this.tree.USER = this.user;

            this.emit('root', this.tree);
            this.tree.loadChildren(data.tree);
            ee.emit('tree', this.tree);
          }.bind(this)).
          on('error', ee.emit.bind(ee, 'error'));
      }

      ee.on('tree', this.emit.bind(this, 'root'));
    }.bind(this);

    if(this.tags) continuation();
    else this.on('ready', continuation);

    return ee;
  };

  Browser.prototype.focus = function(hash, path, lines) {
    var ee = new EventEmitter();
    this.setRoot(hash).on('tree', function(tree) {
      tree.navigate(path)
        .on('ready', function(tree) {
          this.emit('focus', tree, lines);
          ee.emit('ready', tree);
        }.bind(this));
    }.bind(this));
    return ee;
  };

  Browser.prototype.setupScroll = function() {
    var didacts = $('[data-didact]'),
        doc = $(document),
        current = null,
        scrollposition = doc.scrollTop();

    var positions = [],
        len;

    didacts.each(function() {
      var $el = $(this);
      positions.push([scrollposition+$el.position().top, $el.attr('data-didact')]);
    });

    len = positions.length;
    var interval = setInterval(function() {
      var oldcurrent = current,
          callee = arguments.callee.bind(this);
      for(var i = 0; i < len; ++i) {
        var info = positions[i],
            off = info[0];

        if(off - scrollposition <= 0) {
          current = i;
        }
      }

      if(oldcurrent !== current) {
        var bits = positions[current][1].split(' '),
            hash = bits[0],
            path = bits[1].slice(1, -1),
            lines = bits[2].slice(1).split('-');

        clearInterval(interval);
        this.focus(hash, path, lines).on('ready',
          function() {
            interval = setInterval(callee, 150);
          });
      }
    }.bind(this), 150);

    doc.scroll(function() {
      scrollposition = doc.scrollTop();
    });
  };

  exports.Browser = Browser;
  exports.init = function(username, repository) {
    return new Browser(username, repository); 
  };
  exports.githubRequest = githubRequest;
})(Didact);
