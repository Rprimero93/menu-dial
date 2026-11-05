// ===== Opciones del dial: vienen de data.js (único archivo de contenido, Fase 3) =====
const ITEMS = PORTFOLIO.items;

// Trazos de íconos (viewBox 24x24, estilo línea)
const ICONS = {
  file: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5',
  fileText: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5 M9 13h6 M9 17h4',
  sheet: 'M4 5h16v14H4z M4 10h16 M4 14.5h16 M10 5v14',
  calendar: 'M4 6h16v14H4z M4 10h16 M8 3v4 M16 3v4',
  user: 'M12 12a4 4 0 1 0 0-8a4 4 0 1 0 0 8z M5 21a7 7 0 0 1 14 0',
  gear: 'M12 15a3 3 0 1 0 0-6a3 3 0 1 0 0 6z M12 3v2.5 M12 18.5V21 M3 12h2.5 M18.5 12H21 M5.6 5.6l1.8 1.8 M16.6 16.6l1.8 1.8 M5.6 18.4l1.8-1.8 M16.6 7.4l1.8-1.8',
  tasks: 'M3.5 6l1.5 1.5L8 4.5 M3.5 12.5l1.5 1.5 3-3 M3.5 19l1.5 1.5 3-3 M11 6h9.5 M11 12.5h9.5 M11 19h9.5',
  hash: 'M4 9h16 M4 15h16 M10 3L8 21 M16 3l-2 18',
  menu: 'M6 8h12 M6 12h12 M6 16h12',
  x: 'M6 6l12 12 M18 6L6 18',
  up: 'M12 19V5 M6 11l6-6 6 6',
  down: 'M12 5v14 M6 13l6 6 6-6',
  square: 'M8 5h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3z',
  briefcase: 'M4 8h16v11H4z M9 8V5h6v3 M4 13h16',
  trophy: 'M8 4h8v5a4 4 0 0 1-8 0z M8 6H5a3 3 0 0 0 3 4 M16 6h3a3 3 0 0 1-3 4 M12 13v4 M8 20h8 M10 17h4',
  code: 'M8 7l-5 5 5 5 M16 7l5 5-5 5 M14 4l-4 16',
  graduation: 'M2 9l10-5 10 5-10 5z M6 11v5c3 2 9 2 12 0v-5 M22 9v6',
  award: 'M12 14a5 5 0 1 0 0-10a5 5 0 1 0 0 10z M8.5 13L7 21l5-3 5 3-1.5-8',
  folder: 'M3 6h6l2 2h10v11H3z',
  mail: 'M3 6h18v12H3z M3 7l9 6 9-6',
  mapPin: 'M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z M12 12.5a2.5 2.5 0 1 0 0-5a2.5 2.5 0 1 0 0 5z',
  github: 'M9 19c-4 1.5-4-2-6-2.5 M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21',
  external: 'M14 4h6v6 M20 4l-9 9 M18 14v5H5V6h5',
  chevron: 'M9 6l6 6-6 6',
  back: 'M15 6l-6 6 6 6',
};

// ===== Geometría =====
const N = ITEMS.length;
const STEP = 360 / N;              // grados por segmento
const W = 900, H = 540;            // tamaño del escenario
const RING_C = 200;                // centro del anillo en el SVG local
const CX = 50 + RING_C, CY = 100 + RING_C; // centro del dial en coordenadas del escenario
const R_IN = 122, R_OUT = 188, R_ICON = 155;
const LIST_R = 300;                // radio del arco por el que corre la lista
const LIST_ARC = 15;               // grados entre opciones de la lista
// Magnificación (estilo Dock) en la lista: la tarjeta bajo el puntero crece y las vecinas menos
const MAG_MAX = 0.16;              // crecimiento máximo de la tarjeta (+16 %)
const MAG_SPREAD = LIST_ARC * 1.6; // alcance angular del efecto a cada lado del puntero
const MAG_LERP = matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 0.2;
const COMPACT_MAX = 700;           // por debajo de este ancho el panel va debajo del medio dial
const SHIFT_LERP = MAG_LERP === 1 ? 1 : 0.14; // suavidad del desplazamiento del dial al abrir/cerrar
const PANEL_GAP = 90;              // espacio entre el borde del realce y el panel (unidades del escenario)
const PANEL_MAX_W = 640;           // ancho máximo del panel
const PANEL_RIGHT = 810;           // borde derecho disponible (antes de los controles)

