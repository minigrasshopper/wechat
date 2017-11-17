(function(){
    require([config.configUrl],function(){
        var reqArr = ['wxshare'];
        require(reqArr,requireCb);
    });

    function requireCb(wxshare){
        amendPageStyle();
        var requestObj = {
            cartList : function(cb){     //购物车列表
                post('mall/cart/list', {}, function(data){
                    cb && cb(data);
                });
            },
            cartCreate : function(goodsId, cb){     //购物车添加数量
                post('mall/cart/create', {
                    goodsId: goodsId, //商品ID
                    num: 1  //商品数量
                }, function(data){
                    cb && cb(data);
                });
            },
            cartSubtract : function(goodsId, cb){     //购物车减少数量
                post('mall/cart/subtract', {
                    goodsId: goodsId //商品ID
                }, function(data){
                    cb && cb(data);
                });
            },
            cartDel : function(goodsId, cb){     //购物车删除商品
                post('mall/cart/del', {
                    goodsId: goodsId //商品ID
                }, function(data){
                    cb && cb(data);
                });
            },
            cartTogglepick : function(goodsId, cb){     //购物车商品选中、取消
                post('mall/cart/togglepick', {
                    goodsId: goodsId //商品ID
                }, function(data){
                    cb && cb(data);
                });
            },
            goodsCate: function(cb){     //获取商品列表
                post('mall/goods/cate', {}, function(data){
                    cb && cb(data);
                });
            },
            goodsList : function(cb){     //获取商品列表
                post('mall/goods/list', {}, function(data){
                    cb && cb(data);
                });
            }
        };

        new Vue({
            el: 'section',
            data: {
                pageData: [],   //购物车信息
                cartNum: 0,
                showAll: localStorage.showAll == '1' ? 1 : 0,
                cateArr: sessionStorage.getItem('cateArr') ? JSON.parse(sessionStorage.getItem('cateArr')) : null,    //蛋糕分类
                otherList: [],   //其他推荐
                isAll: false     //是否全选
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
                    localStorage.pageData = null;   //清掉
                    localStorage.goodsId = 0;   //清掉
                    requestObj.cartList(function(data){
                        me.pageData = data;
                        me.cartNum = data.length;
                        localStorage.cartNum = me.cartNum;
                        console.log(data);
                        me.judgeAll();
                        requestObj.goodsList(function(data){
                            var goods = data.goods;
                            var arr = [];
                            if(localStorage.showAll != '1'){
                                $.each(goods, function (index, value) {
                                    if(value.category_id != 1 && value.category_id != 2 && value.category_id != 16){
                                        arr.push(value);
                                    }
                                });
                                console.log(arr);
                            }else{
                                arr = goods;
                            }
                            me.randomList(arr);
                            changeLanguage();
                            nameFontChange();
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
                    });
                },
                judgeAll: function(){
                    var me = this;
                    if(this.pageData.length == 0){
                        this.isAll = false;
                        return false;
                    }
                    this.isAll = true;
                    $.each(this.pageData.goodsList, function(key, item){
                        if(item.picked == 0){
                            me.isAll = false;
                            return false;
                        }
                    });
                },
                randomList: function(arr){
                    var first = random(0, arr.length);
                    this.otherList.push(arr[first]);
                    var obj = [first];
                    while(obj.length < 4){
                        var i = random(0, arr.length);
                        var ishas = 0;  //是否存在
                        $.each(obj, function(n, m){
                            if(i == m){
                                ishas = 1;
                                return false;
                            }
                        });
                        if(!ishas){
                            obj.push(i);
                            this.otherList.push(arr[i]);
                        }
                    }
                },
                reduceHandle: function(goodsId){
                    var me = this;
                    M.loading();
                    requestObj.cartSubtract(goodsId, function(){
                        requestObj.cartList(function(data){
                            M.loadingHide();
                            me.pageData = data;
                            me.judgeAll();
                            me.cartNum = data.length;
                            localStorage.cartNum = me.cartNum;
                        });
                    });
                },
                addHandle: function(goodsId){
                    var me = this;
                    M.loading();
                    requestObj.cartCreate(goodsId, function(){
                        requestObj.cartList(function(data){
                            M.loadingHide();
                            me.pageData = data;
                            me.judgeAll();
                            me.cartNum = data.length;
                            localStorage.cartNum = me.cartNum;
                        });
                    });
                },
                deleteHandle: function(goodsId){
                    var me = this;
                    M.loading();
                    requestObj.cartDel(goodsId, function(){
                        me.pageData = [];
                        requestObj.cartList(function(data){
                            M.loadingHide();
                            me.pageData = data;
                            me.judgeAll();
                            me.cartNum = data.length;
                            localStorage.cartNum = me.cartNum;
                        });
                    });
                },
                selectHandle: function(goodsId){
                    var me = this;
                    M.loading();
                    requestObj.cartTogglepick(goodsId, function(){
                        requestObj.cartList(function(data){
                            M.loadingHide();
                            me.pageData = data;
                            me.judgeAll();
                        });
                    });
                },
                jumpOrderCreate: function(){
                    var canJump = false;
                    $.each(this.pageData.goodsList, function(key, item){
                        if(item.picked == 1){
                            canJump = true;
                            return false;
                        }
                    });
                    if(canJump){
                        localStorage.cartNum = '';    //购物车数量变化，清空数据
                        gotoUrl('order-create.html');
                    }else{
                        changeAlert('未选中商品');
                    }
                },
                allSelectHandle: function(){
                    //全选
                    var me = this;
                    M.loading();
                    this.isAll = !this.isAll;
                    switch(this.isAll){
                        case true:
                            //全选
                            $.each(this.pageData.goodsList, function(key, item){
                                if(item.picked == 0){
                                    requestObj.cartTogglepick(key, function(){
                                        requestObj.cartList(function(data){
                                            M.loadingHide();
                                            me.pageData = data;
                                        });
                                    });
                                }
                            });
                            break;
                        case false:
                            //全不选
                            $.each(this.pageData.goodsList, function(key, item){
                                if(item.picked == 1){
                                    requestObj.cartTogglepick(key, function(){
                                        requestObj.cartList(function(data){
                                            M.loadingHide();
                                            me.pageData = data;
                                        });
                                    });
                                }
                            });
                            break;
                    }

                },
                jumpGoodDetail: function(goodsId){
                    gotoUrl('good-detail.html' + '?goodsId=' + goodsId);
                }
            }
        });

        function random(min,max){
            return Math.floor(min+Math.random()*(max-min));
        }

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
