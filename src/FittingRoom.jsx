import { useEffect, useRef, useState } from "react";
import { generateFit, preparePhoto } from "./fit-api.js";
const samples = [
  { url: "assets/fit-model.webp" },
  { url: "assets/fit-garment.webp" },
];
const example = "assets/fit-demo.webp";
function Compare({ before, after, caption }) {
  const [split, setSplit] = useState(32);
  return (
    <figure className="fit-figure">
      <div className="fit-stage">
        <img alt="试穿后的搭配" src={after} />
        <img
          className="original"
          style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
          alt="人物原图"
          src={before}
        />
        <div className="fit-divider" style={{ left: split + "%" }}>
          <b>↔</b>
        </div>
        <span className="fit-left">原图</span>
        <span className="fit-right">试穿</span>
        <input
          aria-label="滑动比较试穿前后"
          type="range"
          min="0"
          max="100"
          value={split}
          onChange={(e) => setSplit(Number(e.target.value))}
        />
      </div>
      <figcaption>{caption} · 拖动看前后对比</figcaption>
    </figure>
  );
}
export function FittingRoom() {
  const [inputs, setInputs] = useState(samples),
    [category, setCategory] = useState("tops"),
    [kind, setKind] = useState("model"),
    [result, setResult] = useState(example),
    [busy, setBusy] = useState(false),
    [preparing, setPreparing] = useState(false),
    [message, setMessage] = useState("");
  const controller = useRef(null),
    urls = useRef(new Set()),
    generation = useRef(0);
  function remember(blob) {
    const url = URL.createObjectURL(blob);
    urls.current.add(url);
    return url;
  }
  function release(url) {
    if (urls.current.delete(url)) URL.revokeObjectURL(url);
  }
  useEffect(
    () => () => {
      generation.current++;
      controller.current?.abort();
      for (const url of urls.current) URL.revokeObjectURL(url);
    },
    [],
  );
  function clearResult() {
    release(result);
    setResult(null);
    setMessage("");
  }
  async function choose(event, index) {
    const file = event.target.files[0];
    event.target.value = "";
    if (!file) return;
    const version = ++generation.current;
    setPreparing(true);
    try {
      const blob = await preparePhoto(file);
      if (version !== generation.current) return;
      const next = [...inputs];
      release(next[index].url);
      next[index] = { url: remember(blob), blob };
      setInputs(next);
      clearResult();
      if (index === 1) setKind("flat-lay");
    } catch (error) {
      if (version === generation.current)
        setMessage(error.message || "无法读取这张照片。");
    } finally {
      if (version === generation.current) setPreparing(false);
    }
  }
  function reset() {
    generation.current++;
    inputs.forEach((item) => release(item.url));
    clearResult();
    setInputs(samples);
    setKind("model");
    setCategory("tops");
    setResult(example);
  }
  async function run() {
    if (controller.current || preparing) return;
    const task = new AbortController();
    controller.current = task;
    setBusy(true);
    setMessage("正在发送两张照片…");
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      task.abort();
    }, 180000);
    try {
      const blob = await generateFit(
        inputs,
        category,
        kind,
        task.signal,
        setMessage,
      );
      if (task.signal.aborted) return;
      release(result);
      setResult(remember(blob));
      setMessage("试穿图已生成，可滑动对比或保存图片。");
    } catch (error) {
      setMessage(
        task.signal.aborted
          ? timedOut
            ? "等待超过三分钟。可稍后重新试穿。"
            : "已停止等待。已送达的任务可能仍在运行。"
          : error instanceof TypeError
            ? "无法连接公共试穿服务，请检查网络或稍后再试。"
            : error.message,
      );
    } finally {
      clearTimeout(timer);
      controller.current = null;
      setBusy(false);
    }
  }
  const locked = busy || preparing;
  return (
    <div id="fitting" className="wrap fitting">
      <div className="fit-head">
        <div className="sectionmark">Fitting room</div>
        <h2>把这件衣服穿上看看</h2>
        <p>用示例模特试自己的衣服，或换成自己的正面照。</p>
      </div>
      <div className="fit-grid">
        <div className="fit-controls">
          <div className="fit-inputs">
            {["人物照", "衣服照"].map((name, i) => (
              <label className="fit-photo" key={name}>
                <img loading="lazy" src={inputs[i].url} alt={name + "预览"} />
                <b>{name}</b>
                <span>{i === 0 ? "换人物" : "换衣服"} ↑</span>
                <input
                  disabled={locked}
                  type="file"
                  aria-label={"选择" + name}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => choose(e, i)}
                />
              </label>
            ))}
          </div>
          <p className="fit-hint">
            人物选光线清楚、手臂自然放开的照片。衣服可以平铺拍，也可以用模特展示图。支持
            JPG、PNG、WebP，每张上限 15 MB。
          </p>
          <div className="fit-options">
            <label>
              衣服类别
              <select
                disabled={locked}
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  clearResult();
                }}
              >
                <option value="tops">上装</option>
                <option value="bottoms">下装</option>
                <option value="one-pieces">连衣裙 / 连体装</option>
              </select>
            </label>
            <label>
              衣服拍摄方式
              <select
                disabled={locked}
                value={kind}
                onChange={(e) => {
                  setKind(e.target.value);
                  clearResult();
                }}
              >
                <option value="flat-lay">平铺单品</option>
                <option value="model">模特上身</option>
              </select>
            </label>
          </div>
          <p className="fit-hint">
            选图后先在本机预览。点击生成会将两张照片发送至 FASHN 在 Hugging Face
            的公共演示服务。请选用获准分享的照片，或直接使用示例人物。
          </p>
          <div className="fit-actions">
            <button
              type="button"
              className="fit-run"
              onClick={run}
              disabled={locked}
            >
              {busy
                ? "生成中…"
                : preparing
                  ? "正在读取…"
                  : "发送两张照片并试穿 ↗"}
            </button>
            {busy ? (
              <button onClick={() => controller.current?.abort()}>
                停止等待
              </button>
            ) : (
              <button onClick={reset} disabled={preparing}>
                恢复示例
              </button>
            )}
          </div>
          <p className="fit-status" role="status">
            {message}
          </p>
        </div>
        <div>
          {result ? (
            <>
              <Compare
                before={inputs[0].url}
                after={result}
                caption={
                  result === example
                    ? "紫色上衣 · 预先生成的示例"
                    : "本次 AI 试穿"
                }
              />
              {result !== example && (
                <a
                  className="fit-save"
                  href={result}
                  download="湖州跨年试穿.webp"
                >
                  保存试穿图 ↓
                </a>
              )}
            </>
          ) : (
            <div className="fit-wait">
              <img alt="待试穿人物" src={inputs[0].url} />
              <span>{busy ? "正在制作试穿图…" : "选好衣服，点生成试穿"}</span>
            </div>
          )}
        </div>
      </div>
      <p className="fit-source">
        试穿使用{" "}
        <a
          target="_blank"
          rel="noreferrer"
          href="https://github.com/fashn-AI/fashn-vton-1.5"
        >
          FASHN VTON 1.5 ↗
        </a>
        。生成图可参考配色与款式，尺码请看衣服实测数据。
      </p>
    </div>
  );
}
