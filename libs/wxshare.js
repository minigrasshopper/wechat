(function(global,factory){
	if(typeof define === 'function' && define.amd){
		define(['wx'],function(wx){
			return factory(wx,global);
		});
	}else if(typeof module !== 'undefined' && module.exports){
		module.exports = factory(require('wx'), require('oAuth'), require('ngapi'),global);
	}else{
		global.ngapi = factory(global.wx,global.oAuth,global.ngapi,global);
	}
}(typeof window !== 'undefined' ? window : this,function(wx,window){
	/**
	 * 用于微信分享
	 */
	var wxshare = window.wxshare = {
		times: 0,
		wxconfig: null,
		/**
		 * 以api的形式请求服务器有关微信JSSDK的相关信息，
		 * @param {Object} share	用于分享的信息 ：{title:'title',desc:'desc',link:'link',imgUrl:'imgUrl'},分享到朋友圈分享的是desc
		 * @param {Object} letwxid  等同于gameid或者gid
		 * @param {Object} apiopenid
		 * @param {Object} apitoken
		 * @param {Object} succCb     分享成功的回调
		 * @param {Object} cancelCb   取消分享的回调
		 * @param {errorCb} errorCb	     出现错误的回调
		 */
		initWx : function(share, letwxid, apiopenid, apitoken, succCb, cancelCb, errorCb,readyCb){
			var me = this;
			if(me.times == 0){
				M.ajax('jscfg', {
					url: window.location.href
				}, letwxid, function(data) {
					console.log('jscfg:'+JSON.stringify(data));
					var error = parseInt(data.error);
					if (error == 0) {
						me.times++;
						me.wxconfig = data.cfg;
						me.initWxCfg(share, letwxid, apiopenid, apitoken, me.wxconfig, succCb, cancelCb, errorCb,readyCb);
					} else {
						alert(data.error_msg);
					}
				}, apiopenid, apitoken,'nf');
			}else{
				me.initWxCfg(share, letwxid, apiopenid, apitoken,  me.wxconfig, succCb, cancelCb, errorCb,readyCb);
			}
		},
		initWxCfg : function(share, letwxid, apiopenid, apitoken, wxconfig, succCb, cancelCb, errorCb, readyCb){
			var me = this;
			console.log(wxconfig);
			wx.config({
				appId: wxconfig.appId,
				timestamp: wxconfig.timestamp,
				nonceStr: wxconfig.nonceStr,
				signature: wxconfig.signature,
				jsApiList: [
					'onMenuShareTimeline',
					'onMenuShareAppMessage',
					'onMenuShareQQ',
					'onMenuShareWeibo',
					'hideOptionMenu',
					'showOptionMenu',
					'getLocalImgData',
					'chooseImage',
					'downloadImage',
					'uploadImage',
					'startRecord',
					'stopRecord',
					'playVoice',
					'uploadVoice',
					'downloadVoice'
				]
			});
			wx.ready(function() {
				readyCb && readyCb(wx);
				wx.onMenuShareAppMessage({ //朋友
					title: share.title,
					desc: share.desc,
					link: share.link,
					imgUrl: share.imgUrl,
					success: function() {
						succCb && succCb();
						me.statics('sharefriend',letwxid, apiopenid, apitoken);
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
						succCb && succCb();
						me.statics('sharetimeline',letwxid, apiopenid, apitoken);
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
						succCb && succCb();
						me.statics('QQ',letwxid, apiopenid, apitoken);
					},
					cancel: function() {
						cancelCb && cancelCb();
					}
				});
				wx.onMenuShareWeibo({ //QQ
					title: share.title,
					desc: share.desc,
					link: share.link,
					imgUrl: share.imgUrl,
					success: function() {
						succCb && succCb();
						me.statics('tencentWeibo',letwxid, apiopenid, apitoken);
					},
					cancel: function() {
						cancelCb && cancelCb();
					}
				});
			});
			wx.error(function(res) {
				console.error('jscfg error:'+JSON.stringify(res));
				errorCb && errorCb(JSON.stringify(res));
			});
		},
        chooseImg : function(chooseImg, succCb, cancelCb){
            wx.chooseImage({
                count: chooseImg.count, // 设置只能选择一张照片
                sizeType: chooseImg.sizeType, // 可以指定是原图还是压缩图，默认二者都有
             	sourceType: chooseImg.sourceType, // 可以指定来源是相册还是相机，默认二者都有
                success: function(res) {
                    succCb && succCb(res);
                },
                cancel: function() {
                    cancelCb && cancelCb();
                }
            });
        },
        getLocalImg: function(localId,cb){
        	wx.getLocalImgData({
				localId:localId, // 图片的localID
				success: function(res) {
				    // localData是图片的base64数据，可以用img标签显示
				    cb && cb(res);
				}
			})
        },
        uploadImg:function(localId,succCb){
        	wx.uploadImage({
        		localId:localId,
        		isShowProgressTips:1,
        		success:function(res){
        			succCb && succCb(res);
        		}
        	})
        },
        startRecord:function(){
        	wx.startRecord();
        },
        stopRecord:function(succCb){
        	wx.stopRecord({
        		success:function(res){
        			succCb && succCb(res)
        		}
        	})
        },
        playVoice:function(localId){
        	wx.playVoice({
        		localId:localId // 需要播放的音频的本地ID，由stopRecord接口获得
        	})
        },
        uploadVoice:function(localId,succCb){
        	wx.uploadVoice({
        		localId:localId,// 需要上传的音频的本地ID，由stopRecord接口获得
	        	isShowProgressTips:0,//默认为1，显示进度提示
	        	success:function(res){
	        		// 返回音频的服务器端ID
	        		succCb && succCb(res);
	        	}
        	})
        },
        downloadVoice:function(serverId,succCb){
        	wx.downloadVoice({
        		serverId:serverId,
        		isShowProgressTips:0,//默认为1，显示进度提示
        		success:function(res){
        			//返回音频的本地id
        			succCb && succCb(res);
        		}
        	})
        },
        downloadImg:function(serverId,succCb){
        	wx.downloadImage({
			    serverId: serverId, // 需要下载的图片的服务器端ID，由uploadImage接口获得
			    isShowProgressTips: 1, // 默认为1，显示进度提示
			    success: function (res) {
	        		succCb && succCb(res);
	    		}
			});
        },

		statics : function(to, letwxid ,apiopenid, apitoken){
			var me = this;
			var channel = 'active_'+letwxid+'_'+me.getUrlParam().gp;
			if(me.getUrlParam().gp == undefined){
				channel = 'hd_wxfollow_' + letwxid + '_' + me.getUrlParam().gid;
			}
			M.ajax('statics', {
    			channel: channel,
    			evtkey: me.getPageName() + '--' + to,
				gp: me.getUrlParam().gp,
				gid: me.getUrlParam().gid
			}, letwxid, null, apiopenid, apitoken,'nf');
		},
		getUrlParam :function(url){
		    var str = url;
		    var jinghao = 0; //存放'#'的位置
		    var jinghaoyu = null; //存放'#'后面第一个'&'的位置
		    if (!str) str = window.location.href;
		    while (str.indexOf('#') > -1) { //以防url中出现多个'#'
		        jinghao = str.indexOf('#', jinghao + 1);
		        var jinghaostr = str.substr(jinghao);
		        if (jinghaostr.indexOf('&') > -1) {
		            jinghaoyu = jinghaostr.indexOf('&');
		        } else {
		            jinghaoyu = jinghaostr.length;
		        }
		        str = str.replace(str.substr(jinghao, jinghaoyu), '');
		    }
		    //		str = str.replace("#rd", ""); //微信阅读原文的url中会出现#rd
		    //		str = str.split("#")[0];
		    var obj = new Object();
		    if (str.indexOf('?') > -1) {
		        var string = str.substr(str.indexOf('?') + 1);
		        var strs = string.split('&');
		        for (var i = 0; i < strs.length; i++) {
		            var tempArr = strs[i].split('=');
		            obj[tempArr[0]] = tempArr[1];
		        }
		    }
		    return obj;
		},

		getPageName : function(){
			var url = window.location.href,
				length = url.length,
				index = url.lastIndexOf('/'),
				subName = url.substr(index+1),
				indexP = subName.indexOf('.')!=-1 ? subName.indexOf('.') : subName.indexOf('?'),
				name = subName.substr(0,indexP);
			return name;
		}
	}

	return wxshare;
}));
