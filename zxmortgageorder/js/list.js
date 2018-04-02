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
                http.getJSON(config, 'loan/aj/manager/orderlist', params, function(data){
                    cb && cb(data);
                });
            }
        };

        var viewport = new Vue({
            el: 'section',
            data: {
                params: {mobile: '', token: sessionStorage.token, status: 'all'},
                pageData: null,
                currstatus: 'all'
            },
            methods: {
                init: function () {
                    var self = this;
                    httpService.orderlist(this.params, function (data) {
                        self.pageData = data;
                        self.$nextTick(function () {
                            self.$el.style.display = 'block';
                        });
                    });
                },
                historyHandle: function () {
                    jumpUrl('index.html');
                },
                searchHandle: function () {
                    var self = this;
                    httpService.orderlist(this.params, function (data) {
                        self.pageData = data;
                    });
                },
                toggleState: function (status) {
                    var self = this;
                    this.currstatus = status;
                    this.params.status = status;
                    httpService.orderlist(this.params, function (data) {
                        self.pageData = data;
                    });
                },
                jumpNew: function (apply_no) {
                    jumpUrl('new.html' + '?apply_no=' + apply_no);
                }
            }
        });

        //commonService.loadingShow();
        //commonService.oauth(config, function () {
            viewport.init();
            //commonService.loadingHide();
        //})
    }
}());

