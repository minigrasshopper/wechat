(function () {
    requirejs([config.configUrl], function () {
        requirejs(['http', 'vue', 'commonService'], requireCb);
    });

    function requireCb(http, Vue, commonService) {
        //防止输入时，输入框弹出导致页面样式混乱
        var view_h = document.documentElement.clientHeight || document.body.clientHeight;
        $("body").height(view_h);

        var httpService = {
            orderinfo: function(params, cb){
                // 工单信息
                http.getJSON(config, 'loan/aj/manager/orderinfo', params, function(data){
                    cb && cb(data);
                });
            },
            createorder: function(params, cb){
                // 提交工单
                http.getJSON(config, 'loan/aj/manager/createorder', params, function(data){
                    cb && cb(data);
                });
            },
            saveorder: function(params, cb){
                // 暂存工单
                http.getJSON(config, 'loan/aj/manager/saveorder', params, function(data){
                    cb && cb(data);
                });
            },
            updateorder: function(params, cb){
                // 编辑暂存的工单
                http.getJSON(config, 'loan/aj/manager/updateorder', params, function(data){
                    cb && cb(data);
                });
            },
            commitsavedorder: function(params, cb){
                // 提交暂存的工单
                http.getJSON(config, 'loan/aj/manager/commitsavedorder', params, function(data){
                    cb && cb(data);
                });
            }
        };

        var viewport = new Vue({
            el: 'section',
            data: {
                params: {
                    token : sessionStorage.token,
                    product_id: "aj",   // 产品ID，默认为aj-按揭
                    customer_name: "", // 客户姓名
                    customer_idcard: '',   // 客户身份证号
                    customer_mobile: '',  // 客户手机号
                    money_aj: '',   // 按揭金额(单位元)
                    money_zx: '',    // 装修贷款金额(单位元)
                    money_gjj: '',   // 公积金金额(单位元)
                    project_id: '',   // 子项目ID
                    room_no: '',   // 房号
                    items_lack: "",  // 如资料已收集齐给空值，没收集齐的工单禁止提交
                    remark: ''  // 备注信息
                },
                isAll: 0,   // 资料是否完整
                infoList: [
                    {name: '身份证', status: 0},
                    {name: '户口', status: 0},
                    {name: '婚姻材料', status: 0},
                    {name: '收入证明', status: 0},
                    {name: '银行流水', status: 0},
                    {name: '首付及付款pos', status: 0},
                    {name: '购房、装修合同', status: 0},
                    {name: '个人征信', status: 0}
                ],
                projects: JSON.parse(sessionStorage.projects),
                apply_no: getUrlParams().apply_no ? getUrlParams().apply_no : '',    // 是否从订单列表过来
                isnice: 0  // 1-从列表进来&非暂存单
            },
            methods: {
                init: function () {
                    var self = this;
                    if(this.apply_no){
                        httpService.orderinfo({token: sessionStorage.token, apply_no: this.apply_no}, function (data) {
                            self.params = data.info;
                            self.params.token = sessionStorage.token;
                            self.params.customer_id = data.info.customer.customer_id;
                            self.params.customer_idcard = data.info.customer.idcard;
                            self.params.customer_mobile = data.info.customer.mobile;
                            self.params.customer_name = data.info.customer.name;
                            self.initInfo();
                            if(!data.info.items_lack){
                                self.isnice = 1;
                                self.isAll = 1;
                                sessionStorage.workflow = JSON.stringify(data.info.workflow);
                            }else{
                                self.isnice = 0;
                                self.isAll = 0;
                            }
                        });
                    }
                    this.$el.style.display = 'block';
                },
                jumpWork: function () {
                    jumpUrl('workflow.html');
                },
                historyHandle: function () {
                    history.go(-1);
                },
                numAmend: function (num) {
                    var arr = (num + '').split('').reverse();
                    for(var i=0;i<arr.length;i++){
                        if((i + 1) % 3 == 0){
                            arr[i] = '*' + arr[i];
                        }
                    }
                    var newArr = arr.reverse().join('').replace(/\*/g, ',').replace(/^,/, '');
                    return newArr;
                },
                initInfo: function () {
                    if(!this.params.items_lack){
                        return false;
                    }
                    var arr = this.params.items_lack.split('|');
                    this.infoList.forEach(function (item, key, array) {
                        arr.forEach(function (value, index, arr) {
                            if(item.name == value){
                                item.status = 1;
                                array.splice(key, 1, item);
                            }
                        })
                    })
                },
                toggleInfo: function (item, key) {
                    if(this.isnice == 1){
                        return false;
                    }
                    var self = this;
                    item.status = item.status == 1 ? 0 : 1;
                    this.infoList.splice(key, 1, item);
                    this.params.items_lack = '';
                    var arr = [];
                    this.infoList.forEach(function (item, key, arr) {
                       if(item.status == 1){
                           if(!self.params.items_lack){
                               self.params.items_lack += item.name;
                           }else{
                               self.params.items_lack += '|' + item.name;
                           }
                       }
                    });
                    console.log(self.params.items_lack);
                },
                getValueByKey: function (project_id, list) {
                    var value = '';
                    if(project_id == ''){
                        value = '';
                        return '';
                    }
                    list.forEach(function (item, k, arr) {
                        if(project_id == item['project_id']){
                            value = item['name_project'];
                        }
                    });
                    return value;
                },
                toggleAll: function (type) {
                    if(this.isnice == 1){
                        return false;
                    }
                    this.isAll = type;
                    if(type == 1 ){
                        // 不缺资料
                        this.params.items_lack = '';
                        this.infoList.forEach(function (item, key, arr) {
                            if(item.status == 1){
                                item.status = 0;
                                arr.splice(key, 1, item);
                            }
                        });
                    }
                },
                submitHandle: function () {
                    for(var key in this.params){
                        this.params[key] = $.trim(this.params[key]);
                    }
                    if(!this.params.customer_name){
                        commonService.tips('请输入姓名');
                        return false;
                    }else if(!commonService.isCardID(this.params.customer_idcard)){
                        return false;
                    }else if(!commonService.testMobile(this.params.customer_mobile)){
                        return false;
                    }else if(!this.params.money_aj || this.params.money_aj < 0){
                        commonService.tips('金额错误');
                        return false;
                    }else if(!this.params.money_gjj || this.params.money_gjj < 0){
                        commonService.tips('金额错误');
                        return false;
                    }else if(!this.params.money_zx || this.params.money_zx < 0){
                        commonService.tips('金额错误');
                        return false;
                    }else if(!this.params.project_id){
                        commonService.tips('请选择子项目');
                        return false;
                    }else if(!this.params.room_no){
                        commonService.tips('请输入房间号');
                        return false;
                    }
                    if(!this.apply_no){
                        // 添加进来
                        if(this.isAll == 1){
                            // 提交流程，请求后台
                            console.log('提交流程');
                            httpService.createorder(this.params, function () {
                                commonService.tips('提交成功');
                                setTimeout(function () {
                                    jumpUrl('list.html');
                                }, 500);
                            });
                        }else{
                            // 暂存流程
                            if(!this.params.items_lack){
                                commonService.tips('请选择缺失资料');
                            }else{
                                // 请求后台
                                console.log('暂存流程');
                                httpService.saveorder(this.params, function () {
                                    commonService.tips('暂存成功');
                                    setTimeout(function () {
                                        jumpUrl('list.html');
                                    }, 500);
                                });
                            }
                        }
                    }else{
                        // 列表进来
                        if(this.isAll == 1){
                            // 暂存提交
                            httpService.commitsavedorder(this.params, function () {
                                commonService.tips('提交成功');
                                setTimeout(function () {
                                    jumpUrl('list.html');
                                }, 500);
                            })
                        }else{
                            // 暂存更新
                            if(!this.params.items_lack){
                                commonService.tips('请选择缺失资料');
                            }else{
                                httpService.updateorder(this.params, function () {
                                    commonService.tips('更新成功');
                                    setTimeout(function () {
                                        jumpUrl('list.html');
                                    }, 500);
                                })
                            }
                        }
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

