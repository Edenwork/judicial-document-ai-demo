(function (global) {
  "use strict";

  const App = global.JudicialApp;
  const page = document.getElementById("page-pending-return");
  if (!App || !page) return;

  App.pageMeta["pending-return"] = ["待回拋清單", "查找待回拋文件"];

  // UI demonstration records; replace with the pending-return API when available.
  const documents = [
    { fileName: "掃描_20260910_0908.pdf", documentNumber: "1080057970", caseType: "我國對外國請求（刑事）", uploadedBy: "國際科歐洲股－祈小姐", uploadedAt: "2026-09-10" },
    { fileName: "掃描_20260910_0921.pdf", documentNumber: "1080065200", caseType: "我國對外國請求（刑事）", uploadedBy: "國際科歐洲股－祈小姐", uploadedAt: "2026-09-10" },
    { fileName: "掃描_20260910_0912_重掃.pdf", documentNumber: "1080065107", caseType: "我國對外國請求（刑事）", uploadedBy: "國際科歐洲股－祈小姐", uploadedAt: "2026-09-10" },
    { fileName: "英方回復_附件02.pdf", documentNumber: "", caseType: "我國對外國請求（刑事）", uploadedBy: "國際科歐洲股－祈小姐", uploadedAt: "2026-09-10" }
  ];
  const search = document.getElementById("pendingReturnSearch");
  const body = document.getElementById("pendingReturnBody");
  const count = document.getElementById("pendingReturnCount");
  const normalize = value => String(value).normalize("NFKC").toLocaleLowerCase("zh-TW").trim();

  function addCell(row, value, className) {
    const cell = document.createElement("td");
    cell.textContent = value || "—";
    if (className) cell.className = className;
    row.appendChild(cell);
  }

  function render() {
    const query = normalize(search.value);
    const matches = documents.filter(function (item) {
      return normalize([item.fileName, item.documentNumber, item.caseType, item.uploadedBy, item.uploadedAt].join(" ")).includes(query);
    });
    const fragment = document.createDocumentFragment();

    matches.forEach(function (item) {
      const row = document.createElement("tr");
      addCell(row, item.fileName, "pending-return-file");
      addCell(row, item.documentNumber, "pending-return-document-number");
      addCell(row, item.caseType);
      addCell(row, item.uploadedBy);
      const dateCell = document.createElement("td");
      const date = document.createElement("time");
      dateCell.className = "pending-return-date";
      date.dateTime = item.uploadedAt;
      date.textContent = item.uploadedAt;
      dateCell.appendChild(date);
      row.appendChild(dateCell);
      fragment.appendChild(row);
    });

    if (!matches.length) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 5;
      cell.className = "pending-return-empty";
      cell.textContent = query ? "找不到符合條件的待回拋文件" : "目前沒有待回拋文件";
      row.appendChild(cell);
      fragment.appendChild(row);
    }

    body.replaceChildren(fragment);
    count.textContent = query ? "符合 " + matches.length + " 筆，共 " + documents.length + " 筆" : "共 " + documents.length + " 筆";
  }

  search.addEventListener("input", render);
  render();
})(window);
