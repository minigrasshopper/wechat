(function(){
	require([config.configUrl],function(){
		var reqArr = ['wxshare'];
		require(reqArr,requireCb);
	});
	
	function requireCb(wxshare){
        var indexPage, onePage, twoPage, threePage, fourPage, fivePage, resultPage, sharePage;
        window.audioBg = document.getElementById('audioBg');	// 背景音乐
        var musicPlay = true;
        var selfData = {
            title: '砸蛋蛋', // 活动标题
            rules: '1、我是规则。<br/>2、我是规则。<br/>3、我是规则。',  // 活动规则
            isexpired: 0,    // 活动是否过期
            maxplaynum: 0,  // 最多游戏次数 0-无限制
            maxdayplaynum: 0,   // 每天最多游戏次数 0-无限制
            playnum: 0,   // 已玩游戏次数
            todayplaynum: 0,   // 今天已玩游戏次数
            needfollow: 0,  // 是否需要关注
            isfollow: 0,    // 是否已关注
            qrcodeurl: 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=gQH58DwAAAAAAAAAAS5odHRwOi8vd2VpeGluLnFxLmNvbS9xLzAyNDBLRTlWellhUGUxMDAwMDAwN3gAAgRyuEBaAwQAAAAA',  // 关注二维码
            index: {
                logo: 'images/logo.png',
            },
            text: {
                // 首页文本
                expired_hint: '活动已过期', // 活动过期-不能玩游戏，可以查看奖品
                // 结果页文本
                nice_hint: '恭喜您br解密情书成功br获得情人节礼物一份',   // 有奖品
                exhaust_hint: '哎呀br解密情书成功br未获得礼物',    // 奖品已经用完了
            }
        };

        var httpService = {
            index: function(cb){
                post('active/index',{ gp : config.gp },function(data){
                    cb && cb(data);
                });
            },
            save: function(cb){
                post('active/saveplay',{ gp : config.gp },function(){
                    cb && cb();
                });
            },
            getcoupon: function(cb){
                post('active/getcoupon',{ gp : config.gp },function(data){
                    cb && cb(data);
                });
            }
        };

		indexPage = new Vue({
            el: '#indexPage',
            data: {
                selfData: selfData,
                musicPlay: musicPlay,
                canTry: false,
                canGet: false
            },
            methods: {
                init: function () {
                    var self = this;
                    this.musicPlay = musicPlay;
                    this.judgeMusicPlay();
                    this.judgeFollow();
                    this.$el.style.display = 'block';
                    share();
                    setTimeout(function () {
                        self.canTry = true;
                    }, 2500);
                    this.$nextTick(function () {
                        var hammer = new Hammer($('body')[0]);
                        hammer.add(new Hammer.Pinch());
                        // 暂时写成press
                        hammer.on("pinchin", function (e) {
                            if(!self.canTry){
                                return false;
                            }
                            $('#indexPage').find('.hand').hide();
                            $('#indexPage').find('.male').addClass('male_female_out');
                            $('#indexPage').find('.female').addClass('male_female_out');
                            hammer.remove("pinchin");
                            setTimeout(function () {
                                self.canGet = true;
                            }, 1500);
                        });
                    });
                },
                jumpNext: function () {
                    if(!this.judgeGameState()){
                        return false;
                    }
                    this.$el.style.display = 'none';
                    onePage.init();
                },
                judgeMusicPlay: function () {
                    if(this.musicPlay){
                        if(typeof WeixinJSBridge == "object" && typeof WeixinJSBridge.invoke == "function") {
                            WeixinJSBridge.invoke('getNetworkType', {}, function (res) {
                                audioBg.play();
                            });
                        }else{
                            audioBg.play();
                        }
                    }else{
                        audioBg.pause();
                    }
                },
                toggleMusic: function (state) {
                    switch (state){
                        case 1:
                            this.musicPlay = true;
                            break;
                        case 0:
                            this.musicPlay = false;
                            break;
                    }
                    this.judgeMusicPlay();
                },
                judgeFollow: function(){
                    if(selfData.needfollow == 1){
                        if(selfData.isfollow == 0){
                            $('#followPage').show().find('img').attr('src', selfData.qrcodeurl);
                        }
                    }
                },
                judgeGameState: function(){
                    // 判断活动是否过期-不能玩游戏，查看奖品
                    if(selfData.isexpired == 1){
                        M.alert(selfData.text.expired_hint);
                        return false;
                    }
                    return true;
                },
            }
        });

		onePage = new Vue({
            el: '#onePage',
            data: {
            },
            methods: {
                init: function () {
                    this.$el.style.display = 'block';
                },
                lockHandle: function () {
                    var self = this;
                    $(this.$el).find('.lockBtn').hide();
                    $(this.$el).find('.hint').show().addClass('fadeIn');
                    $('#cvs').show();
                    setTimeout(function () {
                        $(self.$el).find('.origin').hide();
                    }, 500);
                    canvas_img('images/one_origin.jpg', 'onePage' ,'cvs', function (touchNum) {
                        $(self.$el).find('.hint').hide();
                        if(touchNum >= 3){
                            $('#cvs').addClass('fadeOut');
                            setTimeout(function () {
                                $(self.$el).find('.newBtn').show();
                            }, 1500);
                        }
                    });
                },
                jumpNext: function () {
                    this.$el.style.display = 'none';
                    twoPage.init();
                },
            }
        });

        twoPage = new Vue({
            el: '#twoPage',
            data: {
                canRun: false
            },
            methods: {
                init: function () {
                    this.$el.style.display = 'block';
                },
                lockHandle: function () {
                    $(this.$el).find('.lockBtn').hide();
                    $(this.$el).find('.hint').show().addClass('fadeIn');
                    this.canRun = true;
                },
                resultHandle: function () {
                    var self = this;
                    if(this.canRun){
                        $(this.$el).find('.hint').hide();
                        $(this.$el).find('.person').addClass('person_run');
                        $(this.$el).find('.result').show().addClass('fadeIn');
                        setTimeout(function () {
                            $(self.$el).find('.newBtn').show();
                        }, 1500);
                    }
                },
                jumpNext: function () {
                    this.$el.style.display = 'none';
                    threePage.init();
                },
            }
        });

        threePage = new Vue({
            el: '#threePage',
            data: {
                canRun: false
            },
            methods: {
                init: function () {
                    this.$el.style.display = 'block';
                },
                lockHandle: function () {
                    $(this.$el).find('.lockBtn').hide();
                    $(this.$el).find('.hint').show().addClass('fadeIn');
                    this.canRun = true;
                },
                resultHandle: function () {
                    var self = this;
                    if(this.canRun){
                        $(this.$el).find('.hint').hide();
                        $(this.$el).find('.text').hide();
                        $(this.$el).find('.result').show().addClass('fadeIn');
                        $(this.$el).find('.heart').show().addClass('fadeIn');
                        setTimeout(function () {
                            $(self.$el).find('.newBtn').show();
                        }, 3500);
                    }
                },
                jumpNext: function () {
                    this.$el.style.display = 'none';
                    fourPage.init();
                },
            }
        });

        fourPage = new Vue({
            el: '#fourPage',
            data: {

            },
            methods: {
                init: function () {
                    this.$el.style.display = 'block';
                },
                lockHandle: function () {
                    var self = this;
                    $(this.$el).find('.lockBtn').hide();
                    $(this.$el).find('.hint').show().addClass('fadeIn');
                    setTimeout(function () {
                        $(self.$el).find('.newBtn').show();
                    }, 5000);
                },
                jumpNext: function () {
                    this.$el.style.display = 'none';
                    fivePage.init();
                },
            }
        });

        fivePage = new Vue({
            el: '#fivePage',
            data: {

            },
            methods: {
                init: function () {
                    this.$el.style.display = 'block';
                },
                lockHandle: function () {
                    var self = this;
                    $(this.$el).find('.lockBtn').hide();
                    $(this.$el).find('.hint').show().addClass('fadeIn');
                    setTimeout(function () {
                        $(self.$el).find('.fiveBg').addClass('fadeOut');
                    }, 3000);
                    setTimeout(function () {
                        $(self.$el).find('.fiveBg2').show().addClass('fadeIn');
                    }, 3500);
                    setTimeout(function () {
                        $(self.$el).find('.newBtn').show();
                    }, 5000);
                },
                jumpNext: function () {
                    resultPage.init();
                },
            }
        });

        resultPage = new Vue({
            el: '#resultPage',
            data: {
                selfData: selfData,
                state: 1,   // 1-有奖 2-券用尽
            },
            methods: {
                init: function () {
                    var self = this;
                    M.loading();
                    setTimeout(function () {
                        self.judgeResult();
                    }, 1000);
                },
                judgeResult: function () {
                    var self = this;
                    httpService.save(function () {
                        httpService.getcoupon(function (data) {
                            switch (data.hasget){
                                case 1:
                                    self.state = 1;
                                    break;
                                case 0:
                                    self.state = 2;
                                    break;
                            }
                            self.$el.style.display = 'block';
                        });
                    });
                },
                textConvert: function(str) {
                    // str-文本字符串 br-换行 @-分数
                    var html = '';
                    var textArr = str.split('br');
                    if(textArr.length == 1){
                        html = "<h2>" + textArr[0] + "</h2>";
                        return html;
                    }else{
                        html = "<h2>" + textArr[0] + "</h2>";
                        textArr.forEach(function (item, index) {
                            if(index != 0){
                                html += "<p>" + textArr[index] + "</p>";
                            }
                        });
                        return html;
                    }
                },
                againHandle: function () {
                    jumpUrl('index.html');
                },
                getHandle: function () {
                    jumpUrl('prize.html');
                },
                shareHandle: function () {
                    sharePage.init();
                }
            }
        });

        sharePage = new Vue({
            el: '#sharePage',
            data: {
                selfData: selfData,
            },
            mounted: function () {

            },
            methods: {
                init: function () {
                    this.$el.style.display = 'block';
                },
                closeHandle: function () {
                    this.$el.style.display = 'none';
                }
            }
        });
		
        function selfDataInit(cb){
            httpService.index(function (data) {
                console.log(data);
                selfData.title = data.cfg.title;
                selfData.rules = data.cfg.rules;
                selfData.isexpired = data.cfg.isend;
                selfData.maxplaynum = data.maxplaynum;
                selfData.maxdayplaynum = data.maxdayplaynum;
                selfData.playnum = data.playnum;
                selfData.todayplaynum = data.todayplaynum;
                selfData.needfollow = data.cfg.needfollow;
                selfData.isfollow  = data.isfollow;
                selfData.qrcodeurl = data.cfg.qrcodeurl;
                selfData.index.logo = data.cfg.activesetting.imgs.logo;
                config.shareInfo.title = data.cfg.sharetitle;
                config.shareInfo.desc = data.cfg.sharecontent;
                config.shareInfo.imgUrl = data.cfg.sharepic;
                /*$.each(data.cfg.activesetting.imgs, function(key, value){
                    if(selfData.index.hasOwnProperty(key)){
                        selfData.index[key] = value;
                    }
                });*/
                $.each(data.cfg.activesetting.txts, function(key, value){
                    if(selfData.text.hasOwnProperty(key)){
                        selfData.text[key] = value;
                    }
                });
                $('head').find('title').text(selfData.title);
                cb && cb();
            })
        }

		function defaultError(data){
			switch(Number(data.error)){
				case 1002:
					oAuth.clear();
					M.alert('你的身份信息已过期，点击确定刷新页面');
					window.location.reload();
					break;
				default:
					M.alert(data.error_msg);
                    break;
			}
		}
		
		function post(action, param, cb){
            M.loading();
			M.ajax(action, param, config.uid, function(data){
				switch(Number(data.error)){
					case 0:
						cb && cb(data);
						break;
					default:
						defaultError(data);
                        break;
				}
                M.loadingHide();
			}, config.apiopenid, config.apitoken, config.isDebug ? 'nf' : '');
		}
		
		function share(succCb){
			wxshare.initWx(config.shareInfo, config.uid, config.apiopenid, config.apitoken, succCb, null, null, null);
		}
		
		//产生随机数 例如，生成0-9的随机数(包括0,不包括9) random(0,9)
	    function random(min,max){
	    	return Math.floor(min+Math.random()*(max-min));
	    }
	    
		M.loading();
		check(oAuth,function(){
            selfDataInit(function () {
                indexPage.init();
                M.loadingHide();
            });
		});
	}
}());
