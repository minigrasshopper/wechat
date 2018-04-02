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
			el: '#calcDetailPage',
			data: {
				moneyObj: JSON.parse(localStorage.calcData)
			},
			methods: {
				init: function(){
					$('#calcDetailPage').show();
					M.loadingHide();
				},
				historyHandle: function(){
					window.history.go(-1);
				},
				homeHandle: function(){
					goToNextPage('index.html');
				},
				yearShow: function(num){
					return (num-1) / 12 + 1;
				},
				goCalc: function(){
					goToNextPage('calc.html');
				}
			}
		});

		var requstObj = {
			execute: function(obj, cb){
				post('loan/calculate/fdd/execute', obj, function(data){
					cb && cb(data);
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
		check(oAuth, function(){
			viewport.init();
		});
	}
}());
