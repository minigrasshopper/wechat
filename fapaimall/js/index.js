(function(){
    require([config.configUrl],function(){
        var reqArr = ['wxshare'];
        require(reqArr,requireCb);
    });

    function requireCb(wxshare){
        var channelid = getUrlParam().channelid ? getUrlParam().channelid : '';
        sessionStorage.setItem('channelid', channelid);
        //sessionStorage.getItem('channelid');
        console.log(sessionStorage.getItem('channelid'));

        amendPageStyle();
        var requestObj = {
            goodsCate: function(cb){     //获取商品列表
                post('mall/goods/cate', {}, function(data){
                    cb && cb(data);
                });
            },
            goodsList: function(obj, cb){     //获取商品列表
                post('mall/goods/list', obj, function(data){
                    cb && cb(data);
                });
            }
        };
        new Vue({
            el: 'section',
            beforeCreate: function () {
                //localStorage.city开始
                var gap = 3600 * 1000 * 24 * 3;     //ms
                // var gap = 3000;     //ms
                /*if(!localStorage.city){
                    localStorage.preTime = new Date().getTime();
                }else{
                    var now = new Date().getTime();
                    if(now - localStorage.preTime > gap){
                        localStorage.city = '';
                        localStorage.preTime = new Date().getTime();
                    }
                }*/
                //localStorage.city结束
            },
            data: {
                pageData: [],
                cateArr: sessionStorage.getItem('cateArr') ? JSON.parse(sessionStorage.getItem('cateArr')) : null,    //蛋糕分类
                cartNum: localStorage.cartNum ? localStorage.cartNum : null,
                lang_cn: localStorage.language,  //当前语言是否是中文
                params: {
                    categoryid: null,   //分类ID
                    keyword: null   //搜索关键词
                },
                city: '',
                showAll: sessionStorage.showAll == 1 ? 1 : 0,   //是否显示所有
                cityBoxShow: sessionStorage.city ? false : true,
                cityList: [
                    {city: '北京', showAll: 1, eName: 'Beijing'},
                    {city: '其他', showAll: 0, eName: 'Other'}
                ],
            },
            mounted: function(){
                var me = this;
                M.loading();
                check(oAuth, function(){
                    me.init();
                });
            },
            updated: function(){
                hasFestival();
                changeLanguage();
                nameFontChange();
                //每个盒子只展示4个
                var uls = $('.goodListLimit');
                $.each(uls, function(index, item){
                    var lis = $(item).find('li');
                    if(lis.length > 4){
                        $(lis).hide();
                        for(var i=0;i<4;i++){
                            $(lis).eq(i).show();
                        }
                    }
                });
            },
            methods: {
                init: function(){
                    var me = this;
                    this.$el.style.display = 'block';
                    //初始化swiper
                    new Swiper('.swiper-container',{
                        autoplay : 2000,    //可选选项，自动滑动
                        loop : true,     //可选选项，开启循环
                        pagination : '.pagination'
                    });
                    this.swiperSize();
                    requestObj.goodsList(null, function(data){
                        console.log(data);
                        me.pageData = data.goods;
                        if(data.double11 == 1){
                            localStorage.hasFestival = 1;
                        }else{
                            localStorage.hasFestival = '';
                        }
                        changeLanguage();
                        M.loadingHide();
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
                    });
                    console.log(me.cateArr);
                },
                swiperSize: function(){
                    var view_width = $('body').width();
                    $('.swiper-container').height(400 * view_width / 640);
                },
                inputHandle: function(event){
                    var me = this;
                    me.pageData = [];   //**清空处理，否则渲染错误[大坑]
                    var target = event.currentTarget;
                    this.params.keyword = $(target).val();
                    requestObj.goodsList(this.params, function(data){
                        me.pageData = data.goods;
                    });
                },
                jumpGoodDetail: function(goodsId){
                    gotoUrl('good-detail.html' + '?goodsId=' + goodsId);
                },
                jumpGoodList: function(name, category_id){
                    gotoUrl('good-list.html' + '?name=' + name + '&category_id=' + category_id);
                },
                toggleLang: function(lang){
                    this.lang_cn = lang;
                    localStorage.language = lang;
                    gotoUrl(config.htmlUrl + 'index.html' + '?md5=' + new Date()); //加时间戳，强制刷新页面【我最棒】
                },
                selectCity: function (city, showAll) {
                    this.city = city;
                    this.showAll = showAll;
                    sessionStorage.city = city;
                    sessionStorage.showAll = showAll;
                },
                cityHandle: function () {
                    if(!this.city){
                        changeAlert('请选择');
                    }else{
                        this.cityBoxShow = false;
                    }
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
                    if(languagePack[shareInfo.title]){
                        shareInfo.title = languagePack[shareInfo.title];
                    }
                    if(languagePack[shareInfo.desc]){
                        shareInfo.desc = languagePack[shareInfo.desc];
                    }
                    break;
            }
            wxshare.initWx(shareInfo,config.gameid,config.apiopenid,config.apitoken,succCb,null,null,null);
        }
        //share(config.shareInfo);
    }
}());

