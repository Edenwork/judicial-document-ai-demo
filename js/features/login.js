(function (global) {
  "use strict";

  const form = document.getElementById("loginForm");
  const accountInput = document.getElementById("loginAccount");
  const passwordInput = document.getElementById("loginPassword");
  const passwordToggle = document.getElementById("togglePassword");
  const loginButton = document.getElementById("loginButton");
  const loginMessage = document.getElementById("loginMessage");

  function renderIcons() {
    if (global.lucide) global.lucide.createIcons();
  }

  function showMessage(message) {
    loginMessage.textContent = message;
    loginMessage.hidden = false;
  }

  passwordToggle.addEventListener("click", function () {
    const showPassword = passwordInput.type === "password";
    passwordInput.type = showPassword ? "text" : "password";
    passwordToggle.setAttribute("aria-label", showPassword ? "隱藏密碼" : "顯示密碼");
    passwordToggle.setAttribute("aria-pressed", String(showPassword));
    passwordToggle.innerHTML = '<i data-lucide="' + (showPassword ? "eye-off" : "eye") + '"></i>';
    renderIcons();
  });

  document.getElementById("forgotPassword").addEventListener("click", function () {
    showMessage("正式版將要求雙因子驗證，確認身分後寄送一次性且具時效性的密碼重設連結。");
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    form.classList.add("was-validated");
    loginMessage.hidden = true;

    const accountMissing = !accountInput.value.trim();
    const passwordMissing = !passwordInput.value;
    accountInput.classList.toggle("is-invalid", accountMissing);
    passwordInput.classList.toggle("is-invalid", passwordMissing);
    if (accountMissing || passwordMissing) {
      showMessage("請輸入使用者帳號與密碼。");
      return;
    }

    loginButton.disabled = true;
    loginButton.innerHTML = '<span class="spinner-border spinner-border-sm" aria-hidden="true"></span><span>驗證身分中...</span>';
    try {
      global.localStorage.setItem("judicial-demo-session", accountInput.value.trim());
    } catch (error) {
      // file:// 預覽可能限制 localStorage，仍可正常進入 Demo。
    }

    global.setTimeout(function () { global.location.href = "index.html"; }, 850);
  });

  [accountInput, passwordInput].forEach(function (input) {
    input.addEventListener("input", function () { input.classList.remove("is-invalid"); });
  });

  renderIcons();
})(window);