// ===== Estado =====
let target = 0;      // posición objetivo (entera salvo durante el arrastre)
let current = 0;     // posición animada (flotante)
let lastRendered = null;
const INITIAL_INDEX = 0; // opción a la que vuelven ✕ y Esc (con el panel cerrado)
let pointerAngle = null;          // ángulo del puntero alrededor del dial en la zona de la lista, o null
let mags = new Array(N).fill(1);  // escala animada de cada tarjeta de la lista
let hoveredSeg = null;            // segmento del anillo bajo el puntero (su ícono se ilumina)
let isOpen = false;               // panel de contenido abierto (dial a la izquierda)
let panelIndex = null;            // opción que muestra el panel
let shift = 0;                    // desplazamiento animado del dial (unidades del escenario)
let shiftTarget = 0;              // 0 cerrado; con el panel abierto, centro del dial en el borde de la ventana
let openShift = -CX;              // desplazamiento de "abierto", recalculado en fit()
let panelX = 290;                 // borde izquierdo del panel, recalculado en fit()

const $ = (id) => document.getElementById(id);
const mod = (n, m) => ((n % m) + m) % m;
const rad = (deg) => (deg * Math.PI) / 180;
const activeIndex = () => mod(Math.round(target), N);

function svgIcon(name, size = 24) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor"
    stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${ICONS[name]}"/></svg>`;
}

// Trazo de un sector de anillo entre dos ángulos (0° = las 3 en punto, sentido horario),
// con esquinas redondeadas: rcOut en el borde exterior y rcIn en el interior
function arcPath(r0, r1, a0, a1, rcOut = 0, rcIn = 0, c = RING_C) {
  const p = (r, a) => `${c + r * Math.cos(rad(a))} ${c + r * Math.sin(rad(a))}`;
  const large = a1 - a0 > 180 ? 1 : 0;
  // Desfase angular del punto de tangencia sobre cada arco y distancia sobre el lado radial
  const dOut = (Math.asin(rcOut / (r1 - rcOut)) * 180) / Math.PI;
  const dIn = (Math.asin(rcIn / (r0 + rcIn)) * 180) / Math.PI;
  const sideOut = (r1 - rcOut) * Math.cos(rad(dOut));
  const sideIn = (r0 + rcIn) * Math.cos(rad(dIn));
  return [
    `M ${p(sideIn, a0)}`,
    `L ${p(sideOut, a0)}`,
    `A ${rcOut} ${rcOut} 0 0 1 ${p(r1, a0 + dOut)}`,
    `A ${r1} ${r1} 0 ${large} 1 ${p(r1, a1 - dOut)}`,
    `A ${rcOut} ${rcOut} 0 0 1 ${p(sideOut, a1)}`,
    `L ${p(sideIn, a1)}`,
    `A ${rcIn} ${rcIn} 0 0 1 ${p(r0, a1 - dIn)}`,
    `A ${r0} ${r0} 0 ${large} 0 ${p(r0, a0 + dIn)}`,
    `A ${rcIn} ${rcIn} 0 0 1 ${p(sideIn, a0)}`,
    'Z',
  ].join(' ');
}

