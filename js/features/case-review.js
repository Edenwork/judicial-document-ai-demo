(function (global) {
  'use strict';
  const root = document.getElementById('page-case-review');
  if (!root) return;
  const App = global.JudicialApp;
  const storageKey = 'judicial-review-cases-v2';
  const $ = id => document.getElementById(id);
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const copy = value => JSON.parse(JSON.stringify(value));
  const hasValue = value => Array.isArray(value) ? value.length > 0 : String(value).trim().length > 0;
  const field = (key, label, value, extra) => Object.assign({key, label, value}, extra || {});
  const internationalFields = (receipt, date, country, requestNo, extra) => [
    field('receivedNo', '收文文號', receipt, {required:true, group:'文件基本資料'}),
    field('receivedDate', '收文日期', date, {type:'date', required:true}),
    field('applyAgency', '提出請求機關', '臺灣○○地方檢察署（示例）', {required:true}),
    field('applyNo', '請求機關案號', requestNo),
    field('country', '受請求國家／地區', country, {group:'請求內容'}),
    ...extra
  ];
  // Every document and receipt below is fictional. International outbound fields
  // are discussion examples, not mappings to the inbound IA_Penal schema.
  const partyColumns = [
    {key:'foreignName',label:'外文姓名'}, {key:'chineseName',label:'中文姓名'},
    {key:'foreignAddress',label:'外文地址',type:'textarea'}, {key:'chineseAddress',label:'中文地址',type:'textarea'},
    {key:'sex',label:'性別',options:['','男','女','其他','未提供']}, {key:'birthDate',label:'出生日期',type:'date'},
    {key:'nationality',label:'國籍'}, {key:'passportNo',label:'護照號碼'}, {key:'identityNo',label:'證號'},
    {key:'identity',label:'身分'}, {key:'otherInfo',label:'其他資訊',type:'textarea'}
  ];
  const blankParty = () => Object.assign({id:'',checked:false},Object.fromEntries(partyColumns.map(c=>[c.key,''])));
  const demoParties = [
    Object.assign(blankParty(),{id:'foreign-party-1',chineseName:'林○○',foreignName:'Alex Example',sex:'男',nationality:'芬蘭',identity:'被告',otherInfo:'虛構當事人示例一'}),
    Object.assign(blankParty(),{id:'foreign-party-2',chineseName:'陳○○',foreignName:'Jamie Example',sex:'女',nationality:'芬蘭',identity:'證人',otherInfo:'虛構當事人示例二'})
  ];
  const cases = [
    {id:'tw-cn', name:'調查取證（臺請陸）示範案件', country:'大陸地區', type:'調查取證（臺請陸）', files:1,
      document:'調查取證請求函', updated:'2026/11/06 11:00', phase:'ready', returnStatus:'需人工處理', fields:[
        field('receivedNo','收文文號','1150001234',{required:true,group:'文件基本資料'}),
        field('receivedDate','收文日期','2026-02-03',{type:'date',required:true}),
        field('applyAgency','提出請求機關','臺灣○○地方檢察署（示例）',{required:true}),
        field('applyNo','請求機關案號',''),
        field('area','地區','大陸地區',{group:'地區與案件內容'}),
        field('provincial','省分（含直轄市）','福建省'),
        field('caseCategory','案由分類',['刑事'],{options:['刑事','民事','行政及其他']}),
        field('requests','請求內容',['取得證據'],{options:['送達文書','取得證據','裁判認可','行政協查','分享']}),
        field('evidence','取得證據事項',['提供書證','提供視聽資料'],{options:['取得證言及陳述','提供書證','提供物證','提供視聽資料','搜索']}),
        field('defendant','被告中文姓名','陳○○',{group:'當事人資料'}),
        field('acceptDesc','受理說明','請協助取得被告於指定期間之銀行交易明細與提款影像。',{type:'textarea',group:'受理資訊'})
      ]},
    {id:'japan',name:'日本銀行交易紀錄調取案',caseNo:'ML-2026-0819-01',country:'日本',files:3,document:'日本銀行交易紀錄調取請求書',updated:'2026/08/24 14:32',phase:'pending',returnStatus:'待回拋',
      fields:internationalFields('1150001235','2026-08-19','日本','115年度示例偵字第101號',[
        field('bank','銀行名稱','○○銀行（日本示例）'),
        field('account','銀行帳號','JP-DEMO-1001'),
        field('period','資料期間','2026/01/01 至 2026/06/30'),
        field('requestItems','請求事項','提供帳戶開戶資料、交易明細及匯款紀錄。',{type:'textarea'}),
        field('defendant','被告中文姓名','林○○',{group:'當事人資料'})
      ])},
    {id:'usa',name:'美國平台帳號資料保全案',caseNo:'ML-2026-0818-04',country:'美國',files:4,document:'美國平台帳號資料保全請求書',updated:'2026/08/24 13:54',phase:'ready',returnStatus:'需人工處理',
      fields:internationalFields('1150001236','2026-08-18','美國','',[
        field('account','平台帳號識別碼','US-ACCT-88421'),
        field('period','資料時間範圍','2025/01/01 至 2025/12/31'),
        field('relatedEmail','關聯電子郵件','user.contact@example.com'),
        field('deadline','希望回覆期限',''),
        field('requestItems','請求事項','保全並提供平台註冊資訊、登入紀錄、IP 位址及裝置資訊。',{type:'textarea'})
      ])},
    {id:'singapore',name:'新加坡公司登記資料協查案',caseNo:'ML-2026-0818-02',country:'新加坡',files:2,document:'新加坡公司登記資料協查請求書',updated:'2026/08/24 11:40',phase:'processing',returnStatus:'需人工處理',
      fields:internationalFields('1150001237','2026-08-18','新加坡','115年度示例偵字第103號',[
        field('company','公司名稱','星洲示例貿易有限公司'),
        field('registration','公司登記編號','SG-DEMO-2048'),
        field('requestItems','請求事項','提供公司登記、董事名冊與實質受益人資料。',{type:'textarea'}),
        field('purpose','協助目的','確認公司控制關係及涉案資金流向。',{type:'textarea'})
      ])},
    {id:'uk',name:'英國證人訊問協助案',caseNo:'ML-2026-0817-08',country:'英國',files:3,document:'英國證人訊問協助請求書',updated:'2026/08/23 17:21',phase:'ready',confirmed:true,returnStatus:'已回拋',
      fields:internationalFields('1150001238','2026-08-17','英國','115年度示例偵字第104號',[
        field('witness','證人姓名','王○○',{group:'證人與訊問事項'}),
        field('interviewMethod','訊問方式','遠距視訊訊問'),
        field('requestItems','訊問事項','確認證人與涉案公司之往來及款項交付經過。',{type:'textarea'}),
        field('deadline','希望回覆期限','2026-09-30',{type:'date'})
      ])},
    {id:'germany',name:'德國電信紀錄調取案',caseNo:'ML-2026-0817-03',country:'德國',files:5,document:'德國電信紀錄調取請求書',updated:'2026/08/23 16:08',phase:'ready',confirmed:true,returnStatus:'回拋失敗',
      fields:internationalFields('1150001239','2026-08-17','德國','115年度示例偵字第105號',[
        field('telecom','電信業者','德國○○電信（示例）'),
        field('phone','門號／用戶識別碼','DE-DEMO-7788'),
        field('period','資料期間',''),
        field('requestItems','請求事項','提供門號申登資料、通聯及基地台紀錄。',{type:'textarea'})
      ])},
    {id:'hongkong',name:'香港犯罪所得凍結協助案',caseNo:'ML-2026-0815-06',country:'香港',files:4,document:'香港犯罪所得凍結協助請求書',updated:'2026/08/18 10:25',phase:'ready',confirmed:true,returnStatus:'已回拋',
      fields:internationalFields('1150001240','2026-08-15','香港','115年度示例偵字第106號',[
        field('bank','金融機構','香港○○銀行（示例）'),
        field('account','帳戶識別碼','HK-DEMO-6631'),
        field('currency','幣別','港幣'),
        field('amount','請求凍結金額','1,000,000'),
        field('requestItems','請求事項','協助凍結指定帳戶內之涉案款項。',{type:'textarea'})
      ])},
    {id:'foreign-criminal',name:'外國對我國請求（刑事）示範案件',country:'芬蘭',type:'外國對我國請求（刑事）',files:1,
      document:'外國刑事司法互助請求函',updated:'2026/11/06 14:00',phase:'ready',returnStatus:'需人工處理',fields:[
        field('receivedNo','收文文號','1150001241',{required:true,group:'文件基本資料'}),
        field('receivedDate','收文日期','2026-11-06',{type:'date',required:true}),
        field('country','國別','芬蘭'),
        field('applyAgency','請求機關','芬蘭○○司法機關（示例）',{required:true}),
        field('foreignSendDate','外交部發文日期','2026-11-05',{type:'date'}),
        field('requestNo','請求機關案號','FI-DEMO-2026-001'),
        field('cooperateAgency','協助機關','臺灣○○地方檢察署（示例）'),
        field('requestItems','請求內容','司法文書送達、調取書證。',{type:'textarea',group:'請求內容'}),
        field('parties','當事人基本資料',demoParties,{type:'parties',required:true,group:'當事人基本資料'})
      ]}
  ];
  cases.forEach(item => {
    if (!item.type) item.type = '國際案件（我國對外國請求）';
    if (item.fields.some(f=>f.type==='parties')) return;
    const single=item.fields.find(f=>f.key==='defendant'||f.key==='witness');
    item.partyLegacyKey=single?single.key:null;
    const parties=single?[Object.assign(blankParty(),{id:item.id+'-party-1',chineseName:single.value,identity:single.key==='witness'?'證人':'被告',checked:!!item.confirmed})]:[];
    item.fields=item.fields.filter(f=>f!==single);
    item.fields.push(field('parties','當事人基本資料',parties,{type:'parties',group:'當事人基本資料'}));
  });
  const initial = item => ({
    values:Object.fromEntries(item.fields.map(f => [f.key,copy(f.value)])),
    checks:Object.fromEntries(item.fields.map(f => [f.key,!!item.confirmed])),
    confirmed:!!item.confirmed, phase:item.phase, returnStatus:item.returnStatus, savedAt:''
  });
  function valid(saved,item) {
    return saved && saved.values && saved.checks && typeof saved.confirmed === 'boolean' &&
      ['pending','ready','processing'].includes(saved.phase) && ['需人工處理','待回拋','已回拋','回拋失敗'].includes(saved.returnStatus) &&
      item.fields.every(f => f.type==='parties'
        ? Array.isArray(saved.values[f.key]) && new Set(saved.values[f.key].map(p=>p&&p.id)).size===saved.values[f.key].length &&
          saved.values[f.key].every(p=>p && typeof p.id==='string' && /^[a-zA-Z0-9-]+$/.test(p.id) && typeof p.checked==='boolean' && partyColumns.every(c=>typeof p[c.key]==='string'))
        : f.options
        ? Array.isArray(saved.values[f.key]) && saved.values[f.key].every(v => f.options.includes(v))
        : typeof saved.values[f.key] === 'string');
  }
  let savedCases={};
  try { savedCases=JSON.parse(localStorage.getItem(storageKey)) || {}; } catch (error) {}
  const states={}, dirty={};
  cases.forEach(item => {
    // Preserve existing drafts and confirmations when single-person fields become a list.
    const saved=savedCases[item.id];
    if(saved && saved.values && saved.checks && !Array.isArray(saved.values.parties)) {
      const partyField=item.fields.find(f=>f.type==='parties');
      const parties=copy(partyField.value);
      if(item.partyLegacyKey && parties.length && typeof saved.values[item.partyLegacyKey]==='string') parties[0].chineseName=saved.values[item.partyLegacyKey];
      const checked=!!saved.confirmed || !!(item.partyLegacyKey && saved.checks[item.partyLegacyKey]);
      parties.forEach(party=>{party.checked=checked;});
      saved.values.parties=parties;saved.checks.parties=checked;
    }
    if(item.id==='japan' && saved && saved.phase==='ready' && !saved.confirmed && !saved.savedAt && saved.checks && !Object.values(saved.checks).some(Boolean)) {
      saved.phase='pending';saved.returnStatus='待回拋';
    }
    states[item.id]=valid(savedCases[item.id],item) ? savedCases[item.id] : initial(item);
    const state=states[item.id];
    if (!state.confirmed && state.phase==='ready') state.returnStatus='需人工處理';
    if (state.confirmed && (state.phase!=='ready' || item.fields.some(f => !state.checks[f.key] || (f.required && !hasValue(state.values[f.key])) || (f.type==='parties' && state.values[f.key].some(p=>!p.checked||(!p.chineseName.trim()&&!p.foreignName.trim())))))) {
      state.confirmed=false; state.returnStatus='需人工處理';
    }
  });
  // Migrate only the original Taiwan/Mainland discussion case; never copy it to other cases.
  if (!savedCases['tw-cn']) {
    try {
      const legacy=JSON.parse(localStorage.getItem('judicial-discussion-taiwan-mainland-v1'));
      if(legacy && legacy.values && legacy.checks && !Array.isArray(legacy.values.parties)) {
        legacy.values.parties=copy(cases[0].fields.find(f=>f.type==='parties').value);
        if(typeof legacy.values.defendant==='string')legacy.values.parties[0].chineseName=legacy.values.defendant;
        legacy.checks.parties=!!legacy.confirmed||!!legacy.checks.defendant;
        legacy.values.parties.forEach(p=>{p.checked=legacy.checks.parties;});
      }
      const migrated=Object.assign(initial(cases[0]),legacy,{phase:'ready',returnStatus:legacy && legacy.confirmed?'待回拋':'需人工處理'});
      if (legacy && valid(migrated,cases[0])) {
        if (migrated.confirmed && cases[0].fields.some(f => !migrated.checks[f.key] || (f.required && !hasValue(migrated.values[f.key])))) {
          migrated.confirmed=false; migrated.returnStatus='需人工處理';
        }
        states['tw-cn']=migrated;
      }
    } catch (error) {}
  }
  let activeId=cases.some(c => c.id===new URLSearchParams(location.search).get('case')) ? new URLSearchParams(location.search).get('case') : 'tw-cn';
  let previousFocus=null;
  const activeCase=()=>cases.find(c => c.id===activeId);
  const current=()=>states[activeId];
  const statusOf=state=>state.phase==='pending'?'pending':state.phase==='processing'?'processing':state.confirmed?'completed':'manual';
  const labelOf=state=>state.phase==='pending'?'待處理':state.phase==='processing'?'AI 處理中':state.confirmed?'人工核對完成':'待人工核對';
  const badgeOf=state=>state.phase==='pending'?'status-info':state.phase==='processing'?'status-processing':state.confirmed?'status-ok':'status-warn';
  function persistCase(id) {
    try {
      // Only save the selected case. Unsaved edits to another case stay in memory.
      const saved=JSON.parse(localStorage.getItem(storageKey)) || {};
      saved[id]=copy(states[id]);
      localStorage.setItem(storageKey,JSON.stringify(saved));
      dirty[id]=false;
      return true;
    } catch (error) {
      App.showToast('此瀏覽器無法儲存草稿，請保留此頁；核對內容仍保留在目前畫面。','warning');
      return false;
    }
  }
  function persist(){return persistCase(activeId);}
  function filterCases() {
    const query=$('caseFilter').value.trim().toLowerCase(), status=$('statusFilter').value;
    document.querySelectorAll('#casesTable tbody tr').forEach(row => {
      row.style.display=row.dataset.search.includes(query) && (status==='all'||row.dataset.status===status)?'':'none';
    });
  }
  function renderTable() {
    const selected=new Set(Array.from(document.querySelectorAll('#crCasesBody .case-check:checked')).map(c=>c.closest('tr').dataset.caseId));
    $('crCasesBody').innerHTML=cases.map(item => {
      const state=states[item.id], processing=state.phase!=='ready', pending=state.phase==='pending';
      const missing=processing?'—':item.fields.filter(f => f.type!=='parties' && !hasValue(f.value) && !hasValue(state.values[f.key]) && !state.checks[f.key]).length;
      const returned=state.returnStatus==='已回拋';
      const returnClass=returned?'status-ok':state.returnStatus==='回拋失敗'?'status-danger':state.returnStatus==='待回拋'?'status-info':'status-warn';
      const search=[item.name,item.country,item.caseNo||'',state.values.receivedNo,item.type].join(' ').toLowerCase();
      return '<tr data-case-id="'+item.id+'" data-status="'+statusOf(state)+'" data-search="'+escape(search)+'">'+
        '<td><input class="form-check-input case-check" type="checkbox" '+(pending?(selected.has(item.id)?'checked':''):'disabled')+' aria-label="'+(pending?'選取':'不可批次選取')+escape(item.name)+'"></td>'+
        '<td><a class="doc-link" data-cr-open="'+item.id+'" href="?page=case-review&amp;case='+item.id+'">'+escape(item.name)+'</a><span class="doc-sub">收文文號：'+escape(state.values.receivedNo||'尚未填寫')+'</span><span class="doc-sub">'+escape(item.caseNo||'虛構示例')+'</span></td>'+
        '<td>'+escape(item.country)+'</td><td>'+item.files+' 份</td><td>'+missing+'</td>'+
        '<td><span class="badge-status '+badgeOf(state)+'">'+labelOf(state)+'</span></td>'+
        '<td>'+escape(state.savedAt||item.updated)+'</td>'+
        '<td><button class="btn btn-sm '+(state.confirmed||processing?'btn-outline-secondary':'btn-primary')+'" data-cr-open="'+item.id+'" type="button">'+(pending?'待處理':processing?'查看進度':state.confirmed?'查看資料':'核對資料')+'</button></td>'+
        '<td><span class="badge-status '+returnClass+'">'+escape(state.returnStatus)+'</span></td></tr>';
    }).join('');
    $('crNavCount').textContent=cases.length;
    $('crTotalCount').textContent=cases.length;
    $('crProcessingCount').textContent=cases.filter(c => states[c.id].phase==='processing').length;
    $('crManualCount').textContent=cases.filter(c => states[c.id].phase==='ready'&&!states[c.id].confirmed).length;
    $('confirmedMetric').textContent=cases.filter(c => states[c.id].confirmed).length;
    filterCases();
    if(App.refreshCaseSelection) App.refreshCaseSelection();
  }
  App.startCaseProcessing=function(ids){
    const eligible=cases.filter(item=>ids.includes(item.id)&&states[item.id].phase==='pending');
    eligible.forEach(item=>{
      const state=states[item.id];state.phase='processing';state.confirmed=false;state.returnStatus='待回拋';
      state.savedAt=new Date().toLocaleString('zh-TW',{hour12:false});dirty[item.id]=true;persistCase(item.id);
    });
    if(eligible.some(item=>item.id===activeId))update();else renderTable();
    return eligible.length;
  };
  function renderDocument() {
    const item=activeCase();
    $('crPaper').innerHTML='<div class="cr-watermark">介面討論用 · 虛構文件</div><div class="paper-kicker">'+escape(item.type)+'</div><h3>'+escape(item.document)+'</h3>'+
      item.fields.map(f => (f.group?'<div class="paper-section">'+escape(f.group)+'</div>':'')+
        '<p>'+escape(f.label)+'：'+(f.type==='parties'?(f.value.length?'<mark data-cr-original="'+f.key+'">'+f.value.map((party,index)=>'當事人 '+(index+1)+'：'+partyColumns.filter(c=>party[c.key]).map(c=>escape(c.label)+'：'+escape(party[c.key])).join('；')).join('<br>')+'</mark>':'原文未提供當事人資料'):hasValue(f.value)?'<mark data-cr-original="'+f.key+'">'+escape(Array.isArray(f.value)?f.value.join('、'):f.value)+'</mark>':'原文未提供')+'</p>').join('')+
      '<p style="font-family:var(--font-family-sans);font-size:12px;color:var(--color-text-muted)">本頁為主要請求文件的虛構節錄，其他附件未展開。原文不會隨右側欄位修改。</p>';
  }
  function partyPanel() {
    const parties=current().values.parties;
    const rows=parties.map((party,index)=>'<tr data-party-id="'+escape(party.id)+'"><td><label class="cr-party-number"><input type="checkbox" data-party-check="'+escape(party.id)+'" aria-label="核對當事人 '+(index+1)+'" '+(party.checked?'checked':'')+'><span>'+(index+1)+'</span></label></td><td>'+escape(party.chineseName||'未提供')+'<small>'+escape(party.foreignName||'外文姓名未提供')+'</small></td><td>'+escape(party.identity||'未提供')+'<small>'+escape(party.nationality||'國籍未提供')+'</small></td><td><button class="btn btn-sm btn-outline-primary" type="button" data-party-edit="'+escape(party.id)+'" aria-label="編輯當事人 '+(index+1)+'">編輯</button><button class="btn btn-sm btn-outline-secondary" type="button" data-party-delete="'+escape(party.id)+'" aria-label="刪除當事人 '+(index+1)+'">刪除</button></td></tr>').join('');
    return '<div class="field-group-title">當事人基本資料</div><section class="cr-field cr-parties" data-cr-row="parties" aria-label="當事人基本資料"><div class="cr-field-head"><strong>當事人基本資料</strong><span class="cr-party-count">'+parties.length+' 人</span>'+(activeCase().fields.find(f=>f.type==='parties').value.length?'<button class="cr-source" type="button" data-cr-source="parties">查看原文 ↗</button>':'<span class="cr-source">原文未提供當事人</span>')+'</div><p class="cr-party-hint">可新增多位當事人；點選編輯填寫完整基本資料。</p><div class="cr-party-table-scroll"><table class="cr-party-table"><thead><tr><th>核對／序號</th><th>姓名</th><th>身分／國籍</th><th>操作</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+(parties.length?'':'<p class="cr-party-hint">尚無當事人，請新增資料。</p>')+'<button class="btn btn-outline-primary cr-party-add" type="button" id="crAddParty">＋ 新增當事人</button><label class="cr-checkline"><input data-cr-check="parties" type="checkbox" '+(current().checks.parties?'checked':'')+'> 已核對全部當事人資料（原文未提供可保留空白）</label></section>';
  }
  function refreshPartyPanel() {
    const row=root.querySelector('[data-cr-row="parties"]');
    if(row){const holder=document.createElement('div');holder.innerHTML=partyPanel();row.replaceWith(holder.querySelector('.cr-parties'));}
    update();
  }
  function renderFields() {
    const item=activeCase(),state=current();
    $('crFields').innerHTML=item.fields.map(f => {
      if(f.type==='parties') return partyPanel();
      const value=state.values[f.key], missing=!hasValue(f.value);
      let control;
      if (f.options) control='<div class="cr-options">'+f.options.map(option => '<label><input data-cr-option="'+f.key+'" type="checkbox" value="'+escape(option)+'" '+(value.includes(option)?'checked':'')+'>'+escape(option)+'</label>').join('')+'</div>';
      else if (f.type==='textarea') control='<textarea id="crValue-'+f.key+'" data-cr-value="'+f.key+'" class="form-control" rows="3">'+escape(value)+'</textarea>';
      else control='<input id="crValue-'+f.key+'" data-cr-value="'+f.key+'" class="form-control" type="'+(f.type||'text')+'" value="'+escape(value)+'" '+(f.required?'required':'')+' '+(missing?'placeholder="原文未提供，可補充或核對後保留空白"':'')+'>';
      return (f.group?'<div class="field-group-title">'+escape(f.group)+'</div>':'')+'<section class="cr-field" data-cr-row="'+f.key+'" aria-label="'+escape(f.label)+'"><div class="cr-field-head"><label '+(!f.options?'for="crValue-'+f.key+'"':'')+'>'+escape(f.label)+(f.required?'<span class="cr-required" aria-label="本版暫定必要欄位">*</span>':'')+'</label>'+
        (missing?'<span class="cr-status" style="margin-left:auto"></span>':'<button class="cr-source" data-cr-source="'+f.key+'" type="button">查看原文 ↗</button>')+'</div>'+control+
        (missing?'<small>原文未提供此內容，可補充或核對後保留空白。</small>':'')+
        '<label class="cr-checkline"><input data-cr-check="'+f.key+'" type="checkbox" '+(state.checks[f.key]?'checked':'')+'> '+(missing?'已核對此欄位（可確認原文未提供）':'已核對此欄位')+'</label></section>';
    }).join('');
  }
  function update() {
    const item=activeCase(),state=current(),processing=state.phase!=='ready',pending=state.phase==='pending';
    const count=item.fields.filter(f => state.checks[f.key]).length;
    $('crReceiptSummary').textContent=state.values.receivedNo||'尚未填寫';
    $('crStatus').textContent=labelOf(state);
    $('crStatus').classList.toggle('done',state.confirmed);
    $('crConfirmedBanner').hidden=!state.confirmed;
    if (state.confirmed) $('crConfirmedBanner').textContent=state.returnStatus==='已回拋'
      ? '此為已人工確認、已回拋的既有示範資料。修改後需重新核對；本版未串接正式 API。'
      : state.returnStatus==='回拋失敗' ? '此為已人工確認、回拋失敗的既有示範資料。修改後需重新核對；本版不會實際重送。'
      : '人工核對已完成，回拋狀態為「待回拋」。本版未實際傳送；修改後需重新確認。';
    $('crProgress').textContent=processing?(pending?'待開始處理，尚未開放核對':'AI 處理中，尚未開放核對'):'已核對 '+count+' / '+item.fields.length+' 個欄位';
    $('crSaveInfo').textContent=dirty[activeId]?'本案有尚未儲存的變更':state.savedAt?'本案草稿已儲存 · '+state.savedAt:'範例案件；資料依案件分開保存';
    $('crConfirm').disabled=processing||state.confirmed;
    $('crConfirm').textContent=processing?(pending?'待處理':'處理中'):state.confirmed?'已確認':'確認資料';
    $('crSave').disabled=processing;
    $('crCheckFilled').disabled=processing;
    $('crFields').hidden=processing;
    $('crProcessingNotice').hidden=!processing;
    $('crProcessingTitle').textContent=pending?'等待開始處理':'AI 文件處理中';
    $('crProcessingDescription').textContent=pending?'本案尚未開始 AI 文件處理，可從此處或案件管理批次開始。':'本案尚未完成擷取，暫時無法人工核對。';
    $('crStartCase').hidden=!pending;
    $('crSimulateReady').hidden=pending;
    root.querySelectorAll('[data-cr-check]').forEach(c => c.closest('.cr-field').classList.toggle('cr-checked',c.checked));
    item.fields.forEach(f => {
      const row=root.querySelector('[data-cr-row="'+f.key+'"]');
      if(f.type==='parties')return;
      row.classList.toggle('cr-missing',!hasValue(f.value)&&!hasValue(state.values[f.key])&&!state.checks[f.key]);
      if (!hasValue(f.value)) row.querySelector('.cr-status').textContent=hasValue(state.values[f.key])?'已補充':state.checks[f.key]?'已核對缺漏':'待補充';
    });
    renderTable();
  }
  App.loadCaseReview=function(id) {
    const item=cases.find(c => c.id===id)||cases[0];
    activeId=item.id; App.currentReviewCaseId=activeId;
    $('crCaseHeading').textContent=item.name;
    $('crCaseType').innerHTML='<option>'+escape(item.type)+'</option>';
    $('crDocumentName').textContent=item.document+' · 示例';
    renderDocument();renderFields();update();
    root.querySelector('.cr-fields-scroll').scrollTop=0;
    root.querySelector('.cr-document-scroll').scrollTop=0;
  };
  $('crCasesBody').addEventListener('click',event => {
    const button=event.target.closest('[data-cr-open]');
    if (!button) return;
    event.preventDefault();
    App.goToPage('case-review',{caseId:button.dataset.crOpen});
  });
  $('caseFilter').addEventListener('input',filterCases);
  $('statusFilter').addEventListener('change',filterCases);
  function invalidate(fieldKey) {
    const state=current();
    state.confirmed=false; state.returnStatus='需人工處理'; dirty[activeId]=true;
    if (fieldKey) {
      state.checks[fieldKey]=false;
      root.querySelector('[data-cr-check="'+fieldKey+'"]').checked=false;
    }
    update();
  }
  function source(fieldKey) {
    root.querySelectorAll('.cr-paper mark').forEach(mark => mark.classList.remove('active'));
    const mark=root.querySelector('[data-cr-original="'+fieldKey+'"]');
    if(mark){mark.classList.add('active');mark.scrollIntoView({behavior:'smooth',block:'center'});}
  }
  $('crFields').addEventListener('input',event => {
    const fieldKey=event.target.dataset.crValue;
    if (fieldKey) {current().values[fieldKey]=event.target.value;invalidate(fieldKey);}
  });
  $('crFields').addEventListener('change',event => {
    const state=current(), check=event.target.dataset.crCheck, option=event.target.dataset.crOption;
    if(event.target.dataset.partyCheck) {
      const party=state.values.parties.find(p=>p.id===event.target.dataset.partyCheck);
      if(party) party.checked=event.target.checked;
      state.checks.parties=state.values.parties.length>0&&state.values.parties.every(p=>p.checked);
      root.querySelector('[data-cr-check="parties"]').checked=state.checks.parties;
      invalidate();
    }
    if (check) {
      if(check==='parties') {
        if(!state.values.parties.length && activeCase().fields.find(f=>f.type==='parties').required){event.target.checked=false;App.showToast('請先新增當事人資料。','warning');}
        state.values.parties.forEach(p=>{p.checked=event.target.checked;});
        root.querySelectorAll('[data-party-check]').forEach(c=>{c.checked=event.target.checked;});
      }
      state.checks[check]=event.target.checked;invalidate();
    }
    if (option) {
      state.values[option]=Array.from(root.querySelectorAll('[data-cr-option="'+option+'"]:checked')).map(c=>c.value);
      invalidate(option);
      if (option==='evidence'&&state.values.evidence.length&&!state.values.requests.includes('取得證據')) {
        state.values.requests.push('取得證據'); root.querySelector('[data-cr-option="requests"][value="取得證據"]').checked=true; invalidate('requests');
      }
      if (option==='requests'&&!state.values.requests.includes('取得證據')) {
        state.values.evidence=[]; root.querySelectorAll('[data-cr-option="evidence"]').forEach(c=>c.checked=false); invalidate('evidence');
      }
    }
  });
  $('crFields').addEventListener('click',event => {const button=event.target.closest('[data-cr-source]');if(button)source(button.dataset.crSource);});
  $('crFields').addEventListener('focusin',event => {const key=event.target.dataset.crValue||event.target.dataset.crOption;if(key)source(key);});
  $('crSave').addEventListener('click',() => {
    current().savedAt=new Date().toLocaleString('zh-TW',{hour12:false});
    if(persist()) {update();App.showToast('「'+activeCase().name+'」草稿已儲存。');}
  });
  $('crCheckFilled').addEventListener('click',() => {
    const item=activeCase(),state=current();
    item.fields.filter(f=>f.type!=='parties'&&hasValue(f.value)&&hasValue(state.values[f.key])).forEach(f=>{state.checks[f.key]=true;});
    invalidate();renderFields();update();
    App.showToast(item.fields.some(f=>f.type==='parties')?'已勾選一般欄位；當事人資料請逐人核對。':item.fields.some(f=>!hasValue(f.value))?'已勾選有擷取內容的欄位；原文缺漏請另行核對。':'已勾選有擷取內容的欄位，請確認內容無誤後完成確認。');
  });
  function openDialog(id){previousFocus=document.activeElement;$(id).showModal();}
  root.querySelectorAll('[data-cr-close]').forEach(button=>button.addEventListener('click',()=>$(button.dataset.crClose).close()));
  root.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('close',()=>{if(previousFocus)previousFocus.focus();}));
  $('crDiscussion').addEventListener('click',()=>openDialog('crDiscussionDialog'));
  $('crConfirm').addEventListener('click',()=>{
    const item=activeCase(),state=current();
    if(state.phase!=='ready')return;
    const invalid=item.fields.find(f=>f.required&&!hasValue(state.values[f.key]));
    if(invalid){App.showToast('請填寫「'+invalid.label+'」。','warning');(invalid.type==='parties'?$('crAddParty'):$('crValue-'+invalid.key)).focus();return;}
    const duplicate=cases.find(c=>c.id!==activeId&&states[c.id].values.receivedNo.trim()===state.values.receivedNo.trim());
    if(duplicate){App.showToast('示範清單已有相同收文文號，請確認是否填錯案件。','warning');$('crValue-receivedNo').focus();return;}
    const partyField=item.fields.find(f=>f.type==='parties');
    if(partyField && state.values.parties.some(p=>!p.checked||(!p.chineseName.trim()&&!p.foreignName.trim()))) {
      App.showToast('請逐人核對當事人，並確認每人至少有中文或外文姓名。','warning');
      root.querySelector('[data-cr-check="parties"]').focus();return;
    }
    const unchecked=item.fields.find(f=>!state.checks[f.key]);
    if(unchecked){App.showToast('請先核對「'+unchecked.label+'」並勾選。','warning');root.querySelector('[data-cr-check="'+unchecked.key+'"]').focus();return;}
    $('crConfirmReceipt').textContent=state.values.receivedNo;
    $('crConfirmType').textContent=item.type;
    $('crConfirmSummary').textContent='案件：'+item.name+'。已核對全部 '+item.fields.length+' 個欄位'+(partyField?'，包含 '+state.values.parties.length+' 位當事人':'')+'；原文未提供的非必要內容可在核對後保留空白。';
    openDialog('crConfirmDialog');
  });
  $('crConfirmAction').addEventListener('click',()=>{
    const state=current(); state.confirmed=true;state.returnStatus='待回拋';state.savedAt=new Date().toLocaleString('zh-TW',{hour12:false});dirty[activeId]=true;
    persist();$('crConfirmDialog').close();update();App.showToast('本案人工核對完成，狀態已改為「待回拋」；尚未實際傳送。');
  });
  $('crStartCase').addEventListener('click',()=>{if(App.startCaseProcessing([activeId]))App.showToast('本案已進入處理中（示範流程）。');});
  $('crSimulateReady').addEventListener('click',()=>{
    current().phase='ready';invalidate();renderFields();update();App.showToast('已切換為擷取完成的討論範例，請進行人工核對。');
  });
  let editingPartyId=null, deletingPartyId=null, partySequence=0;
  function openPartyEditor(id) {
    const party=id?current().values.parties.find(p=>p.id===id):blankParty();
    if(!party)return;
    editingPartyId=id||null;
    $('crPartyDialogTitle').textContent=id?'編輯當事人':'新增當事人';
    $('crPartyForm').reset();$('crPartyError').hidden=true;
    $('crPartyFormFields').innerHTML=partyColumns.map(column=>{
      const inputId='crParty-'+column.key;
      let control;
      if(column.options) control='<select class="form-select" id="'+inputId+'" name="'+column.key+'">'+column.options.map(o=>'<option value="'+escape(o)+'" '+(party[column.key]===o?'selected':'')+'>'+escape(o||'請選擇')+'</option>').join('')+'</select>';
      else if(column.type==='textarea') control='<textarea class="form-control" id="'+inputId+'" name="'+column.key+'" rows="2">'+escape(party[column.key])+'</textarea>';
      else control='<input class="form-control" type="'+(column.type||'text')+'" id="'+inputId+'" name="'+column.key+'" value="'+escape(party[column.key])+'">';
      return '<div class="cr-party-form-field"><label for="'+inputId+'">'+escape(column.label)+'</label>'+control+'</div>';
    }).join('');
    openDialog('crPartyDialog');
  }
  $('crFields').addEventListener('click',event=>{
    if(event.target.closest('#crAddParty'))openPartyEditor(null);
    const edit=event.target.closest('[data-party-edit]');if(edit)openPartyEditor(edit.dataset.partyEdit);
    const remove=event.target.closest('[data-party-delete]');
    if(remove){
      const party=current().values.parties.find(p=>p.id===remove.dataset.partyDelete);
      if(!party)return;deletingPartyId=party.id;
      $('crDeletePartyName').textContent=party.chineseName||party.foreignName;
      openDialog('crDeletePartyDialog');
    }
  });
  $('crPartyForm').addEventListener('submit',event=>{
    event.preventDefault();
    const party=Object.assign(blankParty(),{id:editingPartyId||('party-'+Date.now()+'-'+(++partySequence)),checked:false});
    partyColumns.forEach(column=>{party[column.key]=$('crParty-'+column.key).value.trim();});
    if(!party.chineseName&&!party.foreignName){$('crPartyError').textContent='請至少填寫中文姓名或外文姓名。';$('crPartyError').hidden=false;$('crParty-chineseName').focus();return;}
    const parties=current().values.parties,index=parties.findIndex(p=>p.id===editingPartyId);
    if(editingPartyId&&index<0)return;
    if(index>=0)parties[index]=party;else parties.push(party);
    invalidate('parties');refreshPartyPanel();$('crPartyDialog').close();
    root.querySelector('[data-cr-row="parties"]').scrollIntoView({block:'center'});
    App.showToast('當事人資料已更新，請重新核對後確認案件。');
  });
  $('crDeletePartyAction').addEventListener('click',()=>{
    const parties=current().values.parties,index=parties.findIndex(p=>p.id===deletingPartyId);
    if(index<0)return;
    parties.splice(index,1);invalidate('parties');refreshPartyPanel();$('crDeletePartyDialog').close();
    root.querySelector('[data-cr-row="parties"]').scrollIntoView({block:'center'});
    App.showToast('已移除當事人，請重新核對並儲存草稿。');
  });
  global.addEventListener('beforeunload',event=>{if(Object.values(dirty).some(Boolean)){event.preventDefault();event.returnValue='';}});
  App.loadCaseReview(activeId);
})(window);
