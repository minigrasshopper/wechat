(function(){
    require([config.configUrl],function(){
        var reqArr = ['wxshare'];
        require(reqArr,requireCb);
    });

    function requireCb(wxshare){
        amendPageStyle();
        var requestObj = {
            rechargeList: function(cb){     //套餐充值列表
                post('member/recharge', {}, function(data){
                    cb && cb(data);
                });
            },
            cardRecharge: function(obj, cb){     //储值卡充值
                post('mall/coupon/recharge', obj, function(data){
                    cb && cb(data);
                });
            },
            getjsapiparams: function(obj,cb){
                post('wxpay/getjsapiparams',obj,function(data){
                    cb && cb(data);
                });
            }
        };

        new Vue({
            el: 'section',
            data: {
                pageData: [],
                params: {
                    channel: 'letwxmember',
                    money: 0,
                    type: 2, //1是门店收款，2是充值会员卡 type=2时shopid为0
                    shopid: 0,
                    channelid: sessionStorage.getItem('channelid'),    //渠道id
                },
                card_params: {couponNo: null},
                type: 1 //1-套餐  2-储值卡
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
                    requestObj.rechargeList(function(data){
                        me.pageData = data.data;
                        console.log(me.pageData);
                        changeLanguage();
                        nameFontChange();
                        M.loadingHide();
                        share(config.shareInfo);
                    });
                },
                toggleType: function(type){
                    this.type = type;
                },
                selectHandle: function(money, event){
                    var target = event.currentTarget;
                    $(target).parents('ul').find('li.active').removeClass('active');
                    $(target).addClass('active');
                    this.params.money = money;
                },
                getjsapiparamsCb: function(data){
                    var me = this;
                    function onBridgeReady(){
                        WeixinJSBridge.invoke(
                            'getBrandWCPayRequest', {
                                "appId" : data.params.appId,
                                "timeStamp" : data.params.timeStamp,         //时间戳，自1970年以来的秒数
                                "nonceStr" : data.params.nonceStr, //随机串
                                "package" : data.params.package,
                                "signType" : data.params.signType,         //微信签名方式：
                                "paySign" : data.params.paySign //微信签名
                            },
                            function(res){
                                if(res.err_msg == "get_brand_wcpay_request:ok") {
                                    M.loadingHide();
                                    changeAlert('充值成功');
                                }else if(res.err_msg == "get_brand_wcpay_request:cancel"){
                                    //取消付款
                                    M.loadingHide();
                                }
                            }
                        );
                    }
                    if (typeof WeixinJSBridge == "undefined"){
                        if( document.addEventListener ){
                            document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
                        }else if (document.attachEvent){
                            document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
                            document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
                        }
                    }else{
                        onBridgeReady();
                    }
                },
                sureHandle: function(){
                    var me = this;
                    if(this.params.money == 0){
                        changeAlert('请选择套餐');
                        return false;
                    }
                    M.loading();
                    requestObj.getjsapiparams(this.params, function(data){
                        me.getjsapiparamsCb(data);
                    });
                },
                sureHandle1: function(){
                    var me = this;
                    if(!this.card_params.couponNo){
                        changeAlert('请输入券码');
                        return false;
                    }
                    M.loading();
                    requestObj.cardRecharge(this.card_params, function(data){
                        M.loadingHide();
                        changeAlert('充值成功');
                        me.card_params.couponNo = null;
                    });
                },
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

