gsap.registerPlugin(ScrollTrigger);

gsap.registerPlugin(CustomEase);

CustomEase.create("set1", "0.455, 0.03, 0.515, 0.955");

$(document).ready(function () {
  const scrollButtonUp = createScrollButton({ type: "up" });
  const scrollButtonDown = createScrollButton({ type: "down" });
  $("#scroll-buttons-container").append(scrollButtonUp, scrollButtonDown);

  const searchBar = createSearchBar();
  $("#header").append(searchBar);
  searchBar
    .custom((e) => console.log("hi", e))
    .custom(() => console.log("hi2"));
});
