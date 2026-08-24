(function (global) {
  "use strict";

  const App = global.JudicialApp;
  const statusMeta = {
    pending: { label: "待處理", badgeClass: "status-neutral" },
    processing: { label: "處理中", badgeClass: "status-processing" },
    completed: { label: "完成", badgeClass: "status-ok" },
    failed: { label: "失敗", badgeClass: "status-danger" },
    manual: { label: "需人工審核", badgeClass: "status-warn" },
  };

  const initialRecords = [
    {
      id: "UP-20260820-007",
      name: "加拿大電子郵件證據保全請求書.pdf",
      size: "1.9 MB",
      stage: "等待排程",
      progress: 0,
      status: "pending",
      updatedAt: "今天 13:58",
    },
    {
      id: "UP-20260820-006",
      name: "德國伺服器資料調取請求書.pdf",
      size: "2.3 MB",
      stage: "OCR 文字辨識",
      progress: 46,
      status: "processing",
      updatedAt: "今天 13:56",
    },
    {
      id: "UP-20260820-005",
      name: "日本銀行交易紀錄調取請求書.pdf",
      size: "2.8 MB",
      stage: "處理完成",
      progress: 100,
      status: "completed",
      updatedAt: "今天 13:42",
    },
    {
      id: "UP-20260820-004",
      name: "瑞士銀行帳戶資料請求書.pdf",
      size: "3.1 MB",
      stage: "處理完成",
      progress: 100,
      status: "completed",
      updatedAt: "今天 13:35",
    },
    {
      id: "UP-20260820-003",
      name: "澳洲電信通聯紀錄請求書.pdf",
      size: "5.6 MB",
      stage: "OCR 無法辨識第 4 頁",
      progress: 38,
      status: "failed",
      updatedAt: "今天 13:18",
    },
    {
      id: "UP-20260820-002",
      name: "美國平台帳號資料保全請求書.pdf",
      size: "4.2 MB",
      stage: "AI 欄位擷取完成・2 項異常",
      progress: 100,
      status: "manual",
      updatedAt: "今天 13:06",
    },
    {
      id: "UP-20260820-001",
      name: "法國公司實質受益人資料請求書.pdf",
      size: "3.4 MB",
      stage: "AI 欄位擷取完成・1 項異常",
      progress: 100,
      status: "manual",
      updatedAt: "今天 12:54",
    },
  ];

  App.initUploadStatus = function () {
    const filterContainer = document.getElementById("uploadStatusFilters");
    const tableBody = document.getElementById("uploadStatusTable");
    const emptyState = document.getElementById("uploadStatusEmpty");
    const refreshButton = document.getElementById("refreshUploadStatus");
    let records = initialRecords.map(function (record) {
      return Object.assign({}, record);
    });
    let activeFilter = "all";

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function getAction(record) {
      if (record.status === "manual") return { label: "處理異常", action: "review" };
      if (record.status === "completed") return { label: "查看結果", action: "files" };
      if (record.status === "failed") return { label: "重新處理", action: "retry" };
      return { label: "查看", action: "status" };
    }

    function renderCounts() {
      const counts = records.reduce(
        function (result, record) {
          result.all += 1;
          result[record.status] += 1;
          return result;
        },
        { all: 0, pending: 0, processing: 0, completed: 0, failed: 0, manual: 0 }
      );

      document.querySelectorAll("[data-status-count]").forEach(function (element) {
        element.textContent = counts[element.dataset.statusCount] || 0;
      });
    }

    function renderFilters() {
      filterContainer.querySelectorAll("[data-status-filter]").forEach(function (button) {
        const isActive = button.dataset.statusFilter === activeFilter;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });
    }

    function renderTable() {
      const visibleRecords = records.filter(function (record) {
        return activeFilter === "all" || record.status === activeFilter;
      });

      tableBody.innerHTML = visibleRecords
        .map(function (record) {
          const meta = statusMeta[record.status];
          const action = getAction(record);

          return (
            '<tr data-record-id="' + escapeHtml(record.id) + '">' +
            '<td><div class="status-document"><span class="status-document-icon"><i data-lucide="file-text"></i></span>' +
            '<span><strong title="' + escapeHtml(record.name) + '">' + escapeHtml(record.name) + "</strong>" +
            "<small>" + escapeHtml(record.id) + "・" + escapeHtml(record.size) + "</small></span></div></td>" +
            '<td><span class="status-stage">' + escapeHtml(record.stage) + "</span></td>" +
            '<td><div class="status-progress"><div class="status-progress-meta"><span>處理進度</span><span>' +
            record.progress + '%</span></div><div class="progress-thin"><span style="width:' + record.progress +
            '%"></span></div></div></td>' +
            '<td><span class="badge-status ' + meta.badgeClass + '">' + meta.label + "</span></td>" +
            '<td><span class="status-updated">' + escapeHtml(record.updatedAt) + "</span></td>" +
            '<td class="text-end"><button class="btn btn-sm btn-outline-secondary status-row-action" data-action="' +
            action.action + '" type="button">' + action.label + "</button></td>" +
            "</tr>"
          );
        })
        .join("");

      tableBody.closest("table").hidden = visibleRecords.length === 0;
      emptyState.hidden = visibleRecords.length > 0;
      App.renderIcons();
    }

    function render() {
      renderCounts();
      renderFilters();
      renderTable();
    }

    function upsertFiles(files, status, stage, progress) {
      files.forEach(function (file, index) {
        const existing = records.find(function (record) {
          return record.name === file.name;
        });
        const nextValues = {
          size: file.size,
          status: status,
          stage: stage,
          progress: progress,
          updatedAt: "剛剛",
        };

        if (existing) {
          Object.assign(existing, nextValues);
          return;
        }

        records.unshift(
          Object.assign(
            {
              id: "UP-NEW-" + String(Date.now() + index).slice(-6),
              name: file.name,
            },
            nextValues
          )
        );
      });
      render();
    }

    filterContainer.addEventListener("click", function (event) {
      const button = event.target.closest("[data-status-filter]");
      if (!button) return;
      activeFilter = button.dataset.statusFilter;
      render();
    });

    refreshButton.addEventListener("click", function () {
      render();
      App.showToast("處理狀態已更新。資料更新時間：剛剛");
    });

    tableBody.addEventListener("click", function (event) {
      const button = event.target.closest(".status-row-action");
      if (!button) return;
      const row = button.closest("tr");
      const record = records.find(function (item) {
        return item.id === row.dataset.recordId;
      });
      if (!record) return;

      if (button.dataset.action === "review") {
        App.goToPage("review");
        return;
      }
      if (button.dataset.action === "files") {
        App.goToPage("files");
        return;
      }
      if (button.dataset.action === "retry") {
        upsertFiles([record], "processing", "已重新排入處理佇列", 5);
        App.showToast("已重新處理「" + record.name + "」。");
        return;
      }
      App.showToast("「" + record.name + "」目前狀態：" + statusMeta[record.status].label + "。");
    });

    App.uploadStatus = {
      upsertFiles: upsertFiles,
    };

    render();
  };
})(window);
