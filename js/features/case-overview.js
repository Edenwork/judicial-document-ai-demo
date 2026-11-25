(function (global) {
  "use strict";

  const App = global.JudicialApp;
  const kinds = [
    { label: "函", color: "var(--color-brand-800)" },
    { label: "簽", color: "var(--color-brand-600)" },
    { label: "稿", color: "var(--color-success-500)" },
    { label: "其他", color: "var(--color-status-processing)" },
  ];
  const entityKinds = [
    { label: "人", color: "var(--color-brand-600)" },
    { label: "事", color: "var(--color-status-processing)" },
    { label: "時", color: "var(--color-text-muted)" },
    { label: "地", color: "var(--color-success-700)" },
  ];
  const formatNumber = new Intl.NumberFormat("zh-TW");
  const formatPercent = new Intl.NumberFormat("zh-TW", { style: "percent", maximumFractionDigits: 1 });

  // 每列為上傳日期、函／簽／稿／其他的上傳件數，以及這批目前已歸檔的件數。
  const demoBatches = [
    ["2025-12-19", [12, 6, 3, 4], 21],
    ["2026-09-10", [14, 5, 4, 5], 26],
    ["2026-10-15", [24, 11, 7, 9], 49],
    ["2026-10-29", [17, 6, 4, 5], 29],
    ["2026-11-04", [20, 9, 5, 6], 37],
    ["2026-11-12", [22, 12, 6, 5], 40],
    ["2026-11-20", [17, 8, 6, 4], 30],
    ["2026-11-25", [12, 6, 4, 7], 4],
  ];
  const documents = demoBatches.flatMap(function ([uploadedAt, quantities, archiveCount]) {
    const batch = quantities.flatMap(function (quantity, kindIndex) {
      return Array.from({ length: quantity }, () => ({ uploadedAt, kind: kinds[kindIndex].label }));
    });
    return batch.map((file, index) => ({ ...file, archived: index < archiveCount }));
  });
  const latestDate = demoBatches.at(-1)[0];

  // 圖譜示範快照為截至當日的去重總數，與文件歸檔各自統計。
  const graphSnapshots = [
    { date: "2025-12-22", main: 5, child: 17, entities: [8, 4, 3, 2], confirmed: 20, belongs: 17 },
    { date: "2026-09-14", main: 11, child: 37, entities: [16, 9, 6, 4], confirmed: 45, belongs: 37 },
    { date: "2026-10-19", main: 19, child: 71, entities: [31, 18, 11, 7], confirmed: 85, belongs: 71 },
    { date: "2026-11-02", main: 25, child: 94, entities: [40, 24, 15, 9], confirmed: 110, belongs: 94 },
    { date: "2026-11-06", main: 31, child: 120, entities: [48, 29, 18, 11], confirmed: 144, belongs: 120 },
    { date: "2026-11-16", main: 38, child: 149, entities: [57, 34, 21, 13], confirmed: 180, belongs: 149 },
    { date: "2026-11-25", main: 44, child: 173, entities: [64, 38, 24, 16], confirmed: 213, belongs: 173 },
  ];
  const emptyGraph = { main: 0, child: 0, entities: [0, 0, 0, 0], confirmed: 0, belongs: 0 };

  function datePart(number) {
    return String(number).padStart(2, "0");
  }

  function daysInMonth(year, month) {
    return new Date(Date.UTC(year, month, 0)).getUTCDate();
  }

  function setOptions(select, values, unit, selected) {
    select.replaceChildren(...values.map((value) => new Option(value + unit, value)));
    select.value = selected;
  }

  App.initCaseOverview = function () {
    const page = document.getElementById("page-case-overview");
    if (!page) return;

    const element = (suffix) => page.querySelector("#case-overview-" + suffix);
    const filters = page.querySelector(".case-overview-filters");
    const selectedGranularity = () => filters.querySelector('input[name="case-overview-granularity"]:checked').value;
    const year = element("year");
    const month = element("month");
    const day = element("day");
    const rangeStart = element("range-start");
    const rangeEnd = element("range-end");
    const rangeError = element("range-error");
    rangeStart.value = latestDate.slice(0, 7) + "-01";
    rangeEnd.value = latestDate;
    const latestParts = latestDate.split("-").map(Number);
    const firstYear = Number(demoBatches[0][0].slice(0, 4));
    const years = Array.from({ length: latestParts[0] - firstYear + 1 }, (_, index) => latestParts[0] - index);
    const range = (length) => Array.from({ length }, (_, index) => index + 1);
    setOptions(year, years, "年", latestParts[0]);
    setOptions(month, range(12), "月", latestParts[1]);
    let previousDayCount = 0;

    function renderDistribution(prefix, categories, counts, unit) {
      const total = counts.reduce((sum, count) => sum + count, 0);
      const stops = [];
      let cumulativeCount = 0;
      const entries = categories.map(function ({ label, color }, index) {
        const count = counts[index];
        const ratio = total ? count / total : 0;
        if (count > 0) {
          const start = cumulativeCount / total * 100;
          cumulativeCount += count;
          const end = cumulativeCount / total * 100;
          stops.push(color + " " + start + "% " + end + "%");
        }

        const item = document.createElement("li");
        const swatch = document.createElement("span");
        const name = document.createElement("span");
        const value = document.createElement("strong");
        swatch.className = "case-overview-swatch";
        swatch.style.backgroundColor = color;
        swatch.setAttribute("aria-hidden", "true");
        name.textContent = label;
        value.textContent = formatNumber.format(count) + " " + unit + " · " + formatPercent.format(ratio);
        item.append(swatch, name, value);
        return item;
      });

      const donut = element(prefix + "donut");
      donut.style.backgroundImage = stops.length ? "conic-gradient(" + stops.join(", ") + ")" : "";
      element(prefix + "donut-total").textContent = formatNumber.format(total);
      element(prefix + "legend").replaceChildren(...entries);
      element(prefix + "empty").hidden = total > 0;
    }

    function setRangeError(message) {
      const hasError = Boolean(message);
      rangeError.hidden = !hasError;
      rangeError.textContent = message;
      rangeStart.setAttribute("aria-invalid", String(hasError));
      rangeEnd.setAttribute("aria-invalid", String(hasError));
    }

    function syncDateFields() {
      const granularity = selectedGranularity();
      const isRange = granularity === "range";
      element("calendar-fields").hidden = isRange;
      element("range-fields").hidden = !isRange;
      element("month-field").hidden = granularity === "year";
      element("day-field").hidden = granularity !== "day";

      const dayCount = daysInMonth(Number(year.value), Number(month.value));
      if (dayCount !== previousDayCount) {
        const selectedDay = Number(day.value) || latestParts[2];
        setOptions(day, range(dayCount), "日", Math.min(selectedDay, dayCount));
        previousDayCount = dayCount;
      }
      setRangeError("");
    }

    function render() {
      const granularity = selectedGranularity();
      const dayCount = daysInMonth(Number(year.value), Number(month.value));
      const monthPrefix = year.value + "-" + datePart(month.value);
      const date = monthPrefix + "-" + datePart(day.value);
      const bounds = {
        year: [year.value + "-01-01", year.value + "-12-31", year.value + " 年"],
        month: [monthPrefix + "-01", monthPrefix + "-" + datePart(dayCount), year.value + " 年 " + month.value + " 月"],
        day: [date, date, year.value + " 年 " + month.value + " 月 " + day.value + " 日"],
        range: [rangeStart.value, rangeEnd.value, rangeStart.value.replaceAll("-", "/") + " ～ " + rangeEnd.value.replaceAll("-", "/")],
      };
      const [periodStart, periodEnd, periodLabel] = bounds[granularity];
      let error = "";
      if (granularity === "range") {
        if (!periodStart || !periodEnd) error = "請選擇起日與迄日。";
        else if (periodStart > periodEnd) error = "起日須早於或等於迄日。";
      }
      setRangeError(error);
      if (error) return;

      const uploaded = documents.filter((file) => file.uploadedAt >= periodStart && file.uploadedAt <= periodEnd);
      const archiveCount = uploaded.filter((file) => file.archived).length;
      const uploadDisplay = formatNumber.format(uploaded.length);
      const archiveDisplay = formatNumber.format(archiveCount);
      element("period").textContent = periodLabel;
      element("upload-count").textContent = uploadDisplay;
      element("archive-count").textContent = archiveDisplay;
      element("status").textContent = periodLabel + "，上傳 " + uploadDisplay
        + " 份，已歸檔 " + archiveDisplay + " 份。";
      const kindCounts = new Map();
      uploaded.forEach(function (file) {
        kindCounts.set(file.kind, (kindCounts.get(file.kind) || 0) + 1);
      });
      renderDistribution("", kinds, kinds.map(({ label }) => kindCounts.get(label) || 0), "份");

      const graphDate = periodEnd < latestDate ? periodEnd : latestDate;
      const graph = graphSnapshots.findLast(({ date }) => date <= graphDate) || emptyGraph;
      element("graph-period").textContent = "累計至 " + graphDate.replaceAll("-", "/");
      element("main-count").textContent = formatNumber.format(graph.main);
      element("child-count").textContent = formatNumber.format(graph.child);
      element("relation-count").textContent = formatNumber.format(graph.confirmed + graph.belongs);
      element("confirmed-count").textContent = formatNumber.format(graph.confirmed);
      element("belongs-count").textContent = formatNumber.format(graph.belongs);
      renderDistribution("entity-", entityKinds, graph.entities, "個");
    }

    filters.addEventListener("change", syncDateFields);
    filters.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
    });
    syncDateFields();
    render();
  };
})(window);
