(function(){
    require([config.configUrl],function(){
        var reqArr = ['wxshare'];
        require(reqArr,requireCb);
    });

    function requireCb(wxshare){
        amendPageStyle();
        var requestObj = {
            orderList: function(cb){
                post('mall/order/list',{},function(data){
                    cb && cb(data);
                });
            },
            cancel: function(id, cb){   //取消订单
                post('mall/order/cancel',{id: id},function(data){
                    cb && cb(data);
                });
            },
            pay: function(id, cb){  //支付
                post('mall/order/wxpay',{id: id},function(data){
                    cb && cb(data);
                });
            },
            receive: function(id,cb){  //确认收货
                post('mall/order/receive',{id: id},function(data){
                    cb && cb(data);
                });
            },
            del: function(id, cb){  //删除
                post('mall/order/del',{id: id},function(data){
                    cb && cb(data);
                });
            }
        };

        new Vue({
            el: 'section',
            data: {
                pageData: null,
                status: getUrlParam().status ? getUrlParam().status : 'unpaid'
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
                    requestObj.orderList(function(data){
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
                cancelHandle: function(id){
                    var me = this;
                    M.loading();
                    requestObj.cancel(id, function(){
                        me.pageData = [];
                        requestObj.orderList(function(data){
                            M.loadingHide();
                            me.pageData = data.list;
                        });
                    });
                },
                payHandle: function(order_id){
                    M.loading();
                    requestObj.pay(order_id, function(data){
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
                receiveHandle: function(id){
                    var me = this;
                    M.loading();
                    requestObj.receive(id, function(){
                        me.pageData = [];
                        requestObj.orderList(function(data){
                            M.loadingHide();
                            me.pageData = data.list;
                        });
                    });
                },
                delHandle: function(id){
                    var me = this;
                    M.loading();
                    requestObj.del(id, function(){
                        me.pageData = [];
                        requestObj.orderList(function(data){
                            M.loadingHide();
                            me.pageData = data.list;
                        });
                    });
                },
                jumpOrderDetail: function(id){
                    gotoUrl('order-detail.html' + '?id=' + id + '&hasBack=1');
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