// ===== Construcción =====
function build() {
  // Encabezado desde data.js
  $('headTitle').textContent = PORTFOLIO.header.title;
  $('headRole').textContent = PORTFOLIO.header.role;
  $('headHint').textContent = PORTFOLIO.header.hint;
  document.title = `${PORTFOLIO.header.title} — Dial`;
  $('knob').setAttribute('aria-valuemax', N - 1);

  const segments = $('segments');
  const icons = $('icons');
  const options = $('options');

  ITEMS.forEach((item, i) => {
    const seg = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    seg.setAttribute('class', 'segment');
    seg.setAttribute('d', arcPath(R_IN, R_OUT, i * STEP - STEP / 2 + 1.2, i * STEP + STEP / 2 - 1.2, 10, 5));
    seg.dataset.index = i;
    segments.appendChild(seg);

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'ring-icon');
    g.innerHTML = svgIcon(item.icon, 22).replace('<svg', '<svg x="-11" y="-11"');
    icons.appendChild(g);

    const li = document.createElement('li');
    li.className = 'option';
    li.setAttribute('role', 'option');
    li.dataset.index = i;
    li.innerHTML = `<span class="ico">${svgIcon(item.icon)}</span><span class="label">${item.label}</span>`;
    // Clic en cualquier tarjeta: el dial gira hasta ella y abre su contenido
    li.addEventListener('click', () => { goTo(i); openPanel(); });
    options.appendChild(li);
  });

  // El realce sobresale del anillo y queda fijo a las 3 en punto
  $('highlight').setAttribute('d', arcPath(R_IN - 4, R_OUT + 8, -STEP / 2 + 0.5, STEP / 2 - 0.5, 12, 6));

  // Halo: arco sobre el borde interior del realce, sin las esquinas redondeadas
  const hr = R_IN - 4;
  const ha = STEP / 2 - 0.5 - (Math.asin(6 / (hr + 6)) * 180) / Math.PI;
  const hp = (a) => `${RING_C + hr * Math.cos(rad(a))} ${RING_C + hr * Math.sin(rad(a))}`;
  $('activeGlow').setAttribute('d', `M ${hp(-ha)} A ${hr} ${hr} 0 0 1 ${hp(ha)}`);

  document.querySelectorAll('[data-icon]').forEach((el) => (el.innerHTML = svgIcon(el.dataset.icon)));
}

// ===== Render (se llama en cada frame solo si cambió la posición) =====
function render() {
  const rot = -current * STEP;
  $('segments').setAttribute('transform', `rotate(${rot} ${RING_C} ${RING_C})`);
  $('ridges').style.transform = `rotate(${rot}deg)`;

  // Íconos del anillo: se posicionan sin rotar para que queden derechos; al hover se iluminan como el activo
  [...$('icons').children].forEach((g, i) => {
    const a = rad(i * STEP + rot);
    const x = RING_C + R_ICON * Math.cos(a);
    const y = RING_C + R_ICON * Math.sin(a);
    g.setAttribute('transform', `translate(${x} ${y})`);
    g.classList.toggle('active', i === mod(Math.round(current), N));
    g.classList.toggle('hover', i === hoveredSeg);
  });

  // Lista: cada opción se ubica sobre un arco según su distancia a la activa
  let nearest = Infinity;
  [...$('options').children].forEach((li, i) => {
    const d = listOffset(i);
    const ad = Math.abs(d);
    nearest = Math.min(nearest, ad);

    const theta = rad(d * LIST_ARC);
    const x = CX + LIST_R * Math.cos(theta);
    const y = CY + LIST_R * Math.sin(theta);
    const opacity = Math.max(0, 1 - ad * 0.3);

    // La escala de la magnificación crece desde el borde izquierdo (transform-origin)
    li.style.transform = `translate(${x}px, ${y - 24}px) rotate(${d * LIST_ARC}deg) scale(${mags[i]})`;
    li.style.opacity = opacity;
    li.style.filter = ad > 1.2 ? `blur(${(ad - 1.2) * 1.4}px)` : 'none';
    li.style.pointerEvents = opacity < 0.15 ? 'none' : 'auto';
    // La tarjeta más magnificada queda encima de sus vecinas
    li.style.zIndex = String(20 + Math.round((mags[i] - 1) * 100) - Math.round(ad));
    li.classList.toggle('active', ad < 0.5);
    li.setAttribute('aria-selected', ad < 0.5);
  });

  // Dial y fondo se desplazan juntos; fuera de la ventana el dial queda oculto sin corte visible
  $('dial').style.transform = shift ? `translateX(${shift}px)` : '';
  document.querySelector('.halo').style.transform = shift ? `translateX(${shift}px)` : '';

  // Conector: del borde del realce a la opción activa (o al panel), se desvanece al girar
  const p = openShift ? shift / openShift : 0; // 0 cerrado → 1 abierto
  const x0 = CX + R_OUT + 8 + shift;
  const x1 = (CX + LIST_R - 2) * (1 - p) + (panelX - 2) * p;
  $('connectorPath').setAttribute('d', `M ${x0} ${CY - 10} H ${x0 + 34} L ${x0 + 46} ${CY} H ${x1}`);
  $('connectorDot').setAttribute('cx', x0);
  $('connectorDot').setAttribute('cy', CY - 10);
  document.querySelector('.connector').style.opacity = Math.max(0, 1 - nearest * 2.5);

  $('knob').setAttribute('aria-valuenow', mod(Math.round(current), N));
  $('knob').setAttribute('aria-valuetext', ITEMS[mod(Math.round(current), N)].label);
}

