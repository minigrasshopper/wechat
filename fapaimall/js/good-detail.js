(function(){
    require([config.configUrl],function(){
        var reqArr = ['wxshare'];
        require(reqArr,requireCb);
    });

    function requireCb(wxshare){
        amendPageStyle();
        var requestObj = {
            goodsDetail : function(cb){     //获取商品列表
                post('mall/goods/detailnew', {id: getUrlParam().goodsId}, function(data){
                    cb && cb(data);
                });
            },
            cartCreate : function(obj, cb){     //获取商品列表
                post('mall/cart/create', obj, function(data){
                    cb && cb(data);
                });
            },
            buynow : function(obj, cb){     //获取商品列表
                post('mall/order/buynow', obj, function(data){
                    cb && cb(data);
                });
            }
        };

        new Vue({
            el: 'section',
            data: {
                pageData: null,
                params: {
                    goodsId: getUrlParam().goodsId,
                    num: 1, //加入购物车
                    goodsNum: 1     //直接购买
                },
                hint_show: false
            },
            mounted: function(){
                var me = this;
                //从PC端进入，需要切换语言版本
                if(getUrlParam().lang){
                    localStorage.language = getUrlParam().lang;
                    localStorage.showAll = getUrlParam().showAll;
                    localStorage.city = getUrlParam().city;
                    if(!localStorage.preTime){
                        localStorage.preTime = new Date().getTime();
                    }
                }
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
                    requestObj.goodsDetail(function(data){
                        me.pageData = data.good;
                        console.log(me.pageData);
                        me.$nextTick(function () {
                            changeLanguage();
                            nameFontChange();
                            M.loadingHide();
                            me.$el.style.display = 'block';
                            share(config.shareInfo);
                        })
                    });
                },
                reduceHandle: function(){
                    this.params.num --;
                    this.params.num <= 1 && (this.params.num = 1);
                },
                addHandle: function(){
                    this.params.num++;
                },
                jumpNew: function(){
                    gotoUrl('index.html');
                },
                cartHandle: function(){
                    var me = this;
                    M.loading();
                    requestObj.cartCreate(this.params, function(){
                        //加入购物车提示
                        M.loadingHide();
                        me.hint_show = true;
                        localStorage.cartNum = '';    //购物车数量变化，清空数据
                        setTimeout(function(){
                            me.hint_show = false;
                        }, 1200);
                    });
                },
                buyHandle: function(){
                    var me = this;
                    this.params.goodsNum = this.params.num;
                    M.loading();
                    requestObj.buynow(this.params, function(data){
                        //加入购物车提示
                        M.loadingHide();
                        localStorage.pageData = JSON.stringify(data);   //在购物车进入时清掉
                        localStorage.goodsId = me.params.goodsId;   //在购物车进入时清掉
                        localStorage.goodsNum = me.params.goodsNum;   //在购物车进入时清掉
                        gotoUrl('order-create.html');
                    });
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

