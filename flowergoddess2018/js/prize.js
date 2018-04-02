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
                    page: 'prize'
                }, function(data){
                    cb && cb(data);
                });
            },
            couponlist: function(cb){
                http.getJSON(config, 'beautyvote/couponlist', {}, function(data){
                    cb && cb(data);
                });
            }
        };
        var viewport = new Vue({
            el: 'section',
            data: {
                list: []
            },
            methods: {
                init: function () {
                    var self = this;
                    this.$el.style.display = 'block';
                    httpService.couponlist(function (data) {
                        self.list = data.list;
                        commonService.loadingHide();
                        wxshare.init(config, function (type) {
                            httpService.sharelog(type, function () {
                                console.log('分享成功');
                            });
                        });
                    });
                },
                jumpUrl: function (url) {
                    jumpGo(url);
                }
            }
        });

        commonService.loadingShow();
        commonService.oauth(config, function () {
            viewport.init();
        })
    }
}());