// Distancia (en posiciones) de la opción i a la activa, por el camino más corto
function listOffset(i) {
  const d = i - current;
  return d - N * Math.round(d / N);
}

// Peso de la magnificación según la distancia angular al puntero (curva coseno suave)
function magWeight(angle) {
  if (pointerAngle === null) return 0;
  let d = angle - pointerAngle;
  d = Math.abs(d - 360 * Math.round(d / 360));
  return d >= MAG_SPREAD ? 0 : (1 + Math.cos((Math.PI * d) / MAG_SPREAD)) / 2;
}

// Acerca un valor a su objetivo; devuelve el nuevo valor
function ease(value, goal, k) {
  const next = value + (goal - value) * k;
  return Math.abs(goal - next) < 0.0005 ? goal : next;
}

function tick() {
  const diff = target - current;
  current = Math.abs(diff) < 0.0005 ? target : current + diff * 0.16;
  let changed = current !== lastRendered;

  for (let i = 0; i < N; i++) {
    const next = ease(mags[i], 1 + MAG_MAX * magWeight(listOffset(i) * LIST_ARC), MAG_LERP);
    if (next !== mags[i]) changed = true;
    mags[i] = next;
  }
  const nextShift = Math.abs(shiftTarget - shift) < 0.3 ? shiftTarget : shift + (shiftTarget - shift) * SHIFT_LERP;
  if (nextShift !== shift) changed = true;
  shift = nextShift;
  if (changed) {
    render();
    lastRendered = current;
  }
  // Con el panel abierto, girar el medio dial cambia su contenido en vivo
  if (isOpen && activeIndex() !== panelIndex) renderPanel(activeIndex());
  requestAnimationFrame(tick);
}

// ===== Navegación =====
function step(delta) {
  target = Math.round(target) + delta;
}

// Va a un índice por el camino más corto alrededor del anillo
function goTo(index) {
  let d = index - mod(Math.round(target), N);
  d -= N * Math.round(d / N);
  target = Math.round(target) + d;
}

let toastTimer;
function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

// ===== Panel de contenido (Fase 2) =====
function openPanel() {
  if (isOpen) return;
  isOpen = true;
  pointerAngle = null; // la lista se oculta: sin magnificación
  document.body.classList.add('panel-open');
  $('scene').classList.add('open');
  $('panel').classList.add('open');
  $('panel').inert = false;
  $('btnClose').setAttribute('aria-label', 'Cerrar el panel');
  $('headHint').textContent = PORTFOLIO.header.hintOpen;
  renderPanel(activeIndex());
  fit();
  shiftTarget = openShift;
}

function closePanel() {
  if (!isOpen) return;
  isOpen = false;
  document.body.classList.remove('panel-open');
  $('scene').classList.remove('open');
  $('panel').classList.remove('open');
  $('panel').inert = true;
  $('btnClose').setAttribute('aria-label', 'Volver a la opción inicial');
  $('headHint').textContent = PORTFOLIO.header.hint;
  fit();
  shiftTarget = 0;
}

function renderPanel(index) {
  panelIndex = index;
  const item = ITEMS[index];
  $('panelIcon').innerHTML = svgIcon(item.icon);
  $('panelTitle').textContent = item.label;
  $('panelDesc').textContent = item.desc;
  // Un contenedor nuevo en cada cambio dispara la animación de entrada
  const wrap = document.createElement('div');
  wrap.className = 'panel-content';
  wrap.dataset.type = item.content.type;
  wrap.dataset.index = index;
  wrap.innerHTML = RENDERERS[item.content.type](item.content);
  $('panelBody').replaceChildren(wrap);
}

// Orden de aparición de barras: una por una, de mayor a menor
function rankOrder(values) {
  const order = values.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]);
  const rank = [];
  order.forEach(([, i], r) => (rank[i] = r));
  return rank;
}

