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
        	el: '#newSelectPage',
        	data: {
				params: {
					channel: localStorage.channel,
					user_id: localStorage.user_id,
					pawn_tradeid: localStorage.pawn_tradeid,
					pawn_valuation: localStorage.totalprice,
					pawn_apply_money: localStorage.apply_price,
					product_id: localStorage.product_id,
					invite_code: localStorage.invite_code, //推荐人码  可为空
					token: localStorage.token,
					subbranch_id: null, //合作支行ID
					manager_id: null, //支行客户经理ID
					product_properties: []
				},
				subbranchList: JSON.parse(localStorage.subbranchsList),
				managerList: []	//记录当前客户经理列表
        	},
        	methods: {
        		init: function(){
					var me = this;
        			$('#newSelectPage').show();
        			M.loadingHide();
					//product_properties初始化
					var obj = JSON.parse(localStorage.product_properties);
					$.each(obj, function(key, value){
						me.params.product_properties.push({
							property_alias: key,
							property_value: value
						});
					});
        		},
				historyHandle: function(){
					window.history.go(-1);
				},
				homeHandle: function(){
					goToNextPage('index.html');
				},
				goNewSuccess: function(){
					//请求后台
					if(!this.params.subbranch_id){
						M.alert('请选择办理网点');
						return false;
					}else if(!this.params.manager_id){
						M.alert('请选择客户经理');
						return false;
					}
					M.loading();
					requstObj.createorder(this.params, function(data){
						M.loadingHide();
						localStorage.apply_no = data.info.apply_no;
						goToNextPage('new-success.html');
					});
				},
				getBankById: function(id){
					//根据支行id获得支行名称
					var bank = null;
					$.each(this.subbranchList, function(index, item){
						if(id == item.subbranch_id){
							bank = item.subbranch_name;
							return false;
						}
					});
					this.getManagerListById(id);
					return bank;
				},
				getManagerListById: function(id){
					var me = this;
					//根据支行id获得客户经理列表
					$.each(this.subbranchList, function(index, item){
						if(id == item.subbranch_id){
							me.managerList = item.managers;
							return false;
						}
					});
				},
				getManagerById: function(id){
					//根据支行id获得支行名称
					var manager = null;
					$.each(this.managerList, function(index, item){
						if(id == item.manager_id){
							manager = item.manager_name;
							return false;
						}
					});
					return manager;
				}
        	}
        });

		var requstObj = {
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
