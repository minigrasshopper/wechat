(function(){
	require([config.configUrl],function(){
		var reqArr = ['wxshare','barcode','qrcode'];
		require(reqArr,requireCb);
	});

	function requireCb(wxshare,barcode,qrcode){
	    var prizePage, verifyPage;
		var jq = window.jq = require('jquery').noConflict();
        var selfData = {
            title: '甜点消消乐', //活动标题
            prize: {
                prize_bg: 'images/prize_bg.jpg',
                btn_back: 'images/btn_back.png',
                ticket_bg: 'images/ticket_bg.png',
            }
        };

        var httpService = {
            index: function(cb){
                post('active/index', {gp: config.gp}, function(data){
                    cb && cb(data);
                });
            },
            mycoupon: function(cb){
                post('active/mycoupon', {gp: config.gp}, function(data){
                    cb && cb(data);
                });
            },
            checkpsd: function(params, cb){
                post('active/couponconsume', params, function(data){
                    cb && cb(data);
                });
            }
        };

		prizePage = new Vue({
            el: '#prizePage',
            data: {
                selfData: selfData,
				coupon: [],
                styles: {
                    bg: "background-image: url('" + selfData.prize.prize_bg + "')",
					ticket: "background-image: url('" + selfData.prize.ticket_bg + "')"
                },
            },
            mounted: function () {

            },
            methods: {
                init: function () {
                	var self = this;
                	httpService.mycoupon(function (data) {
						console.log(data);
						self.coupon = data.coupon;
                        self.$el.style.display = 'block';
                        share();
                    });
                },
                verifyHandle: function (info) {
                	if(info.consumemethod == 0 && info.isnet == 1){
                        gotoUrl(info.useurl);
					}else{
                        this.$el.style.display = 'none';
                        verifyPage.init(info);
					}
                },
                backHandle: function () {
                    jumpUrl('index.html');
                }
            }
        });

        verifyPage = new Vue({
            el: '#verifyPage',
            data: {
                item: null,
                password: '',
            },
            mounted: function () {
            },
			updated: function () {
                $('#qrcode').html('');
                jq('#qrcode').qrcode({width: 200, height: 200, text: this.item.code});
                $('#barcode').html('');
                jq('#barcode').barcode(this.item.code, 'code128', { //条形码
                    barWidth: 4,
                    barHeight: 120,
                    output: 'bmp'
                });
                this.$el.style.display = 'block';
            },
            methods: {
                init: function (info) {
                	console.log(info);
                	this.item = info;
                    this.password = '';
                },
                textConvert: function(str) {
                    // br表示换行
                    var textArr = str.split('br');
                    var html = '';
                    textArr.forEach(function(item, index, arr){
                        html += "<p>" + item + "</p>"
                    });
                    return html;
                },
                closeHandle: function () {
                    this.$el.style.display = 'none';
                    prizePage.init();
                },
                checkHandle: function () {
                    if(!this.password){
                        M.alert('密码不能为空！');
                    }else{
                        httpService.checkpsd({
                            code : this.item.code,
                            password : this.password,
                            gp : config.gp
                        }, function (data) {
                            var err = data.error - 0;
                            switch(err){
                                case 0:
                                    M.alert(data.error_msg);
                                    window.location.reload();
                                    break;
                                default:
                                    defaultError(data);
                                    break;
                            }
                        });
                    }
                }
            }
        });

        function selfDataInit(cb){
            httpService.index(function (data) {
                console.log(data);
                selfData.title = data.cfg.title;
                config.shareInfo.title = data.cfg.sharetitle;
                config.shareInfo.desc = data.cfg.sharecontent;
                config.shareInfo.imgUrl = data.cfg.sharepic;
                /*$.each(data.cfg.activesetting.imgs, function(key, value){
                    if(selfData.prize.hasOwnProperty(key)){
                        selfData.prize[key] = value;
                    }
                });*/
                $('head').find('title').text(selfData.title);
                cb && cb();
            })
        }

		function defaultError(data){
			var err = data.error - 0;
			switch(err){
				case 1002:
					oAuth.clear();
					M.alert('你的身份信息已过期，点击确定刷新页面');
					window.location.reload();
					break;
				default:
					M.alert(data.error_msg);
			}
		}

		function post(action,param,cb){
			M.loading();
			M.ajax(action,param,config.gameid,function(data){
				var err = data.error - 0;
				switch(err){
					case 0:
						cb && cb(data);
						break;
					default:
						defaultError(data);
				}
                M.loadingHide();
			},config.apiopenid, config.apitoken);
		}

        function share(succCb){
            wxshare.initWx(config.shareInfo, config.uid, config.apiopenid, config.apitoken, succCb, null, null, null);
        }

		M.loading();
		check(oAuth,function(){
            selfDataInit(function () {
                prizePage.init();
            });
		});
	}
}());
