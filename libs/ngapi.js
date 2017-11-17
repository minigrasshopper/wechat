(function(global,factory){
	if(typeof define === 'function' && define.amd){
		define(['MHJ',('__proto__' in {} ? 'zepto':'jquery')],function(MHJ,$){
			return factory(MHJ,$,global);
		});
	}else if(typeof module !== 'undefined' && module.exports){
		module.exports = factory(require('MHJ'),require(('__proto__' in {} ? 'zepto':'jquery')),global);
	}else{
		global.ngapi = factory(global.MHJ,global.$,global);
	}
}(typeof window !== 'undefined' ? window : this,function(MHJ,$,window){
	var API_BASE = "http://q.letwx.com/api/jsapi";
		
	var ngapi = window.ngapi = function(action,params,appid,callback,apiopenid,apitoken,debug) {
			if(!action) {
				alert("action不能为空");
				return false;
			}
			
			if(!appid) {
				alert("appid不能为空");
				return false;
			}
			
			this.httpid = this.httpid || 0;
			this.httpid ++;
			
			var postdata = {};
			postdata.action = action;
			postdata.params = (typeof params == "string" ? params:(JSON.stringify(params) || ""));
			postdata.uid = appid;
			postdata.wxapiopenid = apiopenid || "testopenid";
			postdata.wxapitoken = apitoken || "testopenid";
			if(debug) {
				postdata.debug = debug;
			}
			
			if(API_BASE.indexOf(window.location.host) < 0) { //接口地址和当前地址不在一个域，则以跨域的方式调用
				var cbkey = 'httpcb'+this.httpid;
				ngapi[cbkey] = function(data) {
					callback && callback(data);
					delete ngapi[cbkey]; //消除对象
					$("#"+cbkey).remove(); //消除无用的script
				};
				
				postdata.callback = "ngapi."+cbkey;
				
				var query = [];
				for(var p in postdata) {
					if(postdata.hasOwnProperty(p)) {
						if(typeof postdata[p] == "object") {
							query.push(p+"="+encodeURIComponent(JSON.stringify(postdata[p])));
						}
						else query.push(p+"="+encodeURIComponent(postdata[p]));
					}
				}
				var url = API_BASE+"?"+query.join("&");
				var script = document.createElement('script');
				script.src = url;
				script.id = cbkey;//直接append会导致script无法触发
				$("head").append(script);
			}
			else {
				MHJ.post(API_BASE,postdata,callback);
			}
	}
		
	return ngapi;
}));