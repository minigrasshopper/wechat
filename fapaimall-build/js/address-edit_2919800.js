!function(){function a(a){function e(a){var e=a.error-0;switch(M.loadingHide(),e){case 1002:oAuth.clear(),changeAlert("你的身份信息已过期，点击确定刷新页面"),window.location.reload();break;default:changeAlert(a.error_msg)}}function t(a,t,i){M.ajax(a,t,config.gameid,function(a){var t=a.error-0;switch(t){case 0:i&&i(a);break;default:e(a)}},config.apiopenid,config.apitoken,config.isDebug?"nf":"")}function i(e,t){switch(e.link=config.htmlUrl+"index.html?channelid="+sessionStorage.getItem("channelid"),localStorage.language){case"cn":break;case"en":languagePack[config.shareInfo.title]&&(config.shareInfo.title=languagePack[config.shareInfo.title]),languagePack[config.shareInfo.desc]&&(config.shareInfo.desc=languagePack[config.shareInfo.desc])}a.initWx(e,config.gameid,config.apiopenid,config.apitoken,t,null,null,null)}amendPageStyle();var n={create:function(a,e){t("mall/i/address/create",a,function(a){e&&e(a)})},update:function(a,e){t("mall/i/address/update",a,function(a){e&&e(a)})}};new Vue({el:"section",data:{order:getUrlParam().order?getUrlParam().order:null,language:localStorage.language?localStorage.language:"cn",city:getUrlParam().address?JSON.parse(getUrlParam().address).city:"",params:getUrlParam().address?JSON.parse(getUrlParam().address):{consignee:null,cellphone:null,city:"",district:"",address:null},showAll:1==localStorage.showAll?1:0,cityList:cityList,districtList:null},mounted:function(){var a=this;M.loading(),check(oAuth,function(){a.init()})},updated:function(){changeLanguage(),nameFontChange()},watch:{city:function(){this.params.district="",this.getDistrict()}},methods:{init:function(){this.$el.style.display="block",this.params.gender="male",this.getDistrict(),changeLanguage(),nameFontChange(),M.loadingHide(),i(config.shareInfo)},getDistrict:function(){var a=this;return this.city?void $.each(this.cityList,function(e,t){return t.pn==a.city?(a.districtList=t.cs,!1):void 0}):(a.districtList=null,!1)},sureHandle:function(){var a=this;this.params.city=this.city,$.each(this.params,function(e,t){a.params[e]=$.trim(t)}),this.params.consignee?testTel(this.params.cellphone)&&(this.params.city?this.params.district?this.params.address?(M.loading(),this.params.id?n.update(this.params,function(){M.loadingHide(),gotoUrl("address.html?order="+a.order)}):n.create(this.params,function(){M.loadingHide(),gotoUrl("address.html?order="+a.order)})):changeAlert("请填写街道信息"):changeAlert("请选择配送地址"):changeAlert("请选择配送城市")):changeAlert("请输入姓名")}}})}require([config.configUrl],function(){var e=["wxshare"];require(e,a)})}();