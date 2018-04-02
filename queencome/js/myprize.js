(function(){
	require([config.configUrl],function(){
		var reqArr = ['wxshare','barcode','qrcode'];
		require(reqArr,requireCb);
	});

	function requireCb(wxshare,barcode,qrcode){
		var jq = window.jq = require('jquery').noConflict();
        var pageData = null;
		var myprizePage = {}; //我的奖品页面对象

        window.oAudio_button = document.getElementById('audio_button');	//按钮声音

        var selfData = {
            title: '',
            myprize: {
                myprize_bg: 'images/myprize_bg.jpg',
                back_btn: 'images/back_btn.png',
                ticket_bg: 'images/ticket_bg.png',
                ahead_btn: 'images/ahead_btn.png',
                state_used: 'images/state_used.png',
                state_expired: 'images/state_expired.png'
            }
        };
		myprizePage.act = {
			init: function(){
                myprizePage.data.index();
                M.loadingHide();
            },
            indexCb: function(data){
                pageData = data;
                myprizePage.data.mycoupon();
            },
            mycouponCb: function(data){
                console.log(data);
                $('#myprizePage').html(template('myprizeTMP',data));
                this.dataImport();  //先渲染页面，再导入后台数据
                this.checkTouch();
            },
            dataImport: function(){
                /*数据渲染开始*/
                selfData.title = pageData.cfg.title;
                selfData.myprize.myprize_bg = pageData.cfg.activesetting.imgs.myprize_bg;
                selfData.myprize.back_btn = pageData.cfg.activesetting.imgs.back_btn;
                selfData.myprize.ticket_bg = pageData.cfg.activesetting.imgs.ticket_bg;
                selfData.myprize.ahead_btn = pageData.cfg.activesetting.imgs.ahead_btn;
                selfData.myprize.state_used = pageData.cfg.activesetting.imgs.state_used;
                selfData.myprize.state_expired = pageData.cfg.activesetting.imgs.state_expired;
                /*数据渲染结束*/

                $('#title').text(selfData.title);
                $('#myprizePage').css({'background-image': "url('" + selfData.myprize.myprize_bg + "')"}).show();
                $('#myprizePage').find('li').css({'background-image': "url('" + selfData.myprize.ticket_bg + "')"});
                $('#backBtn').attr('src',selfData.myprize.back_btn);
                $('.aheadBtn').attr('src',selfData.myprize.ahead_btn);
                $('.state_used').attr('src',selfData.myprize.state_used);
                $('.state_expired').attr('src',selfData.myprize.state_expired);
            },
            checkTouch: function(){
                var me = this;
                var info = null;    //存放当前券信息
                $('#backBtn').on(config.click,function(){
                    oAudio_button.play();
                    gotoUrl(config.htmlUrl+'index.html?uid='+config.uid+'&gp='+config.gp);
                    me.out();
                });
                $('#verifyCloseBtn').on(config.click,function(){
                    oAudio_button.play();
                    //重新刷新数据
                    $('#verifyPage').hide();
                    me.out();
                    me.init();
                });
                $('#myprizePage').find('ul').delegate('li',config.click,function(){
                    M.loading(1,2);
                    var me = this;
                    info = {
                        qname: $(me).data('qname'),
                        shorttitle: $(me).data('shorttitle'),
                        starttime: $(me).data('starttime'),
                        endtime: $(me).data('endtime'),
                        isuse: $(me).data('isuse'),
                        isexpired: $(me).data('isexpired'),
                        consumemethod: $(me).data('consumemethod'),
                        descrip: $(me).data('descrip'),
                        showtype: $(me).data('showtype'),
                        code: $(me).data('code').toString(),
                        isnet: $(me).data('isnet'),
                        useurl: $(me).data('useurl')
                    };
                    $('#verifyPage').find('.showBox').hide();
                    $('#verifyPage').find('.code').text(info.code);
                    $('#verifyPage').find('.qname').text(info.qname);
                    $('#verifyPage').find('.shorttitle').text(info.shorttitle);
                    $('#verifyPage').find('.start_end').text('使用时间：' + info.starttime + ' - ' + info.endtime);
                    textConvert($('#verifyPage').find('.desc')[0], info.descrip);
                    //1.判断券核销类型
                    if(info.consumemethod == 1){
                        //密码核销
                        $('#getPsd').val('');
                        $('#verifyPage').find('.psdBox').show();
                    }else{
                        if(info.isnet == 0){//线下使用
                            switch(info.showtype){
                                case 1://条形码
                                    $('#verifyPage').find('.barcodeBox').show();
                                    $('#barcode').html('');
                                    jq('#barcode').barcode(info.code, 'code128', { //条形码
                                        barWidth: 4,
                                        barHeight: 120,
                                        output: 'bmp'
                                    });
                                    break;
                                case 2://二维码
                                    $('#verifyPage').find('.qrcodeBox').show();
                                    $('#qrcode').html('');
                                    jq('#qrcode').qrcode({width: 200,height: 200,text: info.code});
                                    break;
                                default://券码
                                    $('#verifyPage').find('.codeBox').show();
                            }
                        }else{//线上使用
                            gotoUrl(info.useurl);
                            return
                        }
                    }
                    $('#verifyPage').show();
                    M.loadingHide();
                    //2.判断券状态
                    $('#verifyPage').removeClass('noApply');
                    $('#verifyPage').find('.state').hide();
                    if(info.isuse == 1){
                        //已使用
                        $('#verifyPage').addClass('noApply').find('.state_used').show();
                        $('#checkBtn').off();
                    }else if(info.isexpired == 1){
                        //已过期
                        $('#verifyPage').addClass('noApply').find('.state_expired').show();
                        $('#checkBtn').off();
                    }
                });
                //点击核销按钮
                $('#checkBtn').on(config.click,function(){
                    oAudio_button.play();
                    var password = $('#getPsd').val();
                    if(password == ''){
                        M.alert('密码不能为空！');
                        return;
                    }else{
                        M.loading();
                        var params = {
                            code : info.code,
                            password : password,
                            gp : config.gp
                        };
                        myprizePage.data.checkpsd(params);
                    }
                });
            },
            checkpsdCb: function(data){
                var err = data.error - 0;
                M.loadingHide();
                switch(err){
                    case 0:
                        M.alert(data.error_msg);
                        window.location.reload();
                        break;
                    default:
                        defaultError(data);
                }
            },
            out: function(){
                $('#backBtn').off();
                $('#checkBtn').off();
                $('#sureBtn').off();
                $('#verifyCloseBtn').off();
                $('#myprizePage').find('ul').undelegate();
            }
		};

        myprizePage.data = {
            index : function(){
                post('active/index',{
                    gp : config.gp
                },function(data){
                    myprizePage.act.indexCb(data);
                });
            },
            mycoupon : function(){
                post('active/mycoupon',{
                    gp : config.gp
                },function(data){
                    myprizePage.act.mycouponCb(data);
                });
            },
            checkpsd: function(params){
                post('active/couponconsume',params,function(data){
                    myprizePage.act.checkpsdCb(data);
                });
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
			},config.apiopenid,config.apitoken);
		}

		M.loading();
		check(oAuth,function(){
			myprizePage.act.init();
		});
	}
}());
