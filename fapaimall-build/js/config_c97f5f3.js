function amendPageStyle(){var e=document.body.scrollHeight;window.onresize=function(){document.getElementsByTagName("footer")[0].style.display=document.body.scrollHeight<e?"none":"block"}}function hasFestival(){localStorage.hasFestival?$(".festivalUse").show():$(".festivalUse").hide()}function check(e,a){var n=config.gameid;e.cfg(n,config.isDebug,config.scope),e.checkToken(function(e,t){config.apiopenid=e,config.apitoken=t,a&&a(n,e,t)},function(){alert("checktoken error")})}function getCartNum(e,a,n){var t="http://q.letwx.com/api/jsapi",o="&uid="+config.gameid+"&wxapiopenid="+config.apiopenid+"&wxapitoken="+config.apitoken+"&debug=nf";JSONP.getJSON(t+"?action="+e+"&params="+JSON.stringify(a)+"&callback=get",o,function(e){n&&n(e)})}function gotoUrl(e){setTimeout(function(){window.location.href=e},200)}function getUrlParam(){var e=window.location.search,a=[],n={};if(e.indexOf("?")>-1){e=e.substr(1),a=e.split("&");for(var t=0;t<a.length;t++){var o=a[t].split("=");n[o[0]]=decodeURIComponent(o[1])}}return n}function testMobile(e){var a=/^1[34578]\d{9}$/;return e?a.test(e)?!0:(changeAlert("手机号码错误"),!1):(changeAlert("请输入手机号码"),!1)}function testTel(e){var a=/^(0|86|17951)?(13[0-9]|15[012356789]|17[01678]|18[0-9]|14[57])[0-9]{8}$/,n=/^(0[0-9]{2,3}\-)([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$/;return e?a.test(e)||n.test(e)?!0:(changeAlert("电话号码错误"),!1):(changeAlert("请输入电话号码"),!1)}function testEmail(e){var a=/^(?:\w+\.?)*\w+@(?:\w+\.)*\w+$/;return e?a.test(e)?!0:(changeAlert("邮箱地址错误"),!1):(changeAlert("请输入邮箱地址"),!1)}function nameFontChange(){var e=$(".name_amend"),a=$(".name"),n=/[a-zA-Z]/;$.each(e,function(e,a){var t=$(a).text(),o=null;if(null!=(o=n.exec(t))){var i=o.index,l="<span>"+t.slice(0,i)+"</span>",c='<span class="font-news">'+t.slice(i)+"</span>";$(a).html(l+c+'<span class="blank font-news">I believe I can fly, because I have a dream</span>')}}),$.each(a,function(e,a){var t=$(a).text(),o=null;if(null!=(o=n.exec(t))){var i=o.index,l="<span>"+t.slice(0,i)+"</span>",c='<span class="font-news">'+t.slice(i)+"</span>";$(a).html(l+c)}})}function changeAlert(e){"cn"==localStorage.language?M.alert(e):(languagePack[e]?M.alert("Tip",languagePack[e]):M.alert("Tip",e),$(".M-pop").hide(),$(".M-handler-ok").text("OK"),$(".M-pop").show())}function changeLanguage(){var e=localStorage.language,a=document.getElementsByClassName("language");switch(e){case"cn":break;case"en":for(var n=0;n<a.length;n++)if("INPUT"==a[n].tagName||"TEXTAREA"==a[n].tagName){if("undefined"!=a[n].getAttribute("placeholder")&&""!=a[n].getAttribute("placeholder")){var t=a[n].getAttribute("placeholder");t=languagePack[t],t&&(a[n].setAttribute("placeholder",t),$(a[n]).addClass("font-news"))}if("undefined"!=a[n].value&&""!=a[n].value){var o=a[n].value;o=languagePack[o],o&&(a[n].value=o,$(a[n]).addClass("font-news"))}}else{var i=a[n].textContent;i=languagePack[i],i&&(a[n].innerHTML=i,$(a[n]).addClass("font-news"))}}}function areaWidget(e){for(var a=[["东城区","Dongcheng District"],["西城区","Xicheng District"],["朝阳区","Chaoyang"],["丰台区","Fengtai"],["石景山区","Shijingshan"],["海淀区","Haidian"],["通州区","Tongzhou"],["顺义区","Shunyi"],["昌平区","Changping"],["大兴区","Daxing"]],n=0;n<a.length;n++)"cn"==localStorage.language?e.append('<option value="'+a[n][0]+'">'+a[n][0]+"</option>"):"en"==localStorage.language&&e.append('<option value="'+a[n][1]+'">'+a[n][1]+"</option>")}var config=function(){var e=window.location.hostname.split(".")[0],a="192"==e||"127"==e||"localhost"==e||""==e,n=a?"":"http://q.letwx.com/app/fapaimall-build/",t=a?"":"http://q.letwx.com/app/fapaimall-build/",o=a?"":"http://qcdn.letwx.com/app/fapaimall-build/",i=11;return{gameid:i,uid:i,touch:"touchend",click:"click",isDebug:a,htmlUrl:a?"":t,baseUrl:a?"":n,baseCDNUrl:a?"":o,configUrl:(a?"":n)+"../libs/require.config.js",scope:"",apiopenid:"testopenid",apitoken:"test",shareInfo:{title:"法派1855微商城，美味新鲜送到家",desc:"微信订购蛋糕，同城配送免邮哦",link:t+"index.html",imgUrl:o+"images/share_show.jpg"}}}();window.onload=function(){setTimeout(function(){return document.getElementById("divShow")?(window.location.reload(),!1):void 0},300)},localStorage.language||(localStorage.language="cn");