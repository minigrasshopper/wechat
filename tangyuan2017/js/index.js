(function(){
	require([config.configUrl],function(){
		var reqArr = ['wxshare'];
		require(reqArr,requireCb);
	});
	
	function requireCb(wxshare){
		var indexPage = {}; //首页对象
		var gamePage = {}; //游戏页面对象
		var resultPage = {}; //领券页面对象
		var pageData = '';  //后台自定义数据
		var self_imgs = '';	//后台自定义图片数据
		var self_texts = '';	//后台自定义文本数据
        var baby_num = 0;   //吃到的汤圆数量
        var followGame = (getUrlParam().uid == 65)?true:false;  //只有uid为65时，关注玩游戏

        //阻止默认滚动事件
        $('#gamePage')[0].ontouchmove = function (e) {
            e.preventDefault();
        };

		window.oAudio_bg = document.getElementById('audio_bg');	//背景音乐
		window.oAudio_button = document.getElementById('audio_button');	//按钮声音
		window.oAudio_count = document.getElementById('audio_count');	//3秒倒计时

		//首页
		indexPage.act = {
			init : function(){
				indexPage.data.index();
			},
            indexCb: function(data){
                var me = this;
                pageData = data;
                self_texts = data.cfg.activesetting.txts;
                self_imgs = data.cfg.activesetting.imgs;
                if(imgs.length){
                    M.imgpreload(imgs,function(){
                        me.wxshare(data.cfg);
                        me.dataImport();
                        if(followGame){
                            me.isFollow(data);
                        }
                        $('#indexPage').show();
                        me.checkTouch();
                        M.loadingHide();
                    });
                }else{
                    me.wxshare(data.cfg);
                    me.dataImport();
                    if(followGame){
                        me.isFollow(data);
                    }
                    $('#indexPage').show();
                    me.checkTouch();
                    M.loadingHide();
                }
                if(typeof WeixinJSBridge == "object" && typeof WeixinJSBridge.invoke == "function") {
                    WeixinJSBridge.invoke('getNetworkType', {}, function (res) {
                        oAudio_bg.play();
                    });
                }else{
                    oAudio_bg.play();
                }
            },
			checkTouch: function(){
				var me = this;
				$('#ruleBtn').on(config.touch,function(){
                    oAudio_button.play();
					$('#rulePage').show();
					$('.ruleBox').addClass('rule_run');
				});
				$('#ruleCloseBtn').on(config.touch,function(){
                    oAudio_button.play();
					$('#rulePage').hide();
					$('.ruleBox').removeClass('rule_run');
				});
				$('#startBtn').on(config.touch,function(){
                    oAudio_button.play();
					gamePage.act.init();
					me.out();
				});
				$('#myprizeBtn').on(config.touch,function(){
                    oAudio_button.play();
					gotoUrl(config.htmlUrl+'myprize.html?uid='+config.uid+'&gp='+config.gp);
					me.out();
                    if(!oAudio_bg.paused){
                        oAudio_bg.pause();
                    }
				});
			},
			dataImport: function(){
				$('#title').text(pageData.cfg.title);
				$('#indexPage').css({'background-image': "url('" + self_imgs.index_bg + "')"});
				$('#logo').attr({'src': self_imgs.logo});
				$('.indexTitle').attr({'src': self_imgs.index_title});
				$('#startBtn').attr({'src': self_imgs.start_btn});
				$('#ruleBtn').attr({'src': self_imgs.rule_btn});
				$('#myprizeBtn').attr({'src': self_imgs.myprize_btn});
				$('#ruleBg').attr({'src': self_imgs.rule_bg});
				$('#ruleCloseBtn').attr({'src': self_imgs.close_btn});
				$('.rules').html(pageData.cfg.rules);
			},
			wxshare: function(data){
				config.shareInfo.title = data.sharetitle || config.shareInfo.title;
				config.shareInfo.desc = data.sharecontent || config.shareInfo.desc;
				config.shareInfo.imgUrl = data.sharepic || config.shareInfo.imgUrl;
				share(config.shareInfo);
			},
			isFollow: function(data){
				//试玩游戏是否需要关注 0-不需要  1-需要
				if(!data.cfg.needfollow){
					//不需要关注
					$('#followPage').hide();
				}else{	//需要关注
					if(data.isfollow){
						//已经关注
						$('#followPage').hide();
					}else{
						//未关注
						$('#followPage').show().find('img').attr({'src': data.cfg.qrcodeurl});
					}
				}
			},
			out: function(){
				$('#ruleBtn').off();
				$('#myPrizeBtn').off();
				$('#ruleCloseBtn').off();
				$('#startBtn').off();
				$('#indexPage').hide();
			}
		};
		
		indexPage.data = {
			index : function(){
				post('active/index',{
					gp : config.gp
				},function(data){
					indexPage.act.indexCb(data);
				});
			}
		};

		gamePage.act = {
			stateArr: [],	//3秒倒计时图片
            first_index: null,    //当前娃娃下标
            last_index: null,    //最后娃娃下标
            time: 0,    //倒计时时长
            timer: null,    //倒计时定时器
			init: function(){
				this.dataImport();
				$('#gamePage').show();
				this.startCountDown();
			},
			dataImport: function(){
                $('.gameTitle').attr({'src': self_imgs.game_title});
				this.stateArr = [self_imgs.num_3, self_imgs.num_2,self_imgs.num_1];
                $('#clock').find('img').attr('src', self_imgs.clock);
                $('#hand').attr('src', self_imgs.hand);
			},
			checkTouch: function(){
                var me = this;
                $('#babyBox').delegate('p',config.touch,function(){
                    me.downMove($(this));
                });
			},
            randomAdd: function(index){
                if(index == -1){
                    var img = '';
                }else{
                    var img = '<img class="abs-center" data-index="' + index + '" src="' + self_imgs.baby + '" />';
                }
                var i = random(0,4);
                if(index == 0){
                    i = 1;
                }
                var li = '<li><p></p><p></p><p></p><p></p></li>';
                $('#babyBox').prepend(li);
                $('#babyBox').find('li').eq(0).height($(window).width()*0.25);
                $('#babyBox').find('li').eq(0).find('p').eq(i).append(img);
            },
            downMove: function(dom){
                //dom - p标签
                var me = this;
                if(!dom[0].firstElementChild){
                    //1-p内木有img，游戏结束
                    //gameover
                    dom.addClass('wrong_run');
                    clearInterval(me.timer);
                    $('#babyBox').off();
                    setTimeout(function(){
                        me.out();
                        resultPage.act.init();
                    },1500);
                    return ;
                }else if(this.first_index != dom.find('img').data('index')){
                    //2-p有img，index值不相同，不动
                    return ;
                }
                $('#hand').hide();
                $('#babyBox').find('li').addClass('li_run');
                this.first_index ++;
                this.randomAdd(this.last_index);
                this.last_index ++;
                baby_num ++;
                $('#babyBox').find('li').css({
                    transform: 'translateY(' + this.first_index + '00%)',
                    transition: 'all 0.2s linear'
                });
                dom.find('img').attr('src', self_imgs.baby_active);
            },
            gameOrigin: function(num){
                //num - 初始状态下遍历个数
                this.first_index = 0;
                this.last_index = -1;
                for(var i=-1;i<num;i++){
                    this.randomAdd(this.last_index);
                    this.last_index ++;
                }
            },
            gameStart: function(){
                var me = this;
                this.timer = setInterval(function(){
                    if(me.time>0){
                        if(me.time>=10){
                            $('#second').text(me.time);
                        }else{
                            $('#second').text('0' + me.time);
                        }
                        me.time --;
                    }else{
                        $('#second').text('00');
                        //游戏结束的状态
                        if(!oAudio_bg.paused){
                            oAudio_bg.pause();
                        }
                        clearInterval(me.timer);
                        me.out();
                        resultPage.act.init();
                    }
                },1000);
            },
			startCountDown: function(){
				var me = this;
				var index = 0;
                //游戏界面出现开始
                $('#babyBox').show().html('');
                this.gameOrigin(10);
                $('#hand').show();
                $('#clock').show();
                this.time = 20;
                baby_num = 0;
                $('#second').text(this.time);
                //游戏界面出现结束
                $('#startBox').show();
				$('#state').attr({'src': this.stateArr[0]}).addClass('state_run');
				setTimeout(function(){
					if(typeof WeixinJSBridge == "object" && typeof WeixinJSBridge.invoke == "function") {
						WeixinJSBridge.invoke('getNetworkType', {}, function (res) {
							oAudio_count.play();
						});
					}else{
						oAudio_count.play();
					}
				},1000);

				var timer = setInterval(function(){
					index ++;
					if(index >= me.stateArr.length){
						clearInterval(timer);
						$('#startBox').hide();
                        $('#state').removeClass('state_run');
						me.gameStart();
						me.checkTouch();
					}else{
						$('#state').attr({'src': me.stateArr[index]});
					}
				},1000);
			},
			out: function(){
                $('#babyBox').off().html('');
                $('#gamePage').hide();
                $('#clock').hide();
                $('#hand').hide();
            }
		};

		resultPage.act = {
			init : function(){
				this.dataImport();
                $('#resultPage').show();
                this.checkTouch();
                if(!this.judgeGame()){
                    return;
                }else{
                    if(baby_num < Number(self_texts.num)){
                        $('#resultBox').find('.hint').html(self_texts.low_hint);
                    }else{
                        M.loading();
                        resultPage.data.save();
                    }
                }
			},
            judgeGame: function(){
                var isstart = pageData.cfg.isstart;
                var isend = pageData.cfg.isend;
                var couponnum = pageData.couponnum;  //已获得奖品数量
                var maxcouponnum = pageData.maxcouponnum;   //最大领券数量 0-无限制
                //1.判断游戏开始、结束
                if(!isstart){
                    $('#resultBox').find('.hint').html(self_texts.start_hint);
                    return false;
                }else if(isend){
                    $('#resultBox').find('.hint').html(self_texts.end_hint);
                    return false;
                }
                //2.总领券已上限
                if(maxcouponnum != 0 && couponnum == maxcouponnum){
                    $('#resultBox').find('.hint').html(self_texts.totalmax_hint);
                    return false;
                }
                //3.每天领券已上限

                return true;
            },
			dataImport: function(){
                $('#resultBox').find('.numShow').html('你成功吃到<span>' + baby_num + '</span>个好汤圆');
                $('.resultBg').attr({'src': self_imgs.result_bg});
				$('#againBtn').attr({'src': self_imgs.again_btn});
                $('#getBtn').attr({'src': self_imgs.get_btn});
                $('#shareBtn').attr({'src': self_imgs.share_btn});
                $('#sharePage').find('img').attr({'src': self_imgs.share});
                $('#resultPage').find('.star').attr({'src': self_imgs.star});
			},
			saveCb : function(data){
				resultPage.data.getcoupon(data);
			},
			getcouponCb : function(data){
				M.loadingHide();
				if(data.hasget == 0){
					$('#resultBox').find('.hint').html(self_texts.no_hint);
				}else{
					$('#resultBox').find('.hint').html(self_texts.has_hint);
				}
			},
			checkTouch : function(){
				var me = this;
				$('#againBtn').on(config.touch,function(){
                    oAudio_button.play();
                    oAudio_bg.play();
					me.out();
					gamePage.act.init();
				});
				$('#getBtn').on(config.touch,function(){
                    oAudio_button.play();
                    gotoUrl(config.htmlUrl+'myprize.html?uid='+config.uid+'&gp='+config.gp);
				});
				$('#shareBtn').on(config.touch,function(){
                    oAudio_button.play();
					$('#sharePage').show();
				});
				$('#sharePage').on(config.touch,function(){
					$('#sharePage').hide();
				});
			},
			out : function(){
				$('#againBtn').off();
				$('#getBtn').off();
				$('#shareBtn').off();
				$('#resultPage').hide();
			}
		};
		
		resultPage.data = {
			save : function(){
				post('active/saveplay',{
                    baby_num : baby_num,
					gp : config.gp
				},function(data){
					resultPage.act.saveCb(data);
				});
			},
			getcoupon : function(){
				post('active/getcoupon',{
					gp : config.gp
				},function(data){
					resultPage.act.getcouponCb(data);
				});
			}
		};

		function defaultError(data){
			var err = data.error - 0;
			M.loadingHide();
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
			wxshare.initWx(shareInfo,config.gameid,config.apiopenid,config.apitoken,succCb,null,null,null);
		}
		
		//产生随机数 例如，生成0-9的随机数(包括0,不包括9) random(0,9)
	    function random(min,max){
	    	return Math.floor(min+Math.random()*(max-min));
	    }
	    
		M.loading();
		check(oAuth,function(){
			indexPage.act.init();
		});

	}

	//需要预加载的图片
	var imgs = [];
}());
