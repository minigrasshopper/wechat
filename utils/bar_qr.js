(function (factory) {
    define(['barcode', 'qrcode'], function (barcode, qrcode) {
        return factory(barcode, qrcode);
    });
}(function (barcode, qrcode) {
    function Bar_qr(){}
    Bar_qr.fn = Bar_qr.prototype = {
        barcode: function ($dom, text) {
            // 条形码
            $dom.html('');
            $dom.barcode(text, 'code128', {
                barWidth: 4,
                barHeight: 120,
                output: 'bmp'
            });
        },
        qrcode: function ($dom, text) {
            // 二维码
            $dom.html('');
            $dom.qrcode({
                "render": "image",
                "size": 100,
                "color": "#3a3",
                "text": text
            });
        }
    };
    return new Bar_qr();
}));
