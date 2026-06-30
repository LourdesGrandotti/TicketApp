'use strict';
//id de cada partido //
const MATCHES = {
  '16avos': [
    { id: 1, home: { name: 'Alemania', flag: 'de' }, away: { name: 'Paraguay', flag: 'py' }, date: 'Lunes, 29 jun', time: '15:00 HS.', stadium: 'MetLife Stadium', city: 'East Rutherford, EE.UU.' },
    { id: 2, home: { name: 'Francia', flag: 'fr' }, away: { name: 'Suecia', flag: 'se' }, date: 'Lunes, 29 jun', time: '19:00 HS.', stadium: 'Rose Bowl', city: 'Pasadena, EE.UU.' },
    { id: 3, home: { name: 'Sudáfrica', flag: 'za' }, away: { name: 'Canadá', flag: 'ca' }, date: 'Martes, 30 jun', time: '13:00 HS.', stadium: 'AT&T Stadium', city: 'Arlington, EE.UU.' },
    { id: 4, home: { name: 'Países Bajos', flag: 'nl' }, away: { name: 'Marruecos', flag: 'ma' }, date: 'Martes, 30 jun', time: '19:00 HS.', stadium: "Levi's Stadium", city: 'Santa Clara, EE.UU.' },
    { id: 5, home: { name: 'Portugal', flag: 'pt' }, away: { name: 'Croacia', flag: 'hr' }, date: 'Miércoles, 1 jul', time: '13:00 HS.', stadium: 'Hard Rock Stadium', city: 'Miami Gardens, EE.UU.' },
    { id: 6, home: { name: 'España', flag: 'es' }, away: { name: 'Austria', flag: 'at' }, date: 'Miércoles, 1 jul', time: '19:00 HS.', stadium: 'Estadio Azteca', city: 'Ciudad de México, México' },
    { id: 7, home: { name: 'Estados Unidos', flag: 'us' }, away: { name: 'Bosnia y Herz.', flag: 'ba' }, date: 'Jueves, 2 jul', time: '13:00 HS.', stadium: 'SoFi Stadium', city: 'Inglewood, EE.UU.' },
    { id: 8, home: { name: 'Bélgica', flag: 'be' }, away: { name: 'Senegal', flag: 'sn' }, date: 'Jueves, 2 jul', time: '19:00 HS.', stadium: 'Estadio Akron', city: 'Guadalajara, México' },
    { id: 9, home: { name: 'Brasil', flag: 'br' }, away: { name: 'Japón', flag: 'jp' }, date: 'Viernes, 3 jul', time: '13:00 HS.', stadium: 'AT&T Stadium', city: 'Arlington, EE.UU.' },
    { id: 10, home: { name: 'Costa de Marfil', flag: 'ci' }, away: { name: 'Noruega', flag: 'no' }, date: 'Viernes, 3 jul', time: '19:00 HS.', stadium: 'Lumen Field', city: 'Seattle, EE.UU.' },
    { id: 11, home: { name: 'México', flag: 'mx' }, away: { name: 'Ecuador', flag: 'ec' }, date: 'Sábado, 4 jul', time: '13:00 HS.', stadium: 'Estadio Azteca', city: 'Ciudad de México, México' },
    { id: 12, home: { name: 'Inglaterra', flag: 'gb-eng' }, away: { name: 'Rep. del Congo', flag: 'cg' }, date: 'Sábado, 4 jul', time: '19:00 HS.', stadium: 'MetLife Stadium', city: 'East Rutherford, EE.UU.' },
    { id: 13, home: { name: 'Argentina', flag: 'ar' }, away: { name: 'Cabo Verde', flag: 'cv' }, date: 'Domingo, 5 jul', time: '13:00 HS.', stadium: 'Hard Rock Stadium', city: 'Miami Gardens, EE.UU.' },
    { id: 14, home: { name: 'Australia', flag: 'au' }, away: { name: 'Egipto', flag: 'eg' }, date: 'Domingo, 5 jul', time: '19:00 HS.', stadium: 'Rose Bowl', city: 'Pasadena, EE.UU.' },
    { id: 15, home: { name: 'Suiza', flag: 'ch' }, away: { name: 'Argelia', flag: 'dz' }, date: 'Lunes, 6 jul', time: '13:00 HS.', stadium: 'Gillette Stadium', city: 'Foxborough, EE.UU.' },
    { id: 16, home: { name: 'Colombia', flag: 'co' }, away: { name: 'Ghana', flag: 'gh' }, date: 'Lunes, 6 jul', time: '19:00 HS.', stadium: 'SoFi Stadium', city: 'Inglewood, EE.UU.' },
  ],
  '8avos': [
    { id: 17, home: { name: 'Paraguay', flag: 'py' }, away: { name: 'Gan. Francia/Suecia', flag: 'placeholder' }, date: 'Viernes, 10 jul', time: '15:00 HS.', stadium: 'MetLife Stadium', city: 'East Rutherford, EE.UU.' },
    { id: 18, home: { name: 'Gan. Sudáfrica/Canadá', flag: 'placeholder' }, away: { name: 'Gan. P.Bajos/Marruec.', flag: 'placeholder' }, date: 'Viernes, 10 jul', time: '19:00 HS.', stadium: 'Rose Bowl', city: 'Pasadena, EE.UU.' },
    { id: 19, home: { name: 'Gan. Portugal/Croacia', flag: 'placeholder' }, away: { name: 'Gan. España/Austria', flag: 'placeholder' }, date: 'Sábado, 11 jul', time: '15:00 HS.', stadium: 'Hard Rock Stadium', city: 'Miami Gardens, EE.UU.' },
    { id: 20, home: { name: 'Gan. EE.UU./Bosnia', flag: 'placeholder' }, away: { name: 'Gan. Bélgica/Senegal', flag: 'placeholder' }, date: 'Sábado, 11 jul', time: '19:00 HS.', stadium: 'AT&T Stadium', city: 'Arlington, EE.UU.' },
    { id: 21, home: { name: 'Brasil', flag: 'br' }, away: { name: 'Gan. Marfil/Noruega', flag: 'placeholder' }, date: 'Domingo, 12 jul', time: '15:00 HS.', stadium: 'Lumen Field', city: 'Seattle, EE.UU.' },
    { id: 22, home: { name: 'Gan. México/Ecuador', flag: 'placeholder' }, away: { name: 'Gan. Ing./Congo', flag: 'placeholder' }, date: 'Domingo, 12 jul', time: '19:00 HS.', stadium: 'Estadio Azteca', city: 'Ciudad de México, México' },
    { id: 23, home: { name: 'Gan. Argentina/Cabo Verde', flag: 'placeholder' }, away: { name: 'Gan. Australia/Egipto', flag: 'placeholder' }, date: 'Lunes, 13 jul', time: '15:00 HS.', stadium: 'Gillette Stadium', city: 'Foxborough, EE.UU.' },
    { id: 24, home: { name: 'Gan. Suiza/Argelia', flag: 'placeholder' }, away: { name: 'Gan. Colombia/Ghana', flag: 'placeholder' }, date: 'Lunes, 13 jul', time: '19:00 HS.', stadium: 'SoFi Stadium', city: 'Inglewood, EE.UU.' },
  ],
  '4tos': [
    { id: 25, home: { name: 'Gan. Partido 17', flag: 'placeholder' }, away: { name: 'Gan. Partido 18', flag: 'placeholder' }, date: 'Sábado, 18 jul', time: '19:00 HS.', stadium: 'MetLife Stadium', city: 'East Rutherford, EE.UU.' },
    { id: 26, home: { name: 'Gan. Partido 19', flag: 'placeholder' }, away: { name: 'Gan. Partido 20', flag: 'placeholder' }, date: 'Domingo, 19 jul', time: '15:00 HS.', stadium: 'Rose Bowl', city: 'Pasadena, EE.UU.' },
    { id: 27, home: { name: 'Gan. Partido 21', flag: 'placeholder' }, away: { name: 'Gan. Partido 22', flag: 'placeholder' }, date: 'Domingo, 19 jul', time: '19:00 HS.', stadium: 'AT&T Stadium', city: 'Arlington, EE.UU.' },
    { id: 28, home: { name: 'Gan. Partido 23', flag: 'placeholder' }, away: { name: 'Gan. Partido 24', flag: 'placeholder' }, date: 'Lunes, 20 jul', time: '19:00 HS.', stadium: 'Hard Rock Stadium', city: 'Miami Gardens, EE.UU.' },
  ],
  'semifinal': [
    { id: 29, home: { name: 'Gan. Cuartos 1', flag: 'placeholder' }, away: { name: 'Gan. Cuartos 2', flag: 'placeholder' }, date: 'Martes, 23 jul', time: '19:00 HS.', stadium: 'MetLife Stadium', city: 'East Rutherford, EE.UU.' },
    { id: 30, home: { name: 'Gan. Cuartos 3', flag: 'placeholder' }, away: { name: 'Gan. Cuartos 4', flag: 'placeholder' }, date: 'Miércoles, 24 jul', time: '19:00 HS.', stadium: 'Rose Bowl', city: 'Pasadena, EE.UU.' },
  ],
  'final': [
    { id: 31, home: { name: 'Gan. Semifinal 1', flag: 'placeholder' }, away: { name: 'Gan. Semifinal 2', flag: 'placeholder' }, date: 'Domingo, 27 jul', time: '18:00 HS.', stadium: 'MetLife Stadium', city: 'East Rutherford, EE.UU.' },
  ]
};

