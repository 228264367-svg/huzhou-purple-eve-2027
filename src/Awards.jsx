import { useState, useRef } from "react";
import { prizes } from "./prizes.js";
function makeCertificate(name, award) {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 1120;
  const ctx = canvas.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 900, 1120);
  g.addColorStop(0, "#f6f0eb");
  g.addColorStop(0.51, "#decde9");
  g.addColorStop(1, "#bb97d2");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 900, 1120);
  ctx.strokeStyle = "#6c4775";
  ctx.lineWidth = 2;
  ctx.strokeRect(38, 38, 824, 1044);
  ctx.strokeRect(46, 46, 808, 1028);
  ctx.textAlign = "center";
  function line(
    text,
    y,
    size,
    style = "600",
    font = '"Microsoft YaHei", sans-serif',
  ) {
    ctx.fillStyle = "#35203b";
    ctx.font = `${style} ${size}px ${font}`;
    ctx.fillText(text, 450, y, 750);
  }
  line("湖 州　／　好 友 跨 年", 140, 29);
  line("Afterglow", 324, 110, "italic", "Instrument, Georgia, serif");
  line("✦", 438, 69);
  line("紫色年终奖", 520, 38);
  line(award[0], 628, 67, "bold");
  line("颁给  " + (name.trim() || "我的朋友"), 716, 41);
  const pieces = Array.from(award[1]);
  let row = "";
  let baseline = 816;
  ctx.font = "30px sans-serif";
  for (const ch of pieces) {
    if (ctx.measureText(row + ch).width > 670) {
      line(row, baseline, 30, "400");
      row = "";
      baseline += 48;
    }
    row += ch;
  }
  line(row, baseline, 30, "400");
  line("12.31.2026   —   01.01.2027", 1010, 25, "500", "Georgia");
  return canvas.toDataURL("image/png");
}
export function Awards() {
  const [name, setName] = useState(""),
    [active, setActive] = useState(null),
    [turn, setTurn] = useState(0),
    [image, setImage] = useState("");
  const bag = useRef([]),
    dialog = useRef(null);
  function draw() {
    if (!bag.current.length) {
      bag.current = prizes.map((_, i) => i);
      for (let i = bag.current.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag.current[i], bag.current[j]] = [bag.current[j], bag.current[i]];
      }
      if (bag.current.at(-1) === active) bag.current.reverse();
    }
    setActive(bag.current.pop());
    setTurn((t) => t + 1);
  }
  function save() {
    setImage(makeCertificate(name, prizes[active]));
    dialog.current.showModal();
  }
  return (
    <section id="awards" className="awards">
      <div className="wrap awardsgrid">
        <div>
          <div className="sectionmark">Friends’ Choice</div>
          <h2>紫色年终奖</h2>
          <p>
            每人带一份 20
            元以内的紫色小礼物。人齐后轮流当颁奖人，把这一年的笑点，郑重颁给一位朋友。
          </p>
          <label className="namelabel" htmlFor="friend">
            这张奖想颁给谁？
          </label>
          <input
            id="friend"
            maxLength={18}
            placeholder="写朋友的昵称"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="actions">
            <button className="lightbtn" onClick={draw}>
              {active === null ? "揭晓第一张奖" : "再抽一张"}　✧
            </button>
            {active !== null && (
              <button className="savebtn" onClick={save}>
                保存奖状 ↗
              </button>
            )}
          </div>
        </div>
        <div className="awardstage">
          <div className="medal" key={turn} aria-live="polite">
            <span>湖州 · 好友限定</span>
            <i>Afterglow</i>
            <div className="seal">✷</div>
            <h3>{active === null ? "紫色年终奖" : prizes[active][0]}</h3>
            <strong>
              {active === null
                ? "等待颁发"
                : "颁给 " + (name.trim() || "我的朋友")}
            </strong>
            <p>{active === null ? "2026 年 12 月 31 日" : prizes[active][1]}</p>
            {active !== null && <small>配套礼物 · {prizes[active][2]}</small>}
          </div>
          {turn > 0 && (
            <div key={"f" + turn} className="confetti" aria-hidden="true">
              {Array.from({ length: 18 }, (_, i) => (
                <b
                  key={i}
                  style={{
                    "--x": `${(i * 47) % 103}%`,
                    "--d": `${(i % 6) * 0.055}s`,
                    "--r": `${i * 47}deg`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <dialog
        ref={dialog}
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current.close();
        }}
      >
        <div className="modalbar">
          <b>你的专属奖状</b>
          <button aria-label="关闭奖状" onClick={() => dialog.current.close()}>
            ×
          </button>
        </div>
        {image && <img src={image} alt="可长按保存的专属奖状" />}
        <div className="modalbar">
          <small>手机可长按图片保存</small>
          <a download="紫色年终奖.png" href={image}>
            下载 PNG ↓
          </a>
        </div>
      </dialog>
    </section>
  );
}
