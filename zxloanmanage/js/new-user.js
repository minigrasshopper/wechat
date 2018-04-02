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
        	el: '#newUserPage',
        	data: {
				params: {	//createcustomer
					channel: localStorage.channel,
					invite_code: localStorage.jobno,	//推荐人会员号  可为空
					name: null,
					mobile: null,
					idcard: null,
					token: localStorage.token
				},
				paramsOther: {	//createorder
					channel: localStorage.channel,
					user_id : null,
					pawn_tradeid : localStorage.pawn_tradeid,
					pawn_valuation: localStorage.totalprice,
					pawn_apply_money: localStorage.apply_price,
					product_id : localStorage.product_id,
					invite_code : null, //推荐人码  可为空
					token: localStorage.token
				}
        	},
        	methods: {
        		init: function(){
        			$('#newUserPage').show();
        			M.loadingHide();
        		},
				historyHandle: function(){
					window.history.go(-1);
				},
				homeHandle: function(){
					goToNextPage('index.html');
				},
				goNewSuccess: function(){
					var me = this;
					for(var key in this.params){
						this.params[key] = $.trim(this.params[key]);
					}
					if(!this.params.name){
						M.alert('请输入姓名');
					}else if(!testMobile(this.params.mobile)){

					}else if(!isCardID(this.params.idcard)){

					}else{
						//请求后台
						M.loading();
						requstObj.createcustomer(this.params, function(data){
							console.log(data);
							me.paramsOther.user_id = data.user_id;
							me.paramsOther.invite_code = me.params.invite_code;
							//再次请求后台
							requstObj.createorder(me.paramsOther, function(data){
								M.loadingHide();
								localStorage.apply_no = data.info.apply_no;
								goToNextPage('new-success.html');
							});
						});
					}
				}
        	}
        });

		var requstObj = {
			createcustomer: function(obj, cb){
				post('loan/common/createcustomer', obj, function(data){
					cb && cb(data);
				})
			},
			createorder: function(obj, cb){
				post('loan/common/createorder', obj, function(data){
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
