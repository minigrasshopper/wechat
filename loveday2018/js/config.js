var config = (function () {
    var arr = window.location.hostname.split('.')[0];
    var isDebug = (arr == '192') || (arr == '127') || (arr == 'localhost') || (arr == '');
    var baseUrl = isDebug ? '' : 'http://q.letwx.com/app/loveday2018-build/';
    var htmlUrl = isDebug ? '' : 'http://q.letwx.com/app/loveday2018-build/';
    var cdnUrl = isDebug ? '' : 'http://qcdn.letwx.com/app/loveday2018-build/';
    var uid = getUrlParam().uid ? getUrlParam().uid : 1;
    var gp = getUrlParam().gp ? getUrlParam().gp : 'EEF2UZFbfxoIaqsYSI-nMfEPvsJqugQmmjeUemwH9AE';
    return {
        gameid: uid,
        uid: uid,
        gp: gp,
        touch: 'touchstart',
        click: 'click',
        isDebug: isDebug,
        htmlUrl: htmlUrl,
        baseUrl: baseUrl,
        baseCDNUrl: cdnUrl,
        configUrl: baseUrl + '../libs/require.config.js',
        scope: '',
        shareInfo: {
            title: '奇趣万圣夜，不给糖就捣蛋！',
            desc: '提着南瓜灯，“鬼混”哈咯喂，神秘魔幻礼物等你来领喔！',
            link: htmlUrl + 'index.html?uid=' + uid + '&gp=' + gp,
            imgUrl: cdnUrl + 'images/share_show.jpg'
        }
    }
}());

//用于检测联通2G/3G环境下的广告条
//只重复一次，避免刷不出来时，始终停留
window.onload = function () {
    setTimeout(function () {
        if (document.getElementById('divShow')) {
            window.location.reload();
            return false;
        }
    }, 300);
};

function check(oAuth, cb) {
    oAuth.cfg(config.uid, config.isDebug, config.scope);
    oAuth.checkToken(function (apiopenid, apitoken) {
        config.apiopenid = apiopenid;
        config.apitoken = apitoken;
        cb && cb(config.uid, apiopenid, apitoken);
    }, function () {
        alert('checktoken错误！');
    });
}

function jumpUrl(page) {
    var url = config.htmlUrl + page + '?uid=' + config.uid + '&gp=' + config.gp;
    setTimeout(function () {
        window.location.href = url;
    }, 200);
}

function gotoUrl(url) {
    setTimeout(function () {
        window.location.href = url;
    }, 200);
}

function getUrlParam() {
    var str = window.location.search,
        arrTmp = [],
        obj = {};
    if (str.indexOf('?') > -1) {
        str = str.substr(1);
        arrTmp = str.split('&');
        for (var i = 0; i < arrTmp.length; i++) {
            var tempArr = arrTmp[i].split('=');
            obj[tempArr[0]] = decodeURIComponent(tempArr[1]);
        }
    }
    return obj;
}

//验证手机号码 - 返回值true/false
function testMobile(str) {
    var reg = /^1[34578]\d{9}$/;
    if (!str) {
        M.alert('手机号码不能为空');
        return false;
    } else if (!reg.test(str)) {
        M.alert('手机号码错误');
        return false;
    } else {
        return true;
    }
}
