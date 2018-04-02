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
			el: '#loginPage',
			data: {
				params: {
					channel: 'org',
					account: null,
					password: null
				}
			},
			methods: {
				init: function(){
					$('#loginPage').show();
					M.loadingHide();
				},
				loginHandle: function(){
					for(var key in this.params){
						this.params[key] = $.trim(this.params[key]);
					}
					if(!this.params.account){
						M.alert('请输入账号');
					}else if(!this.params.password){
						M.alert('请输入密码');
					}else{
						M.loading();
						//请求后台，成功后进入index页面
						requstObj.login(this.params, function(data){
							console.log(data);
							localStorage.token = data.token;
							M.loadingHide();
							goToNextPage('index.html');
						});
					}
				}
			}
		});

		var requstObj = {
			login: function(obj, cb){
				post('loan/common/login', obj, function(data){
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
