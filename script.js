// ===== Opciones de ejemplo del dial (el orden define la posición en el anillo) =====
// `desc` y `content` alimentan el panel que se abre al elegir la opción (Fase 2)
const ITEMS = [
  {
    id: 'projects', label: 'Gestión de proyectos', icon: 'file',
    desc: 'Avance de los proyectos en curso.',
    content: { type: 'progress', rows: [['Rediseño del portal', 72], ['App de inventario', 45], ['Migración a la nube', 90], ['Campaña Q4', 30]] },
  },
  {
    id: 'notes', label: 'Notas de reunión', icon: 'fileText',
    desc: 'Últimas notas registradas por el equipo.',
    content: {
      type: 'notes', rows: [
        ['Comité de calidad', '4 nov', 'Se aprobó el plan de auditoría interna.'],
        ['Revisión de diseño', '3 nov', 'Ajustar el contraste de los botones secundarios.'],
        ['Planeación 2027', '30 oct', 'Definir el presupuesto por área antes del cierre.'],
      ],
    },
  },
  {
    id: 'sales', label: 'Ventas y marketing', icon: 'sheet',
    desc: 'Indicadores del mes y ventas de los últimos 6 meses.',
    content: {
      type: 'kpis',
      tiles: [['Ventas del mes', '$48,2 M', '+12 %', true], ['Clientes nuevos', '126', '+8 %', true], ['Conversión', '3,4 %', '−0,3 %', false]],
      bars: [['Jun', 32], ['Jul', 38], ['Ago', 35], ['Sep', 41], ['Oct', 44], ['Nov', 48]],
    },
  },
  {
    id: 'calendar', label: 'Calendario', icon: 'calendar',
    desc: 'Eventos del mes en curso.',
    content: { type: 'calendar', events: { 6: 'Comité', 12: 'Entrega', 19: 'Auditoría', 26: 'Cierre' } },
  },
  {
    id: 'contacts', label: 'Contactos', icon: 'user',
    desc: 'Personas del equipo y su disponibilidad.',
    content: {
      type: 'people', rows: [
        ['Laura Gómez', 'Diseño', 'online'], ['Andrés Ruiz', 'Desarrollo', 'away'],
        ['Camila Torres', 'Calidad', 'online'], ['Julián Pérez', 'Ventas', 'offline'],
      ],
    },
  },
  {
    id: 'settings', label: 'Ajustes', icon: 'gear',
    desc: 'Preferencias generales del menú.',
    content: { type: 'toggles', rows: [['Notificaciones', true], ['Modo compacto', false], ['Sonidos', true], ['Sincronizar al iniciar', true]] },
  },
  {
    id: 'tasks', label: 'Tareas', icon: 'tasks',
    desc: 'Pendientes de la semana.',
    content: {
      type: 'checklist', rows: [
        ['Revisar propuesta de diseño', true], ['Actualizar inventario', false], ['Enviar informe semanal', false],
        ['Preparar reunión de comité', true], ['Responder correos pendientes', false],
      ],
    },
  },
  {
    id: 'chat', label: 'Chat de diseño', icon: 'hash',
    desc: 'Conversación reciente del canal de diseño.',
    content: {
      type: 'chat', rows: [
        ['Laura', '¿Revisaron la nueva paleta?', false], ['Tú', 'Sí, me gusta el azul del halo.', true],
        ['Andrés', 'Subo la versión final en la tarde.', false], ['Tú', 'Perfecto, la reviso mañana.', true],
      ],
    },
  },
];

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
  $('headHint').textContent = 'Gira el medio dial para cambiar de opción.';
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
  $('headHint').textContent = 'Gira el dial para elegir un acceso rápido.';
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

