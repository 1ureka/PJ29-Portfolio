// background.js

chrome.runtime.onMessage.addListener(async function (request, sender) {
  // 取得來源頁面id，以在執行完畢後傳回resolve
  const id = sender.tab.id;

  // Discord API 的目標 URL
  const url =
    "https://discord.com/api/v10/channels/1198635555253125240/messages?limit=100";

  // 提取金鑰
  const authorizationResponse = await fetch("authorization.json");
  const authorization = await authorizationResponse.json();
  if (!authorization.key) {
    console.log("無法驗證使用者");
    chrome.tabs.sendMessage(id, { status: "error" });
    return;
  }

  // 請求的標頭，包括 Bot 的授權令牌
  const headers = new Headers({
    Authorization: authorization.key,
  });

  // 用於存儲 API 響應數據的變數
  let responseData;

  try {
    //
    if (request.action === "GET") {
      // 如果是 GET 請求
      // 發送請求以獲取主要數據
      const mainDataResponse = await fetch(url, { headers: headers });

      // 將主要數據轉換為 JSON 格式
      responseData = await mainDataResponse.json();
      console.log("主要回應資料：", responseData);

      //
      const info = responseData.map((val) => {
        //
        let name, folder;

        if (val.content.includes(":::")) {
          [folder, name] = val.content.split(":::");
        } else {
          [folder, name] = [
            val.content,
            val.attachments[0].filename
              .replace(/_/g, " ")
              .replace(/\.[^.]+$/, ""),
          ];
        }

        //
        return {
          name,
          url: val.attachments[0].url,
          origin: val.attachments[1].url,
          size: val.attachments[0].size,
          timestamp: val.timestamp,
          folder,
        };
        //
      });

      //
      const urls = {};

      //
      info.forEach((val) => {
        const folder = val.folder;

        delete val.folder;

        if (urls[folder] === undefined) urls[folder] = [];

        urls[folder].push(val);
      });

      //
      Object.values(urls).forEach((val) =>
        val.sort(function (a, b) {
          return a.name.localeCompare(b.name, undefined, {
            sensitivity: "base",
          });
        })
      );

      chrome.tabs.sendMessage(id, { status: "ok", urls });

      //
    }
    //
  } catch (error) {
    //
    console.error(error);

    chrome.tabs.sendMessage(id, { status: "error" });
    //
  }
});
