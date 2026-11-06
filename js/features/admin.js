(function (global) {
  "use strict";

  const App = global.JudicialApp;
  const AUDIT_PAGE_SIZE = 10;
  const auditLogs = [
    {
      date: "2026-08-20",
      time: "15:18:42",
      user: "王小明",
      unit: "國際科／亞洲股",
      module: "AI 覆核",
      action: "修正 AI 擷取欄位",
      target: "美國平台帳號資料保全請求書",
      result: "成功",
    },
    {
      date: "2026-08-20",
      time: "14:52:10",
      user: "陳怡君",
      unit: "國際科／歐洲股",
      module: "案件管理",
      action: "查詢文件",
      target: "ML-2026-0817-08 英國證人訊問協助請求書",
      result: "成功",
    },
    {
      date: "2026-08-20",
      time: "13:41:27",
      user: "林志宏",
      unit: "系統管理",
      module: "帳號管理",
      action: "解除帳號鎖定",
      target: "帳號：hsu.mt",
      result: "成功",
    },
    {
      date: "2026-08-20",
      time: "11:26:03",
      user: "徐美婷",
      unit: "國際科／美洲股",
      module: "登入驗證",
      action: "帳號登入",
      target: "司法互助AI助理",
      result: "失敗",
    },
    {
      date: "2026-08-20",
      time: "10:08:55",
      user: "黃建國",
      unit: "國兩司",
      module: "AI 覆核",
      action: "需人工審核核准",
      target: "日本銀行交易紀錄調取請求書",
      result: "成功",
    },
    {
      date: "2026-08-20",
      time: "09:17:36",
      user: "何宗翰",
      unit: "兩岸科",
      module: "登入驗證",
      action: "變更密碼",
      target: "帳號：ho.zh",
      result: "成功",
    },
  ];

  const additionalAuditLogs = [
    ["2026-08-20", "08:52:14", "陳國勝", "國際科", "帳號管理", "修改角色權限", "角色：國際科主管", "成功"],
    ["2026-08-20", "08:31:09", "林淑恩", "亞洲股／東南亞", "案件管理", "下載文件", "新加坡公司登記資料附件", "成功"],
    ["2026-08-20", "08:12:46", "張雅雯", "國際科／歐洲股", "登入驗證", "帳號登入", "司法互助AI助理", "成功"],
    ["2026-08-20", "07:58:22", "系統服務", "系統管理", "案件管理", "批次匯入文件", "ML-2026-0820-03，共 4 份文件", "成功"],
    ["2026-08-19", "17:42:18", "王小明", "國際科／亞洲股", "AI 覆核", "確認 AI 摘要", "加拿大電子郵件證據保全請求書", "成功"],
    ["2026-08-19", "16:35:51", "徐美婷", "國際科／美洲股", "案件管理", "修改案件國家", "ML-2026-0818-04", "成功"],
    ["2026-08-19", "15:27:33", "林志宏", "系統管理", "帳號管理", "停用使用者帳號", "帳號：lin.cy", "成功"],
    ["2026-08-19", "14:19:07", "何宗翰", "兩岸科", "登入驗證", "帳號登入", "司法互助AI助理", "失敗"],
    ["2026-08-19", "13:08:44", "黃建國", "國兩司", "AI 覆核", "退回人工審核", "德國電信通聯紀錄調取請求書", "成功"],
    ["2026-08-19", "11:56:20", "陳怡君", "國際科／歐洲股", "案件管理", "查詢文件", "法國公司實質受益人資料請求書", "成功"],
    ["2026-08-19", "10:43:05", "王小明", "國際科／亞洲股", "AI 覆核", "修正證據類型標籤", "日本虛擬資產交易資料補充請求書", "成功"],
    ["2026-08-19", "09:28:39", "系統服務", "系統管理", "案件管理", "OCR 處理失敗", "澳洲虛擬資產錢包交易紀錄", "失敗"],
    ["2026-08-18", "17:16:12", "張雅雯", "國際科／歐洲股", "案件管理", "新增案件文件", "英國證人訊問筆錄與認證文件", "成功"],
    ["2026-08-18", "16:04:58", "林志宏", "系統管理", "帳號管理", "新增使用者帳號", "帳號：chang.yw", "成功"],
    ["2026-08-18", "14:51:31", "林淑恩", "亞洲股／東南亞", "AI 覆核", "批次確認正常欄位", "新加坡公司登記與實質受益人請求書", "成功"],
    ["2026-08-18", "13:37:26", "徐美婷", "國際科／美洲股", "登入驗證", "變更密碼", "帳號：hsu.mt", "成功"],
    ["2026-08-18", "11:22:43", "陳國勝", "國際科", "帳號管理", "解除帳號鎖定", "帳號：wang.xm", "成功"],
    ["2026-08-18", "09:09:15", "系統服務", "系統管理", "案件管理", "發布 API 資料", "ML-2026-0815-06", "成功"],
  ].map(function (entry) {
    return {
      date: entry[0],
      time: entry[1],
      user: entry[2],
      unit: entry[3],
      module: entry[4],
      action: entry[5],
      target: entry[6],
      result: entry[7],
    };
  });

  auditLogs.push.apply(auditLogs, additionalAuditLogs);

  const accounts = [
    { id: "huang.jg", name: "黃建國", unit: "國兩司", orgId: "directorate", role: "司長", lastLogin: "今日 14:06", status: "啟用" },
    { id: "chen.ks", name: "陳國勝", unit: "國際科", orgId: "international", role: "科長", lastLogin: "今日 13:28", status: "啟用" },
    { id: "wang.xm", name: "王小明", unit: "國際科／亞洲股", orgId: "asia", role: "股長", lastLogin: "今日 09:12", status: "啟用" },
    { id: "lin.se", name: "林淑恩", unit: "亞洲股／東南亞", orgId: "southeast-asia", role: "承辦人", lastLogin: "昨日 16:45", status: "啟用" },
    { id: "hsu.mt", name: "徐美婷", unit: "國際科／美洲股", orgId: "americas", role: "承辦人", lastLogin: "登入失敗 5 次", status: "鎖定" },
    { id: "ho.zh", name: "何宗翰", unit: "兩岸科", orgId: "cross-strait", role: "承辦人", lastLogin: "2026/08/15", status: "停用" },
  ];

  const initialOrganization = {
    id: "directorate",
    name: "國兩司",
    children: [
      { id: "cross-strait", name: "兩岸科", children: [] },
      {
        id: "international",
        name: "國際科",
        children: [
          {
            id: "asia",
            name: "亞洲股",
            children: [
              { id: "north-asia", name: "北亞", children: [] },
              {
                id: "southeast-asia",
                name: "東南亞",
                children: [
                  { id: "criminal", name: "刑事案件", children: [] },
                  { id: "civil", name: "民事案件", children: [] },
                ],
              },
              { id: "central-asia", name: "中亞", children: [] },
            ],
          },
          { id: "europe", name: "歐洲股", children: [] },
          { id: "americas", name: "美洲股", children: [] },
        ],
      },
    ],
  };

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getStatusClass(status) {
    return status === "成功" || status === "啟用"
      ? "status-ok"
      : status === "失敗" || status === "鎖定"
        ? "status-danger"
        : "status-neutral";
  }

  function flattenOrganization(node, result) {
    const nodes = result || [];
    nodes.push(node);
    node.children.forEach(function (child) { flattenOrganization(child, nodes); });
    return nodes;
  }

  function findOrganizationNode(node, nodeId) {
    if (node.id === nodeId) return node;
    for (const child of node.children) {
      const found = findOrganizationNode(child, nodeId);
      if (found) return found;
    }
    return null;
  }

  function findOrganizationPath(node, nodeId, path) {
    const nextPath = (path || []).concat(node);
    if (node.id === nodeId) return nextPath;
    for (const child of node.children) {
      const found = findOrganizationPath(child, nodeId, nextPath);
      if (found) return found;
    }
    return null;
  }

  App.initAdmin = function () {
    const auditTableBody = document.getElementById("auditTableBody");
    const auditPrevPage = document.getElementById("auditPrevPage");
    const auditNextPage = document.getElementById("auditNextPage");
    const auditPageNumbers = document.getElementById("auditPageNumbers");
    const auditPageSummary = document.getElementById("auditPageSummary");
    const accountTableBody = document.getElementById("accountTableBody");
    const organizationTree = document.getElementById("organizationTree");
    const key = "judicial-demo.organization.v1";
    const byId = id => document.getElementById(id);
    let saved = initialOrganization;
    let originalValue = null;
    try {
      originalValue = localStorage.getItem(key);
      if (originalValue) {
        const tree = JSON.parse(originalValue);
        const nodes = flattenOrganization(tree);
        const ids = new Set(nodes.map(node => node.id));
        if (tree.id === initialOrganization.id && ids.size === nodes.length &&
            nodes.every(node => typeof node.name === "string" && typeof node.id === "string" && /^[a-zA-Z0-9-]+$/.test(node.id)) &&
            accounts.every(account => ids.has(account.orgId))) saved = tree;
      }
    } catch { /* Use the built-in demo when stored data is unavailable. */ }
    let organization = saved;
    let editing = false;
    let dirty = false;
    let nameMode = "";
    function accountUnit(account) {
      return findOrganizationPath(saved, account.orgId).slice(-account.unit.split("／").length)
        .map(node => node.name).join("／");
    }
    let selectedOrganizationId = "asia";
    let currentAuditPage = 1;

    function renderAuditTable() {
      const logs = auditLogs;
      const totalPages = Math.max(1, Math.ceil(logs.length / AUDIT_PAGE_SIZE));
      currentAuditPage = Math.min(Math.max(currentAuditPage, 1), totalPages);
      const startIndex = (currentAuditPage - 1) * AUDIT_PAGE_SIZE;
      const pageLogs = logs.slice(startIndex, startIndex + AUDIT_PAGE_SIZE);
      document.getElementById("auditResultCount").textContent = logs.length + " 筆紀錄";
      document.getElementById("auditEmpty").hidden = logs.length > 0;
      auditTableBody.innerHTML = pageLogs.map(function (log) {
        return "<tr>" +
          "<td>" + escapeHtml(log.time) + '<span class="doc-sub">' + escapeHtml(log.date.replaceAll("-", "/")) + "</span></td>" +
          '<td><div class="audit-user"><strong>' + escapeHtml(log.user) + "</strong><span>" + escapeHtml(log.unit) + "</span></div></td>" +
          '<td><span class="audit-action">' + escapeHtml(log.action) + '</span><span class="audit-module">' + escapeHtml(log.module) + "</span></td>" +
          "<td>" + escapeHtml(log.target) + "</td>" +
          '<td><span class="badge-status ' + getStatusClass(log.result) + '">' + escapeHtml(log.result) + "</span></td>" +
          "</tr>";
      }).join("");
      auditPageSummary.textContent = "第 " + (startIndex + 1) + "–" + (startIndex + pageLogs.length) + " 筆，共 " + logs.length + " 筆";
      auditPrevPage.disabled = currentAuditPage === 1;
      auditNextPage.disabled = currentAuditPage === totalPages;
      auditPageNumbers.innerHTML = Array.from({ length: totalPages }, function (_, index) {
        const pageNumber = index + 1;
        const isCurrent = pageNumber === currentAuditPage;
        return '<button class="btn btn-sm audit-page-button' + (isCurrent ? " active" : "") + '" data-audit-page="' +
          pageNumber + '" type="button" aria-label="第 ' + pageNumber + ' 頁" aria-current="' +
          (isCurrent ? "page" : "false") + '">' + pageNumber + "</button>";
      }).join("");
      App.renderIcons();
    }

    function getFilteredAccounts() {
      const search = document.getElementById("accountSearch").value.trim().toLowerCase();
      const status = document.getElementById("accountStatus").value;
      return accounts.filter(function (account) {
        const searchText = [account.id, account.name, accountUnit(account), account.role].join(" ").toLowerCase();
        return (!search || searchText.includes(search)) && (!status || account.status === status);
      });
    }

    function renderAccountTable() {
      const filteredAccounts = getFilteredAccounts();
      document.getElementById("accountResultCount").textContent = filteredAccounts.length + " 筆示例帳號";
      document.getElementById("accountEmpty").hidden = filteredAccounts.length > 0;
      accountTableBody.innerHTML = filteredAccounts.map(function (account) {
        return '<tr data-account-id="' + account.id + '"><td><div class="account-user"><span class="account-avatar">' +
          escapeHtml(account.name.slice(0, 1)) + '</span><div class="account-identity"><strong>' + escapeHtml(account.name) +
          "</strong><span>" + escapeHtml(account.id) + "</span></div></div></td><td>" + escapeHtml(accountUnit(account)) + "</td><td>" +
          escapeHtml(account.role) + "</td><td>" + escapeHtml(account.lastLogin) + '</td><td><span class="badge-status ' +
          getStatusClass(account.status) + '">' + escapeHtml(account.status) + '</span></td><td><div class="account-actions">' +
          '<button class="btn btn-sm btn-outline-secondary account-scope" data-org-id="' + account.orgId +
          '" type="button">查看權限</button><button class="icon-btn edit-account" type="button" aria-label="編輯 ' +
          escapeHtml(account.name) + '"><i data-lucide="pencil"></i></button></div></td></tr>';
      }).join("");
      App.renderIcons();
    }

    function renderOrganizationBranch(node) {
      const children = node.children.length
        ? "<ul>" + node.children.map(renderOrganizationBranch).join("") + "</ul>"
        : "";
      return '<li><button class="organization-node' + (node.id === selectedOrganizationId ? " active" : "") +
        '" data-organization-id="' + node.id + '" type="button">' + escapeHtml(node.name) + "</button>" + children + "</li>";
    }

    function renderScopePreview() {
      const selectedNode = findOrganizationNode(organization, selectedOrganizationId);
      const path = findOrganizationPath(organization, selectedOrganizationId) || [];
      const visibleNodes = flattenOrganization(selectedNode, []);
      const visibleIds = new Set(visibleNodes.map(function (node) { return node.id; }));
      const blockedNodes = flattenOrganization(organization).filter(function (node) { return !visibleIds.has(node.id); });
      const visibleChips = visibleNodes.map(function (node) {
        return '<span class="scope-chip">' + escapeHtml(node.name) + "</span>";
      }).join("");
      const blockedChips = blockedNodes.length
        ? blockedNodes.map(function (node) { return '<span class="scope-chip scope-chip--blocked">' + escapeHtml(node.name) + "</span>"; }).join("")
        : '<span class="scope-chip">無其他限制</span>';

      document.getElementById("scopePreview").innerHTML = '<div class="scope-selected"><small>目前選取節點</small><strong>' +
        escapeHtml(selectedNode.name) + "</strong><span>" + escapeHtml(path.map(function (node) { return node.name; }).join(" › ")) +
        '</span></div><div class="scope-group"><h4><i data-lucide="eye"></i>可查看自己與所有下層</h4><div class="scope-chips">' +
        visibleChips + '</div></div><div class="scope-group"><h4><i data-lucide="eye-off"></i>不可查看上層與其他分支</h4><div class="scope-chips">' +
        blockedChips + "</div></div>";
      App.renderIcons();
    }

    function selectOrganization(nodeId) {
      selectedOrganizationId = nodeId;
      organizationTree.innerHTML = "<ul>" + renderOrganizationBranch(organization) + "</ul>";
      renderScopePreview();
      if (editing) updateEditor();
    }

    function updateEditor() {
      const node = findOrganizationNode(organization, selectedOrganizationId);
      const assigned = accounts.some(account => account.orgId === node.id);
      const restriction = node === organization ? "根節點須保留。" :
        node.children.length ? "請先處理下層節點，再刪除此節點。" :
        assigned ? "已有帳號隸屬此節點，無法刪除。" : "";
      byId("orgSelection").textContent = "選取節點：" + node.name;
      byId("orgDelete").disabled = Boolean(restriction);
      byId("orgStatus").textContent = (dirty ? "有尚未儲存的變更。 " : "") + restriction;
      byId("orgSave").disabled = !dirty;
      byId("orgNameForm").hidden = true;
      nameMode = "";
    }

    function setEditing(active) {
      editing = active;
      dirty = false;
      organization = active ? JSON.parse(JSON.stringify(saved)) : saved;
      if (!findOrganizationNode(organization, selectedOrganizationId)) selectedOrganizationId = organization.id;
      byId("organizationEditor").hidden = !active;
      byId("editOrganization").disabled = active;
      byId("editOrganization").setAttribute("aria-expanded", String(active));
      selectOrganization(selectedOrganizationId);
    }

    byId("editOrganization").onclick = () => setEditing(true);
    byId("orgCancel").onclick = () => {
      if (!dirty || global.confirm("放棄這次編輯的所有變更？")) setEditing(false);
    };
    function openNameForm(mode) {
      const node = findOrganizationNode(organization, selectedOrganizationId);
      nameMode = mode;
      byId("orgNameLabel").textContent = mode === "add" ? "在「" + node.name + "」下新增節點" : "修改「" + node.name + "」的名稱";
      byId("orgName").value = mode === "add" ? "" : node.name;
      byId("orgNameForm").hidden = false;
      byId("orgSave").disabled = true;
      byId("orgName").focus();
    }
    byId("orgAdd").onclick = () => openNameForm("add");
    byId("orgRename").onclick = () => openNameForm("rename");
    byId("orgNameForm").onsubmit = event => {
      event.preventDefault();
      const name = byId("orgName").value.trim();
      const path = findOrganizationPath(organization, selectedOrganizationId);
      const node = path.at(-1);
      const siblings = nameMode === "add" ? node.children : path.at(-2)?.children || [];
      if (!name || siblings.some(other => other.name === name && (nameMode === "add" || other !== node))) {
        byId("orgStatus").textContent = "請輸入名稱，並避免同一層節點重名。";
        return;
      }
      if (nameMode === "add") {
        const id = "node-" + Array.from(global.crypto.getRandomValues(new Uint32Array(4))).join("-");
        node.children.push({ id, name, children: [] });
        selectedOrganizationId = id;
      } else {
        node.name = name;
      }
      dirty = true;
      selectOrganization(selectedOrganizationId);
    };
    byId("orgDelete").onclick = () => {
      const path = findOrganizationPath(organization, selectedOrganizationId);
      const node = path.at(-1);
      if (byId("orgDelete").disabled || !global.confirm("從這份草稿刪除「" + node.name + "」？")) return;
      const parent = path.at(-2);
      parent.children = parent.children.filter(child => child !== node);
      dirty = true;
      selectOrganization(parent.id);
    };
    byId("orgSave").onclick = () => {
      try {
        if (localStorage.getItem(key) !== originalValue) {
          byId("orgStatus").textContent = "另一個分頁已更新組織階層，請重新載入後再編輯。";
          return;
        }
        const value = JSON.stringify(organization);
        localStorage.setItem(key, value);
        originalValue = value;
      } catch {
        byId("orgStatus").textContent = "瀏覽器無法儲存，草稿仍保留在此頁。";
        return;
      }
      saved = organization;
      setEditing(false);
      renderAccountTable();
      App.showToast("組織階層已儲存在此瀏覽器。");
    };

    function activateAdminTab(tabName) {
      document.querySelectorAll("[data-admin-tab]").forEach(function (button) {
        const isActive = button.dataset.adminTab === tabName;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-selected", String(isActive));
      });
      document.querySelectorAll(".admin-tab-panel").forEach(function (panel) {
        const isActive = panel.id === "admin-" + tabName;
        panel.classList.toggle("active", isActive);
        panel.hidden = !isActive;
      });
    }

    ["accountSearch", "accountStatus"].forEach(function (id) {
      const element = document.getElementById(id);
      element.addEventListener(element.tagName === "INPUT" ? "input" : "change", renderAccountTable);
    });

    accountTableBody.addEventListener("click", function (event) {
      const scopeButton = event.target.closest(".account-scope");
      const editButton = event.target.closest(".edit-account");
      if (scopeButton) {
        activateAdminTab("permission-rules");
        selectOrganization(scopeButton.dataset.orgId);
      }
      if (editButton) App.showToast("已開啟帳號編輯示例，正式版將記錄所有欄位異動。");
    });

    organizationTree.addEventListener("click", function (event) {
      const nodeButton = event.target.closest(".organization-node");
      if (nodeButton) selectOrganization(nodeButton.dataset.organizationId);
    });

    document.querySelectorAll("[data-admin-tab]").forEach(function (button) {
      button.addEventListener("click", function () { activateAdminTab(button.dataset.adminTab); });
    });
    document.getElementById("addAccount").addEventListener("click", function () {
      App.showToast("新增帳號示例：需設定組織節點、角色及初次登入密碼規則。");
    });
    document.getElementById("exportAuditLog").addEventListener("click", function () {
      App.showToast("稽核紀錄匯出工作已建立。");
    });
    auditPrevPage.addEventListener("click", function () {
      currentAuditPage -= 1;
      renderAuditTable();
    });
    auditNextPage.addEventListener("click", function () {
      currentAuditPage += 1;
      renderAuditTable();
    });
    auditPageNumbers.addEventListener("click", function (event) {
      const pageButton = event.target.closest("[data-audit-page]");
      if (!pageButton) return;
      currentAuditPage = Number(pageButton.dataset.auditPage);
      renderAuditTable();
    });
    document.getElementById("saveRolePermissions").addEventListener("click", function () {
      App.showToast("角色權限設定已儲存，異動已寫入稽核日誌。");
    });

    renderAuditTable();
    renderAccountTable();
    selectOrganization(selectedOrganizationId);
  };
})(window);
