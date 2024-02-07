class LoadingIcon {
  constructor() {
    let icon = $(".loading-wrapper");
    if (!icon.length) icon = LoadingIcon.init();

    this.element = icon;
  }

  static init() {
    $("<style>")
      .text(
        `
        :root {
            --is-loading-icon-show: 0;
        }
        .loading-icon-wrapper {
            width: 120px;
            height: 60px;
            left: -20px;
            position: relative;
            z-index: 1;
            opacity: var(--is-loading-icon-show);
            transition: 0.35s;
        }
        .loading-icon-circle {
            width: 20px;
            height: 20px;
            position: absolute;
            border-radius: 50%;
            background-color: #fff;
            left: 15%;
            transform-origin: 50%;
            animation: loading-icon-circle 0.6s alternate infinite ease;
        }
        .loading-icon-circle:nth-child(1) {
            background-color: #8ce197;
        }
        .loading-icon-circle:nth-child(2) {
            background-color: #92e9ff;
        }
        .loading-icon-circle:nth-child(3) {
            background-color: #ffff7a;
        }
        .loading-icon-circle:nth-child(4) {
            background-color: #ea81af;
        }
        @keyframes loading-icon-circle {
            0% {
                top: 60px;
                height: 5px;
                border-radius: 50px 50px 25px 25px;
                transform: scaleX(1.7);
            }
            40% {
                height: 20px;
                border-radius: 50%;
                transform: scaleX(1);
            }
            100% {
                top: 0%;
            }
        }
        .loading-icon-circle:nth-child(2) {
            left: 45%;
            animation-delay: 0.1s;
        }
        .loading-icon-circle:nth-child(3) {
            left: 75%;
            animation-delay: 0.25s;
        }
        .loading-icon-circle:nth-child(4) {
            left: 105%;
            animation-delay: 0.45s;
        }
        .loading-icon-shadow {
            width: 20px;
            height: 4px;
            border-radius: 50%;
            background-color: rgba(0, 0, 0, 0.9);
            position: absolute;
            top: 62px;
            transform-origin: 50%;
            z-index: -1;
            left: 15%;
            filter: blur(1px);
            animation: loading-icon-shadow 0.6s alternate infinite ease;
        }
        @keyframes loading-icon-shadow {
            0% {
                transform: scaleX(1.5);
            }
            40% {
                transform: scaleX(1);
                opacity: 0.7;
            }
            100% {
                transform: scaleX(0.2);
                opacity: 0.4;
            }
        }
        .loading-icon-shadow:nth-child(5) {
            left: 45%;
            animation-delay: 0.1s;
        }
        .loading-icon-shadow:nth-child(6) {
            left: 75%;
            animation-delay: 0.25s;
        }
        .loading-icon-shadow:nth-child(7) {
            left: 105%;
            animation-delay: 0.45s;
        }
    `
      )
      .appendTo("head");

    const wrapper = $("<div>").addClass("loading-icon-wrapper");

    const array = [0, 1, 2, 3];

    array.forEach(() =>
      $("<div>").addClass("loading-icon-circle").appendTo(wrapper)
    );
    array.forEach(() =>
      $("<div>").addClass("loading-icon-shadow").appendTo(wrapper)
    );

    return wrapper;
  }

  appendTo(selector) {
    this.element.appendTo(selector);

    return this;
  }

  show() {
    $(":root").css("--is-loading-icon-show", 1);
  }

  hide() {
    $(":root").css("--is-loading-icon-show", 0);
  }
}
