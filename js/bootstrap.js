(function (global) {
  "use strict";

  const App = global.JudicialApp;
  const initialPage = new URLSearchParams(location.search).get("page");

  App.initCore();
  App.initFileList();
  App.initUploadStatus();
  App.initUpload();
  App.initReview();
  App.initSearch();
  App.initRelations();
  App.initReports();
  App.initSupervisor();
  App.initAdmin();

  if (initialPage && App.pageMeta[initialPage]) {
    App.goToPage(initialPage);
  }
  App.renderIcons();
})(window);
