$(function () {
    // 框架式编程, 把功能封装为函数统一调用
    addHistory();
    queryHistory();
    deleteHistory();
    clearHistory();

    // 添加历史记录
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
            // 在添加完成后调用查询函数就会渲染刷新出新数据了, 省事但耗性能
            queryHistory();
            // 添加完成后清空输入框
            $('.input-search').val('');

        })
    }

    // 查询历史记录
    function queryHistory() {
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
        // 调用模板生成并渲染搜索历史, 数据是个二维数组, 需要包装成对象
        var html = template('searchHistoryTpl', {
            list: searchHistory
        });
        $('.search-history ul').html(html);
    }

    // 删除历史记录
    function deleteHistory() {
        // 删除按钮是页面加载后才渲染的, 因此需要委托注册事件
        $('.search-history ul').on('tap', '.btn-delete', function () {
            // 通过自定义属性获取当前要删除元素的索引
            var index = $(this).data('index');
            // 获取本地储存的数据, 并转为数组
            var searchHistory = JSON.parse(localStorage.getItem('searchHistory'));
            // 删掉数组中当前索引的数据
            searchHistory.splice(index, 1);
            // 转为JSON字符串重新储存在本地
            localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
            // 在添加完成后调用查询函数就会渲染刷新出新数据了, 省事但耗性能
            queryHistory();
        })
    }

    // 清空历史记录
    function clearHistory() {
        $('.btn-clear').on('tap', function () {
            // 清空数据直接删除本地储存的数据这个键, 里面的值也就跟着删除了
            // 不要用clear方法, 会把其他页面可能用到的数据一并删除
            localStorage.removeItem('searchHistory');
            // 在添加完成后调用查询函数就会渲染刷新出新数据了, 省事但耗性能
            queryHistory();
        })
    }

    // 初始化内容滚动
    mui('.mui-scroll-wrapper').scroll({
        indicators: false, //是否显示滚动条 如果不想要滚动条把这个参数的值改成false
        deceleration: 0.0006 //阻尼系数,系数越小滑动越灵敏        
    })
})