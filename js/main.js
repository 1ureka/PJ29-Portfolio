$(document).ready(async function () {
  //設定動畫預設屬性
  gsap.defaults({ overwrite: "auto" });

  //取得urls
  const urls = await loadImageUrls();

  //紀錄目前畫面狀態
  let isIndex = false;
  let isGallery = false;
  let isPreview = false;
  let isFullscreen = false;
  /**
   * 切換畫面 @param {"gallery"|"preview"|"fullscreen"|"index"|"none"} view
   * */
  function switchView(view) {
    switch (view) {
      case "gallery":
        isIndex = false;
        isGallery = true;
        isPreview = false;
        isFullscreen = false;
        break;
      case "preview":
        isIndex = false;
        isGallery = false;
        isPreview = true;
        isFullscreen = false;
        break;
      case "fullscreen":
        isIndex = false;
        isGallery = false;
        isPreview = false;
        isFullscreen = true;
        break;
      case "index":
        isIndex = true;
        isGallery = false;
        isPreview = false;
        isFullscreen = false;
        break;
      case "none":
        isIndex = false;
        isGallery = false;
        isPreview = false;
        isFullscreen = false;
        break;
    }
  }

  /**
   * 設定DOM元素初始CSS(主要是transform)
   * */
  function initialize() {
    // 紀錄需隱藏之元素
    const hiddenGalleryElements =
      ".gallery, .fullscreen-overlay, .back-to-home";
    const hiddenCloseBarElements =
      ".restart-btn, .close-bar .line, .stop-lable-container, .restart-lable-container";
    const hiddenSettingBarElements =
      ".setting-menu, .setting-bar .line, .options-icon, .options-icon img, " +
      ".options-lable, .options-lable > div, .options-animation, .options-animation .option, " +
      ".options-language, .options-language div, .options-color, .options-color .option";
    const hiddenElements =
      hiddenGalleryElements +
      ", " +
      hiddenCloseBarElements +
      ", " +
      hiddenSettingBarElements;
    gsap.set(hiddenElements, { autoAlpha: 0 });

    //
    // 紀錄所有紅色字元素(需要先向上移動隱藏)
    const redLables =
      ".stop-lable-red, .restart-lable-red, .animation-lable-red, .language-lable-red, " +
      ".color-lable-red, .bottom-lable-red, .pause-lable-red, .reverse-lable-red";
    gsap.set(redLables, { y: -40 });

    //
    // 設定元素初始transform
    gsap.set(".animation-btn, .language-btn, color-btn", { scale: 1.15 });
    gsap.set(".bottom-btn", { rotate: 180, scale: 0.9 });
    gsap.set(".prevImage-btn", { rotate: -90 });
    gsap.set(".nextImage-btn", { rotate: 90 });
    gsap.set(".top-btn", { y: 100 });

    //
    // 色彩選項預設值給定
    gsap.set(".color-picker-background > .color-picker-top", {
      backgroundColor: $(".color-picker-background > input").attr("value"),
    });
    gsap.set(".color-picker-interface > .color-picker-top", {
      backgroundColor: $(".color-picker-interface > input").attr("value"),
    });

    //
    // 開頭動畫開始位置
    const contentElements =
      ".title img, .title h1, .search-bar, .setting-bar, .close-bar, .page-btn";
    const titleSetting = {
      margin: 0,
      width: "100%",
      height: "100%",
      borderRadius: "0px",
    };
    const contentElementsSetting = {
      scale: 2,
      y: -100,
      autoAlpha: 0,
    };
    gsap.set(".page-btn-container", { display: "none" });
    gsap.set(".title", titleSetting);
    gsap.set(contentElements, contentElementsSetting);
  }
  initialize();

  /**
   * 製作懸停時間軸物件 @returns {Object.<string, TimelineMax>}
   * */
  function createHoverTimeline() {
    /** 一個用於 GSAP 的對象，包含不同的 Timeline 變數。*/
    const timelines = {};

    /** @param {string} e @return {TimelineMax} */
    function timelineTemplate1(e) {
      const timeline = gsap.timeline({
        paused: true,
        defaults: { duration: 0.2, ease: "set1", overwrite: false },
      });

      timeline.to(`.${e}-btn`, {
        scale: (e) => {
          if (["stop", "restart", "pause", "reverse"].includes(e)) {
            return 1.25;
          } else if (e === "bottom") {
            return 1.15;
          } else {
            return 1.35;
          }
        },
      });

      if (e === "restart") {
        timeline.to(
          `.${e}-btn`,
          {
            rotate: 180,
          },
          "<"
        );
      }

      timeline.to(
        `.${e}-lable-white`,
        {
          y: 40,
        },
        "<"
      );

      timeline.to(
        `.${e}-lable-red`,
        {
          y: 0,
        },
        "<"
      );

      return timeline;
    }
    /** @return {TimelineMax} */
    function timelineTemplate2() {
      return gsap
        .timeline({
          paused: true,
          defaults: { duration: 0.2, ease: "set1", overwrite: false },
        })
        .to(".close-bar", {
          width: "160px",
          height: "120px",
        })
        .to(
          ".close-bar .line",
          {
            autoAlpha: 1,
          },
          "<"
        )
        .to(".restart-btn, .stop-lable-container, .restart-lable-container", {
          stagger: 0.1,
          autoAlpha: 1,
        });
    }
    /** @param {string} e @return {TimelineMax} */
    function timelineTemplate3(e) {
      const timeline = gsap.timeline({
        paused: true,
        defaults: { duration: 0.2, ease: "set1", overwrite: false },
      });

      timeline.to(`.${e}-btn`, {
        scale: (e) => {
          if (["close", "nextImage", "prevImage"].includes(e)) {
            return 1.5;
          } else if (["text-container"].includes(e)) {
            return 1.2;
          } else if (["page-btn-t"].includes(e)) {
            return 1;
          } else {
            return 1.25;
          }
        },
      });

      if (e === "close") {
        timeline.to(
          `.${e}-btn`,
          {
            rotate: 180,
          },
          "<"
        );
      }

      if (["back-to-", "top", "page-btn-t"].includes(e)) {
        timeline.to(
          `.${e}-btn`,
          {
            boxShadow: "0px 0px 24px rgba(0, 0, 0, 1)",
          },
          "<"
        );
      }

      if (e === "text-container") {
        timeline.to(
          `.${e}-btn`,
          {
            color: "#EA81AF",
          },
          "<"
        );
      }

      return timeline;
    }
    /** @param {string} e @return {TimelineMax} */
    function timelineTemplate4(e) {
      return gsap
        .timeline({
          paused: true,
          defaults: { duration: 0.2, ease: "set1", overwrite: false },
        })
        .to(`.${e}`, {
          margin: "0 30px 0 30px",
          padding: "0 0 0 0",
          scale: 1.25,
        });
    }
    /** @param {string} e @return {TimelineMax} */
    function timelineTemplate5(e) {
      const timeline = gsap.timeline({
        paused: true,
        defaults: { duration: 0.2, ease: "set1" },
      });

      if (
        [
          "back-to-home",
          "text-container div",
          "english",
          "japanese",
          "chinese",
        ].includes(e)
      ) {
        timeline.to(`.${e}`, {
          scale: 1.25,
        });
      }

      if (
        [
          "back-to-home",
          "page-btn-title[data-image='Nature']",
          "page-btn-title[data-image='Props']",
          "page-btn-title[data-image='Scene']",
        ].includes(e)
      ) {
        timeline.to(
          `.${e}`,
          {
            boxShadow: "0px 0px 24px rgba(0, 0, 0, 1)",
          },
          "<"
        );
      }

      if (
        ["text-container div", , "english", "japanese", "chinese"].includes(e)
      ) {
        timeline.to(
          `.${e}`,
          {
            color: "#ea81af",
          },
          "<"
        );
      }

      return timeline;
    }

    const elementsUsingT1 = [
      "stop-btn",
      "restart-btn",
      "animation-btn",
      "language-btn",
      "color-btn",
      "bottom-btn",
      "pause-btn",
      "reverse-btn",
    ];
    const elementsUsingT2 = ["close-bar"];
    const elementsUsingT3 = [
      "setting-btn",
      "search-btn",
      "top-btn",
      "close-btn",
      "nextImage-btn",
      "prevImage-btn",
    ];
    const elementsUsingT4 = [
      "page-btn.Nature",
      "page-btn.Props",
      "page-btn.Scene",
    ];
    const elementsUsingT5 = [
      "page-btn-title[data-image='Nature']",
      "page-btn-title[data-image='Props']",
      "page-btn-title[data-image='Scene']",
      "back-to-home",
      "text-container div",
      "english",
      "japanese",
      "chinese",
    ];

    elementsUsingT1.map(
      (currentValue) =>
        (timelines[currentValue] = timelineTemplate1(currentValue.slice(0, -4)))
    );
    elementsUsingT2.map(
      (currentValue) => (timelines[currentValue] = timelineTemplate2())
    );
    elementsUsingT3.map(
      (currentValue) =>
        (timelines[currentValue] = timelineTemplate3(currentValue.slice(0, -4)))
    );
    elementsUsingT4.map(
      (currentValue) =>
        (timelines[currentValue] = timelineTemplate4(currentValue))
    );
    elementsUsingT5.map(
      (currentValue) =>
        (timelines[currentValue] = timelineTemplate5(currentValue))
    );

    return timelines;
  }
  /**
   * 應用懸停時間軸 @param {Object.<string, TimelineMax>} timelines
   * */
  function applyHoverEffect(timelines) {
    for (const key in timelines) {
      $(`.${key}`).hover(
        () => timelines[key].play(),
        () => timelines[key].reverse()
      );
    }
  }
  applyHoverEffect(createHoverTimeline());
  /**
   * 製作點擊時間軸動畫 @param {JQuery} element
   */
  function createClickTimeline(element) {
    return gsap.timeline().to(element, {
      keyframes: [
        { y: 25, duration: 0.2, ease: "expo.out" },
        { y: 0, duration: 0.2, ease: "expo.out" },
      ],
    });
  }

  /**
   * 插入圖片至指定容器 @param {JQuery} container  @param {string[]} list
   */
  function insertImages(container, list) {
    $.each(list, (index) => {
      const img = $("<img>").attr("src", list[index]);
      img.appendTo(container);
    });
  }
  /**
   * 建立背景動畫 @returns {TimelineMax}
   * */
  function createBackgroundAnimation() {
    // 背景旋轉15度
    gsap.set(".moving-images-container", { rotate: 15 });
    // 隨機排序jpgUrl陣列
    gsap.utils.shuffle(urls.jpgUrl);
    // 將陣列分成四份，以特定順序放進四格移動牆，因此絕對不會重複
    // 圖片會從最左邊一路往右逐次出現，直到再次回來，由於1/4的總圖片高度大於畫面高度
    // 因此會有再次出現間隔時間=(1/4)*總圖片高度-畫面可以呈現的總圖片高度
    // 由於移動牆從左到右分別是往上、往下、往上、往下，因此第2與第4個要.reverse()
    const chunkedArray = [];
    const chunkSize = Math.floor(urls.jpgUrl.length / 4);
    for (let i = 0; i + chunkSize < urls.jpgUrl.length; i += chunkSize) {
      chunkedArray.push(urls.jpgUrl.slice(i, i + chunkSize));
    }
    const movingImages1 = [
      ...chunkedArray[0],
      ...chunkedArray[1],
      ...chunkedArray[2],
      ...chunkedArray[3],
    ];
    const movingImages2 = [
      ...chunkedArray[3],
      ...chunkedArray[0],
      ...chunkedArray[1],
      ...chunkedArray[2],
    ].reverse();
    const movingImages3 = [
      ...chunkedArray[2],
      ...chunkedArray[3],
      ...chunkedArray[0],
      ...chunkedArray[1],
    ];
    const movingImages4 = [
      ...chunkedArray[1],
      ...chunkedArray[2],
      ...chunkedArray[3],
      ...chunkedArray[0],
    ].reverse();
    // 插入圖片至
    for (let i = 0; i < 2; i++) {
      insertImages($(".moving-images.a"), movingImages1);
      insertImages($(".moving-images.b"), movingImages2);
      insertImages($(".moving-images.c"), movingImages3);
      insertImages($(".moving-images.d"), movingImages4);
    }
    return gsap
      .timeline({
        paused: true,
        defaults: {
          duration: urls.jpgUrl.length * 5,
          ease: "linear",
          repeat: -1,
        },
      })
      .to(".moving-images.a, .moving-images.c", { y: "-50%" })
      .to(".moving-images.b, .moving-images.d", { y: "50%" }, "<");
  }
  const bgAnimation = createBackgroundAnimation();
  bgAnimation.play(1000); //假定已經撥放1000次，使reverse可以正常運作

  /**
   * 開始動畫
   * */
  function playOpening() {
    // 動畫過程
    gsap
      .timeline({
        defaults: { duration: 0.5, ease: "power2.out" },
      })
      .timeScale(0.8)
      .to(".loading-container", {
        delay: 7,
        autoAlpha: 0,
        duration: 0.5,
      })
      .to(
        ".title img, .title h1",
        {
          scale: 1,
          y: 0,
          stagger: 0.2,
          autoAlpha: 1,
          ease: "bounce.out",
        },
        ">-0.2"
      )
      .to(".title", {
        margin: "30px",
        width: "auto",
        height: "auto",
        borderRadius: "25px",
        ease: "bounce.out",
        duration: 1,
        delay: 1,
        onComplete: () => {
          gsap.set(".page-btn-container", { display: "flex" });
          switchView("index");
        },
      })
      .to(".search-bar, .setting-bar, .close-bar, .page-btn", {
        scale: 1,
        y: 0,
        stagger: 0.2,
        autoAlpha: 1,
        ease: "bounce.out",
      });
  }
  playOpening();

  /**
   * 頁面導航邏輯
   * */
  function setupNavigation() {
    //主頁至圖片牆
    function IndexToGallery() {
      //開始設置
      switchView("none");
      gsap.set(".gallery", { autoAlpha: 0, y: "100%" });
      gsap.set(".image-grid img, .back-to-home", { autoAlpha: 0, y: -150 });
      //動畫過程
      gsap
        .timeline({ defaults: { duration: 0.8, ease: "power2.out" } })
        .to(".content", {
          autoAlpha: 0,
          duration: 0.1,
          delay: 0.1,
        })
        .to(".gallery", {
          autoAlpha: 1,
          y: 0,
          onComplete: () => {
            switchView("gallery");
          },
        })
        .to(
          ".image-grid img",
          {
            stagger: 0.1,
            ease: "bounce.out",
            y: 0,
          },
          ">-0.2"
        )
        .to(
          ".image-grid img",
          {
            stagger: 0.1,
            autoAlpha: 1,
          },
          "<"
        )
        .to(
          ".back-to-home",
          {
            ease: "bounce.out",
            y: 0,
          },
          "<"
        )
        .to(
          ".back-to-home",
          {
            autoAlpha: 1,
          },
          "<"
        );
    }
    //圖片牆至主頁
    function GalleryToIndex() {
      //開始設置
      switchView("none");
      gsap.set(".content", { autoAlpha: 0 });
      gsap.set(".title, .page-btn, .setting-bar, .search-bar, .close-bar", {
        y: -150,
        autoAlpha: 0,
      });
      //動畫過程
      gsap
        .timeline({ defaults: { duration: 0.8, ease: "power2.out" } })
        .to(".gallery", {
          autoAlpha: 0,
          y: "-100%",
          ease: "power2.in",
          onComplete: () => {
            gsap.set(".gallery", {
              y: 0,
              onComplete: () => $(".image-grid img").remove(),
            });
          },
        })
        .to(
          ".back-to-home",
          {
            autoAlpha: 0,
            duration: 0.3,
          },
          "<"
        )
        .to(".content", {
          autoAlpha: 1,
          duration: 0.5,
          onComplete: () => {
            switchView("index");
          },
        })
        .to(
          ".title, .page-btn, .setting-bar, .search-bar, .close-bar",
          {
            stagger: 0.1,
            ease: "bounce.out",
            y: 0,
          },
          ">-0.2"
        )
        .to(
          ".title, .page-btn, .setting-bar, .search-bar, .close-bar",
          {
            stagger: 0.1,
            autoAlpha: 1,
          },
          "<"
        );
    }
    // 圖片牆至預覽
    function GalleryToPreview() {
      //開始設置
      gsap.set(".close-btn, .nextImage-btn, .prevImage-btn", {
        autoAlpha: 0,
        scale: 2,
        y: -50,
      });
      gsap.set(".fullscreen-image-container img", {
        autoAlpha: 0,
        scale: 1.25,
        y: -100,
      });
      switchView("preview");
      $(".gallery").css({ "overflow-y": "hidden" });
      //動畫過程
      gsap
        .timeline({
          defaults: { autoAlpha: 1, ease: "set1" },
        })
        .to(".fullscreen-overlay", { duration: 0.5 })
        .to(
          ".fullscreen-image-container img",
          {
            duration: 0.5,
            scale: 1,
            y: 0,
          },
          "<"
        )
        .to(".close-btn, .nextImage-btn, .prevImage-btn", {
          stagger: { each: 0.2 },
          ease: "bounce.out",
          duration: 0.5,
          scale: 1,
          y: 0,
          onComplete: () => {
            if (isFullscreen) {
              gsap.set(".close-btn, .nextImage-btn, .prevImage-btn", {
                autoAlpha: 0,
              });
            }
          },
        });
    }
    //預覽至圖片牆
    function PreviewToGallery() {
      //開始設置
      switchView("gallery");
      $(".gallery").css({ "overflow-y": "scroll" });
      //動畫過程
      gsap
        .timeline({
          defaults: { autoAlpha: 0 },
          ease: "set1",
        })
        .to(".close-btn, .nextImage-btn, .prevImage-btn", {
          stagger: { each: 0.2, ease: "set1" },
          duration: 0.2,
        })
        .to(".fullscreen-image-container img", {
          duration: 0.5,
          y: 100,
        })
        .to(".fullscreen-overlay", { duration: 0.5 }, "<");
    }
    //製作對應變數表
    const dataMappings = {
      Nature: { url: urls.natureUrl, color: "green" },
      Props: { url: urls.propsUrl, color: "blue" },
      Scene: { url: urls.sceneUrl, color: "yellow" },
    };
    /** 生成圖片牆頁面 @param {string} dataImage */
    function generateImageGrid(dataImage) {
      const mappingObj = dataMappings[dataImage];
      //appendTo()方法插入圖片
      insertImages($(".image-grid"), mappingObj.url);
      //更換圖標
      $(".top-btn img").attr(
        "src",
        `./images/icon/top (${mappingObj.color}).png`
      );
      $(".prevImage-btn img").attr(
        "src",
        `./images/icon/top (${mappingObj.color}).png`
      );
      $(".nextImage-btn img").attr(
        "src",
        `./images/icon/top (${mappingObj.color}).png`
      );
      $(".back-to-home img").attr(
        "src",
        `./images/icon/home (${mappingObj.color}).png`
      );
    }

    //按鈕分頁事件
    $(".page-btn-title").on("click", function () {
      if (isIndex) {
        createClickTimeline($(this).parent());
        generateImageGrid($(this).attr("data-image"));
        IndexToGallery();
      }
    });

    // 按鈕返回事件
    $(".back-to-home").on("click", function () {
      if (isGallery) {
        createClickTimeline($(this));
        GalleryToIndex();
      }
    });

    // 按鈕圖片事件
    $(document).on("click", ".image-grid img", function () {
      if (isGallery) {
        createClickTimeline($(this));
        GalleryToPreview();
      }
    });

    // 按鈕關閉全螢幕事件
    $(".close-btn").on("click", function () {
      if (isPreview) {
        createClickTimeline($(this));
        PreviewToGallery();
      }
    });

    // 滑鼠右鍵事件
    $(document).on("mousedown", function (e) {
      if (e.which === 3) {
        if (isGallery) GalleryToIndex();
        if (isPreview) PreviewToGallery();
      }
    });
  }
  setupNavigation();

  /**
   * 設定選單邏輯
   * */
  function setupSettingMenu() {
    //定義時間軸變數
    let toSettingOption;
    let toSettingMenu;
    let exSettingMenu;
    //紀錄畫面狀態
    let isSetting = false;
    /** @type {"label" | "animation" | "color" | "language"} */
    let settingView = "lable";

    /** 進設定選單分類 @param {"label" | "animation" | "color" | "language"} option */
    function ToSettingOptions(option) {
      let width;
      let container;
      let elements;
      settingView = option;

      switch (option) {
        case "animation":
          container = ".options-animation";
          elements = ".options-animation .option";
          width = 180;
          break;
        case "language":
          container = ".options-language";
          elements = ".options-language div";
          width = 180;
          break;
        case "color":
          container = ".options-color";
          elements = ".options-color .option";
          width = 180;
          break;
        case "lable":
          container = ".options-lable";
          elements = ".options-lable > div";
          width = 160;
          break;
      }

      gsap.set(container, { width: width });

      if (toSettingOption) toSettingOption.kill();

      toSettingOption = gsap
        .timeline({ default: { duration: 0.1, ease: "set1" } })
        .to(
          ".options-lable > div, .options-animation .option, .options-language div, .options-color .option",
          {
            autoAlpha: 0,
            onComplete: () =>
              gsap.set(
                ".options-lable, .options-animation, .options-language, .options-color",
                { autoAlpha: 0 }
              ),
          }
        )
        .to(".setting-bar", {
          width: width + 60,
          height: "240px",
        })
        .to(
          elements,
          {
            onStart: () => gsap.set(container, { autoAlpha: 1 }),
            stagger: 0.05,
            autoAlpha: 1,
          },
          "<"
        );
    }
    //進設定選單
    function ToSettingMenu() {
      isSetting = true;
      settingView = "lable";

      if (exSettingMenu) exSettingMenu.kill();

      toSettingMenu = gsap
        .timeline({ default: { duration: 0.2, ease: "set1" } })
        .to(".setting-btn", {
          autoAlpha: 0,
        })
        .to(".setting-bar", {
          width: "220px",
          height: "240px",
        })
        .to(
          ".setting-bar .line",
          {
            autoAlpha: 1,
          },
          "<"
        )
        .to(".options-icon, .options-lable", {
          autoAlpha: 1,
        })
        .to(
          ".options-icon img",
          {
            stagger: 0.1,
            autoAlpha: 1,
          },
          "<"
        )
        .to(
          ".options-lable > div",
          {
            stagger: 0.1,
            autoAlpha: 1,
          },
          "<"
        );
    }
    //出設定選單
    function ExSettingMenu() {
      isSetting = false;

      if (toSettingMenu) toSettingMenu.kill();

      exSettingMenu = gsap
        .timeline({ default: { duration: 0.2, ease: "set1" } })
        .to(".options-icon img", {
          stagger: 0.1,
          autoAlpha: 0,
          onComplete: () => gsap.set(".options-icon", { autoAlpha: 0 }),
        })
        .to(
          ".options-lable > div",
          {
            stagger: 0.1,
            autoAlpha: 0,
            onComplete: () => gsap.set(".options-lable", { autoAlpha: 0 }),
          },
          "<"
        )
        .to(
          ".options-animation .option",
          {
            stagger: 0.1,
            autoAlpha: 0,
            onComplete: () => gsap.set(".options-animation", { autoAlpha: 0 }),
          },
          "<"
        )
        .to(
          ".options-language div",
          {
            stagger: 0.1,
            autoAlpha: 0,
            onComplete: () => gsap.set(".options-language", { autoAlpha: 0 }),
          },
          "<"
        )
        .to(
          ".options-color .option",
          {
            stagger: 0.1,
            autoAlpha: 0,
            onComplete: () => gsap.set(".options-color", { autoAlpha: 0 }),
          },
          "<"
        )
        .to(".setting-bar", {
          width: "60px",
          height: "60px",
        })
        .to(
          ".setting-bar .line",
          {
            autoAlpha: 0,
          },
          "<"
        )
        .to(".setting-btn", {
          autoAlpha: 1,
        });
    }
    /** 切換播放/暫停按鈕與文字 */
    function changeAnimationState() {
      const tl = gsap.timeline({ defaults: { duration: 0.2, ease: "set1" } });
      const textData = {
        en: { play: "play", pause: "pause" },
        ja: { play: "再生", pause: "一時停止" },
        "zh-Hant": { play: "繼續", pause: "暫停" },
      };
      const lang =
        $(".pause-lable-container > div").first().attr("lang") || "en";

      if (!bgAnimation.paused()) {
        tl.to(".pause-lable-container", {
          onStart: () => {
            $(".pause-btn").attr("src", "./images/icon/play.png");
            $(".pause-btn").attr("class", "play-btn");
            bgAnimation.pause();
          },
          autoAlpha: 0,
        }).to(".pause-lable-container", {
          onStart: () => {
            $(".pause-lable-container > div").text(textData[lang]["play"]);
            $(".pause-lable-red").attr("class", "play-lable-red");
            $(".pause-lable-white").attr("class", "play-lable-white");
          },
          autoAlpha: 1,
        });
      } else {
        tl.to(".pause-lable-container", {
          onStart: () => {
            $(".play-btn").attr("src", "./images/icon/pause.png");
            $(".play-btn").attr("class", "pause-btn");
            bgAnimation.resume();
          },
          autoAlpha: 0,
        }).to(".pause-lable-container", {
          onStart: () => {
            $(".pause-lable-container > div").text(textData[lang]["pause"]);
            $(".play-lable-red").attr("class", "pause-lable-red");
            $(".play-lable-white").attr("class", "pause-lable-white");
          },
          autoAlpha: 1,
        });
      }
    }
    /** 更改語言 @param {"en"|"ja"|"zh-Hant"} lang */
    function changeLanguage(lang) {
      $.getJSON("language.json", function (data) {
        // 使用forEach迭代每个選擇器和對應的文本内容
        Object.entries(data).forEach(([selector, textData]) => {
          const element = $(selector);
          element.text(textData[lang]);
          element.attr("lang", lang);
        });
      });
    }
    /** 更新介面顏色 @param {"background"|"interface"} option @param {string} color */
    function changeUIColor(option, color) {
      switch (option) {
        case "background":
          gsap.set("body", { backgroundColor: color });
          break;
        case "interface":
          gsap.set(".title", { backgroundColor: color });
          gsap.set(".page-btn-title", { backgroundColor: color + "E6" }); // #E6 = 230 / 255 ~= 0.9
          gsap.set(".search-input", { backgroundColor: color + "80" }); // #80 = 128 / 255 ~= 0.5
          gsap.set(
            ".close-bar, .setting-bar, .search-bar, .options-language div, .back-to-home, .top-btn, .text-container div",
            { backgroundColor: color + "A6" }
          ); // #A6 = 166 / 255 ~= 0.65
          break;
      }
    }
    /** 綁定導航按鈕事件 */
    function bindNavBtnEvents() {
      $(".setting-btn").on("click", function () {
        if (isIndex) {
          if (!isSetting) {
            createClickTimeline($(this));
            ToSettingMenu();
          }
        }
      });

      $(".bottom-btn").on("click", function () {
        if (isIndex) {
          if (isSetting) {
            createClickTimeline($(this));
            ExSettingMenu();
          }
        }
      });

      $(".animation-btn").on("click", function () {
        if (isIndex) {
          createClickTimeline($(this));
          if (settingView != "animation") {
            ToSettingOptions("animation");
          } else {
            ToSettingOptions("lable");
          }
        }
      });

      $(".language-btn").on("click", function () {
        if (isIndex) {
          createClickTimeline($(this));
          if (settingView != "language") {
            ToSettingOptions("language");
          } else {
            ToSettingOptions("lable");
          }
        }
      });

      $(".color-btn").on("click", function () {
        if (isIndex) {
          createClickTimeline($(this));
          if (settingView != "color") {
            ToSettingOptions("color");
          } else {
            ToSettingOptions("lable");
          }
        }
      });
    }
    bindNavBtnEvents();
    /** 綁定功能按鈕事件 */
    function bindSetBtnEvents() {
      $(".pause-btn").on("click", function () {
        createClickTimeline($(this));
        changeAnimationState();
      });

      $(".reverse-btn").on("click", function () {
        createClickTimeline($(this));
        bgAnimation.reversed(!bgAnimation.reversed());
      });

      //語言選項
      $(".options-language > div").on("click", function () {
        createClickTimeline($(this));
        changeLanguage($(this).attr("lang"));
      });

      //輸入色彩選擇事件
      $(".color-picker-background input").on("input", function () {
        gsap.set(".color-picker-background div", {
          backgroundColor: $(this).val(),
        });
        changeUIColor("background", $(this).val());
      });

      $(".color-picker-interface input").on("input", function () {
        gsap.set(".color-picker-interface div", {
          backgroundColor: $(this).val(),
        });
        changeUIColor("interface", $(this).val());
      });
    }
    bindSetBtnEvents();

    //離開主頁時關閉選單
    $(".page-btn-title").on("click", () => {
      if (isSetting) ExSettingMenu();
    });
  }
  setupSettingMenu();

  /**
   * 關閉選單邏輯
   * */
  function setupCloseMenu() {
    /** @param {Function} callback */
    function createCloseTimeline(callback) {
      gsap
        .timeline({
          defaults: { ease: "set1" },
          onStart: () => switchView("none"),
        })
        .timeScale(1.5)
        .to(".title", { duration: 2, y: -500 })
        .to(".page-btn-container", { duration: 2, y: -500 }, ">-1.5")
        .to(".tool-bar-container", { duration: 2, y: 500 }, ">-1.5")
        .to(".content", { duration: 1.5, backgroundColor: "black" }, ">-1")
        .to(".content", { duration: 1 })
        .then(callback);
    }

    $(".stop-btn").on("click", function () {
      createClickTimeline($(this));
      createCloseTimeline(window.electronAPI.closeApp);
    });

    $(".restart-btn").on("click", function () {
      createClickTimeline($(this));
      createCloseTimeline(window.electronAPI.restartApp);
    });
  }
  setupCloseMenu();

  /**
   * 圖片牆邏輯
   * */
  function setupGallery() {
    // 圖片牆圖片懸停事件
    $(document).on("mouseenter", ".image-grid img", function () {
      gsap.to($(this), {
        onStart: () => gsap.set($(this), { zIndex: 2 }),
        duration: 0.2,
        ease: "set1",
        scale: 1.1,
      });
    });
    $(document).on("mouseleave", ".image-grid img", function () {
      gsap.to($(this), {
        onComplete: () => gsap.set($(this), { zIndex: 1 }),
        duration: 0.2,
        ease: "set1",
        scale: 1,
      });
    });

    // 返回頂部按鈕按下事件
    $(".top-btn").on("click", function () {
      if (isGallery) $(".gallery").scrollTop(0);
    });

    // 返回頂部按鈕ScrollTrigger
    const t1 = gsap.to(".top-btn", {
      paused: true,
      y: 0,
      duration: 0.3,
      ease: "set1",
    });

    gsap.to(".top-btn", {
      scrollTrigger: {
        trigger: ".image-grid",
        scroller: ".gallery",
        start: "1080px center",
        end: "+=0 center",
        onEnter: () => t1.play(),
        onEnterBack: () => t1.reverse(),
      },
    });
  }
  setupGallery();

  /**
   * 預覽畫面邏輯
   */
  function setupPreview() {
    // 紀錄預覽圖片指針
    let currentIndex = 0;
    let prevIndex = 0;
    let nextIndex = 0;
    /**
     * 根據指標與指定格式指派圖片給".fullscreen-image-container img"
     * @param {number} index  @param {"png"|"jpg"} format
     * */
    function assignImage(index, format) {
      //定義變數
      const extension = $(".text-container div");
      const totalIndex = $(".image-grid img").length;
      let path = "";

      //更新指標
      currentIndex = index;
      prevIndex = (currentIndex - 1 + totalIndex) % totalIndex;
      nextIndex = (currentIndex + 1) % totalIndex;

      /** 取得url @type {string} */
      const url = $(".image-grid img").eq(currentIndex).attr("src");

      //寫入src
      switch (format) {
        case "jpg":
          extension.text(".jpg");
          path = url + "?timestamp=" + Date.now();
          break;
        case "png":
          extension.text(".png");
          path = url.replace("\\jpg\\", "\\png\\").replace(".jpg", ".png");
          break;
      }

      //寫入名字
      const name = url.match(/[^/\\]+$/)[0].replace(/\.jpg/, "");

      //更新DOM
      $(".text-container p").text(name);
      $(".fullscreen-image-container img").attr("src", path);
    }

    // 進入Preview時指派圖片
    $(document).on("click", ".image-grid img", function () {
      assignImage($(this).index(), "jpg");
    });

    $(".prevImage-btn").on("click", function () {
      if (isPreview) {
        createClickTimeline($(this));
        assignImage(prevIndex, "jpg");
      }
    });

    $(".nextImage-btn").on("click", function () {
      if (isPreview) {
        createClickTimeline($(this));
        assignImage(nextIndex, "jpg");
      }
    });

    $(".text-container div").on("click", function () {
      if (isPreview) {
        createClickTimeline($(this));
        if ($(this).text() === ".jpg") {
          assignImage(currentIndex, "png");
        } else {
          assignImage(currentIndex, "jpg");
        }
      }
    });
  }
  setupPreview();

  /**
   * 全螢幕邏輯
   */
  function setupFullscreen() {
    /** 預覽至全螢幕 */
    function toFullscreen() {
      //開始設置
      switchView("none");
      gsap.set(".fullscreen-image-container", { zIndex: 5 });
      //動畫過程
      gsap
        .timeline({
          defaults: { duration: 0.5, ease: "set1" },
        })
        .to(".close-btn, .nextImage-btn, .prevImage-btn, .text-container", {
          autoAlpha: 0,
        })
        .to(
          ".fullscreen-image-container img",
          {
            maxWidth: "100%",
            maxHeight: "100%",
            onComplete: () => {
              switchView("fullscreen");
            },
          },
          "<"
        );
    }
    /** 全螢幕至預覽 */
    function exFullscreen() {
      //開始設置
      switchView("none");
      //動畫過程
      gsap
        .timeline({
          defaults: { duration: 0.5, ease: "set1" },
        })
        .to(".fullscreen-image-container img", {
          maxWidth: "85%",
          maxHeight: "85%",
          x: 0,
          y: 0,
          scale: 1,
          onComplete: () => {
            // 所有變數回歸最初始狀態
            lastX = 0;
            lastY = 0;
            translateX = 0;
            translateY = 0;
          },
        })
        .to(
          ".fullscreen-image-container",
          {
            scale: 1,
            onComplete: () => {
              // 所有變數回歸最初始狀態
              scale = 1;
              gsap.set(".fullscreen-image-container", { zIndex: 3 });
              switchView("preview");
            },
          },
          "<"
        )
        .to(
          ".close-btn , .nextImage-btn, .prevImage-btn, .text-container",
          {
            autoAlpha: 1,
          },
          "<"
        );
    }

    // 以下是移動圖片邏輯
    let isDrag = false;
    let scale = 1;
    let mouseX = 0; // 當前滑鼠位置
    let mouseY = 0;
    let lastX = 0; //最後滑鼠位置
    let lastY = 0;
    let translateX = 0; //位移量
    let translateY = 0;
    let lastUpdate; // 滑鼠上次位置定時器
    /** 更新".fullscreen-image-container img"之Transform
     * @param {number} time 毫秒数 @param {string} ease */
    function updateTransform(time, ease) {
      gsap.to(".fullscreen-image-container img", {
        x: translateX,
        y: translateY,
        duration: time / 1000,
        ease: ease,
      });
      gsap.to(".fullscreen-image-container", {
        scale: scale,
        duration: time / 1000,
        ease: ease,
      });
    }
    /** 限制".fullscreen-image-container img"位置 */
    function limitTranslation() {
      const img = $(".fullscreen-image-container img");
      if (
        Math.abs(translateX * 2) > img.width() ||
        Math.abs(translateY * 2) > img.height()
      ) {
        translateX = 0;
        translateY = 0;
        updateTransform(300, "set1");
      }
    }
    /** 開始拖動邏輯 */
    function startDragging() {
      $("body").css("cursor", "grab");
      isDrag = true;
      //獲取速度 lim t->0 ((當前位置-最後位置)/t) = speed
      lastUpdate = setInterval(() => {
        lastX = mouseX;
        lastY = mouseY;
      }, 1);
    }
    /** 停止拖動邏輯 */
    function stopDragging() {
      $("body").css("cursor", "auto");
      isDrag = false;
      // 停止更新滑鼠最後位置
      clearInterval(lastUpdate);
      limitTranslation();
    }
    /** 拖動邏輯 */
    function dragging() {
      $("body").css("cursor", "grabbing");
      const deltaX = (mouseX - lastX) / scale;
      const deltaY = (mouseY - lastY) / scale;
      //速度計算完成後若不為0則更新畫面
      if (deltaX != 0 || deltaY != 0) {
        translateX = translateX + deltaX;
        translateY = translateY + deltaY;
        updateTransform(0, "none");
      }
    }
    /** 縮放邏輯 @param {number} deltaY @param {number} scaleFac */
    function scaling(deltaY, scaleFac) {
      if (deltaY < 0) {
        translateX = translateX - (mouseX - window.innerWidth / 2) / 7 / scale;
        translateY = translateY - (mouseY - window.innerHeight / 2) / 7 / scale;
        scale += scaleFac;
        updateTransform(100, "linear");
        limitTranslation();
      } else {
        if (scale > 1) {
          scale -= scaleFac;
          updateTransform(100, "linear");
        }
      }
    }

    // 以下是綁定事件
    /** 綁定拖動邏輯至所需事件 */
    function bindDraggingEvents() {
      $(document).on("mousedown", function (e) {
        if (e.which === 1 && isFullscreen) startDragging();
      });

      $(document).on("mouseup", function (e) {
        if (e.which === 1 && isDrag) stopDragging();
      });

      $(document).on("mousemove", function (e) {
        e.preventDefault();
        if (isFullscreen) {
          mouseX = e.clientX;
          mouseY = e.clientY;
          if (isDrag) dragging();
        }
      });
    }
    bindDraggingEvents();

    /** 綁定滑鼠滾輪事件 */
    function bindScalingEvents() {
      $(document).on("mousewheel", function (e) {
        if (isFullscreen) {
          scaling(e.originalEvent.deltaY, e.shiftKey ? 0.2 : 0.1);
        }
        if (isPreview && e.originalEvent.deltaY < 0) {
          toFullscreen();
        }
        if (isFullscreen && scale <= 1) {
          exFullscreen();
        }
      });
    }
    bindScalingEvents();

    // 右鍵離開全螢幕
    $(document).on("mousedown", function (e) {
      if (e.which === 3 && isFullscreen) exFullscreen();
    });
  }
  setupFullscreen();
});
