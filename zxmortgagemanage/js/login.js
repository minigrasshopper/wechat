(function () {
    requirejs([config.configUrl], function () {
        requirejs(['http', 'vue', 'commonService'], requireCb);
    });

    function requireCb(http, Vue, commonService) {
        //防止输入时，输入框弹出导致页面样式混乱
        var view_h = document.documentElement.clientHeight || document.body.clientHeight;
        $("body").height(view_h);

        var httpService = {
            login: function(params, cb){
                http.getJSON(config, 'loan/common/login', params, function(data){
                    cb && cb(data);
                });
            }
        };

        var viewport = new Vue({
            el: 'section',
            data: {
                params: {
                    channel: 'manager',
                    account: '',  // 22000069
                    password: ''  // 123456
                }
            },
            methods: {
                init: function () {
                    this.$el.style.display = 'block';
                },
                loginHandle: function () {
                    if(!this.params.account){
                        commonService.tips('请输入账号');
                    }else if(!this.params.password){
                        commonService.tips('请输入密码');
                    }else{
                        //请求后台，成功后进入index页面
                        httpService.login(this.params, function(){
                            jumpUrl('index.html');
                        });
                    }
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

