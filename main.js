gsap.registerPlugin(CustomEase);

CustomEase.create("set1", "0.455, 0.03, 0.515, 0.955");

$(document).ready(async function () {
  let inTransition = true;

  const loadManager = new LoadManager();
  loadManager.onProgress((log) => {
    $("#loading-message").text(log.name);
    $("#progress-bar").css("width", `${log.state}%`);
  });
  await loadManager.load();

  //
  // 創建上下按鈕
  const scrollButtons = new ScrollButtons();
  scrollButtons.appendTo("body");

  //
  // 創建搜尋欄
  const searchBar = new SearchBar();
  searchBar
    .appendTo("#header")
    .onInput(() => {
      console.log("input", searchBar.input);
      headerBulb.flickerLight();
    })
    .onClear(() => {
      console.log("clear");
      headerBulb.flickerLight();
    });

  //
  // 創建header右方燈泡
  const headerBulb = new HeaderBulb({
    main: "#ea81af",
    nature: "#8ce197",
    props: "#ffff7a",
    scene: "#92e9ff",
  });
  headerBulb.appendTo("#header");

  //
  // 創建側邊攔 - 資料夾選單
  const folderSelect = new FolderSelect([
    { label: "作品集", category: "main" },
    { label: "自然", category: "nature" },
    { label: "物件", category: "props" },
    { label: "場景", category: "scene" },
  ]);
  folderSelect.appendTo("#sidebar").onSelect(async (category) => {
    if (inTransition) {
      console.log("停止執行了folderSelect.onSelect");
      return;
    }

    inTransition = true;

    if (category === "main") {
      await switchGallery("main");

      headerBulb.switchLight("main");
      folderBoxes.show();

      scrollButtons.scrollElement = folderBoxes.element;

      inTransition = false;
      return;
    }

    await folderBoxes.hide();
    await delay(100);
    await switchGallery(category);
    headerBulb.switchLight(category);

    scrollButtons.scrollElement = gallery[category].element;

    inTransition = false;
  });

  //
  // 創建排序選單
  const sortSelect = new SortSelect();
  sortSelect.appendTo("#sidebar");

  //
  // 創建設定選單 - 選項
  const settingSelect = new SettingSelect();
  settingSelect.appendTo("#sidebar");

  //
  // 創建內容
  const folderBoxes = new FolderBoxes([
    {
      bulbColor: "#8ce197",
      bulbIntensity: 1,
      label: "自然",
      img: loadManager.getImage("nature", 0),
      category: "nature",
    },
    {
      bulbColor: "#ffff7a",
      bulbIntensity: 1,
      label: "物件",
      img: loadManager.getImage("props", 0),
      category: "props",
    },
    {
      bulbColor: "#92e9ff",
      bulbIntensity: 1,
      label: "場景",
      img: loadManager.getImage("scene", 0),
      category: "scene",
    },
  ]);
  folderBoxes.appendTo("#content").onSelect(async (category) => {
    if (inTransition) {
      console.log("停止執行了folderBoxes.onSelect");
      return;
    }

    inTransition = true;

    await folderBoxes.hide();
    await switchGallery(category);

    headerBulb.switchLight(category);

    scrollButtons.scrollElement = gallery[category].element;
    folderSelect.open();

    inTransition = false;
  });

  //
  // 創建內容
  /** @type {{ [key: string]: Gallery }} */
  const gallery = {};
  const categories = ["nature", "props", "scene"];

  categories.forEach((category) => {
    // 取得相應類別的圖片數組，並使用 map 處理每個圖片對象，提取出 JQuery 對象
    const imageArray = loadManager.getImageArray(category);
    const urlArray = imageArray.map((obj) => obj.src);

    gallery[category] = new Gallery(urlArray);

    gallery[category].onSelect(async (e) => {
      if (inTransition) {
        console.log("停止執行了gallery.onSelect");
        return;
      }

      inTransition = true;

      const url = e.attr("src");
      const index = e.parent().index();

      await delay(50);
      await gallery[category].hide();
      await enterPreviewMenu();

      lightBox.show(index, gallery[category].urls);
      previewImage.show(url, category);
      imageName.show(findImageName(url));

      inTransition = false;
    });
  });

  //
  // 創建內容
  const previewImage = new PreviewImage();
  previewImage.appendTo("#content").onClose(async () => {
    if (inTransition) {
      console.log("停止執行了previewImage.onClose");
      return;
    }
    inTransition = true;

    await Promise.all([delay(100), previewImage.switchMode()]);
    await previewImage.hideCloseButton();

    showFullContentsTl.reverse();

    inTransition = false;
  });

  //
  // 創建預覽時的選單按鈕
  const previewButtons = new PreviewButtons();
  previewButtons.appendTo("#sidebar").onSelect(async (e) => {
    if (inTransition) {
      console.log("停止執行了previewButtons.onSelect");
      return;
    }

    inTransition = true;

    const targetClass = $(e.target).attr("class");
    const category = previewImage.category;

    if (targetClass === "return-button") {
      await previewImage.hide();
      await gallery[category].show();

      await leavePreviewMenu();
      scrollButtons.scrollElement = gallery[category].element;
    }

    if (targetClass === "fullscreen-button") {
      showFullContentsTl.play();
      showFullContentsTl.eventCallback("onComplete", null);
      await new Promise((resolve) => {
        showFullContentsTl.eventCallback("onComplete", resolve);
      });

      previewImage.switchMode();
      previewImage.showCloseButton();
    }

    inTransition = false;
  });

  //
  // 創建內容
  const lightBox = new LightBox();

  //
  // 創建內容
  const imageName = new ImageName();
  imageName.appendTo("#header");

  //
  // 過場
  const switchGallery = async (category) => {
    const keys = Object.keys(gallery);

    if (category === "main")
      await Promise.all(keys.map((key) => gallery[key].hide()));

    await Promise.all(keys.map((key) => gallery[key].toggle(category === key)));
  };
  const enterPreviewMenu = async () => {
    await Promise.all([
      scrollButtons.hide(),
      settingSelect.hide(),
      folderSelect.hide(),
      sortSelect.hide(),
      searchBar.hide(),
    ]);
    previewButtons.show();
  };
  const leavePreviewMenu = async () => {
    await Promise.all([
      previewButtons.hide(),
      imageName.hide(),
      lightBox.hide(),
    ]);
    scrollButtons.show();
    settingSelect.show();
    folderSelect.show();
    sortSelect.show();
    searchBar.show();
  };

  //
  // 全局動畫
  const showFullContentsTl = gsap
    .timeline({ defaults: { ease: "set1", duration: 0.75 }, paused: true })
    .to("#content", { top: 0, left: 0 })
    .to("#header", { y: -110 }, "<")
    .to("#sidebar", { x: -300 }, "<")
    .to("#version-display", { y: 60 }, "<");

  const hideLoadingTl = gsap
    .timeline({ defaults: { ease: "power2.out", duration: 0.4 } })
    .to("#loading-container", { scale: 0.5, ease: "back.in(6)" })
    .to("#loading-container", { autoAlpha: 0, duration: 0.6 }, "<")
    .to("#progress-bar", { autoAlpha: 0, y: 5, duration: 0.6 }, "<");

  const showMenuTl = gsap
    .timeline({ defaults: { ease: "power2.out", duration: 0.6 } })
    .to("#header, #sidebar, #version-display", { x: 0, y: 0, stagger: 0.35 });

  const showDefaultsComponentsTl = gsap
    .timeline({ defaults: { ease: "power2.out", duration: 0.6 } })
    .to("body", { onStart: () => folderBoxes.show(), duration: 0.65 })
    .to("body", { onStart: () => scrollButtons.show(), duration: 0.65 }, "<");

  const opening = gsap.timeline({
    onComplete: () => {
      $("#loading-container").remove();
      headerBulb.switchLight("main");

      inTransition = false;
    },
    delay: 1,
    paused: true,
  });

  opening
    .add(hideLoadingTl)
    .add(showMenuTl)
    .add(showDefaultsComponentsTl, "<0.6")
    .play();
});
