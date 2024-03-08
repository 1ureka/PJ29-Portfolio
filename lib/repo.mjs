import { Octokit } from "https://esm.sh/octokit";
let octokit;
let USERNAME;
let REPONAME;

/**
 * 延遲執行的 Promise 函式，用於等待一定的時間。
 * @param {number} ms - 要延遲的時間（毫秒）。
 * @returns {Promise<void>} 一個 Promise，在指定時間後被解析。
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const loggingPadding = [];
function log(str) {
  loggingPadding.push(1);
  $("#loading-info").text(str);
  $("#loading-info").fadeIn(350, async function () {
    await delay(1500);

    if (loggingPadding.length > 1) {
      loggingPadding.shift();
      return;
    } else {
      loggingPadding.shift();
      $("#loading-info").fadeOut(350);
    }
  });
}

// 認證的邏輯
window.addEventListener("check", async () => {
  log("身份認證中");

  octokit = new Octokit({
    auth: sessionStorage.getItem("password"),
  });

  USERNAME = sessionStorage.getItem("username");
  REPONAME = "Assets";

  let result;

  try {
    await octokit.rest.repos.get({
      owner: USERNAME,
      repo: REPONAME,
    });

    result = true;
  } catch (error) {
    result = false;
  }

  await delay(100);

  log("認證結果", result);

  const detail = { result };
  window.dispatchEvent(new CustomEvent("checkedResult", { detail }));
});

// 上傳文件的邏輯
window.addEventListener("uploadFile", async (e) => {
  const { file, path, message, id } = e.detail;
  const content = file;

  // 使用 getContent 方法獲取文件的 blob SHA，如果文件不存在，則設為null
  let sha;

  try {
    const existingFile = await octokit.rest.repos.getContent({
      owner: USERNAME,
      repo: REPONAME,
      path,
    });

    sha = existingFile.data.sha;
    log(`準備開始更新${path}，註解為${message}`);
  } catch (error) {
    sha = null;
    log(`準備開始創建${path}，註解為${message}`);
  }

  // 使用 createOrUpdateFileContents，如果文件不存在會創建，存在則會更新
  await octokit.rest.repos.createOrUpdateFileContents({
    owner: USERNAME,
    repo: REPONAME,
    path,
    message,
    content,
    sha,
  });

  log(`創建或更新${path}完成`);

  window.dispatchEvent(new Event(`uploadFileComplete${id}`));
});

// 下載文件的邏輯
window.addEventListener("loadFile", async (e) => {
  const { path, id } = e.detail;

  log(`準備開始載入${path}`);

  try {
    const fileContent = await octokit.rest.repos.getContent({
      owner: USERNAME,
      repo: REPONAME,
      path,
    });

    const detail = { content: fileContent.data.content };

    log(`載入${path}完成`);

    window.dispatchEvent(new CustomEvent(`loadFileComplete${id}`, { detail }));
  } catch (error) {
    console.error("無法讀取檔案:", error);
  }
});

// 刪除文件的邏輯
window.addEventListener("deleteFile", async (e) => {
  const { path, message, id } = e.detail;

  log(`準備開始刪除 ${path}`);

  try {
    const existingFile = await octokit.rest.repos.getContent({
      owner: USERNAME,
      repo: REPONAME,
      path,
    });

    const sha = existingFile.data.sha;

    await octokit.rest.repos.deleteFile({
      owner: USERNAME,
      repo: REPONAME,
      path,
      message,
      sha,
    });

    log(`刪除 ${path} 完成`);
  } catch (error) {
    console.error("無法刪除檔案:", error);
  }

  window.dispatchEvent(new Event(`deleteFileComplete${id}`));
});
