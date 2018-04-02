(function(){
	require([config.configUrl],function(){
		var reqArr = ['wxshare'];
		require(reqArr, requireCb);
	});

	function requireCb(wxshare){
		//防止输入时，输入框弹出导致页面样式混乱
		var view_h = document.documentElement.clientHeight || document.body.clientHeight;
		$("body").height(view_h);

		var viewport = new Vue({
			el: '#newSuccessPage',
			data: {
				params: {
					channel: "customer" ,
					//token: localStorage.token,	//用户端不需要
					apply_no: localStorage.apply_no
				},
				pageData: null
			},
			methods: {
				init: function(){
					var me = this;
					requstObj.orderdetail(this.params, function(data){
						console.log(data);
						me.pageData = data;
						$('#newSuccessPage').show();
						M.loadingHide();
					});
				},
				historyHandle: function(){
					window.history.go(-1);
				},
				homeHandle: function(){
					goToNextPage('index.html');
				},
				goNewIndex: function(){
					goToNextPage('index.html');
				}
			}
		});

		var requstObj = {
			orderdetail: function(obj, cb){
				post('loan/common/orderdetail', obj, function(data){
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
