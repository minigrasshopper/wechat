(function(){
	require([config.configUrl],function(){
		var reqArr = ['wxshare'];
		require(reqArr,requireCb);
	});
	
	function requireCb(wxshare){
        var pageData = null;
        var judgeBgMusic = false;    //是否已经判断音乐，再玩时不再改变音乐状态
		var indexPage = {}; //首页对象
		var gamePage = {}; //游戏页面对象
		var resultPage = {}; //结果页面对象
        var isSuccess = false;   //是否挑战成功
        var score = 0;   //得分
        var time_used = 0;  //游戏使用时间
        var selfData = {
            title: '',
            needBgMusic: 1,    //是否需要背景音乐
            rules: '',
            index: {
                index_bg: 'images/index_bg.jpg',
                logo: 'images/logo.png',
                index_title: 'images/index_title.png',
                start_btn: 'images/start_btn.png',
                rule_btn: 'images/rule_btn.png',
                myprize_btn: 'images/myprize_btn.png',
                music_on: 'images/music_on.png',
                music_off: 'images/music_off.png'
            },
            rule: {
                rule_bg: 'images/rule_bg.png',
                close_btn: 'images/close_btn.png'
            },
            game: {
                game_bg1: 'images/game_bg1.jpg',
                game_bg2: 'images/game_bg2.jpg',
                game_hint: 'images/game_hint.png',
                know_btn: 'images/know_btn.png',
                clock: 'images/clock.png',
                baby_origin: 'images/baby_origin.png',
                baby_run: 'images/baby_run.gif',
                baby_angel: 'images/baby_angel.gif',
                baby_sky: 'images/baby_sky.png',
                man_angel: 'images/man_angel.png',
                man_sky: 'images/man_sky.png'
            },
            result: {
                result_nice: 'images/result_nice.png',
                result_fail: 'images/result_fail.png',
                again_btn: 'images/again_btn.png',
                share_btn: 'images/share_btn.png',
                get_btn: 'images/get_btn.png'
            },
            share: {
                share_hint: 'images/share_hint.png'
            },
            text: {
                score: 1000,     //抽奖门槛
                time: 30,   //游戏时间
                score_hint: '', //游戏提示
                low_hint: '很遗憾！br再接再厉哟！',
                no_hint: '来晚了！br奖品已经被抢完了！',
                totalmax_hint: '您的奖品总数已达上限！br快去使用吧！',
                daymax_hint: '您今天的奖品领完了！br明天再来哟！',
                has_hint: '恭喜您！br获得一份神秘礼物！'
            }
        };



        //阻止默认滚动事件
        $('#gamePage')[0].ontouchmove = function (e) {
            e.preventDefault();
        };

		window.oAudio_bg = document.getElementById('audio_bg');	//背景音乐
		window.oAudio_button = document.getElementById('audio_button');	//按钮声音

		indexPage.act = {
            init: function(){
                indexPage.data.index();
            },
            indexCb: function(data){
                var me = this;
                pageData = data;
                console.log(pageData);
                //图片预加载
                //M.imgpreload(imgs, function(){});
                me.dataImport();
                me.bgMusicOrigin();
                me.checkTouch();
                me.wxshare(data.cfg);
                M.loadingHide();
            },
            dataImport: function(){
                /*数据渲染开始*/
                selfData.title = pageData.cfg.title;
                selfData.needBgMusic = true;
                selfData.rules = pageData.cfg.rules;
                selfData.index.index_bg = pageData.cfg.activesetting.imgs.index_bg;
                selfData.index.logo = pageData.cfg.activesetting.imgs.logo;
                selfData.index.index_title = pageData.cfg.activesetting.imgs.index_title;
                selfData.index.start_btn = pageData.cfg.activesetting.imgs.start_btn;
                selfData.index.rule_btn = pageData.cfg.activesetting.imgs.rule_btn;
                selfData.index.myprize_btn = pageData.cfg.activesetting.imgs.myprize_btn;
                selfData.index.music_on = pageData.cfg.activesetting.imgs.music_on;
                selfData.index.music_off = pageData.cfg.activesetting.imgs.music_off;
                selfData.rule.rule_bg = pageData.cfg.activesetting.imgs.rule_bg;
                selfData.rule.close_btn = pageData.cfg.activesetting.imgs.close_btn;
                /*数据渲染结束*/

                $('#title').text(selfData.title);
                $('.rules').html(selfData.rules);
                $('#indexPage').find('.logo').attr({'src': selfData.index.logo});
                $('.indexTitle').attr({'src': selfData.index.index_title});
                $('#startBtn').attr({'src': selfData.index.start_btn});
                $('#ruleBtn').attr({'src': selfData.index.rule_btn});
                $('#myprizeBtn').attr({'src': selfData.index.myprize_btn});
                $('.ruleBg').attr({'src': selfData.rule.rule_bg});
                $('#ruleCloseBtn').attr({'src': selfData.rule.close_btn});
                $('#indexPage').css({'background-image': "url('" + selfData.index.index_bg + "')"}).show();
            },
            bgMusicOrigin: function(){
                //1.判断是否需要背景音乐
                if(judgeBgMusic){   //已经判断了音乐,不再判断
                    return false;
                }
                judgeBgMusic = true;
                if(selfData.needBgMusic){
                    //2.设置src
                    $('#music').attr('src',selfData.index.music_on).addClass('musicRun').show();
                    //音频自动播放的兼容处理
                    if(typeof WeixinJSBridge == "object" && typeof WeixinJSBridge.invoke == "function") {
                        WeixinJSBridge.invoke('getNetworkType', {}, function (res) {
                            oAudio_bg.play();
                        });
                    }else{
                        oAudio_bg.play();
                    }
                }
            },
			checkTouch: function(){
				var me = this;
                $('#music').on(config.touch,function(){
                    //控制背景音乐
                    if($(this).attr('src') == selfData.index.music_on){
                        $(this).attr('src',selfData.index.music_off).removeClass('musicRun');
                        oAudio_bg.pause();
                    }else{
                        $(this).attr('src',selfData.index.music_on).addClass('musicRun');
                        oAudio_bg.play();
                    }
                });
				$('#ruleBtn').on(config.touch,function(){
                    oAudio_button.play();
					$('#rulePage').show();
				});
				$('#ruleCloseBtn').on(config.touch,function(){
                    oAudio_button.play();
					$('#rulePage').hide();
				});
				$('#startBtn').on(config.touch,function(){
                    oAudio_button.play();
                    me.out();
					gamePage.act.init();
				});
				$('#myprizeBtn').on(config.touch,function(){
                    oAudio_button.play();
					me.out();
                    gotoUrl(config.htmlUrl+'myprize.html?uid='+config.uid+'&gp='+config.gp);
				});
			},
			wxshare: function(data){
                config.shareInfo.title = data.sharetitle || config.shareInfo.title;
                config.shareInfo.desc = data.sharecontent || config.shareInfo.desc;
                config.shareInfo.imgUrl = data.sharepic || config.shareInfo.imgUrl;
				share(config.shareInfo);
			},
			out: function(){
                $('#music').off();
                $('#startBtn').off();
				$('#ruleBtn').off();
				$('#myPrizeBtn').off();
				$('#ruleCloseBtn').off();
				$('#indexPage').hide();
			}
		};

        indexPage.data = {
            index : function(){
                post('active/index',{
                    gp : config.gp
                },function(data){
                    indexPage.act.indexCb(data);
                });
            }
        };

		gamePage.act = {
            svg: null,  //SVG对象
            startPoint: 0, //手指触碰时的坐标
            nowPoint: 0,   //手指移动时的间距总和
            endPoint: 0,   //手指离开时的间距总和
            bg: null,   //滑动的背景
            baby: null, //女王原始状态
            baby_run: null, //女王奔跑 - 先渲染后操作，效果流畅
            baby_angel: null, //女王精灵 - 先渲染后操作，效果流畅
            baby_sky: null, //女王飞行 - 先渲染后操作，效果流畅
            man_angel: null,    //男神1号
            man_sky: null,    //男神2号
            scale: 40,  //背景的高度相对适口的倍数
            bg_y: null,    //背景y坐标
            man_angel_y: null,   //男神1号
            man_sky_y: null,   //男神2号
            lastTimeStap: 0,
            needChangeSrc: false,
            meterInterval: 0,   //每米的距离
            metelTotal: 0,    //总共多少米
            positionArr: [0.2,0.6], //分割点位置
            time: 0,    //游戏时间
            game_timer: null,   //游戏定时器
            init: function(){
                this.dataImport();
                this.checkTouch();
            },
            dataImport: function(){
                /*渲染数据开始*/
                selfData.game.game_bg1 = pageData.cfg.activesetting.imgs.game_bg1;
                selfData.game.game_bg2 = pageData.cfg.activesetting.imgs.game_bg2;
                selfData.game.game_hint = pageData.cfg.activesetting.imgs.game_hint;
                selfData.game.know_btn = pageData.cfg.activesetting.imgs.know_btn;
                selfData.game.clock = pageData.cfg.activesetting.imgs.clock;
                selfData.game.baby_origin = pageData.cfg.activesetting.imgs.baby_origin;
                selfData.game.baby_run = pageData.cfg.activesetting.imgs.baby_run;
                selfData.game.baby_angel = pageData.cfg.activesetting.imgs.baby_angel;
                selfData.game.baby_sky = pageData.cfg.activesetting.imgs.baby_sky;
                selfData.game.man_angel = pageData.cfg.activesetting.imgs.man_angel;
                selfData.game.man_sky = pageData.cfg.activesetting.imgs.man_sky;
                selfData.text.score = Number(pageData.cfg.activesetting.txts.score);
                selfData.text.time = Number(pageData.cfg.activesetting.txts.time);
                /*渲染数据结束*/

                //初始化数据
                this.metelTotal = selfData.text.score;
                this.time = selfData.text.time;
                isSuccess = false;
                $('#gameSVG').html('');
                this.startPoint = 0;
                this.nowPoint = 0;
                this.endPoint = 0;
                this.lastTimeStap = 0;
                this.needChangeSrc = false;
                this.meterInterval = Math.floor(this.view().h * (this.scale - 1) / this.metelTotal);
                this.svgStyle();
                if(this.time >= 10){
                    $('#second').text(this.time);
                }else{
                    $('#second').text('0' + this.time);
                }
                score = 0;
                $('#score').text(score);
                $('#gameGuide').show();
                $('.gameHint').attr('src',selfData.game.game_hint);
                $('#knowBtn').attr('src',selfData.game.know_btn);
                $('.clock').attr('src',selfData.game.clock);
                $('#gamePage').show();
            },
            readyCountDown: function(){
                //3秒倒计时
            },
            gameCountDown: function(){
                //30秒倒计时
                var me = this;
                this.game_timer = setInterval(function(){
                    if(me.time > 0){
                        me.time --;
                        if(me.time >= 10){
                            $('#second').text(me.time);
                        }else{
                            $('#second').text('0' + me.time);
                        }
                        time_used = me.time;
                    }else{
                        $('#second').text('00');
                        clearInterval(me.game_timer);
                        me.out();
                        resultPage.act.init();
                    }
                },1000);
            },
            view: function(){
                return {
                    w : document.documentElement.clientWidth || document.body.clientWidth,
                    h : document.documentElement.clientHeight || document.body.clientHeight
                }
            },
            svgStyle: function(){
                this.svg = Snap('#gameSVG');
                this.bg = this.svg.paper.svg(0, -this.view().h * (this.scale - 1), this.view().w, this.view().h * this.scale);
                for(var i=0;i<this.scale / 2;i++){
                    var bg1 = this.svg.paper.image(selfData.game.game_bg1, 0, this.view().h * i, this.view().w, this.view().h * 2);
                    this.bg.append(bg1);
                }
                for(var j=this.scale/2;j<this.scale;j++){
                    var bg2 = this.svg.paper.image(selfData.game.game_bg2, 0, this.view().h * j, this.view().w, this.view().h * 2);
                    this.bg.append(bg2);
                }
                this.baby = this.svg.paper.image(selfData.game.baby_origin, this.view().w * 0.5 - 75, this.view().h * 0.4, 150, 150);
                this.baby_run = this.svg.paper.image(selfData.game.baby_run, this.view().w * 0.5 - 75, this.view().h * 0.4, 150, 150).addClass('hide');
                this.baby_angel = this.svg.paper.image(selfData.game.baby_angel, this.view().w * 0.5 - 75, this.view().h * 0.4, 150, 150).addClass('hide');
                this.baby_sky = this.svg.paper.image(selfData.game.baby_sky, this.view().w * 0.5 - 103, this.view().h, 206, 297);
                this.man_angel = this.svg.paper.image(selfData.game.man_angel, this.view().w * 0.5 - 25, this.view().h * (-this.scale * this.positionArr[0] + 0.4) - 140 - 10, 50, 140);
                this.man_sky = this.svg.paper.image(selfData.game.man_sky, this.view().w * 0.5 - 25, this.view().h * (-this.scale * this.positionArr[1] + 0.4) - 140 - 10, 50, 140);
                this.bg_y = Number(this.bg.attr('y'));
                this.man_angel_y = Number(this.man_angel.attr('y'));
                this.man_sky_y = Number(this.man_sky.attr('y'));
            },
            checkTouch: function(){
                var me = this;
                this.bg.touchstart(function(){
                    me.startMove();
                });
                this.bg.touchmove(function(){
                    me.nowMove();
                });
                this.bg.touchend(function(){
                    me.endMove();
                });
                $('#knowBtn').on(config.touch,function(){
                    oAudio_button.play();
                    $('#gameGuide').hide();
                    me.gameCountDown();
                });
            },
            moveScoreShow: function(){
                score = Math.floor(this.nowPoint / this.meterInterval);
                if(score >= this.metelTotal){
                    score = this.metelTotal;
                    isSuccess = true;
                }
                $('#score').text(score);
            },
            endScoreShow: function(){
                score = Math.floor(this.endPoint / this.meterInterval);
                if(score >= this.metelTotal){
                    score = this.metelTotal;
                    isSuccess = true;
                }
                $('#score').text(score);
            },
            startMove: function(){
                var e = window.event || arguments[0];
                this.startPoint = e.changedTouches[0].pageY;
                //为减少误差校正距离 - 决定不校正，出现卡屏
                //this.endPoint = -this.bg_y + Number(this.bg.attr('y'));
            },
            nowMove: function(){
                var e = window.event || arguments[0];
                var gap = e.changedTouches[0].pageY - this.startPoint;
                if(gap <= 0){   //只能向下滑动
                    return;
                }
                this.nowPoint = gap +　this.endPoint;
                this.originMove(this.nowPoint);
                this.lastTimeStap = e.timeStamp;
            },
            endMove: function(){
                var e = window.event || arguments[0];
                var gap = e.changedTouches[0].pageY - this.startPoint;
                var interval = e.timeStamp - this.lastTimeStap; //最后一次移动到离开的时间间隔
                if(gap <= 0){   //移动距离小于0，结束时不移动
                    return
                }
                //结束时快速移动
                if(interval <= 1 && gap >= 200){
                    this.endPoint = this.nowPoint + 200;
                    this.endQuickMove(this.endPoint);
                    return
                }
                //结束时慢速移动
                this.endPoint = this.nowPoint + 100;
                this.endSlowMove(this.endPoint);
            },
            originMove: function(scroll){
                //元素正常移动
                this.bg.attr({
                    y: this.bg_y + scroll
                });
                this.man_angel.attr({
                    y: this.man_angel_y + scroll
                });
                this.man_sky.attr({
                    y: this.man_sky_y + scroll
                });
                this.moveToggleSrc();
                this.moveScoreShow();
                this.judgeState();
            },
            endSlowMove: function(scroll){
                var me = this;
                //结束时慢速移动
                this.bg.animate({
                    y: this.bg_y + scroll
                },400,mina.linear,function(){
                    me.endToggleSrc();
                    me.endScoreShow();
                    me.judgeState();
                });
                this.man_angel.animate({
                    y: this.man_angel_y + scroll
                },400,mina.linear,function(){});
                this.man_sky.animate({
                    y: this.man_sky_y + scroll
                },400,mina.linear,function(){});
            },
            endQuickMove: function(scroll){
                var me = this;
                //结束时快速移动
                this.bg.animate({
                    y: this.bg_y + scroll
                },800,mina.linear,function(){
                    me.endToggleSrc();
                    me.endScoreShow();
                    me.judgeState();
                });
                this.man_angel.animate({
                    y: this.man_angel_y + scroll
                },800,mina.linear,function(){});
                this.man_sky.animate({
                    y: this.man_sky_y + scroll
                },800,mina.linear,function(){});
            },
            judgeState: function(){
                var me = this;
                //1.判断距离，误差太大
                /*if(this.nowPoint >= this.view().h * (this.scale - 1) || this.endPoint >= this.view().h * (this.scale - 1)){
                    //是否到达终点
                    this.bg.stop();
                    this.bg.untouchstart();
                    this.bg.untouchmove();
                    this.bg.untouchend();
                    this.bg.attr({
                        y: 0
                    });
                    clearInterval(me.game_timer);
                    me.out();
                    resultPage.act.init();
                }*/
                //2.判断分数，准确判断
                if(score >= this.metelTotal){
                    //是否到达终点
                    this.bg.stop();
                    this.bg.untouchstart();
                    this.bg.untouchmove();
                    this.bg.untouchend();
                    this.bg.attr({
                        y: 0
                    });
                    clearInterval(me.game_timer);
                    me.out();
                    resultPage.act.init();
                }
            },
            moveToggleSrc: function(){
                if(this.nowPoint <= this.view().h * this.scale * this.positionArr[0] && !this.needChangeSrc){
                    this.needChangeSrc = true;
                    this.baby.addClass('hide');
                    this.baby_run.removeClass('hide');
                }else if(this.nowPoint > this.view().h * this.scale * this.positionArr[0] && this.nowPoint <= this.view().h * this.scale * this.positionArr[1] && this.needChangeSrc){
                    this.needChangeSrc = false;
                    this.baby.addClass('hide');
                    this.baby_run.addClass('hide');
                    this.baby_angel.removeClass('hide');
                    this.man_angel.remove();
                }else if(this.nowPoint > this.view().h * this.scale * this.positionArr[1] && this.nowPoint <= this.view().h * this.scale && !this.needChangeSrc){
                    this.needChangeSrc = true;
                    this.baby_angel.addClass('hide');
                    this.man_sky.remove();
                    this.baby_sky.animate({
                        'y': this.view().h * 0.2
                    },1200,mina.linear);
                }
            },
            endToggleSrc: function(){
                if(this.endPoint <= this.view().h * this.scale * this.positionArr[0]){
                    this.needChangeSrc = false;
                    this.baby.removeClass('hide');
                    this.baby_run.addClass('hide');
                }else if(this.endPoint > this.view().h * this.scale * this.positionArr[0] && this.endPoint <= this.view().h * this.scale * this.positionArr[1]){
                    this.needChangeSrc = false;
                    this.baby.addClass('hide');
                    this.baby_run.addClass('hide');
                    this.baby_angel.removeClass('hide');
                    this.man_angel.remove();
                }else if(this.endPoint > this.view().h * this.scale * this.positionArr[1] && this.endPoint <= this.view().h * this.scale && !this.needChangeSrc){
                    this.needChangeSrc = true;
                    this.baby_angel.addClass('hide');
                    this.man_sky.remove();
                    this.baby_sky.animate({
                        'y': this.view().h * 0.2
                    },1200,mina.linear);
                }
            },
            out: function(){
                $('#knowBtn').off();
            }
		};

		resultPage.act = {
			init: function(){
                var me = this;
                M.loading();
                me.dataImport();
                me.judgeHint();
                me.checkTouch();
                //预留时间用于数据的渲染，增加体验
                setTimeout(function(){
                    M.loadingHide();
                    $('#resultPage').show();
                },1500);
            },
            dataImport: function(){
                /*数据渲染开始*/
                selfData.result.result_nice = pageData.cfg.activesetting.imgs.result_nice;
                selfData.result.result_fail = pageData.cfg.activesetting.imgs.result_fail;
                selfData.result.again_btn = pageData.cfg.activesetting.imgs.again_btn;
                selfData.result.share_btn = pageData.cfg.activesetting.imgs.share_btn;
                selfData.result.get_btn = pageData.cfg.activesetting.imgs.get_btn;
                if(pageData.cfg.activesetting.imgs.share_hint){
                    selfData.share.share_hint = pageData.cfg.activesetting.imgs.share_hint;
                }

                selfData.text.score_hint = pageData.cfg.activesetting.txts.score_hint;
                selfData.text.low_hint = pageData.cfg.activesetting.txts.low_hint;
                selfData.text.has_hint = pageData.cfg.activesetting.txts.has_hint;
                selfData.text.no_hint = pageData.cfg.activesetting.txts.no_hint;
                selfData.text.totalmax_hint = pageData.cfg.activesetting.txts.totalmax_hint;
                selfData.text.daymax_hint = pageData.cfg.activesetting.txts.daymax_hint;
                /*数据渲染结束*/
                $('#againBtn').attr('src',selfData.result.again_btn);
                $('#shareBtn').attr('src',selfData.result.share_btn);
                $('#getBtn').attr('src',selfData.result.get_btn);
                $('#sharePage').find('img').attr('src',selfData.share.share_hint);
                $('.result_nice').attr('src',selfData.result.result_nice).hide();
                $('.result_fail').attr('src',selfData.result.result_fail).hide();

            },
            checkTouch: function(){
                var me = this;
                $('#againBtn').on(config.touch, function(){
                    oAudio_button.play();
                    me.out();
                    indexPage.act.init();
                });
                $('#shareBtn').on(config.touch, function(){
                    oAudio_button.play();
                    $('#sharePage').show();
                });
                $('#getBtn').on(config.touch, function(){
                    oAudio_button.play();
                    me.out();
                    gotoUrl(config.htmlUrl+'myprize.html?uid='+config.uid+'&gp='+config.gp);
                });
                $('#sharePage').on(config.touch, function(){
                    $('#sharePage').hide();
                });
            },
            judgeHint: function(){
                //判断是否获得奖券
                //1未达到抽奖门槛-无券  2达到抽奖门槛
                //isSuccess-true表示挑战成功
                if(!isSuccess){
                    //未达到抽奖门槛
                    $('.result_fail').show();
                    textConvert($('.resultHint')[0], selfData.text.low_hint);
                    return
                }else{
                    //达到抽奖门槛
                    $('.result_nice').show();
                    scoreConvert($('#scoreHint')[0],selfData.text.score_hint,selfData.text.time - time_used);
                    resultPage.data.save();
                }
            },
            getcouponCb: function(data){
                //1未达到抽奖门槛-无券  2.1达到抽奖门槛+券完了-无券 2.2达到抽奖门槛+总券上限-无券 2.3达到抽奖门槛+今天券上限-无券  3达到抽奖门槛-有券
                var couponnum = pageData.couponnum;  //已获得奖品数量
                var maxcouponnum = pageData.maxcouponnum;   //最大领券数量 0-无限制
                if(data.hasget == 0){
                    //2达到抽奖门槛-无券
                    //旧平台暂时
                    textConvert($('.resultHint')[0], selfData.text.no_hint);
                    /*if(false){
                        //2.1达到抽奖门槛+券完了-无券
                        textConvert($('.resultHint')[0], selfData.text.no_hint);
                        return
                    }else if(maxcouponnum != 0 && couponnum == maxcouponnum){
                        //2.2达到抽奖门槛+总券上限-无券
                        textConvert($('.resultHint')[0], selfData.text.totalmax_hint);
                        return
                    }else if(false){
                        //2.3达到抽奖门槛+今天券上限-无券
                        textConvert($('.resultHint')[0], selfData.text.daymax_hint);
                        return
                    }*/
                }else{
                    //3达到抽奖门槛-有券
                    textConvert($('.resultHint')[0], selfData.text.has_hint);
                }
            },
            out: function(){
                $('#resultPage').hide();
                $('#againBtn').off();
                $('#shareBtn').off();
                $('#sharePage').off();
            }
		};

        resultPage.data = {
            save : function(){
                post('active/saveplay',{
                    score : score,
                    gp : config.gp
                },function(){
                    resultPage.data.getcoupon();
                });
            },
            getcoupon : function(){
                post('active/getcoupon',{
                    gp : config.gp
                },function(data){
                    resultPage.act.getcouponCb(data);
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
		check(oAuth,function(){
			indexPage.act.init();
		});

	}

	//需要预加载的图片
	var imgs = [
        /*__uri('images/index_bg.jpg'),
        __uri('images/game_bg.jpg'),*/
    ];
}());
