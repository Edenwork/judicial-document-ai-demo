(function (global) {
  "use strict";

  const App = global.JudicialApp;

  App.initFileList = function () {
    const table = document.getElementById("casesTable");
    const selectAll = document.getElementById("selectAllNormal");
    const selectionBar = document.getElementById("selectionBar");
    const selectedCount = document.getElementById("selectedCount");
    const returnFieldChecks = Array.from(document.querySelectorAll(".return-field-check"));
    const selectAllReturnFields = document.getElementById("selectAllReturnFields");

    function getEligibleChecks() {
      return Array.from(table.querySelectorAll('tbody tr[data-status="pending"] .case-check:not(:disabled)'))
        .filter(function (checkbox) { return checkbox.closest("tr").style.display !== "none"; });
    }

    function getSelectedCases() {
      return getEligibleChecks().filter(function (checkbox) { return checkbox.checked; });
    }

    function updateSelection() {
      table.querySelectorAll('.case-check:checked').forEach(function (checkbox) {
        const row = checkbox.closest("tr");
        if (checkbox.disabled || row.dataset.status !== "pending" || row.style.display === "none") checkbox.checked = false;
      });
      const eligible = getEligibleChecks();
      const count = getSelectedCases().length;
      selectedCount.textContent = count;
      selectionBar.classList.toggle("show", count > 0);
      selectAll.disabled = eligible.length === 0;
      selectAll.checked = count > 0 && count === eligible.length;
      selectAll.indeterminate = count > 0 && count < eligible.length;
      document.getElementById("batchConfirm").disabled = count === 0;
    }
    App.refreshCaseSelection = updateSelection;

    function filterRows() {
      const query = document.getElementById("caseFilter").value.trim().toLowerCase();
      const status = document.getElementById("statusFilter").value;

      document.querySelectorAll("#casesTable tbody tr").forEach(function (row) {
        const matchesQuery = row.dataset.search.toLowerCase().includes(query);
        const matchesStatus = status === "all" || row.dataset.status === status;
        row.style.display = matchesQuery && matchesStatus ? "" : "none";
      });
      updateSelection();
    }

    function updateReturnFieldSelection() {
      const selectedFields = returnFieldChecks.filter(function (checkbox) {
        return checkbox.checked;
      }).length;

      selectAllReturnFields.checked = selectedFields === returnFieldChecks.length;
      selectAllReturnFields.indeterminate = selectedFields > 0 && selectedFields < returnFieldChecks.length;
    }

    table.addEventListener("change", function (event) {
      if (event.target.matches(".case-check")) updateSelection();
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
      getEligibleChecks().forEach(function (checkbox) {
        checkbox.checked = event.target.checked;
      });
      updateSelection();
    });

    document.getElementById("batchConfirm").addEventListener("click", function () {
      if (!getSelectedCases().length) return;
      document.getElementById("confirmCount").textContent = getSelectedCases().length;
      App.showOverlay("confirmModal");
    });

    document.getElementById("confirmBatchAction").addEventListener("click", function () {
      const selected = getSelectedCases();
      const ids = selected.map(function (checkbox) { return checkbox.closest("tr").dataset.caseId; });
      const count = App.startCaseProcessing ? App.startCaseProcessing(ids) : 0;
      App.hideOverlay(document.getElementById("confirmModal"));
      updateSelection();
      if (count) App.showToast("已開始處理 " + count + " 個案件（示範流程）。");
    });

    document.getElementById("caseFilter").addEventListener("input", filterRows);
    document.getElementById("statusFilter").addEventListener("change", filterRows);
    updateReturnFieldSelection();
    updateSelection();
  };
})(window);
