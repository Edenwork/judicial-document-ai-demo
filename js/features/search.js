(function (global) {
  "use strict";

  const App = global.JudicialApp;
  const searchResults = [
    {
      title: "日本銀行交易紀錄調取請求書",
      meta: "ML-2026-0819-01・日本・18 頁",
      snippet: "請求提供指定帳戶於 2025 年度之銀行交易紀錄、匯款資料及帳戶實際受益人資訊。",
      match: "符合：請求國家＝日本、證據類型＝銀行帳戶／交易紀錄",
    },
    {
      title: "日本虛擬資產交易資料補充請求書",
      meta: "ML-2026-0721-05・日本・11 頁",
      snippet: "追查犯罪所得由銀行帳戶轉入虛擬資產交易所之交易與錢包紀錄。",
      match: "符合：文件提及日本及銀行資金流向",
    },
    {
      title: "跨境洗錢案金流彙整附件",
      meta: "ML-2025-1120-02・附件・7 頁",
      snippet: "本案引用日本金融機構回覆之帳戶交易明細，並與美國平台帳號資料交叉比對。",
      match: "符合：引用日本銀行交易明細",
    },
  ];

  App.initSearch = function () {
    const queryInput = document.getElementById("smartQuery");
    const resultsBody = document.getElementById("resultsBody");

    function renderResults() {
      resultsBody.innerHTML = searchResults
        .map(function (result) {
          return (
            '<article class="result-item">' +
            '<div class="result-icon"><i data-lucide="file-search"></i></div>' +
            '<div><h4><a href="#" class="doc-link open-result">' + result.title + "</a></h4>" +
            '<span class="doc-sub">' + result.meta + "</span>" +
            "<p>" + result.snippet + "</p>" +
            '<small class="text-primary">' + result.match + "</small></div>" +
            '<button class="btn btn-sm btn-outline-secondary open-result" type="button">查看文件</button>' +
            "</article>"
          );
        })
        .join("");

      document.querySelectorAll(".open-result").forEach(function (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          App.goToPage("review");
        });
      });
      App.renderIcons();
    }

    function runSearch() {
      resultsBody.innerHTML =
        '<div class="empty-state"><span class="loading-inline"><span class="spinner-mini"></span>正在理解查詢並比對文件內容...</span></div>';

      global.setTimeout(function () {
        renderResults();
        App.showToast("已找到 3 份相關文件，結果均附有來源說明。");
      }, 1100);
    }

    document.getElementById("smartSearch").addEventListener("click", runSearch);
    queryInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") runSearch();
    });
    document.querySelectorAll(".query-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        queryInput.value = chip.textContent;
        runSearch();
      });
    });

    renderResults();
  };
})(window);
