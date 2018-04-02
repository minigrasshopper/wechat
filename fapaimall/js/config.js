var config = (function() {
	var arr = window.location.hostname.split('.')[0];
	var isDebug = (arr == '192') || (arr == '127') || (arr == 'localhost') || (arr == '');
	var baseUrl = isDebug ? '' :'http://q.letwx.com/app/fapaimall-build/';
	var htmlUrl = isDebug ? '' :'http://q.letwx.com/app/fapaimall-build/';
	var cdnUrl = isDebug ? '' :'http://qcdn.letwx.com/app/fapaimall-build/';
	var gameid = 11;
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
		apiopenid: 'testopenid',
		apitoken: 'test',
		shareInfo : {
			title: '法派1855微商城，美味新鲜送到家',
			desc: '微信订购纯正法式烘焙美食，满200顺丰包邮哦',
            link: htmlUrl + 'index.html',
			imgUrl: cdnUrl + 'images/share_show.jpg'
		}
	}
}());

//用于检测联通2G/3G环境下的广告条
//只重复一次，避免刷不出来时，始终停留
window.onload = function(){
	var checkLT = setTimeout(function(){
		if(document.getElementById('divShow')){
			window.location.reload();
			return false;
		}
	},300);
};

function amendPageStyle(){
	////1、防止输入时，absolute定位的样式紊乱
	//var view_h = document.documentElement.clientHeight || document.body.clientHeight;
	//$("body").height(view_h);
	//2、防止输入时，footer标签被顶上去
	var h = document.body.scrollHeight;
	window.onresize = function(){
		if (document.body.scrollHeight < h) {
			document.getElementsByTagName("footer")[0].style.display = "none";
		}else{
			document.getElementsByTagName("footer")[0].style.display = "block";
		}
	};
}

function hasFestival(){
    if(localStorage.hasFestival){
        $('.festivalUse').show();
    }else{
        $('.festivalUse').hide();
    }
}

//微信oauth认证
function check(oAuth,cb){
	var gameid = config.gameid;
	oAuth.cfg(gameid,config.isDebug,config.scope);
	oAuth.checkToken(function(apiopenid, apitoken) {
		config.apiopenid = apiopenid;
		config.apitoken = apitoken;
		cb && cb(gameid, apiopenid, apitoken);
	}, function() {
		alert('checktoken error');
	});
}

if(!localStorage.language){
	localStorage.language = 'cn';
}

//默认语言、获取语言包
//function getLanguage(action, params, cb){
//	if(!localStorage.language){
//		localStorage.language = 'cn';
//	}
//	var baseUrl = 'http://q.letwx.com/api/jsapi';
//	var samekey = '&uid=' + config.gameid + '&wxapiopenid=' + config.apiopenid +　'&wxapitoken=' + config.apitoken + '&debug=' + 'nf';
//	JSONP.getJSON(baseUrl + "?action=" + action + '&params=' + JSON.stringify(params) + "&callback=get", samekey, function (data) {
//		cb && cb(data);
//	});
//}

//getLanguage('mall/language', {}, function(data){
//	localStorage.languagePack = JSON.stringify(data.language);
//});

//获取购物车数量
function getCartNum(action, params, cb){
	var baseUrl = 'http://q.letwx.com/api/jsapi';
	var samekey = '&uid=' + config.gameid + '&wxapiopenid=' + config.apiopenid +　'&wxapitoken=' + config.apitoken + '&debug=' + 'nf';
	JSONP.getJSON(baseUrl + "?action=" + action + '&params=' + JSON.stringify(params) + "&callback=get", samekey, function (data) {
		cb && cb(data);
	});
}

//getCartNum('mall/cart/list', {}, function(data){
//
//});

