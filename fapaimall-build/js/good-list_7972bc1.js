!function(){function n(n){function a(n){var a=n.error-0;switch(M.loadingHide(),a){case 1002:oAuth.clear(),changeAlert("你的身份信息已过期，点击确定刷新页面"),window.location.reload();break;default:changeAlert(n.error_msg)}}function e(n,e,o){M.ajax(n,e,config.gameid,function(n){var e=n.error-0;switch(e){case 0:o&&o(n);break;default:a(n)}},config.apiopenid,config.apitoken,config.isDebug?"nf":"")}function o(a,e){switch(a.link=config.htmlUrl+"index.html?channelid="+sessionStorage.getItem("channelid"),localStorage.language){case"cn":break;case"en":languagePack[config.shareInfo.title]&&(config.shareInfo.title=languagePack[config.shareInfo.title]),languagePack[config.shareInfo.desc]&&(config.shareInfo.desc=languagePack[config.shareInfo.desc])}n.initWx(a,config.gameid,config.apiopenid,config.apitoken,e,null,null,null)}amendPageStyle();var i={goodsList:function(n){e("mall/goods/list",{},function(a){n&&n(a)})}};new Vue({el:"section",data:{pageData:null,name:getUrlParam().name,category_id:getUrlParam().category_id},mounted:function(){var n=this;M.loading(),check(oAuth,function(){n.init()})},updated:function(){changeLanguage(),nameFontChange()},methods:{init:function(){var n=this;this.$el.style.display="block",i.goodsList(function(a){console.log(a),n.pageData=a.goods,changeLanguage(),nameFontChange(),M.loadingHide(),o(config.shareInfo)})},jumpGoodDetail:function(n){gotoUrl("good-detail.html?goodsId="+n)}}})}require([config.configUrl],function(){var a=["wxshare"];require(a,n)})}();