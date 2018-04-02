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
        	el: '#calcPage',
        	data: {
				standardrates: null,	//基准利率配置
				methods: null,	//还款方式配置
				yearMax: 30,
				monthMax: 11,
				params: {
					money: null,	//贷款金额（万元）
					year: 0,		//贷款年
					month: 0,	//贷款月
					term: null,		//期限（月）
					rate_origin: null,	//基准利率
					rate_float: null,	//浮动利率
					rate: null,		//实际利率（5.7）
					method: null	//还款方式
				},
				moneyObj: null
        	},
        	methods: {
        		init: function(){
					var me = this;
					requstObj.index({}, function(data){
						console.log(data);
						me.standardrates = data.standardrates;
						me.methods = data.methods;
						$('#calcPage').show();
						M.loadingHide();
					});
        		},
				historyHandle: function(){
					window.history.go(-1);
				},
				homeHandle: function(){
					goToNextPage('index.html');
				},
				showByValue: function(keyword, obj){
					var str = null;
					if(obj){
						$.each(obj, function(key, value){
							if(key == keyword){
								if(!value.desc){
									str = value.name;
								}else{
									str = value.name + '(' + value.desc + ')';
								}
							}
						});
					}
					return str;
				},
				termChangeHandle: function(){
					var me = this;
					this.params.year = Number(this.params.year);
					this.params.month = Number(this.params.month);
					this.params.rate_float = this.params.rate_float==null?null:Number(this.params.rate_float);
					if(this.params.year == 30){
						this.params.month = 0;
						this.monthMax = 0;
					}else{
						this.monthMax = 11;
					}
					this.params.term = this.params.year * 12 + this.params.month;
					var hasValue = false;
					$.each(this.standardrates, function(key, item){
						if(me.params.term >= item.start && me.params.term <= item.end){
							me.params.rate_origin = item.name;
							hasValue = true;
							me.params.rate = parseFloat(me.params.rate_origin) * (1 + Number(me.params.rate_float) / 100).toFixed(2) + '%';
							return false;
						}
					});
					if(!hasValue){
						this.params.rate_origin = null;
						this.params.rate = null;
					}
				},
				FloatinputHandle: function(){
					if(this.params.rate_origin){
						this.params.rate_float = this.params.rate_float==null?null:Number(this.params.rate_float);
						this.params.rate = (parseFloat(this.params.rate_origin) * (1 + Number(this.params.rate_float) / 100)).toFixed(2) + '%';
					}
				},
				calcHandle: function(){
					var me = this;
					this.params.money = Number(this.params.money)>0?Number(this.params.money):null;
					this.params.year = Number(this.params.year);
					this.params.month = Number(this.params.month);
					this.params.rate_float = this.params.rate_float==null?null:Number(this.params.rate_float);
					this.params.term = this.params.year * 12 + this.params.month;
					if(!this.params.money){
						M.alert('请填写贷款金额');
					}else if(!this.params.term){
						M.alert('请选择贷款期限');
					}else if(this.params.rate_float < -100 || this.params.rate_float > 100){
						M.alert('浮动利率不能超出范围');
					}else if(!this.params.method){
						M.alert('请填写还款方式');
					}else{
						console.log(this.params);
						this.params.rate = parseFloat(this.params.rate_origin) * (1 + Number(this.params.rate_float) / 100).toFixed(2) + '%';
						//请求后台
						requstObj.execute(this.params, function(data){
							console.log(data);
							localStorage.calcData = JSON.stringify(data);
							me.moneyObj = data;
							me.canvasRender();
						});
					}
				},
				canvasRender: function(){
					var canvas = document.getElementById("canvas");
					var context = canvas.getContext("2d");
					var total = 360;
					var curr = (numConvert(this.moneyObj.xi) / numConvert(this.moneyObj.ben)) * 360 / 10000;
					var width = (document.documentElement.clientWidth || document.body.clientWidth) *　0.36;
					context.clearRect(0, 0, width, width);
					canvas.width = width;
					canvas.height = width;
					context.beginPath();
					context.sector(width *　0.5,　width *　0.5,　width *　0.5,　0,　Math.PI * 2);
					context.fillStyle = '#ff4c45';
					context.fill();
					context.closePath();
					context.beginPath();
					context.sector(width *　0.5,　width *　0.5,　width *　0.5,　0,　Math.PI * 2 * (curr / total));
					context.fillStyle = '#ff9865';
					context.fill();
					context.closePath();
				},
				goCalcDetail: function(){
					goToNextPage('calc-detail.html');
				}
        	}
        });

		var requstObj = {
			index: function(obj, cb){
				post('loan/calculate/fdd/index', obj, function(data){
					cb && cb(data);
				});
			},
			execute: function(obj, cb){
				post('loan/calculate/fdd/execute', obj, function(data){
					cb && cb(data);
				});
			}
		};

		//扇形
		CanvasRenderingContext2D.prototype.sector = function (x, y, radius, sDeg, eDeg) {
			// 初始保存
			this.save();
			// 位移到目标点
			this.translate(x, y);
			this.beginPath();
			// 画出圆弧
			this.arc(0,0,radius,sDeg, eDeg);
			// 再次保存以备旋转
			this.save();
			// 旋转至起始角度
			this.rotate(eDeg);
			// 移动到终点，准备连接终点与圆心
			this.moveTo(radius,0);
			// 连接到圆心
			this.lineTo(0,0);
			// 还原
			this.restore();
			// 旋转至起点角度
			this.rotate(sDeg);
			// 从圆心连接到起点
			this.lineTo(radius,0);
			this.closePath();
			// 还原到最初保存的状态
			this.restore();
			return this;
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
