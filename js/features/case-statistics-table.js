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
    el('query-note').hidden = false;
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
// 年度預覽：兩岸科按使用者提供的歷年表轉錄「請求」欄，完成欄不納入。
// 原表緝捕遣返只有人數，無案件數；null 代表未提供，不視為 0。
// 欄序：緝捕件數、緝捕人數、情資、文書、取證、移交、人身自由、非病死、其他、交流。
const annualSource = {
  111: { out: [null,76,218,2832,120,1,230,9,42,0], incoming: [null,0,44,1302,258,0,184,135,9,0] },
  112: { out: [null,205,204,2480,97,5,297,14,31,0], incoming: [null,1,51,1381,197,0,549,114,1,2] },
  113: { out: [null,71,215,2265,89,6,134,7,72,2], incoming: [null,0,9,1486,205,0,59,26,1,2] },
  114: { out: [null,143,229,2087,93,0,141,5,143,1], incoming: [null,3,21,1324,249,0,186,0,1,1] },
  115: { out: [null,14,29,236,20,0,12,0,10,0], incoming: [null,0,4,208,39,0,39,0,1,0] }
};
const monthlyData = {
  '國際科': Object.fromEntries(Object.entries(demoMonths).map(([month, values]) =>
    [month, values.map(([out, incoming], i) => [demoNames[i], '件', out, incoming])]))
};
const yearlyColumns = rows.map(([name, measure]) => ({
  name, measure: measure === '人' ? '人' : '件',
  label: name + (name === '刑事犯、刑事嫌疑犯緝捕遣返' ? '（' + measure + '）' : '')
}));
let appliedMode = 'month', direction = 0;
let firstYear = 111, lastYear = 115;
function selectedUnits() {
  return appliedUnit === '全部科別' ? ['兩岸科', '國際科'] : [appliedUnit];
}
function matchesColumn(row, column) {
  const name = row[0] === '受刑人移交' ? '罪犯接返（受刑人移交）' : row[0];
  return name === column.name && (row[1] === '人' ? '人' : '件') === column.measure;
}
function annualRows(whichDirection, units = selectedUnits()) {
  return Array.from({ length: lastYear - firstYear + 1 }, (_, i) => {
    const year = firstYear + i;
    const periods = units.map(unit => ({ unit, entries: unit === '兩岸科' ? [] : Object.entries(monthlyData[unit])
      .filter(([month]) => Number(month.slice(0, 4)) === year + 1911) }));
    const datasets = periods.flatMap(period => period.entries.map(([, values]) => values));
    const historical = units.includes('兩岸科') ? annualSource[year] : null;
    const values = yearlyColumns.map((column, index) => {
      const matches = datasets.flatMap(dataset => dataset.filter(row => matchesColumn(row, column)));
      const numbers = matches.map(row => row[2 + whichDirection]);
      const historicValue = historical?.[whichDirection === 0 ? 'out' : 'incoming'][index];
      if (historicValue != null) numbers.push(historicValue);
      return sumKnown(numbers);
    });
    const total = historical || datasets.length ? values.reduce((sum, value, i) =>
      sum + (yearlyColumns[i].measure === '件' ? (value ?? 0) : 0), 0) : null;
    const partial = (historical || datasets.length > 0) && (year === 115 ||
      (units.includes('國際科') && periods.find(period => period.unit === '國際科').entries.length < 12));
    return { year, values, total, partial, periods,
      label: year + ' 年' + (partial ? ' ' : '') };
  });
}
function sumKnown(values) {
  const known = values.filter(value => value != null);
  return known.length ? known.reduce((sum, value) => sum + value, 0) : null;
}
function annualTable(whichDirection) {
  const records = annualRows(whichDirection);
  // 年度原表未提供緝捕遣返件數，僅移除此展示欄；月統計與加總口徑不變。
  const columns = yearlyColumns.map((column, index) => ({ ...column, index }))
    .filter(column => !(column.name === '刑事犯、刑事嫌疑犯緝捕遣返' && column.measure === '件'));
  const headers = ['年度', ...columns.map(column => column.label), '已知件數合計'];
  const total = ['期間合計（已知件數）', ...columns.map(column =>
    sumKnown(records.map(record => record.values[column.index]))), sumKnown(records.map(record => record.total))];
  return { headers, rows: records.map(record => [record.label, ...columns.map(column => record.values[column.index]), record.total]), total };
}
function incomingLabel() {
  return appliedUnit === '兩岸科' ? '陸方請求' : appliedUnit === '國際科' ? '外方請求' : '陸方／外方請求';
}
function annualPeriod() { return '民國 ' + firstYear + '～' + lastYear + ' 年'; }
function coverageText() {
  const notes = [];
  if (selectedUnits().includes('兩岸科')) {
    const years = Object.keys(annualSource).map(Number).filter(year => year >= firstYear && year <= lastYear);
    notes.push(years.length ? '兩岸科：' + years.join('、') + ' 年歷年表資料，緝捕遣返僅提供人數，件數未提供。' : '兩岸科：所選期間尚無資料。');
    if (years.includes(115)) notes.push('115 年為累計資料，截止月份未註明。');
    notes.push('歷年原表的日期歸屬口徑待確認；正式案件統計以收件日期為準。');
  }
  if (selectedUnits().includes('國際科')) {
    const months = Object.keys(monthlyData['國際科']).filter(month => {
      const year = Number(month.slice(0, 4)) - 1911; return year >= firstYear && year <= lastYear;
    });
    notes.push(months.length ? '國際科：僅提供 ' + months.map(month => (Number(month.slice(0, 4)) - 1911) + ' 年 ' + Number(month.slice(5)) + ' 月').join('、') + '範例資料。' : '國際科：所選期間尚無資料。');
  }
  return notes.join(' ');
}
function renderAnnualTable() {
  const table = annualTable(direction);
  const cells = (values, header = false) => '<tr>' + values.map((value, i) => {
    const tag = header || i === 0 ? 'th' : 'td';
    return '<' + tag + (tag === 'th' ? ' scope="' + (header ? 'col' : 'row') + '"' : '') + '>' + escapeReport(value ?? '—') + '</' + tag + '>';
  }).join('') + '</tr>';
  el('yearly-head').innerHTML = cells(table.headers, true);
  el('yearly-rows').innerHTML = table.rows.map(row => cells(row)).join('');
  el('yearly-total').innerHTML = cells(table.total);
  el('yearly-heading').textContent = direction === 0 ? '我方請求統計' : incomingLabel() + '統計';
  el('yearly-period').textContent = annualPeriod() + ' · ' + appliedUnit;
  el('incoming').textContent = incomingLabel();
  for (const [index, id] of ['outgoing', 'incoming'].entries()) {
    el(id).setAttribute('aria-pressed', String(direction === index));
    el(id).className = 'btn ' + (direction === index ? 'btn-primary' : 'btn-outline-secondary');
  }
  el('coverage').textContent = coverageText();
}
function renderAnnual() {
  el('business').hidden = true;
  el('international').hidden = true;
  el('period').textContent = annualPeriod() + ' · 已提供資料';
  const reports = selectedUnits().map(unit => ({ name: unit,
    total: sumKnown([0, 1].flatMap(d => annualRows(d, [unit]).map(record => record.total))) }));
  el('agencies').innerHTML = reports.map(report => '<tr><td>' + report.name + '</td><td>' + (report.total ?? '—') + '</td></tr>').join('');
  el('monthCards').innerHTML = card(['期間相互請求', sumKnown(reports.map(report => report.total)) ?? '—', '已提供資料合計（件）']);
  renderAnnualTable();
}
function updateModeFields() {
  const annual = el('mode').value === 'year';
  el('year-range').hidden = !annual;
  el('month-field').hidden = annual;
  picker.open = false;
}
el('mode').addEventListener('change', updateModeFields);
for (const id of ['mode', 'unit', 'year-start', 'year-end']) {
  el(id).addEventListener('input', () => { el('query-note').hidden = false; });
  el(id).addEventListener('change', () => { el('query-note').hidden = false; });
}
for (const [index, id] of ['outgoing', 'incoming'].entries()) {
  el(id).addEventListener('click', () => { direction = index; renderAnnualTable(); });
}
el('year-start').addEventListener('input', () => el('year-start').setCustomValidity(''));
el('year-end').addEventListener('input', () => el('year-end').setCustomValidity(''));
updateModeFields();

