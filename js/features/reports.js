(function (global) {
  "use strict";

  const App = global.JudicialApp;
  const reportStages = ["讀取文件內容", "比對欄位與標籤", "彙整案件脈絡", "產生摘要", "建立報告格式"];

  App.initReports = function () {
    function downloadWordReport() {
      const content =
        '<html><head><meta charset="utf-8"></head><body>' +
        "<h1>美國平台帳號資料保全案彙整報告</h1>" +
        "<p>案號：ML-2026-0818-04；彙整請求書、回覆函、證據材料與登入紀錄附件。</p>" +
        "<h2>主要證據內容</h2>" +
        "<ul><li>平台帳號註冊資訊</li><li>登入與 IP 紀錄</li><li>關聯電子郵件與裝置資訊</li></ul>" +
        "</body></html>";
      const blob = new Blob([content], { type: "application/msword;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = "美國平台帳號資料保全案彙整報告.doc";
      downloadLink.click();
      URL.revokeObjectURL(url);
      App.showToast("Word 報告已產生並開始下載。");
    }

    function finishReport(outputType) {
      if (outputType === "word") {
        downloadWordReport();
        return;
      }

      App.showOverlay("reportPreview");
      if (outputType === "pdf") {
        App.showToast("報告已完成，請使用「列印／另存 PDF」輸出。");
      }
    }

    function startReport(outputType) {
      const progressOverlay = document.getElementById("reportProgress");
      let stageIndex = 0;

      App.showOverlay("reportProgress");
      document.getElementById("reportStages").innerHTML = reportStages
        .map(function (stage, index) {
          return '<div class="report-stage"><span class="check">' + (index + 1) + "</span><span>" + stage + "</span></div>";
        })
        .join("");

      const timer = global.setInterval(function () {
        document.querySelectorAll(".report-stage").forEach(function (item, index) {
          item.classList.toggle("done", index < stageIndex);
          item.classList.toggle("active", index === stageIndex);
          if (index < stageIndex) item.querySelector(".check").textContent = "✓";
        });

        document.getElementById("reportProgressText").textContent =
          stageIndex < reportStages.length ? reportStages[stageIndex] + "..." : "報告產生完成";
        stageIndex += 1;

        if (stageIndex <= reportStages.length) return;
        global.clearInterval(timer);
        global.setTimeout(function () {
          App.hideOverlay(progressOverlay);
          finishReport(outputType);
        }, 450);
      }, 620);
    }

    document.querySelectorAll(".report-output").forEach(function (button) {
      button.addEventListener("click", function () {
        startReport(button.dataset.output);
      });
    });
    document.getElementById("printReport").addEventListener("click", function () {
      global.print();
    });
  };

  App.initSupervisor = function () {
    document.querySelectorAll(".approve-review").forEach(function (button) {
      button.addEventListener("click", function () {
        button.closest(".supervisor-card").style.opacity = ".45";
        button.disabled = true;
        App.showToast("文件已核准並標記為審核完成。");
      });
    });

    document.querySelectorAll(".return-review").forEach(function (button) {
      button.addEventListener("click", function () {
        const reason = global.prompt("請輸入退回原因：", "請重新確認資料時間範圍");
        if (reason) App.showToast("文件已退回承辦人：" + reason);
      });
    });
  };
})(window);
