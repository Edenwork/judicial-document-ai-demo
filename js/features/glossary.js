(function (global) {
  "use strict";
  const App = global.JudicialApp;

  // 示範資料；一筆長名稱可包含多個短名稱。
  const terms = [
    { longName: "Mutual Legal Assistance", shortNames: ["MLA"] },
    { longName: "Mutual Legal Assistance Treaty", shortNames: ["MLAT"] },
    { longName: "司法互助", shortNames: ["司法協助", "司法協作"] },
    { longName: "中華民國法務部", shortNames: ["法務部", "MOJ"] },
    { longName: "美國司法部", shortNames: ["美國 DOJ", "US DOJ"] },
    { longName: "電子郵件", shortNames: ["Email", "E-mail"] },
    { longName: "網際網路協定位址", shortNames: ["IP 位址", "IP address"] },
    { longName: "應用程式介面", shortNames: ["API"] }
  ];

  const STORAGE_KEY = "judicial-demo.glossary.v1";
  const PAGE_SIZE = 10;

  App.initGlossary = function () {
    const page = document.getElementById("page-glossary");
    const input = document.getElementById("glossarySearch");
    const body = document.getElementById("glossaryRows");
    const count = document.getElementById("glossaryCount");
    const empty = document.getElementById("glossaryEmpty");
    if (!page || !input || !body || !count || !empty || page.dataset.crudReady) return;
    page.dataset.crudReady = "true";
    let rows = terms.flatMap(term => term.shortNames.map(shortName => ({ longName: term.longName, shortName })));
    let currentPage = 1;
    let editingIndex = null;
    let deletingIndex = null;
    const normalize = value => value.trim().toLocaleLowerCase();
    const status = document.createElement("p");
    status.className = "subtle small mt-3";
    status.setAttribute("role", "status");
    page.append(status);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed) || !parsed.every(row => row && typeof row.longName === "string" && row.longName.trim() && typeof row.shortName === "string" && row.shortName.trim())) throw new Error("invalid data");
        rows = parsed;
      }
    } catch (_) {
      status.textContent = "無法讀取已儲存的詞彙，暫時顯示預設資料。";
    }
    const note = page.querySelector(":scope > p.subtle");
    if (note && note !== status) note.textContent = "目前為示範詞庫，修改僅儲存於此瀏覽器，不會同步至其他使用者。";
    const toolbar = document.createElement("div");
    toolbar.className = "glossary-toolbar";
    input.closest(".glossary-search").before(toolbar);
    toolbar.append(input.closest(".glossary-search"));
    const add = document.createElement("button");
    add.type = "button";
    add.className = "btn btn-primary";
    add.textContent = "新增詞彙";
    toolbar.append(add);
    const heading = document.createElement("th");
    heading.scope = "col";
    heading.textContent = "操作";
    body.closest("table").querySelector("thead tr").append(heading);
    const pagination = document.createElement("nav");
    pagination.id = "glossaryPagination";
    pagination.className = "admin-pagination";
    pagination.setAttribute("aria-label", "詞彙分頁");
    pagination.innerHTML = `<span class="admin-pagination-summary" aria-live="polite"></span>
      <div class="admin-pagination-controls">
        <button class="btn btn-sm btn-outline-secondary" type="button" data-direction="prev"><i data-lucide="chevron-left"></i>上一頁</button>
        <div class="admin-page-numbers" aria-label="頁碼"></div>
        <button class="btn btn-sm btn-outline-secondary" type="button" data-direction="next">下一頁<i data-lucide="chevron-right"></i></button>
      </div>`;
    page.querySelector(".glossary-panel").append(pagination);
    const dialog = document.createElement("dialog");
    dialog.className = "glossary-dialog";
    dialog.setAttribute("aria-labelledby", "glossaryDialogTitle");
    dialog.innerHTML = `<form id="glossaryForm">
      <h3 id="glossaryDialogTitle">新增詞彙</h3>
      <label for="glossaryLongName">術語（長名稱） <span aria-hidden="true">*</span></label>
      <input class="form-control" id="glossaryLongName" required maxlength="200" autocomplete="off">
      <label for="glossaryShortName">術語（短名稱） <span aria-hidden="true">*</span></label>
      <input class="form-control" id="glossaryShortName" required maxlength="200" autocomplete="off">
      <p class="subtle small">每筆填寫一個短名稱；相同長名稱可新增不同的短名稱。</p>
      <p class="glossary-error" role="alert" id="glossaryError"></p>
      <div class="glossary-dialog-actions"><button type="button" class="btn btn-outline-secondary" data-cancel>取消</button><button type="submit" class="btn btn-primary">儲存</button></div>
    </form>`;
    const deletion = document.createElement("dialog");
    deletion.className = "glossary-dialog";
    deletion.setAttribute("aria-labelledby", "glossaryDeleteTitle");
    deletion.innerHTML = `<h3 id="glossaryDeleteTitle">刪除詞彙</h3><p>確定要刪除以下對照嗎？此操作無法復原。</p><p class="glossary-delete-target"></p><p class="glossary-error" role="alert"></p><div class="glossary-dialog-actions"><button type="button" class="btn btn-outline-secondary" data-cancel autofocus>取消</button><button type="button" class="btn btn-danger" data-confirm>確認刪除</button></div>`;
    page.append(dialog, deletion);
    const form = dialog.querySelector("form");
    const longInput = dialog.querySelector("#glossaryLongName");
    const shortInput = dialog.querySelector("#glossaryShortName");
    const error = dialog.querySelector("#glossaryError");
    function persist(next, errorElement) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
      catch (_) { errorElement.textContent = "儲存失敗，請確認瀏覽器允許儲存資料或有足夠空間後再試。"; return false; }
      rows = next;
      return true;
    }
    function openEditor(index) {
      editingIndex = index;
      form.reset();
      error.textContent = "";
      dialog.querySelector("h3").textContent = index === null ? "新增詞彙" : "編輯詞彙";
      if (index !== null) { longInput.value = rows[index].longName; shortInput.value = rows[index].shortName; }
      dialog.showModal();
      longInput.focus();
    }
    function render() {
      const query = normalize(input.value);
      const matches = rows.map((term, index) => ({ term, index })).filter(({ term }) =>
        [term.longName, term.shortName].some(name => normalize(name).includes(query)));
      const totalPages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
      currentPage = Math.min(currentPage, totalPages);
      const start = (currentPage - 1) * PAGE_SIZE;
      body.replaceChildren();
      matches.slice(start, start + PAGE_SIZE).forEach(({ term, index }) => {
        const row = document.createElement("tr");
        const nameCell = document.createElement("td");
        nameCell.textContent = term.longName;
        const shortCell = document.createElement("td");
        const badge = document.createElement("span");
        badge.className = "glossary-alias";
        badge.textContent = term.shortName;
        shortCell.append(badge);
        const actions = document.createElement("td");
        const group = document.createElement("div");
        group.className = "glossary-row-actions";
        ["編輯", "刪除"].forEach((label, action) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "btn btn-sm " + (action ? "btn-outline-danger" : "btn-outline-secondary");
          button.textContent = label;
          button.setAttribute("aria-label", label + "：" + term.longName + "／" + term.shortName);
          button.addEventListener("click", () => {
            if (!action) return openEditor(index);
            deletingIndex = index;
            deletion.querySelector(".glossary-delete-target").textContent = term.longName + "／" + term.shortName;
            deletion.querySelector(".glossary-error").textContent = "";
            deletion.showModal();
          });
          group.append(button);
        });
        actions.append(group);
        row.append(nameCell, shortCell, actions);
        body.append(row);
      });
      count.textContent = query ? "顯示 " + matches.length + " / " + rows.length + " 筆" : "共 " + rows.length + " 筆";
      empty.hidden = matches.length !== 0;
      empty.textContent = rows.length ? "找不到符合的詞彙，請嘗試其他關鍵字。" : "尚無詞彙，請點選「新增詞彙」。";
      pagination.querySelector(".admin-pagination-summary").textContent = matches.length ? `第 ${start + 1}–${Math.min(start + PAGE_SIZE, matches.length)} 筆，共 ${matches.length} 筆` : "共 0 筆";
      pagination.querySelector('[data-direction="prev"]').disabled = currentPage === 1;
      pagination.querySelector('[data-direction="next"]').disabled = currentPage === totalPages;
      const numbers = pagination.querySelector(".admin-page-numbers");
      numbers.replaceChildren();
      for (let n = 1; n <= totalPages; n++) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn btn-sm audit-page-button" + (n === currentPage ? " active" : "");
        button.textContent = n;
        button.setAttribute("aria-label", "第 " + n + " 頁");
        if (n === currentPage) button.setAttribute("aria-current", "page");
        button.addEventListener("click", () => { currentPage = n; render(); });
        numbers.append(button);
      }
      App.renderIcons?.();
    }
    add.addEventListener("click", () => openEditor(null));
    [dialog, deletion].forEach(modal => modal.querySelector("[data-cancel]").addEventListener("click", () => modal.close()));
    form.addEventListener("submit", event => {
      event.preventDefault();
      const term = { longName: longInput.value.trim(), shortName: shortInput.value.trim() };
      if (!term.longName || !term.shortName) { error.textContent = "請填寫長名稱及短名稱，不能只有空白。"; return; }
      if (rows.some((row, index) => index !== editingIndex && normalize(row.longName) === normalize(term.longName) && normalize(row.shortName) === normalize(term.shortName))) {
        error.textContent = "此長名稱與短名稱的對照已存在。"; return;
      }
      const next = rows.slice();
      if (editingIndex === null) next.unshift(term); else next[editingIndex] = term;
      if (!persist(next, error)) return;
      if (editingIndex === null) { input.value = ""; currentPage = 1; }
      dialog.close();
      render();
      status.textContent = editingIndex === null ? "已新增詞彙。" : "已儲存詞彙修改。";
    });
    deletion.querySelector("[data-confirm]").addEventListener("click", () => {
      if (!persist(rows.filter((_, index) => index !== deletingIndex), deletion.querySelector(".glossary-error"))) return;
      deletion.close();
      render();
      status.textContent = "已刪除詞彙。";
    });
    pagination.querySelector('[data-direction="prev"]').addEventListener("click", () => { currentPage--; render(); });
    pagination.querySelector('[data-direction="next"]').addEventListener("click", () => { currentPage++; render(); });
    input.addEventListener("input", () => { currentPage = 1; render(); });
    render();
  };
})(window);
