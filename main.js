gsap.registerPlugin(ScrollTrigger);

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
  scrollButtons
    .appendTo("body")
    .onUp((e) => {
      console.log($(e.currentTarget).attr("class"));
    })
    .onDown((e) => {
      console.log($(e.currentTarget).attr("class"));
    });

  //
  // 創建搜尋欄
  const searchBar = new SearchBar();
  searchBar
    .appendTo("#header")
    .onInput(() => {
      console.log("input", searchBar.input);
    })
    .onClear(() => {
      console.log("clear");
    });

  //
  // 創建header右方燈泡
  const headerBulb = new HeaderBulb({
    width: 30,
    height: 30,
    intensity: 1,
  });
  headerBulb.appendTo("#header");

  //
  // 創建側邊攔 - 資料夾選單
  const folderSelect = new FolderSelect({
    mainFolder: "作品集",
    subFolders: ["自然", "物件", "場景"],
  });
  folderSelect.appendTo("#sidebar").onSelect((label) => {
    switch (label) {
      case "作品集":
        headerBulb.switchLight("red");
        switchGallery("hide");
        folderBoxes.show();
        break;
      case "自然":
        headerBulb.switchLight("green");
        folderBoxes.hide();
        switchGallery("nature");
        break;
      case "物件":
        headerBulb.switchLight("yellow");
        folderBoxes.hide();
        switchGallery("props");
        break;
      case "場景":
        headerBulb.switchLight("blue");
        folderBoxes.hide();
        switchGallery("scene");
        break;
    }
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
    },
    {
      bulbColor: "#ffff7a",
      bulbIntensity: 1,
      label: "物件",
      img: loadManager.getImage("props", 0),
    },
    {
      bulbColor: "#92e9ff",
      bulbIntensity: 1,
      label: "場景",
      img: loadManager.getImage("scene", 0),
    },
  ]);
  folderBoxes.appendTo("#content").onSelect((label) => {
    folderBoxes.hide();
    folderSelect.open();
    // 之後這裡要有then

    switch (label) {
      case "自然":
        headerBulb.switchLight("green");
        switchGallery("nature");
        break;
      case "物件":
        headerBulb.switchLight("yellow");
        switchGallery("props");
        break;
      case "場景":
        headerBulb.switchLight("blue");
        switchGallery("scene");
        break;
    }
  });

  //
  // 創建內容
  const gallery = {};
  const categories = ["nature", "props", "scene"];

  categories.forEach((category) => {
    // 取得相應類別的圖片數組
    const imageArray = loadManager.getImageArray(category);
    // 使用 map 處理每個圖片對象，提取出 JQuery 對象
    const jqueryArray = imageArray.map((obj) => obj.JQuery);

    gallery[category] = new Gallery(jqueryArray);
    gallery[category].appendTo("#content");
  });

  const switchGallery = (e) => {
    const keys = Object.keys(gallery);

    if (e === "hide") keys.forEach((key) => gallery[key].hide());

    keys.forEach((key) => gallery[key].toggle(e === key));
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
      headerBulb.switchLight("red");
    },
    delay: 1,
    paused: true,
  });

  opening.add(t1).add(t2).add(t3, "<0.6").play();
});
