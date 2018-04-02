var config = (function() {
    var arr = window.location.hostname.split('.')[0];
    var isDebug = (arr == '192') || (arr == '127') || (arr == 'localhost') || (arr == '');
    var baseUrl = isDebug ? '' :'http://zx.letwx.com/app/zxmortgagemanage-build/';
    var cdnUrl = isDebug ? '' :'http://zxcdn.letwx.com/app/zxmortgagemanage-build/';
    var uid = getUrlParams().uid ? getUrlParams().uid : 1;
    var gp = getUrlParams().gp ? getUrlParams().gp : 'xuWxxwu5lYBh7D0y2ug6O4Tsbz_0pfhYlv1LficXW7M';
    return {
        uid: uid,
        gp: gp,
        isDebug: isDebug,	// 是否为调试状态
        baseUrl: baseUrl,
        cdnUrl: cdnUrl,
        configUrl: (isDebug ? '' : baseUrl) + '../utils/require.config.js',
        apiopenid: '',  // 微信端openid
        apitoken: '', // 微信端token
        scope: 'snsapi_userinfo', // 获取用户信息snsapi_base,snsapi_userinfo
        shareInfo: {
            title: '',
            desc: '',
            link: baseUrl + 'index.html',
            imgUrl: baseUrl + 'images/share_show.jpg'
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