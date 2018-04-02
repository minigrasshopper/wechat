(function(){
    require([config.configUrl],function(){
        var reqArr = ['wxshare'];
        require(reqArr,requireCb);
    });

    function requireCb(wxshare){
        amendPageStyle();
        var pinyin = new Pinyin();
        var requestObj = {
            create: function(obj, cb){
                post('mall/i/address/create', obj, function(data){
                    cb && cb(data);
                });
            },
            update: function(obj, cb){
                post('mall/i/address/update', obj, function(data){
                    cb && cb(data);
                });
            }
        };

        new Vue({
            el: 'section',
            data: {
                order: getUrlParam().order ? getUrlParam().order : null,
                language: localStorage.language ? localStorage.language : 'cn',
                city: getUrlParam().address ? JSON.parse(getUrlParam().address).city : '',
                params: getUrlParam().address ? JSON.parse(getUrlParam().address) : {
                    consignee: null,
                    cellphone: null,
                    city: '',
                    district: '',
                    address: null
                },
                showAll: sessionStorage.showAll == 1 ? 1 : 0,   //是否显示所有
                cityList: [],
                districtList: []
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
            watch: {
                city: function () {
                    this.params.district = '';
                    this.getDistrict();
                }
            },
            methods: {
                init: function(){
                    this.$el.style.display = 'block';
                    this.params.gender = 'male';
                    this.getDistrict();
                    changeLanguage();
                    nameFontChange();
                    this.getCityList();
                    M.loadingHide();
                    share(config.shareInfo);
                },
                getCityList: function () {
                    if(this.language == 'cn'){
                        this.cityList = cityList;
                    }else{
                        var oldList = [].concat(cityList);
                        oldList.forEach(function (item, index, arr) {
                            oldList[index]['pn'] = pinyin.getFullChars(item['pn']);
                            item['cs'].forEach(function (v, i) {
                                oldList[index]['cs'][i]['cn'] = pinyin.getFullChars(v['cn']);
                            })
                        });
                        this.cityList = oldList;
                    }
                    console.log(cityList);
                },
                getDistrict: function () {
                    var me = this;
                    if(!this.city){
                        me.districtList = null;
                        return false;
                    }
                    $.each(this.cityList, function (index, item) {
                        if(item.pn == me.city){
                            me.districtList = item.cs;
                            return false;
                        }
                    });
                },
                sureHandle: function(){
                    var me = this;
                    this.params.city = this.city;
                    $.each(this.params, function(key, value){
                        me.params[key] = $.trim(value);
                    });
                    if(!this.params.consignee){
                        changeAlert('请输入姓名');
                    }else if(!testTel(this.params.cellphone)){

                    }else if(!this.params.city){
                        changeAlert('请选择配送城市');
                    }else if(!this.params.district){
                        changeAlert('请选择配送地址');
                    }else if(!this.params.address){
                        changeAlert('请填写街道信息');
                    }else{
                        M.loading();
                        if(this.params.id){
                            //更新
                            requestObj.update(this.params, function(data){
                                M.loadingHide();
                                gotoUrl('address.html' + '?order=' + me.order);
                            });
                        }else{
                            //新建
                            requestObj.create(this.params, function(data){
                                M.loadingHide();
                                gotoUrl('address.html' + '?order=' + me.order);
                            });
                        }
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

