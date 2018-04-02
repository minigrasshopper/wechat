(function(){
    require([config.configUrl],function(){
        var reqArr = ['wxshare'];
        require(reqArr,requireCb);
    });

    function requireCb(wxshare){
        amendPageStyle();
        var requestObj = {
            precreate: function(cb){
                post('mall/order/precreate', {}, function(data){
                    cb && cb(data);
                });
            },
            exchange: function(couponNo){   //优惠券兑换
                post('mall/coupon/exchange', {couponNo: couponNo}, function(data){
                    cb && cb(data);
                });
            },
            create: function(obj, cb){
                post('mall/order/create', obj, function(data){
                    cb && cb(data);
                });
            }
        };

        new Vue({
            el: 'section',
            data: {
                pageData: localStorage.pageData ? JSON.parse(localStorage.pageData) : null,
                isnineforward: 0,
                goodsId: localStorage.goodsId ? localStorage.goodsId : 0,
                language: localStorage.language ? localStorage.language : 'cn',
                showAll: sessionStorage.showAll == 1 ? 1 : 0,   //是否显示所有
                addressDefault: null,  //当前默认地址
                params: getUrlParam().order ? JSON.parse(getUrlParam().order) : {  //提交信息
                    //直接购买模式必须，购物车模式不传
                    goodsId: 0, //直接购买商品ID
                    goodsNum: 0, //直接购买商品数量

                    channelid: sessionStorage.getItem('channelid'),    //渠道id
                    delivery_type: 1, //1-门店自提，2-快递到家
                    //门店自提
                    merchantid: '',
                    mobile: null,
                    pickupdate: null,
                    pickuptime: null,
                    //快递到家
                    addressId: null,
                    deliverydate: null,
                    deliverytime: null,
                    //生日牌字段
                    withcard: 0,  //如果有生日牌，值为1
                    cardtitle: null,   //[废弃]
                    //发票字段
                    needinvoice: 0,
                    invoiceId: null,
                    //订单备注
                    remark: null,
                    //优惠券
                    withcoupon: 0,  //是否使用代金券，0-不使用，1-使用
                    couponlogid: null, //领用代金券记录ID
                    couponNo: null,//代金券码
                    couponQname: '无可用',   //代金券的名称【与请求无关】
                    money: 0,   //代金券的金额【与请求无关】
                    //生日牌字段
                    cards: {},
                    totalFee: 0, //蛋糕+生日牌【与请求无关】
                    relFee: 0,   //实付款【与请求无关】
                    //余额
                    withcash: 0, //是否使用余额支付
                    cashmoney: 0 //使用余额金额
                }
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
                    if(!this.pageData){
                        //从购物车进来
                        requestObj.precreate(function(data){
                            me.pageData = data;
                            me.dataOrigin();
                            console.log(me.pageData);
                        });
                    }else{
                        //直接购买[pageData从good-detail页面获得，addressList从接口获得]
                        requestObj.precreate(function(data){
                            me.pageData.addressList = data.addressList;
                            me.dataOrigin();
                            console.log(me.pageData);
                        });
                    }
                    // 判断9点前后
                    var now = new Date();
                    var h = now.getHours();
                    var m = now.getMinutes();
                    var s = now.getSeconds();
                    console.log(h,m);
                    var sum = h * 3600 + m * 60 + s;
                    if(sum > 9 * 3600){
                        this.isnineforward = 0;
                    }else{
                        this.isnineforward = 1;
                    }

                },
                dataOrigin: function(){
                    var me = this;
                    if(!this.pageData.cartGoodsList.length){
                        //1、如果从order-detail页面返回，直接返回首页[购物车购买]
                        gotoUrl('index.html');
                        return false;
                    }
                    if(localStorage.goodsId != 0 && !JSON.parse(localStorage.pageData)){
                        //2、如果从order-detail页面返回，直接返回首页[直接购买]
                        gotoUrl('index.html');
                        return false;
                    }
                    console.log(this.showAll);
                    if(this.showAll == 1){
                        //显示所有，只显示第一个北京地址
                        $.each(this.pageData.addressList, function (index, item) {
                            if(item.city == '北京' || item.city == 'Beijing'){
                                me.addressDefault = item;
                                me.params.addressId = item.id;
                                return false;
                            }
                        });
                    }else{
                        //不显示所有，显示第一个非北京地址
                        $.each(this.pageData.addressList, function (index, item) {
                            if(item.city != '北京' && item.city != 'BeiJing'){
                                me.addressDefault = item;
                                me.params.addressId = item.id;
                                return false;
                            }
                        });
                    }
                    console.log(me.params.addressId);
                    //this.pageData.addressList.length && (this.params.addressId = this.pageData.addressList[0].id);
                    this.pageData.invoiceList.length && (this.params.invoiceId = this.pageData.invoiceList[0].id);
                    if(!getUrlParam().order){
                        //如果从商品详情页进入
                        //1、初始化优惠券
                        this.pageData.couponList.length && (this.params.withcoupon = 1);
                        this.pageData.couponList.length && (this.params.couponlogid = this.pageData.couponList[0].couponlogid);
                        this.pageData.couponList.length && (this.params.couponNo = this.pageData.couponList[0].couponNo);
                        this.pageData.couponList.length && (this.params.couponQname = this.pageData.couponList[0].qname);
                        this.pageData.couponList.length && (this.params.money = this.pageData.couponList[0].money);
                        //2、初始化生日牌字段
                        var cards = {};
                        $.each(this.pageData.cartGoodsList, function(index, item){
                            if(item.iscake == 1){   //如果是蛋糕，才有生日牌
                                cards[item.goods_id] = [];
                                for(var i=0;i<Number(item.count);i++){
                                    cards[item.goods_id].push({selected: 0, wish: ''});
                                }
                            }
                        });
                        Vue.set(this.params, 'cards', cards);
                        //3、初始化费用
                        this.calcFee();
                        share(config.shareInfo);
                    }else{
                        share(config.shareInfo);
                    }
                    changeLanguage();
                    nameFontChange();
                    M.loadingHide();
                    this.judgeUseCash();
                },
                judgeUseCash: function(){
                    //判断使用多少余额
                    var total = 0;  //商品+运费
                    var fee_good = parseFloat(this.params.totalFee) * 100;    //商品总价
                    var fee_delivery = 0;   //运费
                    var fee_coupon = 0; //优惠券
                    var fee_cash = 0;   //使用余额
                    var fee_left = 0;   //减掉优惠券后
                    var cash = parseFloat(this.pageData.cash) * 100; //我的余额

                    if(this.JudgeDeliveryFee()){
                        //需要运费
                        fee_delivery = parseFloat(this.pageData.fee_delivery) * 100;
                    }
                    total = fee_good + fee_delivery;
                    if(this.params.withcoupon == 1){
                        //使用优惠券
                        fee_coupon = parseFloat(this.params.money) * 100; //优惠券
                    }
                    fee_left = total - fee_coupon;
                    if(fee_left <= 0){
                        fee_left = 0;
                    }
                    if(this.params.withcash == 1){
                        //使用余额
                        if(fee_left <= 0){
                            //不需要使用余额支付
                            fee_cash = 0;
                        }else{
                            //需要
                            if(cash >= fee_left){
                                fee_cash = fee_left;
                            }else{
                                fee_cash = cash;
                            }
                        }
                    }
                    this.params.cashmoney = fee_cash / 100;
                    this.params.relFee = (fee_left - fee_cash) / 100;
                },
                sureHandle: function(){
                    var me = this;
                    $.each(this.params, function(key, value){
                        if(typeof value != 'object'){
                            me.params[key] = $.trim(value);
                        }
                    });
                    function judgeCard(){
                        var canSubmit = true;
                        $.each(me.params.cards, function(key, item){
                            $.each(item, function(i, v){
                                if(v.selected == 1){
                                    me.params.withcard = 1;
                                    if(!v.wish){
                                        changeAlert('请输入巧克力生日牌上的文字');
                                        canSubmit = false;
                                        return false;
                                    }
                                }
                            });
                            if(!canSubmit){
                                return false;
                            }
                        });
                        if(!canSubmit){
                            return false;
                        }else{
                            return true;
                        }
                    }
                    if(!judgeCard()){
                        return false;
                    }
                    if(this.params.delivery_type == 1){
                        //门店自提
                        if(!this.params.merchantid){
                            changeAlert('请选择取货门店');
                            return false;
                        }else if(!testMobile(this.params.mobile)){
                            return false;
                        }else if(!this.params.pickupdate){
                            changeAlert('请选择日期');
                            return false;
                        }else if(!this.params.pickuptime){
                            changeAlert('请选择时间段');
                            return false;
                        }
                    }else{
                        //快递到家
                        if(!this.params.addressId ){
                            changeAlert('请选择收货地址');
                            return false;
                        }else if(!this.params.deliverydate){
                            changeAlert('请选择日期');
                            return false;
                        }else if(!this.params.deliverytime){
                            changeAlert('请选择时间段');
                            return false;
                        }
                    }
                    if(this.params.needinvoice == 1 && !this.params.invoiceId){
                        changeAlert('请编辑发票信息');
                        return false;
                    }
                    if(this.goodsId != 0){
                        //直接购买
                        this.params.goodsId = localStorage.goodsId;
                        this.params.goodsNum = localStorage.goodsNum;
                    }
                    M.loading();
                    requestObj.create(this.params, function(data){
                        M.loadingHide();
                        gotoUrl('order-detail.html' + '?id=' + data.data.id + '&hasBack=0');
                    })
                },
                typeHandle: function(type){
                    this.params.delivery_type = type;
                    this.judgeUseCash();
                },
                jumpAddress: function(){
                    gotoUrl('address.html' + '?order=' + JSON.stringify(this.params));
                },
                getValueByKey: function(obj, value, key_in, key_out){
                    //obj-对象\数组   value-查询值
                    //key_in-查询参数  key_out-输出参数
                    if(!obj){
                        return;
                    }
                    var result = null;
                    var isArray = obj instanceof Array;
                    $.each(obj, function(index, item){
                        if(isArray){
                            item[key_in] == value && (result = item[key_out]);
                        }else{

                        }
                    });
                    return result;
                },
                dateChangeHandle: function(type){
                    switch (type){
                        case 1:
                            this.params.pickuptime = '';
                            break;
                        case 2:
                            this.params.deliverytime = '';
                            break;
                    }
                },
                cardHandle: function(id, index){
                    this.params.cards[id][index]['selected'] = this.params.cards[id][index]['selected'] == 1 ? 0 : 1;
                    this.calcFee();
                    this.judgeUseCash();
                },
                calcFee: function(){
                    var me = this;
                    this.params.totalFee = parseFloat(this.pageData.fee);   //每次计算初始化totalFee
                    $.each(this.params.cards, function(key, item){
                        $.each(item, function(k, v){
                            if(v.selected == 1){
                                me.params.totalFee += 10;
                            }
                        });
                    })
                },
                JudgeDeliveryFee: function(){
                    //判断运费
                    if(this.params.delivery_type == 1){
                        //门店自提-无运费
                        return false;
                    }else{
                        //快递到家
                        if(this.pageData.free_delivery == 1){
                            //免费配送
                            return false;
                        }else{
                            //不免费配送
                            if(parseFloat(this.params.totalFee) > parseFloat(this.pageData.free_delivery_limit_money)){
                                //满N免运费
                                return false;
                            }
                        }
                    }
                    return true;
                },
                jumpNew: function(page){
                    switch (page){
                        case 'good-detail':
                            gotoUrl('good-detail.html' + '?goodsId=' + this.goodsId);
                            break;
                        case 'cart':
                            gotoUrl('cart.html');
                            break;
                    }
                },
                cashHandle: function(){
                    this.params.withcash = this.params.withcash == 1 ? 0 : 1;
                    this.judgeUseCash();
                },
                invoiceHandle: function(){
                    this.params.needinvoice = this.params.needinvoice == 1 ? 0 : 1;
                    this.judgeUseCash();
                },
                jumpInvoice: function(invoice){
                    if(invoice){
                        gotoUrl('invoice.html' + '?order=' + JSON.stringify(this.params) + '&invoice=' + JSON.stringify(invoice));
                    }else{
                        gotoUrl('invoice.html' + '?order=' + JSON.stringify(this.params));
                    }
                },
                jumpOrderCoupon: function(){
                    gotoUrl('order-coupon.html' + '?order=' + JSON.stringify(this.params));
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

