$(document).ready(async function () {
  // 紀錄圖片庫(字串url組成)
  let jpgUrl = [];
  const natureUrl = [];
  const propsUrl = [];
  const sceneUrl = [];
  // 紀錄圖片陣列(DOM物件)
  let imagesGallery = [];
  //紀錄預覽/全螢幕圖片(DOM物件)
  let image;
  // 紀錄預覽圖片指針
  let currentIndex = 0;
  let prevIndex = 0;
  let nextIndex = 0;
  //紀錄目前畫面狀態
  let isIndex = false;
  let isGallery = false;
  let isPreview = false;
  let isFullscreen = false;
  let isSetting = false;
  let settingView = "lable";
  //紀錄全螢幕模式所需變數
  let scale = 1;
  let scaleFac = 0.1;
  let drag = false;
  let mouseX = 0; // 當前滑鼠位置
  let mouseY = 0;
  let lastX = 0; //最後滑鼠位置
  let lastY = 0;
  let translateX = 0; //位移量
  let translateY = 0;
  let lastUpdate; // 滑鼠上次位置定時器
  // 用於追蹤返回頂部按鈕可見性
  let top_isVisible = false;
  //製作漸進模式
  gsap.defaults({ overwrite: "auto" });
  gsap.registerPlugin(CustomEase);
  CustomEase.create("set1", "0.455, 0.03, 0.515, 0.955");

  //函數邏輯：
  //要求圖片
  async function requestImage() {
    const imagePaths = await window.electronAPI.getImages();
    imagePaths["Nature"].forEach((imagePath) => {
      natureUrl.push(`file://${imagePath}`);
    });
    imagePaths["Props"].forEach((imagePath) => {
      propsUrl.push(`file://${imagePath}`);
    });
    imagePaths["Scene"].forEach((imagePath) => {
      sceneUrl.push(`file://${imagePath}`);
    });
  }
  //切換畫面
  function switchView(view) {
    if (view === "gallery") {
      isIndex = false;
      isGallery = true;
      isPreview = false;
      isFullscreen = false;
    } else if (view === "preview") {
      isIndex = false;
      isGallery = false;
      isPreview = true;
      isFullscreen = false;
    } else if (view === "fullscreen") {
      isIndex = false;
      isGallery = false;
      isPreview = false;
      isFullscreen = true;
    } else if (view === "index") {
      isIndex = true;
      isGallery = false;
      isPreview = false;
      isFullscreen = false;
    } else if (view === "none") {
      isIndex = false;
      isGallery = false;
      isPreview = false;
      isFullscreen = false;
    }
  }
  //建立背景動畫
  function backgroundAnimation() {
    // 隨機排序jpgUrl陣列
    gsap.utils.shuffle(jpgUrl);
    // 將陣列分成四份，以特定順序放進四格移動牆，因此絕對不會重複
    // 圖片會從最左邊一路往右逐次出現，直到再次回來，由於1/4的總圖片高度大於畫面高度
    // 因此會有再次出現間隔時間=(1/4)*總圖片高度-畫面可以呈現的總圖片高度
    // 由於移動牆從左到右分別是往上、往下、往上、往下，因此第2與第4個要.reverse()
    const chunkedArray = [];
    const chunkSize = Math.floor(jpgUrl.length / 4);
    for (let i = 0; i + chunkSize < jpgUrl.length; i += chunkSize) {
      chunkedArray.push(jpgUrl.slice(i, i + chunkSize));
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
    gsap.set(".moving-images-container", { rotate: 15 });
    gsap
      .timeline({
        defaults: {
          duration: jpgUrl.length * 5,
          ease: "linear",
          repeat: -1,
        },
      })
      .to(".moving-images.a, .moving-images.c", { y: "-50%" })
      .to(".moving-images.b, .moving-images.d", { y: "50%" }, "<");
  }
  //按鈕點擊動畫
  function clickAnimation(element) {
    gsap.timeline().to(element, {
      keyframes: [
        { y: 25, duration: 0.2, ease: "expo.out" },
        { y: 0, duration: 0.2, ease: "expo.out" },
      ],
    });
  }
  //懸停動畫(雖然事件但由於具體因此放在同個函式)
  function hoverAnimation() {
    //hover事件偵測
    $(".page-btn").hover(
      function () {
        gsap.to($(this), {
          duration: 0.2,
          ease: "set1",
          margin: "0 30px 0 30px",
          padding: "0 0 0 0",
          scale: 1.25,
        });
      },
      function () {
        gsap.to($(this), {
          duration: 0.2,
          ease: "set1",
          margin: "0 0 0 0",
          padding: "0 0 10px 10px",
          scale: 1,
        });
      }
    );
    $(".page-btn-title").hover(
      function () {
        gsap.to($(this), {
          duration: 0.2,
          ease: "set1",
          boxShadow: "0px 0px 24px rgba(0, 0, 0, 1)",
        });
      },
      function () {
        gsap.to($(this), {
          duration: 0.2,
          ease: "set1",
          boxShadow: "0px 0px 12px rgba(0, 0, 0, 1)",
        });
      }
    );
    $(".setting-btn, .search-btn").hover(
      function () {
        gsap.to($(this), {
          duration: 0.2,
          ease: "set1",
          scale: 1.25,
        });
      },
      function () {
        gsap.to($(this), {
          duration: 0.2,
          ease: "set1",
          scale: 1,
        });
      }
    );
    $(".close-bar").hover(
      () => {
        toCloseBar.play();
      },
      () => {
        toCloseBar.reverse();
      }
    );
    $(".stop-btn").hover(
      () => {
        hoverStopBtn.play();
      },
      () => {
        hoverStopBtn.reverse();
      }
    );
    $(".restart-btn").hover(
      () => {
        hoverRestartBtn.play();
      },
      () => {
        hoverRestartBtn.reverse();
      }
    );
    $(".animation-btn").hover(
      () => {
        hoverAnimationBtn.play();
      },
      () => {
        hoverAnimationBtn.reverse();
      }
    );
    $(".language-btn").hover(
      () => {
        hoverLanguageBtn.play();
      },
      () => {
        hoverLanguageBtn.reverse();
      }
    );
    $(".color-btn").hover(
      () => {
        hoverColorBtn.play();
      },
      () => {
        hoverColorBtn.reverse();
      }
    );
    $(".bottom-btn").hover(
      () => {
        hoverBottomBtn.play();
      },
      () => {
        hoverBottomBtn.reverse();
      }
    );
    $(".pause-btn").hover(
      () => {
        hoverPauseBtn.play();
      },
      () => {
        hoverPauseBtn.reverse();
      }
    );
    $(".reverse-btn").hover(
      () => {
        hoverReverseBtn.play();
      },
      () => {
        hoverReverseBtn.reverse();
      }
    );
    $(document).on("mouseenter", ".image-grid img", function () {
      gsap.set($(this), {
        zIndex: 2,
      });
      gsap.to($(this), {
        duration: 0.2,
        ease: "set1",
        scale: 1.1,
      });
    });
    $(document).on("mouseleave", ".image-grid img", function () {
      gsap.to($(this), {
        duration: 0.2,
        ease: "set1",
        scale: 1,
      });
      gsap.set($(this), {
        zIndex: 1,
        delay: 0.2,
      });
    });
    $(".back-to-home").hover(
      function () {
        gsap.to($(this), {
          duration: 0.2,
          ease: "set1",
          scale: 1.25,
          boxShadow: "0px 0px 24px rgba(0, 0, 0, 1)",
        });
      },
      function () {
        gsap.to($(this), {
          duration: 0.2,
          ease: "set1",
          scale: 1,
          boxShadow: "0px 0px 12px rgba(0, 0, 0, 1)",
        });
      }
    );
    $(".top-btn").hover(
      function () {
        gsap.to($(this), {
          duration: 0.2,
          ease: "set1",
          scale: 1.25,
          boxShadow: "0px 0px 24px rgba(0, 0, 0, 1)",
        });
      },
      function () {
        gsap.to($(this), {
          duration: 0.2,
          ease: "set1",
          scale: 1,
          boxShadow: "0px 0px 12px rgba(0, 0, 0, 1)",
        });
      }
    );
    $(".close-btn").hover(
      function () {
        gsap.to($(this), {
          duration: 0.2,
          ease: "set1",
          scale: 1.5,
          rotate: 180,
        });
      },
      function () {
        gsap.to($(this), {
          duration: 0.2,
          ease: "set1",
          scale: 1,
          rotate: 0,
        });
      }
    );
    $(".nextImage-btn, .prevImage-btn").hover(
      function () {
        gsap.to($(this), {
          duration: 0.2,
          ease: "set1",
          scale: 1.5,
        });
      },
      function () {
        gsap.to($(this), {
          duration: 0.2,
          ease: "set1",
          scale: 1,
        });
      }
    );
    $(".text-container div").hover(
      function () {
        gsap.to($(this), {
          duration: 0.2,
          ease: "set1",
          scale: 1.2,
          color: "#EA81AF",
        });
      },
      function () {
        gsap.to($(this), {
          duration: 0.2,
          ease: "set1",
          scale: 1,
          color: "#ffffff",
        });
      }
    );
  }
  // 插入圖片至指定容器
  function insertImages(container, list) {
    $.each(list, (index) => {
      const img = $("<img>").attr("src", list[index]);
      img.appendTo(container);
    });
  }
  //指派圖片
  function assignImage(index, format) {
    //若有圖片則先刪除
    if (image) image.remove();

    //定義變數
    const extension = $(".text-container div");
    const totalIndex = imagesGallery.length;
    let path = "";

    //更新指標
    currentIndex = index;
    prevIndex = (currentIndex - 1 + totalIndex) % totalIndex;
    nextIndex = (currentIndex + 1) % totalIndex;

    //查找url
    switch (format) {
      case "jpg":
        extension.text(".jpg");
        path =
          imagesGallery.eq(currentIndex).attr("src") +
          "?timestamp=" +
          Date.now();
        break;
      case "png":
        extension.text(".png");
        path = imagesGallery
          .eq(currentIndex)
          .attr("src")
          .replace("\\jpg\\", "\\png\\")
          .replace(".jpg", ".png");
        break;
    }

    //查找名字
    const name = imagesGallery
      .eq(currentIndex)
      .attr("src")
      .match(/[^/\\]+$/)[0]
      .replace(/\.jpg/, "");

    //更新DOM
    $(".text-container p").text(name);
    insertImages($(".fullscreen-image-container"), [path]);

    //指派給全域變數
    image = $(".fullscreen-image-container img");
  }
  //主頁至圖片牆
  function IndexToGallery() {
    //開始設置
    switchView("none");
    gsap.set(".gallery", { autoAlpha: 0, y: "100%" });
    gsap.set(".image-grid img, .back-to-home", { autoAlpha: 0, y: -150 });
    gsap.set(".top-btn", {
      y: 150,
      onComplete: () => gsap.set(".top-btn", { autoAlpha: 1 }),
    });
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
            onComplete: () => {
              window.scrollTo({
                top: 0,
                behavior: "instant",
              });
              $(".image-grid img").remove();
            },
          });
        },
      })
      .to(
        ".back-to-home, .top-btn",
        {
          autoAlpha: 0,
          duration: 0.3,
          onComplete: () => {
            gsap.set("top-btn", { y: 150 });
            top_isVisible = false;
          },
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
    gsap.set(image, {
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
        image,
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
      .to(image, {
        duration: 0.5,
        y: 100,
        onComplete: () => image.remove(),
      })
      .to(".fullscreen-overlay", { duration: 0.5 }, "<");
  }
  //預覽至全螢幕
  function PreviewToFullscreen() {
    //開始設置
    switchView("none");
    gsap.set(".fullscreen-image-container", { zIndex: 5 });
    //時間設置
    const time = 500;
    //動畫過程
    gsap
      .timeline({
        defaults: { duration: time / 1000, ease: "set1" },
      })
      .to(".close-btn, .nextImage-btn, .prevImage-btn, .text-container", {
        autoAlpha: 0,
      })
      .to(
        image,
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
  //全螢幕至預覽
  function FullscreenToPreview() {
    //開始設置
    switchView("none");
    //時間設置
    const time = 500;
    //動畫過程
    gsap
      .timeline({
        defaults: { duration: time / 1000, ease: "set1" },
      })
      .to(image, {
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
        image.parent(),
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
  //開始動畫
  function Opening() {
    // 動畫過程
    gsap
      .timeline({
        defaults: { duration: 0.5, ease: "power2.out" },
      })
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
  //更新畫面
  function updateTransform(time, ease) {
    gsap.to(image, {
      x: translateX,
      y: translateY,
      duration: time / 1000,
      ease: ease,
    });
    gsap.to(image.parent(), {
      scale: scale,
      duration: time / 1000,
      ease: ease,
    });
  }
  //若超出圖片範圍則重置圖片位置
  function limitTranslation() {
    if (
      Math.abs(translateX * 2) > image.width() ||
      Math.abs(translateY * 2) > image.height()
    ) {
      translateX = 0;
      translateY = 0;
      updateTransform(300, "set1");
    }
  }
  //進設定選單分類
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
  //製作時間軸變數
  function registerTimeline(name) {
    // 統整類似的懸停時間軸變數
    function hoverTimeline(option) {
      const timeline = gsap.timeline({
        paused: true,
        defaults: { duration: 0.2, ease: "set1", overwrite: false },
      });

      timeline.to(`.${option}-btn`, {
        scale: (option) => {
          if (["stop", "restart", "pause", "reverse"].includes(option)) {
            return 1.25;
          } else if (option === "bottom") {
            return 1.15;
          } else {
            return 1.35;
          }
        },
      });

      if (option === "restart") {
        timeline.to(
          `.${option}-btn`,
          {
            rotate: 180,
          },
          "<"
        );
      }

      timeline.to(
        `.${option}-lable-white`,
        {
          y: 40,
        },
        "<"
      );

      timeline.to(
        `.${option}-lable-red`,
        {
          y: 0,
        },
        "<"
      );

      return timeline;
    }

    // 根據所需轉場回傳相應時間軸
    switch (name) {
      case "toCloseBar":
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
      case "HoverStopBtn":
        return hoverTimeline("stop");
      case "HoverRestartBtn":
        return hoverTimeline("restart");
      case "HoverAnimationBtn":
        return hoverTimeline("animation");
      case "HoverLanguageBtn":
        return hoverTimeline("language");
      case "HoverColorBtn":
        return hoverTimeline("color");
      case "HoverBottomBtn":
        return hoverTimeline("bottom");
      case "HoverPauseBtn":
        return hoverTimeline("pause");
      case "HoverReverseBtn":
        return hoverTimeline("reverse");
    }
  }
  //初始化
  async function initialize() {
    // 初始化 #1
    // 隱藏元素
    gsap.set(".gallery, .fullscreen-overlay, .back-to-home, .top-btn", {
      autoAlpha: 0,
    });
    gsap.set(".restart-btn, .close-bar .line", {
      autoAlpha: 0,
    });
    gsap.set(".stop-lable-container, .restart-lable-container", {
      autoAlpha: 0,
    });
    gsap.set(".stop-lable-red, .restart-lable-red", {
      y: -40,
    });
    gsap.set(".setting-menu, .setting-bar .line", {
      autoAlpha: 0,
    });
    gsap.set(".options-icon, .options-icon img", {
      autoAlpha: 0,
    });
    gsap.set(".options-lable, .options-lable > div", {
      autoAlpha: 0,
    });
    gsap.set(".options-animation, .options-animation .option", {
      autoAlpha: 0,
    });
    gsap.set(".options-language, .options-language div", {
      autoAlpha: 0,
    });
    gsap.set(".options-color, .options-color .option", {
      autoAlpha: 0,
    });
    gsap.set(".animation-lable-red, .language-lable-red", {
      y: -40,
    });
    gsap.set(".color-lable-red, .bottom-lable-red", {
      y: -40,
    });
    gsap.set(".pause-lable-red, .reverse-lable-red", {
      y: -40,
    });
    gsap.set(".animation-btn, .language-btn, color-btn", { scale: 1.15 });
    gsap.set(".bottom-btn", { rotate: 180, scale: 0.9 });

    // 初始化 #2
    // 開頭動畫開始位置
    gsap.set(".page-btn-container", { display: "none" });
    gsap.set(".title", {
      margin: 0,
      width: "100%",
      height: "100%",
      borderRadius: "0px",
    });
    gsap.set(
      ".title img, .title h1, .search-bar, .setting-bar, .close-bar, .page-btn",
      {
        scale: 2,
        y: -100,
        autoAlpha: 0,
      }
    );

    // 初始化 #3
    // 載入Url
    await requestImage();
    jpgUrl = [...natureUrl, ...propsUrl, ...sceneUrl];
  }

  // 開始執行
  await initialize();

  // 定義時間軸變數(不可反轉)
  let toSettingOption;
  let toSettingMenu;
  let exSettingMenu;

  // 註冊時間軸變數(可反轉)
  const toCloseBar = registerTimeline("toCloseBar");
  const hoverStopBtn = registerTimeline("HoverStopBtn");
  const hoverRestartBtn = registerTimeline("HoverRestartBtn");
  const hoverAnimationBtn = registerTimeline("HoverAnimationBtn");
  const hoverLanguageBtn = registerTimeline("HoverLanguageBtn");
  const hoverColorBtn = registerTimeline("HoverColorBtn");
  const hoverBottomBtn = registerTimeline("HoverBottomBtn");
  const hoverPauseBtn = registerTimeline("HoverPauseBtn");
  const hoverReverseBtn = registerTimeline("HoverReverseBtn");

  // 註冊動畫
  backgroundAnimation();
  hoverAnimation();

  // 開場
  Opening();

  //按鈕關閉app事件
  $(".stop-btn").on("click", function () {
    if (isIndex) {
      window.electronAPI.closeApp();
    }
  });

  //按鈕重啟app事件
  $(".restart-btn").on("click", function () {
    if (isIndex) {
      window.electronAPI.restartApp();
    }
  });

  //按鈕設定事件
  $(".setting-btn").on("click", function () {
    if (isIndex) {
      if (!isSetting) {
        clickAnimation($(this));
        ToSettingMenu();
      }
    }
  });

  //按鈕離開設定事件
  $(".bottom-btn").on("click", function () {
    if (isIndex) {
      if (isSetting) {
        clickAnimation($(this));
        ExSettingMenu();
      }
    }
  });

  //按鈕設定動畫分類事件
  $(".animation-btn").on("click", function () {
    if (isIndex) {
      clickAnimation($(this));
      if (settingView != "animation") {
        ToSettingOptions("animation");
      } else {
        ToSettingOptions("lable");
      }
    }
  });

  //按鈕設定語言分類事件
  $(".language-btn").on("click", function () {
    if (isIndex) {
      clickAnimation($(this));
      if (settingView != "language") {
        ToSettingOptions("language");
      } else {
        ToSettingOptions("lable");
      }
    }
  });

  //按鈕設定色彩分類事件
  $(".color-btn").on("click", function () {
    if (isIndex) {
      clickAnimation($(this));
      if (settingView != "color") {
        ToSettingOptions("color");
      } else {
        ToSettingOptions("lable");
      }
    }
  });

  //輸入色彩選擇事件(背景顏色)
  $(".color-picker-background input").on("input", function (event) {
    $(".color-picker-background div").css(
      "background-color",
      event.target.value
    );
  });

  //輸入色彩選擇事件(介面顏色)
  $(".color-picker-interface input").on("input", function (event) {
    $(".color-picker-interface div").css(
      "background-color",
      event.target.value
    );
  });

  //按鈕分頁事件
  $(".page-btn-title").on("click", function () {
    if (isIndex) {
      if ($(this).attr("data-image") === "Nature") {
        insertImages($(".image-grid"), natureUrl);
        $(".top-btn img").attr("src", "./images/icon/top (green).png");
        $(".back-to-home img").attr("src", "./images/icon/home (green).png");
      }
      if ($(this).attr("data-image") === "Props") {
        insertImages($(".image-grid"), propsUrl);
        $(".top-btn img").attr("src", "./images/icon/top (blue).png");
        $(".back-to-home img").attr("src", "./images/icon/home (blue).png");
      }
      if ($(this).attr("data-image") === "Scene") {
        insertImages($(".image-grid"), sceneUrl);
        $(".top-btn img").attr("src", "./images/icon/top (yellow).png");
        $(".back-to-home img").attr("src", "./images/icon/home (yellow).png");
      }
      imagesGallery = $(".image-grid img");
      clickAnimation($(this).parent());
      IndexToGallery();
      if (isSetting) {
        ExSettingMenu();
      }
    }
  });

  // 按鈕圖片事件
  $(document).on("click", ".image-grid img", function () {
    if (isGallery) {
      assignImage($(this).index(), "jpg");
      clickAnimation($(this));
      GalleryToPreview();
    }
  });

  // 按鈕上一張事件
  $(".prevImage-btn").on("click", function () {
    if (isPreview) {
      clickAnimation($(this));
      assignImage(prevIndex, "jpg");
    }
  });

  // 按鈕下一張事件
  $(".nextImage-btn").on("click", function () {
    if (isPreview) {
      clickAnimation($(this));
      assignImage(nextIndex, "jpg");
    }
  });

  // 按鈕關閉全螢幕事件
  $(".close-btn").on("click", function () {
    if (isPreview) {
      clickAnimation($(this));
      PreviewToGallery();
    }
  });

  // 按鈕切換副檔名事件
  $(".text-container div").on("click", function () {
    if (isPreview) {
      clickAnimation($(this));
      if ($(this).text() === ".jpg") {
        assignImage(currentIndex, "png");
      } else {
        assignImage(currentIndex, "jpg");
      }
    }
  });

  // 按鈕返回事件
  $(".back-to-home").on("click", function () {
    if (isGallery) {
      clickAnimation($(this));
      GalleryToIndex();
    }
  });

  // 按鈕返回頂部
  $(".top-btn").on("click", function () {
    if (isGallery) {
      gsap
        .timeline()
        .to($(this), {
          keyframes: [
            { y: 25, duration: 0.2, ease: "expo.out" },
            { y: 0, duration: 0.2, ease: "expo.out" },
          ],
          onStart: () => $(".gallery").scrollTop(0),
        })
        .to($(this), {
          y: 150,
          ease: "power2.in",
          onComplete: () => (top_isVisible = false),
        });
    }
  });

  // 所有鍵盤事件
  $(document).on("keydown", function (e) {
    // Esc
    if (e.keyCode === 27) {
      if (isGallery) {
        clickAnimation($(".back-to-home"));
        GalleryToIndex();
      }
      if (isPreview) {
        clickAnimation($(".close-btn"));
        PreviewToGallery();
      }
      if (isFullscreen) {
        FullscreenToPreview();
      }
    }
    // 左側箭頭
    if (e.which === 37) {
      if (isPreview) {
        assignImage(prevIndex, "jpg");
        clickAnimation($(".prevImage-btn"));
      }
    }
    // 右側箭頭
    if (e.which === 39) {
      if (isPreview) {
        assignImage(nextIndex, "jpg");
        clickAnimation($(".nextImage-btn"));
      }
    }
  });

  // 所有滑鼠按下事件
  $(document).on("mousedown", function (e) {
    if (e.which === 1) {
      if (isFullscreen) {
        $("body").css("cursor", "grab");
        drag = true;
        //初始化當次拖動的最後滑鼠位置
        lastX = mouseX;
        lastY = mouseY;
        //獲取速度 lim t->0 ((當前位置-最後位置)/t) = speed
        lastUpdate = setInterval(() => {
          lastX = mouseX;
          lastY = mouseY;
        }, 1);
      }
    }
    if (e.which === 3) {
      if (isGallery) {
        clickAnimation($(".back-to-home"));
        GalleryToIndex();
      }
      if (isPreview) {
        clickAnimation($(".close-btn"));
        PreviewToGallery();
      }
      if (isFullscreen) {
        FullscreenToPreview();
      }
    }
  });

  // 所有放開滑鼠事件
  $(document).on("mouseup", function (e) {
    if (e.which === 1) {
      if (isFullscreen) {
        drag = false;
        // 停止更新滑鼠最後位置
        clearInterval(lastUpdate);
        limitTranslation();
      }
      if (
        $("body").css("cursor") === "grabbing" ||
        $("body").css("cursor") === "grab"
      ) {
        $("body").css("cursor", "auto");
      }
    }
  });

  // 所有滑鼠滾輪事件
  $(document).on("mousewheel", function (e) {
    //向上滑時
    if (e.originalEvent.deltaY < 0) {
      if (isPreview) {
        PreviewToFullscreen();
      }
      if (isFullscreen) {
        translateX = translateX - (mouseX - window.innerWidth / 2) / 7 / scale;
        translateY = translateY - (mouseY - window.innerHeight / 2) / 7 / scale;
        scaleFac = e.shiftKey ? 0.2 : 0.1; //shift可以增加縮放速度
        scale += scaleFac;
        updateTransform(100, "linear");
        limitTranslation();
      }
      if (isGallery) {
        if ($(".gallery").scrollTop() < 100 && top_isVisible) {
          gsap.to(".top-btn", { y: 150, ease: "power2.in" });
          top_isVisible = false;
        }
      }
    }
    // 向下滑時
    else {
      if (isFullscreen) {
        //縮到最小時
        if (scale <= 1) {
          FullscreenToPreview();
        }
        if (scale > 1) {
          scaleFac = e.shiftKey ? 0.2 : 0.1;
          scale -= scaleFac;
          updateTransform(100, "linear");
        }
      }
      if (isGallery) {
        if ($(".gallery").scrollTop() >= 100 && !top_isVisible) {
          gsap.to(".top-btn", { y: 0, ease: "power2.out" });
          top_isVisible = true;
        }
      }
    }
  });

  // 所有滑鼠移動事件
  $(document).on("mousemove", function (e) {
    e.preventDefault();
    if (isFullscreen) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      //按住時的邏輯
      if (drag) {
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
    }
  });

  // 所有菜單事件
  $(document).on("contextmenu", function (e) {
    e.preventDefault();
  });
});
