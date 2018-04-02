(function () {
    requirejs([config.configUrl], function () {
        requirejs(['jsonp', 'wxshare', 'commonService'], requireCb);
    });

    function requireCb(JSONP, wxshare, commonService) {
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
                    page: 'rule'
                }, function(data){
                    cb && cb(data);
                });
            },
        };

        var viewport = new Vue({
            el: 'section',
            data: {

            },
            methods: {
                init: function () {
                    this.$el.style.display = 'block';
                    commonService.loadingHide();
                    wxshare.init(config, function (type) {
                        httpService.sharelog(type, function () {
                            console.log('分享成功');
                        });
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