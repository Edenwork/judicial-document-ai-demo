(() => {
  'use strict';
// 僅保留請求數量；件數與人數分列，摘要只加總「件」。
const rows = [
  ['刑事犯、刑事嫌疑犯緝捕遣返', '件', 4, 0],
  ['刑事犯、刑事嫌疑犯緝捕遣返', '人', 4, 0],
  ['犯罪情資交換', '件', 19, 0],
  ['司法文書送達', '件', 72, 124],
  ['調查取證', '件', 13, 14],
  ['罪犯接返（受刑人移交）', '—', 0, 0],
  ['人身自由受限制通報', '件', 6, 0],
  ['非病死及可疑非病死通報', '件', 0, 0],
  ['其他（如陳情等）', '件', 5, 0],
  ['業務交流', '—', 0, 0]
];
const el = id => document.getElementById('monthly-table-' + id);
const demoMonths = {
  '2026-01': [[20,18], [12,9], [6,5], [2,1]],
  '2026-02': [[24,17], [14,11], [8,6], [3,2]]
};
const demoNames = ['司法文書送達', '調查取證', '犯罪情資交換', '受刑人移交'];
let selectedMonth = '2026-02';
let draftMonth = selectedMonth;
let appliedUnit = el('unit').value;
const picker = document.getElementById('monthly-period-picker');
const options = picker.querySelector('.monthly-months');
const trigger = picker.querySelector('summary');
function closePicker() {
  picker.open = false;
  trigger.focus();
}
const yearInput = document.getElementById('monthly-period-year');
function syncMonths() {
  for (const button of options.children) {
    button.setAttribute('aria-pressed', String(draftMonth === yearInput.value + '-' + button.value));
  }
}
picker.addEventListener('toggle', () => {
  if (picker.open) {
    yearInput.value = draftMonth.slice(0, 4);
    syncMonths();
  }
});
yearInput.addEventListener('input', syncMonths);
for (let month = 1; month <= 12; month++) {
  const button = document.createElement('button');
  button.type = 'button';
  button.value = String(month).padStart(2, '0');
  button.textContent = month + '月';
  button.addEventListener('click', () => {
    if (!yearInput.reportValidity()) return;
    draftMonth = String(yearInput.valueAsNumber) + '-' + button.value;
    document.getElementById('monthly-period-value').textContent =
      yearInput.valueAsNumber + '年' + button.value + '月';
    closePicker();
  });
  options.append(button);
}
syncMonths();
picker.addEventListener('keydown', event => {
  if (event.key === 'Escape' && picker.open) {
    event.preventDefault();
    closePicker();
  }
});
document.addEventListener('click', event => {
  if (!picker.contains(event.target)) picker.open = false;
});
function render() {
  const unit = appliedUnit;
  const [year, month] = selectedMonth.split('-').map(Number);
  el('period').textContent = '民國 ' + (year - 1911) + ' 年 ' + month + ' 月';
  const demo = demoMonths[selectedMonth];
  const demoTotal = demo?.reduce((total, [out, incoming]) => total + out + incoming, 0);
  const reports = [
    { name: '兩岸科', id: 'business', requests: selectedMonth === '2026-02'
      ? rows.reduce((total, [, measure, out, incoming]) => total + (measure === '件' ? out + incoming : 0), 0) : null },
    { name: '國際科', id: 'international', requests: demoTotal }
  ].filter(report => unit === '全部科別' || report.name === unit);
  el('agencies').innerHTML = reports.map(({ name, requests }) =>
    `<tr><td>${name}</td><td>${requests ?? '—'}</td></tr>`
  ).join('');
  const available = reports.filter(report => report.requests != null);
  const note = available.length ? available.map(report => report.name).join('、') + '合計（件）' : '尚無資料';
  el('monthCards').innerHTML = card(['相互請求', available.length
    ? available.reduce((sum, report) => sum + report.requests, 0) : '—', note]);
  for (const id of ['business', 'international']) {
    el(id).hidden = !available.some(report => report.id === id);
  }
  el('demo-rows').innerHTML = (demo || []).map((values, i) =>
    '<tr><td>' + demoNames[i] + '</td>' +
      values.map(n => '<td>' + n + '</td>').join('') + '</tr>'
  ).join('');
}
el('items').innerHTML = rows.map(([name, unit, out, incoming]) =>
  '<tr><td><strong>' + name + (name === '刑事犯、刑事嫌疑犯緝捕遣返' ? '（' + unit + '）' : '') + '</strong></td><td>' + out + '</td><td>' + incoming + '</td></tr>'
).join('');
el('apply').addEventListener('click', () => {
  selectedMonth = draftMonth;
  appliedUnit = el('unit').value;
  picker.open = false;
  render();
});
function card([title,value,note]){return '<div class="panel metric-card"><span class="metric-label">'+title+'</span><strong class="metric-value">'+value+'</strong><small>'+note+'</small></div>'}

// 保留原版報告編排，資料只取最後一次查詢後的相互請求結果。
function reportData() {
  const [year, month] = selectedMonth.split('-').map(Number);
  const period = (year - 1911) + ' 年 ' + month + ' 月';
  const readRows = id => Array.from(el(id).rows,
    row => Array.from(row.cells, cell => cell.textContent.trim()));
  const lines = [
    ['統計月份', period],
    ['科別', appliedUnit],
    ['雙方相互請求（件）', el('monthCards').querySelector('.metric-value').textContent],
    [], ['各科請求數量摘要'],
    ['科別', '雙方相互請求（件）'], ...readRows('agencies')
  ];
  if (!el('business').hidden) {
    lines.push([], ['兩岸科 · 業務明細'],
      ['協助事項', '我方請求', '陸方請求'], ...readRows('items'));
  }
  if (!el('international').hidden) {
    lines.push([], ['國際科 · 業務明細'],
      ['協助事項', '我方請求', '外方請求'], ...readRows('demo-rows'));
  }
  if (el('business').hidden && el('international').hidden) lines.push([], ['尚無資料']);
  return { title: ['案件統計', period, appliedUnit].join('-'), lines };
}
const escapeReport = value => String(value).replace(/[&<>"']/g, char =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]);
function reportHTML(report) {
  let count = 0, content = '';
  for (const row of report.lines) {
    if (row.length !== count && count > 1) content += '</tbody></table>';
    if (row.length > 1 && row.length !== count) content += '<table><tbody>';
    content += row.length > 1 ? '<tr>' + row.map(v => '<td>' + escapeReport(v) + '</td>').join('') + '</tr>'
      : (row.length ? '<h2>' + escapeReport(row[0]) + '</h2>' : '');
    count = row.length;
  }
  if (count > 1) content += '</tbody></table>';
  return '<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + escapeReport(report.title) +
    '</title><style>body{max-width:960px;margin:32px auto;padding:0 18px;font:15px/1.6 system-ui;color:#17395f}h1{font-size:24px}h2{font-size:18px}table{border-collapse:collapse;width:100%;margin:12px 0}td{border:1px solid #cbd7df;padding:6px 10px}tr:first-child{background:#eef4f8}tr{break-inside:avoid}@page{margin:15mm}</style><h1>' +
    escapeReport(report.title) + '</h1>' + content + '</html>';
}
// 使用 ZIP 的無壓縮格式封裝簡單 DOCX，不需下載第三方套件。
function wordBlob(report) {
  const paragraph = value => '<w:p><w:r><w:t xml:space="preserve">' + escapeReport(value) + '</w:t></w:r></w:p>';
  const body = report.lines.map(row => {
    if (row.length < 2) return paragraph(row[0] || '');
    const width = Math.floor(9300 / row.length);
    const borders = ['top','left','bottom','right','insideH','insideV'].map(edge => '<w:' + edge + ' w:val="single" w:sz="4" w:color="CAD7E1"/>').join('');
    return '<w:tbl><w:tblPr><w:tblBorders>' + borders + '</w:tblBorders></w:tblPr><w:tblGrid>' +
      row.map(() => '<w:gridCol w:w="' + width + '"/>').join('') + '</w:tblGrid><w:tr>' + row.map(value =>
        '<w:tc><w:tcPr><w:tcW w:w="' + width + '" w:type="dxa"/></w:tcPr>' + paragraph(value) + '</w:tc>').join('') + '</w:tr></w:tbl>';
  }).join('');
  const files = {
    '[Content_Types].xml': '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
    '_rels/.rels': '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    'word/document.xml': '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' + paragraph(report.title) + body +
      '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="850" w:bottom="850" w:left="850" w:right="850"/></w:sectPr></w:body></w:document>'
  };
  const encoder = new TextEncoder(), parts = [], directory = [];
  let offset = 0, directorySize = 0;
  for (const [name, xml] of Object.entries(files)) {
    const filename = encoder.encode(name), data = encoder.encode('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + xml);
    let crc = 0xffffffff;
    for (const byte of data) { crc ^= byte; for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0); }
    crc = (crc ^ 0xffffffff) >>> 0;
    const header = new Uint8Array(30), view = new DataView(header.buffer);
    view.setUint32(0, 0x04034b50, true); view.setUint16(4, 20, true); view.setUint16(12, 33, true);
    view.setUint32(14, crc, true); view.setUint32(18, data.length, true); view.setUint32(22, data.length, true); view.setUint16(26, filename.length, true);
    const central = new Uint8Array(46), cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); central.set(header.slice(4, 30), 6); cv.setUint32(42, offset, true);
    parts.push(header, filename, data); directory.push(central, filename);
    offset += header.length + filename.length + data.length; directorySize += central.length + filename.length;
  }
  const end = new Uint8Array(22), ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, directory.length / 2, true); ev.setUint16(10, directory.length / 2, true);
  ev.setUint32(12, directorySize, true); ev.setUint32(16, offset, true);
  return new Blob([...parts, ...directory, end], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}
el('export').addEventListener('click', () => {
  const report = reportData(), format = el('output-format').value;
  if (format === 'word') {
    const url = URL.createObjectURL(wordBlob(report)), link = document.createElement('a');
    link.href = url; link.download = report.title + '.docx';
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }
  const tab = window.open('', '_blank');
  if (!tab) { window.JudicialApp.showToast('請允許開啟報告視窗後再試。', 'warning'); return; }
  tab.opener = null;
  tab.document.write(reportHTML(report));
  tab.document.close();
  // document.write 可能清除預先綁定的 load 事件；寫入完成後直接開啟原生列印視窗。
  if (format === 'pdf') {
    tab.focus();
    tab.print();
  }
});
render();
})();
