// Grandma's recipe book — page content + renderers. Depends on window.RECIPES.
const { useState: useStateBk } = React;

/* ---------- Extra editorial copy keyed by recipe id ---------- */
const ORIGINS = {
  feijoada: "Rio de Janeiro · Brasil",
  moqueca: "Bahia · Brasil",
  "risoto-cogumelos": "Norte da Itália",
  lasanha: "Bolonha · Itália",
  "pao-de-queijo": "Minas Gerais · Brasil",
  ramen: "Tóquio · Japão",
  tacos: "Cidade do México",
  "curry-grao": "Norte da Índia",
  brigadeiro: "Festa brasileira",
  caprese: "Capri · Itália",
  bobo: "Bahia · Brasil",
  tiramisu: "Vêneto · Itália",
};
const TIPS = {
  feijoada: "Faça na véspera. Descansada de um dia para o outro, ela fica ainda mais saborosa.",
  moqueca: "Panela de barro e fogo brando. Nunca deixe ferver forte, senão o peixe se desfaz.",
  "risoto-cogumelos": "Mantenha o caldo sempre quente ao lado — caldo frio para o cozimento por igual.",
  lasanha: "Monte na véspera e asse no dia. Descansada, ela corta em fatias certinhas.",
  "pao-de-queijo": "Polvilho azedo dá a casquinha; um pouco de doce, a maciez. O segredo é misturar os dois.",
  ramen: "O ovo é sagrado: seis minutos e meio cravados e um banho de água gelada logo depois.",
  tacos: "Uma fatia de abacaxi grelhado por cima equilibra a gordura da carne. Confie na vovó.",
  "curry-grao": "Toste o curry no óleo antes de tudo. É esse minutinho que solta todo o aroma.",
  brigadeiro: "O ponto é quando você inclina a panela e a massa desliza inteira do fundo.",
  caprese: "Tomate fora da geladeira tem o dobro do sabor. Tempere só na hora de servir.",
  bobo: "Bata parte da mandioca para o creme, mas deixe uns pedaços — textura é tudo.",
  tiramisu: "Não encharque os biscoitos. Um mergulho rápido no café e pronto, senão desmancha.",
};

/* ---------- Sections (chapters) by cuisine ---------- */
const SECTION_DEFS = [
  { cuisine: "Brasileira", title: "Sabores do Brasil", desc: "Do feijão de domingo ao docinho de festa — o tempero que aprendi na cozinha de casa." },
  { cuisine: "Italiana", title: "Cantina Italiana", desc: "Massas, risotos e doces que pedem mesa cheia, conversa boa e vinho na taça." },
  { cuisine: "Japonesa", title: "Conforto do Japão", desc: "Caldos longos e técnica paciente, servidos no aconchego de uma tigela fumegante." },
  { cuisine: "Mexicana", title: "Festa Mexicana", desc: "Cor, pimenta e alegria — comida para comer com as mãos e dividir com todos." },
  { cuisine: "Indiana", title: "Especiarias da Índia", desc: "Temperos tostados e curries cremosos que aquecem e abraçam quem senta à mesa." },
];

/* ---------- Restaurant-style menu (two facing pages) ---------- */
const MENU_A = [
  { label: "Para abrir", ids: ["caprese", "pao-de-queijo"] },
  { label: "Pratos principais", ids: ["feijoada", "moqueca", "bobo", "risoto-cogumelos"] },
];
const MENU_B = [
  { label: "Pratos principais", cont: true, ids: ["lasanha", "ramen", "tacos", "curry-grao"] },
  { label: "Doces & sobremesas", ids: ["brigadeiro", "tiramisu"] },
];

/* ---------- Build the flat page list ---------- */
function buildPages() {
  const pages = [];
  pages.push({ kind: "cover" });
  pages.push({ kind: "toc" });

  SECTION_DEFS.forEach((sec, si) => {
    const recipes = window.RECIPES.filter((r) => r.cuisine === sec.cuisine);
    pages.push({ kind: "section", sec, part: si + 1, recipes });
    pages.push({ kind: "section-photo", sec, part: si + 1 });
    recipes.forEach((r, ri) => {
      pages.push({ kind: "recipe", recipe: r, num: ri + 1, sec, part: si + 1 });
      pages.push({ kind: "method", recipe: r, num: ri + 1, sec, part: si + 1 });
    });
  });

  pages.push({ kind: "menu", groups: MENU_A, head: true });
  pages.push({ kind: "menu", groups: MENU_B, head: false });
  pages.push({ kind: "back" });
  if (pages.length % 2 !== 0) pages.push({ kind: "blank" });
  // assign printed folio numbers (start counting after cover+toc)
  let folio = 0;
  pages.forEach((p) => {
    if (p.kind === "cover" || p.kind === "toc" || p.kind === "blank") { p.folio = null; }
    else { folio += 1; p.folio = folio; }
  });
  return pages;
}

