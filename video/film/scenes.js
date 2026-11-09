// Deterministic film engine: window.render(t) draws the frame at time t (seconds).
const T = window.TIMELINE;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const easeOut = (t) => 1 - Math.pow(1 - clamp(t), 3);
const easeInOut = (t) => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const appear = (lt, at, len = 0.5) => easeOut((lt - at) / len);
const h = (html) => { const d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstChild; };
const stage = document.getElementById("stage");
const PAGE_W = 1440; // css width of the captured pages
const FRAME_W = 1440;

function lerpCam(cams, lt) {
  if (cams.length === 1) return cams[0];
  for (let i = 0; i < cams.length - 1; i++) {
    const a = cams[i], b = cams[i + 1];
    if (lt <= b.t) {
      const k = easeInOut((lt - a.t) / Math.max(0.001, b.t - a.t));
      return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z + (b.z - a.z) * k };
    }
  }
  return cams[cams.length - 1];
}

const SCENES = {
  kinetic(p) {
    const el = h(`<section class="scene center"><div style="display:flex;flex-direction:column;gap:26px;max-width:1500px"></div></section>`);
    const box = el.firstChild;
    const lines = p.lines.map((ln) => {
      const row = h(`<div class="serif" style="font-size:${ln.size || 120}px;line-height:1.05;letter-spacing:-0.02em;color:${ln.accent ? "var(--accent)" : "var(--ink)"}"></div>`);
      const words = ln.text.split(" ").map((w) => { const s = h(`<span class="word">${w}&nbsp;</span>`); row.appendChild(s); return s; });
      box.appendChild(row);
      return { ln, words };
    });
    return { el, update(lt) {
      for (const { ln, words } of lines) words.forEach((w, i) => {
        const a = appear(lt, ln.at + i * 0.09, 0.55);
        w.style.opacity = a; w.style.transform = `translateY(${(1 - a) * 24}px)`;
        w.style.filter = `blur(${(1 - a) * 6}px)`;
      });
    } };
  },

  problem(p) {
    const el = h(`<section class="scene center"><div class="serif" style="font-size:96px;line-height:1.2;max-width:1500px"></div><div style="display:flex;gap:22px;margin-top:70px"></div></section>`);
    const [txt, chips] = el.children;
    const parts = p.sentence.map((s) => { const sp = h(`<span>${s.text} </span>`); txt.appendChild(sp); return { s, sp }; });
    const chipEls = p.chips.map((c) => { const e = h(`<span class="chip">${c}</span>`); chips.appendChild(e); return e; });
    return { el, update(lt) {
      for (const { s, sp } of parts) {
        const a = appear(lt, s.at, 0.4);
        sp.style.opacity = a;
        if (s.slip) {
          const k = clamp((lt - s.at - 0.6) / 0.5);
          sp.style.color = k > 0 ? "var(--slip)" : "var(--ink)";
          sp.style.textDecoration = k > 0 ? "line-through" : "none";
          sp.style.textDecorationThickness = "5px";
        }
      }
      chipEls.forEach((c, i) => { const a = appear(lt, p.chipsAt + i * 0.25); c.style.opacity = a; c.style.transform = `translateY(${(1 - a) * 20}px)`; });
    } };
  },

  intro(p) {
    const el = h(`<section class="scene">
      <div class="center" style="position:absolute;inset:0">
        <div style="display:flex;align-items:baseline;gap:18px"><span class="serif" style="font-size:230px;font-style:italic;letter-spacing:-0.03em">Bolo</span><span style="width:34px;height:34px;border-radius:17px;background:var(--accent)"></span></div>
        <div style="font-size:44px;color:var(--ink2);margin-top:10px">A speaking coach for engineers</div>
      </div>
      <div class="frame" style="top:120%"><div class="bar"><span></span><span></span><span></span><div class="url">bolo-kohl.vercel.app</div></div><div class="view"><img src="${p.src}"></div></div>
    </section>`);
    const [logo, frame] = el.children; const img = frame.querySelector("img");
    img.style.width = FRAME_W + "px";
    return { el, update(lt) {
      const a = appear(lt, 0.1, 0.9);
      logo.style.opacity = a * (1 - easeInOut((lt - p.frameAt) / 0.9));
      logo.style.transform = `scale(${0.94 + 0.06 * a}) translateY(${-easeInOut((lt - p.frameAt) / 0.9) * 120}px)`;
      const f = easeInOut((lt - p.frameAt) / 1.1);
      frame.style.top = `${120 - f * 70}%`;
      img.style.transform = `translateY(${-easeInOut((lt - p.frameAt - 1.4) / 3) * 160}px)`;
    } };
  },

  pipeline(p) {
    const el = h(`<section class="scene center"><div style="display:flex;align-items:center;gap:0"></div><div class="serif" style="font-size:40px;color:var(--ink3);margin-top:70px;font-style:italic"></div></section>`);
    const [row, foot] = el.children; foot.textContent = p.foot || "";
    const nodes = p.nodes.map((n, i) => {
      if (i) row.appendChild(h(`<div class="arrow"></div>`));
      const e = h(`<div class="node"><h4>${n.title}</h4><p>${n.sub}</p></div>`); row.appendChild(e); return e;
    });
    const arrows = [...row.querySelectorAll(".arrow")];
    return { el, update(lt) {
      nodes.forEach((n, i) => {
        const a = appear(lt, i * 0.18, 0.5);
        n.style.opacity = a; n.style.transform = `translateY(${(1 - a) * 30}px)`;
        n.classList.toggle("on", lt >= p.lights[i]);
      });
      arrows.forEach((ar, i) => ar.classList.toggle("on", lt >= p.lights[i + 1]));
      foot.style.opacity = appear(lt, p.footAt ?? 99);
    } };
  },

  ladder(p) {
    const el = h(`<section class="scene center"><div class="serif" style="font-size:64px;margin-bottom:80px">${p.title}</div><div style="display:flex;gap:40px;align-items:flex-end"></div></section>`);
    const row = el.children[1];
    const rungs = p.rungs.map((r, i) => { const e = h(`<div class="rung"><div class="bar2"></div><div class="lbl">${i + 1}. ${r}</div></div>`); e.style.marginBottom = `${i * 60}px`; row.appendChild(e); return e; });
    return { el, update(lt) {
      rungs.forEach((r, i) => { r.classList.toggle("on", lt >= p.lights[i]); const a = appear(lt, i * 0.12); r.style.opacity = a; });
    } };
  },

  shot(p) {
    const el = h(`<section class="scene"><div class="frame"><div class="bar"><span></span><span></span><span></span><div class="url">bolo-kohl.vercel.app</div></div><div class="view"></div></div>${p.tag ? `<div class="tag"><b></b>${p.tag}</div>` : ""}</section>`);
    const view = el.querySelector(".view");
    const srcs = p.frames || [p.src];
    const imgs = srcs.map((s) => { const i = h(`<img src="${s}">`); i.style.width = PAGE_W + "px"; view.appendChild(i); return i; });
    const frame = el.querySelector(".frame");
    return { el, update(lt) {
      const cam = lerpCam(p.cams || [{ t: 0, x: 0, y: 0, z: 1 }], lt);
      const k = (FRAME_W / PAGE_W) * cam.z;
      let idx = 0;
      if (p.frames) idx = Math.min(imgs.length - 1, Math.floor(Math.max(0, lt - (p.flipAt || 0)) * (p.fps || 12)));
      imgs.forEach((im, i) => {
        im.style.display = i === idx ? "block" : "none";
        im.style.transform = `translate(${-cam.x * k}px,${-cam.y * k}px) scale(${k})`;
      });
      const a = appear(lt, 0, 0.6);
      frame.style.transform = `translate(-50%,-50%) scale(${0.97 + 0.03 * a})`;
    } };
  },

  tracks(p) {
    const el = h(`<section class="scene"><div class="grid4"></div></section>`);
    const grid = el.firstChild;
    const tiles = p.tiles.map((t) => { const e = h(`<div class="tile"><img src="${t.src}" style="transform:translateY(${-(t.y || 0) * (780 / PAGE_W)}px)"><div class="nm">${t.name}</div></div>`); grid.appendChild(e); return e; });
    return { el, update(lt) {
      tiles.forEach((tile, i) => {
        const on = lt >= p.lights[i];
        const k = clamp((lt - p.lights[i]) / 0.5);
        tile.style.opacity = on ? 0.35 + 0.65 * easeOut(k) : 0.35 * appear(lt, i * 0.1);
        tile.style.transform = `scale(${on ? 0.97 + 0.03 * easeOut(k) : 0.97})`;
        tile.style.boxShadow = on ? "0 0 0 2px var(--accent)" : "0 0 0 1px #3a342b";
      });
    } };
  },

  hood(p) {
    const el = h(`<section class="scene center">
      <div style="display:flex;gap:90px;align-items:center">
        <div style="display:flex;flex-direction:column;gap:20px;align-items:flex-end" class="terms"></div>
        <div class="node" style="width:420px"><h4>Gnani Prisma v3.0</h4><p>topic + keyterms, en-IN and hi-IN</p></div>
        <div class="serif out" style="font-size:52px;line-height:1.5;max-width:520px"></div>
      </div>
      <div style="display:flex;gap:26px;margin-top:90px" class="voices"></div></section>`);
    const terms = el.querySelector(".terms"), out = el.querySelector(".out"), node = el.querySelector(".node"), voices = el.querySelector(".voices");
    const chips = p.terms.map((t) => { const c = h(`<span class="chip">${t}</span>`); terms.appendChild(c); return c; });
    out.innerHTML = p.out;
    const vs = p.voices.map((v) => { const c = h(`<span class="badge">${v}</span>`); voices.appendChild(c); return c; });
    return { el, update(lt) {
      chips.forEach((c, i) => { const a = appear(lt, 0.3 + i * 0.25); const fly = easeInOut((lt - 1.8 - i * 0.15) / 0.7); c.style.opacity = a * (1 - fly); c.style.transform = `translateX(${fly * 160}px)`; });
      node.classList.toggle("on", lt > 1.9);
      node.style.opacity = appear(lt, 0, 0.5);
      out.style.opacity = appear(lt, 2.6, 0.6);
      vs.forEach((v, i) => { const a = appear(lt, p.voicesAt + i * 0.25); v.style.opacity = a; v.style.transform = `translateY(${(1 - a) * 20}px)`; });
    } };
  },

  badges(p) {
    const el = h(`<section class="scene center"><div class="serif" style="font-size:84px;margin-bottom:70px">${p.title}</div><div style="display:flex;gap:26px;flex-wrap:wrap;justify-content:center;max-width:1500px"></div></section>`);
    const title = el.firstChild, row = el.children[1];
    const bs = p.items.map((b) => { const e = h(`<span class="badge">${b}</span>`); row.appendChild(e); return e; });
    return { el, update(lt) {
      const a = appear(lt, 0); title.style.opacity = a; title.style.transform = `translateY(${(1 - a) * 20}px)`;
      bs.forEach((b, i) => { const k = appear(lt, 0.4 + i * 0.22); b.style.opacity = k; b.style.transform = `translateY(${(1 - k) * 24}px)`; });
    } };
  },

  end(p) {
    const el = h(`<section class="scene center">
      <div style="display:flex;align-items:baseline;gap:16px"><span class="serif" style="font-size:200px;font-style:italic">Bolo</span><span style="width:30px;height:30px;border-radius:15px;background:var(--accent)"></span></div>
      <div class="serif" style="font-size:58px;color:var(--ink2)">Speak up. Get better every try.</div>
      <div style="font-size:40px;margin-top:60px;color:var(--accent)">bolo-kohl.vercel.app</div>
      <div style="font-size:30px;margin-top:24px;color:var(--ink3)">Built solo on Gnani Prisma v3.0 and Timbre v2.5 · #GnaniAI #GreatIndianAIInternshipChallenge</div></section>`);
    const kids = [...el.children];
    return { el, update(lt) { kids.forEach((k, i) => { const a = appear(lt, i * 0.3, 0.7); k.style.opacity = a; k.style.transform = `translateY(${(1 - a) * 18}px)`; }); } };
  },
};

