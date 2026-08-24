(function (global) {
  "use strict";

  const App = global.JudicialApp;
  const DEMO_TODAY = new Date("2026-08-24T00:00:00");
  const documents = [
    {
      id: "doc-jp-bank",
      title: "日本銀行交易紀錄調取請求書",
      caseId: "ML-2026-0819-01",
      country: "日本",
      evidence: "銀行交易",
      status: "完成",
      anomaly: "normal",
      uploadedAt: "2026-08-19",
      pages: 18,
      hasDeadline: false,
      snippet: "請求提供指定帳戶於 2025 年度之銀行交易紀錄、匯款資料及帳戶實際受益人資訊。",
      match: "請求國家為日本，且證據類型包含銀行帳戶與交易紀錄。",
    },
    {
      id: "doc-us-platform",
      title: "美國平台帳號資料保全請求書",
      caseId: "ML-2026-0818-04",
      country: "美國",
      evidence: "平台帳號",
      status: "需人工審核",
      anomaly: "anomaly",
      uploadedAt: "2026-08-18",
      pages: 24,
      hasDeadline: true,
      snippet: "請求保全並提供境外平台帳號之註冊資料、登入紀錄、IP 位址及電子郵件。",
      match: "文件提及平台帳號資料，AI 並標示回覆期限欄位需人工確認。",
    },
    {
      id: "doc-sg-company",
      title: "新加坡公司登記與實質受益人請求書",
      caseId: "ML-2026-0818-02",
      country: "新加坡",
      evidence: "公司登記",
      status: "完成",
      anomaly: "normal",
      uploadedAt: "2026-08-18",
      pages: 15,
      hasDeadline: false,
      snippet: "請求提供公司登記、董事名冊、股權結構及實質受益人等商業紀錄。",
      match: "證據類型符合公司登記與實質受益人資料。",
    },
    {
      id: "doc-uk-witness",
      title: "英國證人訊問協助請求書",
      caseId: "ML-2026-0817-08",
      country: "英國",
      evidence: "證人訊問",
      status: "待複核",
      anomaly: "normal",
      uploadedAt: "2026-08-17",
      pages: 13,
      hasDeadline: true,
      snippet: "請求協助安排證人訊問、製作證詞筆錄，並於十月底前完成證據認證。",
      match: "文件包含證人訊問、證詞與十月底前回覆期限。",
    },
    {
      id: "doc-hk-freeze",
      title: "香港犯罪所得凍結協助請求書",
      caseId: "ML-2026-0815-06",
      country: "香港",
      evidence: "犯罪所得",
      status: "完成",
      anomaly: "normal",
      uploadedAt: "2026-08-15",
      pages: 21,
      hasDeadline: false,
      snippet: "請求追查涉案資金流向，並就指定帳戶內犯罪所得採取暫時凍結措施。",
      match: "文件明確要求追查及凍結犯罪所得。",
    },
    {
      id: "doc-jp-virtual",
      title: "日本虛擬資產交易資料補充請求書",
      caseId: "ML-2026-0721-05",
      country: "日本",
      evidence: "銀行交易、平台帳號",
      status: "處理中",
      anomaly: "anomaly",
      uploadedAt: "2026-07-21",
      pages: 11,
      hasDeadline: false,
      snippet: "追查犯罪所得由銀行帳戶轉入虛擬資產交易所之交易、錢包與平台帳號紀錄。",
      match: "文件同時提及日本、銀行資金流向與交易平台資料。",
    },
  ];

  const statusClassNames = {
    完成: "result-status--done",
    待複核: "result-status--warning",
    需人工審核: "result-status--danger",
    處理中: "result-status--processing",
  };

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function daysSince(dateValue) {
    return Math.floor((DEMO_TODAY - new Date(dateValue + "T00:00:00")) / 86400000);
  }

  function matchesNaturalLanguage(document, query) {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return true;

    const rules = [];
    ["日本", "美國", "新加坡", "英國", "香港"].forEach(function (country) {
      if (normalizedQuery.includes(country)) rules.push(document.country === country);
    });

    [
      { terms: ["銀行", "匯款", "帳戶"], test: document.evidence.includes("銀行交易") },
      { terms: ["平台", "帳號", "電子郵件", "ip"], test: document.evidence.includes("平台帳號") },
      { terms: ["公司", "受益人", "商業紀錄"], test: document.evidence.includes("公司登記") },
      { terms: ["證人", "訊問", "證詞"], test: document.evidence.includes("證人訊問") },
      { terms: ["凍結", "犯罪所得", "沒收"], test: document.evidence.includes("犯罪所得") },
      { terms: ["期限", "十月底"], test: document.hasDeadline },
      { terms: ["異常", "人工處置"], test: document.anomaly === "anomaly" },
    ].forEach(function (rule) {
      if (rule.terms.some(function (term) { return normalizedQuery.includes(term); })) rules.push(rule.test);
    });

    if (rules.length > 0) return rules.every(Boolean);

    const searchableText = [document.title, document.caseId, document.country, document.evidence, document.snippet]
      .join(" ")
      .toLowerCase();
    if (normalizedQuery.includes("ml-")) return searchableText.includes(normalizedQuery);
    return true;
  }

  App.initSearch = function () {
    const tabButtons = Array.from(document.querySelectorAll("[data-search-tab]"));
    const tabPanels = Array.from(document.querySelectorAll(".search-tab-panel"));
    const queryInput = document.getElementById("smartQuery");
    const searchResults = document.getElementById("searchResults");
    const resultsBody = document.getElementById("resultsBody");
    const selectVisible = document.getElementById("selectVisibleResults");
    const selectedDocuments = document.getElementById("selectedDocuments");
    const clearSelectedButton = document.getElementById("clearSelectedDocuments");
    const selectedIds = new Set();
    const filterElements = {
      caseId: document.getElementById("filterCase"),
      country: document.getElementById("filterCountry"),
      evidence: document.getElementById("filterEvidence"),
      status: document.getElementById("filterStatus"),
      anomaly: document.getElementById("filterAnomaly"),
      date: document.getElementById("filterDate"),
    };
    const searchState = {
      natural: { hasSearched: false, query: "" },
      filter: { hasSearched: false, values: null },
    };
    let activeTab = "natural";
    let visibleDocuments = [];
    let searchTimer;

    function readFilterValues() {
      return Object.keys(filterElements).reduce(function (values, key) {
        values[key] = filterElements[key].value;
        return values;
      }, {});
    }

    function matchesFilters(document, values) {
      const caseQuery = values.caseId.trim().toLowerCase();
      const dateRange = Number(values.date);
      return (!caseQuery || document.caseId.toLowerCase().includes(caseQuery))
        && (!values.country || document.country === values.country)
        && (!values.evidence || document.evidence.includes(values.evidence))
        && (!values.status || document.status === values.status)
        && (!values.anomaly || document.anomaly === values.anomaly)
        && (!dateRange || daysSince(document.uploadedAt) <= dateRange);
    }

    function getDocumentsForMode(mode) {
      if (mode === "natural") {
        return documents.filter(function (document) {
          return matchesNaturalLanguage(document, searchState.natural.query);
        });
      }
      if (mode === "filter" && searchState.filter.values) {
        return documents.filter(function (document) {
          return matchesFilters(document, searchState.filter.values);
        });
      }
      return [];
    }

    function renderResultItem(document) {
      const isSelected = selectedIds.has(document.id);
      return (
        '<article class="result-item' + (isSelected ? " is-selected" : "") + '" data-document-id="' + document.id + '">' +
        '<input class="form-check-input result-check" type="checkbox" aria-label="選取 ' + escapeHtml(document.title) + '" ' +
        (isSelected ? "checked" : "") + ">" +
        '<div class="result-icon"><i data-lucide="file-search"></i></div>' +
        '<div class="result-content"><h4><a href="#" class="doc-link open-result">' + escapeHtml(document.title) + "</a></h4>" +
        '<div class="result-meta"><span class="result-meta-item">' + escapeHtml(document.caseId) + "</span>" +
        '<span class="result-meta-item">' + escapeHtml(document.country) + "</span>" +
        '<span class="result-meta-item">' + escapeHtml(document.evidence) + "</span>" +
        '<span class="result-meta-item result-status ' + statusClassNames[document.status] + '">' + escapeHtml(document.status) + "</span></div>" +
        "<p>" + escapeHtml(document.snippet) + "</p>" +
        '<span class="result-match"><i data-lucide="sparkles"></i><span>' + escapeHtml(document.match) + "</span></span></div>" +
        '<button class="btn btn-sm btn-outline-secondary result-action open-result" type="button">查看文件</button>' +
        "</article>"
      );
    }

    function updateSelectVisibleState() {
      const selectedVisibleCount = visibleDocuments.filter(function (document) {
        return selectedIds.has(document.id);
      }).length;
      selectVisible.checked = visibleDocuments.length > 0 && selectedVisibleCount === visibleDocuments.length;
      selectVisible.indeterminate = selectedVisibleCount > 0 && selectedVisibleCount < visibleDocuments.length;
      selectVisible.disabled = visibleDocuments.length === 0;
    }

    function renderSelectedDocuments() {
      const selected = documents.filter(function (document) {
        return selectedIds.has(document.id);
      });
      document.getElementById("searchSelectedCount").textContent = selected.length;
      document.getElementById("selectedTabCount").textContent = selected.length;
      clearSelectedButton.disabled = selected.length === 0;
      document.querySelectorAll(".search-report-output").forEach(function (button) {
        button.disabled = selected.length === 0;
      });

      if (!selected.length) {
        selectedDocuments.innerHTML = '<div class="selection-empty"><i data-lucide="files"></i><strong>尚未選取文件</strong>' +
          '<span>請先透過自然語言查詢或條件式篩選找到文件。</span><div class="selection-empty-actions">' +
          '<button class="btn btn-sm btn-primary" data-open-search-tab="natural" type="button">前往自然語言查詢</button>' +
          '<button class="btn btn-sm btn-outline-secondary" data-open-search-tab="filter" type="button">前往條件式篩選</button></div></div>';
      } else {
        selectedDocuments.innerHTML = selected.map(function (document) {
          return '<div class="selected-document" data-document-id="' + document.id + '">' +
            '<input class="form-check-input selected-workspace-check" type="checkbox" checked aria-label="取消選取 ' + escapeHtml(document.title) + '">' +
            '<div class="selected-document-content"><strong><a href="#" class="doc-link open-selected-document">' + escapeHtml(document.title) + "</a></strong>" +
            '<span>' + escapeHtml(document.caseId + "・" + document.country + "・" + document.pages + " 頁") + "</span>" +
            '<div class="result-meta"><span class="result-meta-item">' + escapeHtml(document.evidence) + "</span>" +
            '<span class="result-meta-item result-status ' + statusClassNames[document.status] + '">' + escapeHtml(document.status) + "</span></div></div>" +
            '<button class="icon-btn remove-selected" type="button" aria-label="移除 ' + escapeHtml(document.title) + '"><i data-lucide="x"></i></button></div>';
        }).join("");
      }
      App.renderIcons();
    }

    function renderResults() {
      if (activeTab !== "natural" && activeTab !== "filter") return;
      const state = searchState[activeTab];
      if (!state.hasSearched) {
        searchResults.hidden = true;
        visibleDocuments = [];
        return;
      }

      visibleDocuments = getDocumentsForMode(activeTab);
      searchResults.hidden = false;
      document.getElementById("searchResultCount").textContent = "找到 " + visibleDocuments.length + " 份文件";
      document.getElementById("searchModeSummary").textContent = activeTab === "natural"
        ? "自然語言：" + (searchState.natural.query || "全部已入庫文件")
        : "依已套用的條件顯示";
      if (activeTab === "filter") {
        document.getElementById("filterResultCount").textContent = visibleDocuments.length + " 份符合";
      }

      resultsBody.innerHTML = visibleDocuments.length
        ? visibleDocuments.map(renderResultItem).join("")
        : '<div class="search-empty"><div><i data-lucide="search-x"></i><p class="mt-2 mb-1 fw-bold">找不到符合的文件</p><span>請調整查詢內容或篩選條件後再試一次。</span></div></div>';
      updateSelectVisibleState();
      App.renderIcons();
    }

    function showSearchLoading(message) {
      searchResults.hidden = false;
      resultsBody.innerHTML = '<div class="search-loading"><span class="loading-inline"><span class="spinner-mini"></span>' + message + "</span></div>";
      document.getElementById("searchResultCount").textContent = "搜尋中";
      document.getElementById("searchModeSummary").textContent = "正在比對文件資料";
      selectVisible.disabled = true;
    }

    function runSearch(mode) {
      global.clearTimeout(searchTimer);
      if (mode === "natural") searchState.natural.query = queryInput.value.trim();
      else searchState.filter.values = readFilterValues();
      searchState[mode].hasSearched = false;
      showSearchLoading(mode === "natural"
        ? "正在理解問題並比對文件內容、欄位與摘要..."
        : "正在套用條件並篩選已入庫文件...");

      searchTimer = global.setTimeout(function () {
        searchState[mode].hasSearched = true;
        if (activeTab === mode) renderResults();
        App.showToast(mode === "natural" ? "智慧搜尋完成。" : "條件篩選完成。");
      }, 700);
    }

    function refreshSelection() {
      renderSelectedDocuments();
      if ((activeTab === "natural" || activeTab === "filter") && searchState[activeTab].hasSearched) {
        renderResults();
      }
    }

    function setActiveTab(tabName, shouldFocus) {
      activeTab = tabName;
      tabButtons.forEach(function (button) {
        const isActive = button.dataset.searchTab === tabName;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-selected", String(isActive));
        button.tabIndex = isActive ? 0 : -1;
        if (isActive && shouldFocus) button.focus();
      });
      tabPanels.forEach(function (panel) {
        const controlledBy = tabButtons.find(function (button) {
          return button.getAttribute("aria-controls") === panel.id;
        });
        panel.hidden = !controlledBy || controlledBy.dataset.searchTab !== tabName;
      });

      if (tabName === "selected") {
        searchResults.hidden = true;
        renderSelectedDocuments();
      } else {
        renderResults();
      }
      App.renderIcons();
    }

    tabButtons.forEach(function (button, index) {
      button.addEventListener("click", function () {
        setActiveTab(button.dataset.searchTab, false);
      });
      button.addEventListener("keydown", function (event) {
        let nextIndex;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % tabButtons.length;
        if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabButtons.length) % tabButtons.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = tabButtons.length - 1;
        if (nextIndex === undefined) return;
        event.preventDefault();
        setActiveTab(tabButtons[nextIndex].dataset.searchTab, true);
      });
    });

    document.getElementById("smartSearch").addEventListener("click", function () {
      runSearch("natural");
    });
    queryInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") runSearch("natural");
    });
    document.querySelectorAll(".query-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        queryInput.value = chip.textContent.trim();
        runSearch("natural");
      });
    });

    document.getElementById("filterBody").addEventListener("submit", function (event) {
      event.preventDefault();
      runSearch("filter");
    });
    document.getElementById("resetFilters").addEventListener("click", function () {
      Object.values(filterElements).forEach(function (element) { element.value = ""; });
      searchState.filter = { hasSearched: false, values: null };
      document.getElementById("filterResultCount").textContent = "";
      if (activeTab === "filter") searchResults.hidden = true;
      App.showToast("條件篩選已清除。");
    });

    selectVisible.addEventListener("change", function () {
      visibleDocuments.forEach(function (document) {
        if (selectVisible.checked) selectedIds.add(document.id);
        else selectedIds.delete(document.id);
      });
      refreshSelection();
    });

    resultsBody.addEventListener("change", function (event) {
      if (!event.target.classList.contains("result-check")) return;
      const documentId = event.target.closest(".result-item").dataset.documentId;
      if (event.target.checked) selectedIds.add(documentId);
      else selectedIds.delete(documentId);
      refreshSelection();
    });
    resultsBody.addEventListener("click", function (event) {
      const resultLink = event.target.closest(".open-result");
      if (!resultLink) return;
      event.preventDefault();
      App.goToPage("review");
    });

    selectedDocuments.addEventListener("change", function (event) {
      if (!event.target.classList.contains("selected-workspace-check")) return;
      selectedIds.delete(event.target.closest(".selected-document").dataset.documentId);
      refreshSelection();
    });
    selectedDocuments.addEventListener("click", function (event) {
      const tabLink = event.target.closest("[data-open-search-tab]");
      const removeButton = event.target.closest(".remove-selected");
      const documentLink = event.target.closest(".open-selected-document");
      if (tabLink) setActiveTab(tabLink.dataset.openSearchTab, false);
      if (removeButton) {
        selectedIds.delete(removeButton.closest(".selected-document").dataset.documentId);
        refreshSelection();
      }
      if (documentLink) {
        event.preventDefault();
        App.goToPage("review");
      }
    });
    clearSelectedButton.addEventListener("click", function () {
      selectedIds.clear();
      refreshSelection();
      App.showToast("已清除所有已選文件。");
    });

    setActiveTab("natural", false);
    renderSelectedDocuments();
  };
})(window);
