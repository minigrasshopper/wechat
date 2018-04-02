(function () {
    requirejs([config.configUrl], function () {
        requirejs(['http', 'vue', 'commonService', 'wxshare', 'shake'], requireCb);
    });

    function requireCb(http, Vue, commonService, wxshare, Shake) {
        var indexPage, rulePage, gamePage, resultPage, sharePage;
        window.audioBg = document.getElementById('audioBg');	// 背景音乐
        var musicPlay = true;   // 背景音乐是否播放
        var viewW = document.documentElement.clientWidth || document.body.clientWidth;
        var viewH = document.documentElement.clientHeight || document.body.clientHeight;
        var score = 0;
        var selfData = {
            title: '闹元宵', // 活动标题
            rules: '1、我是规则。<br/>2、我是规则。<br/>3、我是规则。',  // 活动规则
            isexpired: 0,    // 活动是否过期
            maxplaynum: 0,  // 最多游戏次数 0-无限制
            maxdayplaynum: 0,   // 每天最多游戏次数 0-无限制
            playnum: 0,   // 已玩游戏次数
            todayplaynum: 0,   // 今天已玩游戏次数
            needfollow: 0,  // 是否需要关注
            isfollow: 0,    // 是否已关注
            qrcodeurl: 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=gQH58DwAAAAAAAAAAS5odHRwOi8vd2VpeGluLnFxLmNvbS9xLzAyNDBLRTlWellhUGUxMDAwMDAwN3gAAgRyuEBaAwQAAAAA',  // 关注二维码
            index: {
                index_bg: 'images/index_bg.jpg',
                logo: 'images/logo.png',
                index_title: 'images/index_title.png',
                btn_start: 'images/btn_start.png',
                btn_rule: 'images/btn_rule.png',
                btn_prize: 'images/btn_prize.png'
            },
            rule: {
                rule_bg: 'images/rule_bg.png'
            },
            game: {
                game_hint: 'images/game_hint.png',
                game_bg: 'images/game_bg.jpg',
                game_noodles: 'images/game_noodles.png',
                game_icon_water: 'images/game_icon_water.png',
                game_icon_noodles: 'images/game_icon_noodles.png',
                game_text_water: 'images/game_text_water.png',
                game_text_noodles: 'images/game_text_noodles.png',
                game_tool: 'images/game_tool.png',
                btn_shake: 'images/btn_shake.png',
                game_icon_score: 'images/game_icon_score.png',
                game_icon_time: 'images/game_icon_time.png',
                game_ball1: 'images/game_ball1.png',
                game_ball2: 'images/game_ball2.png',
                game_ball3: 'images/game_ball3.png',
                game_ball4: 'images/game_ball4.png',
                game_ball5: 'images/game_ball5.png',
                game_ball6: 'images/game_ball6.png',
            },
            result: {
                result_bg: 'images/result_bg.png',
                result_has: 'images/result_has.png',
                result_no: 'images/result_no.png',
                btn_again: 'images/btn_again.png',
                btn_share: 'images/btn_share.png',
            },
            share: {
                share: 'images/share.png'
            },
            text: {
                // 首页文本
                expired_hint: '活动已过期', // 活动过期-不能玩游戏，可以查看奖品
                // 结果页文本
                limit: 60, // 得分临界值
                second: 30, // 游戏时间
                nice_hint: '厉害了，制作了@个元宵br获得一份神秘礼物',   // 有奖品
                fail_hint: '加油哦，制作了@个元宵br还差一丢丢',   // 无奖品
                exhaust_hint: '厉害了，制作了@个人元宵br未获得礼物',    // 奖品领完
            }
        };

        var httpService = {
            index: function(cb){
                http.getJSON(config, 'active/index', { gp : config.gp }, function(data){
                    cb && cb(data);
                });
            },
            save: function(cb){
                http.getJSON(config, 'active/saveplay', { gp : config.gp }, function(){
                    cb && cb();
                });
            },
            getcoupon: function(cb){
                http.getJSON(config, 'active/getcoupon', { gp : config.gp }, function(data){
                    cb && cb(data);
                });
            }
        };

        indexPage = new Vue({
            el: '#indexPage',
            data: {
                selfData: selfData,
                musicPlay: musicPlay,
                styles: {
                    bg: "background-image: url('" + selfData.index.index_bg + "')"
                },
            },
            methods: {
                init: function () {
                    var self = this;
                    selfDataInit(function () {
                        self.musicPlay = musicPlay;
                        self.judgeMusicPlay();
                        self.judgeFollow();
                        self.$el.style.display = 'block';
                        wxshare.init(config);
                        commonService.loadingHide();
                    });
                },
                judgePlayNum: function(){
                    // 判断游戏次数
                    if(selfData.maxplaynum !=0 && selfData.maxplaynum <= selfData.playnum){
                        // 已达最大游戏次数
                        commonService.alert('游戏次数已用完');
                        return false;
                    }else if(selfData.maxdayplaynum !=0 && selfData.maxdayplaynum <= selfData.todayplaynum){
                        // 已达每天最大游戏次数
                        commonService.alert('游戏次数已用完');
                        return false;
                    }
                    return true;
                },
                judgeMusicPlay: function () {
                    if(this.musicPlay){
                        if(typeof WeixinJSBridge == "object" && typeof WeixinJSBridge.invoke == "function") {
                            WeixinJSBridge.invoke('getNetworkType', {}, function (res) {
                                audioBg.play();
                            });
                        }else{
                            audioBg.play();
                        }
                    }else{
                        audioBg.pause();
                    }
                },
                toggleMusic: function (state) {
                    switch (state){
                        case 1:
                            this.musicPlay = true;
                            break;
                        case 0:
                            this.musicPlay = false;
                            break;
                    }
                    this.judgeMusicPlay();
                },
                judgeFollow: function(){
                    if(selfData.needfollow == 1){
                        if(selfData.isfollow == 0){
                            $('#followPage').show().find('img').attr('src', selfData.qrcodeurl);
                        }
                    }
                },
                judgeGameState: function(){
                    // 判断活动是否过期-不能玩游戏，查看奖品
                    if(selfData.isexpired == 1){
                        commonService.alert(selfData.text.expired_hint);
                        return false;
                    }
                    return true;
                },
                startHandle: function () {
                    if(!this.judgeGameState()){
                        return false;
                    }
                    if(!this.judgePlayNum()){
                        return false;
                    }
                    gamePage.init();
                    this.$el.style.display = 'none';
                },
                ruleHandle: function () {
                    rulePage.init();
                },
                prizeHandle: function () {
                    jumpUrl('prize.html');
                }
            }
        });

        rulePage = new Vue({
            el: '#rulePage',
            data: {
                selfData: selfData,
            },
            methods: {
                init: function () {
                    this.$el.style.display = 'block';
                },
                closeHandle: function () {
                    this.$el.style.display = 'none';
                },
                ruleConvert: function(str) {
                    // br表示换行
                    var textArr = str.split('br');
                    var html = '';
                    textArr.forEach(function(item, index, arr){
                        html += "<p>" + item + "</p>"
                    });
                    return html;
                }
            }
        });

        gamePage = new Vue({
            el: '#gamePage',
            data: {
                selfData: selfData,
                styles: {
                    bg: "background-image: url('" + selfData.game.game_bg + "')"
                },
                hintShow: true, // 提示页是否展示
                material: {     // 材料的初始状态
                    water: {limit: 20, curr: 25},
                    noodles: {limit: 20, curr: 25},
                },
                ball: [selfData.game.game_ball1, selfData.game.game_ball2, selfData.game.game_ball3,
                    selfData.game.game_ball4, selfData.game.game_ball5, selfData.game.game_ball6],
                madeArr: [],    // 制作的汤圆大小
                gap: 10,    // 增量
                rate: 12,    // 一个元宵的比例
                time_run: 5000, // ms
                noodles_opacity: 0,
                runArr: ['runBox_run1', 'runBox_run2', 'runBox_run3'],
                score: 0,   // 得分
                second: 60, // 倒计时
                timer: null,   // 倒计时定时器
                canTouch: true, // 是否可以触发
                gameover: false, // 游戏结束
            },
            methods: {
                init: function () {
                    this.$el.style.display = 'block';
                    this.score = 0;
                    this.gameover = false;
                    this.canTouch = true;
                    this.second = Number(selfData.text.second);
                    this.hintShow = true;
                    this.material = {     // 材料的初始状态
                        water: {limit: 20, curr: 25},
                        noodles: {limit: 20, curr: 25},
                    };
                    this.madeArr = [];
                    this.noodles_opacity = this.material.noodles.limit / 100;
                    $('.game_noodles').css('opacity', this.noodles_opacity);
                    this.materialUpdate();
                    this.$nextTick(function () {
                        document.getElementById('gamePage').addEventListener('touchmove', function (e) {
                            e.preventDefault();
                        }, false);
                    });
                    this.shake();
                },
                secondDown: function () {
                    var self = this;
                    this.timer = setInterval(function () {
                        if(self.second > 0){
                            self.second --;
                        }else{
                            score = self.score;
                            self.gameover = true;
                            clearInterval(self.timer);
                            self.out();
                            resultPage.init();
                        }
                    }, 1000);
                },
                knowHandle: function () {
                    this.hintShow = false;
                    this.secondDown();
                },
                materialHandle: function (type) {
                    if(!this.canTouch){
                        return false;
                    }
                    if(this.material[type].curr >= 100){
                        this.material[type].curr = 100;
                    }else{
                        if(this.material[type].curr - this.gap < 10){
                            this.material[type].curr = 100;
                        }else{
                            this.material[type].curr += this.gap;
                        }
                    }
                    if(type == 'noodles'){
                        if(this.noodles_opacity >= 1){
                            this.noodles_opacity = 1;
                        }else{
                            this.noodles_opacity += 0.1;
                        }
                        $('.game_noodles').css('opacity', this.noodles_opacity);
                    }
                    this.materialUpdate();
                },
                materialUpdate: function () {
                    $('.water').css('width', (100 - this.material.water.curr) + '%');
                    $('.noodles').css('width', (100 - this.material.noodles.curr) + '%');
                },
                shakeHandle: function () {
                    if(!this.canTouch){
                        return false;
                    }
                    if(this.material.water.curr - this.material.water.limit < this.rate){
                        $('.materialHint').text('请加水').show();
                        setTimeout(function () {
                            $('.materialHint').text('').hide();
                        }, 1500);
                        return false;
                    }else if(this.material.noodles.curr - this.material.noodles.limit < this.rate){
                        $('.materialHint').text('请加面').show();
                        setTimeout(function () {
                            $('.materialHint').text('').hide();
                        }, 1500);
                        return false;
                    }
                    // 开始制作汤圆
                    this.madeBall();
                },
                madeBall: function () {
                    this.canTouch = false;
                    var self = this;
                    var use = 0;
                    $('.madeBox').addClass('madeBox_run');
                    if(this.material.water.curr > this.material.noodles.curr){
                        use = this.material.noodles.curr - this.material.noodles.limit;
                    }else{
                        use = this.material.water.curr - this.material.water.limit;
                    }
                    this.materialReduce(use);
                    // 先将剩下的变大
                    this.madeArr.forEach(function (item, key, arr) {
                        if(item.lastscale < 1){
                            use -= (1 - item.lastscale) * self.rate;
                            item.lastscale = 1;
                            arr.splice(key, 1, item);
                        }
                    });
                    var num = Math.ceil(use / this.rate);
                    var num_rel = Number((use / this.rate).toFixed(1));
                    for(var i=0;i<num;i++){
                        var index = commonService.random(0, this.ball.length - 1); // 随机汤圆
                        var top = commonService.random(15, 85);
                        var left = commonService.random(28, 72);
                        var ball = this.ball[index];
                        var lastscale = 0;
                        if(num_rel - 1 > 0){
                            lastscale = 1;
                            num_rel --;
                        }else{
                            lastscale = Number(num_rel.toFixed(1));
                        }
                        this.madeArr.push({ball: ball, top: top, left: left, lastscale: lastscale, initscale: 0.1});
                    }
                    this.$nextTick(function () {
                        self.ballRun();
                    });
                },
                ballStyle: function (item) {
                    var top = 'top: ' + item.top + '%;';
                    var left = 'left: ' + item.left + '%;';
                    var width = 'width: ' + 40 * item.initscale + 'px;';
                    return top + left + width;
                },
                ballRun: function () {
                    var self = this;
                    var $arr = $('#gamePage').find('.game_ball');
                    var $runBox = $('#gamePage').find('.runBox');
                    var length = $arr.length;
                    for(var i=0;i<length;i++){
                        var $dom = $arr.eq(i);
                        var lastscale = $dom.data('lastscale');
                        $runBox.eq(i).addClass(this.runArr[commonService.random(0, this.runArr.length)]);
                        $dom.animate({width: 40 * lastscale + 'px'}, self.time_run, 'linear');
                    }
                    setTimeout(function () {
                        if(!self.gameover){
                            self.judgeNiceBall();
                        }
                    }, self.time_run + 1000);
                },
                judgeNiceBall: function () {
                    var self = this;
                    // 停止汤圆和工具的动画
                    $('#gamePage').find('.runBox').removeClass('runBox_run1');
                    $('#gamePage').find('.runBox').removeClass('runBox_run2');
                    $('#gamePage').find('.runBox').removeClass('runBox_run3');
                    $('.madeBox').removeClass('madeBox_run');
                    // 添加汤圆完成的动画
                    var $arr = $('#gamePage').find('.game_ball');
                    var length = $arr.length;
                    for(var i=0;i<length;i++){
                        var $dom = $arr.eq(i);
                        var lastscale = $dom.data('lastscale');
                        if(lastscale == 1){
                            $dom.addClass('complete_run');
                        }
                    }
                    // 更新汤圆数组
                    setTimeout(function () {
                        $('#gamePage').find('.game_ball').removeClass('complete_run');
                        var newArr = [];
                        self.madeArr.forEach(function (item, index, arr) {
                            if(item.lastscale != 1){
                                item.initscale = item.lastscale;
                                newArr.push(item);
                            }else{
                                self.score ++;
                            }
                        });
                        self.madeArr = [];
                        self.madeArr = newArr;
                    }, 500);
                },
                materialReduce: function (use) {
                    // 1、进度条减少 2、面粉减少
                    var self = this;
                    this.material.water.curr -= use;
                    this.material.noodles.curr -= use;
                    $('.water').animate({width: (100 - this.material.water.curr) + '%'}, this.time_run, 'linear');
                    $('.noodles').animate({width: (100 - this.material.noodles.curr) + '%'}, this.time_run, 'linear');
                    $('.game_noodles').animate({opacity: this.material.noodles.limit / 100}, this.time_run, 'linear', function () {
                        self.noodles_opacity = self.material.noodles.limit / 100;
                        self.canTouch = true;
                    });
                },
                shake: function(){
                    var self = this;
                    this.myShakeEvent = new Shake({
                        threshold: 15, // optional shake strength threshold
                        timeout: 1000 // optional, determines the frequency of event generation
                    });
                    this.myShakeEvent.start();
                    window.addEventListener('shake', self.shakeHandle, false);
                },
                removeShake: function(){
                    window.removeEventListener('shake', this.shakeHandle, false);
                    this.myShakeEvent.stop();
                    this.myShakeEvent = null;
                },
                out: function () {
                    $('#gamePage').find('.runBox').removeClass('runBox_run1');
                    $('#gamePage').find('.runBox').removeClass('runBox_run2');
                    $('#gamePage').find('.runBox').removeClass('runBox_run3');
                    $('.madeBox').removeClass('madeBox_run');
                    this.removeShake();
                },
            }
        });

        resultPage = new Vue({
            el: '#resultPage',
            data: {
                selfData: selfData,
                score: 0,
                state: 0,   //0-失败 1-成功 2-券用尽
            },
            mounted: function () {

            },
            methods: {
                init: function () {
                    this.score = score;
                    this.judgeResult();
                },
                judgeResult: function () {
                    var self = this;
                    var isSuccess = 0; // 是否挑战成功
                    if(this.score >= selfData.text.limit){
                        isSuccess = 1;
                    }
                    httpService.save(function () {
                        if(isSuccess){
                            httpService.getcoupon(function (data) {
                                switch (data.hasget){
                                    case 1:
                                        self.state = 1;
                                        break;
                                    case 0:
                                        self.state = 2;
                                        break;
                                }
                                self.$el.style.display = 'block';
                            });
                        }else{
                            self.state = 0;
                            self.$el.style.display = 'block';
                        }
                    });
                },
                textConvert: function(str) {
                    // str-文本字符串 br-换行 @-分数
                    str = str.replace(/@/, '<span>' + this.score + '</span>');
                    var html = '';
                    var textArr = str.split('br');
                    if(textArr.length == 1){
                        html = "<h2>" + textArr[0] + "</h2>";
                        return html;
                    }else{
                        html = "<h2>" + textArr[0] + "</h2>";
                        textArr.forEach(function (item, index) {
                            if(index != 0){
                                html += "<p>" + textArr[index] + "</p>";
                            }
                        });
                        return html;
                    }
                },
                againHandle: function () {
                    indexPage.init();
                    this.$el.style.display = 'none';
                },
                shareHandle: function () {
                    sharePage.init();
                }
            }
        });

        sharePage = new Vue({
            el: '#sharePage',
            data: {
                selfData: selfData,
            },
            methods: {
                init: function () {
                    this.$el.style.display = 'block';
                },
                closeHandle: function () {
                    this.$el.style.display = 'none';
                }
            }
        });

        function selfDataInit(cb){
            httpService.index(function (data) {
                selfData.title = data.cfg.title;
                selfData.rules = data.cfg.rules;
                selfData.isexpired = data.cfg.isend;
                selfData.maxplaynum = data.maxplaynum;
                selfData.maxdayplaynum = data.maxdayplaynum;
                selfData.playnum = data.playnum;
                selfData.todayplaynum = data.todayplaynum;
                selfData.needfollow = data.cfg.needfollow;
                selfData.isfollow  = data.isfollow;
                selfData.qrcodeurl = data.cfg.qrcodeurl;
                selfData.index.logo = data.cfg.activesetting.imgs.logo;
                config.shareInfo.title = data.cfg.sharetitle;
                config.shareInfo.desc = data.cfg.sharecontent;
                config.shareInfo.imgUrl = data.cfg.sharepic;
                /*$.each(data.cfg.activesetting.imgs, function(key, value){
                 if(selfData.index.hasOwnProperty(key)){
                 selfData.index[key] = value;
                 }
                 });*/
                $.each(data.cfg.activesetting.txts, function(key, value){
                    if(selfData.text.hasOwnProperty(key)){
                        selfData.text[key] = value;
                    }
                });
                $('head').find('title').text(selfData.title);
                cb && cb();
            })
        }

        commonService.loadingShow();
        commonService.oauth(config, function () {
            indexPage.init();
        })
    }
}());