// Enlace externo seguro (nueva pestaña) o interno (mailto)
const linkAttrs = (href) => (href.startsWith('http') ? `href="${href}" target="_blank" rel="noopener"` : `href="${href}"`);

// Cifra de la tarjeta de perfil: '#<id>' se reemplaza por cuántos elementos tiene esa sección
function statValue(value) {
  if (!String(value).startsWith('#')) return value;
  const item = ITEMS.find((it) => it.id === value.slice(1));
  return item ? itemCount(item.content) ?? '' : '';
}

// Un renderizador por tipo de contenido; cada uno devuelve el HTML del cuerpo del panel
const RENDERERS = {
  // Tarjeta de perfil: portada curva con borde azul, avatar grande centrado, ubicación, cifras,
  // dos botones (correo / GitHub), texto y habilidades destacadas
  profile: ({ initials, name, role, location, text, stats = [], actions = [], skillsTitle, skills = [] }) => `
    <div class="profile-card">
      <div class="profile-cover"></div>
      <span class="profile-avatar">${initials}</span>
      <strong class="profile-name">${name}</strong>
      <span class="profile-role">${role}</span>
      ${location ? `<span class="profile-loc">${svgIcon('mapPin', 15)}${location}</span>` : ''}
      <div class="profile-stats">${stats.map(([value, label]) => String(value).startsWith('#')
        // Cifra calculada: es un enlace a su sección
        ? `<button class="stat is-link" data-goto="${value.slice(1)}" aria-label="Ver ${label}"><strong>${statValue(value)}</strong><span>${label}</span></button>`
        : `<div class="stat"><strong>${value}</strong><span>${label}</span></div>`).join('')}
      </div>
      <div class="profile-actions">${actions.map(([label, href, icon], i) => `
        <a class="btn-pill${i === 0 ? ' is-primary' : ''}" ${linkAttrs(href)}>${svgIcon(icon, 16)}${label}</a>`).join('')}
      </div>
      <p class="profile-text">${text}</p>
      ${skills.length ? `
        <div class="group-title skills-title">${skillsTitle || 'Skills'}</div>
        <ol class="skills">${skills.map((s, i) => s
          ? `<li class="skill"><span class="skill-n">${i + 1}</span>${s}</li>`
          : `<li class="skill is-empty"><span class="skill-n">${i + 1}</span>Skill ${i + 1}</li>`).join('')}
        </ol>` : ''}
    </div>`,

  timeline: ({ rows }) => `
    <ol class="timeline">${rows.map(({ role, org, dates, points }) => `
      <li class="tl-item">
        <div class="tl-head"><strong>${role}</strong><span class="muted">${dates}</span></div>
        <div class="tl-org">${org}</div>
        <ul>${points.map((pt) => `<li>${pt}</li>`).join('')}</ul>
      </li>`).join('')}
    </ol>`,

  kpis: ({ tiles, compare }) => {
    const max = Math.max(...compare.rows.map((r) => r[2]));
    const rank = rankOrder(compare.rows.map((r) => r[2]));
    return `
      <div class="kpi-grid">${tiles.map(([label, value, note]) => `
        <div class="kpi"><span class="muted">${label}</span><strong>${value}</strong><span class="kpi-note">${note}</span></div>`).join('')}
      </div>
      <div class="compare">
        <div class="compare-title muted">${compare.title}</div>
        ${compare.rows.map(([label, text, v], i) => `
          <div class="cmp-row">
            <span class="cmp-label">${label}</span>
            <div class="cmp-track"><div class="cmp-bar" style="--w:${(v / max) * 100}%; --d:${rank[i] * 120}ms"></div></div>
            <span class="cmp-value">${text}</span>
          </div>`).join('')}
      </div>`;
  },

  tags: ({ groups }) => groups.map(([title, tags]) => `
    <div class="tag-group">
      <div class="group-title">${title}</div>
      <div class="chips">${tags.map((t) => `<span class="chip">${t}</span>`).join('')}</div>
    </div>`).join(''),

  // Cada sección: [título, filas, tono opcional del punto ('green')]
  list: ({ sections }) => sections.map(([title, rows, tone]) => `
    ${title ? `<div class="group-title">${title}</div>` : ''}
    <ul class="entries${tone ? ` tone-${tone}` : ''}">${rows.map(([name, issuer, extra]) => `
      <li class="entry"><span class="entry-dot"></span>
        <div><strong>${name}</strong><span class="muted">${issuer}</span></div>
        ${extra ? `<span class="badge">${extra}</span>` : ''}
      </li>`).join('')}
    </ul>`).join(''),

  // `points` (opcional): viñetas con el mismo estilo de las funciones de Experiencia
  // `logo` (opcional): [ruta de la imagen, texto alternativo], a la izquierda del título
  projects: ({ rows }) => rows.map(({ name, logo, text, points, tags, link }) => `
    <article class="project">
      <div class="project-head">
        ${logo ? `<span class="project-logo"><img src="${logo[0]}" alt="${logo[1]}"></span>` : ''}
        <strong>${name}</strong>
      </div>
      <p>${text}</p>
      ${points ? `<ul class="project-points">${points.map((pt) => `<li>${pt}</li>`).join('')}</ul>` : ''}
      <div class="chips">${tags.map((t) => `<span class="chip">${t}</span>`).join('')}</div>
      ${link ? `<a class="btn-link" ${linkAttrs(link[1])}>${link[0]} ${svgIcon('external', 14)}</a>` : ''}
    </article>`).join(''),

  contact: ({ rows }) => rows.map(([icon, label, value, href]) => {
    const body = `<span class="contact-ico">${svgIcon(icon, 18)}</span>
      <div><span class="muted">${label}</span><strong>${value}</strong></div>`;
    return href ? `<a class="contact-row is-link" ${linkAttrs(href)}>${body}${svgIcon('external', 14)}</a>`
                : `<div class="contact-row">${body}</div>`;
  }).join(''),
};

