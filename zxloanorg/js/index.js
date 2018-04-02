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
			el: '#indexPage',
			data: {
				wxinfo: {
					nickname: '',
					headimgurl: ''
				},
				shop: null
			},
			methods: {
				init: function(){
					var me = this;
					localStorage.channel = 'org';
					requestObj.checklogin(function(data){
						console.log(data);
						if(data.error == 0){
							localStorage.token = data.token;
							requestObj.product(function(data){
								localStorage.product_name = '房抵贷';
								$.each(data.list, function(index, value){
									(value.product_name == localStorage.product_name) && (localStorage.product_id = value.product_id);
								});
								requestObj.config({token: localStorage.token}, function(data){
									console.log(data);
									me.wxinfo.nickname = data.wxinfo.nickname;
									me.wxinfo.headimgurl = data.wxinfo.headimgurl;
									me.shop = data.baseinfo.org_name + data.baseinfo.shop_name;
									localStorage.subbranchsList = JSON.stringify(data.subbranch);	//面签支行列表
									$('#indexPage').show();
									M.loadingHide();
								});
							});
						}else if(data.error == 101001){
							M.loadingHide();
							goToNextPage('login.html');
						}
					});
				},
				goLogin: function(){
					requestObj.logout(function(){
						localStorage.channel = null;
						localStorage.token = null;
						localStorage.product_name = null;
						localStorage.product_id = null;
						goToNextPage('login.html');
					});
				},
				jumpPage: function(page){
					M.loading();
					requestObj.checklogin(function(data){
						M.loadingHide();
						if(data.error == 0){
							goToNextPage(page + '.html');
						}else if(data.error == 101001){
							goToNextPage('login.html');
						}
					});
				}
			}
		});

		var requestObj = {
			checklogin: function(cb){
				post('loan/common/checklogin', {channel: localStorage.channel}, function(data){
					cb && cb(data);
				})
			},
			logout: function(cb){
				post('loan/common/logout', {
					channel: localStorage.channel,
					token: localStorage.token
				}, function(data){
					cb && cb(data);
				})
			},
			product: function(cb){
				post('loan/common/product', {}, function(data){
					cb && cb(data);
				})
			},
			config: function(obj, cb){
				post('loan/org/config', obj, function(data){
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
				cb && cb(data);
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
