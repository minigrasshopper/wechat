(function (factory) {
    define(['jsonp', 'commonService'], function (JSONP, commonService) {
        return factory(JSONP, commonService);
    });
}(function (JSONP, commonService) {
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
    return http;
}));