// Valor de cada sector //
const SECTOR_PRICES = { A: 270000, B: 180000, C: 140000, D: 350000 };
const VENTA_DATES = {
  1: '22/06', 2: '22/06', 3: '23/06', 4: '23/06', 5: '24/06', 6: '24/06', 7: '25/06', 8: '25/06',
  9: '26/06', 10: '26/06', 11: '27/06', 12: '27/06', 13: '28/06', 14: '28/06', 15: '29/06', 16: '29/06'
};

// Ayudante para calcular coordenadas //
const getEllipseCoord = (theta_deg, rx, ry) => {
  const theta = theta_deg * Math.PI / 180;
  const x = rx * Math.cos(theta);
  const y = ry * Math.sin(theta);
  const angle_rad = Math.atan2(rx * Math.sin(theta), ry * Math.cos(theta));
  const angle_deg = angle_rad * 180 / Math.PI;
  return { x, y, angle: angle_deg };
};

// Generador de distribución de secciones del estadio //
const STADIUM_SECTIONS = (() => {
  const s = [];
  const cx = 290;
  const cy = 245;

  // Anillo interior A //
  const rxA = 172;
  const ryA = 132;
  for (let i = 0; i < 30; i++) {
    const theta = -90 + (i * 12);
    const p = getEllipseCoord(theta, rxA, ryA);
    s.push({
      id: `A${i + 1}`,
      cx: Math.round(cx + p.x),
      cy: Math.round(cy + p.y),
      w: 24,
      h: 30,
      angle: Math.round(p.angle),
      avail: true
    });
  }

  // Filas rectas exteriores - Superiores //
  [
    { id: 'B1', cx: 231, cy: 65, w: 32, h: 17, angle: 0, avail: true },
    { id: 'B2', cx: 268, cy: 65, w: 32, h: 17, angle: 0, avail: true },
    { id: 'B3', cx: 305, cy: 65, w: 32, h: 17, angle: 0, avail: true },
    { id: 'B4', cx: 342, cy: 65, w: 32, h: 17, angle: 0, avail: true },
    { id: 'C1', cx: 214, cy: 40, w: 28, h: 18, angle: 0, avail: true },
    { id: 'C2', cx: 247, cy: 40, w: 28, h: 18, angle: 0, avail: true },
    { id: 'C3', cx: 280, cy: 40, w: 28, h: 18, angle: 0, avail: true },
    { id: 'C4', cx: 313, cy: 40, w: 28, h: 18, angle: 0, avail: true },
    { id: 'C5', cx: 346, cy: 40, w: 28, h: 18, angle: 0, avail: true }
  ].forEach(item => s.push(item));

  // Filas rectas exteriores - Inferiores //
  [
    { id: 'B5', cx: 231, cy: 425, w: 32, h: 17, angle: 0, avail: true },
    { id: 'B6', cx: 268, cy: 425, w: 32, h: 17, angle: 0, avail: true },
    { id: 'B7', cx: 305, cy: 425, w: 32, h: 17, angle: 0, avail: true },
    { id: 'B8', cx: 342, cy: 425, w: 32, h: 17, angle: 0, avail: true },
    { id: 'C6', cx: 214, cy: 450, w: 28, h: 18, angle: 0, avail: true },
    { id: 'C7', cx: 247, cy: 450, w: 28, h: 18, angle: 0, avail: true },
    { id: 'C8', cx: 280, cy: 450, w: 28, h: 18, angle: 0, avail: true },
    { id: 'C9', cx: 313, cy: 450, w: 28, h: 18, angle: 0, avail: true },
    { id: 'C10', cx: 346, cy: 450, w: 28, h: 18, angle: 0, avail: true }
  ].forEach(item => s.push(item));

  // Curva exterior derecha //
  const rxD = 222;
  const ryD = 182;
  for (let j = 0; j < 13; j++) {
    const thetaD = -64 + (j * 10.6);
    const pD = getEllipseCoord(thetaD, rxD, ryD);
    s.push({
      id: `D${j + 1}`,
      cx: Math.round(cx + pD.x),
      cy: Math.round(cy + pD.y),
      w: 24,
      h: 30,
      angle: Math.round(pD.angle),
      avail: true
    });
  }

  // Curva exterior izquierda //
  for (let k = 0; k < 13; k++) {
    const thetaL = 116 + (k * 10.6);
    const pL = getEllipseCoord(thetaL, rxD, ryD);
    s.push({
      id: `D${26 - k}`,
      cx: Math.round(cx + pL.x),
      cy: Math.round(cy + pL.y),
      w: 24,
      h: 30,
      angle: Math.round(pL.angle),
      avail: true
    });
  }

  return s;
})();

