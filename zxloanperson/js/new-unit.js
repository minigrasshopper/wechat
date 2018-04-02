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
			el: '#newUnitPage',
			data: {
				project_name: null,	//当前小区
				buildingList: null,
				roomList: null,
				index: getUrlParam().index,
				params: JSON.parse(getUrlParam().params),
				projectid: null
			},
			methods: {
				init: function(){
					var me = this;
					$('#newUnitPage').show();
					this.project_name = this.params[this.index].project_name;
					this.projectid = this.params[this.index].projectid;
					requstObj.buildings({id: this.projectid}, function(data){
						console.log(data);
						me.buildingList = data.list;
						M.loadingHide();
					});
				},
				historyHandle: function(){
					window.history.go(-1);
				},
				homeHandle: function(){
					goToNextPage('index.html');
				},
				detailHandle: function(event, buildingid, unitid){
					var me = this;
					var target = event.currentTarget;
					$(target).parents('li').siblings('li').find('ul').addClass('hide');
					if($(target).siblings('ul').hasClass('hide')){
						//请求后台渲染数据，然后再显示
						M.loading();
						requstObj.rooms({
							projectid: this.projectid,
							buildingid: buildingid,
							unitid: unitid
						}, function(data){
							console.log(data);
							me.roomList = data.list;
							M.loadingHide();
						});
						$(target).siblings('ul').removeClass('hide');
					}else{
						$(target).siblings('ul').addClass('hide');
					}
				},
				goNew: function(buildingid, unitid, roomid, building_name, room_name){
					var me = this;
					M.loading();
					this.params[this.index].buildingid = buildingid;
					this.params[this.index].unitid = unitid;
					this.params[this.index].roomid = roomid;
					this.params[this.index].building_name = building_name;
					this.params[this.index].room_name = room_name;
					//请求后台，获取朝向、楼层等评估信息
					requstObj.roominfo({
						projectid: this.params[this.index].projectid,
						roomid: roomid
					},function(data){
						console.log(data);
						if(data.error == 0){
							if(data.info.area){
								me.params[me.index].areaedit = 0;
							}else{
								me.params[me.index].areaedit = 1;
							}
							me.params[me.index].area = data.info.area;
							me.params[me.index].toward = data.info.toward;
							me.params[me.index].totalfloor = data.info.totalfloor;
							me.params[me.index].currentfloor = data.info.currentfloor;
							M.loadingHide();
							goToNextPage('new.html' + '?params=' + JSON.stringify(me.params));
						}
					});
				}
			}
		});

		var requstObj = {
			buildings: function(obj, cb){
				post('loan/pawn/house/buildings', obj, function(data){
					cb && cb(data);
				})
			},
			rooms: function(obj, cb){
				post('loan/pawn/house/rooms', obj, function(data){
					cb && cb(data);
				})
			},
			roominfo: function(obj, cb){
				post('loan/pawn/house/roominfo', obj, function(data){
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
