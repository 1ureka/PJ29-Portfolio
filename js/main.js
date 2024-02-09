let inTransition = true;

function createBackground() {
  const waveBackground = new WaveBackground(-1);

  const loadingIcon = new LoadingIcon();
  loadingIcon.appendTo("body");

  const maskbackground = {
    show: () => {
      $("#mask-background").css({
        "backdrop-filter": "blur(5px) brightness(0.9)",
        "pointer-events": "all",
      });
    },
    hide: () => {
      $("#mask-background").css({
        "backdrop-filter": "",
        "pointer-events": "none",
      });
    },
  };

  return { waveBackground, maskbackground, loadingIcon };
}

async function login() {
  // 如果已經認證過則認證完成
  if (await checkInfo()) {
    $("#login-container").remove();
    return;
  }

  // 沒有認證過則顯示登入選單
  $(":root").css("--is-login", "0");

  // 開始監聽submit事件，並等待認證完成
  $("#login-container").on("submit", async function (e) {
    e.preventDefault();

    let username = $(this).find("input[type='text']").val();
    let password = $(this).find("input[type='password']").val();

    sessionStorage.setItem("username", username);
    sessionStorage.setItem("password", password);

    username = null;
    password = null;

    if (await checkInfo()) {
      $(":root").css("--is-login", "1");
      $(this).off("submit");
      window.dispatchEvent(new Event("login"));
      return;
    }

    if ($("#login-fail-message").length) {
      $("#login-fail-message").css("rotate", "15deg");
      await delay(100);
      $("#login-fail-message").css("rotate", "-15deg");
      await delay(100);
      $("#login-fail-message").css("rotate", "");
      return;
    }

    $("<span>錯誤的名稱或密碼</span>")
      .hide()
      .attr("id", "login-fail-message")
      .insertAfter($(this).find("button"))
      .slideDown(500);
  });

  // 等待認證完成
  await new Promise((resolve) =>
    window.addEventListener("login", resolve, { once: true })
  );

  // 等待login退出CSS動畫完成
  await delay(1500);
  $("#login-container").remove();
}

function createIndex() {
  const mainButtons = new MainButtons();
  mainButtons.appendTo("#sidebar");
  const addImagePopup = new AddImagePopup();
  addImagePopup.appendTo("body");
  const deleteImagePopup = new DeleteImagePopup();
  deleteImagePopup.appendTo("body");

  const headerBulb = new HeaderBulb({
    Nature: "#8ce197",
    Props: "#ffff7a",
    Scene: "#92e9ff",
  });
  headerBulb.appendTo("#header");

  const intro = new Intro();
  intro.appendTo("#content");

  return { mainButtons, addImagePopup, deleteImagePopup, headerBulb, intro };
}

function createGallery() {
  const gallery = new Gallery();
  const scrollButtons = new ScrollButtons();
  scrollButtons.appendTo("body");

  return { gallery, scrollButtons };
}

function createPreview(category, index) {}

