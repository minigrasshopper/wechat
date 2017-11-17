(function(){
    require([config.configUrl],function(){
        var reqArr = ['wxshare'];
        require(reqArr,requireCb);
    });

    function requireCb(wxshare){
        amendPageStyle();
        var requestObj = {
            couponList: function(cb){
                post('mall/coupon/my', {fee: JSON.parse(getUrlParam().order).totalFee}, function(data){
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
                pageData: null,
                inputBoxShow: 0,    //弹出框是否显示
                params: {
                    couponNo: null
                },
                order: JSON.parse(getUrlParam().order)
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
                        me.pageData = data.list.canuse;
                        console.log(me.pageData);
                        changeLanguage();
                        nameFontChange();
                        M.loadingHide();
                        share(config.shareInfo);
                    });
                },
                toggleHandle: function(event){
                    var target = event.currentTarget;
                    $(target).parent('ul').find('.selected').removeClass('selected');
                    $(target).addClass('selected');
                },
                selectHandle: function(event, item){
                    var target = event.currentTarget;
                    $(target).siblings('li').find('.show').removeClass('show');
                    var isShow = $(target).find('img').hasClass('show') ? 1 : 0;
                    if(isShow){
                        //不选择
                        $(target).find('img').removeClass('show');
                        this.order.withcoupon = 0;
                        this.order.couponlogid = null;
                        this.order.couponNo = null;
                        this.order.couponQname = '无可用';
                        this.order.money = 0;
                    }else{
                        //选择
                        $(target).find('img').addClass('show');
                        this.order.withcoupon = 1;
                        this.order.couponlogid = item.couponlogid;
                        this.order.couponNo = item.couponNo;
                        this.order.couponQname = item.qname;
                        this.order.money = item.money;
                    }
                },
                jumpNew: function(){
                    gotoUrl('order-create.html' + '?order=' + JSON.stringify(this.order));
                },
                jumpOrderCreate: function(){
                    gotoUrl('order-create.html' + '?order=' + JSON.stringify(this.order));
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
                            me.pageData = data;
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

