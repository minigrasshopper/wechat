!function(){function n(n){function e(n){var e=n.error-0;switch(M.loadingHide(),e){case 1002:oAuth.clear(),changeAlert("你的身份信息已过期，点击确定刷新页面"),window.location.reload();break;default:changeAlert(n.error_msg)}}function a(n,a,i){M.ajax(n,a,config.gameid,function(n){var a=n.error-0;switch(a){case 0:i&&i(n);break;default:e(n)}},config.apiopenid,config.apitoken,config.isDebug?"nf":"")}function i(e,a){switch(localStorage.language){case"cn":break;case"en":languagePack[config.shareInfo.title]&&(config.shareInfo.title=languagePack[config.shareInfo.title]),languagePack[config.shareInfo.desc]&&(config.shareInfo.desc=languagePack[config.shareInfo.desc])}n.initWx(e,config.gameid,config.apiopenid,config.apitoken,a,null,null,null)}amendPageStyle();var t={orderList:function(n){a("mall/order/list",{},function(e){n&&n(e)})},cancel:function(n,e){a("mall/order/cancel",{id:n},function(n){e&&e(n)})},pay:function(n,e){a("mall/order/wxpay",{id:n},function(n){e&&e(n)})},receive:function(n,e){a("mall/order/receive",{id:n},function(n){e&&e(n)})},del:function(n,e){a("mall/order/del",{id:n},function(n){e&&e(n)})}};new Vue({el:"section",data:{pageData:null,status:getUrlParam().status?getUrlParam().status:"unpaid"},mounted:function(){var n=this;M.loading(),check(oAuth,function(){n.init()})},updated:function(){changeLanguage(),nameFontChange()},methods:{init:function(){var n=this;this.$el.style.display="block",t.orderList(function(e){n.pageData=e.list,console.log(n.pageData),changeLanguage(),nameFontChange(),M.loadingHide(),i(config.shareInfo)})},toggleHandle:function(n){this.status=n},cancelHandle:function(n){var e=this;M.loading(),t.cancel(n,function(){t.orderList(function(n){M.loadingHide(),e.pageData=n.list})})},payHandle:function(n){M.loading(),t.pay(n,function(e){function a(){WeixinJSBridge.invoke("getBrandWCPayRequest",{appId:e.data.appId,timeStamp:e.data.timeStamp,nonceStr:e.data.nonceStr,"package":e.data.package,signType:e.data.signType,paySign:e.data.paySign},function(e){"get_brand_wcpay_request:ok"==e.err_msg?(M.loadingHide(),gotoUrl("pay-success.html?id="+n)):"get_brand_wcpay_request:cancel"==e.err_msg&&M.loadingHide()})}"undefined"==typeof WeixinJSBridge?document.addEventListener?document.addEventListener("WeixinJSBridgeReady",a,!1):document.attachEvent&&(document.attachEvent("WeixinJSBridgeReady",a),document.attachEvent("onWeixinJSBridgeReady",a)):a()})},receiveHandle:function(n){var e=this;M.loading(),t.receive(n,function(){t.orderList(function(n){M.loadingHide(),e.pageData=n.list})})},delHandle:function(n){var e=this;M.loading(),t.del(n,function(){t.orderList(function(n){M.loadingHide(),e.pageData=n.list})})},jumpOrderDetail:function(n){gotoUrl("order-detail.html?id="+n+"&hasBack=1")}}})}require([config.configUrl],function(){var e=["wxshare"];require(e,n)})}();