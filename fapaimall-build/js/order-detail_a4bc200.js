!function(){function n(n){function e(n){var e=n.error-0;switch(M.loadingHide(),e){case 1002:oAuth.clear(),changeAlert("你的身份信息已过期，点击确定刷新页面"),window.location.reload();break;default:changeAlert(n.error_msg)}}function a(n,a,i){M.ajax(n,a,config.gameid,function(n){var a=n.error-0;switch(a){case 0:i&&i(n);break;default:e(n)}},config.apiopenid,config.apitoken,config.isDebug?"nf":"")}function i(e,a){switch(localStorage.language){case"cn":break;case"en":languagePack[config.shareInfo.title]&&(config.shareInfo.title=languagePack[config.shareInfo.title]),languagePack[config.shareInfo.desc]&&(config.shareInfo.desc=languagePack[config.shareInfo.desc])}n.initWx(e,config.gameid,config.apiopenid,config.apitoken,a,null,null,null)}amendPageStyle();var t=getUrlParam().id,o={orderDetail:function(n){a("mall/order/detail",{id:t},function(e){n&&n(e)})},cancel:function(n){a("mall/order/cancel",{id:t},function(e){n&&n(e)})},pay:function(n){a("mall/order/wxpay",{id:t},function(e){n&&n(e)})},receive:function(n){a("mall/order/receive",{id:t},function(e){n&&n(e)})},del:function(n){a("mall/order/del",{id:t},function(e){n&&n(e)})}};new Vue({el:"section",data:{pageData:null,cards:null,hasBack:getUrlParam().hasBack},mounted:function(){var n=this;M.loading(),check(oAuth,function(){n.init()})},updated:function(){changeLanguage(),nameFontChange()},methods:{init:function(){var n=this;this.$el.style.display="block",localStorage.pageData=null,o.orderDetail(function(e){n.pageData=e.order,n.cards=JSON.parse(n.pageData.cards),changeLanguage(),nameFontChange(),M.loadingHide(),i(config.shareInfo),console.log(n.pageData)})},cancelHandle:function(){var n=this;M.loading(),o.cancel(function(){o.orderDetail(function(e){M.loadingHide(),n.pageData=e.order})})},payHandle:function(){M.loading(),o.pay(function(n){function e(){WeixinJSBridge.invoke("getBrandWCPayRequest",{appId:n.data.appId,timeStamp:n.data.timeStamp,nonceStr:n.data.nonceStr,"package":n.data.package,signType:n.data.signType,paySign:n.data.paySign},function(n){"get_brand_wcpay_request:ok"==n.err_msg?(M.loadingHide(),gotoUrl("pay-success.html?id="+t)):"get_brand_wcpay_request:cancel"==n.err_msg&&M.loadingHide()})}"undefined"==typeof WeixinJSBridge?document.addEventListener?document.addEventListener("WeixinJSBridgeReady",e,!1):document.attachEvent&&(document.attachEvent("WeixinJSBridgeReady",e),document.attachEvent("onWeixinJSBridgeReady",e)):e()})},receiveHandle:function(){var n=this;M.loading(),o.receive(function(){o.orderDetail(function(e){M.loadingHide(),n.pageData=e.order})})},delHandle:function(){var n=this;M.loading(),o.del(function(){o.orderDetail(function(e){M.loadingHide(),n.pageData=e.order})})},jumpIndex:function(){gotoUrl("index.html")}}})}require([config.configUrl],function(){var e=["wxshare"];require(e,n)})}();