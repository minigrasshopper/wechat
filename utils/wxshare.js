(function (factory) {
    define(['http', 'wx'], function (http, wx) {
        return factory(http, wx);
    });
}(function (http, wx) {
    function Wxshare() {}
    Wxshare.fn = Wxshare.prototype = {
        init: function(config, succCb, cancelCb, errorCb){
            var params = {url: encodeURIComponent(window.location.href)};
            http.getJSON(config, 'jscfg', params, data => {
                this.wxConfig(data.cfg, config.shareInfo, succCb, cancelCb, errorCb);
            });
        },
        wxConfig(wxconfig, share, succCb, cancelCb, errorCb){
            wx.config({
                debug: false,
                appId: wxconfig.appId,
                timestamp: wxconfig.timestamp,
                nonceStr: wxconfig.nonceStr,
                signature: wxconfig.signature,
                jsApiList: [
                    'onMenuShareTimeline',
                    'onMenuShareAppMessage',
                    'onMenuShareQQ',
                    'onMenuShareWeibo'
                ]
            });
            wx.ready(function() {
                wx.onMenuShareAppMessage({ //朋友
                    title: share.title,
                    desc: share.desc,
                    link: share.link,
                    imgUrl: share.imgUrl,
                    success: function() {
                        succCb && succCb('timeline');
                    },
                    cancel: function() {
                        cancelCb && cancelCb();
                    }
                });
                wx.onMenuShareTimeline({ //朋友圈
                    title: share.desc,
                    link: share.link,
                    imgUrl: share.imgUrl,
                    success: function() {
                        succCb && succCb('appmessage');
                    },
                    cancel: function() {
                        cancelCb && cancelCb();
                    }
                });
                wx.onMenuShareQQ({ //QQ
                    title: share.title,
                    desc: share.desc,
                    link: share.link,
                    imgUrl: share.imgUrl,
                    success: function() {
                        succCb && succCb('qq');
                    },
                    cancel: function() {
                        cancelCb && cancelCb();
                    }
                });
                wx.onMenuShareWeibo({ //weibo
                    title: share.title,
                    desc: share.desc,
                    link: share.link,
                    imgUrl: share.imgUrl,
                    success: function() {
                        succCb && succCb('weibo');
                    },
                    cancel: function() {
                        cancelCb && cancelCb();
                    }
                });
            });
            wx.error(function(res) {
                console.log(res);
                errorCb && errorCb(JSON.stringify(res));
            });
        }
    };
    return new Wxshare();
}));
