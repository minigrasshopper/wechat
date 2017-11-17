(function(){
    require([config.configUrl],function(){
        var reqArr = ['wxshare'];
        require(reqArr,requireCb);
    });

    function requireCb(wxshare){
        amendPageStyle();
        var requestObj = {
            goodsList : function(cb){     //获取商品列表
                post('mall/goods/list', {}, function(data){
                    cb && cb(data);
                });
            }
        };

        new Vue({
            el: 'section',
            data: {
                pageData: null,
                name: getUrlParam().name,
                category_id: getUrlParam().category_id    //商品列表的类别
            },
            mounted: function(){
                var me = this;
                M.loading();
                check(oAuth, function(){
                    me.init();
                });
            },
            updated: function(){
                changeLanguage();
                nameFontChange();
                hasFestival();
            },
            methods: {
                init: function(){
                    var me = this;
                    this.$el.style.display = 'block';
                    requestObj.goodsList(function(data){
                        console.log(data);
                        me.pageData = data.goods;
                        changeLanguage();
                        nameFontChange();
                        M.loadingHide();
                        share(config.shareInfo);
                    });
                },
                jumpGoodDetail: function(goodsId){
                    gotoUrl('good-detail.html' + '?goodsId=' + goodsId);
                }
            }
        });

        function defaultError(data){
            var err = data.error - 0;
            M.loadingHide();
            switch(err){
                case 1002:
                    oAuth.clear();
                    changeAlert('你的身份信息已过期，点击确定刷新页面');
                    window.location.reload();
                    break;
                default:
                    changeAlert(data.error_msg);
            }
        }

        function post(action,param,cb){
            M.ajax(action,param,config.gameid,function(data){
                var err = data.error - 0;
                switch(err){
                    case 0:
                        cb && cb(data);
                        break;
                    default:
                        defaultError(data);
                }
            },config.apiopenid,config.apitoken,config.isDebug?'nf':'');
        }

        function share(shareInfo,succCb){
            shareInfo.link = config.htmlUrl + 'index.html?channelid=' + sessionStorage.getItem('channelid');
            switch(localStorage.language){
                case 'cn':
                    break;
                case 'en':
                    if(languagePack[config.shareInfo.title]){
                        config.shareInfo.title = languagePack[config.shareInfo.title];
                    }
                    if(languagePack[config.shareInfo.desc]){
                        config.shareInfo.desc = languagePack[config.shareInfo.desc];
                    }
                    break;
            }
            wxshare.initWx(shareInfo,config.gameid,config.apiopenid,config.apitoken,succCb,null,null,null);
        }
        //share(config.shareInfo);
    }
}());

