(function () {
    requirejs([config.configUrl], function () {
        requirejs(['http', 'vue', 'commonService', 'wxshare', 'bar_qr'], requireCb);
    });

    function requireCb(http, Vue, commonService, wxshare, bar_qr) {
        var prizePage, verifyPage;
        var selfData = {
            title: '甜点消消乐', // 活动标题
            prize: {
                prize_bg: 'images/prize_bg.jpg',
                btn_back: 'images/btn_back.png',
                ticket_bg: 'images/ticket_bg.png'
            }
        };

        var httpService = {
            index: function(cb){
                http.getJSON(config, 'active/index', {gp: config.gp}, function(data){
                    cb && cb(data);
                });
            },
            mycoupon: function(cb){
                http.getJSON(config, 'active/mycoupon', {gp: config.gp}, function(data){
                    cb && cb(data);
                });
            },
            checkpsd: function(params, cb){
                http.getJSON(config, 'active/couponconsume', params, function(data){
                    cb && cb(data);
                });
            }
        };

        prizePage = new Vue({
            el: '#prizePage',
            data: {
                selfData: selfData,
                coupon: [],
                styles: {
                    bg: "background-image: url('" + selfData.prize.prize_bg + "')",
                    ticket: "background-image: url('" + selfData.prize.ticket_bg + "')"
                },
            },
            methods: {
                init: function () {
                    var self = this;
                    httpService.mycoupon(function (data) {
                        self.coupon = data.coupon;
                        self.$el.style.display = 'block';
                        wxshare.init(config);
                    });
                },
                verifyHandle: function (info) {
                    if(info.consumemethod == 0 && info.isnet == 1){
                        jumpUrl(info.useurl);
                    }else{
                        this.$el.style.display = 'none';
                        verifyPage.init(info);
                    }
                },
                backHandle: function () {
                    jumpUrl('index.html');
                }
            }
        });

        verifyPage = new Vue({
            el: '#verifyPage',
            data: {
                item: null,
                password: '',
            },
            mounted: function () {
            },
            updated: function () {
                bar_qr.barcode($('#barcode'), this.item.code);
                bar_qr.qrcode($('#qrcode'), this.item.code);
                this.$el.style.display = 'block';
            },
            methods: {
                init: function (info) {
                    console.log(info);
                    this.item = info;
                    this.password = '';
                },
                textConvert: function(str) {
                    // br表示换行
                    var textArr = str.split('br');
                    var html = '';
                    textArr.forEach(function(item, index, arr){
                        html += "<p>" + item + "</p>"
                    });
                    return html;
                },
                closeHandle: function () {
                    this.$el.style.display = 'none';
                    prizePage.init();
                },
                checkHandle: function () {
                    if(!this.password){
                        commonService.tips('密码不能为空！');
                    }else{
                        httpService.checkpsd({
                            code : this.item.code,
                            password : this.password,
                            gp : config.gp
                        }, function (data) {
                            commonService.tips(data.error_msg);
                            window.location.reload();
                        });
                    }
                }
            }
        });

        function selfDataInit(cb){
            httpService.index(function (data) {
                selfData.title = data.cfg.title;
                config.shareInfo.title = data.cfg.sharetitle;
                config.shareInfo.desc = data.cfg.sharecontent;
                config.shareInfo.imgUrl = data.cfg.sharepic;
                /*$.each(data.cfg.activesetting.imgs, function(key, value){
                    if(selfData.prize.hasOwnProperty(key)){
                        selfData.prize[key] = value;
                    }
                });*/
                $('head').find('title').text(selfData.title);
                cb && cb();
            })
        }

        commonService.oauth(config, function () {
            selfDataInit(function () {
                prizePage.init();
            });
        })
    }
}());
