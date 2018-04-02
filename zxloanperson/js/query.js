(function(){
	require([config.configUrl],function(){
		var reqArr = ['wxshare','swiper'];
		require(reqArr, requireCb);
	});
	
	function requireCb(wxshare,Swiper){
		//防止输入时，输入框弹出导致页面样式混乱
		var view_h = document.documentElement.clientHeight || document.body.clientHeight;
		$("body").height(view_h);

		var viewport = new Vue({
			el: '#queryPage',
			data: {
				canSend: true,
                loan_qrcode: '',	//二维码展示
				params: {
					//channel: 'customer',
					mobile: '',
					idcard: '',
					verifycode: null
					//token: localStorage.token  //用户端不需要
				}
			},
			methods: {
				init: function(){
					$('#queryPage').show();
					M.loadingHide();
				},
				historyHandle: function(){
					window.history.go(-1);
				},
				homeHandle: function(){
					goToNextPage('index.html');
				},
				getVerify: function(event){
					var me = this;
					var target = event.currentTarget;
					$.each(this.params, function(key, value){
						me.params[key] = $.trim(me.params[key]);
					});

					if(!this.canSend){
						return false;
					}
					if(!testMobile(this.params.mobile)){

					}else if(!isCardID(this.params.idcard)){

					}else{
						M.loading();
						//请求后台发送验证码
						requstObj.verifycode(this.params, function(data){
							console.log(data);
							if(data.isfollow == 0){
								me.loan_qrcode = data.loan_qrcode;
							}else{
                                me.loan_qrcode = '';
							}
							M.loadingHide();
							var time = 60;
							var timer = null;
							me.canSend = false;
							$(target).addClass('active');
							$(target).text(time + 's后重新获取');
							timer = setInterval(function(){
								if(time > 0){
									if(time >= 10){
										$(target).text(time + 's后重新获取');
									}else{
										$(target).text('0' + time + 's后重新获取');
									}
									--time;
								}else{
									clearInterval(timer);
									$(target).text('发送验证码');
									me.canSend = true;
									$(target).removeClass('active');
								}
							}, 1000);
						});
					}
				},
				goQueryList: function(){
					//请求后台，将数据传到detail页面
					var me = this;
					$.each(this.params, function(key, value){
						me.params[key] = $.trim(me.params[key]);
					});
					if(!testMobile(this.params.mobile)){

					}else if(!isCardID(this.params.idcard)){

					}else if(!this.params.verifycode){
						M.alert('请输入验证码');
					}else{
						requstObj.search(this.params, function(data){
							localStorage.list = JSON.stringify(data.list);
							goToNextPage('query-list.html');
						});
					}
				}
			}
		});

		var requstObj = {
			verifycode: function(obj, cb){
				post('loan/customer/verifycode', obj, function(data){	//单独验证码接口
					cb && cb(data);
				})
			},
			search: function(obj, cb){
				post('loan/customer/search', obj, function(data){	//单独列表接口
					cb && cb(data);
				})
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
		check(oAuth, function(){
			viewport.init();
		});
	}
}());
