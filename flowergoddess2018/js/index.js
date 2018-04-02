(function () {
    requirejs([config.configUrl], function () {
        requirejs(['jsonp', 'jquery', 'commonService', 'wxshare'], requireCb);
    });

    function requireCb(JSONP, $, commonService, wxshare) {
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
        amendPageStyle();
        var httpService = {
            setting: function(cb){
                http.getJSON(config, 'beautyvote/setting', {}, function(data){
                    cb && cb(data);
                });
            },
            list: function(params, cb){
                http.getJSON(config, 'beautyvote/list', params, function(data){
                    cb && cb(data);
                });
            },
            list_noloading: function(params, cb){
                http.getJSON_noloading(config, 'beautyvote/list', params, function(data){
                    cb && cb(data);
                });
            },
            sharelog: function(type, cb){
                http.getJSON(config, 'sharelog', {
                    type: type,
                    page: 'index'
                }, function(data){
                    cb && cb(data);
                });
            },
        };

        var viewport = new Vue({
            el: 'section',
            data: {
                info: null,
                params: {
                    keyword: '',
                    category: '',   // (可选 new-最新，whu-武大专区，可选，默认为空即按票数排列)
                    page: 1     // 默认为1
                },
                keyword: '',    // 用于搜索
                canScroll: true,
                type: 0,  // 0-全部 1-新加 2-武大
                rankArr: [],
            },
            methods: {
                init: function () {
                    var self = this;
                    this.$el.style.display = 'block';
                    httpService.setting(function (data) {
                        self.info = data;
                        sessionStorage.upload = data.upload;    // 是否已经报名
                        sessionStorage.voteid = data.voteid ? data.voteid : '';    // 报名id
                        sessionStorage.user_cates = data.user_cates ? JSON.stringify(data.user_cates) : '';    // 报名选项
                        sessionStorage.info = data.info ? JSON.stringify(data.info) : '';  // 报名页渲染数据
                        sessionStorage.poster_pic = data.info.poster_pic ? data.info.poster_pic : '';  // 海报
                        localStorage.mall_entry = data.mall_entry;
                        httpService.list(self.params, function (data) {
                            self.rankArr = data.list;
                            commonService.loadingHide();
                            self.$nextTick(function () {
                                self.judgeLoad();
                                wxshare.init(config, function (type) {
                                    httpService.sharelog(type, function () {
                                        console.log('分享成功');
                                    });
                                });
                            });
                        });
                    });
                },
                searchHandle: function () {
                    this.keyword = $.trim(this.keyword);
                    console.log(this.keyword);
                    console.log(this.keyword.length);
                    if(this.keyword.length < 2){
                        commonService.tips('至少输入两个字');
                        return false;
                    }
                    sessionStorage.keyword = this.keyword;
                    jumpUrl('search.html');
                },
                toggleType: function (type) {
                    $(window).unbind('scroll');
                    var self = this;
                    this.type = type;
                    this.params.page = 1;
                    switch (type){
                        case 0:
                            this.params.category = '';
                            break;
                        case 1:
                            this.params.category = 'new';
                            break;
                        case 2:
                            this.params.category = 'whu';
                            break;
                    }
                    self.rankArr = [];
                    httpService.list(this.params, function (data) {
                        self.rankArr = data.list;
                        self.judgeLoad();
                    });
                },
                judgeLoad: function () {
                    var self = this;
                    $(window).scroll(function(){
                        if(!self.canScroll){
                            return false;
                        }
                        var scrollTop = $(this).scrollTop();
                        var scrollHeight = $(document).height();
                        var windowHeight = $(this).height();
                        if(scrollTop + windowHeight == scrollHeight){
                            self.canScroll = false;
                            $('.weui-loadmore').show();
                            // 请求后台
                            self.params.page ++;
                            httpService.list_noloading(self.params, function (data) {
                                $('.weui-loadmore').hide();
                                if(data.list.length){
                                    self.rankArr = self.rankArr.concat(data.list);
                                    $('.loadHint-has').show();
                                    setTimeout(function () {
                                        $('.loadHint-has').hide();
                                        self.canScroll = true;
                                    }, 1000);
                                }else{
                                    self.params.page --;
                                    $(this).scrollTop(scrollTop - 10);
                                    $('.loadHint-no').show();
                                    setTimeout(function () {
                                        $('.loadHint-no').hide();
                                        self.canScroll = true;
                                    }, 1000);
                                }
                            });
                        }
                    });
                },
                jumpDetail: function (voteid) {
                    jumpUrl('detail.html?voteid=' + voteid);
                }
            }
        });

        commonService.loadingShow();
        commonService.oauth(config, function () {
            viewport.init();
        })
    }
}());