// Un renderizador por tipo de contenido; cada uno devuelve el HTML del cuerpo del panel
const RENDERERS = {
  progress: ({ rows }) => {
    const rank = rankOrder(rows.map((r) => r[1]));
    return rows.map(([name, pct], i) => `
      <div class="p-row">
        <div class="p-head"><span>${name}</span><span class="muted">${pct} %</span></div>
        <div class="p-track"><div class="p-bar" style="--w:${pct}%; --d:${rank[i] * 90}ms"></div></div>
      </div>`).join('');
  },

  notes: ({ rows }) => rows.map(([title, date, text]) => `
    <article class="note">
      <div class="note-head"><strong>${title}</strong><span class="muted">${date}</span></div>
      <p>${text}</p>
    </article>`).join(''),

  kpis: ({ tiles, bars }) => {
    const max = Math.max(...bars.map((b) => b[1]));
    const rank = rankOrder(bars.map((b) => b[1]));
    return `
      <div class="kpi-grid">${tiles.map(([label, value, delta, up]) => `
        <div class="kpi"><span class="muted">${label}</span><strong>${value}</strong>
          <span class="delta ${up ? 'up' : 'down'}">${delta}</span></div>`).join('')}
      </div>
      <div class="bars">${bars.map(([m, v], i) => `
        <div class="bar-col"><div class="bar" style="--h:${(v / max) * 100}%; --d:${rank[i] * 90}ms" title="${m}: ${v}"></div>
          <span class="muted">${m}</span></div>`).join('')}
      </div>`;
  },

  calendar: ({ events }) => {
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth();
    const offset = (new Date(y, m, 1).getDay() + 6) % 7; // semana empieza en lunes
    const days = new Date(y, m + 1, 0).getDate();
    const title = now.toLocaleDateString('es', { month: 'long', year: 'numeric' });
    const cells = [];
    for (let i = 0; i < offset; i++) cells.push('<span></span>');
    for (let d = 1; d <= days; d++) {
      const cls = [d === now.getDate() ? 'today' : '', events[d] ? 'event' : ''].join(' ').trim();
      cells.push(`<span class="${cls}" ${events[d] ? `title="${events[d]}"` : ''}>${d}</span>`);
    }
    const list = Object.entries(events).map(([d, e]) => `<li><span class="dot"></span>${d} — ${e}</li>`).join('');
    return `
      <div class="cal-title">${title}</div>
      <div class="cal-grid">${['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map((d) => `<b>${d}</b>`).join('')}${cells.join('')}</div>
      <ul class="cal-events">${list}</ul>`;
  },

  people: ({ rows }) => rows.map(([name, role, status]) => `
    <div class="person">
      <span class="avatar">${name.split(' ').map((w) => w[0]).join('')}<i class="status ${status}"></i></span>
      <div><strong>${name}</strong><span class="muted">${role}</span></div>
    </div>`).join(''),

  toggles: ({ rows }) => rows.map(([label, on], i) => `
    <label class="toggle"><span>${label}</span>
      <input type="checkbox" data-row="${i}" ${on ? 'checked' : ''}><i class="switch"></i></label>`).join(''),

  checklist: ({ rows }) => {
    const done = rows.filter((r) => r[1]).length;
    return `
      <div class="muted check-count">${done} de ${rows.length} completadas</div>
      ${rows.map(([label, ok], i) => `
        <label class="check"><input type="checkbox" data-row="${i}" ${ok ? 'checked' : ''}><i class="box"></i>
          <span>${label}</span></label>`).join('')}`;
  },

  chat: ({ rows }) => `
    <div class="chat">${rows.map(([who, text, mine]) => `
      <div class="msg ${mine ? 'mine' : ''}"><span class="muted">${who}</span><p>${text}</p></div>`).join('')}
    </div>
    <div class="chat-input muted">Escribe un mensaje…</div>`,
};

// Los interruptores y casillas guardan su estado en ITEMS para que se conserve al volver
function initPanel() {
  $('panel').inert = true;
  $('panelBody').addEventListener('change', (e) => {
    const input = e.target.closest('input[data-row]');
    if (!input) return;
    const item = ITEMS[panelIndex];
    item.content.rows[Number(input.dataset.row)][1] = input.checked;
    if (item.content.type === 'checklist') {
      const rows = item.content.rows;
      $('panelBody').querySelector('.check-count').textContent =
        `${rows.filter((r) => r[1]).length} de ${rows.length} completadas`;
    }
  });
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
  const compact = innerWidth < COMPACT_MAX;
  document.body.classList.toggle('compact', compact);
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
initPanel();
initDrag();
initControls();
fit();
addEventListener('resize', fit);
requestAnimationFrame(tick);