function initPanel() {
  $('panel').inert = true;
  // Enlaces internos (ej. la cifra de certificaciones): llevan a esa sección en el panel o en la hoja
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-goto]');
    if (!link) return;
    const index = ITEMS.findIndex((it) => it.id === link.dataset.goto);
    if (index < 0) return;
    if (document.body.classList.contains('compact')) openSheet(index);
    else goTo(index);
  });
}

// ===== Versión móvil (Fase 4): tarjeta-menú + hoja a pantalla completa =====
let sheetIndex = null; // sección que muestra la hoja, o null si está cerrada

// Dato de la derecha de cada fila: cuántos elementos tiene la sección (solo listas y líneas de tiempo)
function itemCount({ type, rows, sections }) {
  if (type === 'timeline') return rows.length;
  if (type === 'list') return sections.reduce((n, [, list]) => n + list.length, 0);
  return null;
}

function buildMobile() {
  const conf = PORTFOLIO.mobile;
  const about = ITEMS.find((it) => it.content.type === 'profile')?.content || {};
  $('mPill').innerHTML = `${svgIcon('folder', 14)}${conf.pill}`;
  $('mCount').textContent = `${N} secciones`;
  $('mHead').innerHTML = `
    <span class="profile-avatar">${about.initials || ''}</span>
    <div class="m-who"><strong>${about.name || ''}</strong><span>${conf.subtitle}</span></div>
    ${conf.badge ? `<span class="m-badge">${conf.badge}</span>` : ''}`;

  const row = (it, i) => {
    // Contacto: sus enlaces van directos en la tarjeta, sin abrir la hoja
    if (it.content.type === 'contact') {
      return it.content.rows.filter((r) => r[3]).map(([icon, label, value, href]) => `
        <li><a class="m-row" data-id="${it.id}" ${linkAttrs(href)}>
          <span class="m-ico">${svgIcon(icon, 20)}</span>
          <span class="m-label">${label}<small>${value}</small></span>
          <span class="m-end">${svgIcon('external', 16)}</span>
        </a></li>`).join('');
    }
    const n = itemCount(it.content);
    return `
      <li><button class="m-row" data-index="${i}" data-id="${it.id}">
        <span class="m-ico">${svgIcon(it.icon, 20)}</span>
        <span class="m-label">${it.label}</span>
        <span class="m-end">${n !== null ? `<span class="m-count">${n}</span>` : svgIcon('chevron', 18)}</span>
      </button></li>`;
  };
  $('mMain').innerHTML = ITEMS.map((it, i) => (conf.lower.includes(it.id) ? '' : row(it, i))).join('');
  $('mLower').innerHTML = ITEMS.map((it, i) => (conf.lower.includes(it.id) ? row(it, i) : '')).join('');

  const f = conf.footer;
  $('mFoot').innerHTML = `
    <a class="m-foot-link" ${linkAttrs(f.href)}>
      <span class="m-foot-ico">${svgIcon('github', 18)}</span>
      <span><strong>${f.handle}</strong><small>${f.role}</small></span>
    </a>`;

  document.querySelectorAll('button.m-row').forEach((b) =>
    b.addEventListener('click', () => openSheet(Number(b.dataset.index))));
  $('mBack').addEventListener('click', () => closeSheet());
  // Atrás del navegador: cierra la hoja en lugar de salir del sitio
  addEventListener('popstate', () => { if (sheetIndex !== null) closeSheet(false); });
  $('mSheet').inert = true;
}

