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
		var getbaby = 0;	//抓到baby的个数
        var timer1 = '';
        var timer2 = '';
        var timer3 = '';
        var double = '';    //是否是双语
		window.oAudio1 = document.getElementById('audio1');		//重复播放
        var followGame = (getUrlParam().uid == 65)?true:false;

		//首页
		indexPage.act = {
			init : function(){
				indexPage.data.index();
			},
			checkTouch : function(){
				var me = this;
				$('#ruleBtn').on(config.touch,function(){
					$('#rulePage').show();
					$('.ruleInfo').addClass('rule_run');
				});
				$('#ruleCloseBtn').on(config.touch,function(){
					$('#rulePage').hide();
					$('.ruleInfo').removeClass('rule_run');
				});
				$('#startBtn').on(config.touch,function(){
					gamePage.act.init();
					me.out();
				});
				$('#myprizeBtn').on(config.touch,function(){
					gotoUrl(config.htmlUrl+'myprize.html?uid='+config.uid+'&gp='+config.gp);
					me.out();
				});
			},
			indexCb : function(data){
				var me = this;
				pageData = data.cfg;
				self_texts = data.cfg.activesetting.txts;
				self_imgs = data.cfg.activesetting.imgs;
                if(self_texts.double){
                    double = self_texts.double - 0;
                }else{
                    double = 0;
                }
				if(imgs.length){
					M.imgpreload(imgs,function(){
						me.wxshare(pageData);
						me.dataImport();
                        if(followGame){
                            me.isFollow(data);
                        }
						$('#indexPage').show();
						$('#startBtn').addClass('btn_run02');
						$('.indexTitle').addClass('indexTitle_run');
						me.checkTouch();
						M.loadingHide();
					});
				}else{
					me.wxshare(pageData);
					me.dataImport();
                    if(followGame){
                        me.isFollow(data);
                    }
					$('#indexPage').show();
					$('#startBtn').addClass('btn_run02');
					$('.indexTitle').addClass('indexTitle_run');
					me.checkTouch();
					M.loadingHide();
				}

				if(typeof WeixinJSBridge == "object" && typeof WeixinJSBridge.invoke == "function") {
					WeixinJSBridge.invoke('getNetworkType', {}, function (res) {
						oAudio1.play();
					});
				}else{
					oAudio1.play();
				}
			},
			dataImport: function(){
				$('#title').text(pageData.title);
				$('#indexPage').css({'background-image': "url('" + self_imgs.bg_index + "')"});
				$('#logo').attr({'src': self_imgs.logo});
				$('.indexTitle').attr({'src': self_imgs.title});
				$('#startBtn').find('img').attr({'src': self_imgs.start_btn});
				$('#ruleBtn').find('img').attr({'src': self_imgs.rule_btn});
				$('#myprizeBtn').find('img').attr({'src': self_imgs.myprize_btn});
				$('#rulePage').css({'background-image': "url('" + self_imgs.bg_common + "')"});
				$('.ruleInfo').css({'background-image': "url('" + self_imgs.bg_rule + "')"});
				$('#ruleCloseBtn').find('img').attr({'src': self_imgs.close_btn});
				$('.rules').html(pageData.rules);
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
						$('#followPage').show();
						$('#followPage').find('img').attr({'src': data.cfg.qrcodeurl});
					}
				}
			},
			out : function(){
				$('#ruleBtn').off();
				$('#myPrizeBtn').off();
				$('#ruleCloseBtn').off();
				$('#startBtn').off();
				$('#indexPage').hide();
				$('#startBtn').removeClass('btn_run01');
				$('.indexTitle').removeClass('indexTitle_run');
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
			time: 0,	//游戏时间
			babyArr: [],	//存放baby图片
			init: function(){
				//游戏数据初始化
                window.clearInterval(timer1);
                window.clearInterval(timer2);
                window.clearInterval(timer3);
				this.time = 30;
				$('#imgBox').html('');
				getbaby = 0;
				this.dataImport();
				this.getBabyArr();
				$('#gamePage').show();
				for(var k=1;k<=5;k++){
					this.imgBoxOrigin(k);
				}
				this.gameStart();
			},
			dataImport: function(){
				$('#gamePage').css({'background-image': "url('" + self_imgs.bg_game + "')"});
				$('.gameCover').attr({'src': self_imgs.game_cover});
				$('#catchBtn').find('img').attr({'src': self_imgs.catch_btn});
				$('#hand').find('img').eq(0).attr({'src': self_imgs.hand_01});
				$('#hand').find('img').eq(1).attr({'src': self_imgs.hand_02});
				$('#babyNum').text('score:' + getbaby);
				$('#second').text('00:' +　this.time);
			},
			getBabyArr: function(){
				for(var key in self_imgs){
					if(key.match(/baby/) && !key.match(/active/)){
						this.babyArr.push(key);
					}
				}
			},
			checkTouch: function(){
				var me = this;
				$('#catchBtn').on(config.touch,function(){
					me.catchbaby();
				});
			},
			catchbaby: function(){
				var me = this;
				$('#hand').addClass('hand_catch');
				$('#catchBtn').off();
				//手柄在底部的状态
				setTimeout(function(){
					$('#hand').find('img').eq(1).attr({'src': self_imgs.hand_03});
					var lis = $('#imgBox').find('.img_auto');
					for(var i=0;i<lis.length;i++){
						var left = $(lis[i]).css('left');
						if(left.match(/%/)){
							left = parseInt(left);
						}else{
							left = parseInt(left) / $(document).width() * 100;
						}

						if(left >= 49 && left <= 51){
							getbaby ++;
							$('#babyNum').text('score:' + getbaby);
							$(lis[i]).removeClass('img_auto');
							$(lis[i]).removeClass('img_auto01');
							$(lis[i]).removeClass('img_auto02');
							$(lis[i]).removeClass('img_auto03');
							$(lis[i]).removeClass('img_auto04');
							$(lis[i]).removeClass('img_auto05');
							$(lis[i]).addClass('img_up');
							$(lis[i]).find('img').attr({'src':self_imgs[$(lis[i]).data('img')+'_active']});
						}
					}
				},500);
				//手柄回到顶端的状态
				setTimeout(function(){
					$('#hand').removeClass('hand_catch');
					$('#hand').find('img').eq(1).attr({'src': self_imgs.hand_02});
					$('#catchBtn').on(config.touch,function(){
						me.catchbaby();
					});
				},1000);
			},
			randomAddImg: function(){
				var me = this;
				var index = random(0,this.babyArr.length);
				var url = this.babyArr[index];
				var html = "<li class='img_auto abs' data-img='" + url + "'><img src='" + self_imgs[url] + "'/></li>";
				$('#imgBox').append(html);
			},
			imgBoxOrigin: function(i){
				var me = this;
				var index = random(0,this.babyArr.length);
				var url = this.babyArr[index];
				var html = "<li class='img_auto img_auto0" + i + " abs' data-img='" + url + "'><img src='" + self_imgs[url] + "'/></li>";
				$('#imgBox').append(html);
			},
            removeBaby: function(){
                var timer3 = window.setInterval(function(){
                    //1.img_auto到达最右边
                    var noCatch = $('#imgBox').find('.img_auto');
                    for(var i=0;i<noCatch.length;i++){
                        var left = $(noCatch[i]).css('left');
                        if(left.match(/%/)){
                            left = parseInt(left);
                        }else{
                            left = parseInt(left) / $(document).width() * 100;
                        }

                        if(left >= 109){
                            $(noCatch[i]).remove();
                        }
                    }
                    //2.img_up
                    var hasCatch = $('#imgBox').find('.img_up');
                    for(var j=0;j<hasCatch.length-1;j++){
                        $(hasCatch[j]).remove();
                    }
                },1000);
            },
			gameStart: function(){
				var me = this;
				me.checkTouch();
				me.randomAddImg();
				timer1 = window.setInterval(function(){
					me.randomAddImg();
				},2000);
				timer2 = window.setInterval(function(){
					if(me.time>0){
						if(me.time>=10){
							$('#second').text('00:' +　me.time);
						}else{
							$('#second').text('00:0' + me.time);
						}
						me.time --;
					}else{
						$('#second').text('00:00');
                        //游戏结束的状态
                        window.clearInterval(timer1);
                        window.clearInterval(timer2);
                        window.clearInterval(timer3);
                        $('#imgBox').html('');
						me.out();
                        resultPage.act.init();
					}
				},1000);
                this.removeBaby();
			},
			out: function(){
				$('#catchBtn').off();
				$('#gamePage').hide();
			}
		};

		resultPage.act = {
			init : function(){
				this.dataImport();
				$('#resultPage').show();
                if(double){
                    $('.origin2').show();
                }else{
                    $('.origin1').show();
                }
				if(getbaby >= Number(self_texts.number)){
					M.loading();
					resultPage.data.save();
				}else{
					$('#noPrise').find('.hint').text('再接再厉哟');
					$('#noPrise').find('.hint1').text('再接再厉哟');
					$('#noPrise').find('.hint2').text('let’s try again!');
					$('#noPrise').show();
				}
				this.checkTouch();
			},
			dataImport: function(){
				$('#resultPage').css({'background-image': "url('" + self_imgs.bg_common + "')"});
				$('.resultbg').attr({'src': self_imgs.result});
				$('.share').attr({'src': self_imgs.share});
				$('.numShow').text(getbaby);
				$('#againBtn').find('img').attr({'src': self_imgs.again_btn});
				$('#getBtn').find('img').attr({'src': self_imgs.get_btn});
				$('#sharePage').find('img').attr({'src': self_imgs.share});
			},
			saveCb : function(data){
				resultPage.data.getcoupon();
			},
			getcouponCb : function(data){
				M.loadingHide();
				if(data.hasget == 0){
					$('#noPrise').find('.hint').text('每天领取数量已达上限');
					$('#noPrise').find('.hint1').text('你还能再厉害一点的');
					$('#noPrise').find('.hint2').text('english');
					$('#noPrise').show();
				}else{
					$('#hasPrise').find('.hint').html('获得了一份<span>神秘礼物</span>');
					$('#hasPrise').find('.hint1').html('获得了一份<span>神秘礼物</span>');
					$('#hasPrise').find('.hint2').html('check your gift in <span>MY GIFTS</span>');
					$('#hasPrise').show();
				}
			},
			checkTouch : function(){
				var me = this;
				$('#againBtn').on(config.touch,function(){
					me.out();
					gamePage.act.init();
				});
				$('#getBtn').on(config.touch,function(){
					gotoUrl(config.htmlUrl+'myprize.html?uid='+config.uid+'&gp='+config.gp);
				});
			},
			out : function(){
				$('.againBtn').off();
				$('#getBtn').off();
				$('#gamePage').hide();
				$('#resultPage').hide();
				$('#hasPrise').hide();
				$('#noPrise').hide();
			}
		};
		
		resultPage.data = {
			save : function(){
				post('active/saveplay',{
					babyNum : getbaby,
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
