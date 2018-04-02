(function(){
	require([config.configUrl],function(){
		var reqArr = ['wxshare','barcode','qrcode'];
		require(reqArr,requireCb);
	});

	function requireCb(wxshare,barcode,qrcode){
		var jq = window.jq = require('jquery').noConflict();
        var allData = '';    //页面所有数据
		var pageData = '';	//存放后台数据
		var self_imgs = '';	//后台自定义图片数据
		var myprizePage = {}; //我的奖品页面对象
        var self_texts = '';	//后台自定义文本数据
        var double = '';    //是否是双语

		myprizePage.act = {
			$dom : $('#myprizePage'),
			init : function(){
				myprizePage.data.index();
			},
			indexCb: function(data){
                allData = data;
				pageData = data.cfg;
                self_texts = data.cfg.activesetting.txts;
                self_imgs = data.cfg.activesetting.imgs;
                if(self_texts.double){
                    double = self_texts.double - 0;
                }else{
                    double = 0;
                }
				myprizePage.data.mycoupon();
			},
			dataImport: function(){
				$('#myprizePage').css({'background-image': 'url("' + self_imgs.bg_myprize + '")'});
				$('.ticket').css({'background-image': 'url("' + self_imgs.ticket + '")'});
				$('#backBtn').find('img').attr({'src': self_imgs.back_btn});
				$('#prizeCloseBtn').attr({'src': self_imgs.close_btn});
				$('#sureBtn').find('img').attr({'src': self_imgs.sure_btn});
				$('#title').text(pageData.title);
			},
			checkpsdCb: function(data){
				var err = data.error - 0;
				M.loadingHide();
				switch(err){
					case 0:
						M.alert(data.error_msg);
						window.location.reload();
						break;
					default:
						defaultError(data);
				}
			},
			checkTouch : function(){
				var me = this;
				var code = '';
				$('#backBtn').on(config.touch,function(){
					gotoUrl(config.htmlUrl+'index.html?uid='+config.uid+'&gp='+config.gp);
					me.out();
				});
				$('.use').on(config.touch,function(){
                    me.isFollow(allData);
                    if(me.isFollow(allData)){
                        M.loading(1,2);
                        var showtype = $(this).data('showtype');
                        code = $(this).data('code').toString();
                        var isnet = $(this).data('isnet');
                        var useurl = $(this).data('useurl');
                        if(isnet == 0){//线下使用
                            $('.code').text(code);
                            $('.showtype' + showtype).show();
                            $('#sureBtn').attr('data-showtype',showtype);
                            $('#sureBtn').attr('data-code',code);
                            switch(showtype){
                                case 1://1-条形码
                                    $('#barcode').html('');
                                    jq('#barcode').barcode(code, 'code128', { //条形码
                                        barWidth: 4,
                                        barHeight: 120,
                                        output: 'bmp'
                                    });
                                    break;
                                case 2://2-二维码
                                    $('#qrcode').html('');
                                    jq('#qrcode').qrcode({width: 200,height: 200,text: code});
                                    break;
                                default://3-展示券码，密码核销
                                    $('#userInput').val('');
                            }
                            $('#checkpsdPage').show();
                            $('.checkBox').addClass('checkBox_run');
                            me.checkTouch2();
                            M.loadingHide();
                        }else{//线上使用
                            gotoUrl(useurl);
                        }
                    }
				});

				//点击核销按钮
				$('#sureBtn').on(config.touch,function(){
					switch($(this).data('showtype')){
						case 0://展示券码，密码核销
							var password = $('#userInput').val();
							if(password == ''){
								M.alert('密码不能为空！');
								return;
							} else{
								M.loading();
								var params ={
									code : code,
									password : password,
									gp : config.gp
								};
								myprizePage.data.checkpsd(params);
							}
							break;
						default://条形码或二维码，刷新页面
							window.location.reload();
					}
				});
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
                        return false;
                    }
                }
                return true;
            },
			checkTouch2 : function(){
				$('#prizeCloseBtn').on(config.touch,function(){
					$('#checkpsdPage').hide();
					$('.checkBox').removeClass('checkBox_run');
				});
			},
			mycouponCb : function(data){
				$('#myprizePage').html(template('myprizeTMP',data));
                if(double){
                    $('.origin2').show();
                }else{
                    $('.origin1').show();
                }
				//template渲染模板后才可以进行DOM操作
				this.dataImport();
				this.$dom.show();
				$('.ticket').addClass('ticket_run');
				this.checkTouch();
				M.loadingHide();
			},
			out : function(){
				this.$dom.hide();
				$('#backBtn').off();
				$('#prizeCloseBtn').off();
				$('#sureBtn').off();
				$('.ticket').removeClass('ticket_run');
			}
		};

		myprizePage.data = {
			index : function(){
				post('active/index',{
					gp : config.gp
				},function(data){
					myprizePage.act.indexCb(data);
				});
			},
			mycoupon : function(){
				post('active/mycoupon',{
					gp : config.gp
				},function(data){
					myprizePage.act.mycouponCb(data);
				});
			},
			checkpsd: function(params){
				post('active/couponconsume',params,function(data){
					myprizePage.act.checkpsdCb(data);
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
			},config.apiopenid,config.apitoken);
		}

		M.loading();
		check(oAuth,function(){
			myprizePage.act.init();
		});
	}
}());
