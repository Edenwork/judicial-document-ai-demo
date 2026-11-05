(() => {
  'use strict';
  const get = id => document.getElementById('stats-' + id);
  const units = ['兩岸科', '國際科'];
  let unit = '全部';
  let direction = 0;
  const reportMonth = 2;
  const month = get('month');
  const period = () => '115 年 ' + month.value + ' 月';
  const hasReport = () => Number(month.value) === reportMonth;

  // PDF 第 3 頁（印刷頁 005）。每方向依序為提出、完成、瑕疵／補正、進行中。
  // null 代表掃描表遮蔽，不能解讀為零。
  const masked = [null, null, null];
  const items = [
    ['刑事犯、刑事嫌疑犯緝捕遣返（案件）', [4, 0, 0, 4], [0, 0, 0, 0]],
    ['刑事犯、刑事嫌疑犯緝捕遣返（人數）', [4, 5, 0, 0], [0, 0, 0, 0]],
    ['犯罪情資交換', [19, 1, 0, 19], [0, 3, 0, 0]],
    ['司法文書送達', [72, ...masked], [null, 42, 0, 0]],
    ['調查取證', [13, ...masked], [null, 22, 0, 0]],
    ['罪犯接返（受刑人移交）', [0, ...masked], [null, 0, 0, 0]],
    ['人身自由受限制通報', [6, ...masked], [null, 0, 0, 0]],
    ['非病死及可疑非病死通報', [0, ...masked], [null, 0, 0, 0]],
    ['其他（如陳情等）', [5, ...masked], [null, 0, 0, 0]],
    ['業務交流', [0, 0, 0, 0], [0, 0, 0, 0]]
  ];
  const totals = [261, 186]; // 原表雙方合計，與方向切換獨立。
  const summaryLabels = ['雙方相互請求', '雙方合作完成'];
  const annual = [[110,1733], [111,1302], [112,1381], [113,1486], [114,1324]];
  for (let m = 1; m <= 12; m++) month.add(new Option('115 年 ' + m + ' 月', m));
  month.value = reportMonth;
  const peak = Math.max(...annual.map(([, value]) => value));
  get('bars').innerHTML = annual.map(([year, value]) =>
    '<div class="stats-bar"><span>' + year + ' 年</span><meter min="0" max="' + peak + '" value="' + value + '"></meter><b>' + value.toLocaleString('zh-TW') + ' 件</b></div>'
  ).join('');

  function selectButtons(group, active) {
    for (const button of group.querySelectorAll('button')) {
      button.setAttribute('aria-pressed', String(button.textContent === active));
    }
  }
  function dataset() {
    if (unit === '全部') return {
      headers: ['科別', ...summaryLabels, '月報狀態'],
      rows: units.map(name => name === '兩岸科' && hasReport()
        ? [name, ...totals, '已提供'] : [name, '—', '—', '尚無月報'])
    };
    const [sender, recipient] = direction === 0 ? ['我方', '陸方'] : ['陸方', '我方'];
    return {
      headers: ['協助事項', sender + '提出', recipient + '完成', recipient + '瑕疵／補正', recipient + '進行中'],
      rows: items.map(([name, outbound, inbound]) => [name, ...(direction === 0 ? outbound : inbound)])
    };
  }
  function table({headers, rows}) {
    const head = headers.map(label => '<th scope="col">' + label + '</th>').join('');
    const body = rows.map(([name, ...values]) => {
      const label = unit === '全部' && name === '兩岸科' && hasReport()
        ? '<button type="button" class="stats-link" data-unit="' + name + '">' + name + ' ›</button>' : name;
      const cells = values.map(v => v === null ? '<td class="stats-muted">原表遮蔽</td>' : '<td>' + v + '</td>').join('');
      return '<tr><th scope="row">' + label + '</th>' + cells + '</tr>';
    }).join('');
    return '<div class="stats-scroll" tabindex="0" role="region" aria-label="' + get('title').textContent +
      '"><table><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table></div>';
  }
  function render() {
    const detail = unit === '兩岸科' && hasReport();
    get('prev').disabled = month.selectedIndex === 0;
    get('next').disabled = month.selectedIndex === month.options.length - 1;
    get('period').textContent = period() + ' · ' + (unit === '全部' ? '全部科別' : unit);
    selectButtons(get('units'), unit);
    selectButtons(get('directions'), direction === 0 ? '我方提出' : '陸方提出');
    get('directions').hidden = !detail;
    get('history').hidden = !detail;
    get('cards').hidden = !detail;
    get('cards').innerHTML = detail ? summaryLabels.map((label,i) =>
      '<div class="panel stats-card"><span>' + label + '</span><strong>' + totals[i] + '</strong></div>').join('') : '';
    get('title').textContent = unit === '全部' ? '各科月報比較' : '協助事項明細';
    get('export').disabled = !hasReport() || unit === '國際科';
    if (unit !== '全部' && !detail) {
      get('result').innerHTML = '<p class="stats-empty">' + unit + '尚未提供' + period() + '月報。</p>';
      return;
    }
    const note = detail ? '<p class="stats-note">來源：115 年 2 月月報，第 3 頁（印刷頁 005）。「提出」含請求、邀請及主動提供。</p>' : '';
    get('result').innerHTML = table(dataset()) + note;
  }
  get('units').addEventListener('click', event => {
    if (event.target.tagName === 'BUTTON') { unit = event.target.textContent; render(); }
  });
  get('result').addEventListener('click', event => {
    if (event.target.dataset.unit) {
      unit = event.target.dataset.unit;
      render();
      get('units').querySelector('[aria-pressed="true"]').focus();
    }
  });
  get('directions').addEventListener('click', event => {
    if (event.target.tagName === 'BUTTON') { direction = event.target.textContent === '我方提出' ? 0 : 1; render(); }
  });
  month.addEventListener('change', render);
  get('prev').addEventListener('click', () => { month.selectedIndex--; render(); });
  get('next').addEventListener('click', () => { month.selectedIndex++; render(); });
  get('export').addEventListener('click', () => {
    const { headers, rows } = dataset();
    const lines = [['統計月份', period()], ['科別', unit]];
    if (unit === '兩岸科') lines.push(summaryLabels, totals);
    lines.push(headers, ...rows);
    const csv = lines.map(row => row.map(v => v === null ? '原表遮蔽' : v).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = ['案件統計', period(), unit, ...(unit === '兩岸科' ? [headers[1]] : [])].join('-') + '.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  render();
})();
