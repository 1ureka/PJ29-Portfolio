import { Octokit } from "https://esm.sh/octokit";
let octokit;
let USERNAME;
let REPONAME;

// 認證的邏輯
window.addEventListener("check", async () => {
  console.log("身份認證中");

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

  console.log("認證結果", result);

  const detail = { result };
  window.dispatchEvent(new CustomEvent("checkedResult", { detail }));
});

// 上傳文件的邏輯
window.addEventListener("uploadFile", async (e) => {
  const { file, path, message } = e.detail;
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
    console.log(`準備開始更新${path}，註解為${message}`);
  } catch (error) {
    sha = null;
    console.log(`準備開始創建${path}，註解為${message}`);
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

  console.log(`創建或更新${path}完成`);

  window.dispatchEvent(new Event("uploadFileComplete"));
});

// 下載文件的邏輯
window.addEventListener("loadFile", async (e) => {
  const { path } = e.detail;

  console.log(`準備開始載入${path}`);

  try {
    const fileContent = await octokit.rest.repos.getContent({
      owner: USERNAME,
      repo: REPONAME,
      path,
    });

    const detail = { content: fileContent.data.content };

    window.dispatchEvent(new CustomEvent("loadFileComplete", { detail }));
  } catch (error) {
    console.error("無法讀取檔案:", error);
  }
});
