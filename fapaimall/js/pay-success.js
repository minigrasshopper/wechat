(function(){
    require([config.configUrl],function(){
        var reqArr = ['wxshare'];
        require(reqArr,requireCb);
    });

    function requireCb(wxshare){
        amendPageStyle();
        var order_id = getUrlParam().id ? getUrlParam().id : 80;
        var requestObj = {
            orderDetail : function(cb){
                post('mall/order/detail', {id: order_id}, function(data){
                    cb && cb(data);
                });
            }
        };

        new Vue({
            el: 'section',
            data: {
                pageData: null
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
            },
            methods: {
                init: function(){
                    var me = this;
                    this.$el.style.display = 'block';
                    requestObj.orderDetail(function(data){
                        me.pageData = data.order;
                        console.log(me.pageData);
                        changeLanguage();
                        nameFontChange();
                        M.loadingHide();
                        share(config.shareInfo);
                    });
                },
                jumpIndex: function(){
                    gotoUrl('index.html');
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

