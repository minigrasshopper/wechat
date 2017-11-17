(function(){
    require([config.configUrl],function(){
        var reqArr = ['wxshare'];
        require(reqArr,requireCb);
    });

    function requireCb(wxshare){

        var requestObj = {
            create: function(obj, cb){
                post('mall/i/invoice/create', obj, function(data){
                    cb && cb(data);
                })
            },
            update: function(obj, cb){
                post('mall/i/invoice/update', obj, function(data){
                    cb && cb(data);
                })
            }
        };

        new Vue({
            el: 'section',
            data: {
                order: getUrlParam().order ? JSON.parse(getUrlParam().order) : null,
                params: getUrlParam().invoice ? JSON.parse(getUrlParam().invoice) : {
                    "type": "normal",     //normal-普通发票，special-增值税发票
                    "user_type": "customer",  //customer-个人，company-企业
                    "user_title": "",     //user_type == company 有
                    //增值税专用发票
                    "company_name": "",
                    "company_unit": "",     //纳税人识别码
                    "company_address": "",
                    "company_tel": "",
                    "company_bank": "",
                    "company_bank_info": "",
                    //通用字段
                    "content": 1, //1-食品  2-蛋糕
                    "is_default": 1
                }
            },
            mounted: function(){
                var me = this;
                M.loading();
                check(oAuth, function(){
                    me.init();
                });
            },
            updated: function(){
                changeLanguage();
                nameFontChange();
            },
            methods: {
                init: function(){
                    this.$el.style.display = 'block';
                    changeLanguage();
                    nameFontChange();
                    M.loadingHide();
                    share(config.shareInfo);
                },
                jumpNew: function(){
                    gotoUrl('order-create.html' + '?order=' + JSON.stringify(this.order));
                },
                typeHandle: function(type){
                    this.params.type = type;
                },
                userTypeHandle: function(type){
                    this.params.user_type = type;
                },
                contentHandle: function(type){
                    this.params.content = type;
                },
                sureHandle: function(){
                    var me = this;
                    $.each(this.params, function(key, value){
                        me.params[key] = $.trim(value);
                    });
                    if(this.params.type == 'normal' && this.params.user_type == 'company'){
                        if(!this.params.user_title){
                            changeAlert('请输入单位名称');
                            return;
                        }else if(!this.params.company_unit){
                            changeAlert('请输入纳税人识别码');
                            return;
                        }
                    }else if(this.params.type == 'special'){
                        if(!this.params.company_name){
                            changeAlert('请输入单位名称');
                            return;
                        }else if(!this.params.company_unit){
                            changeAlert('请输入纳税人识别码');
                            return;
                        }else if(!this.params.company_address){
                            changeAlert('请输入注册地址');
                            return;
                        }else if(!testTel(this.params.company_tel)){
                            return;
                        }else if(!this.params.company_bank){
                            changeAlert('请输入开户银行');
                            return;
                        }else if(!this.params.company_bank_info){
                            changeAlert('请输入银行账户');
                            return;
                        }
                    }
                    //信息验证成功后
                    M.loading();
                    if(this.params.id){
                        //更新
                        requestObj.update(this.params, function(data){
                            M.loadingHide();
                            gotoUrl('order-create.html' + '?order=' + JSON.stringify(me.order));
                        });
                    }else{
                        //新建
                        requestObj.create(this.params, function(data){
                            M.loadingHide();
                            gotoUrl('order-create.html' + '?order=' + JSON.stringify(me.order));
                        });
                    }
                }
            }
        });

        function defaultError(data){
            var err = data.error - 0;
            M.loadingHide();
            switch(err){
                case 1002:
                    oAuth.clear();
                    changeAlert('你的身份信息已过期，点击确定刷新页面');
                    window.location.reload();
                    break;
                default:
                    changeAlert(data.error_msg);
            }
        }

        function post(action,param,cb){
            M.ajax(action,param,config.gameid,function(data){
                var err = data.error - 0;
                switch(err){
                    case 0:
                        cb && cb(data);
                        break;
                    default:
                        defaultError(data);
                }
            },config.apiopenid,config.apitoken,config.isDebug?'nf':'');
        }

        function share(shareInfo,succCb){
            shareInfo.link = config.htmlUrl + 'index.html?channelid=' + sessionStorage.getItem('channelid');
            switch(localStorage.language){
                case 'cn':
                    break;
                case 'en':
                    if(languagePack[config.shareInfo.title]){
                        config.shareInfo.title = languagePack[config.shareInfo.title];
                    }
                    if(languagePack[config.shareInfo.desc]){
                        config.shareInfo.desc = languagePack[config.shareInfo.desc];
                    }
                    break;
            }
            wxshare.initWx(shareInfo,config.gameid,config.apiopenid,config.apitoken,succCb,null,null,null);
        }
        //share(config.shareInfo);
    }
}());

