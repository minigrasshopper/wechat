(function(){
    require([config.configUrl],function(){
        var reqArr = ['wxshare'];
        require(reqArr,requireCb);
    });

    function requireCb(wxshare){
        var requestObj = {
            address: function(cb){
                post('mall/i/address/list', {}, function(data){
                    cb && cb(data);
                });
            },
            update: function(obj, cb){
                post('mall/i/address/update', obj, function(data){
                    cb && cb(data);
                });
            },
            del: function(id, cb){
                post('mall/i/address/del', {id: id}, function(data){
                    cb && cb(data);
                });
            }
        };

        new Vue({
            el: 'section',
            data: {
                pageData: [],
                showAll: localStorage.showAll == 1 ? 1 : 0,   //是否显示所有
                order: getUrlParam().order ? JSON.parse(getUrlParam().order) : null
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
                    var me = this;
                    this.$el.style.display = 'block';
                    requestObj.address(function(data){
                        me.addressFilter(data.list);
                        console.log(data.list);
                        changeLanguage();
                        nameFontChange();
                        me.setOnlyDefault();
                        M.loadingHide();
                        share(config.shareInfo);
                    });
                },
                addressFilter: function (list) {
                    var me = this;
                    this.pageData = [];
                    console.log(this.showAll);
                    if(this.showAll == 1){
                        //北京
                        $.each(list, function (index, item) {
                            if(item.city == '北京' || item.city == 'Beijing'){
                                me.pageData.push(item);
                            }
                        });
                    }else{
                        //非北京
                        $.each(list, function (index, item) {
                            console.log(me.pageData);
                            if(item.city != '北京' && item.city != 'Beijing'){
                                me.pageData.push(item);
                            }
                        });
                    }
                },
                jumpOrderCreate: function(item){
                    var me = this;
                    if(!this.order){
                        return false;
                    }
                    if(item.is_default == 1){
                        gotoUrl('order-create.html' + '?order=' + JSON.stringify(this.order));
                        return false;
                    }
                    //设置选择的为默认地址，并跳转
                    M.loading();
                    $('.selected').hide();
                    item.is_default = 1;
                    requestObj.update(item, function(data){
                        M.loadingHide();
                        gotoUrl('order-create.html' + '?order=' + JSON.stringify(me.order));
                    });
                },
                setOnlyDefault: function(){
                    if(this.pageData.length && this.pageData[0].is_default != 1){
                        M.loading();
                        var item = this.pageData[0];
                        item.is_default = 1;
                        requestObj.update(item, function(data){
                            M.loadingHide();
                        });
                    }
                },
                jumpNew: function(page){
                    switch (page){
                        case 'profile':
                            gotoUrl('profile.html');
                            break;
                        case 'order-create':
                            gotoUrl('order-create.html' + '?order=' + JSON.stringify(this.order));
                            break;
                    }
                },
                jumpAddressEdit: function(address){
                    if(address){
                        gotoUrl('address-edit.html' + '?order=' + JSON.stringify(this.order) + '&address=' + JSON.stringify(address));
                    }else{
                        gotoUrl('address-edit.html' + '?order=' + JSON.stringify(this.order));
                    }
                },
                deleteHandle: function(id){
                    var me = this;
                    M.loading();
                    requestObj.del(id, function(){
                        requestObj.address(function(data){
                            M.loadingHide();
                            me.addressFilter(data.list);
                            me.setOnlyDefault();
                        });
                    });
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

