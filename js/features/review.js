(function (global) {
  "use strict";

  const App = global.JudicialApp;

  App.initReview = function () {
    const fieldChecks = Array.from(document.querySelectorAll(".field-check"));

    function updateProgress() {
      const confirmedCount = fieldChecks.filter(function (checkbox) {
        return checkbox.checked;
      }).length;

      document.getElementById("fieldProgress").textContent =
        "已確認 " + confirmedCount + " / " + fieldChecks.length + " 個欄位";

      fieldChecks.forEach(function (checkbox) {
        checkbox.closest(".field-row").classList.toggle("confirmed", checkbox.checked);
      });
    }

    function highlightSource(fieldRow) {
      document.querySelectorAll(".paper mark").forEach(function (mark) {
        mark.classList.remove("active");
      });

      const source = document.querySelector('[data-source="' + fieldRow.dataset.sourceTarget + '"]');
      if (!source) return;
      source.classList.add("active");
      source.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    fieldChecks.forEach(function (checkbox) {
      checkbox.addEventListener("change", updateProgress);
    });

    document.getElementById("selectNormalFields").addEventListener("click", function () {
      fieldChecks
        .filter(function (checkbox) {
          return !checkbox.classList.contains("anomaly-check");
        })
        .forEach(function (checkbox) {
          checkbox.checked = true;
        });

      updateProgress();
      App.showToast("已確認所有非異常欄位，請繼續檢查 2 項異常。");
    });

    document.querySelectorAll(".field-row[data-source-target]").forEach(function (fieldRow) {
      fieldRow.addEventListener("click", function (event) {
        if (["INPUT", "SELECT", "TEXTAREA"].includes(event.target.tagName)) return;
        highlightSource(fieldRow);
      });
    });

    document.querySelectorAll(".field-row.anomaly .form-control").forEach(function (input) {
      input.addEventListener("input", function () {
        input.closest(".field-row").querySelector(".field-note span").textContent =
          "內容已修改，請確認無誤後勾選此欄位。";
      });
    });

    document.getElementById("saveDraft").addEventListener("click", function () {
      App.showToast("草稿已儲存，版本紀錄已更新。");
    });

    document.getElementById("submitReview").addEventListener("click", function () {
      const unconfirmedCount = fieldChecks.filter(function (checkbox) {
        return !checkbox.checked;
      }).length;

      if (unconfirmedCount) {
        App.showToast("尚有 " + unconfirmedCount + " 個欄位未確認，請完成後再送出。");
        return;
      }

      App.showToast("文件已送交主管複核。");
      global.setTimeout(function () {
        App.goToPage("files");
      }, 800);
    });

    document.getElementById("versionSelect").addEventListener("change", function (event) {
      const isHistoricalVersion = event.target.value !== "current";
      document.querySelectorAll("#fieldsList input, #fieldsList select, #fieldsList textarea").forEach(function (control) {
        control.disabled = isHistoricalVersion;
      });
      document.getElementById("saveDraft").disabled = isHistoricalVersion;
      document.getElementById("submitReview").disabled = isHistoricalVersion;

      if (isHistoricalVersion) {
        App.showToast("目前正在檢視歷史版本，欄位為唯讀模式。");
      }
    });
  };
})(window);