const getRows = () => [4, 4, 4, 4, 4, 4, 4, 4];

const fmt = n => n.toLocaleString('es-AR');

const findMatch = id => {
  for (const ph in MATCHES) {
    const m = MATCHES[ph].find(x => x.id === +id);
    if (m) return m;
  }
  return MATCHES['16avos'][0];
};

const getSectorTransform = (sec, isSelected) => {
  const scale = isSelected ? 1.08 : 1.0;
  return `translate(${sec.cx},${sec.cy}) rotate(${sec.angle}) scale(${scale})`;
};

const getFlagHtml = (code, name) => {
  if (code === 'placeholder') {
    return '<div class="ta-flag-placeholder"><i class="bi bi-trophy"></i></div>';
  }
  return `<img src="https://flagcdn.com/w80/${code}.png" alt="${name}" class="ta-flag-img">`;
};

// Renderizar tarjeta de partido en el calendario
const matchCard = (m, phase) => {
  const isAvail = (phase === '16avos');
  const btnHtml = isAvail
    ? `<a href="estadio.html?partido=${m.id}" class="ta-btn-comprar">Comprar entradas</a>`
    : '<span class="ta-btn-proximo">Próximamente</span>';
  const venta = VENTA_DATES[m.id] ? `Venta disponible: ${VENTA_DATES[m.id]}` : 'Por confirmar';

  return `
    <div class="ta-match-card">
      <div class="ta-card-body">
        <div class="ta-card-teams">
          <div class="ta-team-col">
            ${getFlagHtml(m.home.flag, m.home.name)}
            <span class="ta-tname">${m.home.name}</span>
          </div>
          <span class="ta-vs">vs</span>
          <div class="ta-team-col">
            ${getFlagHtml(m.away.flag, m.away.name)}
            <span class="ta-tname">${m.away.name}</span>
          </div>
        </div>
        <div class="ta-card-sep"></div>
        <div class="ta-card-info">
          <div class="ta-dt">${m.date} &nbsp;|&nbsp; ${m.time}</div>
          <div class="ta-st">${m.stadium}</div>
          <div class="ta-ci">${m.city}</div>
        </div>
        ${btnHtml}
      </div>
      <div class="ta-card-venta">${venta}</div>
    </div>
  `;
};

