Vue.component('vue-footer', {
    template: `<ul class="footer">
            <li v-on:click="toggleJump(1)" :class="index==1?'selected':''">
                <div class="abs-center">
                    <i class="iconfont icon-rank"></i>
                    <p>女神榜</p>
                </div>
            </li>
            <li v-on:click="toggleJump(2)" :class="index==2?'selected':''">
                <div class="abs-center">
                    <i class="iconfont icon-sign"></i>
                    <p>我要报名</p>
                </div>
            </li>
            <li v-on:click="toggleJump(3)" :class="index==3?'selected':''">
                <div class="abs-center">
                    <i class="iconfont icon-rule"></i>
                    <p>活动详情</p>
                </div>
            </li>
            <li v-on:click="toggleJump(4)" :class="index==4?'selected':''">
                <div class="abs-center">
                    <i class="iconfont icon-prize"></i>
                    <p>我的奖品</p>
                </div>
            </li>
        </ul>`,
    props: {
        index_in: {
            default: 1,
        }
    },
    data: function(){
        return {
            index: 1
        }
    },
    mounted: function(){
        this.init();
    },
    methods: {
        init: function(){
            this.index = this.index_in;
        },
        toggleJump: function (index) {
            this.index = index;
            switch (index){
                case 1:
                    jumpUrl('index.html');
                    break;
                case 2:
                    jumpUrl('sign.html');
                    break;
                case 3:
                    jumpUrl('rule.html');
                    break;
                case 4:
                    jumpUrl('prize.html');
                    break;
            }
        }
    }
});