(function(){
	require([config.configUrl],function(){
		var reqArr = ['wxshare'];
		require(reqArr, requireCb);
	});
	
	function requireCb(wxshare){
		//防止输入时，输入框弹出导致页面样式混乱
		var view_h = document.documentElement.clientHeight || document.body.clientHeight;
		$("body").height(view_h);
		var text = null;

        var viewport = new Vue({
        	el: '#newValuePage',
        	data: {
				totalprice: 0,
				apply_price: 0,
				curr: 0
        	},
        	methods: {
        		init: function(){
					this.totalprice = localStorage.totalprice;
					this.apply_price = localStorage.apply_price;
        			$('#newValuePage').show();
        			M.loadingHide();
					this.valueRun();
        		},
				historyHandle: function(){
					window.history.go(-1);
				},
				homeHandle: function(){
					goToNextPage('index.html');
				},
				goNewUser: function(){
					goToNextPage('new-user.html');
				},
				goCalc: function(){
					goToNextPage('calc.html');
				},
				valueRun: function(){
					var me = this;
					var total = this.totalprice.replace(/,|，/g, '');
					var last = Number(total.slice(total.length-1));
					var other = Number(total.slice(0, total.length-1));
					var max = Number(other + '0');
					var timer = setInterval(function(){
						if(me.curr == max){
							me.curr += last;
							clearInterval(timer);
						}
						if(me.curr < max){
							me.curr += 10;
						}
					}, 30);
				}
        	}
        });
		
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
