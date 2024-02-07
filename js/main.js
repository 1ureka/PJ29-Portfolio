$(document).ready(async function () {
  const waveBackground = new WaveBackground(-1);
  waveBackground.show();

  const loadingIcon = new LoadingIcon();
  loadingIcon.appendTo("#loading-container > div").show();

  let inTransition = true;

  //
  // 驗證與載入url
  const loadUrls = async () => {
    const timeoutDuration = 5000;

    const event = await new Promise((resolve) => {
      const interval = setInterval(
        () => window.dispatchEvent(new Event("loadUrls")),
        500
      );

      const timeout = setTimeout(() => {
        clearInterval(interval);
        console.error("無法載入雲端資料");
        alert("無法載入雲端資料，無法使用");
      }, timeoutDuration);

      window.addEventListener(
        "urlsLoaded",
        (e) => {
          clearInterval(interval);
          clearTimeout(timeout);
          resolve(e);
        },
        { once: true }
      );
    });

    return event.detail;
  };

  const fileCollection = await loadUrls();

  //
  // 載入圖片
  const loadManager = new LoadManager();
  loadManager.onProgress((log) => {
    $("#loading-message").text(log.name);
    $("#progress-bar").css("width", `${log.state}%`);
  });
  await loadManager.load(fileCollection);

  await delay(375);
  waveBackground.hide();

  //
  // 創建主要按鈕
  const mainButtons = new MainButtons();
  mainButtons.appendTo("#sidebar").onSelect((option) => console.log(option));

  //
  // 創建header燈泡
  const headerBulb = new HeaderBulb({
    Nature: "#8ce197",
    Props: "#ffff7a",
    Scene: "#92e9ff",
  });
  headerBulb.appendTo("#header");

  //
  // 創建首頁內容
  Intro.createURLStyle({
    background: {
      Scene: loadManager.getImage("scene", 0).origin,
      Props: loadManager.getImage("props", 0).origin,
      Nature: loadManager.getImage("nature", 3).origin,
    },
    card: {
      Scene: loadManager.getImage("scene", 0).src,
      Props: loadManager.getImage("props", 0).src,
      Nature: loadManager.getImage("nature", 3).src,
    },
  });
  const intro = new Intro();
  intro.appendTo("#content");
  intro.onSelect(async (e) => {
    if (e.type === "navigate") {
      await intro.switchTab(e.target);
      headerBulb.switchLight(e.target);
    } else {
      console.log(`往${e.target}`);
    }
  });

  //
  // 創建上下按鈕
  const scrollButtons = new ScrollButtons();
  scrollButtons.appendTo("body");

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
      if (inTransition) {
        console.log("停止執行了gallery.onSelect");
        return;
      }

      inTransition = true;

      const index = e.parent().index();
      const url = imageArray[index].origin;

      await delay(50); // 點擊效果所需時間
      await gallery[category].hide();
      await Promise.all([scrollButtons.hide()]);
      await previewImage.show(url, category);

      previewButtons.show();
      lightBox.show(index, gallery[category].urls, category);
      imageName.show(loadManager.findImageInfo(url).name);

      inTransition = false;
    });
  });

  //
  // 創建內容
  const previewImage = new PreviewImage();
  previewImage.appendTo("#content").onClose(async () => {
    if (inTransition) {
      console.log("停止執行了previewImage.onClose");
      return;
    }
    inTransition = true;

    await Promise.all([delay(100), previewImage.switchMode()]);
    await previewImage.hideCloseButton();

    showFullContentsTl.reverse();

    inTransition = false;
  });

  //
  // 創建預覽時的選單按鈕
  const previewButtons = new PreviewButtons();
  previewButtons.appendTo("#sidebar").onSelect(async (e) => {
    if (inTransition) {
      console.log("停止執行了previewButtons.onSelect");
      return;
    }

    inTransition = true;

    const targetClass = $(e.target).attr("class");
    const category = previewImage.category;

    if (targetClass === "return-button") {
      await previewImage.hide();
      await Promise.all([
        previewButtons.hide(),
        imageName.hide(),
        lightBox.hide(),
      ]);
      await gallery[category].show();

      scrollButtons.show();

      scrollButtons.scrollElement = gallery[category].element;
    }

    if (targetClass === "fullscreen-button") {
      showFullContentsTl.play();
      showFullContentsTl.eventCallback("onComplete", null);
      await new Promise((resolve) => {
        showFullContentsTl.eventCallback("onComplete", resolve);
      });

      previewImage.switchMode();
      previewImage.showCloseButton();
    }

    inTransition = false;
  });

  //
  // 創建內容
  const lightBox = new LightBox();
  lightBox
    .onNext(async (url) => {
      if (inTransition) {
        console.log("停止執行了lightBox.onNext");
        return;
      }
      inTransition = true;

      await previewImage.hide();

      // 更新圖片名字
      const info = loadManager.findImageInfo(url);
      imageName.changeName(info.name);

      await Promise.all([
        lightBox.toNext(1),
        previewImage.show(info.origin, lightBox.category),
      ]);

      inTransition = false;
    })
    .onPrev(async (url) => {
      if (inTransition) {
        console.log("停止執行了lightBox.onPrev");
        return;
      }
      inTransition = true;

      await previewImage.hide();

      // 更新圖片名字
      const info = loadManager.findImageInfo(url);
      imageName.changeName(info.name);

      await Promise.all([
        lightBox.toPrev(1),
        previewImage.show(info.origin, lightBox.category),
      ]);

      inTransition = false;
    })
    .onSelect(async (url, index) => {
      if (inTransition) {
        console.log("停止執行了lightBox.onSelect");
        return;
      }
      inTransition = true;

      // 相同圖片不做處理
      if (index === 3) {
        console.log("lightBox: 按下了相同圖片");
        inTransition = false;
        return;
      }

      // 傳遞至previewImage
      await previewImage.hide();

      // 更新圖片名字
      const info = loadManager.findImageInfo(url);
      imageName.changeName(info.name);

      const pendingTasks = [previewImage.show(info.origin, lightBox.category)];

      // 傳遞至自身
      switch (index) {
        // 上兩張
        case 1:
          pendingTasks.push(lightBox.toPrev(2));
          break;
        // 上一張
        case 2:
          pendingTasks.push(lightBox.toPrev(1));
          break;
        // 下一張
        case 4:
          pendingTasks.push(lightBox.toNext(1));
          break;
        // 下兩張
        case 5:
          pendingTasks.push(lightBox.toNext(2));
          break;
        // 不存在
        default:
          console.error(`lightBox: 指標錯誤，index不應該為${index}`);
          break;
      }

      await Promise.all(pendingTasks);

      inTransition = false;
    });

  //
  // 創建內容
  const imageName = new ImageName();
  imageName.appendTo("#header");

  //
  // 過場
  const switchGallery = async (category) => {
    const keys = Object.keys(gallery);

    await Promise.all(keys.map((key) => gallery[key].hide()));

    await Promise.all(keys.map((key) => gallery[key].toggle(category === key)));
  };

  //
  // 全局動畫
  const showFullContentsTl = gsap
    .timeline({ defaults: { ease: "set1", duration: 0.75 }, paused: true })
    .to("#content", { top: 0, left: 0 })
    .to("#header", { y: -110 }, "<")
    .to("#sidebar", { x: -300 }, "<")
    .to("#version-display", { y: 60 }, "<");

  const hideLoadingTl = gsap
    .timeline({ defaults: { ease: "power2.out", duration: 0.4 } })
    .to("#loading-container", { scale: 0.5, ease: "back.in(6)" })
    .to("#loading-container", { autoAlpha: 0, duration: 0.6 }, "<")
    .to("#progress-bar", { autoAlpha: 0, y: 5, duration: 0.6 }, "<");

  const showMenuTl = gsap
    .timeline({ defaults: { ease: "power2.out", duration: 0.6 } })
    .to("#header, #sidebar, #version-display", { x: 0, y: 0, stagger: 0.35 });

  const opening = gsap.timeline({
    onComplete: () => {
      $("#loading-container").remove();
      headerBulb.switchLight("Scene");
      intro.show();

      inTransition = false;
    },
    delay: 1,
    paused: true,
  });

  opening.add(hideLoadingTl).add(showMenuTl).play();
});
