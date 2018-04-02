(function () {
    requirejs([config.configUrl], function () {
        requirejs(['vue', 'commonService', 'wxshare', 'swiper', 'html2canvas'], requireCb);
    });

    function requireCb(Vue, commonService, wxshare, Swiper, html2canvas) {
        // 当触发input框时，优化界面
        var viewH = document.documentElement.clientHeight || document.body.clientHeight;
        $('section').height(viewH);

        var audioBg = $('#audioBg')[0];
        function playAudio(audio) {
            if(typeof WeixinJSBridge == "object" && typeof WeixinJSBridge.invoke == "function") {
                WeixinJSBridge.invoke('getNetworkType', {}, function (res) {
                    audio.play();
                });
            }else{
                audio.play();
            }
        }
        playAudio(audioBg);
        var viewport = new Vue({
            el: 'section',
            data: {
                showArr: [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],
                pageArr: ['.onePage','.twoPage','.threePage','.fourPage','.fivePage','.sixPage'],
                btnArr: [0,0,0,0,0,0],
                icoArr: [
                    ['images/ico10.png', 'images/ico11.png', 'images/ico12.png', 'images/ico13.png'],
                    ['images/ico20.png', 'images/ico21.png', 'images/ico22.png', 'images/ico23.png'],
                    ['images/ico30.png', 'images/ico31.png', 'images/ico32.png', 'images/ico33.png'],
                    ['images/ico40.png', 'images/ico41.png', 'images/ico42.png', 'images/ico43.png'],
                    ['images/ico50.png', 'images/ico51.png', 'images/ico52.png', 'images/ico53.png'],
                    ['images/ico60.png', 'images/ico61.png', 'images/ico62.png', 'images/ico63.png'],
                ],
                index: 0,   // 当前的场景下标
                isShare: getUrlParams().info ? true : false,
                isPaper: 0, // 是否生成壁纸
                info: {
                    index: null,
                    text: null
                }
            },
            mounted: function () {

            },
            watch: {
                index: function () {
                    this.togglePage();
                }
            },
            methods: {
                init: function () {
                    var self = this;
                    this.$nextTick(function () {
                        var mySwiper = new Swiper('.swiper-container', {
                            autoplay: false,    // 可选选项，自动滑动
                            on: {
                                slideChangeTransitionEnd: function(){
                                    self.index = this.realIndex;
                                }
                            },
                            navigation: {
                                nextEl: '.swiper-button-next',
                                prevEl: '.swiper-button-prev',
                            },
                        });
                        if(!self.isShare){
                            // 主页进入
                            $('.hintBox').show();
                            wxshare.init(config);
                            $(self.pageArr[self.index]).show();
                        }else{
                            var info = JSON.parse(decodeURI(getUrlParams().info));
                            self.index = info.index;
                            var page = self.pageArr[self.index];
                            $('.swiper-button-prev').hide();
                            $('.swiper-button-next').hide();
                            mySwiper.slideTo(self.index, 500, false);   //切换到第一个slide，速度为1秒
                            mySwiper.detachEvents();    // 移除所有事件监听
                            self.showArr.splice(self.index, 1, [1,1,1,1]);
                            self.btnArr = [1,1,1,1,1,1];
                            $(page).find('textarea').hide();
                            $(page).find('pre').show().html(info.text);
                            config.shareInfo.link = config.baseUrl + 'index.html?&info=' + encodeURI(JSON.stringify(info));
                            config.shareInfo.imgUrl = config.baseUrl + 'images/share_show' + (info.index + 1) + '.png';
                            wxshare.init(config);
                        }
                        commonService.loadingHide();
                    });
                },
                shareHandle: function (index) {
                    this.info.index = index + '';
                    this.info.text = $(this.pageArr[index]).find('.textBox').find('textarea').val();
                    config.shareInfo.link = config.baseUrl + 'index.html?&info=' + encodeURI(JSON.stringify(this.info));
                    config.shareInfo.imgUrl = config.baseUrl + 'images/share_show' + (index + 1) + '.png';
                    wxshare.init(config);
                    $('.shareBox').show();
                },
                homeHandle: function () {
                    jumpUrl(config.baseUrl + 'index.html');
                },
                canvasHandle: function (index) {
                    this.isPaper = 1;
                    $('.paperBox').show().find('img').attr('src', '');
                    var page = this.pageArr[index];
                    commonService.loadingShow();
                    html2canvas($(page)[0]).then(canvas => {
                        var imgUri = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"); // 获取生成的图片的url
                        $('.paperBox').find('img').attr('src', imgUri);
                        commonService.loadingHide();
                    });
                },
                closePaper: function () {
                    this.isPaper = 0;
                    $('.paperBox').hide();
                },
                shareClose: function () {
                    $('.shareBox').hide();
                },
                toggleSelect: function (key) {
                    var item = this.showArr[this.index];
                    item[key] = item[key] == 1 ? 0 : 1;
                    this.showArr.splice(this.index, 1, item);
                    this.judgeBtnShow();
                },
                judgeBtnShow: function () {
                    // 素材全部选择后展示按钮
                    var self = this;
                    this.showArr.forEach(function (item, index) {
                        var isShow = true;
                        item.forEach(function (v, i) {
                            if(v == 0){
                                isShow = false;
                            }
                        });
                        if(isShow){
                            self.btnArr.splice(index, 1, 1);
                        }else{
                            self.btnArr.splice(index, 1, 0);
                        }
                    })
                },
                togglePage: function () {
                    $('.page').hide();
                    $(this.pageArr[this.index]).show();
                },
                closeHandle: function () {
                    $('.controlBox').removeClass('controlBox_in').addClass('controlBox_out');
                    setTimeout(function () {
                        $('.editBtn').show();
                    }, 1000);
                },
                openHandle: function () {
                    $('.controlBox').removeClass('controlBox_out').addClass('controlBox_in');
                    $('.editBtn').hide();
                },
                knowHandle: function () {
                    $('.hintBox').hide();
                    $('.controlBox').show().addClass('controlBox_in');
                }
            }
        });

        commonService.loadingShow();
        viewport.init();
    }
}());

