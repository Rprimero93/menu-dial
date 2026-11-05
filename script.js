// ===== Opciones de ejemplo del dial (el orden define la posición en el anillo) =====
const ITEMS = [
  { id: 'projects', label: 'Gestión de proyectos', icon: 'file' },
  { id: 'notes', label: 'Notas de reunión', icon: 'fileText' },
  { id: 'sales', label: 'Ventas y marketing', icon: 'sheet' },
  { id: 'calendar', label: 'Calendario', icon: 'calendar' },
  { id: 'contacts', label: 'Contactos', icon: 'user' },
  { id: 'settings', label: 'Ajustes', icon: 'gear' },
  { id: 'tasks', label: 'Tareas', icon: 'tasks' },
  { id: 'chat', label: 'Chat de diseño', icon: 'hash' },
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
const W = 900, H = 620;            // tamaño del escenario
const RING_C = 200;                // centro del anillo en el SVG local
const CX = 50 + RING_C, CY = 100 + RING_C; // centro del dial en coordenadas del escenario
const R_IN = 122, R_OUT = 188, R_ICON = 155;
const LIST_R = 300;                // radio del arco por el que corre la lista
const LIST_ARC = 15;               // grados entre opciones de la lista

// ===== Estado =====
let target = 0;      // posición objetivo (entera salvo durante el arrastre)
let current = 0;     // posición animada (flotante)
let savedIndex = 0;  // opción predeterminada guardada
let lastRendered = null;

const $ = (id) => document.getElementById(id);
const mod = (n, m) => ((n % m) + m) % m;
const rad = (deg) => (deg * Math.PI) / 180;

function svgIcon(name, size = 24) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor"
    stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${ICONS[name]}"/></svg>`;
}

