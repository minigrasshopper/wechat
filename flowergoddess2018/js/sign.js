(function () {
    requirejs([config.configUrl], function () {
        requirejs(['jsonp', 'jquery', 'commonService', 'wxshare', 'html2canvas'], requireCb);
    });

    function requireCb(JSONP, $, commonService, wxshare, html2canvas) {
        var http = {
            baseUrl: 'http://beautyvote.wx.lppz.com/api/jsapi',
            getJSON: function(config, action, params, cb){
                commonService.loadingShow();
                var callback = "&callback=" + "jsonp";
                var sameKey = '&wxapiopenid=' + config.apiopenid + '&wxapitoken=' + config.apitoken + '&debug=nf';
                JSONP.getJSON(this.baseUrl + '?action=' + action + '&params=' + JSON.stringify(params) + callback, sameKey, function (data) {
                    console.log(data);
                    commonService.loadingHide();
                    switch (data.error - 0) {
                        case 0:
                            cb && cb(data);
                            break;
                        default:
                            commonService.tips(data.error_msg, 'error');
                            break;
                    }
                });
            },
            getJSON_noloading: function(config, action, params, cb){
                var callback = "&callback=" + "jsonp";
                var sameKey = '&wxapiopenid=' + config.apiopenid + '&wxapitoken=' + config.apitoken + '&debug=nf';
                JSONP.getJSON(this.baseUrl + '?action=' + action + '&params=' + JSON.stringify(params) + callback, sameKey, function (data) {
                    console.log(data);
                    switch (data.error - 0) {
                        case 0:
                            cb && cb(data);
                            break;
                        default:
                            commonService.tips(data.error_msg, 'error');
                            break;
                    }
                });
            },
        };
        function post_json(config, action, params, cb){
            var baseUrl = 'http://beautyvote.wx.lppz.com/api/jsapi';
            var self = this;
            commonService.loadingShow();
            var sameKey =  '&wxapiopenid=' + config.apiopenid + '&wxapitoken=' + config.apitoken + '&debug=nf';
            $.post(baseUrl + '?action=' + action + sameKey, params, function (data) {
                console.log(data);
                commonService.loadingHide();
                switch (data.error - 0) {
                    case 0:
                        cb && cb(data);
                        break;
                    default:
                        commonService.tips(data.error_msg, 'error');
                        break;
                }
            }, 'json');
        }

        amendPageStyle();
        var httpService = {
            setting: function(cb){
                http.getJSON(config, 'beautyvote/setting', {}, function(data){
                    cb && cb(data);
                });
            },
            sharelog: function(type, cb){
                http.getJSON(config, 'sharelog', {
                    type: type,
                    page: 'sign'
                }, function(data){
                    cb && cb(data);
                });
            },
            uploadpic: function(src, cb){
                post_json(config, 'beautyvote/uploadpic', {imgdata: src}, function(data){
                    cb && cb(data);
                });
                /*http.getJSON(config, 'beautyvote/uploadpic', {imgdata: src}, function(data){
                    cb && cb(data);
                });*/
            },
            submit: function(params, cb){
                http.getJSON(config, 'beautyvote/submit', params, function(data){
                    cb && cb(data);
                });
            },
        };

        var viewport = new Vue({
            el: 'section',
            data: {
                scale: 1,
                endScale: 0,
                startX: 0,
                startY: 0,
                moveX: 0,
                moveY: 0,
                endX: 0,
                endY: 0,
                imgCurr: '',
                upload: sessionStorage.upload == 1 ? 1 : 0, // 是否报名
                // upload: 0,
                voteid: sessionStorage.voteid,  // 本人的报名id
                user_cates: sessionStorage.user_cates ? JSON.parse(sessionStorage.user_cates) : '',
                params: {
                    name: "",
                    mobile: "",
                    cate: "",
                    whu_student_no: "",
                    pics: []
                },
                imgArr: [],     // 保存本地img base64 用于保存首图
                hasGetCoupon: 0,
                couponInfo: {
                    name: '',
                    desc: '',
                    geturl: ''
                }
            },
            methods: {
                init: function () {
                    var self = this;
                    self.$el.style.display = 'block';
                    function getDetail() {
                        if(self.upload == 1){
                            // 已经报名，params赋值（从sessionStorage拿值）
                            self.params = JSON.parse(sessionStorage.info);
                            console.log(self.params);
                        }
                        commonService.loadingHide();
                        wxshare.init(config, function (type) {
                            httpService.sharelog(type, function () {
                                console.log('分享成功');
                            });
                        });
                        self.useHammer();
                    }
                    if(!self.user_cates){
                        // 非正常进入，配置基础信息
                        httpService.setting(function (data) {
                            sessionStorage.upload = data.upload;    // 是否已经报名
                            sessionStorage.voteid = data.voteid ? data.voteid : '';    // 报名id
                            sessionStorage.user_cates = data.user_cates ? JSON.stringify(data.user_cates) : '';    // 报名选项
                            sessionStorage.info = data.info ? JSON.stringify(data.info) : '';  // 报名页渲染数据
                            self.voteid = sessionStorage.voteid;
                            self.upload = sessionStorage.upload;
                            self.user_cates = sessionStorage.user_cates;
                            getDetail();
                        });
                    }else{
                        getDetail();
                    }
                },
                submitHandle: function () {
                    var self = this;
                    this.params.name = $.trim(this.params.name);
                    console.log(this.params.name);
                    console.log(this.params.name.length);
                    if(this.params.name.length < 2){
                        commonService.tips('昵称至少输入两个字');
                        return false;
                    }else if(!commonService.testMobile(this.params.mobile)){
                        return false;
                    }else if(!this.params.cate){
                        commonService.tips('请选择您的职业');
                        return false;
                    }
                    if(this.params.cate == 'whu' && !$.trim(this.params.whu_student_no)){
                        commonService.tips('请输入学号');
                        return false;
                    }
                    if(this.params.pics.length < 2){
                        commonService.tips('请添加照片');
                        return false;
                    }
                    commonService.confirm('报名信息及照片提交后不可修改，确认提交？', function () {
                        httpService.submit(self.params, function (data) {
                            self.hasGetCoupon = data.hasGetCoupon;
                            self.couponInfo = data.couponInfo;
                            self.upload = 1;
                            self.voteid = data.voteid;
                            $('.giftBox').show();
                            localStorage.ad_headimg = self.imgArr[0];
                        })
                    });
                },
                jumpUrl: function (url) {
                    jumpGo(url);
                },
                jumpDetail: function () {
                    jumpUrl('detail.html?voteid=' + this.voteid);
                },
                hammerInit: function () {
                    this.scale = 1;
                    this.endScale = 0;
                    this.startX = 0;
                    this.startY = 0;
                    this.moveX = 0;
                    this.moveY = 0;
                    this.endX = 0;
                    this.endY = 0;
                },
                uploadHandle: function (event) {
                    var self = this;
                    var target = event.currentTarget;
                    if(target.files.length > 0){
                        lrz(target.files[0], {
                            width: 600,
                            quality: 0.8,
                            before: function() {
                                commonService.loadingShow();
                            },
                            done: function (results) {
                                commonService.loadingHide();
                                $(target).val('');
                                self.imgCurr = results.base64;
                                self.hammerInit();
                                $('.editBox').show();
                            }
                        });
                    }
                },
                deleteHandle: function (key) {
                    this.params.pics.splice(key, 1);
                    this.imgArr.splice(key, 1);
                },
                canvasHandle: function () {
                    var self = this;
                    commonService.loadingShow();
                    html2canvas($('.square')[0]).then(function(canvas) {
                        var imgUrl = encodeURIComponent(canvas.toDataURL('image/jpeg', 0.8));
                        commonService.loadingHide();
                        httpService.uploadpic(imgUrl, function (data) {
                            self.params.pics.push(data.imgurl);
                            self.imgArr.push(canvas.toDataURL('image/jpeg', 0.8));
                            $('.editBox').hide();
                        });
                    });
                },
                useHammer:function(){
                    var me = this;
                    var target = $('#photo')[0];
                    var hammertime = new Hammer(target);
                    hammertime.get('pinch').set({ enable: true });
                    hammertime.on('pinchmove',function(ev){
                        me.scale = ev.scale + me.endScale;
                        me.imgStyle();
                    });
                    hammertime.on('pinchend',function(ev){
                        if(me.scale < 1){
                            me.scale = 1;
                            me.imgStyle();
                        }else{
                            me.endScale = me.scale - 1;
                        }
                    });

                    hammertime.on('panstart',function(ev){
                        me.startX = ev.deltaX;
                        me.startY = ev.deltaY;
                    });
                    hammertime.on('panmove',function(ev) {
                        var curX = ev.deltaX - me.startX,curY = ev.deltaY - me.startY;
                        me.moveX = curX + me.endX;
                        me.moveY = curY + me.endY;
                        me.imgStyle();
                    });
                    hammertime.on('panend',function(ev){
                        me.endX = me.moveX;
                        me.endY = me.moveY;
                    });
                },
                imgStyle:function(){
                    var me = this;
                    $('#photo').css({
                        width: me.scale * 100 + '%',
                        left: me.moveX + 'px',
                        top: me.moveY + 'px',
                    });
                },
                cancelHandle: function () {
                    $('.editBox').hide();
                },
                useHandle: function () {
                    this.canvasHandle();
                }
            }
        });

        commonService.loadingShow();
        commonService.oauth(config, function () {
            viewport.init();

        })
    }
}());