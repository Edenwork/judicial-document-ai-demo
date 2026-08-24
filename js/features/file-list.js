(function (global) {
  "use strict";

  const App = global.JudicialApp;

  App.initFileList = function () {
    const caseChecks = Array.from(document.querySelectorAll(".case-check"));
    const selectAll = document.getElementById("selectAllNormal");
    const selectionBar = document.getElementById("selectionBar");
    const selectedCount = document.getElementById("selectedCount");
    const returnFieldChecks = Array.from(document.querySelectorAll(".return-field-check"));
    const selectAllReturnFields = document.getElementById("selectAllReturnFields");

    function getSelectedCases() {
      return caseChecks.filter(function (checkbox) {
        return checkbox.checked;
      });
    }

    function updateSelection() {
      const count = getSelectedCases().length;
      selectedCount.textContent = count;
      selectionBar.classList.toggle("show", count > 0);
      selectAll.checked = count === caseChecks.length && count > 0;
      selectAll.indeterminate = count > 0 && count < caseChecks.length;
    }

    function filterRows() {
      const query = document.getElementById("caseFilter").value.trim().toLowerCase();
      const status = document.getElementById("statusFilter").value;

      document.querySelectorAll("#casesTable tbody tr").forEach(function (row) {
        const matchesQuery = row.dataset.search.toLowerCase().includes(query);
        const matchesStatus = status === "all" || row.dataset.status === status;
        row.style.display = matchesQuery && matchesStatus ? "" : "none";
      });
    }

    function updateReturnFieldSelection() {
      const selectedFields = returnFieldChecks.filter(function (checkbox) {
        return checkbox.checked;
      }).length;

      selectAllReturnFields.checked = selectedFields === returnFieldChecks.length;
      selectAllReturnFields.indeterminate = selectedFields > 0 && selectedFields < returnFieldChecks.length;
    }

    caseChecks.forEach(function (checkbox) {
      checkbox.addEventListener("change", updateSelection);
    });

    document.querySelectorAll(".case-return-switch .form-check-input").forEach(function (returnSwitch) {
      returnSwitch.addEventListener("change", function () {
        const caseName = returnSwitch.closest("tr").querySelector(".doc-link").textContent.trim();
        const state = returnSwitch.checked ? "開啟" : "關閉";
        App.showToast("已" + state + "「" + caseName + "」回拋至司互案管系統的設定。");
      });
    });

    document.querySelectorAll(".return-config-trigger").forEach(function (button) {
      button.addEventListener("click", function () {
        const caseName = button.closest("tr").querySelector(".doc-link").textContent.trim();
        document.getElementById("returnConfigCaseName").textContent = caseName;
        document.getElementById("returnConfigStatus").textContent = button.dataset.returnStatus;
        updateReturnFieldSelection();
        App.showOverlay("returnConfigModal");
      });
    });

    selectAllReturnFields.addEventListener("change", function () {
      returnFieldChecks.forEach(function (checkbox) {
        checkbox.checked = selectAllReturnFields.checked;
      });
      updateReturnFieldSelection();
    });

    returnFieldChecks.forEach(function (checkbox) {
      checkbox.addEventListener("change", updateReturnFieldSelection);
    });

    document.getElementById("saveReturnConfig").addEventListener("click", function () {
      const selectedCount = returnFieldChecks.filter(function (checkbox) {
        return checkbox.checked;
      }).length;

      if (!selectedCount) {
        App.showToast("請至少選擇一個可回拋欄位或標籤。", "warning");
        return;
      }

      const apiEnabled = document.getElementById("publishReturnApi").checked;
      App.hideOverlay(document.getElementById("returnConfigModal"));
      App.showToast(
        "已儲存 " + selectedCount + " 個回拋欄位" +
        (apiEnabled ? "，並發布至 API 服務供司互案管系統引用。" : "。")
      );
    });

    selectAll.addEventListener("change", function (event) {
      caseChecks.forEach(function (checkbox) {
        checkbox.checked = event.target.checked;
      });
      updateSelection();
    });

    document.getElementById("batchConfirm").addEventListener("click", function () {
      document.getElementById("confirmCount").textContent = getSelectedCases().length;
      App.showOverlay("confirmModal");
    });

    document.getElementById("confirmBatchAction").addEventListener("click", function () {
      const selected = getSelectedCases();

      selected.forEach(function (checkbox) {
        const row = checkbox.closest("tr");
        const badge = row.querySelector(".badge-status");
        row.dataset.status = "processing";
        badge.className = "badge-status status-processing";
        badge.textContent = "處理中";
        checkbox.checked = false;
        checkbox.disabled = true;
      });

      App.hideOverlay(document.getElementById("confirmModal"));
      updateSelection();
      App.showToast("已開始處理 " + selected.length + " 個案件。");
    });

    document.getElementById("caseFilter").addEventListener("input", filterRows);
    document.getElementById("statusFilter").addEventListener("change", filterRows);
    updateReturnFieldSelection();
  };
})(window);