/* ---------- Stylized food "photo" (placeholder) ---------- */
function FoodPhoto({ recipe, tall }) {
  const h = recipe.hue;
  const bg = `radial-gradient(130% 120% at 28% 16%, hsl(${h} 58% 68%), hsl(${h} 52% 52%) 42%, hsl(${(h + 10) % 360} 46% 34%))`;
  return (
    <figure className={"photo" + (tall ? " photo--tall" : "")}>
      <div className="photo__img" style={{ background: bg }}>
        <div className="photo__grain" />
        <div className="photo__plate">
          <div className="photo__plate-in"><span style={{ fontFamily: "var(--head)" }}>{recipe.title[0]}</span></div>
        </div>
        <figcaption className="photo__cap">{recipe.title}</figcaption>
      </div>
    </figure>
  );
}

/* ---------- Decorative ornament ---------- */
function Ornament({ w = 120 }) {
  return (
    <svg className="orn" width={w} height="16" viewBox="0 0 120 16" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M2 8h36" /><path d="M118 8H82" />
      <path d="M48 8c3-4 6-4 6 0s3 4 6 0 6-4 6 0 3 4 6 0" />
      <circle cx="40" cy="8" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="80" cy="8" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ---------- Folio (page number) ---------- */
function Folio({ p, side }) {
  if (!p.folio) return null;
  return <span className={"folio folio--" + side}>{p.folio}</span>;
}

/* ===================== PAGE RENDERER ===================== */
function Page({ p, side, onJump, notes }) {
  if (!p) return <div className="pg pg--empty" />;

  if (p.kind === "blank") return <div className="pg pg--paper" />;

  /* ---- Cover ---- */
  if (p.kind === "cover") {
    return (
      <div className="pg pg--cover">
        <div className="cover__frame">
          <p className="cover__kick">Coleção de família</p>
          <Ornament w={130} />
          <h1 className="cover__title">Receituário<br />da Vovó</h1>
          <p className="cover__sub">Pratos de casa e de mundo, reunidos com carinho ao longo dos anos.</p>
          <Ornament w={130} />
          <p className="cover__sign">— anotado à mão, com amor</p>
        </div>
      </div>
    );
  }

  /* ---- Table of contents ---- */
  if (p.kind === "toc") {
    return (
      <div className="pg pg--paper pg--toc">
        <header className="pg__head">
          <p className="eyebrow">Para começar</p>
          <h2 className="pg__title">Sumário</h2>
          <Ornament w={110} />
        </header>
        <ul className="toc">
          {SECTION_DEFS.map((sec, i) => (
            <li key={sec.cuisine} className="toc__row" onClick={() => onJump && onJump({ kind: "section", cuisine: sec.cuisine })}>
              <span className="toc__part">{String(i + 1).padStart(2, "0")}</span>
              <span className="toc__name">{sec.title}</span>
              <span className="toc__dots" />
              <span className="toc__cuisine">{sec.cuisine}</span>
            </li>
          ))}
          <li className="toc__row toc__row--menu" onClick={() => onJump && onJump({ kind: "menu" })}>
            <span className="toc__part">✦</span>
            <span className="toc__name">Cardápio completo</span>
            <span className="toc__dots" />
            <span className="toc__cuisine">com fotos</span>
          </li>
        </ul>
        <p className="toc__note">Toque em um capítulo para ir direto até ele.</p>
      </div>
    );
  }

  /* ---- Section opener (left page) ---- */
  if (p.kind === "section") {
    return (
      <div className="pg pg--paper pg--section">
        <div className="section__top">
          <span className="section__partword">Parte</span>
          <span className="section__partnum">{String(p.part).padStart(2, "0")}</span>
        </div>
        <h2 className="section__title">{p.sec.title}</h2>
        <div className="section__band">{p.sec.desc}</div>
        <ol className="section__list">
          {p.recipes.map((r, i) => (
            <li key={r.id} onClick={() => onJump && onJump({ kind: "recipe", id: r.id })}>
              <span className="section__li-num">{i + 1}.</span>
              <span className="section__li-name">{r.title}</span>
            </li>
          ))}
        </ol>
        <Folio p={p} side={side} />
      </div>
    );
  }

  /* ---- Section opener (right page, full-bleed motif) ---- */
  if (p.kind === "section-photo") {
    return (
      <div className="pg pg--motif">
        <div className="photo__grain" />
        <div className="motif__inner">
          <span className="motif__cuisine">{p.sec.cuisine}</span>
          <span className="motif__big" style={{ fontFamily: "var(--head)" }}>{String(p.part).padStart(2, "0")}</span>
        </div>
        <Folio p={p} side={side} />
      </div>
    );
  }

  /* ---- Recipe page (photo + title + intro + ingredients) ---- */
  if (p.kind === "recipe") {
    const r = p.recipe;
    const intro = r.blurb;
    const first = intro.charAt(0);
    const rest = intro.slice(1);
    return (
      <div className="pg pg--paper pg--recipe">
        <FoodPhoto recipe={r} />
        <div className="rec__titlewrap">
          <span className="rec__num">{p.num}.</span>
          <h2 className="rec__title">{r.title}</h2>
        </div>
        <p className="rec__origin">{ORIGINS[r.id] || r.cuisine} · {r.category}</p>
        <p className="rec__intro"><span className="dropcap">{first}</span>{rest}</p>
        <div className="rec__ing">
          <h3 className="rec__ingttl">Ingredientes <span>· serve {r.servings}</span></h3>
          <ul className="ing">
            {r.ingredients.map((ing, i) => (
              <li key={i}><span className="ing__q">{ing.qty}</span><span className="ing__n">{ing.item}</span></li>
            ))}
          </ul>
        </div>
        <Folio p={p} side={side} />
      </div>
    );
  }

  /* ---- Method page (steps + grandma's tip) ---- */
  if (p.kind === "method") {
    const r = p.recipe;
    return (
      <div className="pg pg--paper pg--method">
        <div className="run-head"><span>{r.title}</span><span className="run-head__meta">{r.time} min · {r.difficulty}</span></div>
        <h3 className="method__ttl">Modo de preparo</h3>
        <ol className="steps">
          {r.steps.map((s, i) => (
            <li key={i}><span className="steps__n">{i + 1}</span><p>{s}</p></li>
          ))}
        </ol>
        {notes && (
          <aside className="tip">
            <span className="tip__pin" />
            <h4 className="tip__ttl">Cantinho da Vovó</h4>
            <p className="tip__txt">{TIPS[r.id]}</p>
          </aside>
        )}
        <Folio p={p} side={side} />
      </div>
    );
  }

  /* ---- Restaurant menu page ---- */
  if (p.kind === "menu") {
    const hueBg = (r) => `radial-gradient(130% 120% at 28% 16%, hsl(${r.hue} 58% 68%), hsl(${r.hue} 52% 52%) 42%, hsl(${(r.hue + 10) % 360} 46% 34%))`;
    return (
      <div className="pg pg--paper pg--menu">
        {p.head ? (
          <header className="menu__head">
            <p className="eyebrow">À la carte</p>
            <h2 className="pg__title">Cardápio</h2>
            <Ornament w={110} />
          </header>
        ) : (
          <header className="menu__head menu__head--cont"><span>Cardápio</span><Ornament w={64} /></header>
        )}
        {p.groups.map((g, gi) => (
          <section className="menu__group" key={gi}>
            <h3 className="menu__gh">{g.label}{g.cont ? <em> (cont.)</em> : null}</h3>
            <ul className="menu__list">
              {g.ids.map((id) => {
                const r = window.RECIPES.find((x) => x.id === id);
                return (
                  <li className="menu__item" key={id} onClick={() => onJump && onJump({ kind: "recipe", id })}>
                    <span className="menu__thumb" style={{ background: hueBg(r) }}><span style={{ fontFamily: "var(--head)" }}>{r.title[0]}</span></span>
                    <div className="menu__info">
                      <div className="menu__namerow">
                        <span className="menu__name">{r.title}</span>
                        <span className="menu__leader" />
                        <span className="menu__price">{r.time} min</span>
                      </div>
                      <p className="menu__desc">{r.blurb}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
        <Folio p={p} side={side} />
      </div>
    );
  }

  /* ---- Back page ---- */
  if (p.kind === "back") {
    return (
      <div className="pg pg--paper pg--back">
        <Ornament w={120} />
        <h2 className="back__ttl">Bom apetite!</h2>
        <p className="back__txt">Que estas receitas encontrem sempre uma mesa cheia e gente querida em volta. Cozinhar é cuidar.</p>
        <p className="cover__sign">— da cozinha da vovó para a sua</p>
        <Ornament w={120} />
        <Folio p={p} side={side} />
      </div>
    );
  }

  return <div className="pg pg--paper" />;
}

window.Book = { buildPages, Page, SECTION_DEFS };
