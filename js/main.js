// component
/** @type {WaveBackground}  */ let WAVE_BG;
/** @type {LoadingIcon}     */ let LOADING_ICON;
/** @type {MainButtons}     */ let MAIN_BUTTONS;
/** @type {AddImagePopup}   */ let ADD_POPUP;
/** @type {DeleteImagePopup}*/ let DEL_POPUP;
/** @type {header}          */ let HEADER;
/** @type {Intro}           */ let INTRO;
/** @type {Preview}         */ let PREVIEW;
/** @type {LightBox}        */ let LIGHTBOX;

// var
/** @type {"Scene" | "Props" | "Nature"}*/ let CATEGORY = "Scene";
/** @type {Boolean}                     */ let IN_TRANSITION = true;
/** @type {Images}                      */ const IMAGES = new Images();
/** @type {CustomCanvas}                */ let CANVAS;

function createPre() {
  WAVE_BG = new WaveBackground(-1);
  LOADING_ICON = new LoadingIcon();
  LOADING_ICON.appendTo("body");
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

function createSidebar() {
  MAIN_BUTTONS = new MainButtons();
  ADD_POPUP = new AddImagePopup();
  DEL_POPUP = new DeleteImagePopup();

  MAIN_BUTTONS.appendTo("#sidebar");
  ADD_POPUP.appendTo("#popup-container");
  DEL_POPUP.appendTo("#popup-container");
}

function createHeader() {
  HEADER = new Header({
    Nature: "#8ce197",
    Props: "#ffff7a",
    Scene: "#92e9ff",
  });
}

async function createIntro() {
  const backgroundImages = await Promise.all([
    IMAGES.getImage("Scene", 0),
    IMAGES.getImage("Props", 0),
    IMAGES.getImage("Nature", 3),
  ]);

  const thumbnailImages = await Promise.all([
    IMAGES.getThumbnail("Scene", 0),
    IMAGES.getThumbnail("Props", 0),
    IMAGES.getThumbnail("Nature", 3),
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

  INTRO = new Intro();
  INTRO.appendTo("#content");
}

function createGallery() {
  PREVIEW = new Preview();
  LIGHTBOX = new LightBox();

  PREVIEW.appendTo("#content");
  LIGHTBOX.appendTo("#sidebar");
}

async function loadingWrapper(handler) {
  let isLoading = true;
  (async function () {
    await delay(1500);
    if (!isLoading) return;
    LOADING_ICON.show();
  })();

  await handler();

  isLoading = false;
  LOADING_ICON.hide();
}

async function transitionWrapper(handler) {
  if (IN_TRANSITION) {
    console.log(`停止執行了 ${handler}`);
    return;
  }

  IN_TRANSITION = true;
  await handler();
  IN_TRANSITION = false;
}

function bindNavEvents() {
  const navHandler = async (target) => {
    CATEGORY = target;
    await INTRO.switchTab(target);
    HEADER.switchLight(target);
  };

  const learnMoreHandler = async () => {
    // hide
    await Promise.all([MAIN_BUTTONS.hide(), INTRO.hide()]);
    INTRO.toggleClass("blur", true);
    await delay(375); // for blur

    // loading
    let title, urls, originUrl;
    await loadingWrapper(async () => {
      const fileList = await IMAGES.getList();
      title = fileList[CATEGORY][0];
      originUrl = await IMAGES.getImage(CATEGORY, 0);
      urls = await Promise.all(
        fileList[CATEGORY].map((name) => IMAGES.getThumbnail(CATEGORY, name))
      );
    });

    // show
    CANVAS.paintImage(originUrl);
    await Promise.all([
      PREVIEW.show(title),
      LIGHTBOX.show(urls, 0),
      HEADER.show(),
    ]);
  };

  const returnHandler = async () => {
    // hide
    await delay(150); // for button active animate
    await Promise.all([HEADER.hide(), PREVIEW.hide(), LIGHTBOX.hide()]);

    // show
    INTRO.toggleClass("blur", false);
    await Promise.all([MAIN_BUTTONS.show(), INTRO.show()]);
  };

  const lightboxHandler = async (index) => {
    await loadingWrapper(async () => {
      const fileList = await IMAGES.getList();
      const title = fileList[CATEGORY][index];

      const results = await Promise.all([
        IMAGES.getImage(CATEGORY, index),
        PREVIEW.hide(),
      ]);

      const url = results[0];
      CANVAS.paintImage(url);
      await PREVIEW.show(title);
    });
  };

  INTRO.onSelect((e) => {
    transitionWrapper(async () => {
      if (e.type === "navigate") await navHandler(e.target);
      if (e.type === "learnMore") await learnMoreHandler();
    });
  });

  HEADER.onReturn(() => {
    transitionWrapper(async () => {
      await returnHandler();
    });
  });

  LIGHTBOX.onSelect((index) => {
    transitionWrapper(async () => {
      await lightboxHandler(index);
    });
  });
}

function bindMainEvents() {
  const enterAddHandler = async () => {
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

    LOADING_ICON.show();

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
    const dataUrls = await Promise.all(
      files.map(async (file) => {
        const origin = await compressImage(file, 1920 * 2, 1080 * 2);
        const thumbnail = await compressImage(file, 1920, 1080);
        return {
          origin,
          thumbnail,
          name: file.name.replace(".png", ".webp"),
        };
      })
    );

    // 製作預覽
    const items = dataUrls.map((url) => {
      return { url1: url.origin, url2: url.thumbnail, title: url.name };
    });

    LOADING_ICON.hide();
    await delay(250); // for LOADING_ICON.hide();
    ADD_POPUP.show(items);
  };

  const enterDelHandler = async () => {
    const items = await IMAGES.getList();
    DEL_POPUP.show(items);
  };

  const syncHandler = async () => {
    LOADING_ICON.show();
    await IMAGES.syncImages();
    LOADING_ICON.hide();
  };

  MAIN_BUTTONS.onSelect(async (option) => {
    transitionWrapper(async () => {
      if (option === "新增") await enterAddHandler();
      if (option === "刪除") await enterDelHandler();
      if (option === "同步") await syncHandler();
    });
  });

  ADD_POPUP.onClose(async () => {
    transitionWrapper(async () => {
      await ADD_POPUP.hide();
    });
  });

  ADD_POPUP.onSubmit(async (e) => {
    transitionWrapper(async () => {
      const { category, files } = e;

      const manifest = files.map((file) => {
        let { url1, url2, title } = file;
        url1 = dataUrlToBase64(url1);
        url2 = dataUrlToBase64(url2);
        return { category, url1, url2, name: title };
      });

      await ADD_POPUP.hide();
      LOADING_ICON.show();
      await IMAGES.addImages(manifest);
      LOADING_ICON.hide();
    });
  });

  DEL_POPUP.onClose(async () => {
    transitionWrapper(async () => {
      await DEL_POPUP.hide();
    });
  });

  DEL_POPUP.onSelect(async (e) => {
    transitionWrapper(async () => {
      const { category, name, element } = e;

      element.hide(500, () => element.remove());

      LOADING_ICON.show();
      await IMAGES.deleteImages([{ category, name }]);
      LOADING_ICON.hide();
    });
  });
}

$(document).ready(async function () {
  // 登入
  createPre();
  WAVE_BG.show();
  await login();

  // 載入資源
  LOADING_ICON.show();
  await IMAGES.syncImages();

  // 創建組件
  await createIntro();
  createHeader();
  createGallery();
  createSidebar();
  CANVAS = new CustomCanvas(".preview-image-container");

  // 註冊組件間的交互邏輯
  bindNavEvents();
  bindMainEvents();

  // 隱藏載入畫面
  INTRO.toggleClass("blur", true);
  WAVE_BG.hide();
  await delay(500); // for WAVE_BG.hide();
  LOADING_ICON.hide();
  await delay(500); // for LOADING_ICON.hide();

  // 開場動畫
  const opening = gsap
    .timeline({ defaults: { ease: "power2.out", duration: 0.6 }, paused: true })
    .to("#header, #sidebar, #version-display", { x: 0, y: 0, stagger: 0.35 })
    .to("#content", { autoAlpha: 1, ease: "none", duration: 1 }, "<");

  opening.play();
  INTRO.toggleClass("blur", false);
  await new Promise((resolve) => opening.eventCallback("onComplete", resolve));

  HEADER.switchLight("Scene");
  await Promise.all([INTRO.show(), MAIN_BUTTONS.show()]);

  IN_TRANSITION = false;
});
