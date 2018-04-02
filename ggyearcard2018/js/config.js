var config = (function() {
	var arr = window.location.hostname.split('.')[0];
	var isDebug = (arr == '192') || (arr == '127') || (arr == 'localhost') || (arr == '');
	var baseUrl = isDebug ? '' :'http://q.letwx.com/app/ggyearcard2018-build/';
	var htmlUrl = isDebug ? '' :'http://q.letwx.com/app/ggyearcard2018-build/';
	var cdnUrl = isDebug ? '' :'http://qcdn.letwx.com/app/ggyearcard2018-build/';
	gameid = 1;
	return {
		gameid: gameid,
		uid: gameid,
		touch: 'touchend',
		click: 'click',
		isDebug: isDebug,
		htmlUrl: isDebug ? '' : htmlUrl,
		baseUrl: isDebug ? '' : baseUrl,
		baseCDNUrl: isDebug ? '' : cdnUrl,
		configUrl: (isDebug ? '' : baseUrl) + '../libs/require.config.js',
		scope: '',
		shareInfo : {
			title: '新年贺卡',
			desc: '快来选择心仪的贺卡，送给自己身边的亲朋好友，一起来感受新春美好的祝愿吧！',
            link: htmlUrl + 'index.html',
			imgUrl: cdnUrl + 'images/share_img.png'
		}
	}
}());

//用于检测联通2G/3G环境下的广告条
//只重复一次，避免刷不出来时，始终停留
window.onload = function(){
	var checkLT = setTimeout(function(){
		if(document.getElementById('divShow')){
			window.location.reload();
			return;
		}
	},300);
};

function check(oAuth,cb){
	var gameid = config.gameid;
	oAuth.cfg(gameid,config.isDebug,config.scope);
	oAuth.checkToken(function(apiopenid, apitoken) {
		config.apiopenid = apiopenid;
		config.apitoken = apitoken;
		cb && cb(gameid, apiopenid, apitoken);
	}, function() {
		alert('checktoken错误！');			
	});
}

function gotoUrl(url){
	setTimeout(function(){
		window.location.href = url;
	},200);
}

function __uri(str){
	return (config.baseCDNUrl + 'ggyearcard2018-build/../' + str);
}

function getUrlParam(){
	var str = window.location.search,
		arrTmp = [],
		obj = {};
	if(str.indexOf('?')>-1){
		str = str.substr(1);
		arrTmp = str.split('&');
		for(var i=0;i<arrTmp.length;i++){
			var tempArr = arrTmp[i].split('=');
			obj[tempArr[0]] = decodeURIComponent(tempArr[1]);
		}
	}
	return obj;
}