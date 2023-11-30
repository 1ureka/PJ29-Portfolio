gsap.registerPlugin(CustomEase);

CustomEase.create("set1", "0.455, 0.03, 0.515, 0.955");

$(document).ready(async function () {
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
  const headerBulb = new HeaderBulb(
    { width: 30, height: 30, intensity: 1 },
    { main: "#ea81af", nature: "#8ce197", props: "#ffff7a", scene: "#92e9ff" }
  );
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
    folderSelect.off();

    if (category === "main") {
      await switchGallery("main");

      headerBulb.switchLight("main");
      folderBoxes.show();

      scrollButtons.scrollElement = folderBoxes.element;
      folderSelect.on();
      return;
    }

    await folderBoxes.hide();
    await delay(100);
    await switchGallery(category);
    headerBulb.switchLight(category);

    scrollButtons.scrollElement = gallery[category].element;
    folderSelect.on();
  });

  //
  // 創建排序選單
  const sortSelect = new SortSelect();
  sortSelect.appendTo("#sidebar");

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
    folderSelect.off();

    await folderBoxes.hide();
    await switchGallery(category);

    headerBulb.switchLight(category);

    scrollButtons.scrollElement = gallery[category].element;
    folderSelect.open().on();
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
      await delay(50);
      await gallery[category].hide();
      await enterPreviewMenu();
      previewImage.show(e.attr("src"), category);
    });
  });

  //
  // 創建內容
  const previewImage = new PreviewImage();
  previewImage.appendTo("#content");

  //
  // 創建預覽時的選單按鈕
  const previewButtons = new PreviewButtons();
  previewButtons.appendTo("#sidebar").onSelect(async (e) => {
    const targetClass = $(e.target).attr("class");
    const category = previewImage.category;

    if (targetClass === "return-button") {
      await previewImage.hide();
      await gallery[category].show();
      leavePreviewMenu();
    }
  });

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
      folderSelect.hide(),
      sortSelect.hide(),
      scrollButtons.hide(),
    ]);
    previewButtons.show();
  };
  const leavePreviewMenu = async () => {
    await previewButtons.hide();
    scrollButtons.show();
    folderSelect.show();
    sortSelect.show();
  };

  //
  // 開場動畫
  const t1 = gsap
    .timeline({ defaults: { ease: "power2.out", duration: 0.4 } })
    .to("#loading-container", { scale: 0.5, ease: "back.in(6)" })
    .to("#loading-container", { autoAlpha: 0, duration: 0.6 }, "<")
    .to("#progress-bar", { autoAlpha: 0, y: 5, duration: 0.6 }, "<");

  const t2 = gsap
    .timeline({ defaults: { ease: "power2.out", duration: 0.6 } })
    .to("#header, #sidebar, #version-display", { x: 0, y: 0, stagger: 0.35 });

  const t3 = gsap
    .timeline({ defaults: { ease: "power2.out", duration: 0.6 } })
    .to("body", { onStart: () => folderBoxes.show(), duration: 0.65 })
    .to("body", { onStart: () => scrollButtons.show(), duration: 0.65 }, "<");

  const opening = gsap.timeline({
    onComplete: () => {
      $("#loading-container").remove();
      headerBulb.switchLight("main");
    },
    delay: 1,
    paused: true,
  });

  opening.add(t1).add(t2).add(t3, "<0.6").play();
});
