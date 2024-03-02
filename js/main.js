let inTransition = true;

function createBackground() {
  const waveBackground = new WaveBackground(-1);

  const loadingIcon = new LoadingIcon();
  loadingIcon.appendTo("body");

  const maskbackground = {
    show: (blur = 5, brightness = 0.9) => {
      $("#mask-background").css({
        "backdrop-filter": `blur(${blur}px) brightness(${brightness})`,
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
  const headerButton = new HeaderButton();
  headerButton.appendTo("#header");
  const header = { bulb: headerBulb, button: headerButton };

  const intro = new Intro();
  intro.appendTo("#content");

  return { mainButtons, addImagePopup, deleteImagePopup, header, intro };
}

function createGallery() {
  const gallery = new Gallery();
  const scrollButtons = new ScrollButtons();
  scrollButtons.appendTo("body");

  return { gallery, scrollButtons };
}

function createPreview() {
  const preview = new Preview();
  return { preview };
}

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
  const backgroundImages = await Promise.all([
    images.getImage("Scene", 0),
    images.getImage("Props", 0),
    images.getImage("Nature", 3),
  ]);

  const thumbnailImages = await Promise.all([
    images.getThumbnail("Scene", 0),
    images.getThumbnail("Props", 0),
    images.getThumbnail("Nature", 3),
  ]);

  Intro.createURLStyle({
    background: {
      Scene: backgroundImages[0],
      Props: backgroundImages[1],
      Nature: backgroundImages[2],
    },
    card: {
      Scene: thumbnailImages[0],
      Props: thumbnailImages[1],
      Nature: thumbnailImages[2],
    },
  });

  const { mainButtons, addImagePopup, deleteImagePopup, header, intro } =
    createIndex();

  const { gallery, scrollButtons } = createGallery();

  const { preview } = createPreview();

  //
  // 註冊組件間的交互邏輯
  intro.onSelect(async (e) => {
    if (inTransition) {
      console.log("停止執行了 intro.onSelect");
      return;
    }

    inTransition = true;

    if (e.type === "navigate") {
      //
      await intro.switchTab(e.target);
      header.bulb.switchLight(e.target);
      //
    } else {
      //
      maskbackground.show();
      loadingIcon.show();

      const category = e.target;
      const fileList = await images.getList();
      const urls = await Promise.all(
        fileList[category].map((name) => images.getThumbnail(category, name))
      );

      maskbackground.hide();
      loadingIcon.hide();

      await intro.hide();

      waveBackground.show();
      scrollButtons.show();

      await delay(100);

      await Promise.all([gallery.show(urls), header.button.show()]);

      scrollButtons.scrollElement = gallery.element;
    }

    inTransition = false;
  });
  gallery.onSelect(async (index) => {
    if (inTransition) {
      console.log("停止執行了 gallery.onSelect");
      return;
    }

    inTransition = true;

    const category = intro.category;
    const fileList = await images.getList();
    const urls = await Promise.all(
      fileList[category].map((name) => images.getThumbnail(category, name))
    );

    await Promise.all([mainButtons.hide(), gallery.hide()]);
    await preview.show(urls, index);

    inTransition = false;
  });
  header.button.onClick(async () => {
    if (inTransition) {
      console.log("停止執行了 mainButtons.onSelect");
      return;
    }

    inTransition = true;

    if (gallery._isShow) {
      $(".gallery .image-container").css("pointerEvents", "none");

      await delay(100);

      scrollButtons.hide();
      waveBackground.hide();

      await Promise.all([header.button.hide(), gallery.hide()]);
      await intro.show();
      //
    } else if (preview._isShow) {
      //
      const category = intro.category;
      const fileList = await images.getList();
      const urls = await Promise.all(
        fileList[category].map((name) => images.getThumbnail(category, name))
      );

      await preview.hide();
      await Promise.all([mainButtons.show(), gallery.show(urls)]);
      //
    } else {
      //
      console.log("現在不應該按到返回按鈕才對啊");
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

  //
  // 載入完成
  waveBackground.hide();
  await delay(500);
  maskbackground.hide();
  loadingIcon.hide();

  //
  // 開場動畫
  await delay(500);

  const opening = gsap
    .timeline({ defaults: { ease: "power2.out", duration: 0.6 }, paused: true })
    .to("#header, #sidebar, #version-display", { x: 0, y: 0, stagger: 0.35 });

  opening.play();
  await new Promise((resolve) => {
    opening.eventCallback("onComplete", resolve);
  });

  header.bulb.switchLight("Scene");

  await Promise.all([intro.show(), mainButtons.show()]);

  inTransition = false;
});
