var JSONP={now:function(){return(new Date).getTime()},rand:function(){return Math.random().toString().substr(2)},removeElem:function(e){var t=e.parentNode;t&&11!==t.nodeType&&t.removeChild(e)},parseData:function(e){var t="";if("string"==typeof e)t=e;else if("object"==typeof e)for(var n in e)t+="&"+n+"="+encodeURIComponent(e[n]);return t+="&_time="+this.now(),t=t.substr(1)},getJSON:function(e,t,n){var a;e=e+(-1===e.indexOf("?")?"?":"&")+this.parseData(t);var r=/callback=(\w+)/.exec(e);r&&r[1]?a=r[1]:(a="jsonp_"+this.now()+"_"+this.rand(),e=e.replace("callback=?","callback="+a),e=e.replace("callback=%3F","callback="+a));var o=document.createElement("script");o.type="text/javascript",o.src=e,o.id="id_"+a,window[a]=function(e){window[a]=void 0;var t=document.getElementById("id_"+a);JSONP.removeElem(t),n(e)};var c=document.getElementsByTagName("head");c&&c[0]&&c[0].appendChild(o)}};