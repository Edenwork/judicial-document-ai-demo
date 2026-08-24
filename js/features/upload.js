(function (global) {
  "use strict";

  const App = global.JudicialApp;
  const processingStages = [
    "文件上傳",
    "文件解析",
    "OCR 文字辨識",
    "AI 欄位擷取",
    "摘要與標籤產生",
    "關聯案件分析",
    "處理完成",
  ];
  const sampleFiles = [
    { name: "日本銀行交易紀錄調取請求書.pdf", size: "2.8 MB" },
    { name: "加拿大電子郵件證據保全請求書.pdf", size: "1.9 MB" },
    { name: "法國公司實質受益人資料請求書.pdf", size: "3.4 MB" },
  ];

  App.initUpload = function () {
    const fileInput = document.getElementById("fileInput");
    const dropzone = document.getElementById("dropzone");
    const queueContainer = document.getElementById("uploadQueue");
    const startButton = document.getElementById("startProcess");
    const caseNumberInput = document.getElementById("uploadCaseNumber");
    const countryInput = document.getElementById("uploadCountry");
    let queue = [];

    function updateStartButton() {
      const hasCaseData = caseNumberInput.value.trim() && countryInput.value.trim();
      startButton.disabled = !queue.length || !hasCaseData;
    }

    function formatFileSize(size) {
      return size ? (size / 1024 / 1024).toFixed(1) + " MB" : "2.1 MB";
    }

    function renderQueue() {
      if (!queue.length) {
        queueContainer.innerHTML = '<div class="empty-state">尚未選擇文件</div>';
        updateStartButton();
        return;
      }

      queueContainer.innerHTML = queue
        .map(function (file, index) {
          return (
            '<div class="queue-row">' +
            '<div class="file-name"><i data-lucide="file-text"></i><span>' + file.name + "</span></div>" +
            '<span class="subtle">' + file.size + "</span>" +
            '<div><div class="progress-thin"><span class="file-progress"></span></div><small class="subtle file-stage">等待處理</small></div>' +
            '<button class="icon-btn remove-file" data-index="' + index + '" type="button" aria-label="移除文件"><i data-lucide="x"></i></button>' +
            "</div>"
          );
        })
        .join("");

      queueContainer.querySelectorAll(".remove-file").forEach(function (button) {
        button.addEventListener("click", function () {
          queue.splice(Number(button.dataset.index), 1);
          renderQueue();
        });
      });

      updateStartButton();
      App.renderIcons();
    }

    function addFiles(fileList) {
      Array.from(fileList).forEach(function (file) {
        queue.push({ name: file.name, size: formatFileSize(file.size) });
      });
      renderQueue();
    }

    function renderProcessingStages() {
      document.getElementById("stageList").innerHTML = processingStages
        .map(function (stage, index) {
          return '<div class="stage-item"><span class="stage-dot">' + (index + 1) + "</span><span>" + stage + "</span></div>";
        })
        .join("");
    }

    function startProcessing() {
      const processCard = document.getElementById("processCard");
      const statusSection = document.getElementById("uploadStatusSection");
      const filesBeingProcessed = queue.map(function (file) {
        return Object.assign({}, file);
      });
      const total = queue.length;
      let stageIndex = 0;

      startButton.disabled = true;
      processCard.classList.add("show");
      processCard.scrollIntoView({ behavior: "smooth", block: "center" });
      renderProcessingStages();
      document.getElementById("processCount").textContent = "0 / " + total;
      App.uploadStatus.upsertFiles(filesBeingProcessed, "processing", processingStages[0], 5);

      const timer = global.setInterval(function () {
        document.querySelectorAll(".stage-item").forEach(function (item, index) {
          item.classList.toggle("done", index < stageIndex);
          item.classList.toggle("active", index === stageIndex);
          if (index < stageIndex) item.querySelector(".stage-dot").textContent = "✓";
        });

        const progress = Math.min(100, Math.round(((stageIndex + 0.35) / processingStages.length) * 100));
        const activeStage = processingStages[Math.min(stageIndex, processingStages.length - 1)];
        document.getElementById("overallProgress").style.width = progress + "%";
        document.getElementById("processCaption").textContent = activeStage + "...";
        document.getElementById("processCount").textContent = Math.min(total, Math.floor((progress / 100) * total)) + " / " + total;

        document.querySelectorAll(".file-progress").forEach(function (bar, index) {
          bar.style.width = Math.max(0, Math.min(100, progress - index * 7)) + "%";
        });
        document.querySelectorAll(".file-stage").forEach(function (label) {
          label.textContent = activeStage;
        });
        App.uploadStatus.upsertFiles(filesBeingProcessed, "processing", activeStage, progress);

        stageIndex += 1;
        if (stageIndex <= processingStages.length) return;

        global.clearInterval(timer);
        document.getElementById("overallProgress").style.width = "100%";
        document.getElementById("processCount").textContent = total + " / " + total;
        document.getElementById("processCaption").textContent = "全部文件處理完成";
        App.uploadStatus.upsertFiles(filesBeingProcessed, "completed", "處理完成", 100);
        App.showToast("AI 已完成 " + total + " 份文件的初步處理。");
        if (statusSection) {
          global.setTimeout(function () {
            statusSection.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 900);
        }
      }, 700);
    }

    document.getElementById("chooseFiles").addEventListener("click", function (event) {
      event.stopPropagation();
      fileInput.click();
    });
    dropzone.addEventListener("click", function () {
      fileInput.click();
    });
    dropzone.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        fileInput.click();
      }
    });
    fileInput.addEventListener("change", function () {
      addFiles(fileInput.files);
    });
    document.getElementById("addSamples").addEventListener("click", function () {
      queue = sampleFiles.map(function (file) {
        return Object.assign({}, file);
      });
      renderQueue();
    });
    [caseNumberInput, countryInput].forEach(function (input) {
      input.addEventListener("input", updateStartButton);
    });

    ["dragenter", "dragover"].forEach(function (eventName) {
      dropzone.addEventListener(eventName, function (event) {
        event.preventDefault();
        dropzone.classList.add("dragging");
      });
    });
    ["dragleave", "drop"].forEach(function (eventName) {
      dropzone.addEventListener(eventName, function (event) {
        event.preventDefault();
        dropzone.classList.remove("dragging");
      });
    });
    dropzone.addEventListener("drop", function (event) {
      addFiles(event.dataTransfer.files);
    });
    startButton.addEventListener("click", startProcessing);
  };
})(window);
