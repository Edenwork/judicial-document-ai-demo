(function (global) {
  "use strict";

  const App = global.JudicialApp;
  const kinds = [
    { label: "函", color: "var(--color-brand-800)" },
    { label: "簽", color: "var(--color-brand-600)" },
    { label: "稿", color: "var(--color-success-500)" },
    { label: "其他", color: "var(--color-status-processing)" },
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

    function renderDistribution(uploaded) {
      const total = uploaded.length;
      const counts = new Map();
      uploaded.forEach(function (file) {
        counts.set(file.kind, (counts.get(file.kind) || 0) + 1);
      });

      const stops = [];
      let cumulativeCount = 0;
      const entries = kinds.map(function ({ label, color }) {
        const count = counts.get(label) || 0;
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
        value.textContent = formatNumber.format(count) + " 份 · " + formatPercent.format(ratio);
        item.append(swatch, name, value);
        return item;
      });

      const donut = element("donut");
      donut.style.backgroundImage = stops.length ? "conic-gradient(" + stops.join(", ") + ")" : "";
      element("donut-total").textContent = formatNumber.format(total);
      element("legend").replaceChildren(...entries);
      element("empty").hidden = total > 0;
    }

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
      const periodLabel = year.value + " 年"
        + (granularity === "year" ? "" : " " + month.value + " 月")
        + (granularity === "day" ? " " + day.value + " 日" : "");

      const uploaded = documents.filter((file) => file.uploadedAt.startsWith(period));
      const archiveCount = uploaded.filter((file) => file.archived).length;
      const uploadDisplay = formatNumber.format(uploaded.length);
      const archiveDisplay = formatNumber.format(archiveCount);
      element("period").textContent = periodLabel;
      element("upload-count").textContent = uploadDisplay;
      element("archive-count").textContent = archiveDisplay;
      element("status").textContent = periodLabel + "，上傳 " + uploadDisplay
        + " 份，已歸檔 " + archiveDisplay + " 份。";
      renderDistribution(uploaded);
    }

    page.querySelector(".case-overview-filters").addEventListener("change", render);
    render();
  };
})(window);
