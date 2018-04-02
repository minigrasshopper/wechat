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
		var hit_num = 0;	//击中年兽的次数
        var followGame = (getUrlParam().uid == 65)?true:false;  //只有uid为65时，关注玩游戏

        //阻止默认滚动事件
        $('#gamePage')[0].ontouchmove = function (e) {
            e.preventDefault();
        };

		window.oAudio_open = document.getElementById('audio_open');	//进场音乐
		window.oAudio_button = document.getElementById('audio_button');	//按钮声音
		window.oAudio_count = document.getElementById('audio_count');	//3秒倒计时
		window.oAudio_hit = document.getElementById('audio_hit');	//打中年兽的声音

		//首页
		indexPage.act = {
			init : function(){
				indexPage.data.index();
			},
			checkTouch : function(){
				var me = this;
				$('#ruleBtn').on(config.touch,function(){
					$('#rulePage').show();
					$('.ruleBox').addClass('rule_run');
                    oAudio_button.play();
				});
				$('#ruleCloseBtn').on(config.touch,function(){
					$('#rulePage').hide();
					$('.ruleBox').removeClass('rule_run');
                    oAudio_button.play();
				});
				$('#startBtn').on(config.touch,function(){
					gamePage.act.init();
					me.out();
                    oAudio_button.play();
				});
				$('#myprizeBtn').on(config.touch,function(){
					gotoUrl(config.htmlUrl+'myprize.html?uid='+config.uid+'&gp='+config.gp);
					me.out();
                    if(!oAudio_open.paused){
                        oAudio_open.pause();
                    }
                    oAudio_button.play();
				});
			},
			indexCb : function(data){
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
						$('#startBtn').addClass('start_run');
						$('.indexTitle').addClass('indexTitle_run');
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
					$('#startBtn').addClass('start_run');
					$('.indexTitle').addClass('indexTitle_run');
					me.checkTouch();
					M.loadingHide();
				}
                if(typeof WeixinJSBridge == "object" && typeof WeixinJSBridge.invoke == "function") {
                    WeixinJSBridge.invoke('getNetworkType', {}, function (res) {
                        oAudio_open.play();
                    });
                }else{
                    oAudio_open.play();
                }
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
			out : function(){
				$('#ruleBtn').off();
				$('#myPrizeBtn').off();
				$('#ruleCloseBtn').off();
				$('#startBtn').removeClass('start_run').off();
				$('.indexTitle').removeClass('indexTitle_run');
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
			time: '',	//游戏时间
			stateArr: [],	//3秒倒计时图片
			startScroll: 0,	//刚触屏的坐标
			bangerArr: [],	//banger样式
			boomArr: [],	//boom样式
			redbagArr: [],	//redbag样式
            timerLong: null,    //30s倒计时
			init: function(){
                var me = this;
				this.time = 30;
				hit_num = 0;
                window.clearInterval(me.timerLong);
				this.dataImport();
				$('#gamePage').show();
				this.startCountDown();
				this.bangerArr = ['banger_eye_left01','banger_eye_left02',
					'banger_face_left02','banger_face_left02',
					'banger_eye_right01','banger_eye_right02',
					'banger_face_right01','banger_face_right02',
					'banger_head01','banger_head02'];

				this.boomArr = ['boom_eye_left','boom_eye_left',
					'boom_face_left','boom_face_left',
					'boom_eye_right','boom_eye_right',
					'boom_face_right','boom_face_right',
					'boom_head','boom_head'];

				this.redbagArr = ['redbag_eye_left','redbag_eye_left',
					'redbag_face_left','redbag_face_left',
					'redbag_eye_right','redbag_eye_right',
					'redbag_face_right','redbag_face_right',
					'redbag_head','redbag_head'];
			},
			dataImport: function(){
				$('#gamePage').css({'background-image': "url('" + self_imgs.game_bg + "')"});
				$('#nian').attr({'src': self_imgs.nian_origin});
				$('.score-time>p').eq(0).find('img').attr({'src': self_imgs.score});
				$('.score-time>p').eq(1).find('img').attr({'src': self_imgs.clock});
				this.stateArr = [self_imgs.num_3, self_imgs.num_2,self_imgs.num_1,self_imgs.num_go];
				$('#boomBtn').attr({'src': self_imgs.banger});
				$('#hand').attr({'src': self_imgs.hand});
				$('#good').attr({'src': self_imgs.good});
				$('#score').text(hit_num);
				$('#second').text(this.time);
			},
			checkTouch: function(){
                var me = this;
                $('#touchBox').on('touchstart',function(){
                    me.startMove();
                });
                $('#touchBox').on('touchend',function(){
                    me.endMove();
                });

                $('#gamePage').delegate('.banger,.boom,.redbag','animationend',function(){
                    $(this).remove();
                });
                $('#gamePage').delegate('.banger,.boom,.redbag','webkitAnimationEnd',function(){
                    $(this).remove();
                });
			},
			startMove: function(){
				var e = window.event || arguments[0];
				this.startScroll = e.changedTouches[0].pageY;
			},
			endMove: function(){
				var e = window.event || arguments[0];
				var gapScroll = -(e.changedTouches[0].pageY - this.startScroll);
				if(gapScroll >= 30){
                    $('#hand').hide();
					//随机扔出红包 + 鞭炮 + boom
					this.randomAdd();
                    hit_num ++ ;
                    $('#score').text(hit_num);
					setTimeout(function(){
                        $('#audioBox').find('audio').first().remove();
                        var html = '<audio src="http://qcdn.letwx.com/app/nianbeast-build/resource/hit.mp3" autoplay preload=""></audio>';
						$('#audioBox').append(html);
                        $('#nian').attr({'src': self_imgs.nian_active}).addClass('nian_run');
					},800);
					setTimeout(function(){
						$('#nian').attr({'src': self_imgs.nian_origin}).removeClass('nian_run');
					},1000);
				}
				//good图标显示
				if(hit_num !== 0 && hit_num % 10 == 0){
					$('#good').show().addClass('good_run');
					setTimeout(function(){
						$('#good').hide().removeClass('good_run');
					},500);
				}
			},
			randomAdd: function(){
				var index = random(0,this.bangerArr.length);
				var html = '<img class="abs-h-center banger ' + this.bangerArr[index] + '" src="' + self_imgs.banger + '" alt=""/>' +
					'<img class="abs-center boom ' + this.boomArr[index] + '" src="' + self_imgs.boom + '" alt=""/> ' +
					'<img class="abs-h-center redbag ' + this.redbagArr[index] + '" src="' + self_imgs.redbag + '" alt=""/>';
				$('#gamePage').append(html);
			},
			startCountDown: function(){
				var me = this;
				var index = 0;
                $('#state').show();
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
						$('#state').hide();
                        $('#state').removeClass('state_run');
						me.gameStart();
						me.checkTouch();
					}else{
						$('#state').attr({'src': me.stateArr[index]});
					}
				},1000);
			},
			gameStart: function(){
				var me = this;
                $('#hand').show();
				this.timerLong = window.setInterval(function(){
					if(me.time>0){
						if(me.time>=10){
							$('#second').text(me.time);
						}else{
							$('#second').text('0' + me.time);
						}
						me.time --;
					}else{
                        me.out();
						$('#second').text('00');
						if(!oAudio_open.paused){
							oAudio_open.pause();
						}
						window.clearInterval(me.timerLong);
						resultPage.act.init();
					}
				},1000);
			},
			out: function(){
                $('#gamePage').find('.banger,.boom,.redbag').remove();
                $('#touchBox').off();
                $('#hand').hide();
                $('#audioBox').html('');
                $('#gamePage').undelegate();
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
                    if(hit_num < Number(self_texts.num)){
                        $('#resultBox').find('.hint').html(self_texts.low_hint);
                    }else{
                        M.loading();
                        resultPage.data.save();
                    }
                }
			},
			dataImport: function(){
                $('#resultBox').find('.numShow').html('您击中<span>' + hit_num + '</span>次');
                $('.resultBg').attr({'src': self_imgs.result_bg});
				$('#againBtn').attr({'src': self_imgs.again_btn});
                $('#shareBtn').attr({'src': self_imgs.share_btn});
                $('#sharePage').find('img').attr({'src': self_imgs.share_hint});
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
					me.out();
					gamePage.act.init();
                    oAudio_button.play();
                    oAudio_open.play();
				});
				$('#shareBtn').on(config.touch,function(){
					$('#sharePage').show();
                    oAudio_button.play();
				});
				$('#sharePage').on(config.touch,function(){
					$('#sharePage').hide();
				});
			},
			out : function(){
				$('#againBtn').off();
				$('#shareBtn').off();
				$('#resultPage').hide();
			}
		};
		
		resultPage.data = {
			save : function(){
				post('active/saveplay',{
                    hit_num : hit_num,
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
