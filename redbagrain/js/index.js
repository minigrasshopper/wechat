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
        var score = 0;   //得分
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
                console.log(self_imgs);
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
                /*if(typeof WeixinJSBridge == "object" && typeof WeixinJSBridge.invoke == "function") {
                    WeixinJSBridge.invoke('getNetworkType', {}, function (res) {
                        oAudio_bg.play();
                    });
                }else{
                    oAudio_bg.play();
                }*/
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
                    /*if(!oAudio_bg.paused){
                        oAudio_bg.pause();
                    }*/
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
            time: null,    //倒计时时长
			init: function(){
				this.dataImport();
				$('#gamePage').show();
				this.startCountDown();
			},
			dataImport: function(){
                $('#gamePage').css({'background-image': "url('" + self_imgs.game_bg + "')"});
                $('.bagMask').attr({'src': self_imgs.bag_mask});
                $('.gameTitle').attr({'src': self_imgs.game_title});
                $('.gameDecorate').attr({'src': self_imgs.game_decorate});
				this.stateArr = [self_imgs.num_3, self_imgs.num_2,self_imgs.num_1];
			},
			checkTouch: function(){
                $('#gameBox').delegate('img',config.touch,function(){
                    score ++;
                    console.log(score);
                    var xiu = '<audio class="audio_xiu" src="http://qcdn.letwx.com/app/redbagrain-build/resource/xiu.mp3" autoplay preload></audio>';
                    $('body').append(xiu);
                    $(this).css({left: $(this).css('left'), top: $(this).css('top')})
                        .attr('src',self_imgs.bag_active).addClass('bagActive');
                        //.removeClass('bagDown_slow').removeClass('bagDown_medium').removeClass('bagDown_quick')
                    setTimeout(function(){
                        $(this).remove();
                    }.bind(this),500);
                });
			},
            randomAdd: function(){
                var speed = ['bagDown_slow','bagDown_medium','bagDown_quick','bagDown_extra'];
                var html1 = '<img class="abs ' + speed[random(0,4)] + '" style="left:' + random(0,8) + '%" src="' + self_imgs.bag + '" alt=""/>';
                var html2 = '<img class="abs ' + speed[random(0,4)] + '" style="left:' + random(25,33) + '%" src="' + self_imgs.bag + '" alt=""/>';
                var html3 = '<img class="abs ' + speed[random(0,4)] + '" style="left:' + random(50,58) + '%" src="' + self_imgs.bag + '" alt=""/>';
                var html4 = '<img class="abs ' + speed[random(0,4)] + '" style="left:' + random(75,83) + '%" src="' + self_imgs.bag + '" alt=""/>';
                $('#gameBox').append(html1 + html2 + html3 + html4);
            },
            gameOrigin: function(){
            },
            gameStart: function(){
                var me = this;
                var add_timer = setInterval(function(){
                    me.randomAdd();
                },1000);
                var game_timer = setInterval(function(){
                    if(me.time>0){
                        if(me.time>=10){
                            $('#second').text(me.time);
                        }else{
                            $('#second').text('0' + me.time);
                        }
                        me.time --;
                    }else{
                        $('#second').text('00');
                        $('#gameBox').html('');
                        $('.audio_xiu').remove();
                        //游戏结束的状态
                        /*if(!oAudio_bg.paused){
                            oAudio_bg.pause();
                        }*/
                        clearInterval(add_timer);
                        clearInterval(game_timer);
                        me.out();
                        resultPage.act.init();
                    }
                },1000);
            },
			startCountDown: function(){
				var me = this;
                var index = 0;  //倒计时下标
                //游戏界面初始化出现
                $('#gameBox').html('');
                this.time = self_texts.time;
                score = 0;
                this.gameOrigin();
                $('#second').text(this.time);
                //游戏界面初始化结束
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
                $('#gameBox').off();
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
                    if(score < Number(self_texts.score)){
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
                $('#resultBox').find('.numShow').html('您抢到<span>' + score + '</span>个红包');
                $('.resultBg').attr({'src': self_imgs.result_bg});
				$('#againBtn').attr({'src': self_imgs.again_btn});
                $('#getBtn').attr({'src': self_imgs.get_btn});
                $('#shareBtn').attr({'src': self_imgs.share_btn});
                $('#resultPage').find('.resultDecorate').attr({'src': self_imgs.result_decorate});
                $('#sharePage').find('.shareHint').attr({'src': self_imgs.share_hint});
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
                    //oAudio_bg.play();
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
                    score : score,
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
