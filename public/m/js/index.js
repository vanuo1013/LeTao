$(function () {
  // 轮播图
  var gallery = mui('.mui-slider');
  gallery.slider({
    interval: 2000 //自动轮播周期，若为0则不自动播放，默认为0；
  });

  // 初始化内容滚动
  mui('.mui-scroll-wrapper').scroll({
    deceleration: 0.0006 // 阻尼系数,系数越小滑动越灵敏
  })
})