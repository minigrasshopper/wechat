!function(){function a(a){function n(a){var n=a.error-0;switch(M.loadingHide(),n){case 1002:oAuth.clear(),changeAlert("你的身份信息已过期，点击确定刷新页面"),window.location.reload();break;default:changeAlert(a.error_msg)}}function o(a,o,e){M.ajax(a,o,config.gameid,function(a){var o=a.error-0;switch(o){case 0:e&&e(a);break;default:n(a)}},config.apiopenid,config.apitoken,config.isDebug?"nf":"")}function e(n,o){switch(n.link=config.htmlUrl+"index.html?channelid="+sessionStorage.getItem("channelid"),localStorage.language){case"cn":break;case"en":languagePack[config.shareInfo.title]&&(config.shareInfo.title=languagePack[config.shareInfo.title]),languagePack[config.shareInfo.desc]&&(config.shareInfo.desc=languagePack[config.shareInfo.desc])}a.initWx(n,config.gameid,config.apiopenid,config.apitoken,o,null,null,null)}amendPageStyle();var t={goodsDetail:function(a){o("mall/goods/detailnew",{id:getUrlParam().goodsId},function(n){a&&a(n)})},cartCreate:function(a,n){o("mall/cart/create",a,function(a){n&&n(a)})},buynow:function(a,n){o("mall/order/buynow",a,function(a){n&&n(a)})}};new Vue({el:"section",data:{pageData:null,params:{goodsId:getUrlParam().goodsId,num:1,goodsNum:1},hint_show:!1},mounted:function(){var a=this;getUrlParam().lang&&(localStorage.language=getUrlParam().lang,localStorage.showAll=getUrlParam().showAll,localStorage.city=getUrlParam().city,localStorage.preTime||(localStorage.preTime=(new Date).getTime())),M.loading(),check(oAuth,function(){a.init()})},updated:function(){changeLanguage(),nameFontChange(),hasFestival()},methods:{init:function(){var a=this;t.goodsDetail(function(n){a.pageData=n.good,console.log(a.pageData),a.$nextTick(function(){changeLanguage(),nameFontChange(),M.loadingHide(),a.$el.style.display="block",e(config.shareInfo)})})},reduceHandle:function(){this.params.num--,this.params.num<=1&&(this.params.num=1)},addHandle:function(){this.params.num++},jumpNew:function(){gotoUrl("index.html")},cartHandle:function(){var a=this;M.loading(),t.cartCreate(this.params,function(){M.loadingHide(),a.hint_show=!0,localStorage.cartNum="",setTimeout(function(){a.hint_show=!1},1200)})},buyHandle:function(){var a=this;this.params.goodsNum=this.params.num,M.loading(),t.buynow(this.params,function(n){M.loadingHide(),localStorage.pageData=JSON.stringify(n),localStorage.goodsId=a.params.goodsId,localStorage.goodsNum=a.params.goodsNum,gotoUrl("order-create.html")})}}})}require([config.configUrl],function(){var n=["wxshare"];require(n,a)})}();