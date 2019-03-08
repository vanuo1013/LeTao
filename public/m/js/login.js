$(function () {
    // 给登录按钮添加点击事件, 完成登录功能
    $('.btn-login').on('tap',function () {
        // 获取当前用户输入用户名和密码, 去掉首尾空格
        var username = $('.username').val().trim();
        // 非空判断, 弹出mui的提示框
        if (username == '') {
            mui.toast('请输入用户名',{
                duration: 'long',
                type: 'div'
            })
            return false;
        }
        var password = $('.password').val().trim();
        if (password == '') {
            mui.toast('请输入密码', {
                duration: 'long',
                type: 'div'
            });
            return false;
        }
        // ajax发请求, 传入用户名和密码, 后台判断是否登录成功
        $.ajax({
            url: '/user/login',
            type: 'post',
            data: {
                username: username,
                password: password
            },
            success: function (obj) {
                if (obj.error) {
                    // 能取到error则表示登录失败, 把错误信息用提示框告诉用户
                    mui.toast(obj.message, {
                        duration: 'long',
                        type: 'div'
                    })
                } else {
                    // 取不到error则为false, 跳转回之前的returnurl链接
                    location = getQueryString('returnurl');
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