$(document).ready(async function () {
  //
  // 初始化與等待登入
  const { waveBackground, maskbackground, loadingIcon } = createBackground();
  waveBackground.show();
  await login();

  //
  // 載入資源
  maskbackground.show();
  loadingIcon.show();
  const images = new Images();
  await images.syncImages();

  //
  // 創建首頁與圖片牆
  Intro.createURLStyle({
    background: {
      Scene: images.getImage("Scene", 0),
      Props: images.getImage("Props", 0),
      Nature: images.getImage("Nature", 3),
    },
    card: {
      Scene: images.getThumbnail("Scene", 0),
      Props: images.getThumbnail("Props", 0),
      Nature: images.getThumbnail("Nature", 3),
    },
  });

  const { gallery, scrollButtons } = createGallery();
  const { mainButtons, addImagePopup, deleteImagePopup, headerBulb, intro } =
    createIndex();

  intro.onSelect(async (e) => {
    if (inTransition) {
      console.log("停止執行了 intro.onSelect");
      return;
    }

    inTransition = true;

    if (e.type === "navigate") {
      //
      await intro.switchTab(e.target);
      headerBulb.switchLight(e.target);
      //
    } else {
      //
      const category = e.target;
      const fileList = await images.getList();
      console.log(fileList);
      const urls = fileList[category].map((name) =>
        images.getImage(category, name)
      );

      await intro.hide();

      waveBackground.show();
      scrollButtons.show();

      await delay(100);

      await gallery.show(urls);

      scrollButtons.scrollElement = gallery.element;
    }

    inTransition = false;
  });
  mainButtons.onSelect(async (option) => {
    if (inTransition) {
      console.log("停止執行了 mainButtons.onSelect");
      return;
    }

    inTransition = true;

    if (option === "新增") {
      //
      inTransition = false;
      // 使用者輸入
      let files = await new Promise((resolve) => {
        const html = `<input type="file" accept="image/*" multiple style="display:none;position:"fixed" />`;
        const input = $(html).appendTo("body");

        input.one("change", function () {
          resolve(this.files);
          $(this).remove();
        });

        input.click();
      });

      maskbackground.show();
      loadingIcon.show();

      // 判斷合法性
      if (!files.length) {
        alert("沒有選擇檔案");
        return;
      }
      files = Object.values(files).filter((file) => typeof file !== Number); // 排除length
      if (!files.every((file) => file.type.match("image.*"))) {
        alert("請選擇一個圖像文件");
        return;
      }

      // 壓縮圖片
      const compressTasks = files.map(async (file) => {
        const origin = await compressImage(file, 1920 * 2, 1080 * 2);
        const thumbnail = await compressImage(file, 1920, 1080);
        return {
          origin,
          thumbnail,
          name: file.name.replace(".png", ".webp"),
        };
      });
      const dataUrls = await Promise.all(compressTasks);

      // 製作預覽
      const previews = dataUrls.map((url) => {
        return { url1: url.origin, url2: url.thumbnail, title: url.name };
      });

      loadingIcon.hide();

      await delay(250);

      addImagePopup.show(previews);
      //
    } else if (option === "刪除") {
      maskbackground.show();
      const list = await images.getList();
      deleteImagePopup.show(list);
      //
    } else if (option === "同步") {
      loadingIcon.show();

      await images.syncImages();

      loadingIcon.hide();
    }

    inTransition = false;
  });
  addImagePopup.onClose(async () => {
    if (inTransition) {
      console.log("停止執行了 addImagePopup.onClose");
      return;
    }

    inTransition = true;

    await addImagePopup.hide();
    maskbackground.hide();

    inTransition = false;
  });
  addImagePopup.onSubmit(async (e) => {
    if (inTransition) {
      console.log("停止執行了 addImagePopup.onSelect");
      return;
    }

    inTransition = true;

    const { category, files } = e;

    const manifest = files.map((file) => {
      let { url1, url2, title } = file;
      url1 = dataUrlToBase64(url1);
      url2 = dataUrlToBase64(url2);
      return { category, url1, url2, name: title };
    });

    await addImagePopup.hide();
    loadingIcon.show();

    await images.addImages(manifest);

    maskbackground.hide();
    loadingIcon.hide();

    inTransition = false;
  });
  deleteImagePopup.onClose(async () => {
    if (inTransition) {
      console.log("停止執行了 deleteImagePopup.onClose");
      return;
    }

    inTransition = true;

    await deleteImagePopup.hide();
    maskbackground.hide();

    inTransition = false;
  });
  deleteImagePopup.onSelect(async (e) => {
    if (inTransition) {
      console.log("停止執行了 deleteImagePopup.onSelect");
      return;
    }

    inTransition = true;

    const { category, name, element } = e;

    element.hide(500, () => element.remove());
    loadingIcon.show();

    await images.deleteImages([{ category, name }]);

    loadingIcon.hide();

    inTransition = false;
  });
  gallery.onClose(async () => {
    if (inTransition) {
      console.log("停止執行了 gallery.onClose");
      return;
    }

    inTransition = true;

    $(".gallery .image-container").css("pointerEvents", "none");

    await delay(100);

    scrollButtons.hide();
    waveBackground.hide();

    await gallery.hide();
    await intro.show();

    inTransition = false;
  });
  gallery.onSelect((e) => {
    if (inTransition) {
      console.log("停止執行了 gallery.onSelect");
      return;
    }

    inTransition = true;

    console.log(e);

    inTransition = false;
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
  // const lightBox = new LightBox();
  // lightBox
  //   .onNext(async (url) => {
  //     if (inTransition) {
  //       console.log("停止執行了lightBox.onNext");
  //       return;
  //     }
  //     inTransition = true;

  //     await previewImage.hide();

  //     // 更新圖片名字
  //     const info = loadManager.findImageInfo(url);
  //     imageName.changeName(info.name);

  //     await Promise.all([
  //       lightBox.toNext(1),
  //       previewImage.show(info.origin, lightBox.category),
  //     ]);

  //     inTransition = false;
  //   })
  //   .onPrev(async (url) => {
  //     if (inTransition) {
  //       console.log("停止執行了lightBox.onPrev");
  //       return;
  //     }
  //     inTransition = true;

  //     await previewImage.hide();

  //     // 更新圖片名字
  //     const info = loadManager.findImageInfo(url);
  //     imageName.changeName(info.name);

  //     await Promise.all([
  //       lightBox.toPrev(1),
  //       previewImage.show(info.origin, lightBox.category),
  //     ]);

  //     inTransition = false;
  //   })
  //   .onSelect(async (url, index) => {
  //     if (inTransition) {
  //       console.log("停止執行了lightBox.onSelect");
  //       return;
  //     }
  //     inTransition = true;

  //     // 相同圖片不做處理
  //     if (index === 3) {
  //       console.log("lightBox: 按下了相同圖片");
  //       inTransition = false;
  //       return;
  //     }

  //     // 傳遞至previewImage
  //     await previewImage.hide();

  //     // 更新圖片名字
  //     const info = loadManager.findImageInfo(url);
  //     imageName.changeName(info.name);

  //     const pendingTasks = [previewImage.show(info.origin, lightBox.category)];

  //     // 傳遞至自身
  //     switch (index) {
  //       // 上兩張
  //       case 1:
  //         pendingTasks.push(lightBox.toPrev(2));
  //         break;
  //       // 上一張
  //       case 2:
  //         pendingTasks.push(lightBox.toPrev(1));
  //         break;
  //       // 下一張
  //       case 4:
  //         pendingTasks.push(lightBox.toNext(1));
  //         break;
  //       // 下兩張
  //       case 5:
  //         pendingTasks.push(lightBox.toNext(2));
  //         break;
  //       // 不存在
  //       default:
  //         console.error(`lightBox: 指標錯誤，index不應該為${index}`);
  //         break;
  //     }

  //     await Promise.all(pendingTasks);

  //     inTransition = false;
  //   });

  //
  // 創建內容
  const imageName = new ImageName();
  imageName.appendTo("#header");

  //
  // 載入完成
  waveBackground.hide();
  await delay(500);
  maskbackground.hide();
  loadingIcon.hide();

  //
  // 全局動畫
  const showFullContentsTl = gsap
    .timeline({ defaults: { ease: "set1", duration: 0.75 }, paused: true })
    .to("#content", { top: 0, left: 0 })
    .to("#header", { y: -110 }, "<")
    .to("#sidebar", { x: -300 }, "<")
    .to("#version-display", { y: 60 }, "<");

  const showMenuTl = gsap
    .timeline({ defaults: { ease: "power2.out", duration: 0.6 } })
    .to("#header, #sidebar, #version-display", { x: 0, y: 0, stagger: 0.35 });

  const opening = gsap.timeline({
    onComplete: () => {
      headerBulb.switchLight("Scene");
      intro.show();

      inTransition = false;
    },
    delay: 1,
    paused: true,
  });

  opening.add(showMenuTl).play();
});
