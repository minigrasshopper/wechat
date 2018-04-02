(function () {
    requirejs([config.configUrl], function () {
        requirejs(['http', 'vue', 'commonService'], requireCb);
    });

    function requireCb(http, Vue, commonService) {
        //防止输入时，输入框弹出导致页面样式混乱
        var view_h = document.documentElement.clientHeight || document.body.clientHeight;
        $("body").height(view_h);

        var httpService = {
            projects: function(params, cb){
                http.getJSON(config, 'loan/aj/master/projects', params, function(data){
                    cb && cb(data);
                });
            }
        };

        var viewport = new Vue({
            el: 'section',
            data: {
                params: {keyword: ''},
                projects: []
            },
            methods: {
                init: function () {
                    var self = this;
                    httpService.projects(this.params, function (data) {
                        self.projects = data.list;
                        self.$el.style.display = 'block';
                    });
                },
                searchHandle: function () {
                    var self = this;
                    httpService.projects(this.params, function (data) {
                        self.projects = data.list;
                    });
                },
                historyHandle: function () {
                    jumpUrl('index.html');
                },
                jumpNew: function (project_id) {
                    jumpUrl('new.html' + '?project_id=' + project_id);
                },
                jumpList: function (project_id, status) {
                    var info = encodeURI(JSON.stringify({project_id: project_id, status: status}));
                    jumpUrl('list.html' + '?info=' + info);
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

