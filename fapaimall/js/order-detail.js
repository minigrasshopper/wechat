(function(){
    require([config.configUrl],function(){
        var reqArr = ['wxshare'];
        require(reqArr,requireCb);
    });

    function requireCb(wxshare){
        amendPageStyle();
        var order_id = getUrlParam().id;
        var requestObj = {
            orderDetail : function(cb){
                post('mall/order/detail', {id: order_id}, function(data){
                    cb && cb(data);
                });
            },
            cancel: function(cb){   //取消订单
                post('mall/order/cancel',{id: order_id},function(data){
                    cb && cb(data);
                });
            },
            pay: function(cb){  //支付
                post('mall/order/wxpay',{id: order_id},function(data){
                    cb && cb(data);
                });
            },
            receive: function(cb){  //确认收货
                post('mall/order/receive',{id: order_id},function(data){
                    cb && cb(data);
                });
            },
            del: function(cb){  //删除
                post('mall/order/del',{id: order_id},function(data){
                    cb && cb(data);
                });
            }
        };

        new Vue({
            el: 'section',
            data: {
                pageData: null,
                cards: null,
                hasBack: getUrlParam().hasBack  //是否有返回
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
                    localStorage.pageData = null;   //清掉
                    //localStorage.goodsId = 0;   //不清掉，用于返回到创建订单页的判断依据
                    requestObj.orderDetail(function(data){
                        me.pageData = data.order;
                        me.cards = JSON.parse(me.pageData.cards);
                        changeLanguage();
                        nameFontChange();
                        M.loadingHide();
                        share(config.shareInfo);
                        console.log(me.pageData);
                    });
                },
                cancelHandle: function(){
                    var me = this;
                    M.loading();
                    requestObj.cancel(function(){
                        requestObj.orderDetail(function(data){
                            M.loadingHide();
                            me.pageData = data.order;
                        });
                    });
                },
                payHandle: function(){
                    M.loading();
                    requestObj.pay(function(data){
                        function onBridgeReady(){
                            WeixinJSBridge.invoke(
                                'getBrandWCPayRequest', {
                                    "appId" : data.data.appId,
                                    "timeStamp" : data.data.timeStamp,         //时间戳，自1970年以来的秒数
                                    "nonceStr" : data.data.nonceStr, //随机串
                                    "package" : data.data.package,
                                    "signType" : data.data.signType,         //微信签名方式：
                                    "paySign" : data.data.paySign //微信签名
                                },
                                function(res){
                                    if(res.err_msg == "get_brand_wcpay_request:ok") {
                                        M.loadingHide();
                                        //跳到付款成功页面
                                        gotoUrl('pay-success.html'+ '?id=' + order_id);
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
                    });
                },
                receiveHandle: function(){
                    var me = this;
                    M.loading();
                    requestObj.receive(function(){
                        requestObj.orderDetail(function(data){
                            M.loadingHide();
                            me.pageData = data.order;
                        });
                    });
                },
                delHandle: function(){
                    var me = this;
                    M.loading();
                    requestObj.del(function(){
                        requestObj.orderDetail(function(data){
                            M.loadingHide();
                            me.pageData = data.order;
                        });
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
                        //alert(JSON.stringify(data));
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

