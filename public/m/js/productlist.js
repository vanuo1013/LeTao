$(function () {
    // 框架式编程, 把功能封装为函数统一调用
    queryProduct();
    addHistory();
    sortProduct();
    pullRefresh();
    gotoDetail();

    // 查询搜索商品
    function queryProduct() {
        // 调用封装的方法获取url中的search参数值, 也就是要搜索的商品
        var search = getQueryString('search');
        // 用ajax发请求获取商品列表, 传入当前搜索的商品名称
        $.ajax({
            url: '/product/queryProduct',
            data: {
                proName: search, //产品名称
                page: 1, //必传, 显示第几页
                pageSize: 4 //必传, 每页显示多少条
            },
            success: function (obj) {
                // 调用模板引擎生成并渲染商品列表
                var html = template('productListTpl', obj);
                $('.product-list .mui-row').html(html);
            }
        })
    }

    // 添加历史记录并搜索商品
    function addHistory() {
        // 给搜索按钮添加无延迟的点击事件
        $('.btn-search').on('tap', function () {
            // 获取当前搜索框内容, 并去除首尾空格
            var search = $('.input-search').val().trim();
            // 非空判断
            if (search == '') {
                // 使用mui框架的自动消失消息框提示
                mui.toast('请输入搜索内容', {
                    duration: 'long', //持续显示时间,long=3500ms
                    type: 'div' //强制使用mui消息框(div模式)
                })
                // 并阻止之后代码执行
                return false;
            }
            // 获取本地储存的localStorage数据
            var searchHistory = localStorage.getItem('searchHistory');
            // 判断之前有没有存过数据
            if (searchHistory) { //有值会转为ture, 无值为null转为false
                // 把取出的json字符串转为数组
                searchHistory = JSON.parse(searchHistory);
            } else {
                // 没有值取到null, 但数据不能直接存null, 使用空数组
                // 这里覆盖的都是变量, 而不是覆盖存入本地的数据
                searchHistory = [];
            }
            // 遍历取出的数组, 进行去重
            for (var i = 0; i < searchHistory.length; i++) {
                // 将数组中每个值与当前输入的值比较
                if (searchHistory[i].key == search) {
                    // 相同则删除当前数组中的这个数据
                    // splice方法删除数组中某个值, 参数1:被删除的数据索引 参数2:往后删除的数据个数
                    searchHistory.splice(i, 1);
                    // 如果有多个重复的数据, 每删掉一个数组长度-1
                    i--;
                }
            }
            // 向数组中添加对象, push往后添加, unshift往前添加
            searchHistory.unshift({
                key: search,
                // 添加当前时间的毫秒数
                time: new Date().getTime()
            })
            // 将这个二维数组转成json字符串存入本地储存中
            localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
            // 添加完成后清空输入框
            $('.input-search').val('');
            // 保存搜索记录的同时需要跳转到相应的商品列表, 因此需要通过拼接url传递过去搜索内容
            // 为了防止页面缓存多传一个时间参数, 这样页面url就每次不同, 请求时不会使用缓存页面
            location = 'productlist.html?search=' + search + '&time=' + new Date().getTime();
        })
    }


    // 商品排序功能
    function sortProduct() {
        // 给所有排序按钮添加点击事件
        $('.product-list .mui-card-header a').on('tap',function () {
            // 给当前点击的按钮添加类名, 并移除其他兄弟按钮的类名
            $(this).addClass('active').siblings().removeClass('active');
            // 通过自定义属性获取当前的排序顺序
            var sort = $(this).data('sort');
            if (sort == 2) { //默认是降序排列(2), 点击后需要变成升序(1)
                sort = 1;
                // 并通过修改类名切换字体图标上下箭头
                $(this).children('i').removeClass('fa-angle-down').addClass('fa-angle-up');
            } else {
                sort = 2; //如果是1, 点击后则需要变成2
                // find() : 获得当前元素集合中每个元素的后代
                $(this).find('i').removeClass('fa-angle-up').addClass('fa-angle-down');
            }
            // 将修改后的sort值存入自定义属性中
            $(this).data('sort',sort);
            // 通过自定义属性获取当前的排序的类型
            var type = $(this).data('type');
            // 调用封装的方法获取url中的search参数值, 也就是要搜索的商品
            var search = getQueryString('search');
            // 因为传入的键是变量, 因此需要动态的给参数对象添加属性, 事先声明对象
            var obj = {
                proName: search,
                page: 1,
                pageSize: 4
            }
            // 点语法不能解析变量, 通过字符串语法给对象添加一个键为变量的属性
            obj[type] = sort;
            // ajax发请求获取排序后的新数据渲染页面
            $.ajax({
                url: '/product/queryProduct',
                data: obj,
                success: function (obj) {
                    var html = template('productListTpl',obj);
                    $('.product-list .mui-row').html(html);
                }
            })
        })
    }

    // 下拉刷新和上拉加载
    function pullRefresh() {
        mui.init({
            pullRefresh: {
                container: '#pullrefresh', //指定当前下拉刷新的父容器
                down: {
                    // 下拉刷新的回调函数 用真正的刷新数据 发送请求真实刷新数据和页面
                    callback: pulldownRefresh
                },
                up: {
                    callback: pullupRefresh
                }
            }
        });
        // 下拉刷新的回调函数
        function pulldownRefresh() {
            // 定时器用于延迟请求, 方便展示刷新的转圈圈效果
            setTimeout(function () {
                // 调用查询商品函数重新渲染刷新页面
                queryProduct();
                // 使用官方demo文档里面新版代码结束转圈圈
                mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
            }, 1000);
        }
        // 声明全局变量记录当前加载的页数
        var page = 1;
        // 上拉加载的回调函数
        function pullupRefresh() {
            // 调用封装的方法获取url中的search参数值, 也就是要搜索的商品
            var search = getQueryString('search');
            // 定时器用于延迟请求, 方便展示加载的转圈圈效果
            setTimeout(function () {
                // ajax请求更多数据
                $.ajax({
                    url: '/product/queryProduct',
                    data: {
                        proName: search, //产品名称
                        // 发请求前让当前页数自增
                        page: ++page, //必传, 显示第几页
                        pageSize: 4 //必传, 每页显示多少条
                    },
                    success: function (obj) {
                        // 如果没有更多数据, 数据数组长度为0, 则提示没有数据
                        if (obj.data.length > 0) {
                            var html = template('productListTpl', obj);
                            // 这里的数据不是重新渲染, 而是需要追加, 因此用append方法
                            $('.product-list .mui-row').append(html);
                            // 数据追加完毕, 用mui的方法结束转圈圈
                            mui('#pullrefresh').pullRefresh().endPullupToRefresh();
                        } else {
                            // 参数为true代表没有更多数据了。
                            mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
                        }
                    }
                })
            }, 1000);
        }
    }

    // 点击购买跳转到商品详情页
    function gotoDetail () {
        // 购买按钮在页面加载后才渲染出来, 因此需要委托注册事件
        $('.product-list').on('tap','.product-buy',function () {
            // 通过自定义属性获取当前点击商品的id
            var id = $(this).data('id');
            // 跳转页面时将id通过拼接url的方式传过去
            location = 'detail.html?id='+id;
        })
    }

    // 封装获取url参数的函数(普通版)
    function getQueryString(key) {
        // location.search : 获取url从?开始之后的参数
        // substr(下标) : 按下标开始抽取字符串
        // split(字符串或正则) : 把字符串分割成数组
        var params = location.search.substr(1).split('&');
        // 遍历所有参数
        for (var i = 0; i < params.length; i++) {
            // 判断每个参数的参数名 是否和当前传来 的参数名一致
            if (params[i].split('=')[0] == key) {
                // 一致就把当前参数名对应的参数值返回
                // return params[i].split('=')[1];
                return decodeURI(params[i].substr(params[i].indexOf('=') + 1));
            }
        }
        return "";
    }
})