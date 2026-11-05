(() => {
  'use strict';
const rows=[
['刑事犯、刑事嫌疑犯緝捕遣返','件',4,0,0,0,5,4,0],['刑事犯、刑事嫌疑犯緝捕遣返','人',4,5,0,0,5,0,0],['犯罪情資交換','件',19,1,0,3,5,19,0],['司法文書送達','件',72,87,124,42,7,0,0],['調查取證','件',13,14,14,22,6,0,0],['罪犯接返（受刑人移交）','—',0,0,0,0,6,0,0],['人身自由受限制通報','件',6,6,0,0,6,0,0],['非病死及可疑非病死通報','件',0,0,0,0,6,0,0],['其他（如陳情等）','件',5,6,0,0,6,0,0],['業務交流','—',0,0,0,0,5,0,0]];
const el=id=>document.getElementById('monthly-table-' + id);
const expanded = { business: true, international: false };
const demoMonths = {
  '2026-01': [[20,15,18,14], [12,8,9,6], [6,4,5,3], [2,1,1,1]],
  '2026-02': [[24,19,17,13], [14,10,11,8], [8,6,6,5], [3,2,2,1]]
};
const demoNames = ['司法文書送達', '調查取證', '犯罪情資交換', '受刑人移交'];
function progressCard(unit, period) {
  if (period !== '2026-02' || unit === '國際科') {
    return card(['進行中', '—', '本月未提供進行中件數']);
  }
  // 緝捕遣返另列人數，統計案件時只加總單位為「件」的列。
  const counts = rows.reduce((total, row) => {
    const [, measure, , , , , , mainland, domestic] = row;
    if (measure === '件') {
      total.domestic += domestic;
      total.mainland += mainland;
    }
    return total;
  }, { domestic: 0, mainland: 0 });
  const note = unit === '全部科別' ? '僅計兩岸科，國際科未提供' : '兩岸科月報 · 第 005 頁';
  return card(['進行中', `我方 ${counts.domestic} 件｜陸方 ${counts.mainland} 件`, note]);
}
function resetDetails() {
  expanded.business = true;
  expanded.international = el('unit').value === '國際科';
}
let selectedMonth = '2026-02';
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
    button.setAttribute('aria-pressed', String(selectedMonth === yearInput.value + '-' + button.value));
  }
}
picker.addEventListener('toggle', () => {
  if (picker.open) {
    yearInput.value = selectedMonth.slice(0, 4);
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
    selectedMonth = String(yearInput.valueAsNumber) + '-' + button.value;
    document.getElementById('monthly-period-value').textContent =
      yearInput.valueAsNumber + '年' + button.value + '月';
    resetDetails();
    render();
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
  const unit = el('unit').value;
  const [year, month] = selectedMonth.split('-').map(Number);
  el('period').textContent = '民國 ' + (year - 1911) + ' 年 ' + month + ' 月';
  const demo = demoMonths[selectedMonth];
  const demoTotals = demo?.reduce(([requests, done], [out, outDone, incoming, inDone]) =>
    [requests + out + incoming, done + outDone + inDone], [0, 0]);
  const reports = [
    { name: '兩岸科', id: 'business', totals: selectedMonth === '2026-02' ? [261, 186] : null },
    { name: '國際科', id: 'international', totals: demoTotals }
  ].filter(report => unit === '全部科別' || report.name === unit);
  el('agencies').innerHTML = reports.map(({ name, id, totals }) => {
    if (!totals) return '<tr><td>' + name + '</td><td>—</td><td>—</td><td>尚無資料</td></tr>';
    const label = name + (id === 'international' ? '（示範資料）' : '');
    return `<tr><td>${label}</td><td>${totals[0]}</td><td>${totals[1]}</td><td>
      <button class="btn btn-sm btn-soft" type="button" id="monthly-table-toggle-${id}"
        data-report="${id}" aria-controls="monthly-table-${id}" aria-expanded="${expanded[id]}">
        ${expanded[id] ? '收合明細' : '查看明細'}</button></td></tr>`;
  }).join('');
  const available = reports.filter(report => report.totals);
  const hasDemo = available.some(report => report.id === 'international');
  const note = hasDemo ? (available.length > 1 ? '含國際科示範資料' : '國際科示範資料') :
    (available.length ? '月報原表合計' : '尚無資料');
  el('monthCards').innerHTML = ['相互請求', '已完成'].map((label, index) =>
    card([label, available.length ? available.reduce((sum, r) => sum + r.totals[index], 0) : '—', note])
  ).join('') + progressCard(unit, selectedMonth);
  for (const id of ['business', 'international']) {
    el(id).hidden = !(expanded[id] && available.some(report => report.id === id));
  }
  el('summary').hidden = el('business').hidden;
  el('demo-rows').innerHTML = (demo || []).map((values, i) =>
    '<tr><td>' + demoNames[i] + '</td><td>件</td>' +
      values.map(n => '<td>' + n + '</td>').join('') + '<td></td></tr>'
  ).join('');
}
function source(n){el('sourceTitle').textContent=({5:'案件統計月報 · 表格節錄',6:'協助事項月報',7:'海基會文書送達統計'})[n]+'｜第 '+String(n).padStart(3,'0')+' 頁';el('scan').src='assets/monthly-report/'+n+'.jpg';el('source').showModal();}
el('items').innerHTML=rows.map(([name,unit,a,b,c,d,page,pendingA,pendingB])=>'<tr><td><strong>'+name+'</strong><small class="assistance-note">進行中：陸方 '+pendingA+'、我方 '+pendingB+'<br>瑕疵／補正：雙方皆為 0'+(page===7?'<br>海基會 2 月列：新收／結案對應請求／完成。':name.startsWith('其他')?'<br>2 月收文 5 件，通報 6 件，含 1 件 1 月收文。':'')+'</small></td><td>'+unit+'</td>'+[a,b,c,d].map(x=>'<td>'+x+'</td>').join('')+'<td><button class="btn btn-sm btn-soft" data-source="'+page+'">查看 '+String(page).padStart(3,'0')+'</button></td></tr>').join('');
document.getElementById('page-reports-table').addEventListener('click', event => {
  const { source: page, report } = event.target.dataset;
  if (page) source(Number(page));
  if (report) {
    expanded[report] = !expanded[report];
    render();
    el('toggle-' + report).focus();
  }
});
el('unit').onchange = () => { resetDetails(); render(); };
el('close').onclick = () => el('source').close();
function card([title,value,note]){return '<div class="panel metric-card"><span class="metric-label">'+title+'</span><strong class="metric-value">'+value+'</strong><small>'+note+'</small></div>'}

render();
})();