function openSheet(index) {
  const item = ITEMS[index];
  const wasOpen = sheetIndex !== null;
  sheetIndex = index;
  $('mSheetIcon').innerHTML = svgIcon(item.icon);
  $('mSheetTitle').textContent = item.label;
  $('mSheetDesc').textContent = item.desc;
  const wrap = document.createElement('div');
  wrap.className = 'panel-content';
  wrap.dataset.type = item.content.type;
  wrap.dataset.index = index;
  wrap.innerHTML = RENDERERS[item.content.type](item.content);
  $('mSheetBody').replaceChildren(wrap);
  $('mSheetBody').scrollTop = 0;
  document.querySelectorAll('.m-row').forEach((r) => r.classList.toggle('is-current', r.dataset.index === String(index)));
  $('mSheet').inert = false;
  $('mSheet').classList.add('open');
  document.body.classList.add('sheet-open');
  if (!wasOpen) history.pushState({ sheet: index }, '');
  $('mBack').focus({ preventScroll: true });
}

// fromUi: cerrada con ← o Esc (hay que deshacer la entrada del historial); false: ya la quitó Atrás
function closeSheet(fromUi = true) {
  if (sheetIndex === null) return;
  const index = sheetIndex;
  sheetIndex = null;
  $('mSheet').classList.remove('open');
  $('mSheet').inert = true;
  document.body.classList.remove('sheet-open');
  if (fromUi && history.state?.sheet !== undefined) history.back();
  document.querySelector(`button.m-row[data-index="${index}"]`)?.focus({ preventScroll: true });
}

// ===== Arrastre para girar el dial =====
function initDrag() {
  const dial = $('dial');
  let dragging = false, moved = 0, lastAngle = 0, startTarget = 0, accum = 0, downEl = null;

  const angleOf = (e) => {
    const r = $('knob').getBoundingClientRect();
    return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
  };

  dial.addEventListener('pointerdown', (e) => {
    dragging = true;
    moved = 0;
    accum = 0;
    downEl = e.target;
    lastAngle = angleOf(e);
    startTarget = target;
    dial.setPointerCapture(e.pointerId);
    dial.classList.add('dragging');
  });

  // Magnificación de la lista: ubica el puntero en la franja del arco de tarjetas
  // (se apaga al arrastrar y con el panel abierto, porque la lista está oculta)
  document.addEventListener('pointermove', (e) => {
    if (dragging || isOpen || e.pointerType === 'touch') { pointerAngle = null; return; }
    const r = $('stage').getBoundingClientRect();
    const k = W / r.width; // de píxeles de pantalla a coordenadas del escenario
    const x = (e.clientX - r.left) * k - CX;
    const y = (e.clientY - r.top) * k - CY;
    const dist = Math.hypot(x, y);
    pointerAngle = x > 0 && dist > LIST_R - 20 && dist < LIST_R + 300 ? (Math.atan2(y, x) * 180) / Math.PI : null;
  });
  document.addEventListener('pointerleave', () => (pointerAngle = null));

  // Ícono del segmento bajo el puntero: se ilumina como el activo
  [...$('segments').children].forEach((seg) => {
    seg.addEventListener('pointerenter', () => { hoveredSeg = Number(seg.dataset.index); render(); });
    seg.addEventListener('pointerleave', () => { hoveredSeg = null; render(); });
  });

  dial.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const a = angleOf(e);
    let delta = a - lastAngle;
    delta -= 360 * Math.round(delta / 360); // evita saltos al cruzar ±180°
    lastAngle = a;
    accum += delta;
    moved += Math.abs(delta);
    // Girar en sentido horario hace rotar el anillo en ese sentido (posición decrece)
    target = startTarget - accum / STEP;
  });

  const end = () => {
    if (!dragging) return;
    dragging = false;
    dial.classList.remove('dragging');
    if (moved < 3) {
      // Fue un clic: segmento → ir a él; perilla → abrir o cerrar el panel
      target = startTarget;
      if (downEl?.dataset?.index !== undefined) goTo(Number(downEl.dataset.index));
      else if (downEl?.closest('.knob')) (isOpen ? closePanel() : openPanel());
    } else {
      target = Math.round(target);
    }
  };
  dial.addEventListener('pointerup', end);
  dial.addEventListener('pointercancel', end);

  // Rueda del ratón: una opción por gesto, con un pequeño enfriamiento
  let wheelLock = 0;
  dial.addEventListener('wheel', (e) => {
    e.preventDefault();
    const now = performance.now();
    if (now - wheelLock < 140) return;
    wheelLock = now;
    step(Math.sign(e.deltaY));
  }, { passive: false });
}

