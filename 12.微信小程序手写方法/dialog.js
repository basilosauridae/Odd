/* alert弹框 */
const alert = function(title, content, end) {
  let _title = title ? title : "",
    _content = content ? content : "",
    _end = end ? end : "";
  wx.showModal({
    title: _title,
    content: _content,
    showCancel: false,
    confirmColor: '#292929',
    confirmText: '我知道了',
    success: function() {
      if (typeof _end === 'function') {
        _end();
      }
    }
  });
};
/* msg提示信息 */
const msg = function(title,icon,end) {
  let _title = title ? title : "",
    _end = end ? end : "";
  wx.showToast({
    title: _title,
    icon,
    mask: false,
    duration: 2000,
    success: function() {
      if (typeof _end === 'function') {
          setTimeout(()=>{
            _end();
          },2000)
      }
    }
  });
};
/* confirm询问框 */
const confirm = function(title, content, yes, no, yesBtn, noBtn) {
  var _title = title ? title : '',
    _content = content ? content : '',
    _yes = yes ? yes : '',
    _no = no ? no : '',
    _yesBtn = yesBtn ? yesBtn : '确定',
    _noBtn = noBtn ? noBtn : '取消';
  wx.showModal({
    title: _title,
    content: _content,
    confirmText: _yesBtn,
    cancelText: _noBtn,
    confirmColor: '#1890FF',
    cancelColor: '#323233',
    success: function(res) {
      if (res.confirm && typeof _yes === 'function') {
        _yes();
      }
      if (res.cancel && typeof _no === 'function') {
        _no();
      }
    }
  });
};
/* loading加载 */
const loading = function(title) {
  wx.showLoading({
    title: title ? title : '',
    mask: true
  });
};
/* hideload关闭加载层 */
const hideLoad = function() {
  wx.hideLoading({noConflict: true});
};

export default {
  alert,
  msg,
  confirm,
  loading,
  hideLoad
};

//对原生微信小程序弹框的封装，在对应的js模块引用即可