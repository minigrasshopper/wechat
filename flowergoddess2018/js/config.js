var config = (function() {
    var arr = window.location.hostname.split('.')[0];
    var isDebug = (arr == '192') || (arr == '127') || (arr == 'localhost') || (arr == '') || (arr == 'lppz');
    var baseUrl = isDebug ? '' :'http://beautyvote.wx.lppz.com/app/flowergoddess2018-build/';
    var cdnUrl = isDebug ? '' :'http://beautyvote.wx.lppz.com/app/flowergoddess2018-build/';
    var uid = getUrlParams().uid ? getUrlParams().uid : 1;
    var gp = getUrlParams().gp ? getUrlParams().gp : 'xuWxxwu5lYBh7D0y2ug6O4Tsbz_0pfhYlv1LficXW7M';
    return {
        uid: uid,
        gp: gp,
        isDebug: isDebug,	// 是否为调试状态
        baseUrl: baseUrl,
        cdnUrl: cdnUrl,
        configUrl: (isDebug ? '' : baseUrl) + '../utils/require.config.js',
        apiopenid: 'testopenid',  // 微信端openid
        apitoken: 'test', // 微信端token
        scope: 'snsapi_base', // 获取用户信息snsapi_base,snsapi_userinfo
        shareInfo: {
            title: '速速围观!!!这里有好多美丽的小姐姐，我要给我的女神打call！',
            desc: '加入樱花女神PK，寻找最美的她，还有超多礼物、红包等你拿！',
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
    // 百度统计
    var _hmt = _hmt || [];
    (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?50247273a35616f65e201c60e46344aa";
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(hm, s);
    })();
};

function amendPageStyle(){
    ////1、防止输入时，absolute定位的样式紊乱
    //var view_h = document.documentElement.clientHeight || document.body.clientHeight;
    //$("body").height(view_h);
    //2、防止输入时，footer标签被顶上去
    var h = document.body.scrollHeight;
    window.onresize = function(){
        if (document.body.scrollHeight < h) {
            document.getElementsByClassName('footer')[0].style.display = "none";
        }else{
            document.getElementsByClassName("footer")[0].style.display = "block";
        }
    };
}

function jumpUrl(path){
    setTimeout(function(){
        window.location.href = config.baseUrl + path;
    },200);
}

function jumpGo(url) {
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