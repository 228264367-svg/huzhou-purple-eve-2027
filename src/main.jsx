import { useState } from "react";
import { createRoot } from "react-dom/client";
import { Sculpture } from "./Sculpture.jsx";
import { Awards } from "./Awards.jsx";
const outfits = [
  ["香芋紫", "#ceb4df", "米白大衣搭香芋紫围巾。拍合照时，把围巾放在外面。"],
  ["藤萝紫", "#a689bd", "浅灰外套配藤萝紫毛衣，怕冷就戴一双同色手套。"],
  ["葡萄紫", "#78508e", "黑色羽绒服搭葡萄紫针织帽，在老街里一眼就能认出你。"],
  ["梅子紫", "#6f3d60", "梅子紫外套配牛仔裤，也可以只背一个同色小包。"],
];
const day = [
  ["12:00", "衣裳街", "馄饨、千张包分着尝，再跟去过的朋友找一家她想回访的店。"],
  ["14:00", "小西街", "沿河散步，从浅紫到深紫排好，拍下全员第一张合照。"],
  [
    "16:30",
    "南太湖泡汤",
    "先入住，再拎上泳衣、干衣袜和湿衣袋去太湖月亮温泉。19:00 左右在住处附近吃饭。",
  ],
  [
    "22:30",
    "回房颁奖",
    "带上紫色小礼物，轮流念颁奖词。23:58 架好手机，一起倒数。",
  ],
  ["元旦", "睡醒再回家", "天气好就去太湖边散步，吃顿热午饭再返程。"],
];
const late = [
  ["下班后", "住处集合", "群里报到达时间，先到的朋友点好热菜。"],
  ["22:30", "回房颁奖", "人齐就开场，给朋友念颁奖词。零点拍下新年第一张合照。"],
  ["元旦上午", "老街早午饭", "去衣裳街吃馄饨，再逛小西街。"],
  ["元旦下午", "南太湖泡汤", "按确认的场馆时间入场，泡完温泉再返程。"],
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
          <a className="pill" href="#awards">
            去给朋友颁奖 <span>↗</span>
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
function Route() {
  const [route, setRoute] = useState(0),
    [step, setStep] = useState(0);
  const stations = route ? late : day;
  return (
    <section id="route" className="route wrap">
      <div className="sectionHead">
        <div>
          <div className="sectionmark">The itinerary</div>
          <h2>一起去湖州</h2>
        </div>
        <div className="switch">
          {["中午到", "下班走"].map((s, i) => (
            <button
              key={s}
              aria-pressed={route === i}
              onClick={() => {
                setRoute(i);
                setStep(0);
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div
        className="stations"
        style={{ "--progress": (step / (stations.length - 1)) * 100 + "%" }}
      >
        <div className="rail">
          <b />
        </div>
        {stations.map(([time, place], i) => (
          <button
            key={place}
            aria-pressed={i === step}
            onClick={() => setStep(i)}
          >
            <small>{time}</small>
            <em />
            <b>{place}</b>
          </button>
        ))}
      </div>
      <div className="stop" key={route + "-" + step} aria-live="polite">
        <i>{stations[step][0]}</i>
        <div>
          <h3>{stations[step][1]}</h3>
          <p>{stations[step][2]}</p>
        </div>
        <button
          aria-label="下一站"
          onClick={() => setStep((s) => (s + 1) % stations.length)}
        >
          →
        </button>
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
        <Route />
        <Dress />
        <Awards />
        <section className="wrap info">
          <h2>出发前碰头</h2>
          <p>
            群里报一下 31 号最早几点能走。人均 600
            元先作讨论，房型、温泉票和元旦能否入场，以订房时确认为准。
          </p>
        </section>
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
