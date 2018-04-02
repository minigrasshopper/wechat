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
					customerType: '',	//客户类型
					name: '',
					mobile: '',
					idcard: '',
					//上班族
					job: '',
					parea: '',
					yearIncome: '',
					//企业主
					business: '',
					barea: '',
					yearSales: '',
					token: localStorage.token
				},
				customerTypeList: {"P":"上班族","B":"企业主"},
				jobList: {"P0_0":"党政机关、事业单位","P0_1":"科研、教育、医疗","P0_2":"银行、保险、证券等金融机构","P0_3":"国有企业","P0_4":"上市公司","P0_5":"其他"},
				pareaList: {"P1_0":"武汉市|武昌","P1_1":"武汉市|汉口","P1_2":"武汉市|汉阳","P1_3":"武汉市|其他"},
				yearIncomeList: {"P2_0":"5万以下","P2_1":"5-10万","P2_2":"10-20万","P2_3":"20-50万","P2_4":"50万以上"},
				businessList: {"B0_0":"家居建材","B0_1":"餐饮食品","B0_2":"电子电器","B0_3":"日用百货","B0_4":"科技产品","B0_5":"仓储物流","B0_6":"服装鞋帽","B0_7":"居民服务","B0_8":"珠宝古玩","B0_9":"其他"},
        		bareaList: {"B1_0":"武汉市|武昌","B1_1":"武汉市|汉口","B1_2":"武汉市|汉阳","B1_3":"武汉市|其他"},
				yearSalesList: {"B2_0":"小于500万","B2_1":"500-1000万","B2_2":"1000-1500万","B2_3":"1500万-2000万","B2_4":"2000万以上"}
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
				goNew: function(){
					var me = this;
					for(var key in this.params){
						this.params[key] = $.trim(this.params[key]);
					}
					var canJudge = true;
					for(var key in this.params){
						if(this.params.customerType == 'P'){
							//上班族
							if(!this.params[key] && key != 'business' && key != 'barea' && key != 'yearSales'){
								M.alert('信息填写不完全');
								canJudge = false;
								return false;
							}
						}else{
							if(!this.params[key] && key != 'job' && key != 'parea' && key != 'yearIncome'){
								M.alert('信息填写不完全');
								canJudge = false;
								return false;
							}
						}
					}
					if(!canJudge){
						return false;
					}
					if(!testMobile(this.params.mobile)){

					}else if(!isCardID(this.params.idcard)){

					}else{
						//请求后台
						M.loading();
						requstObj.createcustomer(this.params, function(data){
							console.log(data);
							localStorage.product_properties = JSON.stringify(me.params);
							localStorage.user_id = data.user_id;
							goToNextPage('new.html');
						});
					}
				},
				getValueByKey: function(obj, key){
					var value = null;
					for(var k in obj){
						if(k == key){
							value = obj[k];
						}
					}
					return value;
				}
        	}
        });

		var requstObj = {
			createcustomer: function(obj, cb){
				post('loan/common/createcustomer', obj, function(data){
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
