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
  // 客戶展示用。每列依序為我方提出、外方完成、外方提出、我方完成。
  const demoTypes = ['司法文書送達', '調查取證', '犯罪情資交換', '受刑人移交'];
  const international = {
    1: [[20, 15, 18, 14], [12, 8, 9, 6], [6, 4, 5, 3], [2, 1, 1, 1]],
    2: [[24, 19, 17, 13], [14, 10, 11, 8], [8, 6, 6, 5], [3, 2, 2, 1]]
  };
  function demoTotals() {
    return international[month.value].reduce(([requests, completed], [out, outDone, incoming, inDone]) =>
      [requests + out + incoming, completed + outDone + inDone], [0, 0]);
  }
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
        if (name === '國際科' && international[month.value]) return [name, ...demoTotals(), '示範資料'];
        if (name === '兩岸科' && hasReport()) return [name, ...totals, '已提供'];
        if (name === '兩岸科' && deliveryRows[month.value]) return [name, '—', '—', '僅有海基會分表'];
        return [name, '—', '—', '尚無月報'];
      })
    };
    if (unit === '國際科') {
      return {
        headers: direction === 0 ? ['協助事項', '我方提出', '外方完成'] : ['協助事項', '外方提出', '我方完成'],
        rows: international[month.value].map((counts, index) =>
          [demoTypes[index], ...counts.slice(direction * 2, direction * 2 + 2)])
      };
    }
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
      const label = unit === '全部' && (name === '國際科' ? international[month.value] : deliveryRows[month.value])
        ? '<button type="button" class="stats-link" data-unit="' + name + '">' + name + ' ›</button>' : name;
      const cells = values.map(v => v === null ? '<td class="stats-muted">原表遮蔽</td>' : '<td>' + v + '</td>').join('');
      return '<tr><th scope="row">' + label + '</th>' + cells + '</tr>';
    }).join('');
    return '<div class="stats-scroll" tabindex="0" role="region" aria-label="' + title +
      '"><table><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table></div>';
  }
  function renderOverview() {
    const host = get('cards');
    const demo = unit === '國際科' && international[month.value];
    const delivery = unit === '兩岸科' && deliveryRows[month.value];
    host.hidden = !demo && !delivery;
    if (host.hidden) { host.innerHTML = ''; return; }

    let cards, trend, trendTitle, parts, mixTitle, mixNote;
    if (demo) {
      const [requests, completed] = demoTotals();
      const outgoing = demo.reduce((sum, row) => sum + row[0], 0);
      cards = [[summaryLabels[0], requests, '雙向合計'], [summaryLabels[1], completed, '雙向合計'],
        ['我方提出', outgoing, '各協助事項合計'], ['外方提出', requests - outgoing, '各協助事項合計']];
      trendTitle = '各月雙方請求件數';
      trend = Object.entries(international).map(([m, rows]) => [m, rows.reduce((sum, r) => sum + r[0] + r[2], 0)]);
      mixTitle = '請求類型分布';
      mixNote = '雙方提出件數 · 示範資料';
      parts = demo.map((r, i) => [demoTypes[i], r[0] + r[2]]);
    } else {
      const [outgoing, incoming, admin] = delivery;
      cards = hasReport()
        ? [[summaryLabels[0], totals[0], '兩岸協助總表'], [summaryLabels[1], totals[1], '兩岸協助總表'],
          ['司法文書新收', outgoing[0] + incoming[0], '雙向送達合計'], ['司法文書結案', outgoing[1] + incoming[1], '雙向送達合計']]
        : [['司法文書新收', outgoing[0] + incoming[0], '雙向送達合計'], ['司法文書結案', outgoing[1] + incoming[1], '雙向送達合計'],
          ['行政文書新收', admin[0], '海基會協處'], ['行政文書結案', admin[1], '海基會協處']];
      trendTitle = '各月司法文書新收件數';
      trend = Object.entries(deliveryRows).map(([m, rows]) => [m, rows[0][0] + rows[1][0]]);
      mixTitle = '文書新收件數分布';
      mixNote = '司法與行政文書 · 海基會月表';
      parts = [['司法 · 我方請求', outgoing[0]], ['司法 · 陸方請求', incoming[0]], ['行政 · 海基會協處', admin[0]]];
    }
    const kpis = cards.map(([label, n, note]) => '<article class="panel stat-kpi"><span>' + label +
      '</span><strong>' + n + '</strong><small>' + note + '</small></article>').join('');
    const visibleMonths = trend.filter(([m]) => Number(m) <= Number(month.value));
    const peak = Math.max(...visibleMonths.map(([, n]) => n));
    const bars = visibleMonths.map(([, n]) => '<div class="stat-col">' + n +
      '<i style="height:' + n / peak * 78 + '%"></i></div>').join('');
    const ticks = visibleMonths.map(([m]) => '<span>' + m + ' 月</span>').join('');
    const sum = parts.reduce((s, [, n]) => s + n, 0);
    const colors = ['var(--color-brand-800)', 'var(--color-brand-600)', 'var(--color-success-300)', 'var(--color-brand-300)'];
    let cumulative = 0;
    const stops = parts.map(([, n], i) => {
      const start = cumulative;
      cumulative += n;
      return colors[i] + ' ' + start / sum * 100 + '% ' + cumulative / sum * 100 + '%';
    });
    const legend = parts.map(([label, n], i) => '<div><i style="background:' + colors[i] + '"></i>' + label +
      '<b>' + n + ' 件 · ' + (100 * n / sum).toFixed(1) + '%</b></div>').join('');
    host.innerHTML = '<div class="stat-kpis">' + kpis + '</div><div class="stat-grid">' +
      '<article class="panel stat-panel"><h3>' + trendTitle + '</h3><p>截至 ' + period() + ' · 單位：件</p><div class="stat-bars">' +
      bars + '</div><div class="stat-ticks">' + ticks + '</div></article>' +
      '<article class="panel stat-panel"><h3>' + mixTitle + '</h3><p>' + mixNote + '</p><div class="stat-mix">' +
      '<div class="stat-ring" style="background:conic-gradient(' + stops.join(',') + ')"><strong>' + sum +
      '<small>合計件數</small></strong></div><div class="stat-legend">' + legend + '</div></div></article></div>';
  }

  function render() {
    const detail = unit === '兩岸科' && hasReport();
    const demo = unit === '國際科' && international[month.value];
    const partnerLabel = unit === '國際科' ? '外方提出' : '陸方提出';
    get('directions').querySelectorAll('button')[1].textContent = partnerLabel;
    get('prev').disabled = month.selectedIndex === 0;
    get('next').disabled = month.selectedIndex === month.options.length - 1;
    get('period').textContent = period() + ' · ' + (unit === '全部' ? '全部科別' : unit) + (demo ? ' · 示範資料' : '');
    selectButtons(get('units'), unit);
    selectButtons(get('directions'), direction === 0 ? '我方提出' : partnerLabel);
    get('directions').hidden = !(detail || demo);
    get('history').hidden = !detail;
    renderOverview();
    get('title').textContent = unit === '全部' ? '各科月報比較' : '協助事項明細';
    const delivery = unit === '兩岸科' && deliveryRows[month.value];
    get('export').disabled = !(delivery || demo || (unit === '全部' && (deliveryRows[month.value] || international[month.value])));
    if (unit !== '全部' && !delivery && !demo) {
      get('result').innerHTML = '<p class="stats-empty">' + unit + '尚未提供' + period() + '月報。</p>';
      return;
    }
    if (delivery && !detail) get('title').textContent = '文書送達明細';
    let content = table(dataset());
    if (detail) {
      content += '<p class="stats-note">來源：第 5 頁兩岸協助總表。「提出」含請求、邀請及主動提供。</p>';
      content += '<div class="stats-head"><h3>文書送達明細</h3></div>' + table(deliveryTable(), '文書送達明細');
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
  window.JudicialApp.setupStatsExport(get('export'), () => {
    const { headers, rows } = dataset();
    const lines = [['統計月份', period()], ['科別', unit]];
    const detail = unit === '兩岸科' && hasReport();
    if (unit === '國際科') lines.push(['資料性質', '示範資料'], summaryLabels, demoTotals());
    if (detail) lines.push(summaryLabels, totals, ['協助事項明細（第 5 頁）']);
    lines.push(headers, ...rows);
    if (detail) {
      const delivery = deliveryTable();
      lines.push([], ['文書送達明細（第 7 頁）'], delivery.headers, ...delivery.rows);
      lines.push([], ['執行機關摘要'], agencies.headers, ...agencies.rows);
    }
    return {title: ['案件統計-版型2', period(), unit].join('-'), lines};
  });
  render();
})();
