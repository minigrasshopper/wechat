!function(){function e(e){function a(e){var a=e.error-0;switch(M.loadingHide(),a){case 1002:oAuth.clear(),changeAlert("你的身份信息已过期，点击确定刷新页面"),window.location.reload();break;default:changeAlert(e.error_msg)}}function n(e,n,i){M.ajax(e,n,config.gameid,function(e){var n=e.error-0;switch(n){case 0:i&&i(e);break;default:a(e)}},config.apiopenid,config.apitoken,config.isDebug?"nf":"")}function i(a,n){switch(a.link=config.htmlUrl+"index.html?channelid="+sessionStorage.getItem("channelid"),localStorage.language){case"cn":break;case"en":languagePack[config.shareInfo.title]&&(config.shareInfo.title=languagePack[config.shareInfo.title]),languagePack[config.shareInfo.desc]&&(config.shareInfo.desc=languagePack[config.shareInfo.desc])}e.initWx(a,config.gameid,config.apiopenid,config.apitoken,n,null,null,null)}amendPageStyle();var t={rechargeList:function(e){n("member/recharge",{},function(a){e&&e(a)})},cardRecharge:function(e,a){n("mall/coupon/recharge",e,function(e){a&&a(e)})},getjsapiparams:function(e,a){n("wxpay/getjsapiparams",e,function(e){a&&a(e)})}};new Vue({el:"section",data:{pageData:[],params:{channel:"letwxmember",money:0,type:2,shopid:0,channelid:sessionStorage.getItem("channelid")},card_params:{couponNo:null},type:1},mounted:function(){var e=this;M.loading(),check(oAuth,function(){e.init()})},updated:function(){changeLanguage(),nameFontChange()},methods:{init:function(){var e=this;this.$el.style.display="block",t.rechargeList(function(a){e.pageData=a.data,console.log(e.pageData),changeLanguage(),nameFontChange(),M.loadingHide(),i(config.shareInfo)})},toggleType:function(e){this.type=e},selectHandle:function(e,a){var n=a.currentTarget;$(n).parents("ul").find("li.active").removeClass("active"),$(n).addClass("active"),this.params.money=e},getjsapiparamsCb:function(e){function a(){WeixinJSBridge.invoke("getBrandWCPayRequest",{appId:e.params.appId,timeStamp:e.params.timeStamp,nonceStr:e.params.nonceStr,"package":e.params.package,signType:e.params.signType,paySign:e.params.paySign},function(e){"get_brand_wcpay_request:ok"==e.err_msg?(M.loadingHide(),changeAlert("充值成功")):"get_brand_wcpay_request:cancel"==e.err_msg&&M.loadingHide()})}"undefined"==typeof WeixinJSBridge?document.addEventListener?document.addEventListener("WeixinJSBridgeReady",a,!1):document.attachEvent&&(document.attachEvent("WeixinJSBridgeReady",a),document.attachEvent("onWeixinJSBridgeReady",a)):a()},sureHandle:function(){var e=this;return 0==this.params.money?(changeAlert("请选择套餐"),!1):(M.loading(),void t.getjsapiparams(this.params,function(a){e.getjsapiparamsCb(a)}))},sureHandle1:function(){var e=this;return this.card_params.couponNo?(M.loading(),void t.cardRecharge(this.card_params,function(){M.loadingHide(),changeAlert("充值成功"),e.card_params.couponNo=null})):(changeAlert("请输入券码"),!1)}}})}require([config.configUrl],function(){var a=["wxshare"];require(a,e)})}();