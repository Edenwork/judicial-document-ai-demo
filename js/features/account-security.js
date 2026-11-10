/* UI prototype only: no credentials, tokens or authentication results are persisted. */
(function (global) {
  'use strict';
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const policy = { length: 8, classes: 3, history: 3, age: 0, notice: 0, failures: 5, lock: 15, idle: 20 };
  function modal(title, content) {
    const d = document.createElement('dialog');
    d.className = 'account-dialog';
    const id = 'account-dialog-' + (++modal.count);
    d.setAttribute('aria-labelledby', id);
    d.innerHTML = `<div class="account-dialog-head"><h3 id="${id}">${esc(title)}</h3><button class="icon-btn" type="button" data-dismiss aria-label="關閉">×</button></div>${content}`;
    document.body.append(d);
    const previous = document.activeElement;
    d.querySelector('[data-dismiss]').onclick = () => d.close();
    d.addEventListener('click', e => { if (e.target.closest('[data-cancel]')) d.close(); });
    d.addEventListener('close', () => { d.querySelectorAll('input[type=password]').forEach(i => { i.value = ''; }); d.remove(); if (previous?.isConnected) previous.focus(); });
    d.showModal();
    return d;
  }
  modal.count = 0;
  function validPassword(value, account) {
    const groups = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9\s]/].filter(r => r.test(value)).length;
    return value.length >= policy.length && groups >= policy.classes && value.toLowerCase() !== account.toLowerCase() && !/\s/.test(value);
  }
  function password(mode, account, onComplete) {
    let verified = mode !== 'forgot';
    let tokenUntil = 0;
    const first = mode === 'first';
    const d = modal(first ? '首次登入：變更預設密碼' : mode === 'forgot' ? '忘記密碼／重設密碼' : '變更密碼', `
      <p class="account-demo-note">流程展示，請勿輸入真實密碼。身分驗證、密碼歷程及符記由正式服務執行，本頁不儲存密碼。</p>
      ${first ? '<p>使用預設密碼首次登入，必須完成變更後才能進入系統；取消則返回。</p>' : ''}
      <form class="account-form">
      <label>帳號<input name="account" class="form-control" required maxlength="80" value="${esc(account)}" ${account ? 'readonly' : ''}></label>
      <section data-verification ${verified ? 'hidden' : ''}><p>1. 重新確認本人身分並完成雙因子驗證。</p><p class="subtle">驗證方式待串接，本示範不發送簡訊或郵件。</p><button class="btn btn-outline-primary" type="button" data-verify>模擬完成本人雙因子驗證</button></section>
      <section data-password ${verified ? '' : 'hidden'}><p data-token hidden>2. 已模擬取得一次性重設符記（示範效期 5 分鐘）。</p>
      ${mode === 'change' ? '<label>目前密碼<input class="form-control" name="current" type="password" autocomplete="current-password" required></label>' : ''}
      <label>新密碼<input class="form-control" name="password" type="password" autocomplete="new-password" required></label>
      <p class="subtle">至少 ${policy.length} 碼，英文大寫、小寫、數字、特殊符號至少 ${policy.classes} 類；不得與帳號相同，不得沿用前 ${policy.history} 次密碼。</p>
      <label>確認新密碼<input class="form-control" name="confirm" type="password" autocomplete="new-password" required></label></section>
      <p class="account-error" role="alert" hidden></p>
      <div class="account-dialog-actions"><button class="btn btn-outline-secondary" type="button" data-cancel>取消</button><button class="btn btn-primary" type="submit" ${verified ? '' : 'disabled'}>確認變更</button></div></form>`);
    const form = d.querySelector('form');
    const error = d.querySelector('[role=alert]');
    const fail = message => { error.textContent = message; error.hidden = false; };
    // Hidden required password fields must not participate before verification.
    d.querySelectorAll('[data-password] input').forEach(i => { i.disabled = !verified; });
    d.querySelector('[data-verify]')?.addEventListener('click', () => {
      if (!form.elements.account.reportValidity()) return;
      verified = true; tokenUntil = Date.now() + 300000;
      form.elements.account.readOnly = true;
      d.querySelector('[data-verification]').hidden = true;
      d.querySelector('[data-password]').hidden = false;
      d.querySelector('[data-token]').hidden = false;
      d.querySelectorAll('[data-password] input').forEach(i => { i.disabled = false; });
      d.querySelector('[type=submit]').disabled = false;
      form.elements.password.focus();
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!verified || (mode === 'forgot' && Date.now() > tokenUntil)) { fail('驗證已失效，請關閉後重新進行身分驗證。'); return; }
      const value = form.elements.password.value;
      if (!validPassword(value, form.elements.account.value)) { fail('新密碼不符合長度或複雜度規則，或與帳號相同。'); return; }
      if (value !== form.elements.confirm.value) { fail('兩次輸入的新密碼不一致。'); return; }
      if (form.elements.current && value === form.elements.current.value) { fail('新密碼不可與目前密碼相同。'); return; }
      verified = false; tokenUntil = 0; // Consume this simulated flow once.
      const id = form.elements.account.value;
      d.close();
      onComplete?.(id);
    });
  }
  global.AccountSecurity = { modal, esc, policy, password };
})(window);
