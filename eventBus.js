import mitt from "mitt";

const emitter = mitt();

const eventBus = {
  on: function (type, handler) {
    emitter.on(type, handler);
  },
  off: function (type, handler) {
    emitter.off(type, handler);
  },
  emit: function (type, event) {
    // console.log(`[eventBus] 触发事件 ${type}`, event);
    emitter.emit(type, event);
  },
  // 注意：不要对同一个 type, handler 同时应用 on 和 once
  // https://github.com/developit/mitt/issues/136#issuecomment-866939653
  once: function (type, handler) {
    const fn = (...args) => {
      emitter.off(type, fn);
      handler.apply(null, args);
    };
    emitter.on(type, fn);
  },
};

window.eventBus = eventBus;

export default eventBus;
