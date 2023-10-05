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
  let isIndex = true;
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
    let imagesLeft = [];
    let imagesRight = [];
    let imagesMiddle = [];
    // 隨機排序images陣列
    gsap.utils.shuffle(imagesAll);
    // 將images陣列分成左中右
    const cut1 = Math.floor(imagesAll.length / 3);
    const cut2 = Math.floor((2 * imagesAll.length) / 3);
    const arr1 = imagesAll.slice(0, cut1);
    const arr2 = imagesAll.slice(cut1, cut2);
    const arr3 = imagesAll.slice(cut2);
    imagesLeft = [...arr1, ...arr2, ...arr3];
    imagesRight = [...arr2, ...arr3, ...arr1];
    imagesMiddle = [...arr3, ...arr1, ...arr2];
    // 插入圖片至
    for (let i = 0; i < 2; i++) {
      insertImages($(".moving-images.left"), imagesLeft);
      insertImages($(".moving-images.right"), imagesRight);
      insertImages($(".moving-images.middle"), imagesMiddle);
    }
    gsap.to(
      $(".moving-images.left, .moving-images.right, .moving-images.middle"),
      {
        duration: (imagesAll.length / 3) * 30,
        y: "50%",
        repeat: -1,
        ease: "linear",
      }
    );
  }
  //按鈕點擊動畫
  function clickAnimation(element) {
    const time = 400; //總時長
    element.css({
      transition:
        "all " + time / 1000 / 2 + "s cubic-bezier(0.455, 0.03, 0.515, 0.955)",
      transform: "translateY(15px)",
    });
    setTimeout(() => {
      element.removeAttr("style");
      element.css({
        transition:
          "all " +
          time / 1000 / 2 +
          "s cubic-bezier(0.455, 0.03, 0.515, 0.955)",
        opacity: "1",
      });
      setTimeout(() => {
        element.removeAttr("style");
        element.css({ opacity: "1" });
      }, time / 2);
    }, time / 2);
  }
  // 插入圖片至指定容器 (未來也可用來放置圖片牆ex: ($(.image-grid), imagesNature))
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
    switchView("preview");
    $("body").css({ "overflow-y": "hidden" });
    //時間設置
    const time = 1000;
    //動畫過程
    gsap
      .timeline({
        defaults: { autoAlpha: 1, ease: "set1" },
      })
      .to(".fullscreen-overlay", { duration: (time / 1000) * (3 / 5) })
      .to(image, { duration: (time / 1000) * (3 / 5) }, "<")
      .to(".close-btn, .nextImage-btn, .prevImage-btn", {
        stagger: { amount: (time / 1000) * (2 / 5), ease: "none" },
      });
  }
  //預覽至圖片牆
  function PreviewToGallery() {
    //開始設置
    switchView("gallery");
    $("body").css({ "overflow-y": "visible" });
    //時間設置
    const time = 1000;
    //動畫過程
    gsap
      .timeline({
        defaults: { autoAlpha: 0, ease: "set1" },
      })
      .to(".close-btn, .nextImage-btn, .prevImage-btn", {
        stagger: { amount: (time / 1000) * (2 / 5), ease: "none" },
      })
      .to(image, { duration: (time / 1000) * (3 / 5) })
      .to(".fullscreen-overlay", { duration: (time / 1000) * (3 / 5) }, "<");
  }
  //預覽至全螢幕
  function PreviewToFullscreen() {
    //開始設置
    switchView("none");
    gsap.set(".fullscreen-image-container", { zIndex: 4 });
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
    gsap.set(".fullscreen-image-container", { zIndex: 2 });
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
  gsap.set(
    ".gallery, .fullscreen-overlay, .fullscreen-image-container img, .close-btn, .nextImage-btn, .prevImage-btn",
    { autoAlpha: 0 }
  ); //預設關閉圖片牆與全螢幕與全螢幕之物件
  requestImage(afterRequests);

  //請求完成後邏輯(主程式)
  function afterRequests() {
    // 製作總圖片陣列
    imagesAll = [...imagesNature, ...imagesProps, ...imagesScene];

    // 載入動畫
    backgroundAnimation();

    // 載入完成事件
    setTimeout(() => {
      $(".loading-container").fadeOut(2000);
    }, 1500);

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