const FADE = 0.4;
const built = T.cues.map((c) => { const s = SCENES[c.scene](c.params || {}); stage.appendChild(s.el); return { c, s }; });
const brand = h(`<div class="brand">Bolo<i></i></div>`); stage.appendChild(brand);
const cap = h(`<div class="cap"></div>`); stage.appendChild(cap);

window.render = (t) => {
  for (const { c, s } of built) {
    const lt = t - c.start;
    const vis = lt > -FADE && lt < c.dur + FADE;
    if (!vis) { s.el.style.opacity = 0; continue; }
    const fin = clamp((lt + FADE) / FADE), fout = clamp((c.dur + FADE - lt) / FADE);
    s.el.style.opacity = Math.min(fin, fout);
    s.update(Math.max(0, lt), c.dur);
  }
  const hideBrand = T.cues.some((c) => ["intro", "end"].includes(c.scene) && t >= c.start - FADE && t < c.start + c.dur + FADE);
  brand.style.opacity = hideBrand ? 0 : 0.85;
  const line = T.captions.find((k) => t >= k.start && t < k.end);
  if (line) {
    cap.textContent = line.text;
    cap.style.opacity = Math.min(clamp((t - line.start) / 0.2), clamp((line.end - t) / 0.2));
  } else cap.style.opacity = 0;
};
window.render(0);
