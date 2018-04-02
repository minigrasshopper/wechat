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
					apply_no: localStorage.apply_no,
					operate: '',	//预约面签、面签
					token: localStorage.token,
					//预约
					appointStatus: '',	//1-预约成功，2-拒绝
					datetime: '',	//day+hour1+hour2拼接
					day: '',
					hour1: '',
					hour2: '',
					subbranch_name: '',
					appointReason: '',	//拒绝理由
					//面签
					checkStatus: '',	//1-面签成功，2-拒绝
					checkReason: ''	//拒绝理由
				},
				pageData: null,
				hour1Max: 24,
				hour2Max: 24,
				issueActive: 1	//是否展示active问题
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
						console.log(me.pageData.problems);
					});
        		},
				historyHandle: function(){
					window.history.go(-1);
				},
				homeHandle: function(){
					goToNextPage('index.html');
				},
				toggleIssue: function(type){
					switch (type){
						case 0:
							this.issueActive = 0;
							break;
						case 1:
							this.issueActive = 1;
							break;
					}
				},
				appointShow: function(appointStatus){
					switch (appointStatus){
						case 1:
							$('.appoint1Box').show();
							break;
						case 2:
							$('.appoint2Box').show();
							break;
					}
				},
				examineHandle: function(){
					$('.examineBox').show();
				},
				loanHandle: function(){
					$('.loanBox').show();
				},
				checkShow: function(){
					$('.check2Box').show();
				},
				appointHandle: function(appointStatus){
					var me = this;
					this.operateInfo.operate = '预约面签';
					this.operateInfo.appointStatus = appointStatus;
					for(var key in this.operateInfo){
						this.operateInfo[key] = $.trim(this.operateInfo[key]);
					}
					//1-预约成功，2-拒绝
					if(appointStatus == 1){
						//请求后台，成功后再次请求orderdetail接口,改变pageData，重新渲染
						var now = new Date().getTime();
						this.operateInfo.hour1 = Number(this.operateInfo.hour1)?Number(this.operateInfo.hour1):'';
						this.operateInfo.hour2 = Number(this.operateInfo.hour2)?Number(this.operateInfo.hour2):'';
						var date = new Date(this.operateInfo.day + ' ' + this.operateInfo.hour2 + ':' + '00').getTime();
						if(!this.operateInfo.day || !this.operateInfo.hour1 || !this.operateInfo.hour2){
							M.alert('请编辑预约面签时间');
							return false;
						}else if(this.operateInfo.hour1 > this.operateInfo.hour2 || date < now){
							M.alert('预约面签时间不合理');
							return false;
						}else if(!this.operateInfo.subbranch_name){
							M.alert('请填写预约面签地点');
							return false;
						}
						this.operateInfo.datetime = this.operateInfo.day + ' ' + this.operateInfo.hour1 + '时-' + this.operateInfo.hour2 + '时';
						M.loading();
					}else{
						if(!this.operateInfo.appointReason){
							M.alert('请填写拒绝理由');
							return false;
						}
						M.loading();
					}
					//请求后台，成功后再次请求orderdetail接口,改变pageData，重新渲染
					requstObj.operate(this.operateInfo, function(data){
						M.loadingHide();
						M.confirm('提示', '提交成功', function(){
							$('.M-pop').hide();
							$('.m-pop').hide();
							//重新请求，渲染
							M.loading();
							requstObj.orderdetail(me.params, function(data){
								M.loadingHide();
								console.log(data);
								me.pageData = data.order;
							});
						});
					});
				},
				checkHandle: function(checkStatus){
					var me = this;
					this.operateInfo.operate = '面签';
					this.operateInfo.checkStatus = checkStatus;
					for(var key in this.operateInfo){
						this.operateInfo[key] = $.trim(this.operateInfo[key]);
					}
					if(checkStatus == 1){
						M.loading();
					}else{
						if(!this.operateInfo.checkReason){
							M.alert('请填写拒绝理由');
							return false;
						}
						M.loading();
					}
					//请求后台，成功后再次请求orderdetail接口,改变pageData，重新渲染
					requstObj.operate(this.operateInfo, function(data){
						M.loadingHide();
						M.confirm('提示', '提交成功', function(){
							$('.M-pop').hide();
							$('.m-pop').hide();
							//重新请求，渲染
							M.loading();
							requstObj.orderdetail(me.params, function(data){
								M.loadingHide();
								console.log(data);
								me.pageData = data.order;
							});
						});
					});
				},
				closeHandle: function(){
					$('.m-pop').hide();
				},
				goManageWorkflow: function(){
					//跳转页面
					localStorage.workflow = JSON.stringify(this.pageData.workflow);
					goToNextPage('manage-workflow.html');
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
