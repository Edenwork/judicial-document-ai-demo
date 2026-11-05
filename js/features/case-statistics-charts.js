(() => {
  const el = name => document.getElementById('stat-' + name);
  const departments = ['國際科', '兩岸科'];
  const types = ['司法文書送達','調查取證','刑事司法互助','其他'];
  const colors = ['#17395f','#2d86cf','#62b9b0','#a3b7ca'];
  const months = Array.from({length:10}, (_, i) => i + 1).reverse();
  const monthName = m => '115 年 ' + m + ' 月';
  const daysIn = m => new Date(2026,m,0).getDate();
  // Deterministic demonstration records. No production case data is embedded.
  const cases = months.flatMap(m => Array.from({length:24+(m*7)%23}, (_, i) => {
    const dept = departments[(i%5 < 3) ? 0 : 1];
    const region = dept === '兩岸科' ? '中國大陸' : ['日本','美國','德國','加拿大','法國'][(Math.floor(i/5)+i)%5];
    const day = 1 + (i*7 + m + Math.floor(i/4)) % daysIn(m);
    const startDay = day - (i%3);
    const duration = 2 + (i*3 + m)%15;
    return {month:m, day, dept, region, type:types[[0,1,0,2,1,3,0][i%7]], duration,
      closed:i%5 !== 0 && startDay + duration <= daysIn(m)};
  }));
  const filters = [
    ['month','收件月份',months],['dept','科別',departments],['type','案件類型',types],
    ['region','請求國家／地區',[...new Set(cases.map(c=>c.region))]],['status','辦理狀態',['已結案','未結案']]
  ];
  el('filters').innerHTML = filters.map(([id,label,values]) =>
    '<label>'+label+'<select id="stat-'+id+'">'+(id==='month'?'':'<option value="">全部</option>')+
    values.map(v=>'<option value="'+v+'">'+(id==='month'?monthName(v):v)+'</option>').join('')+'</select></label>').join('');
  const countClosed = list => list.filter(c=>c.closed).length;
  function currentRows() {
    return cases.filter(c => c.month===Number(el('month').value) &&
      ['dept','type','region'].every(key=>!el(key).value || c[key]===el(key).value) &&
      (!el('status').value || el('status').value===(c.closed?'已結案':'未結案')));
  }
  const empty = '<p class="subtle">此條件下無案件</p>';
  const rate = (n,total) => total ? (100*n/total).toFixed(1)+'%' : '—';
  function render() {
    const rows=currentRows(), total=rows.length, closed=countClosed(rows);
    const m=Number(el('month').value), days=daysIn(m);
    const average=closed ? (rows.reduce((s,c)=>s+(c.closed?c.duration:0),0)/closed).toFixed(1)+' 天' : '—';
    el('period').textContent=monthName(m)+'統計';
    el('kpis').innerHTML=[
      ['收件數',total,'依收件日統計'],['已結案',closed,'結案率 '+rate(closed,total)+'（暫定）'],
      ['未結案',total-closed,'截至當月底'],['平均處理天數',average,'暫定・僅計已結案件']
    ].map(([label,value,note])=>'<div class="panel stat-kpi"><span>'+label+'</span><strong>'+value+'</strong><small>'+note+'</small></div>').join('');
    const weeks=Array.from({length:Math.ceil(days/7)},(_,i)=>rows.filter(c=>Math.floor((c.day-1)/7)===i).length);
    el('trend').innerHTML='<div class="stat-bars">'+weeks.map(n=>'<div class="stat-col">'+n+'<i style="height:'+n/Math.max(...weeks,1)*80+'%"></i></div>').join('')+'</div><div class="stat-ticks">'+weeks.map((_,i)=>'<span>'+(i*7+1)+'–'+Math.min(days,i*7+7)+' 日</span>').join('')+'</div>';
    let sum=0;
    const counts=types.map(type=>rows.filter(c=>c.type===type).length);
    const stops=counts.map((n,i)=>{const from=sum;sum+=100*n/(total||1);return colors[i]+' '+from+'% '+sum+'%';});
    el('types').innerHTML=total ? '<div class="stat-mix"><div class="stat-ring" style="background:conic-gradient('+stops.join(',')+')"><strong>'+total+'<small>收件總數</small></strong></div><div class="stat-legend">'+types.map((t,i)=>'<div><i style="background:'+colors[i]+'"></i>'+t+'<b>'+counts[i]+' 件 · '+rate(counts[i],total)+'</b></div>').join('')+'</div></div>' : empty;
    function cells(group){const n=countClosed(group);return [group.length,n,group.length-n].map(v=>'<td>'+v+'</td>').join('');}
    el('depts').innerHTML='<table class="stat-table"><thead><tr><th>科別</th><th>收件</th><th>已結</th><th>未結</th></tr></thead><tbody>'+departments.filter(d=>!el('dept').value||el('dept').value===d).map(d=>'<tr><th><button type="button" data-dept="'+d+'">'+d+'</button></th>'+cells(rows.filter(c=>c.dept===d))+'</tr>').join('')+'</tbody><tfoot><tr><th>合計</th>'+cells(rows)+'</tr></tfoot></table>';
    const ranks=[...new Set(rows.map(c=>c.region))].map(r=>[r,rows.filter(c=>c.region===r).length]).sort((a,b)=>b[1]-a[1]);
    el('regions').innerHTML=ranks.map(([r,n])=>'<div class="stat-rank"><span>'+r+'</span><div><i style="width:'+100*n/ranks[0][1]+'%"></i></div><b>'+n+' 件</b></div>').join('')||empty;
  }
  el('filters').addEventListener('change',render);
  el('depts').addEventListener('click',e=>{if(e.target.dataset.dept){el('dept').value=e.target.dataset.dept;render();}});
  window.JudicialApp.setupStatsExport(el('export'), () => {
    const rows=currentRows();
    const lines=[['示範資料',monthName(el('month').value)],...filters.slice(1).map(([id,label])=>[label,el(id).value||'全部']),
      ['科別','收件數','已結案','未結案','結案率（暫定）','平均處理天數（暫定）']];
    for(const name of [...departments.filter(d=>!el('dept').value||d===el('dept').value),'合計']){
      const group=name==='合計'?rows:rows.filter(c=>c.dept===name);
      const closed=group.filter(c=>c.closed);
      lines.push([name,group.length,closed.length,group.length-closed.length,rate(closed.length,group.length),closed.length?(closed.reduce((s,c)=>s+c.duration,0)/closed.length).toFixed(1):'—']);
    }
    lines.push([], ['案件類型分布'], ['案件類型','件數'], ...types.map(type => [type, rows.filter(c => c.type === type).length]));
    return {title: '案件統計-版型1-' + monthName(el('month').value), lines};
  });
  render();
})();
