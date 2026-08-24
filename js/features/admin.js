(function (global) {
  "use strict";

  const App = global.JudicialApp;
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
      target: "司法文件智慧平台",
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

  const accounts = [
    { id: "huang.jg", name: "黃建國", unit: "國兩司", orgId: "directorate", role: "司長", lastLogin: "今日 14:06", status: "啟用" },
    { id: "chen.ks", name: "陳國勝", unit: "國際科", orgId: "international", role: "科長", lastLogin: "今日 13:28", status: "啟用" },
    { id: "wang.xm", name: "王小明", unit: "國際科／亞洲股", orgId: "asia", role: "股長", lastLogin: "今日 09:12", status: "啟用" },
    { id: "lin.se", name: "林淑恩", unit: "亞洲股／東南亞", orgId: "southeast-asia", role: "承辦人", lastLogin: "昨日 16:45", status: "啟用" },
    { id: "hsu.mt", name: "徐美婷", unit: "國際科／美洲股", orgId: "americas", role: "承辦人", lastLogin: "登入失敗 5 次", status: "鎖定" },
    { id: "ho.zh", name: "何宗翰", unit: "兩岸科", orgId: "cross-strait", role: "承辦人", lastLogin: "2026/08/15", status: "停用" },
  ];

  const organization = {
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
    const accountTableBody = document.getElementById("accountTableBody");
    const organizationTree = document.getElementById("organizationTree");
    const allOrganizationNodes = flattenOrganization(organization);
    let selectedOrganizationId = "asia";

    function renderAuditTable() {
      const logs = auditLogs;
      document.getElementById("auditResultCount").textContent = logs.length + " 筆紀錄";
      auditTableBody.innerHTML = logs.map(function (log) {
        return "<tr>" +
          "<td>" + escapeHtml(log.time) + '<span class="doc-sub">' + escapeHtml(log.date.replaceAll("-", "/")) + "</span></td>" +
          '<td><div class="audit-user"><strong>' + escapeHtml(log.user) + "</strong><span>" + escapeHtml(log.unit) + "</span></div></td>" +
          '<td><span class="audit-action">' + escapeHtml(log.action) + '</span><span class="audit-module">' + escapeHtml(log.module) + "</span></td>" +
          "<td>" + escapeHtml(log.target) + "</td>" +
          '<td><span class="badge-status ' + getStatusClass(log.result) + '">' + escapeHtml(log.result) + "</span></td>" +
          "</tr>";
      }).join("");
      App.renderIcons();
    }

    function getFilteredAccounts() {
      const search = document.getElementById("accountSearch").value.trim().toLowerCase();
      const status = document.getElementById("accountStatus").value;
      return accounts.filter(function (account) {
        const searchText = [account.id, account.name, account.unit, account.role].join(" ").toLowerCase();
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
          "</strong><span>" + escapeHtml(account.id) + "</span></div></div></td><td>" + escapeHtml(account.unit) + "</td><td>" +
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
      const blockedNodes = allOrganizationNodes.filter(function (node) { return !visibleIds.has(node.id); });
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
    }

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
    document.getElementById("saveRolePermissions").addEventListener("click", function () {
      App.showToast("角色權限設定已儲存，異動已寫入稽核日誌。");
    });

    renderAuditTable();
    renderAccountTable();
    selectOrganization(selectedOrganizationId);
  };
})(window);
