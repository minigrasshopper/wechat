(function(){
    require([config.configUrl],function(){
        var reqArr = ['wxshare'];
        require(reqArr,requireCb);
    });

    function requireCb(wxshare){
        amendPageStyle();
        var requestObj = {
            account: function(cb){
                post('mall/i/account/info',{},function(data){
                    cb && cb(data);
                });
            },
            goodsCate: function(cb){     //获取商品列表
                post('mall/goods/cate', {}, function(data){
                    cb && cb(data);
                });
            },
            orderList: function(cb){
                post('mall/order/list',{},function(data){
                    cb && cb(data);
                });
            }
        };

        new Vue({
            el: 'section',
            data: {
                pageData: null,
                showAll: localStorage.showAll == '1' ? 1 : 0,
                stateList: {    //订单状态对应的数量
                    unpaid: 0,
                    unshipped: 0,
                    shipped: 0,
                    completed: 0
                },
                params: {
                    goodsId: getUrlParam().id,
                    num: 1
                },
                cartNum: localStorage.cartNum ? localStorage.cartNum : null,
                cateArr: sessionStorage.getItem('cateArr') ? JSON.parse(sessionStorage.getItem('cateArr')) : null    //蛋糕分类
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
                    requestObj.account(function(data){
                        //获取头像信息
                        me.pageData = data;
                        console.log(me.pageData);
                        requestObj.orderList(function(data){
                            //获取订单列表
                            console.log(data);
                            me.getStateNum(data.list);
                            if(!me.cartNum){
                                M.loading();
                                //购物车数量缓存-提升响应
                                getCartNum('mall/cart/list', {}, function(data){
                                    me.cartNum = data.length;
                                    localStorage.cartNum = me.cartNum;
                                    M.loadingHide();
                                    if(!me.cateArr){
                                        //商品分类缓存-提升响应
                                        M.loading();
                                        requestObj.goodsCate(function(data){
                                            me.cateArr = data.cates;
                                            sessionStorage.setItem('cateArr', JSON.stringify(me.cateArr));
                                            console.log(me.cateArr);
                                            M.loadingHide();
                                            share(config.shareInfo);
                                        });
                                    }else{
                                        share(config.shareInfo);
                                    }
                                });
                            }else if(!me.cateArr){
                                //商品分类缓存-提升响应
                                M.loading();
                                requestObj.goodsCate(function(data){
                                    me.cateArr = data.cates;
                                    sessionStorage.setItem('cateArr', JSON.stringify(me.cateArr));
                                    console.log(me.cateArr);
                                    M.loadingHide();
                                    if(!me.cartNum){
                                        M.loading();
                                        //购物车数量缓存-提升响应
                                        getCartNum('mall/cart/list', {}, function(data){
                                            me.cartNum = data.length;
                                            localStorage.cartNum = me.cartNum;
                                            M.loadingHide();
                                            share(config.shareInfo);
                                        });
                                    }else{
                                        share(config.shareInfo);
                                    }
                                });
                            }else{
                                share(config.shareInfo);
                            }
                            changeLanguage();
                            nameFontChange();
                            M.loadingHide();
                        });
                    });
                },
                jumpAddress: function(){
                    gotoUrl('address.html');
                },
                getStateNum: function(arr){
                    var me = this;
                    $.each(arr, function(index, item){
                        switch (item.status){
                            case 'unpaid':
                                me.stateList[item.status] ++;
                                break;
                            case 'unshipped':
                                me.stateList[item.status] ++;
                                break;
                            case 'shipped':
                                me.stateList[item.status] ++;
                                break;
                            case 'completed':
                                me.stateList[item.status] ++;
                                break;
                        }
                    });
                },
                jumpOrderList: function(status){
                    if(status){
                        gotoUrl('order-list.html' + '?status=' + status);
                    }else{
                        gotoUrl('order-list.html');
                    }
                },
                jumpRemain: function(){
                    gotoUrl('remain.html');
                },
                jumpRecharge: function(){
                    gotoUrl('recharge.html');
                },
                jumpCoupon: function(){
                    gotoUrl('coupon.html');
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

