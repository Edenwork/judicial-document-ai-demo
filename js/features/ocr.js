(function (global) {
  "use strict";

  const App = global.JudicialApp;
  const get = id => document.getElementById(id);

  App.pageMeta["ocr-documents"] = ["文件清單表格", ""];
  App.pageMeta["ocr-viewer"] = ["OCR 檢視器", ""];

  const documents = [App.ocrDocument];

  const thumbnails = get("ocrThumbnails");
  const recognizedText = get("ocrRecognizedText");
  const pageImage = get("ocrPageImage");
  const jsonl = get("ocrJsonl");
  const previous = get("ocrPreviousDocument");
  const next = get("ocrNextDocument");
  const tabs = [get("ocrTextTab"), get("ocrJsonlTab")];
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
      row.insertCell().textContent = item.updated ?? "—";
      const view = createDocumentLink(item, "檢視", "btn btn-sm btn-primary");
      view.setAttribute("aria-label", "檢視 " + item.name);
      row.insertCell().append(view);
      return row;
    });
    get("ocrDocumentsBody").replaceChildren(...rows);
  }

  function imagePath(item, pageNo) {
    return "assets/ocr/" + item.id + "-" + pageNo;
  }

  function setPage(pageNo) {
    const item = documents[documentIndex];
    const [width, height, jsonlLine] = item.pages[pageNo - 1];
    const record = JSON.parse(jsonlLine);
    const pageLabel = "第 " + pageNo + " 頁";
    get("ocrPageNumber").textContent = pageLabel + "／預覽前 " + item.pages.length + " 頁";
    pageImage.width = width;
    pageImage.height = height;
    pageImage.src = imagePath(item, pageNo) + ".webp";
    pageImage.alt = item.name + " " + pageLabel + "原稿";
    for (const button of thumbnails.children) {
      button.setAttribute("aria-current", Number(button.dataset.pageNumber) === pageNo ? "page" : "false");
    }

    recognizedText.textContent = record.status === "failed"
      ? "此頁 OCR 辨識失敗。可切換到 JSONL 查看原始錯誤資訊。"
      : record.markdown || "此頁沒有辨識文字。";
    recognizedText.scrollTop = 0;
    jsonl.textContent = jsonlLine + "\n";
    get("ocrJsonlBlock").scrollTop = 0;
  }

  function makeThumbnail(item, pageNo) {
    const button = document.createElement("button");
    button.className = "ocr-thumbnail";
    button.type = "button";
    button.dataset.pageNumber = pageNo;
    const image = document.createElement("img");
    image.loading = "lazy";
    image.decoding = "async";
    image.src = imagePath(item, pageNo) + "-thumb.webp";
    image.alt = "";
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
    get("ocrConfidence").textContent = item?.confidence?.toFixed(2) ?? "未提供";
    get("ocrQuality").textContent = item?.quality ?? "未提供";
    if (!item) return;

    previous.disabled = documentIndex === 0;
    next.disabled = documentIndex === documents.length - 1;
    thumbnails.replaceChildren(...item.pages.map((_, index) => makeThumbnail(item, index + 1)));
    thumbnails.scrollTop = 0;
    thumbnails.scrollLeft = 0;
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

  function activateTab(selected) {
    for (const tab of tabs) {
      const active = tab === selected;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      get(tab.getAttribute("aria-controls")).hidden = !active;
    }
  }

  for (const [index, tab] of tabs.entries()) {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", event => {
      const target = {
        ArrowLeft: tabs[1 - index],
        ArrowRight: tabs[1 - index],
        Home: tabs[0],
        End: tabs[tabs.length - 1],
      }[event.key];
      if (!target) return;
      event.preventDefault();
      activateTab(target);
      target.focus();
    });
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
    if (target === "ocr-viewer") activateTab(tabs[0]);
    App.goToPage(target, {
      documentId: link.dataset.documentId,
      ocrFrom: isBack ? undefined : target === "ocr-documents" ? "files" : "ocr-documents",
    });
    focusPage(target);
  });

  renderDocuments();
})(window);
