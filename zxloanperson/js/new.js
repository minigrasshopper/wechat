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
        	el: '#newPage',
        	data: {
				params: getUrlParam().params?JSON.parse(getUrlParam().params):[
					{
						owner: null,	//房屋所有人--与请求无关
						property: null,	//房屋类型--与请求无关

						projectid: null,	//小区id
						buildingid: null,	//楼层id
						unitid: null,	//单元号id
						roomid: null,	//房间id
						area: null,	//房屋面积
						toward: null,	//朝向
						totalfloor: null, //总楼层
						currentfloor: null, //当前楼层

						areaedit: 1,	//房屋是否能编辑-与请求无关
						project_name: null,	//小区名称-与请求无关
						building_name: null,//楼层名称-与请求无关
						room_name: null	//房间名称-与请求无关
					}
				]
        	},
        	methods: {
				init: function(){
					$('#newPage').show();
					M.loadingHide();
				},
				historyHandle: function(){
					window.history.go(-1);
				},
				homeHandle: function(){
					goToNextPage('index.html');
				},
				goNewBuilding: function(index){
					goToNextPage('new-building.html' +　'?index=' + index + '&params=' + JSON.stringify(this.params));
				},
				goNewValue: function(){
					var canSubmit = true;
					for(var i=0;i<this.params.length;i++){
						for(var key in this.params[i]){
							if(!this.params[i][key] && key != 'areaedit'){
								M.alert('信息填写不完全');
								canSubmit = false;
								return false;
							}
							if(key == 'area'){
								this.params[i][key] = Number(this.params[i][key])>0?Number(this.params[i][key]):null;
								if(!this.params[i][key]){
									this.params.splice(i,1,this.params[i]);
									M.alert('请填写房屋面积');
									canSubmit = false;
									return false;
								}
							}
						}
					}
					if(canSubmit){
						//请求后台开始评估
						M.loading();
						requestObj.execute({
							channel: 'customer',
							//token: localStorage.token,	//客户端不需要token
							list: this.params
						}, function(data){
							console.log(data);
							M.loadingHide();
							localStorage.pawn_tradeid = data.pawn_tradeid;
							localStorage.totalprice = data.totalprice;
							localStorage.apply_price = data.apply_price;
							goToNextPage('new-value.html' + '?info=' + JSON.stringify(data));
						});
					}
				},
				removeHandle: function(index){
					this.params.splice(index, 1);
				},
				addHandle: function(){
					this.params.push({
						owner: null,	//房屋所有人--与请求无关
						property: '住宅/商用',	//房屋类型--与请求无关

						projectid: null,	//小区id
						buildingid: null,	//楼层id
						unitid: null,	//单元号id
						roomid: null,	//房间id
						area: null,	//房屋面积
						toward: null,	//朝向
						totalfloor: null, //总楼层
						currentfloor: null, //当前楼层

						areaedit: 1,	//房屋是否能编辑-与请求无关
						project_name: null,	//小区名称-与请求无关
						building_name: null,//楼层名称-与请求无关
						room_name: null	//房间名称-与请求无关
					});
				}
        	}
        });

		var requestObj = {
			execute: function(obj, cb){
				post('loan/pawn/house/execute', obj, function(data){
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
