(function (global) {
  "use strict";

  const App = (global.JudicialApp = global.JudicialApp || {});

  App.pageMeta = {
    files: ["案件管理", "跨境司法互助案件工作台"],
    upload: ["批次上傳", "匯入並追蹤 AI 文件處理進度"],
    review: ["文件校對", "原始文件與 AI 結果對照確認"],
    search: ["智慧搜尋", "查找、勾選並彙整已入庫文件"],
    relations: ["關聯視覺化", "案件、文件、引用及相似關係"],
    reports: ["彙整報告", "多文件彙整與 AI 報告輸出"],
    supervisor: ["需人工審核", "核准或退回承辦人修正內容"],
    audit: ["稽核日誌", "檢索系統操作與 AI 覆核軌跡"],
    glossary: ["詞彙管理", "術語長名稱與短名稱對照"],
    accounts: ["帳號與權限", "管理使用者帳號、角色及組織資料範圍"],
  };

  App.renderIcons = function () {
    if (global.lucide) global.lucide.createIcons();
  };

  App.goToPage = function (pageName, options) {
    const target = document.getElementById("page-" + pageName);
    const pageMeta = App.pageMeta[pageName];
    const navigationOptions = options || {};

    if (!target || !pageMeta) return;

    document.querySelectorAll(".page").forEach(function (page) {
      page.classList.remove("active");
    });
    target.classList.add("active");

    document.querySelectorAll(".nav-item-btn").forEach(function (button) {
      button.classList.toggle("active", button.dataset.page === pageName);
    });

    const topTitle = document.getElementById("topTitle");
    const topSubtitle = document.getElementById("topSubtitle");
    if (topTitle) topTitle.textContent = pageMeta[0];
    if (topSubtitle) topSubtitle.textContent = pageMeta[1];
    document.body.classList.toggle("review-mode", pageName === "review");
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.remove("open");
    global.scrollTo({ top: 0, behavior: "smooth" });

    try {
      if (navigationOptions.skipHistory) return;

      const nextUrl = pageName === "files" ? location.pathname : "?page=" + pageName;
      const shouldReturnHome = pageName === "relations" || pageName === "reports";

      if (shouldReturnHome) {
        history.replaceState({ page: "files" }, "", location.pathname);
        history.pushState({ page: pageName }, "", nextUrl);
      } else {
        history.replaceState({ page: pageName }, "", nextUrl);
      }
    } catch (error) {
      // Some browsers restrict history changes when index.html is opened via file://.
    }
  };

  App.showToast = function (message, variant) {
    const toast = document.createElement("div");
    const icon = document.createElement("i");
    const text = document.createElement("span");
    const isWarning = variant === "warning";

    toast.className = "app-toast" + (isWarning ? " app-toast--warning" : "");
    toast.setAttribute("role", isWarning ? "alert" : "status");
    icon.setAttribute("data-lucide", isWarning ? "triangle-alert" : "circle-check-big");
    text.textContent = message;
    toast.append(icon, text);
    document.getElementById("toastStack").appendChild(toast);
    App.renderIcons();
    global.setTimeout(function () {
      toast.remove();
    }, 3600);
  };

  App.showOverlay = function (overlayId) {
    document.getElementById(overlayId).classList.add("show");
  };

  App.hideOverlay = function (overlay) {
    overlay.classList.remove("show");
  };

  App.initCore = function () {
    document.querySelectorAll("[data-page], [data-go]").forEach(function (button) {
      button.addEventListener("click", function () {
        App.goToPage(button.dataset.page || button.dataset.go);
      });
    });

    document.querySelectorAll(".open-review").forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        App.goToPage("review");
      });
    });

    const mobileMenu = document.getElementById("mobileMenu");
    const sidebar = document.getElementById("sidebar");
    if (mobileMenu && sidebar) {
      mobileMenu.addEventListener("click", function () {
        sidebar.classList.toggle("open");
      });
    }

    document.querySelectorAll(".close-overlay").forEach(function (button) {
      button.addEventListener("click", function () {
        App.hideOverlay(button.closest(".overlay"));
      });
    });

    document.querySelectorAll(".overlay").forEach(function (overlay) {
      overlay.addEventListener("click", function (event) {
        const mayClose = event.target === overlay && overlay.id !== "reportProgress";
        if (mayClose) App.hideOverlay(overlay);
      });
    });

    global.addEventListener("popstate", function (event) {
      const pageFromUrl = new URLSearchParams(global.location.search).get("page");
      const pageName = event.state && event.state.page
        ? event.state.page
        : pageFromUrl || "files";
      App.goToPage(App.pageMeta[pageName] ? pageName : "files", { skipHistory: true });
    });
  };
})(window);
