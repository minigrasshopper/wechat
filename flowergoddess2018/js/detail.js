(function () {
    requirejs([config.configUrl], function () {
        requirejs(['jsonp', 'jquery', 'commonService', 'wxshare', 'html2canvas'], requireCb);
    });

    function requireCb(JSONP, $, commonService, wxshare, html2canvas) {
        var http = {
            baseUrl: 'http://beautyvote.wx.lppz.com/api/jsapi',
            getJSON: function(config, action, params, cb){
                commonService.loadingShow();
                var callback = "&callback=" + "jsonp";
                var sameKey = '&wxapiopenid=' + config.apiopenid + '&wxapitoken=' + config.apitoken + '&debug=nf';
                JSONP.getJSON(this.baseUrl + '?action=' + action + '&params=' + JSON.stringify(params) + callback, sameKey, function (data) {
                    console.log(data);
                    commonService.loadingHide();
                    switch (data.error - 0) {
                        case 0:
                            cb && cb(data);
                            break;
                        default:
                            commonService.tips(data.error_msg, 'error');
                            break;
                    }
                });
            },
            getJSON_noloading: function(config, action, params, cb){
                var callback = "&callback=" + "jsonp";
                var sameKey = '&wxapiopenid=' + config.apiopenid + '&wxapitoken=' + config.apitoken + '&debug=nf';
                JSONP.getJSON(this.baseUrl + '?action=' + action + '&params=' + JSON.stringify(params) + callback, sameKey, function (data) {
                    console.log(data);
                    switch (data.error - 0) {
                        case 0:
                            cb && cb(data);
                            break;
                        default:
                            commonService.tips(data.error_msg, 'error');
                            break;
                    }
                });
            },
        };
        function post_json(config, action, params, cb){
            var baseUrl = 'http://beautyvote.wx.lppz.com/api/jsapi';
            var self = this;
            commonService.loadingShow();
            var sameKey =  '&wxapiopenid=' + config.apiopenid + '&wxapitoken=' + config.apitoken + '&debug=nf';
            $.post(baseUrl + '?action=' + action + sameKey, params, function (data) {
                console.log(data);
                commonService.loadingHide();
                switch (data.error - 0) {
                    case 0:
                        cb && cb(data);
                        break;
                    default:
                        commonService.tips(data.error_msg, 'error');
                        break;
                }
            }, 'json');
        }

        var httpService = {
            sharelog: function(type, cb){
                http.getJSON(config, 'sharelog', {
                    type: type,
                    page: 'detail'
                }, function(data){
                    cb && cb(data);
                });
            },
            setting: function(cb){
                http.getJSON(config, 'beautyvote/setting', {}, function(data){
                    cb && cb(data);
                });
            },
            detail: function(cb){
                http.getJSON(config, 'beautyvote/detail', { voteid : getUrlParams().voteid }, function(data){
                    cb && cb(data);
                });
            },
            makeposter: function(src, cb){
                /*http.getJSON(config, 'beautyvote/makeposter', { imgdata : src }, function(data){
                    cb && cb(data);
                });*/
                post_json(config, 'beautyvote/makeposter', {imgdata: src}, function(data){
                    cb && cb(data);
                });
            },
            vote: function(type, cb){
                http.getJSON(config, 'beautyvote/vote',  {
                    "voteid": getUrlParams().voteid, //参赛者ID
                    "type": type, //操作类型(vote-投票，flower-送花)
                    "num": 1, //数量（可选，默认为1）
                }, function(data){
                    cb && cb(data);
                });
            }
        };

        var viewport = new Vue({
            el: 'section',
            data: {
                ad_headimg: localStorage.ad_headimg,    // 海报的头像
                adimg: '',  // 生成的海报
                voteid: getUrlParams().voteid,
                voteid_self: sessionStorage.voteid, // 自己的报名id
                isShare: getUrlParams().isShare ? true : false, // 是否分享页进来
                pageData: {
                    "num_vote_left": 0, //当前剩余投票次数
                    "num_flower_left": 0, //剩余樱花数
                    "detail": {
                        "headimgurl": "", //头像
                        "no": "", //编号
                        "name": "", //昵称
                        "votes": 0, //总票数
                        "flowers": 0, //樱花数
                        "rank": 0, //排名
                        "pics": [],
                        "fans": [] //粉丝贡献榜
                    },
                    signed: 0  // 是否签到
                },
                hasGetCoupon: 0,
                couponInfo: {
                    name: '',
                    desc: '',
                    geturl: ''
                }
            },
            methods: {
                init: function () {
                    var self = this;
                    this.$el.style.display = 'block';
                    function getDetail(){
                        httpService.detail(function (data) {
                            self.pageData = data;
                            sessionStorage.poster_pic = data.detail.poster_pic ? data.detail.poster_pic : '';
                            if(!self.pageData.detail.headimgurl){
                                self.pageData.detail.headimgurl = 'images/profile.png';
                            }
                            commonService.loadingHide();
                            self.$nextTick(function () {
                                if(self.voteid_self == self.voteid){
                                    self.canvasHandle();
                                }else{
                                    self.share();
                                }
                            });
                        });
                    }
                    /*if(self.isShare){
                        // 分享页进来，配置基础信息
                        httpService.setting(function (data) {
                            sessionStorage.voteid = data.voteid ? data.voteid : '';    // 报名id
                            localStorage.mall_entry = data.mall_entry;
                            // 初始化页面data
                            self.voteid_self = sessionStorage.voteid;
                            getDetail();
                        });
                    }else{
                        getDetail();
                    }*/
                    // 为了刷新樱花数量，必须调用该接口
                    httpService.setting(function (data) {
                        sessionStorage.voteid = data.voteid ? data.voteid : '';    // 报名id
                        localStorage.mall_entry = data.mall_entry;
                        // 初始化页面data
                        self.voteid_self = sessionStorage.voteid;
                        getDetail();
                    });
                },
                share: function () {
                    // 分享信息
					var self = this;
                    if(self.voteid == self.voteid_self){
                        // 自己的页面
                        config.shareInfo.title = '我在良品铺子樱花女神节晒了一张照片，快来给我打call！';
                        config.shareInfo.desc = '我的美丽，请你助力！为我投票，还有bling bling的礼物拿哦！';
                    }else{
                        config.shareInfo.title = '介绍一下，这是我的新女神！了解之后你也会爱上她，快来给她打call！';
                        config.shareInfo.desc = '加入良品铺子樱花女神节狂欢，寻找最美丽的女神，还有超多礼物、红包等你来拿！';
                    }
                    // config.shareInfo.link = window.location.href + '&isShare=1';
					config.shareInfo.link = config.baseUrl + 'detail.html?voteid=' + self.voteid + '&isShare=1';
                    wxshare.init(config, function (type) {
                        httpService.sharelog(type, function () {
                            console.log('分享成功');
                        });
                    });
                },
                show_open: function () {
                    $('.showBox').show();
                },
                show_close: function () {
                    $('.showBox').hide();
                },
                jumpMall: function () {
                    jumpGo(localStorage.mall_entry);
                },
                historyHandle: function () {
                    history.go(-1);
                },
                jumpHome: function () {
                    jumpUrl('index.html');
                },
                hint_openHandle: function () {
                    $('.hintBox').show();
                },
                hint_closeHandle: function () {
                    $('.hintBox').hide();
                },
                result_closeHandle: function () {
                    $('.resultcommon').hide();
                },
                voteHandle: function (type) {
                    var self = this;
                    switch (type){
                        case 'vote':
                            if(this.pageData.num_vote_left >= 1){
                                // 请求后台
                                httpService.vote(type, function (data) {
                                    self.hasGetCoupon = data.hasGetCoupon;
                                    self.couponInfo = data.couponInfo;
                                    $('.hasvote').show();
                                    httpService.detail(function (data) {
                                        self.pageData = data;
                                        if(!self.pageData.detail.headimgurl){
                                            self.pageData.detail.headimgurl = 'images/profile.png';
                                        }
                                    });
                                })
                            }else{
                                // 是否签到
                                if(self.pageData.signed == 1){
                                    $('.novote-hassign').show();
                                }else{
                                    $('.novote-nosign').show();
                                }
                            }
                            break;
                        case 'flower':
                            if(this.pageData.num_flower_left >= 1){
                                // 请求后台
                                httpService.vote(type, function (data) {
                                    self.hasGetCoupon = data.hasGetCoupon;
                                    self.couponInfo = data.couponInfo;
                                    $('.hasflower').show();
                                    httpService.detail(function (data) {
                                        self.pageData = data;
                                        if(!self.pageData.detail.headimgurl){
                                            self.pageData.detail.headimgurl = 'images/profile.png';
                                        }
                                    });
                                })
                            }else{
                                // 是否签到
                                if(self.pageData.signed == 1){
                                    $('.noflower-hassign').show();
                                }else{
                                    $('.noflower-nosign').show();
                                }
                            }
                            break;
                    }
                },
                canvasHandle: function () {
                    var self = this;
                    if(sessionStorage.poster_pic){
                        self.adimg = sessionStorage.poster_pic;
                        self.share();
                        return false;
                    }
                    commonService.loadingShow();
                    html2canvas($('.adBox')[0]).then(function (canvas)  {
                        var imgUrl = encodeURIComponent(canvas.toDataURL('image/jpeg', 1)); // 获取生成的图片的url
                        commonService.loadingHide();
                        httpService.makeposter(imgUrl, function (data) {
                            self.adimg = data.imgurl;
                            sessionStorage.poster_pic = data.imgurl;
                            self.share();
                        })
                    });
                },
            }
        });

        commonService.loadingShow();
        commonService.oauth(config, function () {
            viewport.init();
        })
    }
}());