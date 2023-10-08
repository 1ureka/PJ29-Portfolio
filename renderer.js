$(document).ready(function () {
  // 定義圖片庫(字串url組成)
  let imagesAll = [];
  const imagesNature = [];
  const imagesProps = [];
  const imagesScene = [];
  // 紀錄預覽圖片指針
  let currentIndex = 0;
  let prevIndex = 0;
  let nextIndex = 0;
  //紀錄目前畫面狀態
  let isIndex = false;
  let isGallery = false;
  let isPreview = false;
  let isFullscreen = false;
  // 紀錄圖片牆之圖片陣列
  let images = [];
  //紀錄預覽/全螢幕圖片容器
  const image = $(".fullscreen-image-container img");
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
  //製作漸進模式
  gsap.defaults({ overwrite: "auto" });
  gsap.registerPlugin(CustomEase);
  CustomEase.create("set1", "0.455, 0.03, 0.515, 0.955");

  //函數邏輯：
  //要求圖片
  async function requestImage(callback) {
    const imagePaths = await window.electronAPI.getImages();
    imagePaths[0].forEach((imagePath) => {
      imagesNature.push(`file://${imagePath}`);
    });
    imagePaths[1].forEach((imagePath) => {
      imagesProps.push(`file://${imagePath}`);
    });
    imagePaths[2].forEach((imagePath) => {
      imagesScene.push(`file://${imagePath}`);
    });
    callback();
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
    // 隨機排序images陣列
    gsap.utils.shuffle(imagesAll);
    // 將陣列分成四份，以特定順序放進四格移動牆
    // 每個移動牆在移動某陣列的內容時，其他移動牆絕對會在移動其他的三個陣列其中之一
    // 因此絕對不會重複，若觀察底下建立移動牆的方法，會發現index[0]的位置是在不斷往下的
    // 並且是1 -> 2 -> 3 -> 4的順序，因此當圖片從第一道移動牆離開後，再次出現也會符合該順序
    // 但由於1/4的總圖片高度可能大於畫面高度，因此會有再次出現間隔時間=1/4總圖片高度-畫面可以呈現的總圖片高度
    // 最後，由於移動牆從左到右分別是往上、往下、往上、往下，因此第2與第4個要.reserve()
    const chunkedArray = [];
    const chunkSize = Math.floor(imagesAll.length / 4);
    for (let i = 0; i + chunkSize < imagesAll.length; i += chunkSize) {
      chunkedArray.push(imagesAll.slice(i, i + chunkSize));
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
          duration: imagesAll.length * 5,
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
    $(".btn-wrapper").hover(
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
    $(".btn").hover(
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
    $(".stop-btn img, .setting-btn img, .search-bar img").hover(
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
  }
  // 插入圖片至指定容器
  function insertImages(container, list) {
    $.each(list, (index) => {
      const img = $("<img>").attr("src", list[index]);
      img.appendTo(container);
    });
  }
  //指派圖片
  function assignImage(index) {
    //更新指標
    currentIndex = index;
    prevIndex = (currentIndex - 1 + images.length) % images.length;
    nextIndex = (currentIndex + 1) % images.length;
    //更新當前圖片的html物件
    image.attr("src", images.eq(currentIndex).attr("src"));
  }
  //主頁至圖片牆
  function IndexToGallery() {
    //開始設置
    switchView("none");
    //時間設置
    const time = 1500;
    //動畫過程
    gsap
      .timeline({ defaults: { duration: time / 1000 / 2, ease: "set1" } })
      .to(".content", {
        autoAlpha: 0,
      })
      .to(".gallery", {
        autoAlpha: 1,
        onComplete: () => {
          switchView("gallery");
        },
      });
  }
  //圖片牆至主頁
  function GalleryToIndex() {
    //開始設置
    switchView("none");
    //時間設置
    const time = 1500;
    //動畫過程
    gsap
      .timeline({ defaults: { duration: time / 1000 / 2, ease: "set1" } })
      .to(".gallery", {
        autoAlpha: 0,
        onComplete: () => {
          window.scrollTo({
            top: 0,
            behavior: "instant",
          });
          $(".image-grid img").remove();
        },
      })
      .to(".content", {
        autoAlpha: 1,
        onComplete: () => {
          switchView("index");
        },
      });
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
        onComplete: () => gsap.set(image, { y: 0 }),
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
      .to(".close-btn, .nextImage-btn, .prevImage-btn", {
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
    gsap.set(".fullscreen-image-container", { zIndex: 3 });
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
            switchView("preview");
          },
        },
        "<"
      )
      .to(
        ".close-btn , .nextImage-btn, .prevImage-btn",
        {
          autoAlpha: 1,
        },
        "<"
      );
  }
  //開始動畫
  function Opening() {
    // 設置動畫前狀態
    gsap.set(".buttons-container", { display: "none" });
    // 動畫過程
    gsap
      .timeline({
        defaults: { duration: 0.5, ease: "power2.out" },
      })
      .to(".loading", {
        delay: 5,
        y: 375,
        scale: 0.3,
        autoAlpha: 0,
        duration: 0.5,
        onComplete: () => gsap.set(".loading-container", { autoAlpha: 0 }),
      })
      .from(
        ".title img, .title h1",
        {
          scale: 2,
          y: -100,
          stagger: 0.2,
          autoAlpha: 0,
          ease: "bounce.out",
        },
        ">-0.2"
      )
      .from(".title", {
        margin: 0,
        width: "100%",
        height: "100%",
        borderRadius: "0px",
        ease: "bounce.out",
        duration: 1,
        delay: 1,
        onComplete: () => gsap.set(".buttons-container", { display: "flex" }),
      })
      .from(".search-bar, .setting-btn, .stop-btn, .btn-wrapper", {
        autoAlpha: 0,
        stagger: 0.2,
        y: -100,
        scale: 2,
        ease: "bounce.out",
        onComplete: () => {
          switchView("index");
        },
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

  // 開始執行：
  // 初始化
  gsap.set(".gallery, .fullscreen-overlay", { autoAlpha: 0 }); //預設關閉圖片牆與全螢幕
  requestImage(afterRequests);

  //請求完成後邏輯(主程式)
  function afterRequests() {
    // 製作總圖片陣列
    imagesAll = [...imagesNature, ...imagesProps, ...imagesScene];

    // 載入動畫
    backgroundAnimation();
    hoverAnimation();
    Opening();

    //按鈕關閉app事件
    $(".stop-btn").on("click", function () {
      if (isIndex) {
        window.electronAPI.closeApp();
      }
    });

    //按鈕分頁事件
    $(".btn").on("click", function () {
      if (isIndex) {
        if ($(this).attr("data-image") === "Nature") {
          insertImages($(".image-grid"), imagesNature);
          images = $(".image-grid img");
        }
        if ($(this).attr("data-image") === "Props") {
          insertImages($(".image-grid"), imagesProps);
          images = $(".image-grid img");
        }
        if ($(this).attr("data-image") === "Scene") {
          insertImages($(".image-grid"), imagesScene);
          images = $(".image-grid img");
        }
        clickAnimation($(this).parent());
        IndexToGallery();
      }
    });

    // 按鈕圖片事件
    $(document).on("click", ".image-grid img", function () {
      if (isGallery) {
        assignImage($(this).index());
        clickAnimation($(this));
        GalleryToPreview();
      }
    });

    // 按鈕上一張事件
    $(".prevImage-btn").on("click", function () {
      if (isPreview) {
        clickAnimation($(this));
        assignImage(prevIndex);
      }
    });

    // 按鈕下一張事件
    $(".nextImage-btn").on("click", function () {
      if (isPreview) {
        clickAnimation($(this));
        assignImage(nextIndex);
      }
    });

    // 按鈕關閉全螢幕事件
    $(".close-btn").on("click", function () {
      if (isPreview) {
        clickAnimation($(this));
        PreviewToGallery();
      }
    });

    // 按鈕返回事件
    $(".back-to-home").on("click", function () {
      if (isGallery) {
        clickAnimation($(this));
        GalleryToIndex();
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
          assignImage(prevIndex);
          clickAnimation($(".prevImage-btn"));
        }
      }
      // 右側箭頭
      if (e.which === 39) {
        if (isPreview) {
          assignImage(nextIndex);
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
          lastX = e.pageX;
          lastY = e.pageY;
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
          enterFtime = Date.now();
        }
        if (isFullscreen) {
          translateX =
            translateX - (mouseX - window.innerWidth / 2) / 7 / scale;
          translateY =
            translateY - (mouseY - window.innerHeight / 2) / 7 / scale;
          scaleFac = e.shiftKey ? 0.2 : 0.1; //shift可以增加縮放速度
          scale += scaleFac;
          updateTransform(100, "linear");
          limitTranslation();
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
          //獲取速度 lim t->0 ((當前位置-最後位置)/t) = speed
          lastUpdate = setInterval(() => {
            lastX = mouseX;
            lastY = mouseY;
          }, 1);
          deltaX = (mouseX - lastX) / scale;
          deltaY = (mouseY - lastY) / scale;
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
  }
});
