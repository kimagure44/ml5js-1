const inputFile = document.querySelector("#inputFile");
const image = document.querySelector("#image");
const loading = document.querySelector("#loading");
const article = document.querySelector("article");
const result = document.querySelector("#result");
const notify = document.querySelector(".notification");
const predict = document.querySelector("#predict");
const fileName = document.querySelector(".file-name");
const panelFile = document.querySelector(".file");
const panelURL = document.querySelector(".url");
const btnDownloadURL = document.querySelector("#btnDownloadURL");
const model = document.querySelector("#model");
const optionsTab = document.querySelectorAll(".tabs ul li");

const getBase64FromUrl = async url => {
  const data = await fetch(url);
  const blob = await data.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result;
      resolve(base64data);
    };
  });
};

const notification = ({ type, msn, timeout = 2000 }) => {
  notify.innerHTML = msn;
  notify.classList.add(`is-${type}`);
  notify.classList.remove("hidden");
  setTimeout(() => {
    notify.innerHTML = "";
    notify.classList.add("hidden");
    notify.classList.remove(`is-${type}`);
  }, timeout);
};

const changePanel = (panel, self) => {
  const prev = self.previousElementSibling;
  const next = self.nextElementSibling;
  prev ? prev.classList.remove("is-active") : next.classList.remove("is-active");
  self.classList.add("is-active");
  panelFile.classList[panel === "local" ? "remove" : "add"]("hidden");
  panelURL.classList[panel === "local" ? "add" : "remove"]("hidden");
};

const doPredict = async data => {
  try {
    let html = "";
    image.src = data.target?.result || (await getBase64FromUrl(data));
    image.classList.remove("hidden");
    loading.classList.remove("hidden");
    article.classList.add("loading-status");
    predict.classList.remove("hidden");
    result.innerHTML = html;
    if (model.value === "0") {
      throw new Error("Model not selected");
    }
    const results = await (
      await ml5.imageClassifier(model.value, {
        topk: 5,
      })
    ).predict(image);
    results.forEach((item) => {
      html += `<li>
                <div>${item.label}: ${Number.parseFloat(item.confidence * 100).toFixed(2)}%</div>
                <div><progress value='${item.confidence * 100}' max='100'></progress></div>
            </li>`;
    });
    result.innerHTML = html;
    article.classList.remove("loading-status");
    loading.classList.add("hidden");
    notification({ type: "success", msn: "Prediction completed!" });
  } catch (error) {
    result.innerHTML = "";
    article.classList.remove("loading-status");
    loading.classList.add("hidden");
    predict.classList.add("hidden");
    notification({ type: "danger", msn: error });
  }
};

optionsTab.forEach(item => {
  item.addEventListener("click", (evt) => {
    changePanel(evt.target.dataset.is, evt.target.parentElement);
  });
});

btnDownloadURL.addEventListener("click", () => {
  const urlDownload = document.querySelector("#urlDownload").value;
  urlDownload.length > 0
    ? doPredict(urlDownload)
    : notification({ type: "danger", msn: "Please, enter a valid URL" });
});

inputFile.addEventListener("change", () => {
  const reader = new FileReader();
  reader.readAsDataURL(this.files[0]);
  fileName.innerHTML = this.files[0].name;
  reader.onload = (evt) => doPredict(evt);
  reader.onerror = () => notification({ type: "danger", msn: reader.error });
});
