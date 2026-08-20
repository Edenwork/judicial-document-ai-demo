(function (global) {
  "use strict";

  try {
    if (!global.localStorage.getItem("judicial-demo-session")) {
      global.location.replace("login.html");
    }
  } catch (error) {
    // file:// 預覽若無法使用 localStorage，仍允許直接開啟主介面。
  }
})(window);
