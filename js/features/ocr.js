(function (global) {
  "use strict";

  const App = global.JudicialApp;
  const get = id => document.getElementById(id);

  App.pageMeta["ocr-documents"] = ["文件清單表格", ""];
  App.pageMeta["ocr-viewer"] = ["OCR 檢視器", ""];

  const documents = [App.ocrDocument, ...App.ocrDemoDocuments];

  const thumbnails = get("ocrThumbnails");
  const recognizedText = get("ocrRecognizedText");
  const pageImage = get("ocrPageImage");
  const boxOverlay = get("ocrBoxOverlay");
  const boxTooltip = get("ocrBoxTooltip");
  const confidenceFormat = new Intl.NumberFormat("en-US", {
    maximumSignificantDigits: 4,
    useGrouping: false,
  });
  const jsonl = get("ocrJsonl");
  const previous = get("ocrPreviousDocument");
  const next = get("ocrNextDocument");
  const textView = { tab: get("ocrTextTab"), panel: get("ocrTextPanel") };
  const jsonlView = { tab: get("ocrJsonlTab"), panel: get("ocrJsonlPanel") };
  const resultViews = [textView, jsonlView];
  const availableTabs = resultViews.filter(view => view.tab && view.panel);
  const defaultView = availableTabs.includes(jsonlView)
    ? jsonlView
    : availableTabs[0] ?? (jsonlView.panel ? jsonlView : textView);
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
    const tableBody = get("ocrDocumentsBody");
    if (!tableBody) return;

    const rows = documents.map(item => {
      const row = document.createElement("tr");
      row.insertCell().append(createDocumentLink(item, item.name, "ocr-file-link"));
      row.insertCell().textContent = item.updated ?? "—";
      const view = createDocumentLink(item, "檢視", "btn btn-sm btn-primary");
      view.setAttribute("aria-label", "檢視 " + item.name);
      row.insertCell().append(view);
      return row;
    });
    tableBody.replaceChildren(...rows);
  }

  function imagePath(item, pageNo) {
    return "assets/ocr/" + item.id + "-" + pageNo;
  }

  function renderBoxes(record) {
    if (!boxOverlay) return;
    if (boxTooltip) boxTooltip.hidden = true;
    boxOverlay.replaceChildren();
    boxOverlay.setAttribute("hidden", "");

    const { width, height } = record.page || {};
    if (!(width > 0 && height > 0) || !Array.isArray(record.regions)) return;

    boxOverlay.setAttribute("viewBox", "0 0 " + width + " " + height);
    for (const { bbox, confidence } of record.regions) {
      if (!Array.isArray(bbox) || bbox.length < 3 ||
          !bbox.every(point => Array.isArray(point) && point.length === 2 && point.every(Number.isFinite))) continue;

      const box = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      box.setAttribute("class", "ocr-bounding-box");
      box.setAttribute("points", bbox.map(point => point.join(",")).join(" "));
      if (boxTooltip) {
        box.addEventListener("pointerenter", () => {
          const xs = bbox.map(point => point[0]);
          const ys = bbox.map(point => point[1]);
          const center = (Math.min(...xs) + Math.max(...xs)) / 2;
          boxTooltip.style.setProperty("--ocr-box-x", center / width * 100 + "%");
          boxTooltip.style.setProperty("--ocr-box-y", Math.max(...ys) / height * 100 + "%");
          boxTooltip.textContent = "信心指數 " + (Number.isFinite(confidence)
            ? confidenceFormat.format(confidence)
            : "未提供");
          boxTooltip.hidden = false;
        });
        box.addEventListener("pointerleave", () => {
          boxTooltip.hidden = true;
        });
      }
      boxOverlay.append(box);
    }
    boxOverlay.toggleAttribute("hidden", boxOverlay.children.length === 0);
  }

  // OCR variants may omit cards, controls or entire panes in the HTML.
  function setText(id, value) {
    const element = get(id);
    if (element) element.textContent = value;
  }

  function setHidden(id, hidden) {
    const element = get(id);
    if (element) element.hidden = hidden;
  }

  function setPage(pageNo) {
    const item = documents[documentIndex];
    const [width, height, jsonlLine] = item.pages[pageNo - 1];
    const record = JSON.parse(jsonlLine);
    const pageLabel = "第 " + pageNo + " 頁";
    const pageCountLabel = record.page_count > item.pages.length ? "預覽前 " : "共 ";
    setText("ocrPageNumber", pageLabel + "／" + pageCountLabel + item.pages.length + " 頁");
    if (pageImage) {
      pageImage.width = width;
      pageImage.height = height;
      pageImage.src = imagePath(item, pageNo) + ".webp";
      pageImage.alt = item.name + " " + pageLabel + "原稿";
      renderBoxes(record);
    }
    if (thumbnails) {
      for (const button of thumbnails.children) {
        button.setAttribute("aria-current", Number(button.dataset.pageNumber) === pageNo ? "page" : "false");
      }
    }

    if (recognizedText) {
      recognizedText.textContent = record.status === "failed"
        ? "此頁 OCR 辨識失敗。可切換到 JSONL 查看原始錯誤資訊。"
        : (record.markdown || record.page?.markdown || "此頁沒有辨識文字。");
      recognizedText.scrollTop = 0;
    }
    if (jsonl) {
      jsonl.textContent = jsonlLine + "\n";
      const block = get("ocrJsonlBlock");
      if (block) block.scrollTop = 0;
    }
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
    setText("ocrDocumentName", item?.name || "");
    setHidden("ocrMissingDocument", Boolean(item));
    setHidden("ocrDocumentContent", !item);
    setText("ocrConfidence", item?.confidence?.toFixed(2) ?? "未提供");
    setText("ocrQuality", item?.quality ?? "未提供");
    if (!item) return;

    if (previous) previous.disabled = documentIndex === 0;
    if (next) next.disabled = documentIndex === documents.length - 1;
    if (thumbnails) {
      thumbnails.replaceChildren(...item.pages.map((_, index) => makeThumbnail(item, index + 1)));
      thumbnails.scrollTop = 0;
      thumbnails.scrollLeft = 0;
    }
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
    if (active === next && next?.disabled) previous?.focus({ preventScroll: true });
    if (active === previous && previous?.disabled) next?.focus({ preventScroll: true });
  }

  function activateView(selected) {
    for (const view of resultViews) {
      const { tab, panel } = view;
      const active = view === selected;
      if (tab) {
        tab.hidden = !panel;
        tab.setAttribute("aria-selected", String(active && Boolean(panel)));
        tab.tabIndex = active && panel ? 0 : -1;
      }
      if (panel) panel.hidden = !active;
    }
  }

  for (const [index, view] of availableTabs.entries()) {
    const { tab } = view;
    tab.addEventListener("click", () => activateView(view));
    tab.addEventListener("keydown", event => {
      const last = availableTabs.length - 1;
      const target = {
        ArrowLeft: availableTabs[index === 0 ? last : index - 1],
        ArrowRight: availableTabs[index === last ? 0 : index + 1],
        Home: availableTabs[0],
        End: availableTabs[last],
      }[event.key];
      if (!target) return;
      event.preventDefault();
      activateView(target);
      target.tab.focus();
    });
  }

  function selectResult() {
    const selection = global.getSelection();
    const range = document.createRange();
    range.selectNodeContents(jsonl);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  async function copyResult() {
    try {
      await global.navigator.clipboard.writeText(jsonl.textContent);
    } catch (error) {
      get("ocrJsonlBlock")?.focus({ preventScroll: true });
      selectResult();
      App.showToast("已選取 JSONL，請使用 Ctrl+C 或 ⌘C 複製。", "warning");
      return;
    }
    App.showToast("已複製此頁 JSONL。");
  }

  const copy = get("ocrCopy");
  if (copy) {
    copy.disabled = !jsonl;
    if (jsonl) copy.addEventListener("click", copyResult);
  }

  thumbnails?.addEventListener("click", function (event) {
    const button = event.target.closest("[data-page-number]");
    if (button) setPage(Number(button.dataset.pageNumber));
  });
  previous?.addEventListener("click", () => switchDocument(-1));
  next?.addEventListener("click", () => switchDocument(1));

  function focusPage(pageName) {
    const selector = {
      files: ".ocr-list-entry",
      "ocr-documents": "#ocrDocumentsTitle",
      "ocr-viewer": "#ocrViewerTitle",
    }[pageName];
    if (selector) document.querySelector(selector)?.focus({ preventScroll: true });
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
    if (target === "ocr-viewer") activateView(defaultView);
    App.goToPage(target, {
      documentId: link.dataset.documentId,
      ocrFrom: isBack ? undefined : target === "ocr-documents" ? "files" : "ocr-documents",
    });
    focusPage(target);
  });

  activateView(defaultView);
  renderDocuments();
})(window);
