(function () {
    requirejs([config.configUrl], function () {
        requirejs(['http', 'vue', 'commonService'], requireCb);
    });

    function requireCb(http, Vue, commonService) {
        //防止输入时，输入框弹出导致页面样式混乱
        var view_h = document.documentElement.clientHeight || document.body.clientHeight;
        $("body").height(view_h);

        var httpService = {
            orderlist: function(params, cb){
                http.getJSON(config, 'loan/aj/master/orderlist', params, function(data){
                    cb && cb(data);
                });
            }
        };

        var viewport = new Vue({
            el: 'section',
            data: {
                info: JSON.parse(decodeURI(getUrlParams().info)),
                pageData: null
            },
            methods: {
                init: function () {
                    var self = this;
                    httpService.orderlist(this.info, function (data) {
                        self.pageData = data;
                        self.$nextTick(function () {
                            self.$el.style.display = 'block';
                        });
                    });
                },
                toggleState: function (status) {
                    var self = this;
                    this.info.status = status;
                    self.pageData = [];
                    httpService.orderlist(this.info, function (data) {
                        self.pageData = data;
                    });
                },
                historyHandle: function () {
                    history.go(-1);
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

