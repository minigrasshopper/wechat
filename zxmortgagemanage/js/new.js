(function () {
    requirejs([config.configUrl], function () {
        requirejs(['http', 'vue', 'commonService'], requireCb);
    });

    function requireCb(http, Vue, commonService) {
        //防止输入时，输入框弹出导致页面样式混乱
        var view_h = document.documentElement.clientHeight || document.body.clientHeight;
        $("body").height(view_h);

        var httpService = {
            createproject: function(params, cb){
                http.getJSON(config, 'loan/aj/master/createproject', params, function(data){
                    cb && cb(data);
                });
            },
            projectinfo: function(params, cb){
                http.getJSON(config, 'loan/aj/master/projectinfo', params, function(data){
                    cb && cb(data);
                });
            },
            updateproject: function(params, cb){
                http.getJSON(config, 'loan/aj/master/updateproject', params, function(data){
                    cb && cb(data);
                });
            }
        };

        var viewport = new Vue({
            el: 'section',
            data: {
                params: {
                    token: sessionStorage.token,
                    name_project: '',
                    name_developer: '',
                    name_zx_account_name: '',
                    name_zx_account_no: '',
                    name_zx_account_bank: '',
                    name_zx_account_cardno: '',
                    name_developer_group: '',
                    name_subbranch: '',
                    name_manager: ''
                },
                isDiy: false,
                isOpen: false,
                devArr: JSON.parse(sessionStorage.developer_groups),
                project_id: getUrlParams().project_id ? getUrlParams().project_id : ''
            },
            methods: {
                init: function () {
                    var self = this;
                    if(this.project_id){
                        httpService.projectinfo({project_id: this.project_id}, function (data) {
                            self.params = data.info;
                            self.params.token = sessionStorage.token;
                            self.$el.style.display = 'block';
                        })
                    }else{
                        self.$el.style.display = 'block';
                    }
                },
                toggleDiy: function () {
                    this.isDiy = !this.isDiy
                },
                historyHandle: function () {
                    history.go(-1);
                },
                openModal: function () {
                    this.isOpen = true;
                },
                closeModel: function () {
                    this.isOpen = false;
                },
                sureHandle: function () {
                    if(!this.isDiy){
                        this.params.name_developer_group = $('.modal').find('select').val();
                    }else{
                        this.params.name_developer_group = $('.modal').find('input').val();
                    }
                    this.isOpen = false;
                },
                submitHandle: function () {
                    for(var key in this.params){
                        if(key != 'name_developer_group'){
                            var value = $.trim(this.params[key]);
                            if(!value){
                                commonService.tips('信息填写不完全');
                                return false;
                            }
                        }
                    }
                    if(!this.project_id){
                        httpService.createproject(this.params, function (data) {
                            commonService.tips('提交成功');
                            setTimeout(function () {
                                jumpUrl('manage.html');
                            }, 500);

                        })
                    }else{
                        httpService.updateproject(this.params, function (data) {
                            commonService.tips('提交成功');
                            setTimeout(function () {
                                jumpUrl('manage.html');
                            }, 500);
                        })
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

