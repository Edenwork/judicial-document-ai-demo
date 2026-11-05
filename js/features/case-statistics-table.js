(() => {
  'use strict';
const rows=[
['刑事犯、刑事嫌疑犯緝捕遣返','件',4,0,0,0,5,4,0],['刑事犯、刑事嫌疑犯緝捕遣返','人',4,5,0,0,5,0,0],['犯罪情資交換','件',19,1,0,3,5,19,0],['司法文書送達','件',72,87,124,42,7,0,0],['調查取證','件',13,14,14,22,6,0,0],['罪犯接返（受刑人移交）','—',0,0,0,0,6,0,0],['人身自由受限制通報','件',6,6,0,0,6,0,0],['非病死及可疑非病死通報','件',0,0,0,0,6,0,0],['其他（如陳情等）','件',5,6,0,0,6,0,0],['業務交流','—',0,0,0,0,5,0,0]];
const el=id=>document.getElementById('monthly-table-' + id);
let expanded=true;
function render(){
 const month=el('month').value, unit=el('unit').value, available=month==='2026-02';
 const [year,m]=month.split('-');el('period').textContent=month?'民國 '+(Number(year)-1911)+' 年 '+Number(m)+' 月':'請選擇月份';
 el('agencies').innerHTML=['兩岸科','國際科'].filter(name=>unit==='全部科別'||name===unit).map(name=>available&&name==='兩岸科'?'<tr><td><b>兩岸科</b></td><td class="number">261</td><td class="number">186</td><td><button class="btn btn-sm btn-soft" id="monthly-table-toggle" aria-controls="monthly-table-business" aria-expanded="'+expanded+'">'+(expanded?'收合明細':'查看明細')+'</button></td></tr>':'<tr><td>'+name+'</td><td>—</td><td>—</td><td class="muted">尚無資料</td></tr>').join('');
 const has=available&&unit!=='國際科';
 el('monthCards').innerHTML=[['相互請求',has?'261':'—','月報原表合計'],['合作完成',has?'186':'—','月報原表合計']].map(card).join('');
 const show=expanded&&available&&unit!=='國際科';el('business').hidden=!show;el('summary').hidden=!show;
}
function source(n){el('sourceTitle').textContent=({5:'案件統計月報 · 表格節錄',6:'協助事項月報',7:'海基會文書送達統計'})[n]+'｜第 '+String(n).padStart(3,'0')+' 頁';el('scan').src='assets/monthly-report/'+n+'.jpg';el('source').showModal();}
el('items').innerHTML=rows.map(([name,unit,a,b,c,d,page,pendingA,pendingB])=>'<tr><td><strong>'+name+'</strong><small class="assistance-note">進行中：陸方 '+pendingA+'、我方 '+pendingB+'<br>瑕疵／補正：雙方皆為 0'+(page===7?'<br>海基會 2 月列：新收／結案對應請求／完成。':name.startsWith('其他')?'<br>2 月收文 5 件，通報 6 件，含 1 件 1 月收文。':'')+'</small></td><td>'+unit+'</td>'+[a,b,c,d].map(x=>'<td>'+x+'</td>').join('')+'<td><button class="btn btn-sm btn-soft" data-source="'+page+'">查看 '+String(page).padStart(3,'0')+'</button></td></tr>').join('');
document.getElementById('page-reports-table').addEventListener('click',e=>{if(e.target.dataset.source)source(Number(e.target.dataset.source));if(e.target.id==='monthly-table-toggle'){expanded=!expanded;render();el('toggle').focus();}});for(const id of ['unit','month'])el(id).onchange=()=>{expanded=true;render();};el('close').onclick=()=>el('source').close();function card([title,value,note]){return '<div class="panel metric-card"><span class="metric-label">'+title+'</span><strong class="metric-value">'+value+'</strong><small>'+note+'</small></div>'}

render();
})();
