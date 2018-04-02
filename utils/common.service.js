(function (factory) {
    define(['weui', 'oauth', 'css'], function (weui, oauth, css) {
        return factory(weui, oauth, css);
    });
}(function (weui, oauth, css) {
    css.init();
    function CommonService() {}

    CommonService.fn = CommonService.prototype = {
        oauth: function (config, cb) {
            var self = this;
            oauth.cfg(config.uid, config.isDebug, config.scope);
            oauth.checkToken(function(apiopenid, apitoken) {
                config.apiopenid = apiopenid;
                config.apitoken = apitoken;
                cb && cb();
            }, function() {
                self.alert('授权失败', function () {
                    window.location.reload();
                });
            });
        },
        loadingShow: function () {
            loadmore = document.createElement('div');
            loadmore.className = 'loadingBox';
            loadmore.style.background = 'rgba(255,255,255,0.8)';
            loadmore.style.position = 'fixed';
            loadmore.style.zIndex = '9999';
            loadmore.style.width = "100%";
            loadmore.style.height = "100%";
            loadmore.style.left = '0';
            loadmore.style.top = '0';
            document.body.appendChild(loadmore);
            var div = document.createElement('div');
            div.style.background = 'rgba(0,0,0,0.68)';
            div.style.position = 'absolute';
            div.style.left = '50%';
            div.style.top = '50%';
            div.style.width = '36%';
            div.style.paddingTop = '36%';
            div.style.transform = 'translateX(-50%) translateY(-50%)';
            div.style.webkitTransform = 'translateX(-50%) translateY(-50%)';
            div.style.borderRadius = '6px';
            loadmore.appendChild(div);
            var i = document.createElement('i');
            i.className = 'weui-loading';
            i.style.position = 'absolute';
            i.style.top = 'calc(50% - 36px)';
            i.style.left = 'calc(50% - 18px)';
            i.style.width = '36px';
            i.style.height = '36px';
            div.appendChild(i);
            var p = document.createElement('p');
            p.style.position = 'absolute';
            p.style.top = '50%';
            p.style.left = '0';
            p.style.width = '100%';
            p.style.textAlign = 'center';
            p.innerHTML = 'Loading';
            p.style.color = '#fafafa';
            p.style.marginTop = '6px';
            div.appendChild(p);
        },
        loadingHide: function () {
            $('.loadingBox').remove();
        },
        tips: function (text, type) {
            // type: success,error,warning
            !type && (type = 'error');
            $.toptip(text, 2000, type);  //设置显示时间
        },
        alert: function (text, cb) {
            $.alert({
                title: '提示',
                text: text,
                onOK: function () {
                    cb && cb();
                }
            });
        },
        random: function(min,max){
            return Math.floor(min + Math.random() * (max - min));
        },
        confirm: function (text, okCb, cancelCb) {
            $.confirm({
                title: '提示',
                text: text,
                onOK: function () {
                    okCb && okCb();
                },
                onCancel: function () {
                    cancelCb && cancelCb();
                }
            });
        },
        testMobile: function (str) {
            // 验证手机号码
            var str = $.trim(str);
            var reg = /^1[34578]\d{9}$/;
            if (!str) {
                this.tips('请输入手机号码');
                return false;
            } else if (!reg.test(str)) {
                this.tips('手机号码错误');
                return false;
            }
            return true;
        },
        testTel: function (str) {
            // 验证电话号码
            var str = $.trim(str);
            var integer1 = /^(0|86|17951)?(13[0-9]|15[012356789]|17[01678]|18[0-9]|14[57])[0-9]{8}$/;
            var integer2 = /^(0[0-9]{2,3}\-)([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$/;
            if (!str) {
                $.alert('请输入电话号码');
                return false;
            } else if (!integer1.test(str) && !integer2.test(str)) {
                $.alert('电话号码错误');
                return false;
            }
            return true;
        },
        isCardID: function (sId) {
            // 验证身份证号码
            var aCity = {
                11: "北京", 12: "天津", 13: "河北", 14: "山西", 15: "内蒙古", 21: "辽宁", 22: "吉林", 23: "黑龙江",
                31: "上海", 32: "江苏", 33: "浙江", 34: "安徽", 35: "福建", 36: "江西", 37: "山东", 41: "河南", 42: "湖北", 43: "湖南",
                44: "广东", 45: "广西", 46: "海南", 50: "重庆", 51: "四川", 52: "贵州", 53: "云南", 54: "西藏", 61: "陕西", 62: "甘肃",
                63: "青海", 64: "宁夏", 65: "新疆", 71: "台湾", 81: "香港", 82: "澳门", 91: "国外"
            };
            var iSum = 0;
            var info = "";
            if (!sId) {
                $.alert("请输入身份证号");
                return false;
            }
            if (!/^\d{17}(\d|x)$/i.test(sId)) {
                $.alert("身份证长度或格式错误");
                return false;
            }
            sId = sId.replace(/x$/i, "a");
            if (aCity[parseInt(sId.substr(0, 2))] == null) {
                $.alert("身份证地区非法");
                return false;
            }
            var sBirthday = sId.substr(6, 4) + "-" + Number(sId.substr(10, 2)) + "-" + Number(sId.substr(12, 2));
            var d = new Date(sBirthday.replace(/-/g, "/"));
            if (sBirthday != (d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate())) {
                $.alert("身份证上的出生日期非法");
                return false;
            }
            for (var i = 17; i >= 0; i--) {
                iSum += (Math.pow(2, i) % 11) * parseInt(sId.charAt(17 - i), 11);
            }
            if (iSum % 11 != 1) {
                $.alert("身份证号非法");
                return false;
            }
            return true;
        }
    };
    return new CommonService();
}));
