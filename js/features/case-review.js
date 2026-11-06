(function(global){
  'use strict';
  const root=document.getElementById('page-case-review');
  if(!root)return;
  const App=global.JudicialApp;
  const key='judicial-discussion-taiwan-mainland-v1';
  const definitions=[
    {key:'receivedNo',label:'收文文號',value:'1150001234',required:true,group:'文件基本資料'},
    {key:'receivedDate',label:'收文日期',value:'2026-02-03',type:'date',required:true},
    {key:'applyAgency',label:'提出請求機關',value:'臺灣○○地方檢察署（示例）',required:true},
    {key:'applyNo',label:'請求機關案號',value:'',missing:true},
    {key:'area',label:'地區',value:'大陸地區',group:'地區與案件內容'},
    {key:'provincial',label:'省分（含直轄市）',value:'福建省'},
    {key:'caseCategory',label:'案由分類',value:['刑事'],options:['刑事','民事','行政及其他']},
    {key:'requests',label:'請求內容',value:['取得證據'],options:['送達文書','取得證據','裁判認可','行政協查','分享']},
    {key:'evidence',label:'取得證據事項',value:['提供書證','提供視聽資料'],options:['取得證言及陳述','提供書證','提供物證','提供視聽資料','搜索']},
    {key:'defendant',label:'被告中文姓名',value:'陳○○',group:'當事人資料'},
    {key:'acceptDesc',label:'受理說明',value:'請協助取得被告於指定期間之銀行交易明細與提款影像。',type:'textarea',group:'受理資訊'}
  ];
  const $=id=>document.getElementById(id);
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const initial=()=>({values:Object.fromEntries(definitions.map(f=>[f.key,Array.isArray(f.value)?f.value.slice():f.value])),checks:{},confirmed:false,savedAt:''});
  let state=initial(),dirty=false,previousFocus=null;
  try{const saved=JSON.parse(localStorage.getItem(key));if(saved&&saved.values&&saved.checks&&definitions.every(f=>f.options?Array.isArray(saved.values[f.key])&&saved.values[f.key].every(v=>f.options.includes(v)):typeof saved.values[f.key]==='string'))state=saved;}catch(e){}
  function persist(){try{localStorage.setItem(key,JSON.stringify(state));return true;}catch(e){App.showToast('瀏覽器無法儲存草稿，請保留此頁；目前內容仍可繼續核對。','warning');return false;}}
  function render(){
    $('crFields').innerHTML=definitions.map(f=>{
      const value=state.values[f.key],checked=!!state.checks[f.key];
      let control;
      if(f.options)control='<div class="cr-options">'+f.options.map(o=>'<label><input data-cr-option="'+f.key+'" type="checkbox" value="'+esc(o)+'" '+(value.includes(o)?'checked':'')+'>'+esc(o)+'</label>').join('')+'</div>';
      else if(f.type==='textarea')control='<textarea id="crValue-'+f.key+'" data-cr-value="'+f.key+'" class="form-control" rows="3">'+esc(value)+'</textarea>';
      else control='<input id="crValue-'+f.key+'" data-cr-value="'+f.key+'" class="form-control" type="'+(f.type||'text')+'" value="'+esc(value)+'" '+(f.required?'required':'')+' '+(f.missing?'placeholder="原文未提供，可補充或核對後保留空白"':'')+'>';
      return (f.group?'<div class="field-group-title">'+f.group+'</div>':'')+'<section class="cr-field '+(f.missing?'cr-missing ':'')+(checked?'cr-checked':'')+'" data-cr-row="'+f.key+'" aria-label="'+esc(f.label)+'"><div class="cr-field-head"><label '+(!f.options?'for="crValue-'+f.key+'"':'')+'>'+f.label+(f.required?'<span class="cr-required" aria-label="本版暫定必要欄位">*</span>':'')+'</label>'+(!f.missing?'<button class="cr-source" data-cr-source="'+f.key+'" type="button">查看原文 ↗</button>':'<span class="cr-status" style="margin-left:auto">待補充</span>')+'</div>'+control+(f.missing?'<small>原文未找到案號；若無其他資料，可核對後保留空白。</small>':'')+'<label class="cr-checkline"><input data-cr-check="'+f.key+'" type="checkbox" '+(checked?'checked':'')+'> '+(f.missing?'已核對此欄位（可確認原文未提供）':'已核對此欄位')+'</label></section>';
    }).join('');update();
  }
  function update(){
    const count=definitions.filter(f=>state.checks[f.key]).length;
    $('crProgress').textContent='已核對 '+count+' / '+definitions.length+' 個欄位';
    $('crReceiptSummary').textContent=state.values.receivedNo||'尚未填寫';
    $('crListReceipt').textContent='收文文號：'+(state.values.receivedNo||'尚未填寫')+' · 虛構範例';
    $('crCaseRow').dataset.search=('調查取證 臺請陸 大陸 福建 示範 '+state.values.receivedNo).toLowerCase();
    $('crCaseRow').dataset.status=state.confirmed?'completed':'manual';
    $('crListStatus').textContent=state.confirmed?'人工核對完成':'待人工核對';
    $('crListStatus').className='badge-status '+(state.confirmed?'status-success':'status-warn');
    $('crListApi').textContent=state.confirmed?'可供取用（示範）':'未開放取用';
    $('crListApi').className='badge-status '+(state.confirmed?'status-success':'status-warn');
    $('crListAction').textContent=state.confirmed?'查看資料':'核對資料';
    if(state.savedAt)$('crListUpdated').textContent=state.savedAt;
    $('caseFilter').dispatchEvent(new Event('input'));
    $('crStatus').textContent=state.confirmed?'資料已確認':'待核對';
    $('crStatus').classList.toggle('done',!!state.confirmed);
    $('crConfirmedBanner').hidden=!state.confirmed;
    $('crSaveInfo').textContent=dirty?'有尚未儲存的變更':state.savedAt?'此瀏覽器已儲存 · '+state.savedAt:'示範資料；尚未儲存草稿';
    $('crConfirm').disabled=!!state.confirmed;
    $('crConfirm').textContent=state.confirmed?'已確認':'確認資料';
    root.querySelectorAll('[data-cr-check]').forEach(c=>c.closest('.cr-field').classList.toggle('cr-checked',c.checked));
    definitions.filter(f=>f.missing).forEach(f=>{
      const row=root.querySelector('[data-cr-row="'+f.key+'"]');
      const filled=!!state.values[f.key].trim();
      row.querySelector('.cr-status').textContent=filled?'已補充':state.checks[f.key]?'已核對缺漏':'待補充';
      row.classList.toggle('cr-missing',!filled&&!state.checks[f.key]);
    });
  }
  function markEdited(field){state.confirmed=false;dirty=true;if(field){state.checks[field]=false;root.querySelector('[data-cr-check="'+field+'"]').checked=false;}update();}
  function source(field){root.querySelectorAll('.cr-paper mark').forEach(m=>m.classList.remove('active'));const mark=root.querySelector('[data-cr-original="'+field+'"]');if(mark){mark.classList.add('active');mark.scrollIntoView({behavior:'smooth',block:'center'});}}
  $('crFields').addEventListener('input',e=>{const field=e.target.dataset.crValue;if(field){state.values[field]=e.target.value;markEdited(field);}});
  $('crFields').addEventListener('change',e=>{
    const field=e.target.dataset.crCheck,option=e.target.dataset.crOption;
    if(field){state.checks[field]=e.target.checked;state.confirmed=false;dirty=true;update();}
    if(option){
      state.values[option]=Array.from(root.querySelectorAll('[data-cr-option="'+option+'"]:checked')).map(c=>c.value);
      markEdited(option);
      if(option==='evidence'&&state.values.evidence.length&&!state.values.requests.includes('取得證據')){
        state.values.requests.push('取得證據');
        root.querySelector('[data-cr-option="requests"][value="取得證據"]').checked=true;
        markEdited('requests');
      }
      if(option==='requests'&&!state.values.requests.includes('取得證據')){
        state.values.evidence=[];
        root.querySelectorAll('[data-cr-option="evidence"]').forEach(c=>c.checked=false);
        markEdited('evidence');
      }
    }
  });
  $('crFields').addEventListener('click',e=>{const button=e.target.closest('[data-cr-source]');if(button)source(button.dataset.crSource);});
  $('crFields').addEventListener('focusin',e=>{const field=e.target.dataset.crValue||e.target.dataset.crOption;if(field)source(field);});
  $('crSave').addEventListener('click',()=>{state.savedAt=new Date().toLocaleString('zh-TW',{hour12:false});if(persist()){dirty=false;update();App.showToast('草稿已儲存在此瀏覽器。');}});
  $('crCheckFilled').addEventListener('click',()=>{
    definitions.filter(f=>!f.missing&&(Array.isArray(state.values[f.key])?state.values[f.key].length:state.values[f.key].trim())).forEach(f=>{state.checks[f.key]=true;});
    state.confirmed=false;dirty=true;render();App.showToast('已勾選有擷取內容的欄位；請另行核對「請求機關案號」。');
  });
  function openDialog(id){previousFocus=document.activeElement;$(id).showModal();}
  root.querySelectorAll('[data-cr-close]').forEach(b=>b.addEventListener('click',()=>$(b.dataset.crClose).close()));
  root.querySelectorAll('dialog').forEach(d=>d.addEventListener('close',()=>{if(previousFocus)previousFocus.focus();}));
  $('crDiscussion').addEventListener('click',()=>openDialog('crDiscussionDialog'));
  $('crConfirm').addEventListener('click',()=>{
    const invalid=definitions.find(f=>f.required&&!String(state.values[f.key]).trim());
    if(invalid){App.showToast('請填寫「'+invalid.label+'」。','warning');$('crValue-'+invalid.key).focus();return;}
    const unchecked=definitions.find(f=>!state.checks[f.key]);
    if(unchecked){App.showToast('請先核對「'+unchecked.label+'」並勾選。','warning');root.querySelector('[data-cr-check="'+unchecked.key+'"]').focus();return;}
    $('crConfirmReceipt').textContent=state.values.receivedNo;openDialog('crConfirmDialog');
  });
  $('crConfirmAction').addEventListener('click',()=>{
    state.confirmed=true;state.savedAt=new Date().toLocaleString('zh-TW',{hour12:false});dirty=true;
    if(persist())dirty=false;
    $('crConfirmDialog').close();update();App.showToast('人工核對完成，已標示可供案管取用；本版未串接正式 API。');
  });
  global.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
  render();
})(window);