// Trazo de un sector de anillo entre dos ángulos (0° = las 3 en punto, sentido horario)
function arcPath(r0, r1, a0, a1, c = RING_C) {
  const p = (r, a) => `${c + r * Math.cos(rad(a))} ${c + r * Math.sin(rad(a))}`;
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${p(r1, a0)} A ${r1} ${r1} 0 ${large} 1 ${p(r1, a1)} L ${p(r0, a1)} A ${r0} ${r0} 0 ${large} 0 ${p(r0, a0)} Z`;
}

// ===== Construcción =====
function build() {
  const segments = $('segments');
  const icons = $('icons');
  const options = $('options');

  ITEMS.forEach((item, i) => {
    const seg = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    seg.setAttribute('class', 'segment');
    seg.setAttribute('d', arcPath(R_IN, R_OUT, i * STEP - STEP / 2 + 1.2, i * STEP + STEP / 2 - 1.2));
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
    li.addEventListener('click', () => (mod(target, N) === i ? openItem() : goTo(i)));
    options.appendChild(li);
  });

  // El realce sobresale del anillo y queda fijo a las 3 en punto
  $('highlight').setAttribute('d', arcPath(R_IN - 4, R_OUT + 8, -STEP / 2 + 0.5, STEP / 2 - 0.5));

  document.querySelectorAll('[data-icon]').forEach((el) => (el.innerHTML = svgIcon(el.dataset.icon)));
  updateBadge();
}

// ===== Render (se llama en cada frame solo si cambió la posición) =====
function render() {
  const rot = -current * STEP;
  $('segments').setAttribute('transform', `rotate(${rot} ${RING_C} ${RING_C})`);
  $('ridges').style.transform = `rotate(${rot}deg)`;

  // Íconos del anillo: se posicionan sin rotar para que queden derechos
  [...$('icons').children].forEach((g, i) => {
    const a = rad(i * STEP + rot);
    const x = RING_C + R_ICON * Math.cos(a);
    const y = RING_C + R_ICON * Math.sin(a);
    g.setAttribute('transform', `translate(${x} ${y})`);
    g.classList.toggle('active', i === mod(Math.round(current), N));
  });

  // Lista: cada opción se ubica sobre un arco según su distancia a la activa
  let nearest = Infinity;
  [...$('options').children].forEach((li, i) => {
    let d = i - current;
    d -= N * Math.round(d / N);
    const ad = Math.abs(d);
    nearest = Math.min(nearest, ad);

    const theta = rad(d * LIST_ARC);
    const x = CX + LIST_R * Math.cos(theta);
    const y = CY + LIST_R * Math.sin(theta);
    const opacity = Math.max(0, 1 - ad * 0.3);

    li.style.transform = `translate(${x}px, ${y - 24}px) rotate(${d * LIST_ARC}deg)`;
    li.style.opacity = opacity;
    li.style.filter = ad > 1.2 ? `blur(${(ad - 1.2) * 1.4}px)` : 'none';
    li.style.pointerEvents = opacity < 0.15 ? 'none' : 'auto';
    li.style.zIndex = String(10 - Math.round(ad));
    li.classList.toggle('active', ad < 0.5);
    li.setAttribute('aria-selected', ad < 0.5);
  });

  // Conector: del borde del realce a la opción activa, se desvanece al girar
  const x0 = CX + R_OUT + 8;
  const x1 = CX + LIST_R - 2;
  $('connectorPath').setAttribute('d', `M ${x0} ${CY - 10} H ${x0 + 34} L ${x0 + 46} ${CY} H ${x1}`);
  $('connectorDot').setAttribute('cx', x0);
  $('connectorDot').setAttribute('cy', CY - 10);
  document.querySelector('.connector').style.opacity = Math.max(0, 1 - nearest * 2.5);

  $('knob').setAttribute('aria-valuenow', mod(Math.round(current), N));
  $('knob').setAttribute('aria-valuetext', ITEMS[mod(Math.round(current), N)].label);
}

function tick() {
  const diff = target - current;
  current = Math.abs(diff) < 0.0005 ? target : current + diff * 0.16;
  if (current !== lastRendered) {
    render();
    lastRendered = current;
  }
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

function selectedItem() {
  return ITEMS[mod(Math.round(target), N)];
}

function openItem() {
  toast(`Abriendo «${selectedItem().label}»`);
}

function updateBadge() {
  document.querySelectorAll('.option .badge').forEach((b) => b.remove());
  const li = $('options').children[savedIndex];
  li.insertAdjacentHTML('beforeend', '<span class="badge">Predeterminado</span>');
}

let toastTimer;
function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
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
      // Fue un clic: segmento → ir a él; perilla → abrir la opción activa
      target = startTarget;
      if (downEl?.dataset?.index !== undefined) goTo(Number(downEl.dataset.index));
      else if (downEl?.closest('.knob')) openItem();
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
  $('btnOpen').addEventListener('click', openItem);
  $('btnClose').addEventListener('click', () => { goTo(savedIndex); toast('Vuelto al predeterminado'); });
  $('btnTilt').addEventListener('click', () => $('scene').classList.toggle('flat'));

  $('btnCancel').addEventListener('click', () => { goTo(savedIndex); toast('Cambios descartados'); });
  $('btnSave').addEventListener('click', () => {
    savedIndex = mod(Math.round(target), N);
    updateBadge();
    toast(`Guardado: «${ITEMS[savedIndex].label}» es el acceso predeterminado`);
  });

  document.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowLeft'].includes(e.key)) { e.preventDefault(); step(-1); }
    else if (['ArrowDown', 'ArrowRight'].includes(e.key)) { e.preventDefault(); step(1); }
    else if (e.key === 'Enter' && document.activeElement === $('knob')) openItem();
    else if (e.key === 'Escape') $('btnCancel').click();
  });
}

// ===== Ajuste al tamaño de la ventana =====
function fit() {
  const s = Math.min(1.15, (innerWidth - 32) / W, (innerHeight - 32) / H);
  $('stage').style.transform = `scale(${s})`;
  $('scaler').style.width = `${W * s}px`;
  $('scaler').style.height = `${H * s}px`;
}

build();
initDrag();
initControls();
fit();
addEventListener('resize', fit);
requestAnimationFrame(tick);
