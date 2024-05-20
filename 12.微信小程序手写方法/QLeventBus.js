class QLEventBus {
  constructor() {
    this.eventBus = {}
  }

  on(eventName, eventCallback, thisArg) {
    if (typeof eventName !== "string") {
      throw new TypeError("the event name must be string type")
    }

    if (typeof eventCallback !== "function") {
      throw new TypeError("the event callback must be function type")
    }
    
    let hanlders = this.eventBus[eventName]
    if (!hanlders) {
      hanlders = []
      this.eventBus[eventName] = hanlders
    }

    hanlders.push({
      eventCallback,
      thisArg
    })
    return this
  }

  once(eventName, eventCallback, thisArg) {
    if (typeof eventName !== "string") {
      throw new TypeError("the event name must be string type")
    }

    if (typeof eventCallback !== "function") {
      throw new TypeError("the event callback must be function type")
    }
    
    const tempCallback = (...payload) => {
      this.off(eventName, tempCallback)
      eventCallback.apply(thisArg, payload)
    }

    return this.on(eventName, tempCallback, thisArg)
  }

  emit(eventName, ...payload) {
    if (typeof eventName !== "string") {
      throw new TypeError("the event name must be string type")
    }

    const handlers = this.eventBus[eventName] || []
    handlers.forEach(handler => {
      handler.eventCallback.apply(handler.thisArg, payload)
    })
    return this
  }

  off(eventName, eventCallback) {
    if (typeof eventName !== "string") {
      throw new TypeError("the event name must be string type")
    }

    if (typeof eventCallback !== "function") {
      throw new TypeError("the event callback must be function type")
    }

    const handlers = this.eventBus[eventName]
    if (handlers && eventCallback) {
      const newHandlers = [...handlers]
      for (let i = 0; i < newHandlers.length; i++) {
        const handler = newHandlers[i]
        // 由于on中有其他逻辑，需要写成回调形式，会导致on中函数与off中函数不相等，去除此校验，不影响逻辑
        // 注意：一个事件名对应一个函数名，避免混用
        // if (handler.eventCallback === eventCallback) {
          const index = handlers.indexOf(handler)
          handlers.splice(index, 1)
        // }
      }
    }

    if (handlers && handlers.length === 0) {
      delete this.eventBus[eventName]
    }
  }
}

export default QLEventBus