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
			},
			methods: {
				init: function(){
					var me = this;
					requstObj.product(function(data){
						localStorage.product_name = '房抵贷';
						$.each(data.list, function(index, value){
							(value.product_name == localStorage.product_name) && (localStorage.product_id = value.product_id);
						});
						$('#indexPage').show();
						M.loadingHide();
					});
				},
				goNew: function(){
					goToNextPage('new.html');
				},
				goQuery: function(){
					goToNextPage('query.html'); 	//暂时不要
				}
			}
		});

		var requstObj = {
			product: function(cb){
				post('loan/common/product', {}, function(data){
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
