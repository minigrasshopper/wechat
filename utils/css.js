(function (factory) {
    define([], function () {
        return factory();
    });
}(function () {
    function Css () {
        this.styleArr = [
            'https://cdn.bootcss.com/weui/1.1.2/style/weui.min.css',
            'https://cdn.bootcss.com/jquery-weui/1.2.0/css/jquery-weui.min.css',
            'https://cdnjs.cloudflare.com/ajax/libs/Swiper/4.1.0/css/swiper.min.css',
        ];
    }
    Css.fn = Css.prototype = {
        init: function () {
            this.styleArr.forEach(function (item, index, arr) {
                var link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = item;
                document.getElementsByTagName('head')[0].appendChild(link);
            })
        }
    };
    return new Css();
}));

