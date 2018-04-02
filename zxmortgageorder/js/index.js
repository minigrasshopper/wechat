(function () {
    requirejs([config.configUrl], function () {
        requirejs(['http', 'vue', 'commonService'], requireCb);
    });

    function requireCb(http, Vue, commonService) {
        //防止输入时，输入框弹出导致页面样式混乱
        var view_h = document.documentElement.clientHeight || document.body.clientHeight;
        $("body").height(view_h);

        var httpService = {
            checklogin: function(successCb, failCb){
                http.getJSON(config, 'loan/common/checklogin', { channel : 'manager' }, function(data){
                    successCb && successCb(data);
                }, function (data) {
                    failCb && failCb(data);
                });
            },
            config: function(params, cb){
                http.getJSON(config, 'loan/aj/manager/config', params, function(data){
                    cb && cb(data);
                });
            },
            logout: function(params, cb){
                http.getJSON(config, 'loan/common/logout', params, function(data){
                    cb && cb(data);
                });
            }
        };

        var viewport = new Vue({
            el: 'section',
            data: {
                wxinfo: {
                    headimgurl: '',
                    nickname: ''
                }
            },
            methods: {
                init: function () {
                    var self = this;
                    httpService.checklogin(function (data) {
                        sessionStorage.token = data.token;
                        httpService.config({token: sessionStorage.token}, function (data) {
                            self.wxinfo = data.wxinfo;
                            self.$el.style.display = 'block';
                            sessionStorage.projects = JSON.stringify(data.projects);
                        })
                    }, function (data) {
                        jumpUrl('login.html');
                    });
                },
                backHandle: function () {
                    httpService.logout({channel: 'manager', token: sessionStorage.token}, function () {
                        jumpUrl('login.html');
                    })
                },
                jumpPage: function (page) {
                    jumpUrl(page + '.html');
                }
            }
        });

        commonService.loadingShow();
        commonService.oauth(config, function () {
            viewport.init();
            commonService.loadingHide();
        })
    }
}());

