(function (global) {
  "use strict";

  const App = global.JudicialApp;
  const get = id => document.getElementById(id);

  App.pageMeta["ocr-documents"] = ["文件清單表格", ""];
  App.pageMeta["ocr-viewer"] = ["OCR 檢視器", ""];

  // Fictional OCR data matched to the sample page images in assets/ocr.
  const documents = [
    {
      id: "tw-cn",
      name: "調查取證（臺請陸）示範案件",
      fileName: "調查取證請求函.pdf",
      updated: "2026/11/06 11:00",
      confidence: 0.37,
      quality: null,
      pages: [
        [
          "調查取證請求函",
          "發文日期：中華民國 115 年 11 月 6 日",
          "發文字號：示例字第 1150001234 號",
          "受文者：○○司法機關",
          "主旨：請協助調取本案相關證據，詳如說明。",
          "說明",
          "一、本案涉及跨境資金往來，為釐清交易過程，請協助取得指定期間之交易資料。",
          "二、請提供交易日期、交易金額、幣別及往來帳戶資料。若所列資料無法取得，請說明原因。",
          "三、檢附請求事項、資料範圍及交付清單各一份。",
          "正本：○○司法機關",
          "副本：○○地方檢察署",
        ],
        [
          "請求事項一覽",
          "案號：DEMO-ML-2026-001",
          "一、協助確認指定帳戶開戶資料。",
          "二、協助調取指定期間之交易明細。",
          "三、若資料已封存，請一併提供保存範圍與資料格式。",
        ],
        [
          "交易資料範圍",
          "資料期間：2026 年 1 月 1 日至 3 月 31 日。",
          "資料項目：入帳、出帳、交易時間、交易幣別及交易摘要。",
          "如交易時間含時區，請於交付資料中註記。",
          "如有欄位缺漏，請於備註中說明。",
        ],
        [
          "交付資料清單",
          "附件一：指定期間交易明細。",
          "附件二：交易欄位與代碼說明。",
          "附件三：資料來源及匯出日期。",
          "電子檔可採 PDF 或 CSV 格式。",
        ],
        [
          "回覆與聯繫",
          "回覆時請註明案號 DEMO-ML-2026-001。",
          "如需補充資料，請透過原司法互助管道聯繫。",
          "回覆應列出已完成項目，以及無法提供的項目與原因。",
        ],
      ],
    },
    {
      id: "japan",
      name: "日本銀行交易紀錄調取請求書",
      fileName: "日本銀行交易紀錄調取請求書.pdf",
      updated: "2026/08/24 14:32",
      confidence: 0.91,
      quality: "良好",
      pages: [
        [
          "銀行交易紀錄調取請求書",
          "案號：ML-2026-0819-01",
          "受請求國家：日本",
          "主旨：請協助提供指定期間的銀行交易紀錄。",
          "資料項目：帳戶開戶資料、交易明細與匯款紀錄。",
          "請於回覆中註明資料提供機構及匯出日期。",
        ],
        [
          "銀行資料欄位說明",
          "交易日期：請保留原始紀錄的日期格式。",
          "交易幣別：請註記各筆交易的原始幣別。",
          "金額：包含原始金額及適用的換算金額。",
          "若僅能取得部分資料，請註明可提供的期間。",
        ],
      ],
    },
    {
      id: "usa",
      name: "美國平台帳號資料保全請求書",
      fileName: "美國平台帳號資料保全請求書.pdf",
      updated: "2026/08/24 13:54",
      confidence: 0.86,
      quality: "良好",
      pages: [
        [
          "平台帳號資料保全請求書",
          "案號：ML-2026-0818-04",
          "受請求國家：美國",
          "主旨：請協助保全指定平台帳號的資料。",
          "期間：2025 年 1 月 1 日至 12 月 31 日。",
          "資料項目：註冊資訊、登入紀錄、IP 位址及裝置資訊。",
        ],
      ],
    },
  ];

  const thumbnails = get("ocrThumbnails");
  const pageImage = get("ocrPageImage");
  const jsonl = get("ocrJsonl");
  const previous = get("ocrPreviousDocument");
  const next = get("ocrNextDocument");
  let documentIndex = -1;

  function createDocumentLink(item, label, className) {
    const link = document.createElement("a");
    link.href = "?page=ocr-viewer&document=" + encodeURIComponent(item.id);
    link.className = className;
    link.dataset.ocrRoute = "ocr-viewer";
    link.dataset.documentId = item.id;
    link.textContent = label;
    return link;
  }

  function renderDocuments() {
    const rows = documents.map(item => {
      const row = document.createElement("tr");
      row.insertCell().append(createDocumentLink(item, item.name, "ocr-file-link"));
      const time = document.createElement("time");
      time.dateTime = item.updated.replaceAll("/", "-").replace(" ", "T");
      time.textContent = item.updated;
      row.insertCell().append(time);
      const view = createDocumentLink(item, "檢視", "btn btn-sm btn-primary");
      view.setAttribute("aria-label", "檢視 " + item.name);
      row.insertCell().append(view);
      return row;
    });
    get("ocrDocumentsBody").replaceChildren(...rows);
  }

  function imagePath(item, pageNo) {
    return "assets/ocr/" + item.id + "-" + pageNo + ".webp";
  }

  function setPage(pageNo) {
    const item = documents[documentIndex];
    const [title, ...paragraphs] = item.pages[pageNo - 1];
    const pageLabel = "第 " + pageNo + " 頁";
    get("ocrPageNumber").textContent = pageLabel;
    pageImage.src = imagePath(item, pageNo);
    pageImage.alt = pageLabel + "原稿，" + title;
    for (const button of thumbnails.children) {
      button.setAttribute("aria-current", Number(button.dataset.pageNumber) === pageNo ? "page" : "false");
    }
    jsonl.textContent = JSON.stringify({
      files: { source: { name: item.fileName } },
      page_no: pageNo,
      page_count: item.pages.length,
      status: "success",
      confidence: item.confidence,
      quality: item.quality,
      page: {
        width: Number(pageImage.getAttribute("width")),
        height: Number(pageImage.getAttribute("height")),
        markdown: "# " + title + "\n\n" + paragraphs.join("\n\n"),
      },
    }) + "\n";
    get("ocrJsonlBlock").scrollTop = 0;
  }

  function makeThumbnail(item, pageNo) {
    const button = document.createElement("button");
    button.className = "ocr-thumbnail";
    button.type = "button";
    button.dataset.pageNumber = pageNo;
    const image = document.createElement("img");
    image.src = imagePath(item, pageNo);
    image.alt = "";
    image.width = 880;
    image.height = 1244;
    const label = document.createElement("span");
    label.textContent = "第 " + pageNo + " 頁";
    button.append(image, label);
    return button;
  }

  App.loadOcrDocument = function (documentId) {
    documentIndex = documents.findIndex(item => item.id === documentId);
    const item = documents[documentIndex];
    get("ocrDocumentName").textContent = item?.name || "";
    get("ocrMissingDocument").hidden = Boolean(item);
    get("ocrDocumentContent").hidden = !item;
    if (!item) return;

    get("ocrConfidence").textContent = item.confidence.toFixed(2);
    get("ocrQuality").textContent = item.quality ?? "未提供";
    previous.disabled = documentIndex === 0;
    next.disabled = documentIndex === documents.length - 1;
    thumbnails.replaceChildren(...item.pages.map((_, index) => makeThumbnail(item, index + 1)));
    setPage(1);
  };

  function switchDocument(offset) {
    const item = documents[documentIndex + offset];
    if (!item) return;
    const active = document.activeElement;
    App.goToPage("ocr-viewer", {
      documentId: item.id,
      ocrFrom: history.state?.ocrFrom,
      replaceHistory: true,
    });
    if (active === next && next.disabled) previous.focus({ preventScroll: true });
    if (active === previous && previous.disabled) next.focus({ preventScroll: true });
  }

  function selectResult() {
    const selection = global.getSelection();
    const range = document.createRange();
    range.selectNodeContents(jsonl);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  get("ocrCopy").addEventListener("click", async function () {
    try {
      await global.navigator.clipboard.writeText(jsonl.textContent);
    } catch (error) {
      get("ocrJsonlBlock").focus({ preventScroll: true });
      selectResult();
      App.showToast("已選取 JSONL，請使用 Ctrl+C 或 ⌘C 複製。", "warning");
      return;
    }
    App.showToast("已複製此頁 JSONL。");
  });

  thumbnails.addEventListener("click", function (event) {
    const button = event.target.closest("[data-page-number]");
    if (button) setPage(Number(button.dataset.pageNumber));
  });
  previous.addEventListener("click", () => switchDocument(-1));
  next.addEventListener("click", () => switchDocument(1));

  function focusPage(pageName) {
    const selector = {
      files: ".ocr-list-entry",
      "ocr-documents": "#ocrDocumentsTitle",
      "ocr-viewer": "#ocrViewerTitle",
    }[pageName];
    document.querySelector(selector).focus({ preventScroll: true });
  }

  document.addEventListener("click", function (event) {
    const link = event.target.closest("[data-ocr-route]");
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    const target = link.dataset.ocrRoute;
    const isBack = link.hasAttribute("data-ocr-back");
    if (isBack && history.state?.ocrFrom === target) {
      global.addEventListener("popstate", function () { focusPage(target); }, { once: true });
      history.back();
      return;
    }
    App.goToPage(target, {
      documentId: link.dataset.documentId,
      ocrFrom: isBack ? undefined : target === "ocr-documents" ? "files" : "ocr-documents",
    });
    focusPage(target);
  });

  renderDocuments();
})(window);
