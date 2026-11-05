(() => {
  'use strict';
  const get = id => document.getElementById('stats-' + id);
  const units = ['兩岸科', '國際科'];
  let unit = '兩岸科';
  let direction = 0;
  const reportMonth = 2;
  const month = get('month');
  const period = () => '115 年 ' + month.value + ' 月';
  const hasReport = () => Number(month.value) === reportMonth;

  // PDF 第 5 頁。每方向依序為提出、完成、瑕疵／補正、進行中。
  const items = [
    ['刑事犯、刑事嫌疑犯緝捕遣返（案件）', [4, 0, 0, 4], [0, 0, 0, 0]],
    ['刑事犯、刑事嫌疑犯緝捕遣返（人數）', [4, 5, 0, 0], [0, 0, 0, 0]],
    ['犯罪情資交換', [19, 1, 0, 19], [0, 3, 0, 0]],
    ['司法文書送達', [72, 87, 0, 0], [124, 42, 0, 0]],
    ['調查取證', [13, 14, 0, 0], [14, 22, 0, 0]],
    ['罪犯接返（受刑人移交）', [0, 0, 0, 0], [0, 0, 0, 0]],
    ['人身自由受限制通報', [6, 6, 0, 0], [0, 0, 0, 0]],
    ['非病死及可疑非病死通報', [0, 0, 0, 0], [0, 0, 0, 0]],
    ['其他（如陳情等）', [5, 6, 0, 0], [0, 0, 0, 0]],
    ['業務交流', [0, 0, 0, 0], [0, 0, 0, 0]]
  ];
  const totals = [261, 186]; // 原表雙方合計，與方向切換獨立。
  const summaryLabels = ['雙方相互請求', '雙方合作完成'];
  // 第 7 頁海基會分表，依原表保留結案率與函催欄位。
  const deliveryRows = {
    1: [[164, 238, '145%', 16], [84, 108, '129%', '—'], [49, 46, '94%', 4]],
    2: [[72, 87, '121%', 11], [124, 42, '34%', '—'], [33, 16, '48%', 2]]
  };
  const deliveryLabels = ['司法文書 · 我方請求陸方', '司法文書 · 陸方請求我方', '行政文書 · 海基會協處'];
  function deliveryTable() {
    return {
      headers: ['文書送達方向', '新收件數', '結案件數', '結案率', '函催件數'],
      rows: deliveryRows[month.value].map((values, index) => [deliveryLabels[index], ...values])
    };
  }
  const agencies = {
    headers: ['機關與項目', '115 年 2 月辦理情形', '原表頁次'],
    rows: [
      ['刑事警察局 · 緝捕遣返', '我方提出 4 件（4 人），陸方完成遣返 5 人', '第 12 頁'],
      ['刑事警察局 · 犯罪情資交換', '我方提出 19 件，陸方完成 1 件，我方完成 3 件', '第 12 頁'],
      ['海巡署 · 犯罪情資交換', '我方與陸方當月各提供 0 件', '第 15 頁']
    ]
  };
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
      rows: units.map(name => {
        if (name === '兩岸科' && hasReport()) return [name, ...totals, '已提供'];
        if (name === '兩岸科' && deliveryRows[month.value]) return [name, '—', '—', '僅有海基會分表'];
        return [name, '—', '—', '尚無月報'];
      })
    };
    if (!hasReport()) return deliveryTable();
    const [sender, recipient] = direction === 0 ? ['我方', '陸方'] : ['陸方', '我方'];
    return {
      headers: ['協助事項', sender + '提出', recipient + '完成', recipient + '瑕疵／補正', recipient + '進行中'],
      rows: items.map(([name, outbound, inbound]) => [name, ...(direction === 0 ? outbound : inbound)])
    };
  }
  function table({headers, rows}, title = get('title').textContent) {
    const head = headers.map(label => '<th scope="col">' + label + '</th>').join('');
    const body = rows.map(([name, ...values]) => {
      const label = unit === '全部' && name === '兩岸科' && deliveryRows[month.value]
        ? '<button type="button" class="stats-link" data-unit="' + name + '">' + name + ' ›</button>' : name;
      const cells = values.map(v => v === null ? '<td class="stats-muted">原表遮蔽</td>' : '<td>' + v + '</td>').join('');
      return '<tr><th scope="row">' + label + '</th>' + cells + '</tr>';
    }).join('');
    return '<div class="stats-scroll" tabindex="0" role="region" aria-label="' + title +
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
    const delivery = unit === '兩岸科' && deliveryRows[month.value];
    get('export').disabled = !deliveryRows[month.value] || unit === '國際科';
    if (unit !== '全部' && !delivery) {
      get('result').innerHTML = '<p class="stats-empty">' + unit + '尚未提供' + period() + '月報。</p>';
      return;
    }
    if (delivery && !detail) get('title').textContent = '海基會文書送達明細';
    let content = table(dataset());
    if (detail) {
      content += '<p class="stats-note">來源：第 5 頁兩岸協助總表。「提出」含請求、邀請及主動提供。</p>';
      content += '<div class="stats-head"><h3>海基會文書送達明細</h3></div>' + table(deliveryTable(), '海基會文書送達明細');
    }
    if (delivery) content += '<p class="stats-note">來源：第 7 頁海基會月表。結案率依原表列示，當月結案可包含以前月份收件。</p>';
    if (detail) {
      content += '<div class="stats-head"><h3>執行機關摘要</h3></div>' + table(agencies, '執行機關摘要');
      content += '<p class="stats-note">機關分表另列供核對；月報合計採第 5 頁公布數。</p>';
    }
    get('result').innerHTML = content;
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
    const detail = unit === '兩岸科' && hasReport();
    if (detail) lines.push(summaryLabels, totals, ['協助事項明細（第 5 頁）']);
    lines.push(headers, ...rows);
    if (detail) {
      const delivery = deliveryTable();
      lines.push([], ['海基會文書送達明細（第 7 頁）'], delivery.headers, ...delivery.rows);
      lines.push([], ['執行機關摘要'], agencies.headers, ...agencies.rows);
    }
    const csv = lines.map(row => row.map(v => v === null ? '原表遮蔽' : v).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = ['案件統計', period(), unit, ...(detail ? [headers[1]] : [])].join('-') + '.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  render();
})();
