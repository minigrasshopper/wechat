!function(){function t(t){function a(t,a){return Math.floor(t+Math.random()*(a-t))}function n(t){var a=t.error-0;switch(M.loadingHide(),a){case 1002:oAuth.clear(),changeAlert("你的身份信息已过期，点击确定刷新页面"),window.location.reload();break;default:changeAlert(t.error_msg)}}function o(t,a,o){M.ajax(t,a,config.gameid,function(t){var a=t.error-0;switch(a){case 0:o&&o(t);break;default:n(t)}},config.apiopenid,config.apitoken,config.isDebug?"nf":"")}function e(a,n){switch(a.link=config.htmlUrl+"index.html?channelid="+sessionStorage.getItem("channelid"),localStorage.language){case"cn":break;case"en":languagePack[config.shareInfo.title]&&(config.shareInfo.title=languagePack[config.shareInfo.title]),languagePack[config.shareInfo.desc]&&(config.shareInfo.desc=languagePack[config.shareInfo.desc])}t.initWx(a,config.gameid,config.apiopenid,config.apitoken,n,null,null,null)}amendPageStyle();var i={cartList:function(t){o("mall/cart/list",{},function(a){t&&t(a)})},cartCreate:function(t,a){o("mall/cart/create",{goodsId:t,num:1},function(t){a&&a(t)})},cartSubtract:function(t,a){o("mall/cart/subtract",{goodsId:t},function(t){a&&a(t)})},cartDel:function(t,a){o("mall/cart/del",{goodsId:t},function(t){a&&a(t)})},cartTogglepick:function(t,a){o("mall/cart/togglepick",{goodsId:t},function(t){a&&a(t)})},goodsCate:function(t){o("mall/goods/cate",{},function(a){t&&t(a)})},goodsList:function(t){o("mall/goods/list",{},function(a){t&&t(a)})}};new Vue({el:"section",data:{pageData:[],cartNum:0,showAll:"1"==localStorage.showAll?1:0,cateArr:sessionStorage.getItem("cateArr")?JSON.parse(sessionStorage.getItem("cateArr")):null,otherList:[],isAll:!1},mounted:function(){var t=this;M.loading(),check(oAuth,function(){t.init()})},updated:function(){changeLanguage(),nameFontChange()},methods:{init:function(){var t=this;this.$el.style.display="block",localStorage.pageData=null,localStorage.goodsId=0,i.cartList(function(a){t.pageData=a,t.cartNum=a.length,localStorage.cartNum=t.cartNum,console.log(a),t.judgeAll(),i.goodsList(function(a){var n=a.goods,o=[];"1"!=localStorage.showAll?($.each(n,function(t,a){1!=a.category_id&&2!=a.category_id&&o.push(a)}),console.log(o)):o=n,t.randomList(o),changeLanguage(),nameFontChange(),M.loadingHide(),t.cateArr?e(config.shareInfo):(M.loading(),i.goodsCate(function(a){t.cateArr=a.cates,sessionStorage.setItem("cateArr",JSON.stringify(t.cateArr)),console.log(t.cateArr),M.loadingHide(),e(config.shareInfo)}))})})},judgeAll:function(){var t=this;return 0==this.pageData.length?(this.isAll=!1,!1):(this.isAll=!0,void $.each(this.pageData.goodsList,function(a,n){return 0==n.picked?(t.isAll=!1,!1):void 0}))},randomList:function(t){var n=a(0,t.length);this.otherList.push(t[n]);for(var o=[n];o.length<4;){var e=a(0,t.length),i=0;$.each(o,function(t,a){return e==a?(i=1,!1):void 0}),i||(o.push(e),this.otherList.push(t[e]))}},reduceHandle:function(t){var a=this;M.loading(),i.cartSubtract(t,function(){i.cartList(function(t){M.loadingHide(),a.pageData=t,a.judgeAll(),a.cartNum=t.length,localStorage.cartNum=a.cartNum})})},addHandle:function(t){var a=this;M.loading(),i.cartCreate(t,function(){i.cartList(function(t){M.loadingHide(),a.pageData=t,a.judgeAll(),a.cartNum=t.length,localStorage.cartNum=a.cartNum})})},deleteHandle:function(t){var a=this;M.loading(),i.cartDel(t,function(){i.cartList(function(t){M.loadingHide(),a.pageData=t,a.judgeAll(),a.cartNum=t.length,localStorage.cartNum=a.cartNum})})},selectHandle:function(t){var a=this;M.loading(),i.cartTogglepick(t,function(){i.cartList(function(t){M.loadingHide(),a.pageData=t,a.judgeAll()})})},jumpOrderCreate:function(){var t=!1;$.each(this.pageData.goodsList,function(a,n){return 1==n.picked?(t=!0,!1):void 0}),t?(localStorage.cartNum="",gotoUrl("order-create.html")):changeAlert("未选中商品")},allSelectHandle:function(){var t=this;switch(M.loading(),this.isAll=!this.isAll,this.isAll){case!0:$.each(this.pageData.goodsList,function(a,n){0==n.picked&&i.cartTogglepick(a,function(){i.cartList(function(a){M.loadingHide(),t.pageData=a})})});break;case!1:$.each(this.pageData.goodsList,function(a,n){1==n.picked&&i.cartTogglepick(a,function(){i.cartList(function(a){M.loadingHide(),t.pageData=a})})})}},jumpGoodDetail:function(t){gotoUrl("good-detail.html?goodsId="+t)}}})}require([config.configUrl],function(){var a=["wxshare"];require(a,t)})}();