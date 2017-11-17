Vue.component('vue-nav', {
    template: '<nav>' +
    '<img v-show="hasBack==1" class="icon_back" v-on:touchend="historyHandle()" src="images/icon_back.png">' +
    '<span class="language">{{desc}}</span>' +
    '<img v-show="hasCart==1" class="icon_cart" v-on:touchend="jumpCart()" src="images/icon_cart.png">' +
    '</nav>',
    props: {
        hasBack: {
            default: 1
        },
        hasCart: {
            default: 0
        },
        desc: {},
        jumpNew: {  //是否跳到新页面，不返回历史页
            default: 0
        }
    },
    methods: {
        historyHandle: function(){
            if(this.jumpNew == 0){
                //如果跳到新页面，则不返回历史页【用于"创建订单"的步奏】
                window.history.go(-1);
            }
            //1、触发自定义事件【组件外部事件】【jumpnew为自定义的事件】
            //2、事件名全小写
            this.$emit('jumpnew');
        },
        jumpCart: function(){
            //跳转到购物车页面
            gotoUrl('cart.html');
        }
    }
});

Vue.component('vue-footer', {
    template: '<footer>' +
    '<ul class="tabBox">' +
    '<li v-on:touchend="jumpHandle($event, 0)">' +
    '<div>' +
    '<img src="images/icon_home_off.png"/>' +
    '<p class="language">首页</p>' +
    '</div>' +
    '<div class="active hide">' +
    '<img src="images/icon_home_on.png"/>' +
    '<p class="language">首页</p>' +
    '</div>' +
    '</li>' +
    '<li v-on:touchend="jumpHandle($event, 1)">' +
    '<div>' +
    '<img src="images/icon_store_off.png"/>' +
    '<p class="language">全部分类</p>' +
    '</div>' +
    '<div class="active hide">' +
    '<img src="images/icon_store_on.png"/>' +
    '<p class="language">全部分类</p>' +
    '</div>' +
    '</li>' +
    '<li v-on:touchend="jumpHandle($event, 2)">' +
    '<i v-show="cartNum != 0" class="cartNum">{{cartNum}}</i>' +
    '<div>' +
    '<img src="images/icon_cart_off.png"/>' +
    '<p class="language">购物车</p>' +
    '</div>' +
    '<div class="active hide">' +
    '<img src="images/icon_cart_on.png"/>' +
    '<p class="language">购物车</p>' +
    '</div>' +
    '</li>' +
    '<li v-on:touchend="jumpHandle($event, 3)">' +
    '<div>' +
    '<img src="images/icon_profile_off.png"/>' +
    '<p class="language">个人中心</p>' +
    '</div>' +
    '<div class="active hide">' +
    '<img src="images/icon_profile_on.png"/>' +
    '<p class="language">个人中心</p>' +
    '</div>' +
    '</li>' +
    '</ul>' +
    '<ul class="listBox">' +
        '<li v-on:touchend="jumpGoodList($event, item.name, item.id)" :class="setId(item.id)" ' +
    'v-for="item in cateArr" v-if="(item.goodsnum != 0) && (showAll == 1)" class="language">{{item.name}}</li>' +
        '<li v-on:touchend="jumpGoodList($event, item.name, item.id)" :class="setId(item.id)" ' +
    'v-for="item in cateArr" v-if="(item.goodsnum != 0) && (showAll == 0) && (item.id != 1) && (item.id != 2) && (item.id != 16)" class="language">{{item.name}}</li>' +
    '</ul>' +
    '</footer>',
    props: {
        index: {},  //index-从0开始，当前激活li的下标
        showAll: {
            default: 0
        },
        cartNum: {
            default: 0
        }, //购物车数量
        cateArr: {
            default: null
        }
    },
    mounted: function(){
        this.init();
    },
    updated: function () {
    },
    watch: {
        // showAll: function () {
        //     if(this.showAll == 1){
        //         $('.cate1').show();
        //         $('.cate2').show();
        //     }else{
        //         $('.cate1').hide();
        //         $('.cate2').hide();
        //     }
        // },
        // cateArr: function () {
        //     if(this.showAll == 1){
        //         $('.cate1').show();
        //         $('.cate2').show();
        //     }else{
        //         $('.cate1').hide();
        //         $('.cate2').hide();
        //     }
        // }
    },
    methods: {
        init: function(){
            $(this.$el).find('li').eq(this.index).find('div').hide();
            $(this.$el).find('li').eq(this.index).find('div.active').show();
            // if(this.showAll == 1){
            //     $('.cate1').show();
            //     $('.cate2').show();
            // }else{
            //     $('.cate1').hide();
            //     $('.cate2').hide();
            // }
        },
        jumpHandle: function(event, pageIndex){
            var target = event.currentTarget;
            $(target).siblings().find('div').show();
            $(target).siblings().find('div.active').hide();
            $(target).find('div').hide();
            $(target).find('div.active').show();
            switch (pageIndex){
                case 0:
                    gotoUrl('index.html');
                    break;
                case 1:
                    //盒子弹出
                    var hasRun = $('.listBox').hasClass('list_run');
                    if(hasRun){
                        $('.listBox').removeClass('list_run');
                    }else{
                        $('.listBox').addClass('list_run');
                    }
                    break;
                case 2:
                    gotoUrl('cart.html');
                    break;
                case 3:
                    gotoUrl('profile.html');
                    break;
            }
        },
        jumpGoodList: function(event, name, category_id){
            var target = event.currentTarget;
            $('.listBox').find('.active').removeClass('active');
            $(target).addClass('active');
            gotoUrl('good-list.html' + '?name=' + name + '&category_id=' + category_id);
        },
        setId: function (id) {
            return 'cate' + id;
        }
    }
});