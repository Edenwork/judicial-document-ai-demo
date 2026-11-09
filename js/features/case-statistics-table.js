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
    '<tr><td>' + demoNames[i] + '</td><td>件</td>' +
      values.map(n => '<td>' + n + '</td>').join('') + '</tr>'
  ).join('');
}
el('items').innerHTML = rows.map(([name, unit, out, incoming]) =>
  '<tr><td><strong>' + name + '</strong></td><td>' + unit + '</td><td>' + out + '</td><td>' + incoming + '</td></tr>'
).join('');
el('apply').addEventListener('click', () => {
  selectedMonth = draftMonth;
  appliedUnit = el('unit').value;
  picker.open = false;
  render();
});
function card([title,value,note]){return '<div class="panel metric-card"><span class="metric-label">'+title+'</span><strong class="metric-value">'+value+'</strong><small>'+note+'</small></div>'}

render();
})();