function gotoUrl(url){
	setTimeout(function(){
		window.location.href = url;
	},200);
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

//验证手机号码
function testMobile(str){
	var reg = /^1[34578]\d{9}$/;
	if(!str){
		changeAlert('请输入手机号码');
		return false;
	}else if(!reg.test(str)){
		changeAlert('号码错误');
		return false;
	}
	return true;
}

//验证固话、手机号码
function testTel(str){
	var integer1 = /^(0|86|17951)?(13[0-9]|15[012356789]|17[01678]|18[0-9]|14[57])[0-9]{8}$/;
	var integer2 = /^(0[0-9]{2,3}\-)([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$/;
	if(!str){
		changeAlert('请输入电话号码');
		return false;
	}else if(!integer1.test(str) && !integer2.test(str)){
		changeAlert('号码错误');
		return false;
	}
	return true;
}

//验证email
function testEmail(str){
	var reg = /^(?:\w+\.?)*\w+@(?:\w+\.)*\w+$/;
	if(!str){
		changeAlert('请输入邮箱地址');
		return false;
	}else if(!reg.test(str)){
		changeAlert('邮箱地址错误');
		return false;
	}
	return true;
}

//name中英文样式
function nameFontChange(){
	//dom-name集合jq元素
	var dom1 = $('.name_amend');	//加空白
	var dom2 = $('.name');
	var reg = /[a-zA-Z]/;
	$.each(dom1, function(index, item){
		var str = $(item).text();
		var obj = null;
		if((obj = reg.exec(str)) != null){
			var i = obj.index;
			var name_cn = '<span>' + str.slice(0, i) + '</span>';
			var name_en = '<span class="font-news">' + str.slice(i) + '</span>';
            $(item).html(name_cn + name_en);
			/*$(item).html(name_cn + name_en + '<span class="font-news" style="opacity: 0;">&npsb;&npsb;&npsb;&npsb;&npsb;&npsb;&npsb;&npsb;&npsb;&npsb;&npsb;&npsb;&npsb;&npsb;</span>');
			//加span标签占位，同时行高和.font-news一样，让页面布局一致【我最聪明】*/
		}
	});
	$.each(dom2, function(index, item){
		var str = $(item).text();
		var obj = null;
		if((obj = reg.exec(str)) != null){
			var i = obj.index;
			var name_cn = '<span>' + str.slice(0, i) + '</span>';
			var name_en = '<span class="font-news">' + str.slice(i) + '</span>';
			$(item).html(name_cn + name_en);
		}
	})
}

//弹出框中英切换
function changeAlert(msg){
	//msg 文本内容
	if(localStorage.language == 'cn'){//中文
		M.alert(msg);
	}else{//英文
		if(!languagePack[msg]){
			M.alert('Tip',msg);
		}else{
			M.alert('Tip',languagePack[msg]);
		}
		$('.M-pop').hide();
		$('.M-handler-ok').text('OK');
		$('.M-pop').show();
	}
}

//全局文本内容切换
function changeLanguage(){
	//language当前语言版本，group要切换的文字
	var language = localStorage.language;
	var group = document.getElementsByClassName('language');
	switch(language){
		case 'cn':  //中文
					//share(config.shareInfo);
			break;
		case 'en':  //英文
			for(var i=0;i<group.length;i++){
				//此时group[i]为js对象
				if(group[i].tagName == 'INPUT' || group[i].tagName == 'TEXTAREA'){//若为input\textarea标签
					if(group[i].getAttribute('placeholder') != 'undefined' && group[i].getAttribute('placeholder') != ''){
						//placeholder属性存在且不为空
						var placeholder = group[i].getAttribute('placeholder');
						placeholder = languagePack[placeholder];
						if(placeholder){
							group[i].setAttribute('placeholder', placeholder);
							$(group[i]).addClass('font-news');
						}
					}
					if(group[i].value != 'undefined' && group[i].value != ''){
						//value属性存在且不为空
						var value = group[i].value;
						value = languagePack[value];
						if(value){
							group[i].value = value;
							$(group[i]).addClass('font-news');
						}
					}
				}else{//非input标签
					var txt = group[i].textContent;
					txt = languagePack[txt];
					if(txt){
						group[i].innerHTML = txt;
						$(group[i]).addClass('font-news');
					}
				}
			}
	}
}

//地区组件
function areaWidget($dom){
	var arr = [
		["东城区",'Dongcheng District'],["西城区",'Xicheng District'],["朝阳区",'Chaoyang'],
		["丰台区",'Fengtai'],["石景山区",'Shijingshan'],["海淀区",'Haidian'],
		["通州区",'Tongzhou'],["顺义区",'Shunyi'],["昌平区",'Changping'],["大兴区",'Daxing']
	];
	for(var i=0;i<arr.length;i++){
		if(localStorage.language == 'cn'){
			$dom.append('<option value="' + arr[i][0] + '">' + arr[i][0] + '</option>');
		}else if(localStorage.language == 'en'){
			$dom.append('<option value="' + arr[i][1] + '">' + arr[i][1] + '</option>');
		}
	}
}