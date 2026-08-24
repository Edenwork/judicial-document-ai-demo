(function (global) {
  "use strict";

  const App = global.JudicialApp;

  App.initFileList = function () {
    const fileChecks = Array.from(document.querySelectorAll(".file-check"));
    const selectAll = document.getElementById("selectAllNormal");
    const selectionBar = document.getElementById("selectionBar");
    const selectedCount = document.getElementById("selectedCount");

    function getSelectedFiles() {
      return fileChecks.filter(function (checkbox) {
        return checkbox.checked;
      });
    }

    function updateSelection() {
      const count = getSelectedFiles().length;
      selectedCount.textContent = count;
      selectionBar.classList.toggle("show", count > 0);
      selectAll.checked = count === fileChecks.length && count > 0;
      selectAll.indeterminate = count > 0 && count < fileChecks.length;
    }

    function filterRows() {
      const query = document.getElementById("fileFilter").value.trim().toLowerCase();
      const status = document.getElementById("statusFilter").value;

      document.querySelectorAll("#filesTable tbody tr").forEach(function (row) {
        const matchesQuery = row.dataset.search.toLowerCase().includes(query);
        const matchesStatus = status === "all" || row.dataset.status === status;
        row.style.display = matchesQuery && matchesStatus ? "" : "none";
      });
    }

    fileChecks.forEach(function (checkbox) {
      checkbox.addEventListener("change", updateSelection);
    });

    selectAll.addEventListener("change", function (event) {
      fileChecks.forEach(function (checkbox) {
        checkbox.checked = event.target.checked;
      });
      updateSelection();
    });

    document.getElementById("batchConfirm").addEventListener("click", function () {
      document.getElementById("confirmCount").textContent = getSelectedFiles().length;
      App.showOverlay("confirmModal");
    });

    document.getElementById("confirmBatchAction").addEventListener("click", function () {
      const selected = getSelectedFiles();

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
      App.showToast("已開始處理 " + selected.length + " 份文件。");
    });

    document.getElementById("fileFilter").addEventListener("input", filterRows);
    document.getElementById("statusFilter").addEventListener("change", filterRows);
  };
})(window);
