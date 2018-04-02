(function(){
	require([config.configUrl],function(){
		var reqArr = ['wxshare','swiper'];
		require(reqArr,requireCb);
	});
	
	function requireCb(wxshare){
		var indexPage = {}; //首页对象
        var shareEnter = {};    //分享页面进入处理
        var isDecorate = false; //是否选择了装饰按钮
        var isShare = getUrlParam().info == undefined ? false : true;
        var info = {
            tempName: null,      //onePage
            musicId: null,       //1
            decorateName: null,  //decorate_flower
            text: null             //文本
        };

        //music控制开始
        window.oAudio_bg = document.getElementById('audio_bg');	//背景音乐
        var musicIcoArr = ['images/music_on.png','images/music_off.png'];
        $('#music').attr('src',musicIcoArr[0]);
        $('#music').on(config.touch,function(){
            if($(this).attr('src') == musicIcoArr[0]){
                //点击后停止
                $('#music').attr('src',musicIcoArr[1]);
                $('#music').removeClass('music_on');
                oAudio_bg.pause();
            }else{
                //点击后播放
                $('#music').attr('src',musicIcoArr[0]);
                $('#music').addClass('music_on');
                oAudio_bg.play();
            }
        });
        //music控制结束

        shareEnter.act = {
            data: null,
            init: function(){
                this.data = JSON.parse(decodeURI(getUrlParam().info));
                this.dataImport();
                share(config.shareInfo);
                $('#music').show();
                M.loadingHide();
            },
            dataImport: function(){
                var me = this;
                var tempName = me.data.tempName;
                var musicId = me.data.musicId;
                var decorateName = me.data.decorateName;
                var text = me.data.text;
                $('.textBox').find('textarea').hide();
                $('.share').hide();
                $('.made').show();
                $('#audio_bg').attr('src','resource/music_' + musicId + '.mp3');
                if(typeof WeixinJSBridge == "object" && typeof WeixinJSBridge.invoke == "function") {
                    WeixinJSBridge.invoke('getNetworkType', {}, function (res) {
                        oAudio_bg.play();
                    });
                }else{
                    oAudio_bg.play();
                }
                createsnow(decorateName);
                //渲染文本
                $('#' + tempName).find('.textBox').find('pre').text(text).show();
                $('#' + tempName).show();
                this.checkTouch();
            },
            checkTouch: function(){
                $('.made').on(config.touch,function(){
                    gotoUrl(config.htmlUrl + 'index.html');
                });
            }
        };

		//首页
		indexPage.act = {
            mySwiper_temp: null, //swiper_temp盒子
            mySwiper_decorate: null, //swiper_decorate盒子
            startScroll: null,
			init: function(){
                var me = this;
                M.imgpreload(imgs,function(){
                    me.wxshare();
                    $('#indexPage').show();
                    $('#music').show();
                    me.checkTouch();
                    M.loadingHide();
                });
                if(typeof WeixinJSBridge == "object" && typeof WeixinJSBridge.invoke == "function") {
                    WeixinJSBridge.invoke('getNetworkType', {}, function (res) {
                        oAudio_bg.play();
                    });
                }else{
                    oAudio_bg.play();
                }
                info.musicId = 1;
			},
            wxshare: function(){
                if(!info.tempName){
                    share(config.shareInfo);
                }else{
                    config.shareInfo.link = config.htmlUrl + 'index.html?&info=' + encodeURI(JSON.stringify(info));
                    share(config.shareInfo);
                }
            },
            getText: function(tempName){
                info.text = $('#' + tempName).find('.textBox').find('textarea').val();
            },
            startMove: function(){
                var e = window.event || arguments[0];
                this.startScroll = e.changedTouches[0].pageY;
            },
            endMove: function(){
                var me = this;
                var e = window.event || arguments[0];
                var gapScroll = -(e.changedTouches[0].pageY - this.startScroll);
                if(gapScroll >= 60){
                    $('#indexPage').hide();
                    $('#onePage').show();
                    console.log(me.mySwiper_temp);
                    $('#panelPage').show().addClass('panel_show_origin');
                    //创建雪花
                    createsnow('decorate_flower');
                    info.tempName = 'onePage';
                    info.decorateName = 'decorate_flower';
                    me.getText('onePage');
                    console.log(info);
                    me.wxshare();
                    //初始化swiper
                    me.mySwiper_temp = new Swiper('#temp .swiper-container',{
                        slidesPerView : 3
                    });
                }
            },
			checkTouch: function(){
                var me = this;
                //首页滑动事件
                $('#indexPage').on('touchstart',function(){
                    me.startMove();
                });
                $('#indexPage').on('touchmove',function(){
                    me.endMove();
                });
                $('.panelBox').delegate('p',config.touch,function(){
                    var type_temp = $('.panelBox').find('p').eq(1).data('type');
                    var type_decorate = $('.panelBox').find('p').eq(2).data('type');
                    var type_now = $(this).data('type');
                    if(type_now == 'temp' || type_now == 'decorate'){
                        $('.panelBox').find('p').eq(1).find('img').attr('src','images/' + type_temp + '.png');
                        $('.panelBox').find('p').eq(2).find('img').attr('src','images/' + type_decorate + '.png');
                        $(this).find('img').attr('src','images/' + type_now + '_active.png');
                        $('.panelBox').find('.active').removeClass('active');
                        $(this).addClass('active');
                        $('#panelPage').find('.selectBox').hide();
                        $('#' + type_now).show();
                        if(type_now == 'decorate' && !isDecorate){
                            me.mySwiper_decorate = new Swiper('#decorate .swiper-container',{
                                slidesPerView : 3
                            });
                            isDecorate = true;
                            console.log(me.mySwiper_decorate);
                        }
                    }
                });
                $('#temp').delegate('.swiper-slide',config.touch,function(){
                    var tempName = $(this).data('type');
                    $('#temp').find('.ico_select').hide();
                    $(this).find('.ico_select').show();
                    $('.cardPage').hide();
                    $('#' + tempName).show();
                    info.tempName = tempName;
                    me.getText(tempName);
                    me.wxshare();
                    console.log(info);
                });
                $('#decorate').delegate('.swiper-slide',config.touch,function(){
                    $('#decorate').find('.ico_select').hide();
                    $(this).find('.ico_select').show();
                    var type = $(this).data('type');
                    createsnow(type);
                    info.decorateName = $(this).data('type');
                    console.log(info);
                    me.wxshare();
                });
                $('#musicBox').on('change',function(){
                    var value = $(this).val();
                    $('#audio_bg').attr('src','http://qcdn.letwx.com/app/ggyearcard2018-build/resource/music_' + value + '.mp3');
                    oAudio_bg.play();
                    info.musicId = value;
                    console.log(info);
                    me.wxshare();
                });
                $('#temp').find('.prevBtn').click(function(){
                    me.mySwiper_temp.slidePrev();
                });
                $('#temp').find('.nextBtn').click(function(){
                    me.mySwiper_temp.slideNext();
                });
                $('#decorate').find('.prevBtn').click(function(){
                    me.mySwiper_decorate.slidePrev();
                });
                $('#decorate').find('.nextBtn').click(function(){
                    me.mySwiper_decorate.slideNext();
                });
                $('#panelPage').find('.closeBtn').on(config.touch,function(){
                    $('#panelPage').removeClass('panel_show').removeClass('panel_show_origin').addClass('panel_hide');
                    setTimeout(function(){
                        $('#panelPage').hide();
                        $('#setBtn').show();
                    },600);
                });
                $('#setBtn').on(config.touch,function(){
                    $(this).hide();
                    $('#panelPage').show().removeClass('panel_hide').addClass('panel_show');
                });
                $('.share').on(config.touch,function(){
                    var tempName = $(this).parent('.cardPage').data('temp');
                    me.getText(tempName);
                    console.log(info);
                    me.wxshare();
                    $('#sharePage').show();
                });
                $('#sharePage').on(config.touch,function(){
                    $(this).hide();
                });
			},
            out: function(){

            }
		};

        function createsnow(name,size){
            $("canvas.snow").let_it_snow({
                speed: 0.4,
                size: size||10,
                count: 10,
                image: "images/" + name + ".png?v=2"
            });
        }

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
        if(!isShare){
            indexPage.act.init();
        }else{
            shareEnter.act.init();
        }

	}

	//需要预加载的图片
	var imgs = [
        __uri('images/index_bg.jpg'),
        __uri('images/logo.png'),
    ];
}());
