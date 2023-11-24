gsap.registerPlugin(ScrollTrigger);

gsap.registerPlugin(CustomEase);

CustomEase.create("set1", "0.455, 0.03, 0.515, 0.955");

$(document).ready(function () {
  // 創建上下按鈕
  const scrollButtonUp = createScrollButton({ type: "up" });
  const scrollButtonDown = createScrollButton({ type: "down" });
  $("#scroll-buttons-container").append(scrollButtonUp, scrollButtonDown);

  // 創建搜尋欄
  const searchBar = createSearchBar()
    .onCleared(() => {
      searchBar.find("input").val("");
    })
    .appendTo("#header");

  // 創建header右方燈泡
  const headerBulb = new HeaderBulb({ width: 30, height: 30, intensity: 1 });
  headerBulb.appendTo("#header");
  headerBulb.switchLight("red");

  // 創建側邊攔 - 資料夾選單
  const folderSelect = new FolderSelect({
    mainFolder: "作品集",
    subFolders: ["自然", "物件", "場景"],
  });
  folderSelect.appendTo("#sidebar");
  folderSelect.onSelect((label) => {
    console.log(label);
  });

  // 創建內容
  const folderbox1 = new FolderBox({ bulbColor: "#8ce197", label: "自然" });
  const folderbox2 = new FolderBox({ bulbColor: "#ffff7a", label: "物件" });
  const folderbox3 = new FolderBox({ bulbColor: "#92e9ff", label: "場景" });
  folderbox1.appendTo("#content");
  folderbox2.appendTo("#content");
  folderbox3.appendTo("#content");
});
