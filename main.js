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
});
