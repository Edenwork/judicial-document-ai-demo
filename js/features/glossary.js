(function (global) {
  "use strict";
  const App = global.JudicialApp;

  // 示範資料；一筆長名稱可包含多個短名稱。
  const terms = [
    { longName: "Mutual Legal Assistance", shortNames: ["MLA"] },
    { longName: "Mutual Legal Assistance Treaty", shortNames: ["MLAT"] },
    { longName: "司法互助", shortNames: ["司法協助", "司法協作"] },
    { longName: "中華民國法務部", shortNames: ["法務部", "MOJ"] },
    { longName: "美國司法部", shortNames: ["美國 DOJ", "US DOJ"] },
    { longName: "電子郵件", shortNames: ["Email", "E-mail"] },
    { longName: "網際網路協定位址", shortNames: ["IP 位址", "IP address"] },
    { longName: "應用程式介面", shortNames: ["API"] }
  ];

  App.initGlossary = function () {
    const input = document.getElementById("glossarySearch");
    const body = document.getElementById("glossaryRows");
    const count = document.getElementById("glossaryCount");
    const empty = document.getElementById("glossaryEmpty");
    if (!input || !body || !count || !empty) return;

    function render() {
      const query = input.value.trim().toLocaleLowerCase();
      const matches = terms.filter(function (term) {
        return [term.longName].concat(term.shortNames).some(function (name) {
          return name.toLocaleLowerCase().includes(query);
        });
      });
      body.replaceChildren();
      matches.forEach(function (term) {
        const row = document.createElement("tr");
        const nameCell = document.createElement("td");
        const shortCell = document.createElement("td");
        const aliases = document.createElement("div");
        nameCell.textContent = term.longName;
        aliases.className = "glossary-aliases";
        term.shortNames.forEach(function (name) {
          const badge = document.createElement("span");
          badge.className = "glossary-alias";
          badge.textContent = name;
          aliases.appendChild(badge);
        });
        shortCell.appendChild(aliases);
        row.append(nameCell, shortCell);
        body.appendChild(row);
      });
      count.textContent = query ? "顯示 " + matches.length + " / " + terms.length + " 筆" : "共 " + terms.length + " 筆";
      empty.hidden = matches.length !== 0;
    }
    input.addEventListener("input", render);
    render();
  };
})(window);
