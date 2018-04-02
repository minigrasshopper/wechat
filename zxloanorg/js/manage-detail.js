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
        	el: '#manageDetailPage',
        	data: {
				product_name: localStorage.product_name,
				subbranchsList: JSON.parse(localStorage.subbranchsList),
				params: {
					channel: localStorage.channel,
					token: localStorage.token,
					apply_no: localStorage.apply_no
				},
				operateInfo: {
					day: null,
					hour: null,
					minite: null,
					subbranch_name: null
				},
				pageData: null
        	},
			updated: function(){
				$('#tel').attr('href', 'tel:' + this.pageData.customer.mobile);
			},
        	methods: {
        		init: function(){
					var me = this;
					requstObj.orderdetail(this.params, function(data){
						console.log(data);
						me.pageData = data.order;
						$('#manageDetailPage').show();
						M.loadingHide();
					});
        		},
				historyHandle: function(){
					window.history.go(-1);
				},
				homeHandle: function(){
					goToNextPage('index.html');
				},
				orderHandle: function(){
					$('.orderBox').show();
				},
				sureHandle: function(){
					var me = this;
					//请求后台，成功后再次请求orderdetail接口,改变pageData，重新渲染
					for(var key in this.operateInfo){
						this.operateInfo[key] = $.trim(this.operateInfo[key]);
					}

					if(!this.operateInfo.day || !this.operateInfo.hour || !this.operateInfo.minite){
						M.alert('请选择面签时间');
					}else if(!this.operateInfo.subbranch_name){
						M.alert('请选择面签机构');
					}else{
						var date = new Date(this.operateInfo.day + ' ' + this.operateInfo.hour + ':' + this.operateInfo.minite).getTime();
						var now = new Date().getTime();
						if(date < now){
							M.alert('预约时间不合理');
							return false;
						}
						M.loading();
						requstObj.operate({
							apply_no: localStorage.apply_no,
							operate: "预约面签",
							token: localStorage.token,
							datetime: this.operateInfo.day + ' ' + this.operateInfo.hour + ':' + this.operateInfo.minite,
							subbranch_name: this.operateInfo.subbranch_name
						}, function(data){
							M.loadingHide();
							M.confirm('提示', '面签成功', function(){
								$('.orderBox').hide();
								$('.M-pop').hide();
								//重新请求，渲染
								M.loading();
								requstObj.orderdetail(me.params, function(data){
									M.loadingHide();
									console.log(data);
									me.pageData = data.order;
									M.loadingHide();
								});
							});
						});
					}
				},
				closeHandle: function(event){
					var target = event.target || event.srcElement;
					if($(target).hasClass('m-pop')){
						$(target).hide();
					}
				},
				goManageWorkflow: function(){
					//跳转页面
					localStorage.workflow = JSON.stringify(this.pageData.workflow);
					goToNextPage('manage-workflow.html');
				},
				timeShow: function(value){
					return Number(value) < 10 ?('0' +　value) : value;
				}
        	}
        });

		var requstObj = {
			orderdetail: function(obj, cb){
				post('loan/common/orderdetail', obj, function(data){
					cb && cb(data);
				})
			},
			operate: function(obj, cb){
				post('loan/manager/operate', obj, function(data){
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