const initCalendar = () => {
  const container = document.getElementById('matches-container');
  const btns = document.querySelectorAll('.ta-phase-btn');
  if (!container) return;

  const render = phase => {
    const list = MATCHES[phase] || [];
    container.innerHTML = list.length
      ? list.map(m => matchCard(m, phase)).join('')
      : '<p class="ta-empty">Partidos por definir.</p>';
  };

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render(btn.dataset.phase);
    });
  });

  render('16avos');
};

const initEstadio = () => {
  const params = new URLSearchParams(location.search);
  const match = findMatch(params.get('partido'));
  const bar = document.getElementById('match-bar');

  if (bar) {
    bar.innerHTML = `
      <div class="ta-bar-inner">
        <div class="ta-bar-flags">
          ${getFlagHtml(match.home.flag, match.home.name)}
          <span class="ta-bar-vs">vs</span>
          ${getFlagHtml(match.away.flag, match.away.name)}
        </div>
        <div class="ta-bar-sep"></div>
        <div class="ta-bar-info">
          <div class="ta-bar-dt">${match.date} | ${match.time}</div>
          <div class="ta-bar-venue">${match.stadium}</div>
          <div class="ta-bar-city">${match.city}</div>
        </div>
      </div>
    `;
  }

  buildSVG();

  // Destacar sector A11 por defecto al cargar
  setTimeout(() => {
    const a11G = document.querySelector('.st-sec[data-sid="A11"]');
    if (a11G) selectSector(a11G);
  }, 100);
};

