!function(){function a(a){function e(a){var e=a.error-0;switch(M.loadingHide(),e){case 1002:oAuth.clear(),changeAlert("你的身份信息已过期，点击确定刷新页面"),window.location.reload();break;default:changeAlert(a.error_msg)}}function t(a,t,i){M.ajax(a,t,config.gameid,function(a){var t=a.error-0;switch(t){case 0:i&&i(a);break;default:e(a)}},config.apiopenid,config.apitoken,config.isDebug?"nf":"")}function i(e,t){switch(localStorage.language){case"cn":break;case"en":languagePack[config.shareInfo.title]&&(config.shareInfo.title=languagePack[config.shareInfo.title]),languagePack[config.shareInfo.desc]&&(config.shareInfo.desc=languagePack[config.shareInfo.desc])}a.initWx(e,config.gameid,config.apiopenid,config.apitoken,t,null,null,null)}amendPageStyle();var o={precreate:function(a){t("mall/order/precreate",{},function(e){a&&a(e)})},exchange:function(a){t("mall/coupon/exchange",{couponNo:a},function(a){cb&&cb(a)})},create:function(a,e){t("mall/order/create",a,function(a){e&&e(a)})}};new Vue({el:"section",data:{pageData:localStorage.pageData?JSON.parse(localStorage.pageData):null,goodsId:localStorage.goodsId?localStorage.goodsId:0,language:localStorage.language?localStorage.language:"cn",params:getUrlParam().order?JSON.parse(getUrlParam().order):{goodsId:0,goodsNum:0,delivery_type:1,merchantid:"",mobile:null,pickupdate:null,pickuptime:null,addressId:null,deliverydate:null,deliverytime:null,withcard:0,cardtitle:null,needinvoice:0,invoiceId:null,remark:null,withcoupon:0,couponlogid:null,couponNo:null,couponQname:"无可用",money:0,cards:{},totalFee:0,relFee:0,withcash:0,cashmoney:0}},mounted:function(){var a=this;M.loading(),check(oAuth,function(){a.init()})},updated:function(){changeLanguage(),nameFontChange()},methods:{init:function(){var a=this;this.$el.style.display="block",this.pageData?(this.dataOrigin(),console.log(this.pageData)):o.precreate(function(e){a.pageData=e,a.dataOrigin(),console.log(a.pageData)})},dataOrigin:function(){if(!this.pageData.cartGoodsList.length)return gotoUrl("index.html"),!1;if(0!=localStorage.goodsId&&!JSON.parse(localStorage.pageData))return gotoUrl("index.html"),!1;if(this.pageData.addressList.length&&(this.params.addressId=this.pageData.addressList[0].id),this.pageData.invoiceList.length&&(this.params.invoiceId=this.pageData.invoiceList[0].id),getUrlParam().order)i(config.shareInfo);else{this.pageData.couponList.length&&(this.params.withcoupon=1),this.pageData.couponList.length&&(this.params.couponlogid=this.pageData.couponList[0].couponlogid),this.pageData.couponList.length&&(this.params.couponNo=this.pageData.couponList[0].couponNo),this.pageData.couponList.length&&(this.params.couponQname=this.pageData.couponList[0].qname),this.pageData.couponList.length&&(this.params.money=this.pageData.couponList[0].money);var a={};$.each(this.pageData.cartGoodsList,function(e,t){if(1==t.iscake){a[t.goods_id]=[];for(var i=0;i<Number(t.count);i++)a[t.goods_id].push({selected:0,wish:""})}}),Vue.set(this.params,"cards",a),this.calcFee(),i(config.shareInfo)}changeLanguage(),nameFontChange(),M.loadingHide(),this.judgeUseCash()},judgeUseCash:function(){var a=0,e=100*parseFloat(this.params.totalFee),t=0,i=0,o=0,n=0,s=100*parseFloat(this.pageData.cash);this.JudgeDeliveryFee()&&(t=100*parseFloat(this.pageData.fee_delivery)),a=e+t,1==this.params.withcoupon&&(i=100*parseFloat(this.params.money)),n=a-i,0>=n&&(n=0),1==this.params.withcash&&(o=0>=n?0:s>=n?n:s),this.params.cashmoney=o/100,this.params.relFee=(n-o)/100},sureHandle:function(){function a(){var a=!0;return $.each(e.params.cards,function(t,i){return $.each(i,function(t,i){return 1!=i.selected||(e.params.withcard=1,i.wish)?void 0:(changeAlert("请输入巧克力生日牌上的文字"),a=!1,!1)}),a?void 0:!1}),a?!0:!1}var e=this;if($.each(this.params,function(a,t){"object"!=typeof t&&(e.params[a]=$.trim(t))}),!a())return!1;if(1==this.params.delivery_type){if(!this.params.merchantid)return changeAlert("请选择取货门店"),!1;if(!testMobile(this.params.mobile))return!1;if(!this.params.pickupdate)return changeAlert("请选择日期"),!1;if(!this.params.pickuptime)return changeAlert("请选择时间段"),!1}else{if(!this.params.addressId)return changeAlert("请选择收货地址"),!1;if(!this.params.deliverydate)return changeAlert("请选择日期"),!1;if(!this.params.deliverytime)return changeAlert("请选择时间段"),!1}return 1!=this.params.needinvoice||this.params.invoiceId?(0!=this.goodsId&&(this.params.goodsId=localStorage.goodsId,this.params.goodsNum=localStorage.goodsNum),M.loading(),void o.create(this.params,function(a){M.loadingHide(),gotoUrl("order-detail.html?id="+a.data.id+"&hasBack=0")})):(changeAlert("请编辑发票信息"),!1)},typeHandle:function(a){this.params.delivery_type=a,this.judgeUseCash()},jumpAddress:function(){gotoUrl("address.html?order="+JSON.stringify(this.params))},getValueByKey:function(a,e,t,i){if(a){var o=null,n=a instanceof Array;return $.each(a,function(a,s){n&&s[t]==e&&(o=s[i])}),o}},dateChangeHandle:function(a){switch(a){case 1:this.params.pickuptime="";break;case 2:this.params.deliverytime=""}},cardHandle:function(a,e){this.params.cards[a][e].selected=1==this.params.cards[a][e].selected?0:1,this.calcFee(),this.judgeUseCash()},calcFee:function(){var a=this;this.params.totalFee=parseFloat(this.pageData.fee),$.each(this.params.cards,function(e,t){$.each(t,function(e,t){1==t.selected&&(a.params.totalFee+=10)})})},JudgeDeliveryFee:function(){return 1==this.params.delivery_type?!1:1==this.pageData.free_delivery?!1:parseFloat(this.params.totalFee)>parseFloat(this.pageData.free_delivery_limit_money)?!1:!0},jumpNew:function(a){switch(a){case"good-detail":gotoUrl("good-detail.html?goodsId="+this.goodsId);break;case"cart":gotoUrl("cart.html")}},cashHandle:function(){this.params.withcash=1==this.params.withcash?0:1,this.judgeUseCash()},invoiceHandle:function(){this.params.needinvoice=1==this.params.needinvoice?0:1,this.judgeUseCash()},jumpInvoice:function(a){gotoUrl(a?"invoice.html?order="+JSON.stringify(this.params)+"&invoice="+JSON.stringify(a):"invoice.html?order="+JSON.stringify(this.params))},jumpOrderCoupon:function(){gotoUrl("order-coupon.html?order="+JSON.stringify(this.params))}}})}require([config.configUrl],function(){var e=["wxshare"];require(e,a)})}();