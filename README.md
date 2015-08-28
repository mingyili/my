# my
my.js, my.css 

[Demo](http://mingyili.github.io/)

### 封装了一些微信端，移动端比较常用的方法：

* 动画打开关闭    
    //div 选择器，可以是 id / class  
    //anim 可选，包括：fadeAnim（默认）, popAnim, slideUpAnim, slideDAnim, slideLeftAnim, slideRightAnim  
    My('div').open('anim');  
    My('div').close('anim');

* 自定义弹窗 My.showAlert(option);  
    
    My.showAlert({  
        title: "",          //弹窗标题   
        text: "弹窗提示",   //弹窗文字  
        yesText: "好的",     //确定按钮文字  
        yesStyle: "b_green",       //确定按钮样式  
        onYes: null,        //确定按钮的事件  
        noText: "",          //取消按钮文字  
        noStyle: "b_white",        //取消按钮样式  
        onNo: null,         //取消按钮的事件  
        animte: "fadeAnim", //弹出动画  
        hasMask: true,         //显示遮罩  
        clickMaskHide: false    //点击遮罩关闭  
    });  

* 加载提示   
  
      My.showLoad('str'); //str加载提示文字  
      My.hideLoad(); //关闭加载  

* 信息提示 My.showTip('str', 'time');  
* 顶部信息提示 My.showBarTip('str', 'time');  
* 分享提示 My.showShare();  
* 关注提示 My.showFollow();  
      My.FollowUrl 商户关注页面连接 加载时定义；  
      My.WxName 商户微信昵称 加载时定义；  
      My.FollowImg 关注二维码，会只显示二维码；  




