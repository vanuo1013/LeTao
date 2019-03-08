$(function () {
    queryCart();
    deleteCart();
    editCart();
    getCount();

    // 查询购物车功能
    function queryCart() {
        $.ajax({
            url: '/cart/queryCart',
            success: function (obj) {
                // 如果没登录会有错误信息, 能取到则需要跳转到登录页面
                if (obj.error) {
                    location = 'login.html?returnurl=' + location.href;
                } else {
                    // 生成并渲染模板到页面
                    var html = template('queryCartTpl', {
                        list: obj
                    });
                    $('.cart-list').html(html);
                    // 渲染完成后初始化内容滚动
                    mui('.mui-scroll-wrapper').scroll({
                        deceleration: 0.0006 // 阻尼系数,系数越小滑动越灵敏
                    })
                }
            }
        })
    }

    // 删除商品功能
    function deleteCart () {
        // 删除按钮是跟随添加的商品一起在页面加载后渲染的, 需要委托注册事件
        $('.cart-list').on('tap','.btn-delete',function () {
            // 获取包裹右侧伸缩菜单的li元素
            var li = this.parentNode.parentNode;
            // 获取绑在自定义属性里的当前商品id
            var id = $(this).data('id');
            // 弹出mui的确认框询问是否删除
            mui.confirm('是否删除?','删除',['确定','取消'],function(e){
                // 根据被触发点击的事件源下标判断用户要删除还是取消
                if (e.index == 0) { //确认删除
                    // ajax发请求, 根据id删除该商品, 并重新查询渲染页面
                    $.ajax({
                        url: '/cart/deleteCart',
                        data: {id: id},
                        success: function (obj) {
                            // 根据后台返回的数据判断删除是否成功
                            if (obj.success) {
                                // 用弹出框提示用户删除成功, 并重新查询渲染页面
                                mui.toast('删除成功',{
                                    duration: 1000,
                                    type: 'div'
                                })
                                queryCart();
                            } else {
                                // 删除失败有可能是没登录
                                location = 'login.html?returnurl='+location.href;
                            }
                        }
                    })
                } else { //取消删除
                    // 调用mui的缩回菜单方法, 传入包裹菜单的盒子
                    mui.swipeoutClose(li);
                }
            })
        })
    }

    // 编辑商品功能
    function editCart () {
        // 编辑按钮是跟随添加的商品一起在页面加载后渲染的, 需要委托注册事件
        $('.cart-list').on('tap','.btn-edit',function () {
            // zepto方法获取包裹右侧伸缩菜单的li元素
            var li = $(this).parent().parent()[0];
            // 通过自定义属性获取商品信息
            var product = $(this).data('product');
            // 先分割尺码范围, 获得遍历的起始数和结尾数
            var arr = product.productSize.split('-');
            // 声明一个空数组用来存遍历出来的详细尺码数据
            var productSize = [];
            // 从起始数循环遍历到结尾数, 获得遍历出的每个数添加到数组中
            for (var i = +arr[0]; i <= arr[1] - 0; i++) {
                // 这里的+arr和arr-0都是为了数据类型转换, 因为截取出来的是字符串, 不是数字类型
                productSize.push(i);
            }
            // 将数据中的尺码范围替换成完整的尺码数据
            product.productSize = productSize;
            // 调用模板生成html
            var html = template('editCartTpl',product);
            // mui会自动把模板里的回车换行转为br标签, 因此提前用正则筛选去掉模板中的回车换行
            // replace() : 字符串的替换方法
            // 正则中的\r : 回车      \n : 换行      g : 全局匹配
            html = html.replace(/[\r\n]/g,'');
            // 用mui的弹出框, 传入模板生成的html结构标签
            mui.confirm(html,'编辑',['确定','取消'],function (e) {
                // 根据被触发点击的事件源下标判断用户要修改还是取消
                if (e.index == 0) { //确认修改
                    // 确认修改的话, 通过自定义属性获取当前选择尺码
                    var size = $('.mui-btn.mui-btn-warning').data('size');
                    // 通过mui自己的方法获取选择的商品数量
                    var num = mui('.mui-numbox').numbox().getValue();
                    // 发ajax请求, 调用编辑api
                    $.ajax({
                        url: '/cart/updateCart',
                        type: 'post',
                        data: {
                            id: product.id,
                            size: size,
                            num: num
                        },
                        success: function (obj) {
                            // 如果编辑成功就调用查询购物车刷新页面
                            if (obj.success) {
                                queryCart();
                            }
                        }
                    })
                } else {
                    // 调用mui的缩回菜单方法, 传入包裹菜单的盒子
                    mui.swipeoutClose(li);
                }
            })
            // 页面有弹出框这个元素之后才能初始化数字选择器
            mui('.mui-numbox').numbox();
            // 给所有尺码按钮添加点击事件, 切换被点击时的样式类名, 此时按钮已渲染完毕, 不需要委托注册事件
            $('.product-size button').on('tap',function () {
                $(this).addClass('mui-btn-warning').siblings().removeClass('mui-btn-warning');
            })
        })
    }

    // 计算总金额功能
    function getCount () {
        // 复选框是跟随添加的商品一起在页面加载后渲染的, 需要委托注册事件
        $('.cart-list').on('change','.mui-checkbox input',function () {
            // 箩筐思想求累加和
            var sum = 0;
            // 遍历所有被选中的复选框, 获取绑在自定义属性上的价格和数量
            $('.mui-checkbox input:checked').each(function () {
                var price = $(this).data('price');
                var num = $(this).data('num');
                var total = price * num;
                sum += total;
            })
            // toFixed() 方法可把数字四舍五入为指定小数位数的数字
            sum = sum.toFixed(2);
            // 将总价渲染到页面上
            $('.order-count span').html(sum);
        })
    }
})