// ===== Controles y teclado =====
function initControls() {
  $('btnUp').addEventListener('click', () => step(-1));
  $('btnDown').addEventListener('click', () => step(1));
  $('btnOpen').addEventListener('click', openPanel);
  $('btnClose').addEventListener('click', closeOrReset);

  document.addEventListener('keydown', (e) => {
    // En la versión móvil el dial está oculto: el teclado solo cierra la hoja
    if (document.body.classList.contains('compact')) {
      if (e.key === 'Escape') closeSheet();
      return;
    }
    if (['ArrowUp', 'ArrowLeft'].includes(e.key)) { e.preventDefault(); step(-1); }
    else if (['ArrowDown', 'ArrowRight'].includes(e.key)) { e.preventDefault(); step(1); }
    else if (e.key === 'Enter' && document.activeElement === $('knob')) openPanel();
    else if (e.key === 'Escape') closeOrReset();
  });
}

// ✕ y Esc: con el panel abierto lo cierran; si no, vuelven a la opción inicial
function closeOrReset() {
  if (isOpen) closePanel();
  else resetDial();
}

function resetDial() {
  goTo(INITIAL_INDEX);
  toast('Vuelto a la opción inicial');
}

// ===== Ajuste al tamaño de la ventana =====
function fit() {
  // Media query y no innerWidth: en un celular el escenario de 900 px aleja el zoom e infla innerWidth
  const compact = matchMedia(`(max-width: ${COMPACT_MAX - 0.02}px)`).matches;
  document.body.classList.toggle('compact', compact);
  if (!compact) closeSheet(); // al pasar a escritorio la hoja móvil no tiene sentido
  const s = Math.min(1.15, (innerWidth - 32) / W, (innerHeight - 32) / H);
  $('stage').style.transform = `scale(${s})`;
  $('scaler').style.width = `${W * s}px`;
  $('scaler').style.height = `${H * s}px`;
  $('scaler').style.setProperty('--s', s);
  // En modo compacto el panel ocupa el alto que queda debajo del escenario
  document.body.style.setProperty('--panel-max', `${innerHeight - H * s - 48}px`);

  // Abierto: el centro del dial queda justo en el borde izquierdo de la ventana (mitad oculta fuera)
  const left = $('scaler').getBoundingClientRect().left;
  openShift = -(CX + left / s);
  // El panel se acerca al medio dial y aprovecha el ancho hasta los controles
  panelX = CX + openShift + R_OUT + 8 + PANEL_GAP;
  const panelW = Math.min(PANEL_MAX_W, PANEL_RIGHT - panelX);
  $('scaler').style.setProperty('--panel-x', `${panelX}px`);
  $('scaler').style.setProperty('--panel-w', `${panelW}px`);
  if (isOpen) shiftTarget = openShift;
  lastRendered = null; // fuerza a redibujar el conector con la geometría nueva
}

build();
buildMobile();
initPanel();
initDrag();
initControls();
fit();
addEventListener('resize', fit);
requestAnimationFrame(tick);
