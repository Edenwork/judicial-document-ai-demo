(function (global) {
  "use strict";

  const App = global.JudicialApp;

  App.initFileList = function () {
    const caseChecks = Array.from(document.querySelectorAll(".case-check"));
    const selectAll = document.getElementById("selectAllNormal");
    const selectionBar = document.getElementById("selectionBar");
    const selectedCount = document.getElementById("selectedCount");

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

    caseChecks.forEach(function (checkbox) {
      checkbox.addEventListener("change", updateSelection);
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
  };
})(window);
