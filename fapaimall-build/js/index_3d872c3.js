!function(){function a(a,t){function e(a){var t=a.error-0;switch(M.loadingHide(),t){case 1002:oAuth.clear(),changeAlert("你的身份信息已过期，点击确定刷新页面"),window.location.reload();break;default:changeAlert(a.error_msg)}}function o(a,t,o){M.ajax(a,t,config.gameid,function(a){var t=a.error-0;switch(t){case 0:o&&o(a);break;default:e(a)}},config.apiopenid,config.apitoken,config.isDebug?"nf":"")}function n(t,e){switch(localStorage.language){case"cn":break;case"en":languagePack[t.title]&&(t.title=languagePack[t.title]),languagePack[t.desc]&&(t.desc=languagePack[t.desc])}a.initWx(t,config.gameid,config.apiopenid,config.apitoken,e,null,null,null)}amendPageStyle();var i={goodsCate:function(a){o("mall/goods/cate",{},function(t){a&&a(t)})},goodsList:function(a,t){o("mall/goods/list",a,function(a){t&&t(a)})}};new Vue({el:"section",beforeCreate:function(){var a=2592e5;if(localStorage.city){var t=(new Date).getTime();t-localStorage.preTime>a&&(localStorage.city="",localStorage.preTime=(new Date).getTime())}else localStorage.preTime=(new Date).getTime()},data:{pageData:[],cateArr:sessionStorage.getItem("cateArr")?JSON.parse(sessionStorage.getItem("cateArr")):null,cartNum:localStorage.cartNum?localStorage.cartNum:null,lang_cn:localStorage.language,params:{categoryid:null,keyword:null},city:"",showAll:1==localStorage.showAll?1:0,cityBoxShow:localStorage.city?!1:!0,cityList:[{city:"北京",showAll:1},{city:"其他",showAll:0}]},mounted:function(){var a=this;M.loading(),check(oAuth,function(){a.init()})},updated:function(){changeLanguage(),nameFontChange();var a=$(".goodListLimit");$.each(a,function(a,t){var e=$(t).find("li");if(e.length>4){$(e).hide();for(var o=0;4>o;o++)$(e).eq(o).show()}})},methods:{init:function(){var a=this;this.$el.style.display="block",this.swiperSize(),new t(".swiper-container",{autoplay:2e3,loop:!0,pagination:".pagination"}),i.goodsList(null,function(t){console.log(t),a.pageData=t.goods,changeLanguage(),M.loadingHide(),a.cartNum?a.cateArr?n(config.shareInfo):(M.loading(),i.goodsCate(function(t){a.cateArr=t.cates,sessionStorage.setItem("cateArr",JSON.stringify(a.cateArr)),M.loadingHide(),a.cartNum?n(config.shareInfo):(M.loading(),getCartNum("mall/cart/list",{},function(t){a.cartNum=t.length,localStorage.cartNum=a.cartNum,M.loadingHide(),n(config.shareInfo)}))})):(M.loading(),getCartNum("mall/cart/list",{},function(t){a.cartNum=t.length,localStorage.cartNum=a.cartNum,M.loadingHide(),a.cateArr?n(config.shareInfo):(M.loading(),i.goodsCate(function(t){a.cateArr=t.cates,sessionStorage.setItem("cateArr",JSON.stringify(a.cateArr)),M.loadingHide(),n(config.shareInfo)}))}))}),console.log(a.cateArr)},swiperSize:function(){var a=$("body").width();$(".swiper-container").height(400*a/640)},inputHandle:function(a){var t=this;t.pageData=[];var e=a.currentTarget;this.params.keyword=$(e).val(),i.goodsList(this.params,function(a){t.pageData=a.goods})},jumpGoodDetail:function(a){gotoUrl("good-detail.html?goodsId="+a)},jumpGoodList:function(a,t){gotoUrl("good-list.html?name="+a+"&category_id="+t)},toggleLang:function(a){this.lang_cn=a,localStorage.language=a,gotoUrl(config.htmlUrl+"index.html?md5="+new Date)},selectCity:function(a,t){this.city=a,this.showAll=t,localStorage.city=a,localStorage.showAll=t},cityHandle:function(){this.city?this.cityBoxShow=!1:changeAlert("请选择")}}})}require([config.configUrl],function(){var t=["wxshare","swiper"];require(t,a)})}();