const buildSVG = () => {
  const svg = document.getElementById('stadium-map');
  if (!svg) return;

  // Renderizar campo de fútbol verde con dimensiones compactas para evitar superposiciones
  const field = `
    <rect x="220" y="195" width="140" height="100" rx="4" fill="#28a745"/>
    <line x1="290" y1="195" x2="290" y2="295" stroke="white" stroke-width="1.8"/>
    <circle cx="290" cy="245" r="20" fill="none" stroke="white" stroke-width="1.8"/>
    <rect x="220" y="220" width="25" height="50" fill="none" stroke="white" stroke-width="1.8"/>
    <rect x="335" y="220" width="25" height="50" fill="none" stroke="white" stroke-width="1.8"/>
    <circle cx="242" cy="245" r="2.2" fill="white"/>
    <circle cx="338" cy="245" r="2.2" fill="white"/>
    <circle cx="290" cy="245" r="2.2" fill="white"/>
  `;

  const secs = STADIUM_SECTIONS.map(sec => {
    const fill = '#d5d5d5';
    const stroke = '#b3b3b3';
    const textColor = '#4d4d4d';
    const transformStr = ` transform="${getSectorTransform(sec, false)}"`;

    return `
      <g class="st-sec" data-sid="${sec.id}" data-avail="${sec.avail}" style="cursor:pointer"${transformStr}>
        <rect x="-${sec.w / 2}" y="-${sec.h / 2}" width="${sec.w}" height="${sec.h}" rx="3" fill="${fill}" stroke="${stroke}" stroke-width="1"/>
        <text x="0" y="3" text-anchor="middle" font-family="Montserrat, sans-serif" font-weight="600" font-size="6.8" fill="${textColor}">${sec.id}</text>
      </g>
    `;
  }).join('');

  const labels = `
    <text x="290" y="22" text-anchor="middle" font-family="Montserrat, sans-serif" font-size="10" font-weight="600" fill="#666" letter-spacing="1.5">SECTOR NORTE</text>
    <text x="290" y="478" text-anchor="middle" font-family="Montserrat, sans-serif" font-size="10" font-weight="600" fill="#666" letter-spacing="1.5">SECTOR SUR</text>
  `;

  svg.innerHTML = field + secs + labels;

  svg.querySelectorAll('.st-sec[data-avail="true"]').forEach(g => {
    g.addEventListener('click', () => selectSector(g));
  });
};

