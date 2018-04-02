(function () {
    requirejs([config.configUrl], function () {
        requirejs(['http', 'vue', 'commonService'], requireCb);
    });

    function requireCb(http, Vue, commonService) {
        //防止输入时，输入框弹出导致页面样式混乱
        var view_h = document.documentElement.clientHeight || document.body.clientHeight;
        $("body").height(view_h);

        var viewport = new Vue({
            el: 'section',
            data: {
                pageData: JSON.parse(sessionStorage.workflow)
            },
            methods: {
                init: function () {
                    var self = this;
                    this.$el.style.display = 'block';
                },
                historyHandle: function () {
                    history.go(-1);
                },
                jumpIssue: function (issues) {
                    sessionStorage.issues = JSON.stringify(issues);
                    jumpUrl('issue.html');
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

