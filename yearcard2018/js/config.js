var config = (function() {
	var arr = window.location.hostname.split('.')[0];
	var isDebug = (arr == '192') || (arr == '127') || (arr == 'localhost') || (arr == '');
	var baseUrl = isDebug ? '' :'http://q.letwx.com/app/yearcard2018/';
	var cdnUrl = isDebug ? '' :'http://qcdn.letwx.com/app/yearcard2018/';
	var uid = getUrlParams().uid ? getUrlParams().uid : 1;
	var gp = getUrlParams().gp ? getUrlParams().gp : 'NI_46IZOhizrGiGtRmKx2_YAOxJz2gJyPOGv-Alj9og';
	return {
        uid: uid,
        gp: gp,
        isDebug: isDebug,	// 是否为调试状态
        baseUrl: baseUrl,
        cdnUrl: cdnUrl,
        configUrl: (isDebug ? '' : baseUrl) + '../utils/require.config.js',
        apiopenid: '',  // 微信端openid
        apitoken: '', // 微信端token
        scope: 'snsapi_base', // 获取用户信息snsapi_base,snsapi_userinfo
        shareInfo: {
            title: '灵犬贺岁，恭贺新春',
            desc: '武汉国际广场，特别为您臻献心意满满的春节贺卡，传递新年​的祝福与问候。',
            link: baseUrl + 'index.html',
            imgUrl: baseUrl + 'images/share_show1.png'
        }
	}
}());

// 用于检测联通2G/3G环境下的广告条
// 只重复一次，避免刷不出来时，始终停留
window.onload = function(){
	setTimeout(function(){
		if(document.getElementById('divShow')){
			window.location.reload();
			return false;
		}
	},300);
};

function jumpUrl(url){
    setTimeout(function(){
        window.location.href = url;
    },200);
}

// 获取链接中key值
function getUrlParams(){
	var str = window.location.search;
	var arrTmp = [];
	var	obj = {};
	if(str.indexOf('?') > -1){
		str = str.substr(1);
		arrTmp = str.split('&');
		for(var i=0;i<arrTmp.length;i++){
			var tempArr = arrTmp[i].split('=');
			obj[tempArr[0]] = decodeURIComponent(tempArr[1]);
		}
	}
	return obj;
}