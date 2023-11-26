gsap.registerPlugin(ScrollTrigger);

gsap.registerPlugin(CustomEase);

CustomEase.create("set1", "0.455, 0.03, 0.515, 0.955");

$(document).ready(async function () {
  // const imageManager = new ImageManager();
  // $("body").css("overflow", "hidden");
  // const p = $("<p>").appendTo("body").text("載入urls: 0%").css({
  //   width: "100vw",
  //   height: "100vh",
  //   backgroundColor: "black",
  //   zIndex: 99,
  //   display: "flex",
  //   alignItems: "center",
  //   justifyContent: "center",
  // });
  // imageManager.onProgress((log) => {
  //   p.text(log);
  // });
  // await imageManager.load();
  // setTimeout(() => {
  //   p.hide(600);
  //   $("body").css("overflow", "");
  // }, 250);
  // console.log(
  //   imageManager.getImage(
  //     "nature",
  //     "Nature Instance Assets Preview (Green Tree A)"
  //   ),
  //   imageManager.getImage("props", 5),
  //   imageManager.getImageArray("scene")
  // );

  // 創建上下按鈕
  const scrollButtons = new ScrollButtons();
  scrollButtons.appendTo("body");
  scrollButtons
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
  const headerBulb = new HeaderBulb({ width: 30, height: 30, intensity: 1 });
  headerBulb.appendTo("#header");
  headerBulb.switchLight("red");

  // 創建側邊攔 - 資料夾選單
  const folderSelect = new FolderSelect({
    mainFolder: "作品集",
    subFolders: ["自然", "物件", "場景"],
  });
  folderSelect.appendTo("#sidebar").onSelect((label) => {
    console.log("folderSelect", label);
  });

  //
  // 創建內容
  const folderBoxes = new FolderBoxes([
    { bulbColor: "#8ce197", bulbIntensity: 1, label: "自然" },
    { bulbColor: "#ffff7a", bulbIntensity: 1, label: "物件" },
    { bulbColor: "#92e9ff", bulbIntensity: 1, label: "場景" },
  ]);
  folderBoxes
    .appendTo("#content")
    .onSelect((choose) => console.log("folderBoxes", choose));

  // 之後移到正確地方
  const sortSelect = new SortSelect();
  sortSelect.appendTo("#sidebar");

  const id = "#header, #sidebar, #version-display";
  gsap
    .timeline({ defaults: { ease: "power2.out", duration: 0.6 } })
    .to("#loading-container", {
      delay: 1,
      scale: 0.25,
      ease: "back.in(6)",
    })
    .to("#loading-container", { autoAlpha: 0 }, "<")
    .to("progress", { autoAlpha: 0, y: 5 }, "<")
    .to(id, { x: 0, y: 0, stagger: 0.35 }, "<")
    .to("body", { onStart: () => folderBoxes.show(), duration: 0.65 }, "<0.6")
    .then(() => {
      gsap.set("body", { overflowY: "auto" });
      $("#loading-container").remove();
    });
});
