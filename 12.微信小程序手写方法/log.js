// 远程监控小程序日志
var log = wx.getRealtimeLogManager ? wx.getRealtimeLogManager() : null
module.exports = {
  debug() {
    if (!log) return
    log.debug.apply(log, arguments)
  },
  info() {
    if (!log) return
    log.info.apply(log, arguments)
  },
  warn() {
    if (!log) return
    log.warn.apply(log, arguments)
  },
  error() {
    if (!log) return
    log.error.apply(log, arguments)
  },
  setFilterMsg(msg) { // 从基础库2.7.3开始支持
    if (!log || !log.setFilterMsg) return
    if (typeof msg !== 'string') return
    log.setFilterMsg(msg)
  }
}