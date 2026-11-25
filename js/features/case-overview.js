(function (global) {
  "use strict";

  const App = global.JudicialApp;
  const fileTypes = [
    ["letter", "函"], ["memo", "簽"], ["draft", "稿"], ["other", "其他"],
  ];
  const entityTypes = [
    ["person", "人"], ["event", "事"], ["time", "時"], ["place", "地"],
  ];
  const edgeTypes = [["confirmed", "確定"], ["belongs", "屬於"]];
  const formatNumber = new Intl.NumberFormat("zh-TW");

  // 每列為示範批次的上傳日、首次歸檔日，以及每種類型的份數（最後一欄為待分類）。
  const demoBatches = [
    ["2025-12-19", "2025-12-22", [12, 6, 3, 4, 0]],
    ["2026-09-10", "2026-09-14", [14, 5, 4, 5, 0]],
    ["2026-10-15", "2026-10-19", [24, 11, 7, 8, 1]],
    ["2026-10-29", "2026-11-02", [17, 6, 4, 5, 0]],
    ["2026-11-04", "2026-11-06", [20, 9, 5, 6, 0]],
    ["2026-11-12", "2026-11-16", [22, 12, 6, 5, 0]],
    ["2026-11-20", "2026-11-25", [17, 8, 6, 4, 0]],
    ["2026-11-25", null, [12, 6, 4, 5, 2]],
  ];
  const documents = demoBatches.flatMap(function ([uploadedAt, archivedAt, quantities]) {
    return quantities.flatMap(function (quantity, typeIndex) {
      const type = fileTypes[typeIndex]?.[0] || "unclassified";
      return Array.from({ length: quantity }, function (_, index) {
        return { id: uploadedAt + "-" + type + "-" + index, type, uploadedAt, archivedAt };
      });
    });
  });
  const latestDate = documents.reduce(function (latest, file) {
    return [latest, file.uploadedAt, file.archivedAt || ""].sort().at(-1);
  }, "");

  function countTypes(items, getType) {
    const counts = new Map();
    items.forEach(function (item) {
      const type = getType(item);
      counts.set(type, (counts.get(type) || 0) + 1);
    });
    return counts;
  }

  // 原型以固定的歸檔批次建立示範圖譜。正式資料應由圖譜服務回傳。
  function getDemoGraph(asOf) {
    const nodes = new Map();
    const edges = new Map();

    function addEdge(from, type, to) {
      edges.set(JSON.stringify([from, type, to]), type);
    }

    documents.filter(function (file) {
      return file.archivedAt && file.archivedAt <= asOf;
    }).forEach(function (file, index) {
      const caseNumber = Math.floor(index / 5);
      const mainId = "case-" + caseNumber;
      const cardId = "card-" + Math.floor(index / 3);
      const fileId = "file-" + file.id;
      nodes.set(mainId, "main");
      nodes.set(cardId, "child");
      nodes.set(fileId, "child");
      addEdge(mainId, "belongs", cardId);
      addEdge(cardId, "belongs", fileId);

      const [type] = entityTypes[index % entityTypes.length];
      const entityId = type + "-" + (caseNumber % 11);
      nodes.set(entityId, type);
      addEdge(fileId, "confirmed", entityId);
    });

    return {
      nodes: countTypes(nodes, (type) => type),
      edges: countTypes(edges, (type) => type),
    };
  }

  function datePart(number) {
    return String(number).padStart(2, "0");
  }

  function daysInMonth(year, month) {
    return new Date(Date.UTC(year, month, 0)).getUTCDate();
  }

  function setOptions(select, values, unit, selected) {
    select.replaceChildren(...values.map(function (value) {
      return new Option(value + unit, value);
    }));
    select.value = selected;
  }

  function makeBreakdown(container, types, counts) {
    container.replaceChildren(...types.map(function ([key, label]) {
      const item = document.createElement("li");
      item.className = "case-overview-breakdown-" + key;
      item.textContent = label + " " + formatNumber.format(counts.get(key) || 0);
      return item;
    }));
  }

  App.initCaseOverview = function () {
    const page = document.getElementById("page-case-overview");
    if (!page) return;

    const element = (suffix) => page.querySelector("#case-overview-" + suffix);
    const year = element("year");
    const month = element("month");
    const day = element("day");
    const latestParts = latestDate.split("-").map(Number);
    const firstYear = Number(demoBatches[0][0].slice(0, 4));
    const years = Array.from({ length: latestParts[0] - firstYear + 1 }, (_, index) => latestParts[0] - index);
    const range = (length) => Array.from({ length }, (_, index) => index + 1);
    setOptions(year, years, "年", latestParts[0]);
    setOptions(month, range(12), "月", latestParts[1]);
    let previousDayCount = 0;

    function render() {
      const granularity = page.querySelector('input[name="case-overview-granularity"]:checked').value;
      element("month-field").hidden = granularity === "year";
      element("day-field").hidden = granularity !== "day";

      const dayCount = daysInMonth(Number(year.value), Number(month.value));
      if (dayCount !== previousDayCount) {
        const selectedDay = Number(day.value) || latestParts[2];
        setOptions(day, range(dayCount), "日", Math.min(selectedDay, dayCount));
        previousDayCount = dayCount;
      }

      const monthPrefix = year.value + "-" + datePart(month.value);
      const date = monthPrefix + "-" + datePart(day.value);
      const period = granularity === "year" ? year.value : granularity === "month" ? monthPrefix : date;
      const periodEnd = granularity === "year" ? year.value + "-12-31"
        : granularity === "month" ? monthPrefix + "-" + datePart(dayCount) : date;
      const asOf = periodEnd < latestDate ? periodEnd : latestDate;
      const periodLabel = year.value + " 年"
        + (granularity === "year" ? "" : " " + month.value + " 月")
        + (granularity === "day" ? " " + day.value + " 日" : "");

      const uploaded = documents.filter((file) => file.uploadedAt.startsWith(period));
      const archived = documents.filter((file) => file.archivedAt?.startsWith(period));
      const typeCounts = countTypes(uploaded, (file) => file.type);
      const graph = getDemoGraph(asOf);
      const entityCount = entityTypes.reduce((total, [key]) => total + (graph.nodes.get(key) || 0), 0);
      const edgeCount = Array.from(graph.edges.values()).reduce((total, count) => total + count, 0);

      element("period").textContent = periodLabel;
      element("graph-period").textContent = "累計至 " + asOf.replaceAll("-", "/");
      element("upload-count").textContent = formatNumber.format(uploaded.length);
      element("archive-count").textContent = formatNumber.format(archived.length);
      element("main-count").textContent = formatNumber.format(graph.nodes.get("main") || 0);
      element("child-count").textContent = formatNumber.format(graph.nodes.get("child") || 0);
      element("entity-count").textContent = formatNumber.format(entityCount);
      element("edge-count").textContent = formatNumber.format(edgeCount);

      const bars = fileTypes.map(function ([key, label]) {
        const count = typeCounts.get(key) || 0;
        const item = document.createElement("li");
        item.innerHTML = '<span></span><span class="case-overview-bar-track" aria-hidden="true"><span></span></span><strong></strong>';
        item.firstElementChild.textContent = label;
        item.lastElementChild.textContent = formatNumber.format(count) + " 份";
        item.querySelector(".case-overview-bar-track > span").style.width =
          (uploaded.length ? 100 * count / uploaded.length : 0) + "%";
        return item;
      });
      element("bars").replaceChildren(...bars);

      const unclassified = typeCounts.get("unclassified") || 0;
      element("unclassified").hidden = unclassified === 0;
      element("unclassified").textContent = "另有 " + formatNumber.format(unclassified) + " 份待分類";
      element("empty").hidden = uploaded.length > 0;
      makeBreakdown(element("entity-types"), entityTypes, graph.nodes);
      makeBreakdown(element("edge-types"), edgeTypes, graph.edges);
      element("status").textContent = periodLabel + "，上傳 " + uploaded.length
        + " 份，歸檔 " + archived.length + " 份。";
    }

    page.querySelector(".case-overview-filters").addEventListener("change", render);
    render();
  };
})(window);
