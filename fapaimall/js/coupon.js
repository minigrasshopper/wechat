(function(){
    require([config.configUrl],function(){
        var reqArr = ['wxshare'];
        require(reqArr,requireCb);
    });

    function requireCb(wxshare){
        amendPageStyle();
        var requestObj = {
            couponList: function(cb){
                post('mall/coupon/my', {ucenter: 1}, function(data){
                    cb && cb(data);
                });
            },
            exchange: function(obj, cb){
                post('mall/coupon/exchange', obj, function(data){
                    cb && cb(data);
                });
            }
        };

        new Vue({
            el: 'section',
            data: {
                pageData: {
                    //canuse: [],
                    //expired: [],
                    //used: []
                },
                params: {
                    couponNo: null
                },
                status: 'canuse',
                inputBoxShow: 0    //弹出框是否显示
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
                    requestObj.couponList(function(data){
                        me.pageData = data.list;
                        console.log(me.pageData);
                        changeLanguage();
                        nameFontChange();
                        M.loadingHide();
                        share(config.shareInfo);
                    });
                },
                toggleHandle: function(status){
                    this.status = status;
                },
                addHandle: function(){
                    this.inputBoxShow = 1;
                },
                sureHandle: function(){
                    var me = this;
                    $.each(this.params, function(key, value){
                        me.params[key] = $.trim(value);
                    });
                    if(!this.params.couponNo){
                        changeAlert('请输入兑换券码');
                        return false;
                    }
                    M.loading();
                    //请求后台,成功则关闭弹出框
                    requestObj.exchange(this.params, function(data){
                        me.inputBoxShow = 0;
                        me.params.couponNo = '';  //将值清空
                        requestObj.couponList(function(data){
                            me.pageData = null;
                            me.pageData = data.list;
                            M.loadingHide();
                        });
                    });
                },
                cancelHandle: function(){
                    this.inputBoxShow = 0;
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

