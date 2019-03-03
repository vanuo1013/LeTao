$(function () {
    // ajax请求数据渲染左侧分类列表
    $.ajax({
        url: '/category/queryTopCategory',
        success: function (obj) {
            // 调用模板引擎的方法, 参数1:模板id  参数2:数据对象
            // 这里的obj返回的是对象, 不是数组, 不需要用{list:obj}包装
            var html = template('categoryLeftTpl',obj);
            // 把生成的模板渲染到ul里
            $('.category-left ul').html(html);
        }
    });

    // 声明变量储存上次点击的li的id
    var oldId = 0;
    // 页面刚刚加载就调用渲染右侧品牌列表的函数, 传入默认的id为1的li
    querySecondCategory(1);
    // li是页面加载后生成的, 需要用事件委托才能给每个li添加事件
    // tap是zepto封装的一个解决了移动端点击事件延迟的事件
    $('.category-left ul').on('tap','li',function () {
        $(this).addClass('active').siblings().removeClass('active');
        // zepto的data方法获取自定义属性的值, 会自动做类型转换
        var id = $(this).data('id');
        // 如果点击的id没有改变则不需要重新请求 
        if (id == oldId) {
            return false;
        }
        // 调用渲染右侧品牌列表的函数, 传入当前点击的li的id
        querySecondCategory(id);
        // 请求完成把id存入上次点击的变量
        oldId = id;
    })

    // ajax请求数据渲染右侧品牌列表, 需要调用多次于是封装成函数, id不固定作为参数
    function querySecondCategory (id) {
        $.ajax({
            url: '/category/querySecondCategory',
            data: {
                id: id
            },
            success: function (obj) {
                var html = template('categoryRightTpl',obj);
                $('.category-right .mui-row').html(html);
            }
        })
    }

    // 初始化内容滚动
    mui('.mui-scroll-wrapper').scroll({
        indicators: false, //是否显示滚动条 如果不想要滚动条把这个参数的值改成false
        deceleration: 0.0006 //阻尼系数,系数越小滑动越灵敏        
    })
})