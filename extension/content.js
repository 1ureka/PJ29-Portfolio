// content.js (Content Script)

async function loadUrls() {
  await chrome.runtime.sendMessage({ action: "GET" });

  const response = await new Promise((resolve) => {
    chrome.runtime.onMessage.addListener(resolve);
  });

  console.log("載入完成");

  return response.urls;
}

const handleLoadUrls = async () => {
  window.removeEventListener("loadUrls", handleLoadUrls);

  try {
    //
    const urls = await loadUrls();
    const event = new CustomEvent("urlsLoaded", {
      detail: urls,
    });

    console.log("loadUrls 完成：", urls);
    window.dispatchEvent(event);
    //
  } catch (error) {
    //
    console.error("loadUrls 發生錯誤:", error);
    //
  } finally {
    //
    window.addEventListener("loadUrls", handleLoadUrls);
    //
  }
};

window.addEventListener("loadUrls", handleLoadUrls);
