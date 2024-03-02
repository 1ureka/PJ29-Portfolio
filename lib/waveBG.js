class WaveBackground {
  constructor(zIndex) {
    const staticStyleText = `
        :root {
            --is-waveBG-show : 0;
        }

        .wave-bg {
            position: fixed;
            width: 100%;
            height: 100vh;
            background: transparent;
            overflow: hidden;
            z-index: ${zIndex};
            pointer-events: none;
            opacity: var(--is-waveBG-show);
            translate: 0px calc(100px - var(--is-waveBG-show) * 100px);
            transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .wave-bg > .air {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 100px;
            background: url(lib/wave.png);
            background-size: 1000px 100px;
            filter: drop-shadow(0px 0px 15px)
        }
    `;

    $("<style>").text(staticStyleText).appendTo("head");

    const config = [
      { duration: 40, opacity: 1, delay: 0, bottom: 0, scale: 1, x: 0 },
      { duration: 25, opacity: 0.5, delay: 0, bottom: 10, scale: 1, x: 500 },
      { duration: 40, opacity: 0.2, delay: -6, bottom: 15, scale: 1.5, x: 250 },
      { duration: 15, opacity: 0.7, delay: -8, bottom: 0, scale: 1.5, x: 750 },
    ];

    const dynamicStyleText = config
      .map(
        (value, i) => `.wave-bg > .air.air${i}{
        animation: wave${i} ${
          value.duration
        }s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
        opacity: ${value.opacity};
        animation-delay: ${value.delay}s;
        bottom: ${value.bottom}px;
        scale: 1 ${value.scale};
    }
    @keyframes wave${i}{
        0%{
          background-position-x: ${value.x}px; 
        }
        100%{
          background-position-x: ${i % 2 ? value.x - 1000 : value.x + 1000}px;
        }
      }
    `
      )
      .join("\n");

    $("<style>").text(dynamicStyleText).appendTo("head");

    this.waveSection = $("<section>", { class: "wave-bg" });
    this.airsArray = config.map((_, i) =>
      $("<div>")
        .addClass("air air" + i)
        .appendTo(this.waveSection)
    );

    this.waveSection.appendTo("body");
  }

  show() {
    $(":root").css("--is-waveBG-show", "1");
  }

  hide() {
    $(":root").css("--is-waveBG-show", "0");
  }
}
