$(function () {
    // 获取url中传过来的商品id, 发ajax请求根据id查询商品详情
    var id = getQueryString('id');
    $.ajax({
        url: '/product/queryProductDetail',
        data: {
            id: id
        },
        success: function (obj) {
            console.log(obj);
            // 这里后台传过来的尺码数据不是一个详细的数组, 而是一个尺码范围, 需要处理成数组
            // 先分割尺码范围, 获得遍历的起始数和结尾数
            var arr = obj.size.split('-');
            // 声明一个空数组用来存遍历出来的详细尺码数据
            var size = [];
            // 从起始数循环遍历到结尾数, 获得遍历出的每个数添加到数组中
            for (var i = +arr[0]; i <= arr[1] - 0; i++) {
                // 这里的+arr和arr-0都是为了数据类型转换, 因为截取出来的是字符串, 不是数字类型
                size.push(i);
            }
            // 将数据中的尺码范围替换成完整的尺码数据
            obj.size = size;
            // 调用并渲染模板
            var html = template('detailTpl', obj);
            $('#main').html(html);
            // 渲染完成后初始化轮播图
            var gallery = mui('.mui-slider');
            gallery.slider({
                interval: 2000 //自动轮播周期，若为0则不自动播放，默认为0；
            });
            // 渲染完成后初始化内容滚动
            mui('.mui-scroll-wrapper').scroll({
                deceleration: 0.0006 // 阻尼系数,系数越小滑动越灵敏
            })
            // 渲染完成后初始化数字选择器
            mui('.mui-numbox').numbox();
            // 给所有尺码按钮添加点击事件, 切换被点击时的样式类名, 此时按钮已渲染完毕, 不需要委托注册事件
            $('.product-size button').on('tap',function () {
                $(this).addClass('mui-btn-warning').siblings().removeClass('mui-btn-warning');
            })
        }
    })

    // 加入购物车功能
    $('.btn-add-cart').on('tap',function () {
        // 通过自定义属性获取当前选择尺码
        var size = $('.mui-btn.mui-btn-warning').data('size');
        console.log(size);
        // 通过mui自己的方法获取选择的商品数量
        var num = mui('.mui-numbox').numbox().getValue();
        // ajax发请求加入购物车的接口
        $.ajax({
            url: '/cart/addCart',
            type: 'post', //默认值是get, 是post需要手动设置
            data: {
                productId: id,
                size: size,
                num: num
            },
            success: function (obj) {
                console.log(obj);
                // 根据返回的数据判断, 能取到error表示没登录
                if (obj.error) { //跳去登录页面的时候带上需要返回的页面地址
                    location = 'login.html?returnurl='+location.href;
                } else {
                    // 调用mui的提示框询问用户是否要跳去购物车页面
                    // 参数1: 提示内容 可以放文字和代码
                    // 参数2: 提示标题 可以放文字和代码
                    // 参数3: 提示按钮的文字['左边的按钮文字','右边按钮的文字']如果有多个就依次排列
                    // 参数4: 回调函数 点击是或者否都会触发回调函数 有个参数e e.index的值就是点击按钮的索引
                    mui.confirm('添加成功, 是否要去购物车查看?','温馨提示',['是','否'],function (e) {
                        if (e.index == 0) {
                            location = 'cart.html'
                        }
                    })
                }
            }
        })
    })

    // 封装获取url参数的函数(正则版)
    function getQueryString(name) {
        var reg = new RegExp("[^\?&]?" + encodeURI(name) + "=[^&]+");
        var arr = location.search.match(reg);
        if (arr != null) {
            return decodeURI(arr[0].substr(arr[0].indexOf('=') + 1));
        }
        return "";
    }
})