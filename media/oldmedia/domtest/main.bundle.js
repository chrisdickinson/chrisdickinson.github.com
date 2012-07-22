var require=function(a,b){var c=require.resolve(a,b||"/"),d=require.modules[c];if(!d)throw new Error("Failed to resolve module "+a+", tried "+c);var e=d._cached?d._cached:d();return e};require.paths=[],require.modules={},require.extensions=[".js",".coffee"],require._core={assert:!0,events:!0,fs:!0,path:!0,vm:!0},require.resolve=function(){return function(a,b){function g(a){if(require.modules[a])return a;for(var b=0;b<require.extensions.length;b++){var c=require.extensions[b];if(require.modules[a+c])return a+c}}function h(a){a=a.replace(/\/+$/,"");var b=a+"/package.json";if(require.modules[b]){var d=require.modules[b](),e=d.browserify;if(typeof e=="object"&&e.main){var f=g(c.resolve(a,e.main));if(f)return f}else if(typeof e=="string"){var f=g(c.resolve(a,e));if(f)return f}else if(d.main){var f=g(c.resolve(a,d.main));if(f)return f}}return g(a+"/index")}function i(a,b){var c=j(b);for(var d=0;d<c.length;d++){var e=c[d],f=g(e+"/"+a);if(f)return f;var i=h(e+"/"+a);if(i)return i}var f=g(a);if(f)return f}function j(a){var b;a==="/"?b=[""]:b=c.normalize(a).split("/");var d=[];for(var e=b.length-1;e>=0;e--){if(b[e]==="node_modules")continue;var f=b.slice(0,e+1).join("/")+"/node_modules";d.push(f)}return d}b||(b="/");if(require._core[a])return a;var c=require.modules.path();b=c.resolve("/",b);var d=b||"/";if(a.match(/^(?:\.\.?\/|\/)/)){var e=g(c.resolve(d,a))||h(c.resolve(d,a));if(e)return e}var f=i(a,d);if(f)return f;throw new Error("Cannot find module '"+a+"'")}}(),require.alias=function(a,b){var c=require.modules.path(),d=null;try{d=require.resolve(a+"/package.json","/")}catch(e){d=require.resolve(a,"/")}var f=c.dirname(d),g=(Object.keys||function(a){var b=[];for(var c in a)b.push(c);return b})(require.modules);for(var h=0;h<g.length;h++){var i=g[h];if(i.slice(0,f.length+1)===f+"/"){var j=i.slice(f.length);require.modules[b+j]=require.modules[f+j]}else i===f&&(require.modules[b]=require.modules[f])}},require.define=function(a,b){var c=require._core[a]?"":require.modules.path().dirname(a),d=function(a){return require(a,c)};d.resolve=function(a){return require.resolve(a,c)},d.modules=require.modules,d.define=require.define;var e={exports:{}};require.modules[a]=function(){return require.modules[a]._cached=e.exports,b.call(e.exports,d,e,e.exports,c,a),require.modules[a]._cached=e.exports,e.exports}},typeof process=="undefined"&&(process={}),process.nextTick||(process.nextTick=function(){var a=[],b=typeof window!="undefined"&&window.postMessage&&window.addEventListener;return b&&window.addEventListener("message",function(b){if(b.source===window&&b.data==="browserify-tick"){b.stopPropagation();if(a.length>0){var c=a.shift();c()}}},!0),function(c){b?(a.push(c),window.postMessage("browserify-tick","*")):setTimeout(c,0)}}()),process.title||(process.title="browser"),process.binding||(process.binding=function(a){if(a==="evals")return require("vm");throw new Error("No such module")}),process.cwd||(process.cwd=function(){return"."}),process.env||(process.env={}),process.argv||(process.argv=[]),require.define("path",function(a,b,c,d,e){function f(a,b){var c=[];for(var d=0;d<a.length;d++)b(a[d],d,a)&&c.push(a[d]);return c}function g(a,b){var c=0;for(var d=a.length;d>=0;d--){var e=a[d];e=="."?a.splice(d,1):e===".."?(a.splice(d,1),c++):c&&(a.splice(d,1),c--)}if(b)for(;c--;c)a.unshift("..");return a}var h=/^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;c.resolve=function(){var a="",b=!1;for(var c=arguments.length;c>=-1&&!b;c--){var d=c>=0?arguments[c]:process.cwd();if(typeof d!="string"||!d)continue;a=d+"/"+a,b=d.charAt(0)==="/"}return a=g(f(a.split("/"),function(a){return!!a}),!b).join("/"),(b?"/":"")+a||"."},c.normalize=function(a){var b=a.charAt(0)==="/",c=a.slice(-1)==="/";return a=g(f(a.split("/"),function(a){return!!a}),!b).join("/"),!a&&!b&&(a="."),a&&c&&(a+="/"),(b?"/":"")+a},c.join=function(){var a=Array.prototype.slice.call(arguments,0);return c.normalize(f(a,function(a,b){return a&&typeof a=="string"}).join("/"))},c.dirname=function(a){var b=h.exec(a)[1]||"",c=!1;return b?b.length===1||c&&b.length<=3&&b.charAt(1)===":"?b:b.substring(0,b.length-1):"."},c.basename=function(a,b){var c=h.exec(a)[2]||"";return b&&c.substr(-1*b.length)===b&&(c=c.substr(0,c.length-b.length)),c},c.extname=function(a){return h.exec(a)[3]||""}}),require.define("/node_modules/domnode/package.json",function(a,b,c,d,e){b.exports={}}),require.define("/node_modules/domnode/index.js",function(a,b,c,d,e){function h(a,b){var c=this;f.Stream.call(c),c.writable=!0,c.selector=document.querySelector(a),c.template=b}function i(a,b){return new h(a,b)}var f=a("stream"),g=a("util");g.inherits(h,f.Stream),h.prototype.createFragment=function(a){var b=document.createRange();return b.selectNode(document.body),b.createContextualFragment(a)},h.prototype.render=function(b){return this.mustache||(this.mustache=a("mustache")),this.mustache.to_html(this.template,b)},h.prototype.write=function(a){var b=this.render(a),c=this.createFragment(b);this.selector.appendChild(c)},h.prototype.end=function(){},typeof c!="undefined"&&(typeof b!="undefined"&&b.exports&&(c=b.exports=i),c=i)}),require.define("stream",function(a,b,c,d,e){function h(){f.EventEmitter.call(this)}var f=a("events"),g=a("util");g.inherits(h,f.EventEmitter),b.exports=h,h.Stream=h,h.prototype.pipe=function(a,b){function d(b){a.writable&&!1===a.write(b)&&c.pause&&c.pause()}function e(){c.readable&&c.resume&&c.resume()}function g(){if(f)return;f=!0,a._pipeCount--,j();if(a._pipeCount>0)return;a.end()}function h(){if(f)return;f=!0,a._pipeCount--,j();if(a._pipeCount>0)return;a.destroy()}function i(a){j();if(this.listeners("error").length===0)throw a}function j(){c.removeListener("data",d),a.removeListener("drain",e),c.removeListener("end",g),c.removeListener("close",h),c.removeListener("error",i),a.removeListener("error",i),c.removeListener("end",j),c.removeListener("close",j),a.removeListener("end",j),a.removeListener("close",j)}var c=this;c.on("data",d),a.on("drain",e),!a._isStdio&&(!b||b.end!==!1)&&(a._pipeCount=a._pipeCount||0,a._pipeCount++,c.on("end",g),c.on("close",h));var f=!1;return c.on("error",i),a.on("error",i),c.on("end",j),c.on("close",j),a.on("end",j),a.on("close",j),a.emit("pipe",c),a}}),require.define("events",function(a,b,c,d,e){process.EventEmitter||(process.EventEmitter=function(){});var f=c.EventEmitter=process.EventEmitter,g=typeof Array.isArray=="function"?Array.isArray:function(a){return Object.prototype.toString.call(a)==="[object Array]"},h=10;f.prototype.setMaxListeners=function(a){this._events||(this._events={}),this._events.maxListeners=a},f.prototype.emit=function(a){if(a==="error")if(!this._events||!this._events.error||g(this._events.error)&&!this._events.error.length)throw arguments[1]instanceof Error?arguments[1]:new Error("Uncaught, unspecified 'error' event.");if(!this._events)return!1;var b=this._events[a];if(!b)return!1;if(typeof b=="function"){switch(arguments.length){case 1:b.call(this);break;case 2:b.call(this,arguments[1]);break;case 3:b.call(this,arguments[1],arguments[2]);break;default:var c=Array.prototype.slice.call(arguments,1);b.apply(this,c)}return!0}if(g(b)){var c=Array.prototype.slice.call(arguments,1),d=b.slice();for(var e=0,f=d.length;e<f;e++)d[e].apply(this,c);return!0}return!1},f.prototype.addListener=function(a,b){if("function"!=typeof b)throw new Error("addListener only takes instances of Function");this._events||(this._events={}),this.emit("newListener",a,b);if(!this._events[a])this._events[a]=b;else if(g(this._events[a])){if(!this._events[a].warned){var c;this._events.maxListeners!==undefined?c=this._events.maxListeners:c=h,c&&c>0&&this._events[a].length>c&&(this._events[a].warned=!0,console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.",this._events[a].length),console.trace())}this._events[a].push(b)}else this._events[a]=[this._events[a],b];return this},f.prototype.on=f.prototype.addListener,f.prototype.once=function(a,b){var c=this;return c.on(a,function d(){c.removeListener(a,d),b.apply(this,arguments)}),this},f.prototype.removeListener=function(a,b){if("function"!=typeof b)throw new Error("removeListener only takes instances of Function");if(!this._events||!this._events[a])return this;var c=this._events[a];if(g(c)){var d=c.indexOf(b);if(d<0)return this;c.splice(d,1),c.length==0&&delete this._events[a]}else this._events[a]===b&&delete this._events[a];return this},f.prototype.removeAllListeners=function(a){return a&&this._events&&this._events[a]&&(this._events[a]=null),this},f.prototype.listeners=function(a){return this._events||(this._events={}),this._events[a]||(this._events[a]=[]),g(this._events[a])||(this._events[a]=[this._events[a]]),this._events[a]}}),require.define("util",function(a,b,c,d,e){function g(a){return a instanceof Array||Array.isArray(a)||a&&a!==Object.prototype&&g(a.__proto__)}function h(a){return a instanceof RegExp||typeof a=="object"&&Object.prototype.toString.call(a)==="[object RegExp]"}function i(a){if(a instanceof Date)return!0;if(typeof a!="object")return!1;var b=Date.prototype&&n(Date.prototype),c=a.__proto__&&n(a.__proto__);return JSON.stringify(c)===JSON.stringify(b)}function j(a){return a<10?"0"+a.toString(10):a.toString(10)}function l(){var a=new Date,b=[j(a.getHours()),j(a.getMinutes()),j(a.getSeconds())].join(":");return[a.getDate(),k[a.getMonth()],b].join(" ")}var f=a("events");c.print=function(){},c.puts=function(){},c.debug=function(){},c.inspect=function(a,b,d,e){function k(a,d){if(a&&typeof a.inspect=="function"&&a!==c&&(!a.constructor||a.constructor.prototype!==a))return a.inspect(d);switch(typeof a){case"undefined":return j("undefined","undefined");case"string":var e="'"+JSON.stringify(a).replace(/^"|"$/g,"").replace(/'/g,"\\'").replace(/\\"/g,'"')+"'";return j(e,"string");case"number":return j(""+a,"number");case"boolean":return j(""+a,"boolean")}if(a===null)return j("null","null");var l=m(a),o=b?n(a):l;if(typeof a=="function"&&o.length===0){if(h(a))return j(""+a,"regexp");var p=a.name?": "+a.name:"";return j("[Function"+p+"]","special")}if(i(a)&&o.length===0)return j(a.toUTCString(),"date");var q,r,s;g(a)?(r="Array",s=["[","]"]):(r="Object",s=["{","}"]);if(typeof a=="function"){var t=a.name?": "+a.name:"";q=h(a)?" "+a:" [Function"+t+"]"}else q="";i(a)&&(q=" "+a.toUTCString());if(o.length===0)return s[0]+q+s[1];if(d<0)return h(a)?j(""+a,"regexp"):j("[Object]","special");f.push(a);var u=o.map(function(b){var c,e;a.__lookupGetter__&&(a.__lookupGetter__(b)?a.__lookupSetter__(b)?e=j("[Getter/Setter]","special"):e=j("[Getter]","special"):a.__lookupSetter__(b)&&(e=j("[Setter]","special"))),l.indexOf(b)<0&&(c="["+b+"]"),e||(f.indexOf(a[b])<0?(d===null?e=k(a[b]):e=k(a[b],d-1),e.indexOf("\n")>-1&&(g(a)?e=e.split("\n").map(function(a){return"  "+a}).join("\n").substr(2):e="\n"+e.split("\n").map(function(a){return"   "+a}).join("\n"))):e=j("[Circular]","special"));if(typeof c=="undefined"){if(r==="Array"&&b.match(/^\d+$/))return e;c=JSON.stringify(""+b),c.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)?(c=c.substr(1,c.length-2),c=j(c,"name")):(c=c.replace(/'/g,"\\'").replace(/\\"/g,'"').replace(/(^"|"$)/g,"'"),c=j(c,"string"))}return c+": "+e});f.pop();var v=0,w=u.reduce(function(a,b){return v++,b.indexOf("\n")>=0&&v++,a+b.length+1},0);return w>50?u=s[0]+(q===""?"":q+"\n ")+" "+u.join(",\n  ")+" "+s[1]:u=s[0]+q+" "+u.join(", ")+" "+s[1],u}var f=[],j=function(a,b){var c={bold:[1,22],italic:[3,23],underline:[4,24],inverse:[7,27],white:[37,39],grey:[90,39],black:[30,39],blue:[34,39],cyan:[36,39],green:[32,39],magenta:[35,39],red:[31,39],yellow:[33,39]},d={special:"cyan",number:"blue","boolean":"yellow","undefined":"grey","null":"bold",string:"green",date:"magenta",regexp:"red"}[b];return d?"["+c[d][0]+"m"+a+"["+c[d][1]+"m":a};return e||(j=function(a,b){return a}),k(a,typeof d=="undefined"?2:d)};var k=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];c.log=function(a){},c.pump=null;var m=Object.keys||function(a){var b=[];for(var c in a)b.push(c);return b},n=Object.getOwnPropertyNames||function(a){var b=[];for(var c in a)Object.hasOwnProperty.call(a,c)&&b.push(c);return b},o=Object.create||function(a,b){var c;if(a===null)c={__proto__:null};else{if(typeof a!="object")throw new TypeError("typeof prototype["+typeof a+"] != 'object'");var d=function(){};d.prototype=a,c=new d,c.__proto__=a}return typeof b!="undefined"&&Object.defineProperties&&Object.defineProperties(c,b),c};c.inherits=function(a,b){a.super_=b,a.prototype=o(b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}})}}),require.define("/node_modules/domnode/node_modules/mustache/package.json",function(a,b,c,d,e){b.exports={main:"./mustache"}}),require.define("/node_modules/domnode/node_modules/mustache/mustache.js",function(a,b,c,d,e){var f=function(){function g(a){return String(a).replace(/&(?!\w+;)|[<>"']/g,function(a){return f[a]||a})}var a=Object.prototype.toString;Array.isArray=Array.isArray||function(b){return a.call(b)=="[object Array]"};var b=String.prototype.trim,c;if(b)c=function(a){return a==null?"":b.call(a)};else{var d,e;/\S/.test(" ")?(d=/^[\s\xA0]+/,e=/[\s\xA0]+$/):(d=/^\s+/,e=/\s+$/),c=function(a){return a==null?"":a.toString().replace(d,"").replace(e,"")}}var f={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},h={},i=function(){};return i.prototype={otag:"{{",ctag:"}}",pragmas:{},buffer:[],pragmas_implemented:{"IMPLICIT-ITERATOR":!0},context:{},render:function(a,b,c,d){d||(this.context=b,this.buffer=[]);if(!this.includes("",a)){if(d)return a;this.send(a);return}a=this.render_pragmas(a);var e=this.render_section(a,b,c);e===!1&&(e=this.render_tags(a,b,c,d));if(d)return e;this.sendLines(e)},send:function(a){a!==""&&this.buffer.push(a)},sendLines:function(a){if(a){var b=a.split("\n");for(var c=0;c<b.length;c++)this.send(b[c])}},render_pragmas:function(a){if(!this.includes("%",a))return a;var b=this,c=this.getCachedRegex("render_pragmas",function(a,b){return new RegExp(a+"%([\\w-]+) ?([\\w]+=[\\w]+)?"+b,"g")});return a.replace(c,function(a,c,d){if(!b.pragmas_implemented[c])throw{message:"This implementation of mustache doesn't understand the '"+c+"' pragma"};b.pragmas[c]={};if(d){var e=d.split("=");b.pragmas[c][e[0]]=e[1]}return""})},render_partial:function(a,b,d){a=c(a);if(!d||d[a]===undefined)throw{message:"unknown_partial '"+a+"'"};return!b||typeof b[a]!="object"?this.render(d[a],b,d,!0):this.render(d[a],b[a],d,!0)},render_section:function(a,b,c){if(!this.includes("#",a)&&!this.includes("^",a))return!1;var d=this,e=this.getCachedRegex("render_section",function(a,b){return new RegExp("^([\\s\\S]*?)"+a+"(\\^|\\#)\\s*(.+)\\s*"+b+"\n*([\\s\\S]*?)"+a+"\\/\\s*\\3\\s*"+b+"\\s*([\\s\\S]*)$","g")});return a.replace(e,function(a,e,f,g,h,i){var j=e?d.render_tags(e,b,c,!0):"",k=i?d.render(i,b,c,!0):"",l,m=d.find(g,b);return f==="^"?!m||Array.isArray(m)&&m.length===0?l=d.render(h,b,c,!0):l="":f==="#"&&(Array.isArray(m)?l=d.map(m,function(a){return d.render(h,d.create_context(a),c,!0)}).join(""):d.is_object(m)?l=d.render(h,d.create_context(m),c,!0):typeof m=="function"?l=m.call(b,h,function(a){return d.render(a,b,c,!0)}):m?l=d.render(h,b,c,!0):l=""),j+l+k})},render_tags:function(a,b,c,d){var e=this,f=function(){return e.getCachedRegex("render_tags",function(a,b){return new RegExp(a+"(=|!|>|&|\\{|%)?([^#\\^]+?)\\1?"+b+"+","g")})},h=f(),i=function(a,d,i){switch(d){case"!":return"";case"=":return e.set_delimiters(i),h=f(),"";case">":return e.render_partial(i,b,c);case"{":case"&":return e.find(i,b);default:return g(e.find(i,b))}},j=a.split("\n");for(var k=0;k<j.length;k++)j[k]=j[k].replace(h,i,this),d||this.send(j[k]);if(d)return j.join("\n")},set_delimiters:function(a){var b=a.split(" ");this.otag=this.escape_regex(b[0]),this.ctag=this.escape_regex(b[1])},escape_regex:function(a){if(!arguments.callee.sRE){var b=["/",".","*","+","?","|","(",")","[","]","{","}","\\"];arguments.callee.sRE=new RegExp("(\\"+b.join("|\\")+")","g")}return a.replace(arguments.callee.sRE,"\\$1")},find:function(a,b){function d(a){return a===!1||a===0||a}a=c(a);var e;if(a.match(/([a-z_]+)\./ig)){var f=this.walk_context(a,b);d(f)&&(e=f)}else d(b[a])?e=b[a]:d(this.context[a])&&(e=this.context[a]);return typeof e=="function"?e.apply(b):e!==undefined?e:""},walk_context:function(a,b){var c=a.split("."),d=b[c[0]]!=undefined?b:this.context,e=d[c.shift()];while(e!=undefined&&c.length>0)d=e,e=e[c.shift()];return typeof e=="function"?e.apply(d):e},includes:function(a,b){return b.indexOf(this.otag+a)!=-1},create_context:function(a){if(this.is_object(a))return a;var b=".";this.pragmas["IMPLICIT-ITERATOR"]&&(b=this.pragmas["IMPLICIT-ITERATOR"].iterator);var c={};return c[b]=a,c},is_object:function(a){return a&&typeof a=="object"},map:function(a,b){if(typeof a.map=="function")return a.map(b);var c=[],d=a.length;for(var e=0;e<d;e++)c.push(b(a[e]));return c},getCachedRegex:function(a,b){var c=h[this.otag];c||(c=h[this.otag]={});var d=c[this.ctag];d||(d=c[this.ctag]={});var e=d[a];return e||(e=d[a]=b(this.otag,this.ctag)),e}},{name:"mustache.js",version:"0.4.0",to_html:function(a,b,c,d){var e=new i;d&&(e.send=d),e.render(a,b||{},c);if(!d)return e.buffer.join("\n")}}}();typeof b!="undefined"&&b.exports&&(c.name=f.name,c.version=f.version,c.to_html=function(){return f.to_html.apply(this,arguments)})}),require.define("/index.js",function(a,b,c,d,e){b.exports=a("./lib/index")}),require.define("/lib/index.js",function(a,b,c,d,e){function h(a){return{createAppendStream:function(b){return new f(a,f.APPEND,b)},createWriteStream:function(b){return new f(a,f.WRITE,b)},createEventStream:function(b,c){return c=c===undefined?!0:c,new g(a,b,c)}}}b.exports=h;var f=a("./writable"),g=a("./readable");h.WriteStream=f,h.ReadStream=g}),require.define("/lib/writable.js",function(a,b,c,d,e){function g(a,b,c){this.el=a,this.mode=b,this.mimetype=c||"text/html",f.call(this)}b.exports=g;var f=a("stream").Stream,h=g,i=h.prototype=new f;i.constructor=h,h.APPEND=0,h.WRITE=1,i.writable=!0,i.setMimetype=function(a){this.mimetype=a},i.write=function(a){var b=this.mode===h.APPEND?this.append(a):this.insert(a);return this.emit("data",this.el.childNodes),b},i.insert=function(a){return this.el.innerHTML="",this.append(a)},i.append=function(a){var b=this[this.resolveMimetypeHandler()](a);for(var c=0,d=b.length;c<d;++c)this.el.appendChild(b[c]);return!0},i.resolveMimetypeHandler=function(){var a=this.mimetype.replace(/(\/\w)/,function(a){return a.slice(1).toUpperCase()});return a=a.charAt(0).toUpperCase()+a.slice(1),"construct"+a},i.constructTextHtml=function(a){var b=/(tr|td|th)/.test(a)&&!/table/.test(a),c;return b&&(c=document.createElement("table")),c=c||document.createElement("div"),c.innerHTML=a,[].slice.call(c.childNodes)},i.constructTextPlain=function(a){var b=document.createTextNode(a);return[b]}}),require.define("/lib/readable.js",function(a,b,c,d,e){function h(a,b,c){this.el=a,this.eventType=b,this.shouldPreventDefault=c,a&&this.eventType&&g(this.el,this.eventType,this.listen.bind(this)),f.call(this)}function k(a){switch(a.getAttribute("type")){case"radio":return a.checked?a.value:null;case"checkbox":return"data",a.checked}return a.value}b.exports=h;var f=a("stream").Stream,g=function(a,b,c){return a.addEventListener(b,c,!1)};typeof $!="undefined"&&(g=function(a,b,c){return a=$(a)[b](c)}),document.createElement("div").addEventListener||(g=function(a,b,c){return a.attachEvent("on"+b,c)});var i=h,j=i.prototype=new f;j.constructor=i,j.listen=function(a){this.shouldPreventDefault&&(a.preventDefault?a.preventDefault():a.returnValue=!1);var b=this.eventType==="submit"||this.eventType==="change"||this.eventType==="keydown"||this.eventType==="keyup";if(b)return this.el.tagName.toUpperCase()==="FORM"?this.handleFormSubmit(a):this.emit("data",k(this.el));this.emit("data",a)},j.handleFormSubmit=function(a){var b=[];if(this.el.querySelectorAll)b=this.el.querySelectorAll("input,textarea,select");else{var c={INPUT:!0,TEXTAREA:!0,SELECT:!0},d=function(a){for(var e=0,f=a.childNodes.length;e<f;++e)a.childNodes[e].tagName&&(c[a.childNodes[e].tagName.toUpperCase()]?b.push(a):d(a.childNodes[e]))};d(this.el)}var e={},f,g;for(var h=0,i=b.length;h<i;++h)f=b[h].getAttribute("name"),g=k(b[h]),e[f]=g;return this.emit("data",e)}}),require.define("/example.js",function(a,b,c,d,e){var f=a("./index"),g=["text","checkbox","select","textarea","submit"],h=["radioinput_0","radioinput_1"],i;g=g.map(function(a){return document.getElementById(a+"input")}),h=h.map(function(a){return document.getElementById(a)}),i=document.getElementById("form"),console.log(i,h,g),f(i).createEventStream("submit",!0).on("data",console.log.bind(console));var j=document.getElementById("fixed");f(g[0]).createEventStream("keyup").on("data",console.log.bind(console)).pipe(f(j).createWriteStream("text/plain"))}),require("/example.js");