// 备注：baseUrl + paths的拼串路径是相对于html而言的
// 小马扎 2018-01-15

requirejs.config({
    baseUrl: '../utils/',
    paths: {
        jquery: 'https://cdn.bootcss.com/jquery/1.11.0/jquery.min',
        weui: 'https://cdn.bootcss.com/jquery-weui/1.2.0/js/jquery-weui.min',
        wx: 'http://res.wx.qq.com/open/js/jweixin-1.2.0',
        vue: 'vue.min',
        pinyin: 'pinyin',
        JSONP: 'jsonp',
        barcode: 'jquery-barcode.min',  // 条形码
        qrcode: 'jquery-qrcode.min',    // 二维码
        bar_qr: 'bar_qr',
        snow: 'jquery-let_it_snow',
        commonService: 'common.service',
        http: 'http',
        oauth: 'oauth',
        wxshare: 'wxshare',
        css: 'css',
        swiper: 'swiper-4.1.0.min',
        html2canvas: 'html2canvas',
        shake: 'shake',
        vconsole: 'vconsole'
    },
    shim: {
        weui: {
            deps: ['jquery'],
            exports: 'weui'
        },
        barcode:{
            deps: ['jquery'],
            exports: 'barcode'
        },
        qrcode:{
            deps: ['jquery'],
            exports: 'qrcode'
        },
        snow: {
            deps: ['jquery'],
            exports: 'snow'
        }
    }
});
