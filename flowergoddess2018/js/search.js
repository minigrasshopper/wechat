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
        var httpService = {
            sharelog: function(type, cb){
                http.getJSON(config, 'sharelog', {
                    type: type,
                    page: 'search'
                }, function(data){
                    cb && cb(data);
                });
            },
            list: function(params, cb){
                http.getJSON(config, 'beautyvote/list', params, function(data){
                    cb && cb(data);
                });
            }
        };

        var viewport = new Vue({
            el: 'section',
            data: {
                params: {
                    keyword: sessionStorage.keyword,
                    category: '',   // (可选 new-最新，whu-武大专区，可选，默认为空即按票数排列)
                    page: 1     // 默认为1
                },
                rankArr: [],
            },
            methods: {
                init: function () {
                    var self = this;
                    this.$el.style.display = 'block';
                    httpService.list(self.params, function (data) {
                        self.rankArr = data.list;
                        commonService.loadingHide();
                        wxshare.init(config, function (type) {
                            httpService.sharelog(type, function () {
                                console.log('分享成功');
                            });
                        });
                    });
                },
                historyHandle: function () {
                    history.go(-1);
                },
                searchHandle: function () {
                    var self = this;
                    this.params.keyword = $.trim(this.params.keyword);
                    if(this.params.keyword.length < 2){
                        commonService.tips('至少输入两个字');
                        return false;
                    }
                    httpService.list(self.params, function (data) {
                        self.rankArr = data.list;
                    });
                },
                jumpDetail: function (voteid) {
                    sessionStorage.keyword = this.params.keyword;
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

