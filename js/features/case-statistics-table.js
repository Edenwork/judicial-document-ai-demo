(() => {
  'use strict';

  const app = window.JudicialApp;
  const el = id => document.getElementById('monthly-table-' + id);
  const { executionRows, executionTotals, deliveryRows } = app.statisticsMonthlyData;
  const requests = ['我方請求', '陸方請求'];
  const monthWithExecution = '2026-02';
  let applied = { mode: 'month', month: monthWithExecution, start: 111, end: 115 };
  let draftMonth = applied.month;
  let direction = 0;
  let report;

  const escapeReport = value => String(value ?? '—').replace(/[&<>"']/g, char =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]);
  const number = new Intl.NumberFormat('zh-TW');
  const display = value => typeof value === 'number' ? number.format(value) : value ?? '—';
  const sum = values => values.reduce((total, value) => total + (value ?? 0), 0);

  const picker = document.getElementById('monthly-period-picker');
  const options = picker.querySelector('.monthly-months');
  const trigger = picker.querySelector('summary');
  const yearInput = document.getElementById('monthly-period-year');
  const yearStart = el('year-start');
  const yearEnd = el('year-end');

  function closePicker() {
    picker.open = false;
    trigger.focus();
  }

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
      draftMonth = yearInput.valueAsNumber + '-' + button.value;
      document.getElementById('monthly-period-value').textContent =
        yearInput.valueAsNumber + '年' + button.value + '月';
      el('query-note').hidden = false;
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

  const requestHeading = '請求、邀請、主動提供';
  const replyColumns = ['完成', '瑕疵／補正', '進行中'];
  const monthlyGroups = [
    ['項次'], ['協助事項'], ['我方', requestHeading], ['陸方回復', ...replyColumns],
    ['陸方', requestHeading], ['我方回復', ...replyColumns], ['備註']
  ];
  const monthlyNote = '來源：第 005 頁，115 年 3 月 10 日製表。原表合計包含緝捕遣返人數。當月完成可包含前期案件。';
  const monthlyTotals = [['雙方相互請求', executionTotals[0]], ['雙方合作完成', executionTotals[1]]];
  const monthlyItems = executionRows.filter((_, i) => i !== 1);
  const monthlyTable = {
    groups: monthlyGroups,
    rowHeader: 1,
    weights: [5, 21, 11, 7, 7, 7, 11, 7, 7, 7, 10],
    rows: monthlyItems.map(([name, ...directions], i) => {
      const values = directions.flat();
      const item = name.replace('（案件）', '');
      if (i === 0) {
        executionRows[1].slice(1).flat().forEach((people, column) => {
          if (people) values[column] = values[column]
            ? values[column] + ' 件（' + people + ' 人）' : people + ' 人';
        });
      }
      return [i + 1, item, ...values, ''];
    }),
    footer: monthlyTotals,
    otherDetails: { label: '其他（請列舉）', value: '' }
  };

  // PDF 第 002、003 頁。null 與原表的空格相對應。
  // 欄序：緝捕請求人數、完成人數、情資、文書請求、完成、取證請求、完成、
  // 移交請求、完成、人身自由、非病死、其他、業務交流、原表單年累計。
  const annualSources = [
    [
      [338,168,1313,16488,13702,308,118,null,6,337,null,null,92,32870],
      [213,88,521,5607,6621,115,118,null,5,595,11,null,26,13920],
      [174,72,662,7716,5932,182,126,250,0,660,12,null,40,15826],
      [150,55,602,10858,6798,209,163,145,5,1203,27,null,30,20245],
      [151,63,822,8088,5451,264,141,50,3,920,52,null,37,16042],
      [189,17,814,5990,5476,224,96,24,0,724,39,681,3,14277],
      [114,13,658,4724,4919,229,153,11,0,639,20,54,2,11536],
      [98,11,549,3590,3819,195,120,2,0,1057,25,75,1,9542],
      [123,11,589,3158,3546,171,140,4,0,1103,20,113,2,8980],
      [68,4,305,2987,3363,128,107,2,0,360,14,69,27,7434],
      [80,3,342,2795,3772,139,266,1,0,340,15,58,0,7811],
      [76,2,218,2832,2861,120,130,1,0,230,9,42,0,6521],
      [205,4,204,2480,3481,97,104,5,0,297,14,31,0,6922],
      [71,1,215,2265,3071,89,62,6,0,134,7,72,2,5995],
      [143,0,229,2087,2229,93,106,0,0,141,5,143,1,5177],
      [14,6,29,236,325,20,28,0,0,12,0,10,0,680]
    ],
    [
      [7,4,430,1002,861,22,13,0,0,1463,null,null,59,3861],
      [2,1,175,1792,1729,77,51,0,0,419,276,null,31,4553],
      [1,3,222,2791,2581,125,137,0,0,487,71,null,31,6449],
      [8,2,213,3258,3199,174,130,0,0,444,94,null,22,7544],
      [1,1,282,3422,3229,171,184,0,0,559,93,null,34,7976],
      [1,1,156,2636,2790,180,187,0,0,1085,99,null,7,7142],
      [0,0,98,2842,2846,345,300,0,0,756,129,9,5,7330],
      [4,3,73,2405,2394,242,279,0,0,748,108,4,8,6268],
      [6,6,84,2132,2223,328,302,0,0,829,136,10,3,6059],
      [3,1,67,1788,1739,280,273,0,0,243,103,6,45,4548],
      [2,0,41,1733,1766,301,284,0,0,301,109,11,0,4548],
      [0,0,44,1302,1465,258,271,0,0,184,135,9,0,3668],
      [1,1,51,1381,1320,197,190,0,0,549,114,1,2,3807],
      [0,0,9,1486,1461,205,170,0,0,59,26,1,2,3419],
      [3,0,21,1324,1368,249,239,0,0,186,0,1,2,3393],
      [0,0,4,208,150,39,48,0,0,39,0,0,0,488]
    ]
  ];
  const annualPeriods = [[98, 100], ...Array.from({ length: 15 }, (_, i) => [101 + i, 101 + i])];
  const annualSourceTotals = [
    ['我方請求', 105897], ['陸方完成', 96586], ['陸方請求', 46851], ['我方完成', 46319],
    ['雙方相互總請求', 152748], ['雙方相互總完成', 142905]
  ];

  const annualNames = [
    '刑事犯、刑事嫌疑犯緝捕遣返（人數）', '犯罪情資交換', '司法文書送達', '調查取證',
    '罪犯接返（受刑人移交）', '人身自由受限制通報', '非病死通報', '其他（如陳情等）', '業務交流'
  ];
  const annualRequestCols = [0, 2, 3, 5, 7, 9, 10, 11, 12];
  const annualCompletedCols = [1, 4, 6, 8];
  const sourceYearLabel = (first, last) => first === last
    ? first + (first === 115 ? ' 年（截至 2 月）' : ' 年')
    : first + '～' + last + ' 年';
  const covers = (first, last) => applied.start <= first && applied.end >= last;

  function annualRecords() {
    return annualPeriods.flatMap(([first, last], index) => {
      if (!covers(first, last)) return [];
      const values = annualSources.map(source => [...source[index]]);
      // 這兩筆是跨年合計。篩選未涵蓋整段期間時，原表無法提供切分數。
      if (first === 105 && !covers(98, 105)) values[0][11] = null;
      if (first === 101 && !covers(98, 101)) values[1][10] = null;
      return [{ first, last, values }];
    });
  }

  function annualTable(records, side) {
    const other = side === 0 ? '陸方完成' : '我方完成';
    const totals = annualSources[side][0].slice(0, -1).map((_, column) => {
      const known = records.map(record => record.values[side][column]).filter(value => value != null);
      return known.length ? sum(known) : null;
    });
    const [capture, intel, delivery, evidence, transfer, freedom, death, misc, exchange] = annualNames;
    return {
      groups: [
        ['年度'], [capture, '請求', other], [intel], [delivery, '請求', other],
        [evidence, '請求', other], [transfer, '請求', other], [freedom], [death], [misc], [exchange], ['單年累計（原表）']
      ],
      rowHeader: 0,
      weights: [9, 5, 5, 7, 6, 6, 6, 6, 6, 6, 8, 7, 8, 6, 9],
      rows: records.map(({ first, last, values }) => {
        const row = [...values[side]];
        if (side === 0 && first === 105 && row[11] != null) row[11] = '681（98～105 年）';
        if (side === 1 && first === 101 && row[10] != null) row[10] = '276（98～101 年）';
        return [sourceYearLabel(first, last), ...row];
      }),
      totalRow: ['期間合計', ...totals, null]
    };
  }

  function deliverySection() {
    const [year, month] = applied.month.split('-').map(Number);
    const months = applied.mode === 'year' && covers(115, 115) ? [1, 2]
      : applied.mode === 'month' && year === 2026 && deliveryRows[month] ? [month] : [];
    if (!months.length) return null;

    const labels = ['司法文書 · 我方請求陸方', '司法文書 · 陸方請求我方', '行政文書 · 海基會協處'];
    const total = { 1: 709, 2: 387 };
    return {
      title: '司法與行政文書辦理概況',
      period: '海基會 · 115 年 ' + months.join('～') + ' 月',
      note: '來源：第 007 頁。結案可包含前期收件。函催欄「—」表示原表未提供數值。',
      table: {
        groups: ['月份', '文書與請求方向', '新收件數', '結案件數', '結案率', '函催件數'].map(label => [label]),
        rowHeader: 1,
        weights: [12, 30, 13, 13, 12, 13],
        rows: months.flatMap(m => deliveryRows[m].map((values, i) => [m + ' 月', labels[i], ...values])),
        footer: [['總件數（原表）', sum(months.map(m => total[m]))]]
      }
    };
  }

  // 表格、網頁／PDF 與 Word 共用欄位和資料。
  function tableHeaders(groups) {
    const grouped = groups.some(group => group.length > 1);
    const top = [];
    const sub = [];
    groups.forEach(([label, ...children]) => {
      top.push({ label, colspan: children.length || 1, rowspan: grouped && !children.length ? 2 : 1 });
      children.forEach(child => sub.push({ label: child, colspan: 1, rowspan: 1 }));
    });
    return grouped ? [top, sub] : [top];
  }

  function tableHTML({ groups, rowHeader, rows, footer, totalRow, otherDetails }, editableOther = false) {
    const headers = tableHeaders(groups).map(row => '<tr>' + row.map(({ label, colspan, rowspan }) =>
      '<th scope="' + (colspan > 1 ? 'colgroup' : 'col') + '" colspan="' + colspan +
      '" rowspan="' + rowspan + '">' + escapeReport(label) + '</th>').join('') + '</tr>').join('');
    const renderRow = row => '<tr>' + row.map((value, i) => {
      const tag = i === rowHeader ? 'th' : 'td';
      return '<' + tag + (tag === 'th' ? ' scope="row"' : '') + '>' + escapeReport(display(value)) + '</' + tag + '>';
    }).join('') + '</tr>';
    const body = rows.map(renderRow).join('');
    const totals = totalRow ? renderRow(totalRow) : footer
      ? '<tr><td colspan="' + rows[0].length + '">' + totalsHTML(footer) + '</td></tr>' : '';
    let otherRow = '';
    if (otherDetails) {
      const content = editableOther
        ? '<form class="statistics-other-editor" data-other-form><textarea class="form-control" name="other" rows="3" aria-label="' +
          escapeReport(otherDetails.label) + '">' + escapeReport(otherDetails.value) +
          '</textarea><button class="btn btn-primary" type="submit">儲存</button></form>'
        : escapeReport(otherDetails.value);
      otherRow = '<tr class="statistics-other-row"><th colspan="2" scope="row">十　' +
        escapeReport(otherDetails.label) + '</th><td colspan="' + (rows[0].length - 2) + '">' + content + '</td></tr>';
    }
    const cols = groups.map(([, ...children]) => '<colgroup span="' + (children.length || 1) + '"></colgroup>').join('');
    return cols + '<thead>' + headers + '</thead><tbody>' + body + '</tbody>' +
      (totals || otherRow ? '<tfoot>' + totals + otherRow + '</tfoot>' : '');
  }

  function totalsEntriesHTML(totals) {
    return totals.map(([label, value]) =>
      '<div><dt>' + escapeReport(label) + '</dt><dd>' + display(value) + '</dd></div>').join('');
  }

  function totalsHTML(totals) {
    return '<dl class="report-totals">' + totalsEntriesHTML(totals) + '</dl>';
  }

  function completionRate(completed, requested) {
    return requested > 0 ? (completed / requested * 100).toFixed(1) + '%' : '—';
  }

  function monthOverview(period) {
    const requestTotals = [1, 2].map(side => sum(executionRows.map(row => row[side][0])));
    return {
      cards: [
        ['結案率', completionRate(executionTotals[1], executionTotals[0])],
        ['雙方合作完成', executionTotals[1]],
        ...requests.map((label, side) => [label, requestTotals[side]])
      ],
      trend: [[2, ...requestTotals]],
      parts: monthlyItems.map(([name, out, incoming], i) =>
        [name.replace('（案件）', ''), out[0] + incoming[0] + (i === 0 ? executionRows[1][1][0] + executionRows[1][2][0] : 0)]),
      period,
      trendTitle: '各月請求統計',
      tickSuffix: ' 月',
      note: '目前案件總表僅有 115 年 2 月。原表統計包含緝捕遣返人數。'
    };
  }

  function yearOverview(records, period) {
    function requestCount(row, excludedColumn) {
      return sum(annualRequestCols.filter(column => column !== excludedColumn).map(column => row[column]));
    }

    const trend = records.map(({ first, last, values }) => [
      first === last ? first : first + '～' + last,
      requestCount(values[0], first === 105 ? 11 : -1),
      requestCount(values[1], first === 101 ? 10 : -1)
    ]);
    const requestTotals = [0, 1].map(side => sum(records.map(record => requestCount(record.values[side]))));
    const completed = sum(records.flatMap(({ values }) =>
      values.flatMap(row => annualCompletedCols.map(column => row[column]))));
    const whole = covers(98, 115);
    return {
      cards: [
        ['結案率', completionRate(
          whole ? annualSourceTotals[5][1] : completed,
          whole ? annualSourceTotals[4][1] : sum(requestTotals)
        )],
        ['雙方合作完成', whole ? annualSourceTotals[5][1] : completed],
        ...requests.map((label, side) => [label, whole ? annualSourceTotals[side * 2][1] : requestTotals[side]])
      ],
      trend,
      parts: annualRequestCols.map((column, i) =>
        [annualNames[i], sum(records.flatMap(({ values }) => values.map(row => row[column])))]),
      period,
      trendTitle: '各年度請求統計',
      tickSuffix: ' 年',
      note: '統計包含緝捕遣返人數。各年度趨勢不計入無法拆分的跨年彙總。115 年統計截至 2 月。'
    };
  }

  function drawOverview(overview) {
    if (!overview) return;
    const { cards, trend, trendTitle, parts, period, tickSuffix, note } = overview;
    const host = el('overview');
    app.renderStatisticsDashboard(host, {
      cards: cards.map(([label, value]) => [label, display(value)]),
      trend, trendTitle, parts, heading: period, periodLabel: period, tickSuffix,
      mixTitle: '協助事項分布', mixNote: '雙向請求 · 含緝捕遣返人數',
      directionLabels: requests, countUnit: '', countLabel: '請求合計'
    });
    const description = document.createElement('p');
    description.className = 'dashboard-data-note';
    description.textContent = note;
    host.append(description);
  }

  function renderAnnualDirection() {
    if (!report.annual) return;
    const { tables } = report.annual;
    el('annual').innerHTML = tableHTML(tables[direction]);
    el('annual').setAttribute('aria-label', requests[direction] + '統計');
    [el('outgoing'), el('incoming')].forEach((button, i) =>
      button.setAttribute('aria-pressed', String(direction === i)));
  }

  function render() {
    const [year, month] = applied.month.split('-').map(Number);
    const annual = applied.mode === 'year';
    const period = annual ? '民國 ' + (applied.start === applied.end ? sourceYearLabel(applied.start, applied.end)
      : applied.start + '～' + applied.end + ' 年' + (applied.end === 115 ? '（截至 2 月）' : ''))
      : '民國 ' + (year - 1911) + ' 年 ' + month + ' 月';
    const records = annual ? annualRecords() : [];
    const hasMonthly = !annual && applied.month === monthWithExecution;
    const hasAnnual = records.length > 0;
    const documents = deliverySection();
    const overview = hasAnnual ? yearOverview(records, period) : hasMonthly ? monthOverview(period) : null;
    const title = annual ? '案件歷年統計' : '案件統計';
    let coverage = '來源：第 002～003 頁（民國 98 年 6 月至 115 年 2 月）。原表「單年累計」包含請求及完成欄位。115 年截至 2 月。「—」表示原表未提供或無法按選定期間切分。';
    if (applied.start <= 100 && applied.end >= 98 && !covers(98, 100)) {
      coverage += ' 98～100 年為合併資料，需查詢完整區間。';
    }
    const sourceTotals = hasAnnual && covers(98, 115) ? annualSourceTotals : null;
    const missing = !overview && !documents ? (annual
      ? '所選年度區間沒有可顯示的資料。' + (applied.start <= 100 && applied.end >= 98 ? ' 98～100 年為合併資料，需查詢完整區間。' : '')
      : '所選月份尚無統計資料。案件總表目前僅提供 115 年 2 月。') : '';
    const partial = !overview && documents ? '所選月份僅有海基會文書統計。' : '';

    report = {
      title: title + '－' + period, overview, documents, missing: missing || partial,
      monthly: hasMonthly ? { title: '案件統計總表', period, table: monthlyTable, note: monthlyNote } : null,
      annual: hasAnnual ? { period, note: coverage, tables: [annualTable(records, 0), annualTable(records, 1)], sourceTotals } : null
    };
    el('overview').replaceChildren();
    el('empty').hidden = !(missing || partial);
    el('empty-message').textContent = missing || partial;
    el('business').hidden = !hasMonthly;
    el('yearly').hidden = !hasAnnual;
    el('documents').hidden = !documents;
    el('export').disabled = !(overview || documents);
    drawOverview(overview);

    if (hasMonthly) {
      el('business-period').textContent = period;
      try {
        monthlyTable.otherDetails.value = window.localStorage.getItem(otherStorageKey(applied.month)) ?? '';
      } catch {
        // 儲存空間不可用時保留頁面內容，確認儲存時顯示錯誤。
      }
      el('execution').innerHTML = tableHTML(monthlyTable, true);
      el('execution-note').textContent = monthlyNote;
    }
    if (hasAnnual) {
      el('yearly-period').textContent = period;
      el('coverage').textContent = coverage;
      const totals = el('annual-totals');
      totals.hidden = !sourceTotals;
      totals.innerHTML = sourceTotals ? totalsEntriesHTML(sourceTotals) : '';
      renderAnnualDirection();
    }
    if (documents) {
      el('documents-period').textContent = documents.period;
      el('documents-note').textContent = documents.note;
      el('document-table').innerHTML = tableHTML(documents.table);
    }
  }

  function otherStorageKey(month) {
    return 'judicial-statistics-other-details:' + month;
  }

  el('execution').addEventListener('submit', event => {
    const form = event.target;
    if (!form.matches('[data-other-form]') || !report.monthly) return;
    event.preventDefault();
    const value = form.elements.namedItem('other').value;
    try {
      window.localStorage.setItem(otherStorageKey(applied.month), value);
    } catch {
      app.showToast('無法儲存，請確認瀏覽器允許儲存資料後再試。', 'warning');
      return;
    }
    report.monthly.table.otherDetails.value = value;
    app.showToast('其他列舉內容已儲存。');
  });

  function updateModeFields() {
    const annual = el('mode').value === 'year';
    el('year-range').hidden = !annual;
    el('month-field').hidden = annual;
    picker.open = false;
  }
  el('mode').addEventListener('change', () => {
    updateModeFields();
    el('query-note').hidden = false;
  });
  for (const input of [yearStart, yearEnd]) {
    input.addEventListener('input', () => {
      yearEnd.setCustomValidity('');
      el('query-note').hidden = false;
    });
  }
  [el('outgoing'), el('incoming')].forEach((button, i) => {
    button.addEventListener('click', () => {
      direction = i;
      renderAnnualDirection();
    });
  });
  el('apply').addEventListener('click', () => {
    const mode = el('mode').value;
    if (mode === 'year') {
      yearEnd.setCustomValidity('');
      if (!yearStart.reportValidity() || !yearEnd.reportValidity()) return;
      if (yearStart.valueAsNumber > yearEnd.valueAsNumber) {
        yearEnd.setCustomValidity('結束年度不得早於起始年度。');
        yearEnd.reportValidity();
        return;
      }
      applied = { ...applied, mode, start: yearStart.valueAsNumber, end: yearEnd.valueAsNumber };
    } else {
      applied = { ...applied, mode, month: draftMonth };
    }
    el('query-note').hidden = true;
    picker.open = false;
    render();
  });

  function reportSections({ overview, missing, monthly, annual, documents }) {
    const sections = [];
    if (missing) sections.push({ note: missing });
    if (monthly) sections.push(monthly);
    if (annual) {
      annual.tables.forEach((table, side) => {
        sections.push({ title: requests[side] + '統計', period: annual.period, table, note: annual.note });
      });
      if (annual.sourceTotals) {
        sections.push({ title: '原表總計', totals: annual.sourceTotals, note: '民國 98 年 6 月至 115 年 2 月' });
      }
    }
    if (documents) sections.push(documents);
    if (overview) {
      sections.push(
        { title: '統計摘要', totals: overview.cards, note: overview.note },
        { title: '協助事項分布', table: {
          groups: [['協助事項'], ['雙向請求']], weights: [3, 1], rows: overview.parts.filter(([, n]) => n > 0)
        } },
        { title: overview.trendTitle, table: {
          groups: [['期間'], ...requests.map(label => [label])], weights: [2, 1, 1],
          rows: overview.trend.map(([label, ...values]) => [label + overview.tickSuffix, ...values])
        } }
      );
    }
    return sections;
  }

  function reportHTML(currentReport) {
    const sections = reportSections(currentReport).map(({ title, period, table, note, remarks, totals }) =>
      '<section>' + (title ? '<h2>' + escapeReport(title) + '</h2>' : '') +
      (period ? '<p>' + escapeReport(period) + '</p>' : '') +
      (table ? '<table>' + tableHTML(table) + '</table>' : '') +
      (totals ? totalsHTML(totals) : '') +
      (note ? '<p>' + escapeReport(note) + '</p>' : '') +
      (remarks ? '<p>' + escapeReport(remarks) + '</p>' : '') + '</section>').join('');
    return '<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1"><title>' +
      escapeReport(currentReport.title) + '</title><style>' +
      'body{font:16px/1.5 system-ui;color:#17395f;margin:24px auto;padding:0 16px;max-width:1440px}' +
      'section{overflow:auto;margin:24px 0}table{border-collapse:collapse;width:100%;font-size:14px}' +
      'td,th{border:1px solid #cad7e1;padding:6px;overflow-wrap:anywhere;white-space:pre-wrap}' +
      'thead th,tfoot td{background:#eef4f8}tr{break-inside:avoid}h2{break-after:avoid}' +
      'p{font-size:14px}dl{display:flex;gap:16px;flex-wrap:wrap;margin:0}dd{margin:0;font-weight:700}' +
      '@page{size:A4 landscape;margin:10mm}@media print{body{margin:0;padding:0}section{overflow:visible}' +
      'td,th{padding:3px}thead{display:table-header-group}tfoot{display:table-row-group}}' +
      '</style></head><body><h1>' + escapeReport(currentReport.title) + '</h1>' + sections + '</body></html>';
  }

  function wordBody(currentReport) {
    const paragraph = (value, bold = false) => '<w:p><w:r>' + (bold ? '<w:rPr><w:b/></w:rPr>' : '') +
      '<w:t xml:space="preserve">' + escapeReport(display(value)).replace(/\r\n?|\n/g, '</w:t><w:br/><w:t xml:space="preserve">') + '</w:t></w:r></w:p>';
    const totalsText = totals => totals.map(([label, value]) => paragraph(label + '　' + display(value))).join('');
    const borders = ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']
      .map(edge => '<w:' + edge + ' w:val="single" w:sz="4" w:color="CAD7E1"/>').join('');

    function wordTable({ groups, weights, rows, footer, totalRow, otherDetails }) {
      const width = sum(weights);
      const widths = weights.map(weight => Math.floor(15500 * weight / width));
      const flatHeaders = groups.flatMap(([heading, ...children]) => children.length
        ? children.map(child => heading + '／' + child) : [heading]);
      const cell = (value, i, header) => '<w:tc><w:tcPr><w:tcW w:type="dxa" w:w="' +
        widths[i] + '"/>' + (header ? '<w:shd w:fill="EEF4F8"/>' : '') + '</w:tcPr>' +
        paragraph(value, header) + '</w:tc>';
      const grid = widths.map(w => '<w:gridCol w:w="' + w + '"/>').join('');
      const heading = '<w:tr><w:trPr><w:tblHeader/></w:trPr>' +
        flatHeaders.map((value, i) => cell(value, i, true)).join('') + '</w:tr>';
      const body = (totalRow ? [...rows, totalRow] : rows).map(row => '<w:tr><w:trPr><w:cantSplit/></w:trPr>' +
        row.map((value, i) => cell(value, i, false)).join('') + '</w:tr>').join('');
      const footerRow = footer ? '<w:tr><w:tc><w:tcPr><w:gridSpan w:val="' + widths.length +
        '"/></w:tcPr>' + totalsText(footer) + '</w:tc></w:tr>' : '';
      const otherRow = otherDetails ? '<w:tr><w:tc><w:tcPr><w:gridSpan w:val="2"/>' +
        '<w:tcW w:type="dxa" w:w="' + sum(widths.slice(0, 2)) + '"/></w:tcPr>' +
        paragraph('十　' + otherDetails.label, true) + '</w:tc><w:tc><w:tcPr><w:gridSpan w:val="' +
        (widths.length - 2) + '"/><w:tcW w:type="dxa" w:w="' + sum(widths.slice(2)) + '"/></w:tcPr>' +
        paragraph(otherDetails.value) + '</w:tc></w:tr>' : '';
      return '<w:tbl><w:tblPr><w:tblBorders>' + borders +
        '</w:tblBorders><w:tblLayout w:type="fixed"/></w:tblPr><w:tblGrid>' + grid +
        '</w:tblGrid>' + heading + body + footerRow + otherRow + '</w:tbl>';
    }

    return paragraph(currentReport.title, true) + reportSections(currentReport)
      .map(({ title, period, table, note, remarks, totals }) =>
        (title ? paragraph(title, true) : '') + (period ? paragraph(period) : '') +
        (table ? wordTable(table) : '') + (totals ? totalsText(totals) : '') +
        (note ? paragraph(note) : '') + (remarks ? paragraph(remarks) : '')).join('');
  }

  // 保留既有 DOCX 壓縮封裝及三種輸出入口。
  function wordBlob(report) {
    const body = wordBody(report);
    const files = {
      '[Content_Types].xml': '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
      '_rels/.rels': '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
      'word/document.xml': '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' + body +
        '<w:sectPr><w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/>' +
        '<w:pgMar w:top="567" w:right="567" w:bottom="567" w:left="567"/></w:sectPr></w:body></w:document>'
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
    const format = el('output-format').value;
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
  updateModeFields();
  render();
})();
