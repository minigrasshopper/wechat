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
        	el: '#managePage',
        	data: {
				currList: null,		//当前list
				totalNum: 0,	//全部工单数量
				params: {
					channel: localStorage.channel,
					product_id: localStorage.product_id,
					token: localStorage.token,
					status: 0,	//可不传
					//搜索相关可不传
					searchtype: '',	//搜索方式  name-客户姓名，mobile-客户手机号，address-抵押物地址
					keyword: null
				},
				statusList: []	//页面渲染使用
        	},
        	methods: {
        		init: function(){
					//先获取所有list
					var me = this;
					requestObj.orderlist(this.params, function(data){
						me.currList = data.list;
						requestObj.config({token: localStorage.token}, function(data){
							console.log(data.data);
							me.statusList = data.data;
							$('#managePage').show();
							$.each(me.statusList, function(key, item){
								me.totalNum += Number(item.num);
							});
							M.loadingHide();
						});
					});
        		},
				historyHandle: function(){
					window.history.go(-1);
				},
				homeHandle: function(){
					goToNextPage('index.html');
				},
				searchHandle: function(){
					var me = this;
					for(var key in this.params){
						this.params[key] = $.trim(this.params[key]);
					}
					if(!this.params.searchtype){
						M.alert('请选择搜索类型');
					}else if(!this.params.keyword){
						M.alert('请输入关键词');
					}else{
						//请求后台
						M.loading();
						requestObj.orderlist(this.params, function(data){
							me.currList = data.list;
							M.loadingHide();
						});
					}
				},
        		selectState: function(event, status){
					var me = this;
					M.loading();
        			var target = event.currentTarget;
        			$(target).siblings('.active').removeClass('active');
        			$(target).addClass('active');
					this.params.keyword = null;
					this.params.status = status;
					requestObj.orderlist(this.params, function(data){
						console.log(data.list);
						me.currList = data.list;
						M.loadingHide();
						//新增-未处理归纳在处理中
						if(status == 3){
							me.params.status = 1;
							requestObj.orderlist(me.params, function(data){
								$.each(data.list, function(index, value){
									me.currList.push(value);
								});
								M.loadingHide();
							});
						}
					});
        		},
				goManageDetail: function(apply_no){
					localStorage.apply_no = apply_no;
					goToNextPage('manage-detail.html');
				}
        	}
        });

		var requestObj = {
			orderlist: function(obj, cb){
				post('loan/common/orderlist', obj, function(data){
					console.log(data);
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
