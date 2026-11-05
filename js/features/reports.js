(function (global) {
  "use strict";

  const App = global.JudicialApp;
  const reportStages = ["讀取文件內容", "比對欄位與標籤", "彙整案件脈絡", "產生摘要", "建立報告格式"];

  App.initReports = function () {
    function downloadWordReport() {
      const content =
        '<html><head><meta charset="utf-8"></head><body>' +
        "<h1>美國平台帳號資料保全案彙整報告</h1>" +
        "<p>案號：ML-2026-0818-04；彙整請求書、回覆函、證據材料與登入紀錄附件。</p>" +
        "<h2>主要證據內容</h2>" +
        "<ul><li>平台帳號註冊資訊</li><li>登入與 IP 紀錄</li><li>關聯電子郵件與裝置資訊</li></ul>" +
        "</body></html>";
      const blob = new Blob([content], { type: "application/msword;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = "美國平台帳號資料保全案彙整報告.doc";
      downloadLink.click();
      URL.revokeObjectURL(url);
      App.showToast("Word 報告已產生並開始下載。");
    }

    function finishReport(outputType) {
      if (outputType === "word") {
        downloadWordReport();
        return;
      }

      App.showOverlay("reportPreview");
      if (outputType === "pdf") {
        App.showToast("報告已完成，請使用「列印／另存 PDF」輸出。");
      }
    }

    function startReport(outputType) {
      const progressOverlay = document.getElementById("reportProgress");
      let stageIndex = 0;

      App.showOverlay("reportProgress");
      document.getElementById("reportStages").innerHTML = reportStages
        .map(function (stage, index) {
          return '<div class="report-stage"><span class="check">' + (index + 1) + "</span><span>" + stage + "</span></div>";
        })
        .join("");

      const timer = global.setInterval(function () {
        document.querySelectorAll(".report-stage").forEach(function (item, index) {
          item.classList.toggle("done", index < stageIndex);
          item.classList.toggle("active", index === stageIndex);
          if (index < stageIndex) item.querySelector(".check").textContent = "✓";
        });

        document.getElementById("reportProgressText").textContent =
          stageIndex < reportStages.length ? reportStages[stageIndex] + "..." : "報告產生完成";
        stageIndex += 1;

        if (stageIndex <= reportStages.length) return;
        global.clearInterval(timer);
        global.setTimeout(function () {
          App.hideOverlay(progressOverlay);
          finishReport(outputType);
        }, 450);
      }, 620);
    }

    document.querySelectorAll(".report-output").forEach(function (button) {
      button.addEventListener("click", function () {
        startReport(button.dataset.output);
      });
    });
    document.getElementById("printReport").addEventListener("click", function () {
      global.print();
    });
  };

  App.initSupervisor = function () {
    document.querySelectorAll(".approve-review").forEach(function (button) {
      button.addEventListener("click", function () {
        button.closest(".supervisor-card").style.opacity = ".45";
        button.disabled = true;
        App.showToast("文件已核准並標記為審核完成。");
      });
    });

    document.querySelectorAll(".return-review").forEach(function (button) {
      button.addEventListener("click", function () {
        const reason = global.prompt("請輸入退回原因：", "請重新確認資料時間範圍");
        if (reason) App.showToast("文件已退回承辦人：" + reason);
      });
    });
  };
})(window);

/* Both statistics layouts supply the same report rows to the three formats. */
(function (App) {
  'use strict';
  const escape = value => String(value).replace(/[&<>"]/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
  })[ch]);
  let zipReady;
  function loadZip() {
    if (!zipReady) zipReady = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'js/vendor/jszip.min.js';
      script.onload = () => resolve(window.JSZip);
      script.onerror = () => { zipReady = null; script.remove(); reject(new Error('zip')); };
      document.head.append(script);
    });
    return zipReady;
  }
  async function downloadWord(title, lines) {
    const Zip = await loadZip();
    const zip = new Zip();
    const paragraph = text => '<w:p><w:r><w:t xml:space="preserve">' + escape(text) + '</w:t></w:r></w:p>';
    const borders = ['top','left','bottom','right','insideH','insideV'].map(edge =>
      '<w:' + edge + ' w:val="single" w:sz="4" w:color="CAD7E1"/>').join('');
    const body = lines.map(row => {
      if (row.length < 2) return paragraph(row[0] || '');
      const cols = row.map(() => '<w:gridCol w:w="' + Math.floor(9300 / row.length) + '"/>').join('');
      const cells = row.map(value => '<w:tc><w:tcPr><w:tcW w:w="' + Math.floor(9300 / row.length) +
        '" w:type="dxa"/></w:tcPr>' + paragraph(value) + '</w:tc>').join('');
      return '<w:tbl><w:tblPr><w:tblBorders>' + borders + '</w:tblBorders></w:tblPr><w:tblGrid>' +
        cols + '</w:tblGrid><w:tr>' + cells + '</w:tr></w:tbl>';
    }).join('');
    zip.file('[Content_Types].xml', '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
    zip.file('_rels/.rels', '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
    zip.file('word/document.xml', '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' +
      paragraph(title) + body + '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1000" w:bottom="1000" w:left="1000" w:right="1000"/></w:sectPr></w:body></w:document>');
    const url = URL.createObjectURL(await zip.generateAsync({type:'blob', mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}));
    const link = document.createElement('a');
    link.href = url; link.download = title + '.docx'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  App.setupStatsExport = function (button, report) {
    const label = document.createElement('label');
    label.className = 'd-flex align-items-center gap-2';
    label.append('輸出格式');
    const select = document.createElement('select');
    select.className = 'form-select form-select-sm w-auto';
    for (const [name, value] of [['網頁報告','web'],['PDF','pdf'],['Word','word']]) select.add(new Option(name,value));
    label.append(select);
    const controls = document.createElement('div');
    controls.className = 'd-flex align-items-center flex-wrap gap-2';
    button.before(controls);
    button.textContent = '輸出報告';
    controls.append(label, button);
    button.addEventListener('click', async () => {
      const {title, lines} = report();
      if (select.value === 'word') {
        try { await downloadWord(title, lines); }
        catch { App.showToast('Word 輸出失敗，請確認報告元件已載入後再試。', 'warning'); }
        return;
      }
      const tab = window.open('', '_blank');
      if (!tab) { App.showToast('請允許開啟報告視窗後再試。','warning'); return; }
      tab.opener = null;
      let count = 0, content = '';
      for (const row of lines) {
        if (row.length !== count && count > 1) content += '</tbody></table>';
        if (row.length > 1 && row.length !== count) content += '<table><tbody>';
        content += row.length > 1 ? '<tr>' + row.map(v => '<td>' + escape(v) + '</td>').join('') + '</tr>'
          : (row.length ? '<h2>' + escape(row[0]) + '</h2>' : '');
        count = row.length;
      }
      if (count > 1) content += '</tbody></table>';
      tab.document.write('<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + escape(title) +
        '</title><style>body{max-width:960px;margin:32px auto;padding:0 18px;font:15px/1.6 system-ui;color:#17395f}h1{font-size:24px}h2{font-size:18px}table{border-collapse:collapse;width:100%;margin:12px 0}td{border:1px solid #cbd7df;padding:6px 10px}tr:first-child{background:#eef4f8}tr{break-inside:avoid}@page{margin:15mm}</style><h1>' +
        escape(title) + '</h1>' + content + '</html>');
      tab.document.close();
      if (select.value === 'pdf') { tab.focus(); tab.print(); }
    });
  };
})(window.JudicialApp);
