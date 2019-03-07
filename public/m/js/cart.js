$(function () {
    // ajax发请求获取购物车数据
    $.ajax({
        url: '/cart/queryCart',
        success: function (obj) {
            // 生成并渲染模板到页面
            console.log(obj);
            var html = template('queryCartTpl',{list:obj});
            $('.cart-list').html(html);
            // 渲染完成后初始化内容滚动
            mui('.mui-scroll-wrapper').scroll({
                deceleration: 0.0006 // 阻尼系数,系数越小滑动越灵敏
            })
        }
    })
})