(function (global) {
  "use strict";

  const App = global.JudicialApp;
  const nodeData = {
    "case-main": {
      type: "案件",
      icon: "briefcase-business",
      title: "ML-2026-0818 跨境詐欺案",
      description: "涉嫌透過境外平台收受犯罪所得，向美國及日本請求帳號與金流證據。",
      metadata: [["案件狀態", "偵查中"], ["所屬文件", "4 份"], ["涉及國家", "美國、日本"], ["承辦人", "王小明"]],
    },
    "doc-us": {
      type: "文件",
      icon: "file-text",
      title: "美國平台帳號資料保全請求書",
      description: "請求保全平台帳號註冊、登入、IP 位址及電子郵件紀錄。",
      metadata: [["案號", "ML-2026-0818-04"], ["文件狀態", "需人工處理"], ["AI 信心度", "71%"], ["異常欄位", "2 項"]],
      isDocument: true,
    },
    "doc-jp": {
      type: "文件",
      icon: "file-text",
      title: "日本銀行交易紀錄調取請求書",
      description: "請求銀行帳戶、匯款紀錄及實質受益人資料。",
      metadata: [["案號", "ML-2026-0819-01"], ["文件狀態", "待承辦確認"], ["AI 信心度", "94%"], ["異常欄位", "0 項"]],
      isDocument: true,
    },
    "doc-evidence": {
      type: "文件",
      icon: "table-2",
      title: "跨境金流彙整表",
      description: "整理涉案帳戶、平台帳號及跨境匯款關係。",
      metadata: [["文件類型", "證據附件"], ["資料筆數", "48 筆"], ["引用文件", "3 份"]],
      isDocument: true,
    },
    "doc-reply": {
      type: "文件",
      icon: "file-text",
      title: "司法互助法律依據補充說明書",
      description: "補充雙重犯罪原則、證據必要性及執行方式。",
      metadata: [["文件狀態", "審核完成"], ["版本", "V3"], ["更新時間", "8/18 10:25"]],
      isDocument: true,
    },
    "case-similar": {
      type: "相似案件",
      icon: "scan-search",
      title: "ML-2025-1120 跨境洗錢案",
      description: "AI 判定與本案具有相似的資金流向及平台帳號使用模式。",
      metadata: [["相似度", "86%"], ["共同證據", "銀行交易、平台帳號"], ["案件狀態", "已結案"]],
    },
  };

  App.initRelations = function () {
    const detailPanel = document.getElementById("nodeDetail");

    function renderMetadata(metadata) {
      return metadata
        .map(function (row) {
          return '<div class="detail-meta"><dt>' + row[0] + "</dt><dd>" + row[1] + "</dd></div>";
        })
        .join("");
    }

    function selectNode(node) {
      const data = nodeData[node.dataset.node];
      document.querySelectorAll(".node").forEach(function (item) {
        item.classList.remove("active");
      });
      node.classList.add("active");

      const documentActions = data.isDocument
        ? '<div class="d-grid gap-2 mt-4"><button class="btn btn-primary" id="detailOpen" type="button"><i data-lucide="panel-right-open"></i>查看完整文件</button><a class="btn btn-outline-secondary" href="?page=review" target="_blank" rel="noopener"><i data-lucide="external-link"></i>另開新分頁</a></div>'
        : "";

      detailPanel.innerHTML =
        '<div class="detail-icon"><i data-lucide="' + data.icon + '"></i></div>' +
        '<span class="badge-status status-info mb-2">' + data.type + "</span>" +
        '<h3 class="h6 fw-bold mt-2">' + data.title + "</h3>" +
        '<p class="subtle">' + data.description + "</p>" +
        '<dl class="mt-4">' + renderMetadata(data.metadata) + "</dl>" +
        documentActions;

      if (data.isDocument) {
        document.getElementById("detailOpen").addEventListener("click", function () {
          App.goToPage("review");
        });
      }
      App.renderIcons();
    }

    document.querySelectorAll(".node").forEach(function (node) {
      node.addEventListener("click", function () {
        selectNode(node);
      });
      node.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectNode(node);
        }
      });
    });
  };
})(window);
