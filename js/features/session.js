(function (global) {
  "use strict";

  const App = global.JudicialApp;

  App.initSessionMenu = function () {
    const trigger = document.getElementById("userMenuTrigger");
    const menu = document.getElementById("userMenu");
    const logoutButton = document.getElementById("logoutButton");

    function setMenuOpen(isOpen) {
      menu.hidden = !isOpen;
      trigger.setAttribute("aria-expanded", String(isOpen));
      if (isOpen) menu.querySelector("button").focus();
    }

    trigger.addEventListener("click", function (event) {
      event.stopPropagation();
      setMenuOpen(trigger.getAttribute("aria-expanded") !== "true");
    });

    menu.addEventListener("click", function (event) { event.stopPropagation(); });
    document.addEventListener("click", function () { setMenuOpen(false); });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && trigger.getAttribute("aria-expanded") === "true") {
        setMenuOpen(false);
        trigger.focus();
      }
    });

    document.getElementById("changePassword").addEventListener("click", function () {
      setMenuOpen(false);
      App.openPasswordChange();
    });

    logoutButton.addEventListener("click", function () {
      logoutButton.disabled = true;
      logoutButton.querySelector("span").textContent = "登出中...";
      try {
        global.localStorage.removeItem("judicial-demo-session");
      } catch (error) {
        // file:// 預覽可能限制 localStorage，仍可正常切換頁面。
      }
      global.setTimeout(function () { global.location.replace("login.html"); }, 450);
    });
  };
})(window);
