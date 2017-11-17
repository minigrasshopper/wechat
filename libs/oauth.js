/**
 * Created by GH on 2015/8/26.
 */
(function(global,factory){
    if(typeof define === 'function' && define.amd){ //AMD
        define(function(){
            return factory(global);
        });
    }else if(typeof module !== 'undefined' && module.exports){ //cmd
        module.exports = factory(global);
    }else {
        global.oAuth = factory(global);
    }
}(typeof window !== 'undefined' ? window : this,function(window){
	var pre = 'q'; //apitoken、apiopenid前缀，代表平台
    if(typeof PLATFORM !== 'undefined') pre = PLATFORM;
    var config = config || {},
        apitoken,apiopenid,
        KEY_API_TOKEN = pre + '_apitoken',
        KEY_API_OPENID = pre + '_apiopenid',
        KEY_SERVER_REDIRECT = 'm_redirect',
        KEY_TIMESTAMP = pre + '_m_time',
        OAUTH_URL;
    var oAuth = window.oAuth = {
        cfg:function(gameid,isdebug,scope){
            var dateStamp = (new Date()).getTime(),
            scope = scope || 'snsapi_base';//snsapi_base,snsapi_userinfo
            KEY_API_TOKEN += '_' + gameid; //
            KEY_API_OPENID += '_' + gameid;
            KEY_TIMESTAMP += '_' + gameid;
            //设置各平台的oauthurl
            switch(pre){
                case 'ng':
                case 'fumao':
                    OAUTH_URL = 'http://'+pre+'.letwx.com/oauth/'+(isdebug?'apitest':'api')+'?scope='+ scope +'&letwxid='+ gameid +'&redirect=';
                    apitoken = 'apitoken';
                    apiopenid = 'letwxauthid';
                    break;
                case 'lppz':
                    OAUTH_URL = 'http://lppz.letwx.com/oauth/'+(isdebug?'lppztest':'lppz')+'?scope=' + scope + '&gameid=' + gameid + '&redirect=';
                    apitoken = 'apitoken';
                    apiopenid = 'apiopenid';
                    break;
                case 'q':
                    if(isdebug) {
                        OAUTH_URL = 'http://q.letwx.com/oauth/apitest?scope='+ scope +'&uid='+ gameid +'&redirect=';
                    }else {
                        // if(gameid==1){
                        //     OAUTH_URL = 'http://q.letwx.com/oauth/coupon?scope='+ scope +'&uid='+ gameid +'&redirect=';
                        // }else{
                            OAUTH_URL = window.OAUTH_URL = 'http://q.letwx.com/oauth/api?scope='+ scope +'&uid='+ gameid +'&redirect=';
                        // }
                    }
                    apitoken = 'wxapitoken';
                    apiopenid = 'wxapiopenid';
                    break;
            }
        },
        checkToken:function(cb){
            var me = this,
                loc = window.location,
                oAuthURLTMP = OAUTH_URL + encodeURIComponent(loc.origin + loc.pathname + loc.search),
                obj = me.getUrlParam(); //'wxfromerror'表示微信分享错误
            
            if(obj.from && obj.wxfromerror){ //微信分享出错且url中有from参数，此时走授权流程
                oAuthURLTMP.replace(apiopenid,apiopenid+'2').replace(apitoken,apitoken+'2').replace('wxfromerror','wxfromerror2');
                me.goAuth(oAuthURLTMP);
            }else{
                //判断url中是否存在apitoken/apiopenid
                if(obj[apitoken] && obj[apiopenid]){ //存在，保存到cookie中
                    if(me.getCookie(KEY_API_TOKEN) != obj.apitoken) 
                        me.setCookie(KEY_TIMESTAMP,(new Date()).getTime(),2);

                    me.setCookie(KEY_API_TOKEN,obj[apitoken],2);
                    me.setCookie(KEY_API_OPENID,obj[apiopenid],2);
                    
                    config.apiopenid = obj[apiopenid];
                    config.apitoken = obj[apitoken];
                    cb && cb(config.apiopenid,config.apitoken);
                }else if(me.getCookie(KEY_API_OPENID) && me.getCookie(KEY_API_TOKEN)){ //apiopenid、apitoken存在在cookie中
                    var time = me.getCookie(KEY_TIMESTAMP),
                        timestamp = (new Date()).getTime();
                    if(time && (timestamp-parseInt(time))<1.5*3600*1000){ //apiopenid存储时间小于1.5小时
                        config.apiopenid = me.getCookie(KEY_API_OPENID);
                        config.apitoken = me.getCookie(KEY_API_TOKEN);
                        cb && cb(config.apiopenid,config.apitoken);
                    }else me.goAuth(oAuthURLTMP);
                }else{ //进入授权逻辑
                    me.goAuth(oAuthURLTMP);
                }
            }
        },
        goAuth:function(url){
			window.location.href = url;
            setTimeout(function(){
                window.location.href = url;
            },200);
        },
        getUrlParam:function(){
            var str = window.location.search,
            arrTmp = [],
            obj = {};
            if(str.indexOf('?')>-1){
                str = str.substr(1);
                arrTmp = str.split('&');
                for(var i=0;i<arrTmp.length;i++){
                    var tempArr = arrTmp[i].split('=');
                    obj[tempArr[0]] = decodeURIComponent(tempArr[1]);
                }
            }
            return obj;
        },
        getAuthId:function() {
            return this.getCookie(KEY_API_OPENID);
        },

        getAuthToken:function() {
            return this.getCookie(KEY_API_TOKEN);
        },

        clear:function() {
            this.delCookie(KEY_API_TOKEN);
            this.delCookie(KEY_API_OPENID);
            this.delCookie(KEY_TIMESTAMP);
        },
        setCookie:function(name, value, hours) {
            var exdate = new Date();
            exdate.setTime(exdate.getTime() + parseFloat(hours) * 3600 * 1000);
            document.cookie = name + '=' + escape(value) + ((hours == null) ? '' : ';expires=' + exdate.toGMTString());
        },
        getCookie:function(name) {
            var arr, reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
            if (arr = document.cookie.match(reg))
                return (arr[2]);
            else
                return null;
        },
        delCookie:function(name) {
            var exp = new Date();
            exp.setTime(exp.getTime() - 1);
            var cval = this.getCookie(name);
            if (cval != null)
                document.cookie = name + '=' + cval + ';expires=' + exp.toGMTString();
        }
    }
    //oAuth.cfg(config.gameid,config.isDebug,config.scope);
    //oAuth.checkToken();
    return oAuth;
}));