function render() {
  el('yearly').hidden = appliedMode !== 'year';
  if (appliedMode === 'year') { renderAnnual(); return; }

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
  if (el('mode').value === 'year') {
    const start = el('year-start'), end = el('year-end');
    start.setCustomValidity(''); end.setCustomValidity('');
    if (!start.reportValidity() || !end.reportValidity()) return;
    if (start.valueAsNumber > end.valueAsNumber) {
      end.setCustomValidity('結束年度不得早於起始年度。'); end.reportValidity(); return;
    }
    firstYear = start.valueAsNumber; lastYear = end.valueAsNumber;
  }
  appliedMode = el('mode').value;
  el('query-note').hidden = true;
  selectedMonth = draftMonth;
  appliedUnit = el('unit').value;
  picker.open = false;
  render();
});
function card([title,value,note]){return '<div class="panel metric-card"><span class="metric-label">'+title+'</span><strong class="metric-value">'+value+'</strong><small>'+note+'</small></div>'}

// 保留原版報告編排，資料只取最後一次查詢後的相互請求結果。
function reportData() {
  if (appliedMode === 'year') {
    const lines = [
      ['統計期間', annualPeriod()], ['科別', appliedUnit],
      ['統計基準', '正式統計依收件日期；本次歷年預覽沿用提供的年度表，日期口徑待確認'],
      ['資料範圍', coverageText()]
    ];
    for (const d of [0, 1]) {
      const table = annualTable(d);
      lines.push([], [d === 0 ? '我方請求統計' : incomingLabel() + '統計'],
        table.headers, ...table.rows, table.total);
    }
    lines.push([], ['合計僅包含已提供的請求件數；「—」表示無可用資料。緝捕遣返件數未提供，人數另列、不加入件數合計。']);
    return { title: ['案件歷年統計', annualPeriod(), appliedUnit].join('-'),
      lines: lines.map(row => row.map(value => value ?? '—')), landscape: true };
  }

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
    escapeReport(report.title) + '</h1>' + content + (report.landscape ?
      '<style>@page{size:A4 landscape;margin:10mm}body{max-width:none;font-size:16px;margin:16px auto}h1{font-size:20px}h2{font-size:14px}td{padding:5px 4px;overflow-wrap:anywhere}table{table-layout:fixed}td:first-child{width:10%}</style>' : '') + '</html>';
}
// 使用 ZIP 的無壓縮格式封裝簡單 DOCX，不需下載第三方套件。
function wordBlob(report) {
  const paragraph = value => '<w:p><w:r><w:t xml:space="preserve">' + escapeReport(value) + '</w:t></w:r></w:p>';
  const tableWidth = report.landscape ? 14500 : 9300;
  const body = report.lines.map(row => {
    if (row.length < 2) return paragraph(row[0] || '');
    const width = Math.floor(tableWidth / row.length);
    const borders = ['top','left','bottom','right','insideH','insideV'].map(edge => '<w:' + edge + ' w:val="single" w:sz="4" w:color="CAD7E1"/>').join('');
    return '<w:tbl><w:tblPr><w:tblBorders>' + borders + '</w:tblBorders></w:tblPr><w:tblGrid>' +
      row.map(() => '<w:gridCol w:w="' + width + '"/>').join('') + '</w:tblGrid><w:tr>' + row.map(value =>
        '<w:tc><w:tcPr><w:tcW w:w="' + width + '" w:type="dxa"/></w:tcPr>' + paragraph(value) + '</w:tc>').join('') + '</w:tr></w:tbl>';
  }).join('');
  const files = {
    '[Content_Types].xml': '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
    '_rels/.rels': '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    'word/document.xml': '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' + paragraph(report.title) + body +
      '<w:sectPr>' + (report.landscape ? '<w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/>' : '<w:pgSz w:w="11906" w:h="16838"/>') + '<w:pgMar w:top="850" w:bottom="850" w:left="850" w:right="850"/></w:sectPr></w:body></w:document>'
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