const selectSector = g => {
  const svg = document.getElementById('stadium-map');
  svg.querySelectorAll('.st-sec').forEach(s => {
    s.classList.remove('sel');
    const r = s.querySelector('rect');
    const t = s.querySelector('text');
    const sid = s.dataset.sid;
    const sec = STADIUM_SECTIONS.find(x => x.id === sid);
    r.setAttribute('fill', '#d5d5d5');
    r.setAttribute('stroke', '#b3b3b3');
    t.setAttribute('fill', '#4d4d4d');
    s.setAttribute('transform', getSectorTransform(sec, false));
  });

  g.classList.add('sel');
  const rect = g.querySelector('rect');
  const text = g.querySelector('text');
  rect.setAttribute('fill', '#ed194d');
  rect.setAttribute('stroke', '#c0132e');
  text.setAttribute('fill', '#fefefe');

  const selSid = g.dataset.sid;
  const selSec = STADIUM_SECTIONS.find(x => x.id === selSid);
  g.setAttribute('transform', getSectorTransform(selSec, true));

  renderRows(selSid);
};

const renderRows = sid => {
  const container = document.getElementById('rows-container');
  if (!container) return;

  const letter = sid[0];
  const price = SECTOR_PRICES[letter] || 270000;
  const rowQtys = getRows(sid);

  container.innerHTML = rowQtys.map((qty, i) => {
    const fila = 8 - i;
    const isSel = (i === 0);
    let optionsHtml = '';
    for (let v = 0; v <= 4; v++) {
      const selectedAttr = (v === 4 && isSel) ? ' selected' : '';
      optionsHtml += `<option value="${v}"${selectedAttr}>${v}</option>`;
    }

    return `
      <div class="ta-row-item${isSel ? ' sel-row' : ''}" data-fila="${fila}" data-qty="${qty}">
        <div class="tr-sector">${sid}</div>
        <div class="tr-fila">${fila}</div>
        <div class="tr-qty"><select class="ta-qty-sel">${optionsHtml}</select></div>
        <div class="tr-price">$${fmt(price)}</div>
        <div class="tr-cart"><button class="ta-cart-btn"><i class="bi bi-cart-fill" style="color:#ed194d"></i></button></div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.ta-row-item').forEach(row => {
    row.addEventListener('click', () => {
      container.querySelectorAll('.ta-row-item').forEach(r => r.classList.remove('sel-row'));
      row.classList.add('sel-row');
      const btn = document.getElementById('btn-continuar');
      if (btn) btn.disabled = false;
    });
  });

  const btn = document.getElementById('btn-continuar');
  if (btn) {
    btn.disabled = false;
    // Navegamos a asientos.html pasando el sector elegido y el partido actual.
    // Usamos onclick en lugar de addEventListener para reemplazar el handler
    // cada vez que se selecciona un sector distinto (evita listeners duplicados).
    btn.onclick = () => {
      const params = new URLSearchParams(location.search);
      const idPartido = params.get('partido') || '';
      const url = idPartido
        ? `asientos.html?sector=${sid}&partido=${idPartido}`
        : `asientos.html?sector=${sid}`;
      location.href = url;
    };
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('matches-container')) initCalendar();
  if (document.getElementById('match-bar')) initEstadio();
});
