(function (global) {
  "use strict";

  const App = global.JudicialApp;

  App.initReview = function () {
    const fieldChecks = Array.from(document.querySelectorAll(".field-check"));
    const documentSelect = document.getElementById("caseDocumentSelect");
    const versionSelect = document.getElementById("versionSelect");
    const archiveButton = document.getElementById("archiveDocument");
    const paperTitle = document.getElementById("reviewPaperTitle");
    const caseNumberInput = document.getElementById("reviewCaseNumber");
    const caseCountryInput = document.getElementById("reviewCaseCountry");
    const updateCaseButton = document.getElementById("updateCaseInfo");
    const documentTitles = {
      request: "司法互助請求書",
      reply: "司法互助回覆函",
      evidence: "平台帳號證據材料",
      attachment: "登入與 IP 紀錄附件",
    };

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

    function updateDocumentNavigation() {
      const selectedIndex = documentSelect.selectedIndex;
      document.getElementById("previousDoc").disabled = selectedIndex === 0;
      document.getElementById("nextDoc").disabled = selectedIndex === documentSelect.options.length - 1;
    }

    function selectDocumentByOffset(offset) {
      const nextIndex = documentSelect.selectedIndex + offset;

      if (nextIndex < 0 || nextIndex >= documentSelect.options.length) return;
      documentSelect.selectedIndex = nextIndex;
      documentSelect.dispatchEvent(new Event("change"));
      documentSelect.focus();
    }

    function setFieldValidity(control, isValid) {
      control.classList.toggle("is-invalid", !isValid);
      control.setAttribute("aria-invalid", String(!isValid));
    }

    function updateCaseInfo() {
      const caseNumber = caseNumberInput.value.trim();
      const country = caseCountryInput.value.trim();

      setFieldValidity(caseNumberInput, Boolean(caseNumber));
      setFieldValidity(caseCountryInput, Boolean(country));

      if (!caseNumber || !country) {
        App.showToast("請填寫案號與國家。", "warning");
        (caseNumber ? caseCountryInput : caseNumberInput).focus();
        return;
      }

      document.getElementById("reviewCaseSummary").textContent = caseNumber + "・需人工處理";
      document.getElementById("reviewPaperCaseNumber").textContent = "案號：" + caseNumber;
      App.showToast("案件基本資料已更新。");
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

    updateCaseButton.addEventListener("click", updateCaseInfo);

    [caseNumberInput, caseCountryInput].forEach(function (input) {
      input.addEventListener("input", function () {
        setFieldValidity(input, Boolean(input.value.trim()));
      });
      input.addEventListener("keydown", function (event) {
        if (event.key !== "Enter") return;
        event.preventDefault();
        updateCaseInfo();
      });
    });

    archiveButton.addEventListener("click", function () {
      const unconfirmedCount = fieldChecks.filter(function (checkbox) {
        return !checkbox.checked;
      }).length;

      if (unconfirmedCount) {
        App.showToast("尚有 " + unconfirmedCount + " 個欄位未確認，請完成後再歸檔。", "warning");
        return;
      }

      App.showToast("文件已歸檔並納入此案件。");
      global.setTimeout(function () {
        App.goToPage("files");
      }, 800);
    });

    documentSelect.addEventListener("change", function (event) {
      paperTitle.textContent = documentTitles[event.target.value];
      document.querySelector(".document-scroll").scrollTo({ top: 0, behavior: "smooth" });
      updateDocumentNavigation();
      App.showToast("已切換至「" + event.target.options[event.target.selectedIndex].text + "」。");
    });

    document.getElementById("previousDoc").addEventListener("click", function () {
      selectDocumentByOffset(-1);
    });

    document.getElementById("nextDoc").addEventListener("click", function () {
      selectDocumentByOffset(1);
    });

    versionSelect.addEventListener("change", function (event) {
      const isHistoricalVersion = event.target.value !== event.target.dataset.currentVersion;
      document.querySelectorAll("#fieldsList input, #fieldsList select, #fieldsList textarea").forEach(function (control) {
        control.disabled = isHistoricalVersion;
      });
      archiveButton.disabled = isHistoricalVersion;

      if (isHistoricalVersion) {
        App.showToast("目前正在檢視歷史版本，欄位為唯讀模式。");
      }
    });

    updateDocumentNavigation();
  };
})(window);
