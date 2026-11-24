(function (global) {
  "use strict";

  const App = global.JudicialApp;
  const page = document.getElementById("page-pending-return");
  if (!App || !page) return;

  App.pageMeta["pending-return"] = ["待回拋案件", "查找待回拋案件"];

  App.pageMeta["pending-return-document"] = ["文件 JSON", ""];

  // UI demonstration records; replace with the pending-return API when available.
  const documents = [
    {
      id: "scan-20261119",
      fileName: "掃描_20261119.pdf",
      documentNumber: "1080062971",
      caseType: "我國對外國請求（刑事）",
      uploadedBy: "Justin.Lee",
      uploadedAt: "2026-11-19",
      documentJson: {
        documentType: "外交部函",
        sourceDate: "2021-03-17",
        sender: "外交部",
        recipient: "法務部",
        deliveryMethod: "紙本寄送",
        urgency: "最速件",
        subject: "轉送瑞典就涉嫌違反著作權案件提出的司法互助補充請求。",
        attachments: ["瑞典貿易暨投資委員會台北辦事處來函影本", "司法互助請求書正本等資料"],
        cc: ["瑞典貿易暨投資委員會台北辦事處", "駐瑞典代表處"],
        summary: "依瑞典貿易暨投資委員會台北辦事處 2021-03-10 來函，檢送請求書及相關資料予法務部。",
        sourcePages: {
          available: [1],
          total: 1
        }
      }
    },
    {
      id: "scan-20260910-0921",
      fileName: "掃描_20260910_0921.pdf",
      documentNumber: "1080065200",
      caseType: "我國對外國請求（刑事）",
      uploadedBy: "lisa.wu",
      uploadedAt: "2026-09-10",
      documentJson: {
        documentType: "法務部函（副本）",
        sourceDate: "2021-03-24",
        sender: "法務部",
        recipient: "法務部國際及兩岸法律司",
        urgency: "最速件",
        attachments: "原函載明如說明五，目前提供的頁面未含該段。",
        subject: "瑞典就涉嫌違反著作權法案件向我國提出刑事司法互助補充請求。",
        summary: "請續依法辦理瑞典提出的補充請求並函復。",
        requestedAssistance: [
          "協助詢問能提供比特幣錢包所有人資訊的證人，並取得說明或書面證明。",
          "若資訊僅能在歐洲取得，請協助確認可提供資訊的國家、公司與聯絡對象。"
        ],
        sourcePages: {
          available: [1],
          total: 2
        }
      }
    },
    {
      id: "scan-20260910-0912-a",
      fileName: "掃描_20260910_0912_重掃.pdf",
      documentNumber: "1080065107",
      caseType: "我國對外國請求（刑事）",
      uploadedBy: "lisa.wu",
      uploadedAt: "2026-09-10",
      documentJson: {
        documentType: "外交部函",
        sourceDate: "2021-03-17",
        sender: "外交部",
        recipient: "法務部",
        deliveryMethod: "紙本寄送",
        urgency: "最速件",
        subject: "轉送瑞典就涉嫌違反著作權案件提出的司法互助補充請求。",
        attachments: ["瑞典貿易暨投資委員會台北辦事處來函影本", "司法互助請求書正本等資料"],
        cc: ["瑞典貿易暨投資委員會台北辦事處", "駐瑞典代表處"],
        summary: "依瑞典貿易暨投資委員會台北辦事處 2021-03-10 來函，檢送請求書及相關資料予法務部。",
        sourcePages: {
          available: [1],
          total: 1
        }
      }
    },
    {
      id: "scan-20260910-0912-b",
      fileName: "掃描_20261011_1014.pdf",
      documentNumber: "1080065107",
      caseType: "我國對外國請求（刑事）",
      uploadedBy: "lisa.wu",
      uploadedAt: "2026-10-10",
      documentJson: {
        documentType: "刑事犯罪案件司法協助補充申請（中文譯本）",
        sourceDate: "2021-01-22",
        translationCertificationDate: "2021-01-28",
        sender: "瑞典國家檢察部",
        recipient: "臺灣有管轄權的司法部門",
        legalBasis: "互惠原則",
        subject: "就涉嫌違反著作權法案件補充請求詢問證人。",
        urgency: "存在證據遭移轉或銷毀的風險。",
        requestedAssistance: [
          "詢問虛擬資產平台的知情代表，以取得涉案比特幣錢包所有人的資訊。",
          "若資料僅能在歐洲取得，協助確認可提供資料的國家、公司與有權提供資料的人員。",
          "可提供詢問紀錄或公司代表的書面證明。"
        ],
        confidentialityRequest: "請勿向相關客戶透露所請求的措施，以免影響調查。",
        sourcePages: {
          available: [1, 2],
          total: 2
        }
      }
    }
  ];
  const search = document.getElementById("pendingReturnSearch");
  const body = document.getElementById("pendingReturnBody");
  const count = document.getElementById("pendingReturnCount");
  const summary = document.getElementById("pendingReturnPageSummary");
  const pageNumbers = document.getElementById("pendingReturnPageNumbers");
  const previousPage = document.getElementById("pendingReturnPrevPage");
  const nextPage = document.getElementById("pendingReturnNextPage");
  const dateHeading = document.getElementById("pendingReturnDateHeading");
  const dateSort = document.getElementById("pendingReturnDateSort");
  const dateDirection = document.getElementById("pendingReturnDateDirection");
  const detailTitle = document.getElementById("pendingReturnDocumentTitle");
  const detailNumber = document.getElementById("pendingReturnDocumentNumber");
  const jsonSource = document.getElementById("pendingReturnJsonSource");
  const jsonBlock = document.getElementById("pendingReturnJsonBlock");
  const jsonContent = document.getElementById("pendingReturnJson");
  const jsonEmpty = document.getElementById("pendingReturnJsonEmpty");
  const back = document.getElementById("pendingReturnBack");
  const PAGE_SIZE = 10;
  let currentPage = 1;
  let sortDirection = "descending";
  const normalize = value => String(value).normalize("NFKC").toLocaleLowerCase("zh-TW").trim();

  function addCell(row, value, className) {
    const cell = document.createElement("td");
    cell.textContent = value || "—";
    if (className) cell.className = className;
    row.appendChild(cell);
    return cell;
  }

  function renderJson(source) {
    const json = JSON.stringify(source, null, 2);
    const tokens = /("(?:\\.|[^"\\])*")([ \t]*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;
    const fragment = document.createDocumentFragment();
    let offset = 0;

    for (const match of json.matchAll(tokens)) {
      const [value, quoted, colon, literal] = match;
      const token = document.createElement("span");
      token.className = "json-" + (colon ? "key" : quoted ? "string" : literal ? "literal" : "number");
      token.textContent = quoted || value;
      fragment.append(json.slice(offset, match.index), token);
      if (colon) fragment.append(colon);
      offset = match.index + value.length;
    }
    fragment.append(json.slice(offset));
    jsonContent.replaceChildren(fragment);
  }

  App.loadPendingReturnDocument = function (id) {
    const item = documents.find(document => document.id === id);
    const hasJson = Boolean(item && item.documentJson);

    detailTitle.textContent = item ? item.fileName : "找不到文件";
    detailNumber.textContent = item ? "文號 " + item.documentNumber : "";
    detailNumber.hidden = !item;
    jsonSource.hidden = !hasJson;
    jsonBlock.hidden = !hasJson;
    jsonEmpty.hidden = hasJson;
    if (hasJson) {
      renderJson(item.documentJson);
    } else {
      jsonContent.replaceChildren();
      jsonEmpty.textContent = item ? "目前沒有這份文件的 JSON 資料。" : "請返回待回拋案件，重新選取文件。";
    }
  };

  function render() {
    const query = normalize(search.value);
    const matches = documents.filter(function (item) {
      return normalize([item.fileName, item.documentNumber, item.caseType, item.uploadedBy, item.uploadedAt].join(" ")).includes(query);
    }).sort(function (a, b) {
      // ISO dates sort chronologically; equal dates retain their original order.
      const difference = a.uploadedAt.localeCompare(b.uploadedAt);
      return sortDirection === "ascending" ? difference : -difference;
    });
    dateHeading.setAttribute("aria-sort", sortDirection);
    const descending = sortDirection === "descending";
    dateDirection.textContent = descending ? "↓" : "↑";
    dateSort.title = descending ? "改為最舊在前" : "改為最新在前";
    dateSort.setAttribute("aria-label", "上傳日期：目前" + (descending ? "最新" : "最舊") + "在前，點選" + dateSort.title);
    const totalPages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
    currentPage = Math.min(Math.max(currentPage, 1), totalPages);
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const pageDocuments = matches.slice(startIndex, startIndex + PAGE_SIZE);
    const fragment = document.createDocumentFragment();

    pageDocuments.forEach(function (item) {
      const row = document.createElement("tr");
      const fileCell = addCell(row, "", "pending-return-file");
      const fileLink = document.createElement("a");
      fileLink.href = "?page=pending-return-document&document=" + encodeURIComponent(item.id);
      fileLink.dataset.documentId = item.id;
      fileLink.textContent = item.fileName;
      fileCell.replaceChildren(fileLink);
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
      cell.textContent = query ? "找不到符合條件的待回拋案件" : "目前沒有待回拋案件";
      row.appendChild(cell);
      fragment.appendChild(row);
    }

    body.replaceChildren(fragment);
    count.textContent = query ? "符合 " + matches.length + " 筆，共 " + documents.length + " 筆" : "共 " + documents.length + " 筆";
    summary.textContent = "第 " + (matches.length ? startIndex + 1 : 0) + "–" + (startIndex + pageDocuments.length) + " 筆，共 " + matches.length + " 筆";
    previousPage.disabled = currentPage === 1;
    nextPage.disabled = currentPage === totalPages;
    const buttons = document.createDocumentFragment();
    for (let number = 1; number <= totalPages; number += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn btn-sm audit-page-button" + (number === currentPage ? " active" : "");
      button.dataset.pendingReturnPage = String(number);
      button.textContent = String(number);
      button.setAttribute("aria-label", "第 " + number + " 頁");
      button.setAttribute("aria-current", number === currentPage ? "page" : "false");
      buttons.appendChild(button);
    }
    pageNumbers.replaceChildren(buttons);
  }

  body.addEventListener("click", function (event) {
    const link = event.target.closest("a[data-document-id]");
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    App.goToPage("pending-return-document", { documentId: link.dataset.documentId });
    detailTitle.focus({ preventScroll: true });
  });

  back.addEventListener("click", function (event) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    if (global.history.state && global.history.state.fromPendingReturn) {
      global.history.back();
    } else {
      App.goToPage("pending-return");
    }
  });

  dateSort.addEventListener("click", function () {
    sortDirection = sortDirection === "descending" ? "ascending" : "descending";
    currentPage = 1;
    render();
  });
  search.addEventListener("input", function () {
    currentPage = 1;
    render();
  });
  previousPage.addEventListener("click", function () {
    currentPage -= 1;
    render();
  });
  nextPage.addEventListener("click", function () {
    currentPage += 1;
    render();
  });
  pageNumbers.addEventListener("click", function (event) {
    const button = event.target.closest("[data-pending-return-page]");
    if (!button) return;
    currentPage = Number(button.dataset.pendingReturnPage);
    render();
  });
  render();
})(window);
