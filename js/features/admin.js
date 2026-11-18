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

  // Prototype event payloads; production values must be supplied by the audit API.
  const auditTypes = ['資料查詢', 'AI 生成', '文件下載', '人工覆核', '欄位修正', '關聯判定', '錯誤處理', '登入驗證', '帳號管理', '其他操作'];
  const samples = [
    ['資料查詢', '搜尋司法互助案件', {'功能':'智慧搜尋','查詢內容與篩選條件':'司法文書送達；兩岸科；115 年 2 月','可視範圍':'使用者所屬單位','結果筆數':'12'}],
    ['AI 生成', '產生文件摘要', {'模型版本':'示範模型 v1.0','提示語版本':'summary-v2','輸入來源':'司法互助請求書，第 1–3 頁','輸出內容':'請求協助送達司法文書，並回覆送達結果。','引用來源':'司法互助請求書，第 2 頁'}],
    ['文件下載', '匯出人工修正紀錄', {'對象文件':'司法互助請求書','匯出內容':'欄位名稱、修正前值、修正後值及修正原因'}],
    ['人工覆核', '完成建檔', {'對象文件或案件':'司法互助請求書','版本':'v3','原因':'承辦人已核對原始文件，確認內容無誤'}],
    ['欄位修正', '修改收文日期', {'欄位名稱':'收文日期','修改前值':'2026-08-18','修改後值':'2026-08-19'}],
    ['關聯判定', '判定關聯成立', {'關聯':'ML-2026-0817-08 ↔ ML-2026-0819-02','判定依據':'相同案件編號與當事人，後件為補充資料'}],
    ['錯誤處理', '轉為需人工處理', {'對象文件':'司法互助請求書附件','失敗階段':'OCR 文字辨識','原因':'掃描頁面模糊，無法辨識必要欄位'}]
  ];
  samples.forEach((entry, i) => auditLogs.push({date:'2026-08-20', time:'16:0' + i + ':00', user:'王小明', unit:'國際科／亞洲股', module:entry[0], type:entry[0], action:entry[1], target:'ML-2026-0820-01 司法互助請求書', result:'成功', details:entry[2], demo:true}));
  const specificationSamples = [
  [
    "資料查詢",
    "問 AI",
    {
      "功能": "智慧搜尋／問 AI",
      "查詢內容與篩選條件": "司法文書送達；兩岸科；115 年 2 月",
      "可視範圍": "使用者授權科股",
      "結果筆數": 3
    },
    "ML-2026-0820-01 司法互助請求書"
  ],
  [
    "資料查詢",
    "產生彙整",
    {
      "功能": "彙整報告",
      "查詢內容與篩選條件": "司法文書送達；兩岸科；115 年 2 月",
      "可視範圍": "使用者授權科股",
      "結果筆數": 8
    },
    "ML-2026-0820-01 司法互助請求書"
  ],
  [
    "資料查詢",
    "關聯查詢",
    {
      "功能": "關聯圖",
      "查詢內容與篩選條件": "司法文書送達；兩岸科；115 年 2 月",
      "可視範圍": "使用者授權科股",
      "結果筆數": 4
    },
    "ML-2026-0820-01 司法互助請求書"
  ],
  [
    "資料查詢",
    "統計查詢",
    {
      "功能": "案件統計",
      "查詢內容與篩選條件": "司法文書送達；兩岸科；115 年 2 月",
      "可視範圍": "使用者授權科股",
      "結果筆數": 12
    },
    "ML-2026-0820-01 司法互助請求書"
  ],
  [
    "AI 生成",
    "欄位擷取",
    {
      "模型版本": "示範模型 v1.0",
      "提示語版本": "audit-demo-v2",
      "輸入來源": "司法互助請求書，第 1–3 頁",
      "輸出內容": "收文日期：2026-08-19；請求事項：司法文書送達",
      "引用來源": "司法互助請求書，第 2 頁"
    },
    "ML-2026-0820-01 司法互助請求書"
  ],
  [
    "AI 生成",
    "產生回答",
    {
      "模型版本": "示範模型 v1.0",
      "提示語版本": "audit-demo-v2",
      "輸入來源": "司法互助請求書，第 1–3 頁",
      "輸出內容": "本件請求協助送達司法文書，並回覆送達結果。",
      "引用來源": "司法互助請求書，第 2 頁"
    },
    "ML-2026-0820-01 司法互助請求書"
  ],
  [
    "AI 生成",
    "產生彙整",
    {
      "模型版本": "示範模型 v1.0",
      "提示語版本": "audit-demo-v2",
      "輸入來源": "司法互助請求書，第 1–3 頁",
      "輸出內容": "已彙整 8 件請求，其中 6 件為司法文書送達。",
      "引用來源": "司法互助請求書，第 2 頁"
    },
    "ML-2026-0820-01 司法互助請求書"
  ],
  [
    "文件下載",
    "開啟原稿",
    {
      "對象文件": "司法互助請求書",
      "匯出內容": "原稿 PDF，第 1–3 頁（檢視）"
    },
    "ML-2026-0820-01 司法互助請求書"
  ],
  [
    "文件下載",
    "下載原始檔",
    {
      "對象文件": "司法互助請求書",
      "匯出內容": "原始 PDF 檔案"
    },
    "ML-2026-0820-01 司法互助請求書"
  ],
  [
    "文件下載",
    "匯出彙整",
    {
      "對象文件": "司法互助請求書",
      "匯出內容": "所選 8 件案件的彙整報告"
    },
    "ML-2026-0820-01 司法互助請求書"
  ],
  [
    "文件下載",
    "匯出統計報表",
    {
      "對象文件": "司法互助請求書",
      "匯出內容": "115 年 2 月兩岸科統計表"
    },
    "ML-2026-0820-01 司法互助請求書"
  ],
  [
    "人工覆核",
    "退回",
    {
      "對象文件或案件": "ML-2026-0820-01 司法互助請求書",
      "版本": "v3",
      "原因": "文件非本股業務，退回上傳者確認歸屬股"
    },
    "ML-2026-0820-01 司法互助請求書"
  ],
  [
    "人工覆核",
    "刪除尚未歸檔的文件",
    {
      "對象文件或案件": "ML-2026-0820-01 司法互助請求書",
      "版本": "v3",
      "原因": "重複上傳且尚未歸檔，經確認刪除"
    },
    "ML-2026-0820-01 司法互助請求書"
  ],
  [
    "人工覆核",
    "重新開啟修改",
    {
      "對象文件或案件": "ML-2026-0820-01 司法互助請求書",
      "版本": "v3",
      "原因": "歸檔後發現收文日期誤植，重新開啟修正"
    },
    "ML-2026-0820-01 司法互助請求書"
  ],
  [
    "人工覆核",
    "更正所屬股",
    {
      "對象文件或案件": "ML-2026-0820-01 司法互助請求書",
      "版本": "v3",
      "原因": "經授權將歸屬股由亞洲股更正為歐洲股"
    },
    "ML-2026-0820-01 司法互助請求書"
  ],
  [
    "人工覆核",
    "合併案件",
    {
      "對象文件或案件": "ML-2026-0820-01 司法互助請求書",
      "版本": "v3",
      "原因": "確認為重複建案，保留 ML-2026-0820-01，合併 ML-2026-0820-02"
    },
    "ML-2026-0820-01 司法互助請求書"
  ],
  [
    "欄位修正",
    "標記查無",
    {
      "欄位名稱": "來文文號",
      "修改前值": "AI 擷取：A-123",
      "修改後值": "查無"
    },
    "ML-2026-0820-01 司法互助請求書"
  ],
  [
    "欄位修正",
    "還原原值",
    {
      "欄位名稱": "收文日期",
      "修改前值": "2026-08-18",
      "修改後值": "2026-08-19"
    },
    "ML-2026-0820-01 司法互助請求書"
  ],
  [
    "欄位修正",
    "確認實體",
    {
      "欄位名稱": "當事人／王○明",
      "修改前值": "待確認",
      "修改後值": "已確認"
    },
    "ML-2026-0820-01 司法互助請求書"
  ],
  [
    "欄位修正",
    "刪除實體",
    {
      "欄位名稱": "當事人／李○華",
      "修改前值": "候選實體（誤辨識）",
      "修改後值": "已刪除"
    },
    "ML-2026-0820-01 司法互助請求書"
  ],
  [
    "關聯判定",
    "判定關聯不成立",
    {
      "關聯": "ML-2026-0820-01 ↔ ML-2026-0820-02",
      "判定依據": "同名但案號與請求事項不同，確認不屬同案"
    },
    "ML-2026-0820-01 司法互助請求書"
  ],
  [
    "關聯判定",
    "人工建立關聯",
    {
      "關聯": "ML-2026-0820-01 ↔ ML-2026-0820-02",
      "判定依據": "補充文件引用原案號，承辦人確認屬同一案件"
    },
    "ML-2026-0820-01 司法互助請求書"
  ],
  [
    "錯誤處理",
    "手動重送",
    {
      "對象文件": "司法互助請求書附件",
      "失敗階段": "回拋司互案管系統",
      "原因": "前次連線逾時，確認服務恢復後手動重送",
      "處理結果": "重送請求已受理；最終回拋結果待更新"
    },
    "ML-2026-0820-01 司法互助請求書"
  ],
  [
    "登入驗證",
    "帳號登出",
    {
      "登入帳號": "wang.xm",
      "登出方式": "使用者主動登出",
      "處理結果": "已結束本次工作階段"
    },
    "司法互助AI助理"
  ]
];
  specificationSamples.forEach((entry, i) => auditLogs.push({date: '2026-08-20', time: '17:' + String(i).padStart(2, '0') + ':00', user: '王小明', unit: '國際科／亞洲股', module: entry[0], type: entry[0], action: entry[1], target: entry[3], result: '成功', details: entry[2], demo: true}));
  function prepareAudit(log) {
    if (!log.eventId) {
      log.eventId = 'EVT-DEMO-' + String(++prepareAudit.sequence).padStart(4, '0');
      log.traceId = 'TRACE-DEMO-' + String(prepareAudit.sequence).padStart(4, '0');
    }
    if (!log.type) log.type = log.module === '帳號管理' || log.module === '登入驗證' ? log.module : /失敗/.test(log.action) ? '錯誤處理' : /修正|修改|欄位/.test(log.action) ? '欄位修正' : /查詢|搜尋/.test(log.action) ? '資料查詢' : /下載|匯出/.test(log.action) ? '文件下載' : log.module === 'AI 覆核' ? '人工覆核' : '其他操作';
    return log;
  }
  prepareAudit.sequence = 0;
  auditLogs.forEach(prepareAudit);

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

    const auditPage = byId('page-audit');
    auditPage.querySelector('.admin-metrics')?.remove();
    const exportButton = byId('exportAuditLog');
    const toolbar = document.createElement('div');
    toolbar.className = 'audit-heading-actions';
    exportButton.before(toolbar);
    toolbar.innerHTML = `<form id="auditSearchForm" class="audit-search-form" role="search"><input id="auditKeyword" class="form-control" type="search" aria-label="搜尋稽核日誌" placeholder="搜尋使用者、對象或追蹤識別碼"><button class="btn btn-outline-secondary" type="submit" aria-label="搜尋"><i data-lucide="search"></i></button></form>`;
    toolbar.append(exportButton);
    const filters = document.createElement('form');
    filters.className = 'audit-filters';
    filters.innerHTML = `<label>開始日期<input class="form-control" id="auditStart" type="date"></label><label>結束日期<input class="form-control" id="auditEnd" type="date"></label><label>事件類型<select class="form-select" id="auditType"><option value="">全部事件</option>${auditTypes.map(t => '<option>' + t + '</option>').join('')}</select></label><label>結果<select class="form-select" id="auditOutcome"><option value="">全部結果</option><option>成功</option><option>失敗</option></select></label><button class="btn btn-outline-secondary" type="button" id="auditClear">清除篩選</button><span id="auditFilterError" role="alert"></span><button class="btn btn-primary" type="submit" id="auditApply" style="margin-left:auto">確認</button>`;
    auditPage.querySelector('.audit-list-panel .panel-header').after(filters);
    const heads = auditPage.querySelectorAll('thead th');
    heads[1].textContent = '使用者／單位'; heads[2].textContent = '事件類型／操作'; heads[5].textContent = '詳情';
    const drawer = document.createElement('dialog');
    drawer.className = 'audit-drawer';
    drawer.setAttribute('aria-labelledby', 'auditDetailTitle');
    drawer.innerHTML = '<header><div><span class="subtle">事件紀錄</span><h3 id="auditDetailTitle">稽核詳情</h3></div><button class="btn btn-outline-secondary" type="button" data-close aria-label="關閉詳情">關閉</button></header><div id="auditDetailContent"></div>';
    document.body.append(drawer);
    drawer.querySelector('[data-close]').onclick = () => drawer.close();
    drawer.addEventListener('click', e => { if (e.target === drawer && e.clientX < drawer.getBoundingClientRect().left) drawer.close(); });
    let appliedKeyword = '';
    let appliedFilters = { start: '', end: '', type: '', outcome: '' };
    function filteredAudit() {
      const { start, end, type, outcome } = appliedFilters;
      return auditLogs.map(prepareAudit).filter(log => (!start || log.date >= start) && (!end || log.date <= end) && (!type || log.type === type) && (!outcome || log.result === outcome) && [log.user, log.unit, log.target, log.eventId, log.traceId, log.type, log.action].join(' ').toLowerCase().includes(appliedKeyword)).sort((a,b) => (b.date + b.time).localeCompare(a.date + a.time));
    }
    function refreshAudit() { currentAuditPage = 1; renderAuditTable(); }
    byId('auditSearchForm').addEventListener('submit', e => { e.preventDefault(); appliedKeyword = byId('auditKeyword').value.trim().toLowerCase(); refreshAudit(); });
    byId('auditKeyword').addEventListener('input', e => { if (!e.target.value) { appliedKeyword = ''; refreshAudit(); } });
    filters.addEventListener('submit', e => {
      e.preventDefault();
      const next = { start: byId('auditStart').value, end: byId('auditEnd').value, type: byId('auditType').value, outcome: byId('auditOutcome').value };
      if (next.start && next.end && next.start > next.end) {
        byId('auditFilterError').textContent = '結束日期不可早於開始日期';
        byId('auditEnd').focus();
        return;
      }
      byId('auditFilterError').textContent = '';
      appliedFilters = next;
      appliedKeyword = byId('auditKeyword').value.trim().toLowerCase();
      refreshAudit();
    });
    byId('auditClear').onclick = () => { filters.reset(); byId('auditKeyword').value = ''; byId('auditFilterError').textContent = ''; };
    auditTableBody.addEventListener('click', e => {
      const button = e.target.closest('[data-audit-detail]');
      if (!button) return;
      const log = auditLogs.find(l => l.eventId === button.dataset.auditDetail);
      const row = (label, value) => '<div class="audit-detail-field"><dt>' + escapeHtml(label) + '</dt><dd>' + escapeHtml(String(value ?? '未記錄')) + '</dd></div>';
      const copyRow = (label, value) => '<div class="audit-detail-field"><dt>' + label + '</dt><dd><code>' + escapeHtml(value) + '</code><button type="button" class="btn btn-sm btn-outline-secondary" data-copy="' + escapeHtml(value) + '">複製</button></dd></div>';
      let detail = Object.entries(log.details || {}).filter(([key]) => !['修改前值','修改後值'].includes(key)).map(([key,value]) => row(key,value)).join('');
      if (log.details && '修改前值' in log.details) detail += '<div class="audit-diff"><div><span>修改前</span><p>' + escapeHtml(log.details['修改前值']) + '</p></div><div><span>修改後</span><p>' + escapeHtml(log.details['修改後值']) + '</p></div></div>';
      byId('auditDetailContent').innerHTML = '<p class="audit-demo-note">目前為原型示範紀錄；識別碼與事件內容用於展示。</p><dl>' + row('時間', log.date + ' ' + log.time) + row('使用者／單位', log.user + '／' + log.unit) + row('事件類型', log.type) + row('操作', log.action) + row('對象', log.target) + row('結果', log.result) + copyRow('事件識別碼',log.eventId) + copyRow('追蹤識別碼',log.traceId) + '</dl><h4>事件內容</h4><dl>' + (detail || '<p class="subtle">此筆既有示範紀錄未記錄詳細內容。</p>') + '</dl>';
      drawer.showModal();
    });
    drawer.addEventListener('click', async e => {
      const button = e.target.closest('[data-copy]'); if (!button) return;
      try { await navigator.clipboard.writeText(button.dataset.copy); button.textContent = '已複製'; }
      catch { App.showToast('無法自動複製，請選取識別碼後複製。'); }
    });

    function renderAuditTable() {
      const logs = filteredAudit();
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
          '<td><span class="audit-action">' + escapeHtml(log.action) + '</span><span class="audit-module">' + escapeHtml(log.type) + "</span></td>" +
          "<td>" + escapeHtml(log.target) + "</td>" +
          '<td><span class="badge-status ' + getStatusClass(log.result) + '">' + escapeHtml(log.result) + "</span></td>" +
          '<td><button type="button" class="btn btn-sm btn-outline-secondary audit-detail-button" data-audit-detail="' + escapeHtml(log.eventId) + '">查看詳情</button></td></tr>';
      }).join("");
      auditPageSummary.textContent = "第 " + (logs.length ? startIndex + 1 : 0) + "–" + (startIndex + pageLogs.length) + " 筆，共 " + logs.length + " 筆";
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
      const counts = [accounts.length, ...['啟用', '鎖定', '停用'].map(status => accounts.filter(a => a.status === status).length)];
      document.querySelectorAll('.account-metrics strong').forEach((node, i) => { node.textContent = counts[i]; });
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

    // 編輯按鈕暫時註解時，不綁定事件，避免中斷頁面初始化。
    if (byId("editOrganization")) {
      byId("editOrganization").onclick = () => setEditing(true);
    }
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
      if (editButton) openAccount(accounts.find(a => a.id === editButton.closest('tr').dataset.accountId));
    });

    organizationTree.addEventListener("click", function (event) {
      const nodeButton = event.target.closest(".organization-node");
      if (nodeButton) selectOrganization(nodeButton.dataset.organizationId);
    });

    document.querySelectorAll("[data-admin-tab]").forEach(function (button) {
      button.addEventListener("click", function () { activateAdminTab(button.dataset.adminTab); });
    });
    document.getElementById("addAccount").addEventListener("click", function () {
      openAccount(null);
    });
    document.getElementById("exportAuditLog").addEventListener("click", function () {
      const logs = filteredAudit();
      if (!logs.length) { App.showToast('目前沒有可匯出的紀錄。'); return; }
      const cell = value => '"' + String(value ?? '').replace(/^[=+@-]/, "'$&").replaceAll('"', '""') + '"';
      const rows = [['時間','使用者','單位','事件類型','操作','對象','結果','事件識別碼','追蹤識別碼','事件內容'], ...logs.map(l => [l.date + ' ' + l.time,l.user,l.unit,l.type,l.action,l.target,l.result,l.eventId,l.traceId,JSON.stringify(l.details || {})])];
      const url = URL.createObjectURL(new Blob(['\ufeff' + rows.map(r => r.map(cell).join(',')).join('\r\n')], {type:'text/csv;charset=utf-8'}));
      const a = document.createElement('a'); a.href = url; a.download = 'audit-log.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      App.showToast('已匯出 ' + logs.length + ' 筆稽核紀錄。');
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
    function readRolePermissions() {
      const table = document.querySelector('.permission-matrix');
      if (!table) return '未提供角色權限矩陣';
      const headings = Array.from(table.querySelectorAll('thead th')).slice(1).map(el => el.textContent.trim());
      return Array.from(table.querySelectorAll('tbody tr')).map(row => {
        const role = row.querySelector('th').textContent.trim();
        const values = Array.from(row.querySelectorAll('td')).map((cell, i) => {
          const input = cell.querySelector('input[type="checkbox"]');
          const allowed = input ? input.checked : cell.textContent.includes('✓');
          return headings[i] + '：' + (allowed ? '允許' : '不允許');
        });
        return role + '｜' + values.join('、');
      }).join('\n');
    }
    let savedRolePermissions = readRolePermissions();
    document.getElementById("saveRolePermissions").addEventListener("click", function () {
      const next = readRolePermissions();
      recordAccount('儲存角色權限設定（示範）', { id: '角色權限矩陣', name: '角色權限矩陣' }, '', {
        '設定項目': '角色功能權限', '修改前值': savedRolePermissions, '修改後值': next,
        '儲存結果': next === savedRolePermissions ? '設定與前次相同；記錄本次儲存操作' : '本次頁面設定已更新（示範）'
      });
      savedRolePermissions = next;
      App.showToast('角色權限設定儲存示範完成，已新增稽核紀錄。');
    });

    const Security = global.AccountSecurity;
    function recordAccount(action, account, detail, details) {
      const now = new Date();
      auditLogs.unshift({ date: now.toLocaleDateString('sv-SE'), time: now.toLocaleTimeString('zh-TW', {hour12: false}), user: '目前管理員（示範）', unit: '系統管理', module: '帳號管理', action,
        target: account.id + '｜' + (detail || account.name) + '｜IP：未取得（示範）', result: '成功', details: details || { '帳號或設定對象': account.id, '操作內容': detail || account.name }, demo: true });
      currentAuditPage = 1;
      renderAuditTable();
    }
    App.openPasswordChange = () => Security.password('change', '', id => {
      recordAccount('密碼變更（流程示範）', {id, name: id});
      App.showToast('密碼變更流程示範完成，已加入示範日誌；未變更真實密碼。');
    });

    function openAccount(account) {
      const existing = Boolean(account);
      const roles = ['司長', '科長', '股長', '承辦人', '系統管理員'];
      const options = flattenOrganization(saved).map(n => {
        const path = findOrganizationPath(saved, n.id).map(x => x.name).join('／');
        return `<option value="${escapeHtml(n.id)}" ${account?.orgId === n.id ? 'selected' : ''}>${escapeHtml(path)}</option>`;
      }).join('');
      const d = Security.modal(existing ? '編輯帳號' : '新增帳號', `
        <form class="account-form">
          <label>帳號<input class="form-control" name="accountId" required maxlength="80" pattern="[A-Za-z0-9._-]+" title="限英文字母、數字、點、底線及連字號" value="${escapeHtml(account?.id || '')}" ${existing ? 'readonly' : ''}></label>
          <label>姓名<input class="form-control" name="fullName" required maxlength="60" value="${escapeHtml(account?.name || '')}"></label>
          <label>所屬組織（科別／股別）<select class="form-select" name="organization" required><option value="">請選擇</option>${options}</select></label>
          <label>角色／職位<select class="form-select" name="role" required><option value="">請選擇</option>${roles.map(r => `<option ${account?.role === r ? 'selected' : ''}>${r}</option>`).join('')}</select></label>
          <p class="subtle">資料查閱範圍依組織節點及角色設定；兩岸科、國際科與國際科各股資料分別控管。</p>
          <label>帳號狀態<input class="form-control" data-status readonly value="${escapeHtml(account?.status || '啟用')}"></label>
          ${existing ? '<div class="account-tool-buttons" data-tools></div><p class="subtle account-status-hint">狀態操作確認後立即生效，不會儲存尚未送出的資料修改。</p>' : ''}
          ${!existing ? '<p class="account-demo-note">新增後由正式服務提供初始密碼，首次登入強制變更。本示範不產生或寄送密碼。</p>' : ''}
          <p class="account-error" role="alert" hidden></p>
          <div class="account-dialog-actions account-edit-footer"><button class="btn btn-outline-secondary" type="button" data-cancel>取消</button><button class="btn btn-primary" type="submit">${existing ? '儲存' : '新增帳號'}</button></div>
        </form>`);
      const form = d.querySelector('form');
      const error = d.querySelector('[role=alert]');
      function updateTools() {
        if (!account) return;
        d.querySelector('[data-status]').value = account.status;
        d.querySelector('[data-tools]').innerHTML = `
          <button class="btn btn-outline-secondary" type="button" data-operation="reset">重設密碼</button>
          ${account.status === '停用' ? '<button class="btn btn-outline-primary" type="button" data-operation="啟用">啟用帳號</button>' : '<button class="btn btn-outline-danger" type="button" data-operation="停用">停用帳號</button>'}
          ${account.status === '啟用' ? '<button class="btn btn-outline-danger" type="button" data-operation="鎖定">鎖定帳號</button>' : account.status === '鎖定' ? '<button class="btn btn-outline-primary" type="button" data-operation="解鎖">解除鎖定</button>' : ''}`;
      }
      updateTools();
      form.addEventListener('submit', e => {
        e.preventDefault();
        const id = form.elements.accountId.value.trim();
        const name = form.elements.fullName.value.trim();
        if (!name || (!existing && accounts.some(a => a.id.toLowerCase() === id.toLowerCase()))) {
          error.textContent = !name ? '請填寫姓名。' : '帳號已存在，請使用其他帳號。'; error.hidden = false; return;
        }
        const orgId = form.elements.organization.value;
        const unit = findOrganizationPath(saved, orgId).map(n => n.name).join('／');
        const role = form.elements.role.value;
        const before = existing ? `${account.name}／${accountUnit(account)}／${account.role}` : '';
        if (!existing) { account = {id, lastLogin: '尚未登入', status: '啟用'}; accounts.push(account); }
        Object.assign(account, {name, orgId, unit, role});
        recordAccount(existing ? '修改帳號' : '新增帳號', account, `${before ? '修改前：' + before + '；修改後：' : ''}${name}／${unit}／${role}`);
        renderAccountTable(); d.close(); App.showToast(existing ? '帳號資料已更新。' : '已新增示範帳號，首次登入須變更預設密碼。');
      });
      d.addEventListener('click', e => {
        const action = e.target.closest('[data-operation]')?.dataset.operation;
        if (!action) return;
        if (action === 'reset') {
          Security.password('forgot', account.id, () => {
            recordAccount('密碼重設（流程示範）', account);
            App.showToast('流程示範完成，已加入示範日誌；未變更真實密碼。');
          });
          return;
        }
        const danger = action === '停用' || action === '鎖定';
        const message = action === '停用' ? '停用後，該使用者將無法登入系統。' : action === '鎖定' ? '鎖定後，該使用者將無法登入，需經解除鎖定。' : '確認後，該帳號將恢復啟用狀態。';
        const confirm = Security.modal('確認' + action + '帳號？', `<p>帳號：<strong>${escapeHtml(account.name)}（${escapeHtml(account.id)}）</strong></p><p class="${danger ? 'account-danger-note' : ''}">${message}</p><div class="account-dialog-actions"><button class="btn btn-outline-secondary" type="button" data-cancel autofocus>取消</button><button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" type="button" data-confirm>確認${action}</button></div>`);
        confirm.querySelector('[data-confirm]').onclick = () => {
          account.status = action === '解鎖' ? '啟用' : action;
          recordAccount(action + '帳號', account); renderAccountTable(); updateTools(); confirm.close();
          App.showToast('帳號已' + action + '（示範）。');
        };
      });
    }
    byId('accountPolicy').onclick = () => {
      const fields = [['length','密碼最小長度',8],['classes','字元類別數（四取三以上）',3],['history','不得重複前幾次密碼',3],['age','密碼效期（天，0 表示待設定）',0],['notice','到期前提醒（天，0 表示待設定）',0],['failures','連續登入失敗次數',1],['lock','自動鎖定時間（分鐘）',15],['idle','閒置登出（分鐘）',1]];
      const d = Security.modal('帳密安全設定', `<p class="account-demo-note">本次展示設定；不會執行真實鎖定、強制登出或密碼效期控管。密碼效期及提前提醒天數待機關決定。</p><form class="account-form account-policy-form">${fields.map(([key,label,min]) => `<label>${label}<input class="form-control" name="${key}" type="number" required min="${min}" max="${key === 'classes' ? 4 : key === 'idle' ? 20 : 999}" step="1" value="${Security.policy[key]}"></label>`).join('')}<p class="account-error" role="alert" hidden></p><div class="account-dialog-actions"><button class="btn btn-outline-secondary" type="button" data-cancel>取消</button><button class="btn btn-primary" type="submit">儲存設定</button></div></form>`);
      d.querySelector('form').onsubmit = e => {
        e.preventDefault(); const form = e.target;
        const next = Object.fromEntries(fields.map(([key]) => [key, Number(form.elements.namedItem(key).value)]));
        if (next.notice && (!next.age || next.notice >= next.age)) { const error = d.querySelector('[role=alert]'); error.textContent = '提前提醒天數須小於已設定的密碼效期。'; error.hidden = false; return; }
        Object.assign(Security.policy, next); recordAccount('更新帳密安全設定（示範）', {id:'系統設定',name:JSON.stringify(next)}); d.close(); App.showToast('本次展示的帳密設定已更新。');
      };
    };

    renderAuditTable();
    renderAccountTable();
    selectOrganization(selectedOrganizationId);
  };
})(window);
