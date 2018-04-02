var config = (function () {
    var arr = window.location.hostname.split('.')[0];
    var isDebug = (arr == '192') || (arr == '127') || (arr == 'localhost') || (arr == '');
    var baseUrl = isDebug ? '' : 'http://zx.letwx.com/app/zxloanmanage-build/';
    var htmlUrl = isDebug ? '' : 'http://zx.letwx.com/app/zxloanmanage-build/';
    var cdnUrl = isDebug ? '' : 'http://zxcdn.letwx.com/app/zxloanmanage-build/';
    gameid = getUrlParam().uid != undefined ? getUrlParam().uid : 1;
    //gp = getUrlParam().gp != undefined ? getUrlParam().gp : 'Wyzyy7CFUGPtdFlzhhrxwdP6X6l3P9CaGH3lhKg58K4';
    return {
        gameid: gameid,
        uid: gameid,
        //gp: gp,
        touch: 'touchstart',
        click: 'click',
        isDebug: isDebug,
        htmlUrl: isDebug ? '' : htmlUrl,
        baseUrl: isDebug ? '' : baseUrl,
        baseCDNUrl: isDebug ? '' : cdnUrl,
        configUrl: (isDebug ? '' : baseUrl) + '../libs/require.config.js',
        scope: '',
        shareInfo: {
            title: '中信秒秒贷',
            desc: '中信秒秒贷，为您提供更好的银行融资服务体验',
            link: htmlUrl + 'index.html?uid=' + gameid,
            imgUrl: cdnUrl + 'images/share_show.jpg'
        }
    }
}());

//用于检测联通2G/3G环境下的广告条
//只重复一次，避免刷不出来时，始终停留
window.onload = function () {
    var checkLT = setTimeout(function () {
        if (document.getElementById('divShow')) {
            window.location.reload();
            return;
        }
    }, 300);
};

function check(oAuth, cb) {
    var gameid = config.gameid;
    oAuth.project_name = 'gf';
    oAuth.cfg(gameid, config.isDebug, config.scope);
    oAuth.checkToken(function (apiopenid, apitoken) {
        config.apiopenid = apiopenid;
        config.apitoken = apitoken;
        cb && cb(gameid, apiopenid, apitoken);
    }, function () {
        alert('checktoken错误！');
    });
}

function goToNextPage(page){
    setTimeout(function(){
        window.location.href = page;
    }, 200);
}

function gotoUrl(url) {
    setTimeout(function () {
        window.location.href = url;
    }, 200);
}

function __uri(str) {
    return (config.baseCDNUrl + 'zxloanmanage-build/../' + str);
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

function textConvert(dom,str) {
    //dom-文本插入的dom元素  str-文本字符串
    //br表示换行
    dom.innerHTML = '';
    var textArr = str.split('br');
    for(var i=0;i<textArr.length;i++){
        var p = document.createElement('p');
        p.textContent = textArr[i];
        dom.appendChild(p);
    }
}
//textConvert($('#test')[0],str);

function scoreConvert(dom,str,score) {
    //dom-文本插入的dom元素  str-文本字符串
    //@表示成绩
    var newStr = str.replace(/@/g,'<span>' + score + '</span>');
    dom.innerHTML = newStr;
}
//scoreConvert($('#test')[0],str,score);

//验证身份证号码
function isCardID(sId){
    var aCity = {11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江",
        31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北",43:"湖南",
        44:"广东",45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏",61:"陕西",62:"甘肃",
        63:"青海",64:"宁夏",65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外"};
    var iSum = 0 ;
    var info = "" ;
    if(!sId){
        M.alert("请输入你的身份证号");
        return false;
    }
    if(!/^\d{17}(\d|x)$/i.test(sId)){
        M.alert("你输入的身份证长度或格式错误");
        return false;
    }
    sId = sId.replace(/x$/i,"a");
    if(aCity[parseInt(sId.substr(0,2))] == null){
        M.alert("你的身份证地区非法");
        return false;
    }
    var sBirthday = sId.substr(6,4) + "-" + Number(sId.substr(10,2)) + "-" + Number(sId.substr(12,2));
    var d = new Date(sBirthday.replace(/-/g,"/"));
    if(sBirthday != (d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate())){
        M.alert("身份证上的出生日期非法");
        return false;
    }
    for(var i = 17;i>=0;i--) {
        iSum += (Math.pow(2,i) % 11) * parseInt(sId.charAt(17 - i),11);
    }
    if(iSum % 11 != 1){
        M.alert("你输入的身份证号非法");
        return false;
    }
    return true;
}

//数字转换
function numConvert(str){
    var arr = str.split(',');
    var newStr = arr.join('');
    return parseFloat(newStr);
}
//numConvert('100,100.001');



