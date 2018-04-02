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
        	el: '#newBuildingPage',
        	data: {
				list: null,	//列表
				index: getUrlParam().index,
				params: JSON.parse(getUrlParam().params),
				keyword: localStorage.keyword
        	},
        	methods: {
        		init: function(){
        			$('#newBuildingPage').show();
        			M.loadingHide();
        		},
				historyHandle: function(){
					window.history.go(-1);
				},
				homeHandle: function(){
					goToNextPage('index.html');
				},
				searchHandle: function(){
					var me = this;
					this.keyword = $.trim(this.keyword);
					if(!this.keyword){
						M.alert('请输入关键词');
						return false;
					}
					M.loading();
					requstObj.search({keyword: this.keyword}, function(data){
						console.log(data);
						if(!data.list.length){
							M.alert('未找到匹配信息');
						}else{
							me.list = data.list;
						}
						M.loadingHide();
					});
				},
				goNewUnit: function(projectid, project_name){
					var me = this;
					M.loading();
					this.params[this.index].projectid = projectid;
					this.params[this.index].project_name = project_name;
					requstObj.project({id: projectid}, function(data){
						console.log(data);
						me.params[me.index].property = data.info.property;
						localStorage.keyword = me.keyword;
						M.loadingHide();
						goToNextPage('new-unit.html' +　'?index=' + me.index + '&params=' + JSON.stringify(me.params));
					});
				}
        	}
        });

		var requstObj = {
			search: function(obj, cb){
				post('loan/pawn/house/search', obj, function(data){
					cb && cb(data);
				})
			},
			project: function(obj, cb){
				post('loan/pawn/house/project', obj, function(data){
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
