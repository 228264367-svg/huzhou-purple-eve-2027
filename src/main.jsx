import { useState } from "react";
import { createRoot } from "react-dom/client";
import { Sculpture } from "./Sculpture.jsx";
import { Awards } from "./Awards.jsx";
import { Route, TravelNotes } from "./Guide.jsx";
const outfits = [
  ["香芋紫", "#ceb4df", "米白大衣搭香芋紫围巾。拍合照时，把围巾放在外面。"],
  ["藤萝紫", "#a689bd", "浅灰外套配藤萝紫毛衣，怕冷就戴一双同色手套。"],
  ["葡萄紫", "#78508e", "黑色羽绒服搭葡萄紫针织帽，在老街里一眼就能认出你。"],
  ["梅子紫", "#6f3d60", "梅子紫外套配牛仔裤，也可以只背一个同色小包。"],
];
function Header() {
  return (
    <header>
      <div className="wrap nav">
        <a className="brand" href="#top">
          <b>✳</b> Afterglow
        </a>
        <nav aria-label="页面导航">
          <a href="#route">行程</a>
          <a href="#dress">穿搭</a>
          <a href="#awards">颁奖 ↗</a>
        </nav>
      </div>
    </header>
  );
}
function Hero() {
  return (
    <section className="hero">
      <div className="wrap heroGrid">
        <div className="intro">
          <div className="over">
            <em /> 湖州 · 好友跨年邀请函
          </div>
          <h1>
            <i>
              Afterglow<span>.</span>
            </i>
            <strong>午夜花火</strong>
          </h1>
          <p>
            穿一抹紫，泡一池热汤。
            <br />
            零点之前，把今年的奖颁给你。
          </p>
          <a className="pill" href="#route">
            看完整行程 <span>↗</span>
          </a>
        </div>
        <Sculpture />
        <div className="heroFoot">
          <span>
            2026.12.31 <i>—</i> 2027.01.01
          </span>
          <span>浙江 · 湖州　/　两天一夜</span>
        </div>
      </div>
    </section>
  );
}
function Dress() {
  const [chosen, setChosen] = useState(0);
  let start = 0;
  const [name, hex, tip] = outfits[chosen];
  return (
    <section id="dress" className="dress">
      <div className="wrap dressGrid">
        <div>
          <div className="sectionmark">Dress code</div>
          <h2>挑一抹你的紫</h2>
          <p>合照里露出一点紫，就算入场。</p>
          <div className="colors">
            {outfits.map(([title, color], i) => (
              <button
                key={title}
                aria-label={title}
                aria-pressed={chosen === i}
                style={{ "--chip": color }}
                onClick={() => setChosen(i)}
              >
                <b />
                {title}
              </button>
            ))}
          </div>
        </div>
        <div
          className="fabric"
          style={{ "--fabric": hex }}
          onTouchStart={(e) => (start = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            const delta = e.changedTouches[0].clientX - start;
            if (Math.abs(delta) > 40)
              setChosen((i) => (i + (delta < 0 ? 1 : 3)) % 4);
          }}
        >
          <div className="fabricLight" />
          <div className="fabricText" key={name} aria-live="polite">
            <small>{hex.toUpperCase()}</small>
            <h3>{name}</h3>
            <p>{tip}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
function App() {
  return (
    <>
      <a className="skip" href="#route">
        跳到行程
      </a>
      <Header />
      <main id="top">
        <Hero />
        <div className="wrap triplinks" aria-label="攻略目录">
          <a href="#route">两日行程 ↓</a>
          <a href="#stay">温泉与预算 ↓</a>
          <a href="#dress">紫色穿搭 ↓</a>
          <a href="#awards">好友颁奖 ↓</a>
        </div>
        <Route />
        <Dress />
        <Awards />
        <TravelNotes />
      </main>
      <footer>
        <div className="wrap">
          <i>Afterglow.</i>
          <a href="#top">回到花火 ↑</a>
        </div>
      </footer>
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);
