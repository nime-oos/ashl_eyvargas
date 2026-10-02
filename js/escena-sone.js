// Escena "Soñé" (Zoé, Unplugged): ella, dibujada con el estilo del álbum (pastel al óleo +
// marcador negro, 3 cuadros que "hierven", movimientos a saltitos).
// Dos tendederos de lucecitas cruzan un cielo de sueño (estrellas, nubes rosas, luna dormida) y de
// ellos cuelgan con pinzas ocho polaroids de ella, siempre con su misma cara (fleco de cortina, lentes
// grandes de alambre, ojos sonrientes): la selfie de los lentes azules, su cumple con el vestido rojo,
// mandando un beso, guiñando con un girasol, muerta de risa, la de los rizos con la mano en la
// mejilla, en el mar y dormida soñando. Globos amarrados a la punta del tendedero.
// La escena reacciona a lo que dice cada línea de la letra:
//   "ruego al tiempo"   → sale un reloj que gira para atrás
//   "labios"            → el mundo se congela (hasta el crayón deja de hervir), en todas las fotos
//                         hace trompita y sale volando un beso
//   "derretirme"        → las fotos, la luna y las nubes se derriten en chorritos
//   "ojos" / "mirada"   → zoom a la foto de su cumple; sus ojos te siguen y le brillan los lentes
//   "aire / respires"   → remolinos de viento y se le mueve el pelo
//   "perder"            → se van volando los globos
//   "pensando en ti"    → las fotos brincan, las lucecitas brillan y salen corazones
//   "el sol"            → sale el sol en lugar de la luna y todo se pone cálido
//   "cielo"             → estrellas fugaces en el rincón del cielo
//   "del mar"           → sube el mar y se hacen ondas en sus lentes
//   "soñé"              → noche de sueño: halo en la foto, polvo de estrellas y la luna suelta zetas
//   "una vez mas"       → además suben corazones
// Usa las herramientas de crayón de js/escena.js (window.Crayon); se construye la primera vez
// que se elige en el menú de canciones (js/menu.js).
(function () {
  var escena = document.getElementById('escena-sone');
  var audio = document.getElementById('bg-music');
  var C = window.Crayon;
  if (!escena || !audio || !C) return;
  var el = C.el, rnd = C.rnd, pick = C.pick, rayado = C.rayado, trazar = C.trazar, grano = C.grano;
  var CUADROS = C.CUADROS;
  var W = 1200, H = 800;
  var SVG = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;overflow:visible">';
  var L = 'class="linea" pathLength="1" fill="none" stroke="#161616" stroke-linecap="round" stroke-linejoin="round"';
  var K = 'stroke="#161616" stroke-linecap="round" stroke-linejoin="round"';
  var PIEL = '#e4b08c', PIEL_SOMBRA = '#c4906c', PELO = '#140d0a';
  var ESTADOS = ['en-tiempo', 'en-labios', 'en-derretir', 'en-ojos', 'en-aire', 'en-perder', 'en-pensando',
    'en-sol', 'en-cielo', 'en-mar', 'en-sone', 'en-final'];

  var construida = false, activa = false, cuadro = 0, timer;
  var lienzosMarco = [], texFondo = [], tex = {}, mundo;

  // ---- utilidades ----
  function zona(lista, n, x0, x1, y0, y1, colores, o) {
    o = o || {};
    for (var i = 0; i < n; i++) {
      var ang = o.ang ? rnd(o.ang[0], o.ang[1]) : rnd(-1.2, 1.2) + (Math.random() < .5 ? 1.5 : 0);
      lista.push(rayado(null, rnd(x0, x1), rnd(y0, y1), ang, rnd(o.len ? o.len[0] : 40, o.len ? o.len[1] : 180),
        Math.round(rnd(3, o.filas || 8)), rnd(4, 7), rnd(o.ancho ? o.ancho[0] : 4, o.ancho ? o.ancho[1] : 10),
        pick(colores), rnd(o.alfa ? o.alfa[0] : .35, o.alfa ? o.alfa[1] : .75)));
    }
  }
  function texSet(base, colores, n) {
    var lista = [];
    zona(lista, n || 40, -20, 220, -20, 220, colores, { len: [30, 110], ancho: [3, 8], alfa: [.4, .85] });
    return C.texturas(200, 200, base, lista, 1.2);
  }
  function letra(ch, x, y, tam, rot, i) {
    return '<text class="letra" x="' + x + '" y="' + y + '" font-size="' + tam + '" transform="rotate(' + rot + ' ' + x + ' ' + y + ')" ' +
      'style="animation-delay:-' + (i * .23).toFixed(2) + 's">' + ch + '</text>';
  }
  function f(n) { return n.toFixed(1); }
  function imagen(clase, x, y, w, h) {
    return '<image class="tex-' + clase + '" href="' + tex[clase][0] + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" preserveAspectRatio="none"/>';
  }
  function estrella4(x, y, r, color, clase, w) {
    return '<path class="' + clase + '" style="--w:-' + w + 's" d="M' + f(x) + ' ' + f(y - r) + ' Q' + f(x + r * .15) + ' ' + f(y - r * .15) + ' ' + f(x + r) + ' ' + f(y) +
      ' Q' + f(x + r * .15) + ' ' + f(y + r * .15) + ' ' + f(x) + ' ' + f(y + r) + ' Q' + f(x - r * .15) + ' ' + f(y + r * .15) + ' ' + f(x - r) + ' ' + f(y) +
      ' Q' + f(x - r * .15) + ' ' + f(y - r * .15) + ' ' + f(x) + ' ' + f(y - r) + 'Z" fill="' + color + '" stroke="#161616" stroke-width="1.5"/>';
  }
  var COR = 'M0 30 C-30 12 -40 -8 -32 -20 C-24 -32 -8 -30 0 -16 C8 -30 24 -32 32 -20 C40 -8 30 12 0 30Z';
  function corazon(x, y, s, i) {
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><g class="corazoncito" style="--w:-' + (i * .3).toFixed(2) + 's;--x:' + rnd(-50, 50).toFixed(0) + 'px">' +
      '<g filter="url(#pastel)" clip-path="url(#snCor)"><image class="tex-rojo" href="' + tex.rojo[i % CUADROS] + '" x="-42" y="-36" width="84" height="70" preserveAspectRatio="none"/></g>' +
      '<path d="' + COR + '" fill="none" stroke="#161616" stroke-width="7" filter="url(#marcador)"/></g></g>';
  }
  // chorrito de "derretirme": tira con la punta redonda que cuelga de una orilla
  function chorrito(x, y, w, h, color, i) {
    return '<path class="chorrito" style="--w:' + (i * .09).toFixed(2) + 's" d="M' + f(x) + ' ' + f(y) + ' L' + f(x + w) + ' ' + f(y) + ' L' + f(x + w) + ' ' + f(y + h) +
      ' A' + f(w / 2) + ' ' + f(w / 2) + ' 0 0 1 ' + f(x) + ' ' + f(y + h) + 'Z" fill="' + color + '" ' + K + ' stroke-width="2"/>';
  }

  // ---- el cielo de sueño: azul noche arriba, violeta en medio y rosa abajo ----
  function pintarCielo() {
    var lista = [];
    zona(lista, 80, -40, W + 40, -40, 260, ['#141a3a', '#1c2350', '#222a5e', '#10142e'], { len: [100, 300], ancho: [8, 14], alfa: [.6, .9] });
    zona(lista, 80, -40, W + 40, 200, 520, ['#2e2a68', '#3a2a6a', '#4a3480', '#2a2f72'], { len: [100, 300], ancho: [8, 14], alfa: [.55, .85] });
    zona(lista, 80, -40, W + 40, 460, H + 40, ['#7a4a8a', '#9a5a98', '#c87aa0', '#e8a0b0', '#6a4a90'], { len: [100, 300], ancho: [8, 14], alfa: [.5, .8] });
    // vía láctea en diagonal
    zona(lista, 40, 0, W, 0, 500, ['#8a9ae0', '#b8a8f0', '#e8d8ff'], { ang: [-.5, -.3], len: [60, 200], ancho: [3, 6], alfa: [.08, .22] });
    var urls = [];
    for (var q = 0; q < CUADROS; q++) {
      var cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      var cx = cv.getContext('2d');
      cx.fillStyle = '#1a1c48'; cx.fillRect(0, 0, W, H);
      lista.forEach(function (tr) { trazar(cx, tr, 1.6); });
      grano(cx, W, H, 14000, .09);
      urls.push(cv.toDataURL('image/jpeg', .85));
    }
    return urls;
  }

  // marco de papel con orilla irregular (igual que en las otras escenas)
  function pintarMarco() {
    var w = innerWidth, h = innerHeight, m = Math.min(w, h) * .035;
    lienzosMarco.forEach(function (cv) {
      cv.width = w; cv.height = h;
      var c = cv.getContext('2d');
      c.fillStyle = '#ebe6da'; c.fillRect(0, 0, w, h);
      grano(c, w, h, 5000, .1);
      c.globalCompositeOperation = 'destination-out';
      c.beginPath();
      var pts = [], t;
      for (t = 0; t <= 1; t += .02) pts.push([m + t * (w - 2 * m), m + rnd(-4, 7)]);
      for (t = 0; t <= 1; t += .02) pts.push([w - m + rnd(-7, 3), m + t * (h - 2 * m)]);
      for (t = 1; t >= 0; t -= .02) pts.push([m + t * (w - 2 * m), h - m + rnd(-7, 4)]);
      for (t = 1; t >= 0; t -= .02) pts.push([m + rnd(-3, 7), m + t * (h - 2 * m)]);
      pts.forEach(function (p, i) { i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); });
      c.fill();
      c.globalCompositeOperation = 'source-over';
    });
  }

  // ---- ella ----
  // Se dibuja en coordenadas locales: la cara centrada en (0, 0), de 68 x 84.
  // o: { id, x, y, s, pelo: 'liso' | 'rizado', ropa: 'vestido' | 'negro' | 'rosa', brazos, mano,
  //      boca: 'sonrisa' | 'beso' | 'ambas', reflejo, principal }
  function chica(o) {
    var id = o.id, s = '<g transform="translate(' + o.x + ' ' + o.y + ') scale(' + o.s + ')">';

    // pelo de atrás
    var forma, contorno = null;
    if (o.pelo === 'rizado') {
      forma = '';
      for (var i = 0; i < 46; i++) {
        var a = rnd(0, Math.PI * 2), d = Math.sqrt(Math.random());
        var px = Math.cos(a) * d * 88, py = 24 + Math.sin(a) * d * 118;
        forma += '<circle cx="' + f(px) + '" cy="' + f(py) + '" r="' + f(rnd(15, 24)) + '"/>';
      }
      forma += '<ellipse cx="0" cy="-6" rx="62" ry="64"/>';
      contorno = forma.replace(/ r="([\d.]+)"/g, function (m, r) { return ' r="' + f(+r + 2.6) + '"'; }).replace('rx="62" ry="64"', 'rx="64.6" ry="66.6"');
    } else {
      forma = '<path d="M-40 -42 C-58 -22 -60 40 -64 100 C-66 125 -60 145 -48 152 C-24 158 24 158 48 152 C60 145 66 125 62 90 C60 40 58 -22 40 -44 C20 -62 -20 -62 -40 -42Z"/>';
    }
    s += '<clipPath id="snPelo' + id + '">' + forma + '</clipPath>' +
      '<g class="pelo-mece">' +
        (contorno ? '<g fill="#161616" filter="url(#marcador)">' + contorno + '</g>' : '') +
        '<g filter="url(#pastel)" clip-path="url(#snPelo' + id + ')">' + imagen('pelo', -100, -100, 200, 340) + '</g>' +
        (contorno ? '' : '<g fill="none" stroke="#161616" stroke-width="2.5" filter="url(#marcador)">' + forma + '</g>') +
        (o.pelo === 'rizado' ? '' : '<path d="M-50 60 C-54 90 -50 120 -54 146 M-42 90 C-46 110 -42 130 -44 150 M48 60 C54 90 50 120 54 146 M40 90 C44 110 40 130 44 150" stroke="#5a3a28" stroke-width="3" fill="none" opacity=".8"/>') +
      '</g>';

    // cuello y hombros
    s += '<path d="M-9 30 L-9.5 64 L9.5 64 L9 30Z" fill="' + PIEL_SOMBRA + '" ' + K + ' stroke-width="2"/>' +
      '<path d="M-12 60 C-38 63 -58 70 -66 88 L-68 122 L68 122 L66 88 C58 70 38 63 12 60Z" fill="' + PIEL + '" ' + K + ' stroke-width="2.5"/>' +
      '<path d="M-7 71 C-16 74 -24 75 -34 76 M7 71 C16 74 24 75 34 76" stroke="' + PIEL_SOMBRA + '" stroke-width="2" fill="none"/>';
    // ropa: vestido rojo de hombros caídos, o un top
    var colorTop = { negro: '#161418', rosa: '#f2c6d0', blanco: '#f6f3ec', lila: '#c8b0e8', amarillo: '#f4d86a' }[o.ropa];
    var TOP = o.ropa === 'vestido' ? 'M-70 86 C-40 80 40 80 70 86 C72 110 64 136 46 160 C38 172 35 180 37 190 C48 215 60 245 60 280 L60 330 L-60 330 L-60 280 C-60 245 -48 215 -37 190 C-35 180 -38 172 -46 160 C-64 136 -72 110 -70 86Z'
      : 'M-70 76 C-44 68 -20 70 0 72 C20 70 44 68 70 76 L78 330 L-78 330Z';
    if (o.ropa === 'vestido') {
      s += '<clipPath id="snVest' + id + '"><path d="' + TOP + '"/></clipPath>' +
        '<g filter="url(#pastel)" clip-path="url(#snVest' + id + ')">' + imagen('vestido', -110, 90, 220, 250) + '</g>' +
        '<path d="' + TOP + '" fill="none" ' + K + ' stroke-width="3" filter="url(#marcador)"/>' +
        '<path d="M-44 88 C-22 94 22 94 44 88" stroke="#5a1812" stroke-width="3" fill="none"/>' +
        '<path d="M-10 196 C-14 230 -8 270 -14 320 M18 200 C14 240 22 280 16 320 M-40 184 C-20 191 20 191 40 184 M-46 130 C-34 140 -20 142 -10 138 M46 130 C34 140 20 142 10 138" stroke="#5a1812" stroke-width="2.5" fill="none" opacity=".7"/>';
    } else {
      s += '<path d="' + TOP + '" fill="' + colorTop + '" ' + K + ' stroke-width="3"/>' +
        '<path d="M-20 74 C-10 82 10 82 20 74" stroke="' + (o.ropa === 'negro' ? '#3a3640' : '#ffffff') + '" stroke-width="4" fill="none" opacity=".7"/>';
    }
    // brazos (en la foto del cumpleaños: el izquierdo sostiene el pastel, con su pulsera negra)
    if (o.brazos) {
      s += '<path d="M64 96 C72 130 66 160 56 185 C50 205 56 235 62 255" stroke="#161616" stroke-width="30" stroke-linecap="round" fill="none"/>' +
        '<path d="M64 96 C72 130 66 160 56 185 C50 205 56 235 62 255" stroke="' + PIEL + '" stroke-width="25" stroke-linecap="round" fill="none"/>' +
        '<path d="M58 90 L82 102" stroke="#8e3a28" stroke-width="11" stroke-linecap="round"/>' +
        '<path d="M-64 96 C-76 138 -78 178 -72 200 C-78 208 -86 213 -96 216" stroke="#161616" stroke-width="30" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
        '<path d="M-64 96 C-76 138 -78 178 -72 200 C-78 208 -86 213 -96 216" stroke="' + PIEL + '" stroke-width="25" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
        '<path d="M-88 198 L-78 210" stroke="#161616" stroke-width="8" stroke-linecap="round"/>';
    }
    // la mano en la mejilla, con el tatuaje en letra cursiva en el antebrazo
    if (o.mano) {
      s += '<path d="M-48 200 C-46 140 -40 80 -30 40" stroke="#161616" stroke-width="27" stroke-linecap="round" fill="none"/>' +
        '<path d="M-48 200 C-46 140 -40 80 -30 40" stroke="' + PIEL + '" stroke-width="22" stroke-linecap="round" fill="none"/>' +
        '<path d="M-50 170 C-48 160 -45 158 -47 150 C-45 142 -42 140 -44 132 C-42 124 -40 122 -40 114" stroke="#3a2418" stroke-width="2" fill="none"/>';
    }

    // mechón largo que le cae por delante del hombro (en la foto, del lado del pastel)
    if (o.pelo !== 'rizado') {
      var MECHON = 'M-32 4 C-44 34 -54 70 -56 150 C-48 158 -38 156 -30 148 C-32 110 -30 70 -20 34Z';
      s += '<clipPath id="snMechon' + id + '"><path d="' + MECHON + '"/></clipPath>' +
        '<g filter="url(#pastel)" clip-path="url(#snMechon' + id + ')">' + imagen('pelo', -72, 0, 56, 164) + '</g>' +
        '<path d="' + MECHON + '" fill="none" stroke="#161616" stroke-width="2.4" filter="url(#marcador)"/>' +
        '<path d="M-36 40 C-44 70 -46 100 -46 140" stroke="#5a3a28" stroke-width="2.5" fill="none" opacity=".8"/>';
    }

    // la cabeza, un poquito ladeada como en la foto
    s += '<g transform="rotate(' + (o.inclina || 0) + ' 0 30)">';
    // cara redonda de cachetes llenos y barbilla suave
    s += '<path d="M-31 -14 C-32 -38 -16 -46 0 -46 C16 -46 32 -38 31 -14 C31 4 28 18 21 29 C14 38 7 42 0 42 C-7 42 -14 38 -21 29 C-28 18 -31 4 -31 -14Z" fill="' + PIEL + '" ' + K + ' stroke-width="2.5"/>' +
      '<path d="M-24 25 C-17 33 -9 38 0 38" stroke="' + PIEL_SOMBRA + '" stroke-width="2" fill="none" opacity=".6"/>' +
      '<ellipse cx="-19" cy="16" rx="6" ry="3.6" fill="#ec9a8a" opacity=".45"/><ellipse cx="19" cy="16" rx="6" ry="3.6" fill="#ec9a8a" opacity=".45"/>';
    // cejas finas
    s += '<path d="M-22 -8 C-18 -11 -12 -11 -7 -9 M7 -9 C12 -11 18 -11 22 -8" stroke="#2a1a14" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
    // ojos negros sonrientes (un poco cerraditos por la sonrisa) con su brillito;
    // o cerrados de risa / dormida, o guiñando uno
    function ojoAbierto(x, lado) {
      return '<path d="M' + (x - 6) + ' 4 C' + (x - 3) + ' ' + (lado * .5 - .5) + ' ' + (x + 3) + ' -.5 ' + (x + 6) + ' 3 C' + (x + 3) + ' 6 ' + (x - 3) + ' 6.5 ' + (x - 6) + ' 4Z" fill="#fbf4ee"/>' +
        '<g class="pup"><circle cx="' + x + '" cy="3.4" r="3.2" fill="#120c0a"/><circle cx="' + (x + 1) + '" cy="2.4" r="1" fill="#fff"/></g>' +
        '<path d="M' + (x - 7) + ' 4 C' + (x - 4) + ' -.5 ' + (x + 3) + ' -1.2 ' + (x + 7) + ' 2.6" stroke="#161616" stroke-width="2.3" fill="none" stroke-linecap="round"/>' +
        '<path d="M' + (x - 6) + ' 6 C' + (x - 3) + ' 8.5 ' + (x + 3) + ' 8.5 ' + (x + 6) + ' 6" stroke="' + PIEL_SOMBRA + '" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
    }
    function ojoCerrado(x) {
      return '<path d="M' + (x - 6) + ' 3 C' + (x - 3) + ' 6.5 ' + (x + 3) + ' 6.5 ' + (x + 6) + ' 3" stroke="#161616" stroke-width="2.3" fill="none" stroke-linecap="round"/>';
    }
    var ojos = o.ojos || 'normal';
    s += '<g class="' + (ojos === 'normal' ? 'parpado-ojo' : '') + '">' +
      (ojos === 'cerrados' ? ojoCerrado(-14) + ojoCerrado(14) : ojoAbierto(-14, -1) + (ojos === 'guino' ? ojoCerrado(14) : ojoAbierto(14, 1))) +
      '<path d="M-21 4 L-23.5 2.5 M-19.5 2 L-21.5 .2 M21 4 L23.5 2.5 M19.5 2 L21.5 .2" stroke="#161616" stroke-width="1.3" stroke-linecap="round"/></g>';
    // naricita redonda
    s += '<path d="M-1 8 C-1.5 12 -2 14 -3 16" stroke="' + PIEL_SOMBRA + '" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
      '<path d="M-5 17 C-3 19.5 3 19.5 5 17" stroke="#9a6248" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
    // boca: sonrisa suave de labios cerrados, o la trompita del beso
    var sonrisa = '<g class="boca-sonrisa"><path d="M-11 26 C-6 24 -2 24.5 0 25.5 C2 24.5 6 24 11 26 C6 27 -6 27 -11 26Z" fill="#b86a68" stroke="#7a3a36" stroke-width="1.1"/>' +
      '<path d="M-10.5 26.4 C-6 30.6 6 30.6 10.5 26.4 C6 27.6 -6 27.6 -10.5 26.4Z" fill="#d08a82" stroke="#7a3a36" stroke-width="1.1"/>' +
      '<path d="M-4 28.6 C-1 29.4 2 29.4 4 28.6" stroke="#f2bcb2" stroke-width="1.2" fill="none"/>' +
      '<path d="M-11 26 C-12.5 25.2 -13.3 24.2 -13.6 23.4 M11 26 C12.5 25.2 13.3 24.2 13.6 23.4" stroke="#7a3a36" stroke-width="1.2" fill="none" stroke-linecap="round"/></g>';
    var beso = '<g class="boca-beso"><g transform="translate(0 28) scale(.78) translate(0 -28)"><path d="M-9 28 C-9 21 -3 20 0 22 C3 20 9 21 9 28 C9 35 3 36 0 35 C-3 36 -9 35 -9 28Z" fill="#c4706a" stroke="#7a3a36" stroke-width="1.4"/>' +
      '<path d="M-8 28 C-3 29.5 3 29.5 8 28" stroke="#7a3a36" stroke-width="1.3" fill="none"/>' +
      '<ellipse cx="-2.5" cy="31.5" rx="2.5" ry="1.4" fill="#f2bcb2"/></g></g>';
    var risa = '<g class="boca-sonrisa"><path d="M-11 24.5 C-6 23.5 6 23.5 11 24.5 C9 33 4 36 0 36 C-4 36 -9 33 -11 24.5Z" fill="#6a2226" stroke="#7a3a36" stroke-width="1.2"/>' +
      '<path d="M-9.5 25 C-4 24.4 4 24.4 9.5 25 L8.6 27.6 C4 28.2 -4 28.2 -8.6 27.6Z" fill="#fff"/>' +
      '<path d="M-5 33 C-2 31 2 31 5 33 C3 35 -3 35 -5 33Z" fill="#e0707a"/>' +
      '<path d="M-11 24.5 C-12.5 23.6 -13.3 22.6 -13.6 21.8 M11 24.5 C12.5 23.6 13.3 22.6 13.6 21.8" stroke="#7a3a36" stroke-width="1.2" fill="none" stroke-linecap="round"/></g>';
    s += o.boca === 'beso' ? beso.replace('class="boca-beso"', 'class="boca-beso fija"') : (o.boca === 'risa' ? risa : sonrisa) + beso;

    // fleco
    if (o.pelo === 'rizado') {
      var rizosFleco = '';
      for (var r = -36; r <= 36; r += 12) rizosFleco += '<circle cx="' + (r + rnd(-3, 3)).toFixed(1) + '" cy="' + f(-30 + Math.abs(r) * .2 + rnd(-4, 4)) + '" r="' + f(rnd(11, 15)) + '"/>';
      s += '<clipPath id="snFleco' + id + '">' + rizosFleco + '</clipPath>' +
        '<g filter="url(#pastel)" clip-path="url(#snFleco' + id + ')">' + imagen('pelo', -60, -60, 120, 60) + '</g>' +
        '<g fill="none" stroke="#161616" stroke-width="2.2" filter="url(#marcador)">' + rizosFleco + '</g>';
    } else {
      // fleco de cortina abierto en medio, que cae a los lados hasta los pómulos, y mechones que enmarcan la cara
      var FLECO = 'M-37 -12 C-39 -46 -16 -58 4 -58 C26 -58 41 -46 37 -12 C34 -28 24 -42 6 -46 C14 -36 24 -24 30 -12 C32 -8 33 -5 33 -2 C28 -9 22 -14 16 -18 C11 -24 8 -30 5 -38 C2 -30 -2 -24 -8 -18 C-18 -13 -26 -9 -32 -2 C-33 -6 -32 -9 -30 -12 C-26 -22 -16 -36 -6 -44 C-22 -40 -33 -28 -37 -12Z ' +
        'M-37 -10 C-42 16 -42 40 -36 62 L-31 40 C-33 22 -33 6 -32 -4Z M37 -10 C42 16 42 40 37 60 L32 40 C33 22 33 6 32 -4Z';
      s += '<clipPath id="snFleco' + id + '"><path d="' + FLECO + '"/></clipPath>' +
        '<g filter="url(#pastel)" clip-path="url(#snFleco' + id + ')">' + imagen('pelo', -60, -70, 120, 150) + '</g>' +
        '<path d="' + FLECO + '" fill="none" stroke="#161616" stroke-width="2.3" stroke-linejoin="round" filter="url(#marcador)"/>' +
        '<path d="M5 -58 L5 -47 M-10 -50 C-20 -44 -26 -34 -30 -20 M14 -50 C24 -44 30 -32 32 -20" stroke="#4a3424" stroke-width="2.2" fill="none" opacity=".8"/>';
    }

    // lentes grandes y redondos de alambre delgado (con reflejo de pantalla en las selfies)
    var aro = o.principal ? '#c8a070' : '#c9a24a';
    s += '<g class="lentes">' +
      '<circle class="lente" cx="-16.5" cy="7" r="15.5" fill="' + o.reflejo + '" fill-opacity="' + (o.principal ? '.07' : '.14') + '"/><circle class="lente" cx="16.5" cy="7" r="15.5" fill="' + o.reflejo + '" fill-opacity="' + (o.principal ? '.07' : '.14') + '"/>' +
      '<path class="reflejo" d="M-28 1 C-27 -6 -22 -10 -17 -11 L-18 -8 C-22 -7 -25 -4 -25 1Z M2 1 C3 -6 8 -10 13 -11 L12 -8 C8 -7 5 -4 5 1Z" fill="' + o.reflejo + '" opacity="' + (o.principal ? '.55' : '.8') + '"/>' +
      (o.principal ? '<g class="ondas-lente">' +
        '<circle class="onda-lente" cx="-15" cy="9" r="4" fill="none" stroke="#9ad0ff" stroke-width="1"/>' +
        '<circle class="onda-lente" style="--w:-.6s" cx="-15" cy="9" r="4" fill="none" stroke="#9ad0ff" stroke-width="1"/>' +
        '<circle class="onda-lente" cx="15" cy="9" r="4" fill="none" stroke="#9ad0ff" stroke-width="1"/>' +
        '<circle class="onda-lente" style="--w:-.6s" cx="15" cy="9" r="4" fill="none" stroke="#9ad0ff" stroke-width="1"/>' + '</g>' +
        '<g class="brillos-lente">' + estrella4(-20, -3, 4.5, '#fff6c8', 'brillo-lente', .1) + estrella4(11, -4, 4.5, '#fff6c8', 'brillo-lente', .4) + estrella4(-10, 11, 3, '#fff', 'brillo-lente', .7) + estrella4(21, 10, 3, '#fff', 'brillo-lente', .2) + '</g>' : '') +
      '<circle cx="-16.5" cy="7" r="15.5" fill="none" stroke="#161616" stroke-width="2.6" opacity=".5"/><circle cx="16.5" cy="7" r="15.5" fill="none" stroke="#161616" stroke-width="2.6" opacity=".5"/>' +
      '<circle cx="-16.5" cy="7" r="15.5" fill="none" stroke="' + aro + '" stroke-width="1.7"/><circle cx="16.5" cy="7" r="15.5" fill="none" stroke="' + aro + '" stroke-width="1.7"/>' +
      '<path d="M-1.5 3 Q0 .5 1.5 3" stroke="' + aro + '" stroke-width="1.6" fill="none"/>' +
      '<path d="M-32 5 L-35 1 M32 5 L35 1" stroke="' + aro + '" stroke-width="1.6"/></g>';
    s += '</g>';
    return s + '</g>';
  }

  // ---- polaroid ----
  // marco crema con orilla de abajo más ancha, cinta arriba y sombra
  function marcoPolaroid(x, y, w, h, abajo) {
    return '<rect x="' + (x + 7) + '" y="' + (y + 9) + '" width="' + w + '" height="' + h + '" rx="4" fill="#0a0820" opacity=".35"/>' +
      '<g filter="url(#pastel)"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4" fill="#f6f3ec"/></g>' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4" fill="none" ' + K + ' stroke-width="3" filter="url(#marcador)"/>' +
      '<path d="M' + (x + 6) + ' ' + (y + h - abajo + 30) + ' C' + (x + w * .4) + ' ' + (y + h - abajo + 34) + ' ' + (x + w * .7) + ' ' + (y + h - abajo + 28) + ' ' + (x + w - 6) + ' ' + (y + h - abajo + 32) + '" stroke="#e2dccf" stroke-width="6" fill="none" opacity=".7"/>';
  }
  function cinta(x, y, rot) {
    return '<rect x="' + (x - 34) + '" y="' + (y - 11) + '" width="68" height="22" fill="rgba(233,230,138,.75)" transform="rotate(' + rot + ' ' + x + ' ' + y + ')"/>';
  }
  // pastel blanco con orilla amarilla, el monito rosa pintado y velitas
  function pastel(cx, cy, s) {
    var p = function (dx, dy) { return f(cx + dx * s) + ' ' + f(cy + dy * s); };
    var velas = '';
    [-26, -6, 14, 30].forEach(function (dx, i) {
      velas += '<rect x="' + f(cx + (dx - 2) * s) + '" y="' + f(cy - 96 * s) + '" width="' + f(4 * s) + '" height="' + f(22 * s) + '" fill="' + ['#8ab8e8', '#f4a0c0', '#e8c34a', '#8ac34a'][i] + '" stroke="#161616" stroke-width="1.2"/>' +
        '<path class="llama-vela" style="--w:-' + (i * .2).toFixed(1) + 's" d="M' + p(dx, -98) + ' C' + p(dx - 5, -104) + ' ' + p(dx - 1, -110) + ' ' + p(dx, -114) + ' C' + p(dx + 1, -110) + ' ' + p(dx + 5, -104) + ' ' + p(dx, -98) + 'Z" fill="#ffb03a" stroke="#161616" stroke-width="1"/>';
    });
    return '<ellipse cx="' + cx + '" cy="' + f(cy + 4 * s) + '" rx="' + f(66 * s) + '" ry="' + f(13 * s) + '" fill="#fbfbf8" ' + K + ' stroke-width="2.5"/>' +
      '<path d="M' + p(-46, -2) + ' L' + p(-46, -72) + ' L' + p(46, -72) + ' L' + p(46, -2) + ' C' + p(30, 6) + ' ' + p(-30, 6) + ' ' + p(-46, -2) + 'Z" fill="#f8f6f0" ' + K + ' stroke-width="2.5"/>' +
      '<ellipse cx="' + cx + '" cy="' + f(cy - 72 * s) + '" rx="' + f(46 * s) + '" ry="' + f(10 * s) + '" fill="#fffdf8" ' + K + ' stroke-width="2.5"/>' +
      '<path d="M' + p(-46, -6) + ' Q' + p(-38, -14) + ' ' + p(-30, -6) + ' T' + p(-14, -6) + ' T' + p(2, -6) + ' T' + p(18, -6) + ' T' + p(34, -6) + ' T' + p(46, -6) + '" stroke="#e8d26a" stroke-width="' + f(5 * s) + '" fill="none"/>' +
      '<g class="chorritos-pastel">' + chorrito(cx - 40 * s, cy - 74 * s, 7 * s, 14 * s, '#fffdf8', 1) + chorrito(cx - 6 * s, cy - 70 * s, 8 * s, 18 * s, '#fffdf8', 2) + chorrito(cx + 26 * s, cy - 72 * s, 7 * s, 12 * s, '#fffdf8', 3) + '</g>' +
      // el monito rosa dibujado en el pastel
      '<path d="M' + p(-14, -14) + ' C' + p(-18, -40) + ' ' + p(-12, -60) + ' ' + p(0, -60) + ' C' + p(12, -60) + ' ' + p(16, -40) + ' ' + p(12, -14) + ' M' + p(-6, -14) + ' L' + p(-6, -26) + ' M' + p(4, -14) + ' L' + p(4, -26) + '" stroke="#e86a8a" stroke-width="' + f(4 * s) + '" fill="#f4a0b8" stroke-linecap="round"/>' +
      '<circle cx="' + f(cx - 4 * s) + '" cy="' + f(cy - 46 * s) + '" r="' + f(1.8 * s) + '" fill="#161616"/><circle cx="' + f(cx + 4 * s) + '" cy="' + f(cy - 46 * s) + '" r="' + f(1.8 * s) + '" fill="#161616"/>' +
      '<path d="M' + p(-30, -30) + ' L' + p(-22, -40) + ' M' + p(24, -24) + ' L' + p(32, -36) + '" stroke="#5aa0d8" stroke-width="' + f(3 * s) + '"/>' + velas;
  }
  function globo(x, y, r, color, cls, w) {
    return '<g class="' + cls + '" style="--w:-' + w + 's"><ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(r) + '" ry="' + f(r * 1.18) + '" fill="' + color + '" ' + K + ' stroke-width="2.5"/>' +
      '<ellipse cx="' + f(x - r * .35) + '" cy="' + f(y - r * .4) + '" rx="' + f(r * .22) + '" ry="' + f(r * .32) + '" fill="#fff" opacity=".55" transform="rotate(25 ' + f(x - r * .35) + ' ' + f(y - r * .4) + ')"/>' +
      '<path d="M' + f(x - 4) + ' ' + f(y + r * 1.18 + 5) + ' L' + f(x) + ' ' + f(y + r * 1.18 - 1) + ' L' + f(x + 4) + ' ' + f(y + r * 1.18 + 5) + 'Z" fill="' + color + '" ' + K + ' stroke-width="1.5"/></g>';
  }
  function nube(cx, cy, s, id) {
    var bolas = [[-60, 10, 34], [-24, -12, 42], [22, -16, 38], [58, 6, 30], [0, 16, 36]];
    var forma = bolas.map(function (b) { return '<circle cx="' + f(cx + b[0] * s) + '" cy="' + f(cy + b[1] * s) + '" r="' + f(b[2] * s) + '"/>'; }).join('');
    var borde = bolas.map(function (b) { return '<circle cx="' + f(cx + b[0] * s) + '" cy="' + f(cy + b[1] * s) + '" r="' + f(b[2] * s + 3.5) + '"/>'; }).join('');
    var chorros = '';
    [-50, -14, 20, 50].forEach(function (dx, i) { chorros += chorrito(cx + dx * s, cy + 30 * s, 9 * s, rnd(16, 34) * s, pick(['#f4b8cc', '#e8a0c0', '#d8a8e0']), i + 4); });
    return '<g class="nube" style="--w:-' + rnd(0, 5).toFixed(1) + 's"><clipPath id="snNube' + id + '">' + forma + '</clipPath>' +
      '<g fill="#161616" filter="url(#marcador)">' + borde + '</g>' +
      '<g filter="url(#pastel)" clip-path="url(#snNube' + id + ')">' + imagen('nube', cx - 110 * s, cy - 70 * s, 220 * s, 130 * s) + '</g>' +
      '<g class="chorros-nube">' + chorros + '</g></g>';
  }

  function construir() {
    construida = true;
    texFondo = pintarCielo();
    tex.pelo = texSet(PELO, ['#2a1a12', '#0c0705', '#3a2418', '#1e130d', '#4a2e1e'], 50);
    tex.vestido = texSet('#8e3a28', ['#a4462e', '#72281c', '#b8543a', '#5e2016', '#c46248'], 45);
    tex.nube = texSet('#f0b8d0', ['#f8d0e0', '#e8a0c0', '#ffe0ec', '#d8a8e0', '#c898d8'], 40);
    tex.luna = texSet('#f6eec8', ['#fff8d8', '#e8dca8', '#fffbe8', '#d9c98a'], 35);
    tex.rojo = C.texRojo;

    mundo = el('mundo', escena);

    // ---- capa 1: el cielo, estrellas, la luna dormida, el sol, nubes, estrellas fugaces y el reloj ----
    var estrellas = '';
    for (var e = 0; e < 46; e++) {
      var ex = rnd(20, W - 20), ey = rnd(20, 520);
      estrellas += Math.random() < .55 ? estrella4(ex, ey, rnd(4, 9), pick(['#fff6c8', '#ffffff', '#f8e0ff']), 'estrella', rnd(0, 3).toFixed(2))
        : '<circle class="estrella" style="--w:-' + rnd(0, 3).toFixed(2) + 's" cx="' + f(ex) + '" cy="' + f(ey) + '" r="' + f(rnd(1.5, 3)) + '" fill="#fff6e0"/>';
    }
    var rayos = '';
    for (var r = 0; r < 12; r++) {
      var a = r / 12 * Math.PI * 2, a1 = a - .12, a2 = a + .12;
      rayos += 'M' + f(1110 + Math.cos(a1) * 82) + ' ' + f(200 + Math.sin(a1) * 82) + ' L' + f(1110 + Math.cos(a) * 140) + ' ' + f(200 + Math.sin(a) * 140) + ' L' + f(1110 + Math.cos(a2) * 82) + ' ' + f(200 + Math.sin(a2) * 82) + 'Z ';
    }
    var fugaces = '';
    [[1180, 40, 0], [1100, 20, .9], [1210, 120, 1.7]].forEach(function (s, i) {
      fugaces += '<g class="fugaz" style="--w:-' + s[2] + 's"><path d="M' + s[0] + ' ' + s[1] + ' l90 -40" stroke="#fff6c8" stroke-width="5" stroke-linecap="round" opacity=".7"/>' +
        estrella4(s[0], s[1], 12, '#fff6c8', 'punta-fugaz', 0) + '</g>';
    });
    var marcasReloj = '';
    for (var m = 0; m < 12; m++) {
      var am = m / 12 * Math.PI * 2;
      marcasReloj += 'M' + f(1020 + Math.cos(am) * 48) + ' ' + f(330 + Math.sin(am) * 48) + ' L' + f(1020 + Math.cos(am) * (m % 3 ? 54 : 58)) + ' ' + f(330 + Math.sin(am) * (m % 3 ? 54 : 58)) + ' ';
    }
    var zetas = '';
    [0, 1, 2].forEach(function (i) {
      zetas += '<text class="zeta" style="--w:-' + (i * .8).toFixed(1) + 's" x="' + (1050 - i * 6) + '" y="' + (150 - i * 4) + '" font-family="Fredoka, \'Arial Rounded MT Bold\', sans-serif" font-weight="700" font-size="' + (22 + i * 6) + '" fill="#f6eec8" stroke="#161616" stroke-width="1.5" paint-order="stroke">z</text>';
    });

    el('capa capa-fondo', mundo).innerHTML = SVG +
      '<defs><radialGradient id="snHaloLuna"><stop offset=".3" stop-color="#fff6d0" stop-opacity=".45"/><stop offset="1" stop-color="#fff6d0" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="snHaloSol"><stop offset=".2" stop-color="#ffd36a" stop-opacity=".8"/><stop offset="1" stop-color="#ff9a4a" stop-opacity="0"/></radialGradient>' +
        '<clipPath id="snLuna"><path d="M1110 150 A50 50 0 1 0 1110 250 A24 50 0 1 1 1110 150Z"/></clipPath></defs>' +
      '<image class="tex-fondo" href="' + texFondo[0] + '" x="0" y="0" width="' + W + '" height="' + H + '" preserveAspectRatio="none"/>' +
      '<rect class="tinte-sol" x="-100" y="-100" width="1400" height="1000" fill="#ffa860"/>' +
      '<rect class="noche" x="-100" y="-100" width="1400" height="1000" fill="#070920"/>' +
      '<g class="estrellas">' + estrellas + '</g>' +
      '<g class="fugaces">' + fugaces + '</g>' +
      // la luna dormida (arriba, entre el menú y el título)
      '<g transform="translate(-20 -75)"><g class="luna"><circle class="halo-luna" cx="1085" cy="200" r="130" fill="url(#snHaloLuna)"/>' +
        '<g filter="url(#pastel)" clip-path="url(#snLuna)">' + imagen('luna', 1050, 140, 70, 120) + '</g>' +
        '<path d="M1110 150 A50 50 0 1 0 1110 250 A24 50 0 1 1 1110 150Z" fill="none" stroke="#161616" stroke-width="3.5" filter="url(#marcador)"/>' +
        '<path d="M1068 186 Q1074 192 1080 186" stroke="#161616" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
        '<path d="M1072 212 Q1078 218 1086 214" stroke="#161616" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
        '<circle cx="1068" cy="202" r="4" fill="#e88a9a" opacity=".6"/>' +
        '<g class="chorros-luna">' + chorrito(1072, 236, 7, 20, '#f6eec8', 2) + chorrito(1090, 244, 6, 14, '#f6eec8', 5) + '</g>' +
        zetas + '</g></g>' +
      // el sol (sale en "el brillo del sol")
      '<g transform="translate(-20 -75)"><g class="sol"><circle cx="1110" cy="200" r="230" fill="url(#snHaloSol)"/>' +
        '<g class="rayos"><path d="' + rayos + '" fill="#ffc34a" stroke="#161616" stroke-width="2.5" stroke-linejoin="round" filter="url(#marcador)"/></g>' +
        '<circle cx="1110" cy="200" r="70" fill="#ffd36a" stroke="#161616" stroke-width="4" filter="url(#pastel)"/>' +
        '<path d="M1086 196 Q1092 188 1098 196 M1122 196 Q1128 188 1134 196 M1094 216 Q1110 230 1126 216" stroke="#161616" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        '<circle cx="1082" cy="212" r="7" fill="#f08a5a" opacity=".6"/><circle cx="1138" cy="212" r="7" fill="#f08a5a" opacity=".6"/></g></g>' +
      // reloj de bolsillo que gira para atrás en "ruego al tiempo"
      '<g transform="translate(990 140) scale(.72) translate(-1020 -330)"><g class="reloj"><path d="M1020 262 L1020 248" stroke="#c9a24a" stroke-width="5"/><circle cx="1020" cy="242" r="8" fill="none" stroke="#c9a24a" stroke-width="4"/>' +
        '<circle cx="1020" cy="330" r="66" fill="#c9a24a" stroke="#161616" stroke-width="3.5" filter="url(#marcador)"/>' +
        '<circle cx="1020" cy="330" r="58" fill="#fbf4e0" stroke="#161616" stroke-width="2"/>' +
        '<path d="' + marcasReloj + '" stroke="#161616" stroke-width="3" stroke-linecap="round"/>' +
        '<g class="aguja-hora"><path d="M1020 330 L1020 298" stroke="#161616" stroke-width="5" stroke-linecap="round"/></g>' +
        '<g class="aguja-min"><path d="M1020 330 L1052 330" stroke="#c8332a" stroke-width="3.5" stroke-linecap="round"/></g>' +
        '<circle cx="1020" cy="330" r="5" fill="#161616"/></g></g>' +
      // nubes rosas
      nube(170, 690, 1.15, 1) + nube(1060, 700, 1.05, 2) + nube(620, 770, .8, 4) +
    '</svg>';

    // ---- capa 2: dos tendederos de lucecitas cruzan el cielo y de ellos cuelgan sus fotos ----
    function alturaCuerda(y0, x) { var t = (x + 20) / 1240; return y0 + 240 * t * (1 - t); }
    var cuerdas = '', focos = '';
    [170, 420].forEach(function (y0) {
      cuerdas += '<path d="M-20 ' + y0 + ' Q600 ' + (y0 + 120) + ' 1220 ' + y0 + '" fill="none" stroke="#161616" stroke-width="3.5" filter="url(#marcador)"/>';
      for (var x = 14; x < 1200; x += 46) {
        var y = alturaCuerda(y0, x) + 4;
        focos += '<g class="foco-luz" style="--w:-' + rnd(0, 2).toFixed(2) + 's"><circle cx="' + f(x) + '" cy="' + f(y + 7) + '" r="15" fill="url(#snFoco)"/>' +
          '<rect x="' + f(x - 2.5) + '" y="' + f(y - 2) + '" width="5" height="4" fill="#3a3448"/>' +
          '<ellipse cx="' + f(x) + '" cy="' + f(y + 7) + '" rx="4.5" ry="6.5" fill="' + pick(['#ffd36a', '#ff9ab8', '#bfe0ff', '#c8f0a0', '#ffb07a']) + '" stroke="#161616" stroke-width="1.2"/></g>';
      }
    });

    // cada foto: polaroid colgada con una pinza; ella con la misma cara en distintos momentos
    var FW = 150, FH = 182;
    // en pantallas verticales: dos columnas, fotos a este tamaño (ver css/sone.css)
    var MOVIL = [[525, 215], [675, 215], [525, 352], [675, 352], [525, 489], [675, 489], [525, 626], [675, 626]], ESC_MOVIL = .64;
    function ladrillos(px, py, pw, ph) {
      var d = '';
      for (var yb = py + 18; yb < py + ph; yb += 18) {
        d += 'M' + f(px) + ' ' + f(yb) + ' H' + f(px + pw) + ' ';
        for (var xb = px + ((yb - py) / 18 % 2 ? 0 : 16); xb < px + pw; xb += 32) d += 'M' + f(xb) + ' ' + f(yb - 18) + ' v18 ';
      }
      return '<path d="' + d + '" stroke="#cfcac0" stroke-width="1.5" fill="none"/>';
    }
    function puntitos(px, py, pw, ph, n, color, r) {
      var d = '';
      for (var i = 0; i < n; i++) d += '<circle cx="' + f(px + rnd(4, pw - 4)) + '" cy="' + f(py + rnd(4, ph * .6)) + '" r="' + f(rnd(r * .5, r)) + '" fill="' + color + '"/>';
      return d;
    }
    var FOTOS = [
      { pie: 'omg', x: 230, cuerda: 170, rot: -5, movil: 0,
        fondo: function (x, y, w, h) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#a8c4bc"/><rect x="' + x + '" y="' + y + '" width="46" height="34" fill="#3a4a3a"/><rect x="' + (x + w - 26) + '" y="' + y + '" width="26" height="60" fill="#e8c34a"/>'; },
        ella: { pelo: 'liso', ropa: 'negro', boca: 'beso', reflejo: '#5a8cff' } },
      { pie: 'tu cumple ♡', x: 500, cuerda: 170, rot: 0, movil: 1, zoom: true,
        fondo: function (x, y, w, h) {
          return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#ebe8e1"/>' + ladrillos(x, y, w, h) +
            '<g font-family="Fredoka, \'Arial Rounded MT Bold\', sans-serif" font-weight="700" font-size="17" stroke="#161616" stroke-width="1.4" paint-order="stroke">' +
            [['T', '#e8c34a'], ['H', '#3aa0d8'], ['D', '#e8506a'], ['A', '#8ac34a'], ['Y', '#e88a3a']].map(function (l, i) { return '<text x="' + (x + 6 + i * 12) + '" y="' + (y + 20 + (i % 2) * 2) + '" fill="' + l[1] + '">' + l[0] + '</text>'; }).join('') + '</g>' +
            '<path d="M' + (x + 24) + ' ' + (y + 66) + ' C' + (x + 26) + ' ' + (y + 90) + ' ' + (x + 20) + ' ' + (y + 110) + ' ' + (x + 24) + ' ' + (y + 140) + '" stroke="#5a5a5a" stroke-width="1" fill="none"/>' +
            globo(x + 24, y + 48, 13, '#e8642e', 'globo-foto', .3) + globo(x + 112, y + 40, 12, '#e8c34a', 'globo-foto', 1.1);
        },
        ella: { pelo: 'liso', ropa: 'vestido', boca: 'sonrisa', reflejo: '#ffffff', principal: true, inclina: -6 },
        extra: function (x, y, w, h) { return '<g filter="url(#marcador)">' + pastel(x + 26, y + h - 4, .42) + '</g>'; } },
      { pie: 'muak', x: 770, cuerda: 170, rot: 6, movil: 2, beso: true,
        fondo: function (x, y, w, h) {
          var c = '';
          for (var i = 0; i < 9; i++) c += '<path d="' + COR + '" transform="translate(' + f(x + rnd(8, w - 8)) + ' ' + f(y + rnd(8, h * .7)) + ') scale(.2)" fill="#f490b0"/>';
          return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#f8c8d8"/>' + c;
        },
        ella: { pelo: 'liso', ropa: 'blanco', boca: 'beso', reflejo: '#ffffff', inclina: 6 },
        extra: function (x, y, w, h, cx, fy) { return '<path d="' + COR + '" transform="translate(' + f(cx + 24) + ' ' + f(fy + 18) + ') scale(.24)" fill="#e8243f" stroke="#161616" stroke-width="5"/>'; } },
      { pie: 'para ti', x: 1040, cuerda: 170, rot: -4, movil: 3,
        fondo: function (x, y, w, h) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#f4d86a"/>' + puntitos(x, y, w, h, 14, '#fff6c8', 4); },
        ella: { pelo: 'liso', ropa: 'blanco', ojos: 'guino', boca: 'sonrisa', reflejo: '#ffffff', inclina: -8 },
        extra: function (x, y, w, h, cx, fy) {
          var g = '', fx = cx + 40, fy2 = fy + 46;
          for (var i = 0; i < 12; i++) g += '<ellipse cx="' + f(fx) + '" cy="' + f(fy2 - 13) + '" rx="4.5" ry="10" fill="#f6b830" stroke="#161616" stroke-width="1.2" transform="rotate(' + (i * 30) + ' ' + f(fx) + ' ' + f(fy2) + ')"/>';
          return '<path d="M' + f(fx) + ' ' + f(fy2) + ' L' + f(fx - 6) + ' ' + f(y + h) + '" stroke="#3a8a4a" stroke-width="4"/>' + g +
            '<circle cx="' + f(fx) + '" cy="' + f(fy2) + '" r="8" fill="#6a3a1a" stroke="#161616" stroke-width="1.5"/>';
        } },
      { pie: 'jajaja', x: 160, cuerda: 420, rot: 5, movil: 4,
        fondo: function (x, y, w, h) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#2a2f6a"/>' + puntitos(x, y, w, h, 18, '#fff6c8', 2.2); },
        ella: { pelo: 'liso', ropa: 'negro', ojos: 'cerrados', boca: 'risa', reflejo: '#ffffff', inclina: 7 } },
      { pie: '♡', x: 430, cuerda: 420, rot: -6, movil: 5,
        fondo: function (x, y, w, h) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#b8cce0"/><path d="M' + x + ' ' + (y + 16) + ' h' + w + ' v8 h-' + w + 'Z M' + x + ' ' + (y + 34) + ' h' + w + ' v6 h-' + w + 'Z" fill="#e8d86a"/>'; },
        ella: { pelo: 'rizado', ropa: 'rosa', mano: true, boca: 'beso', reflejo: '#b05aff' } },
      { pie: 'el mar', x: 700, cuerda: 420, rot: 4, movil: 6,
        fondo: function (x, y, w, h) {
          return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#9ad0f0"/>' +
            '<circle cx="' + (x + w - 22) + '" cy="' + (y + 22) + '" r="13" fill="#ffd36a" stroke="#161616" stroke-width="1.5"/>' +
            '<rect x="' + x + '" y="' + (y + h * .5) + '" width="' + w + '" height="' + (h * .5) + '" fill="#3a7ac8"/>' +
            '<path d="M' + x + ' ' + (y + h * .5 + 8) + ' q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="#e8f4ff" stroke-width="2" fill="none"/>';
        },
        ella: { pelo: 'liso', ropa: 'amarillo', boca: 'sonrisa', reflejo: '#ffffff', inclina: 4 } },
      { pie: 'te soñé', x: 970, cuerda: 420, rot: -5, movil: 7,
        fondo: function (x, y, w, h) {
          return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#3a2f6a"/>' + puntitos(x, y, w, h, 14, '#fff6c8', 2) +
            '<path d="M' + (x + 26) + ' ' + (y + 10) + ' A14 14 0 1 0 ' + (x + 26) + ' ' + (y + 38) + ' A8 14 0 1 1 ' + (x + 26) + ' ' + (y + 10) + 'Z" fill="#f6eec8" stroke="#161616" stroke-width="1.5"/>';
        },
        ella: { pelo: 'liso', ropa: 'lila', ojos: 'cerrados', boca: 'sonrisa', reflejo: '#ffffff', inclina: -10 },
        extra: function (x, y, w, h, cx, fy) { return '<text x="' + f(cx + 34) + '" y="' + f(fy - 34) + '" font-family="Fredoka, \'Arial Rounded MT Bold\', sans-serif" font-weight="700" font-size="16" fill="#f6eec8" stroke="#161616" stroke-width="1.2" paint-order="stroke">z z</text>'; } }
    ];
    function foto(d, i) {
      var pinY = alturaCuerda(d.cuerda, d.x), top = pinY + 4, x0 = d.x - FW / 2;
      var px = x0 + 9, py = top + 9, pw = FW - 18, ph = FH - 46;
      var cx = d.x, cy = top + FH / 2, fy = py + ph * .36, m = MOVIL[d.movil];
      d.cara = [cx, fy]; d.centro = [cx, cy]; d.mov = [m[0] - cx, m[1] - cy];
      var chorros = '';
      for (var c = 0; c < 5; c++) chorros += chorrito(x0 + 12 + c * 30 + rnd(-4, 4), top + FH - 2, 12, rnd(14, 34), '#f6f3ec', c + i);
      var ella = {}; for (var k in d.ella) ella[k] = d.ella[k];
      ella.id = 'f' + i; ella.x = f(cx); ella.y = f(fy); ella.s = .82;
      var contenido = '<g transform="rotate(' + d.rot + ' ' + f(cx) + ' ' + f(pinY) + ')">' +
        marcoPolaroid(x0, top, FW, FH, 37) +
        '<clipPath id="snF' + i + '"><rect x="' + f(px) + '" y="' + f(py) + '" width="' + pw + '" height="' + ph + '"/></clipPath>' +
        '<g clip-path="url(#snF' + i + ')">' + d.fondo(px, py, pw, ph) + chica(ella) + (d.extra ? d.extra(px, py, pw, ph, cx, fy) : '') + '</g>' +
        '<rect x="' + f(px) + '" y="' + f(py) + '" width="' + pw + '" height="' + ph + '" fill="none" stroke="#161616" stroke-width="2"/>' +
        '<text x="' + f(cx) + '" y="' + f(top + FH - 13) + '" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="21" fill="#3a3a6a">' + d.pie + '</text>' +
        '<g class="chorritos-foto">' + chorros + '</g>' +
        corazon(cx - 44, top + 34, .3, i) + corazon(cx + 46, top + 22, .25, i + 1) +
        '</g>' +
        // pinza de madera
        '<rect x="' + f(cx - 5) + '" y="' + f(pinY - 11) + '" width="10" height="27" rx="2" fill="#d8b07a" stroke="#161616" stroke-width="1.6"/>' +
        '<path d="M' + f(cx) + ' ' + f(pinY - 9) + ' v23" stroke="#8a6a4a" stroke-width="1.2"/>';
      var g = '<g class="colgada" style="--w:-' + (i * .45).toFixed(2) + 's;transform-origin:' + f(cx) + 'px ' + f(pinY) + 'px">' + contenido + '</g>';
      if (d.zoom) {
        g = '<g class="zoom" style="transform-origin:' + f(cx) + 'px ' + f(fy) + 'px;--zxd:' + f(600 - cx) + 'px;--zyd:' + f(400 - fy) + 'px;' +
          '--zxm:' + f((600 - d.mov[0] - cx) / ESC_MOVIL) + 'px;--zym:' + f((400 - d.mov[1] - cy) / ESC_MOVIL + cy - fy) + 'px">' + g + '</g>';
      }
      return '<g class="foto-pos' + (d.zoom ? ' principal' : '') + '" style="--d:' + (d.movil * .12).toFixed(2) + 's;transform-origin:' + f(cx) + 'px ' + f(cy) + 'px;--mx:' + f(d.mov[0]) + 'px;--my:' + f(d.mov[1]) + 'px">' + g + '</g>';
    }
    var fotos = '', fotoZoom = '';
    FOTOS.forEach(function (d, i) { if (d.zoom) fotoZoom = foto(d, i); else fotos += foto(d, i); });
    // los globos amarrados a la punta del tendedero de abajo (se van volando en "perder")
    var globosEsquina = '';
    [[60, 300, 22, '#e8642e'], [100, 330, 20, '#e8c34a'], [66, 366, 19, '#e8506a'], [112, 288, 18, '#f4a0c0'], [126, 372, 19, '#8a6ad8']].forEach(function (g, i) {
      globosEsquina += '<path d="M' + g[0] + ' ' + f(g[1] + g[2] * 1.18 + 5) + ' C' + (g[0] + 6) + ' ' + (g[1] + 60) + ' 46 420 40 444" stroke="#f6f3ec" stroke-width="1.6" fill="none"/>' +
        globo(g[0], g[1], g[2], g[3], 'globo-esquina', (i * .6).toFixed(1));
    });

    el('capa capa-pared', mundo).innerHTML = SVG +
      '<defs><radialGradient id="snFoco"><stop offset="0" stop-color="#fff2b0" stop-opacity=".8"/><stop offset="1" stop-color="#ffd36a" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="snHalo"><stop offset=".3" stop-color="#fff0ff" stop-opacity=".45"/><stop offset="1" stop-color="#d8a8ff" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="snCalor"><stop offset=".2" stop-color="#ffd36a" stop-opacity=".4"/><stop offset="1" stop-color="#ff9a4a" stop-opacity="0"/></radialGradient>' +
        '<clipPath id="snCor"><path d="' + COR + '"/></clipPath></defs>' +
      '<ellipse class="halo-sueno" cx="600" cy="430" rx="640" ry="460" fill="url(#snHalo)"/>' +
      '<ellipse class="calor" cx="600" cy="430" rx="640" ry="460" fill="url(#snCalor)"/>' +
      '<g class="globos"><g filter="url(#marcador)">' + globosEsquina + '</g></g>' +
      '<g class="cuerdas">' + cuerdas + '</g>' +
      '<g class="focos">' + focos + '</g>' +
      fotos + fotoZoom +
    '</svg>';

    // ---- capa 4: el frente (beso, viento, mar, polvo de estrellas, corazones, título) ----
    var remolinos = '';
    ['M-60 300 C120 250 240 340 380 300 S560 220 640 270 C700 310 660 360 620 330',
      'M1260 200 C1080 160 980 260 840 220 S700 140 650 190 C610 230 650 270 690 250',
      'M-60 560 C140 520 260 600 420 560 S640 480 760 540 C820 570 800 620 760 600',
      'M1260 480 C1100 450 1000 520 880 490 S760 420 700 460',
      'M100 100 C240 60 320 140 460 110 S620 40 700 80'].forEach(function (d, i) {
      remolinos += '<path class="remolino" pathLength="1" style="--w:-' + (i * .35).toFixed(2) + 's" d="' + d + '" fill="none" stroke="#e8f0ff" stroke-width="' + (i % 2 ? 5 : 7) + '" stroke-linecap="round"/>';
    });
    var mares = '';
    ['#2a3a8a', '#3a5ab8', '#6a8ad8'].forEach(function (col, i) {
      var y0 = 680 + i * 42, d = 'M-60 ' + y0 + ' Q-10 ' + (y0 - 26) + ' 40 ' + y0;
      for (var x = 140; x <= 1360; x += 100) d += ' T' + x + ' ' + y0;
      mares += '<g class="ola" style="--w:-' + (i * .7).toFixed(1) + 's"><path d="' + d + ' L1360 840 L-60 840Z" fill="' + col + '" opacity=".92" stroke="#e8f0ff" stroke-width="4"/></g>';
    });
    var polvo = '';
    for (var p = 0; p < 34; p++) {
      var ang = rnd(0, Math.PI * 2), rad = rnd(240, 420);
      polvo += estrella4(710 + Math.cos(ang) * rad * .9, 395 + Math.sin(ang) * rad, rnd(5, 11), pick(['#fff6c8', '#ffffff', '#f8d0ff', '#c8e0ff']), 'polvo', rnd(0, 2).toFixed(2));
    }
    var corazones = '';
    [[480, 420, .5], [600, 330, .42], [820, 300, .55], [930, 420, .42], [430, 600, .38], [980, 600, .45], [700, 220, .35], [560, 640, .4]].forEach(function (b, i) {
      corazones += corazon(b[0], b[1], b[2], i + 3);
    });

    el('capa capa-frente', mundo).innerHTML = SVG +
      '<defs><clipPath id="snCor2"><path d="' + COR + '"/></clipPath></defs>' +
      '<rect class="pausa" x="-100" y="-100" width="1400" height="1000" fill="#f6e2c8"/>' +
      '<g class="remolinos" filter="url(#marcador)">' + remolinos + '</g>' +
      '<g class="mares" filter="url(#pastel)">' + mares + '</g>' +
      '<g class="polvos">' + polvo + '</g>' +
      '<g class="corazones">' + corazones.replace(/snCor\)/g, 'snCor2)') + '</g>' +
      // el beso que sale de sus labios cuando el mundo se detiene
      (function () {
        var d = FOTOS[2], lx = d.cara[0], ly = d.cara[1] + 28 * .82;
        var mx = d.centro[0] + ESC_MOVIL * (lx - d.centro[0]) + d.mov[0], my = d.centro[1] + ESC_MOVIL * (ly - d.centro[1]) + d.mov[1];
        return '<g class="beso-vuela" style="--sxd:' + f(lx) + 'px;--syd:' + f(ly) + 'px;--sxm:' + f(mx) + 'px;--sym:' + f(my) + 'px">';
      })() +
        '<path d="M-30 0 C-22 -10 -12 -15 -5 -11 C-2 -9 2 -9 5 -11 C12 -15 22 -10 30 0 C20 18 -20 18 -30 0Z" fill="#c4304a" stroke="#161616" stroke-width="3"/>' +
        '<path d="M-30 0 C-12 4 12 4 30 0" stroke="#161616" stroke-width="2.5" fill="none"/>' +
        '<path d="M-16 -6 C-12 -9 -8 -9 -6 -7" stroke="#ffb0c0" stroke-width="2.5" fill="none"/></g>' +
      // título pintado arriba a la derecha
      '<g class="firma">' +
        '<text x="760" y="176" font-family="Caveat, cursive" font-weight="700" font-size="22" fill="#f3c15a" transform="rotate(-4 760 176)" filter="url(#marcador)">Zoé · unplugged</text>' +
        '<g class="titulo" filter="url(#pastel)" fill="#f8e8ff" stroke="#161616" stroke-width="2.5" paint-order="stroke" font-family="Fredoka, \'Arial Rounded MT Bold\', sans-serif" font-weight="700">' +
          letra('S', 580, 184, 62, -6, 0) + letra('o', 622, 178, 48, 4, 1) + letra('ñ', 658, 184, 54, -3, 2) + letra('é', 698, 178, 52, 5, 3) +
        '</g>' +
        estrella4(560, 140, 11, '#fff6c8', 'estrella', .5) + estrella4(748, 140, 7, '#f8d0ff', 'estrella', 1.2) +
      '</g>' +
    '</svg>';

    for (var q = 0; q < CUADROS; q++) {
      var cv = document.createElement('canvas');
      cv.className = 'marco';
      escena.appendChild(cv);
      lienzosMarco.push(cv);
    }
    pintarMarco();
    var tRes;
    window.addEventListener('resize', function () { clearTimeout(tRes); tRes = setTimeout(pintarMarco, 200); });

    // parallax 3D; sus ojos siguen al mouse / dedo
    function mover(x, y) {
      mundo.style.setProperty('--ry', ((x - .5) * 14) + 'deg');
      mundo.style.setProperty('--rx', ((.5 - y) * 9) + 'deg');
      escena.style.setProperty('--px', ((x - .5) * 2).toFixed(2));
      escena.style.setProperty('--py', ((y - .5) * 2).toFixed(2));
    }
    window.addEventListener('mousemove', function (e) { if (activa) mover(e.clientX / innerWidth, e.clientY / innerHeight); });
    window.addEventListener('touchmove', function (e) { if (activa) { var t = e.touches[0]; mover(t.clientX / innerWidth, t.clientY / innerHeight); } }, { passive: true });
  }

  // ---- "hervor" (se detiene cuando "mi mundo se paraba entre tus labios") ----
  function hervir() {
    if (escena.classList.contains('en-labios')) return;
    cuadro = (cuadro + 1) % CUADROS;
    lienzosMarco.forEach(function (cv, i) { cv.style.opacity = i === cuadro ? 1 : 0; });
    escena.querySelectorAll('.tex-fondo').forEach(function (im) { im.setAttribute('href', texFondo[cuadro]); });
    Object.keys(tex).forEach(function (k) {
      escena.querySelectorAll('.tex-' + k).forEach(function (im, i) { im.setAttribute('href', tex[k][(cuadro + i) % CUADROS]); });
    });
  }

  // ---- la escena reacciona a lo que dice la línea que suena ----
  var lineas = [];
  (window.LETRA_SONE_LRC || '').split(/\r?\n/).forEach(function (l) {
    var m = l.match(/^\s*\[(\d+):(\d+(?:\.\d+)?)\](.*)$/);
    if (m) lineas.push({ t: +m[1] * 60 + +m[2], texto: m[3].trim().toLowerCase() });
  });
  var ultima = null;
  function reaccionar() {
    if (!activa) return;
    var t = audio.currentTime, texto = '';
    for (var i = 0; i < lineas.length; i++) { if (lineas[i].t <= t) texto = lineas[i].texto; else break; }
    if (texto === ultima) return;
    ultima = texto;
    escena.classList.toggle('en-tiempo', /ruego al tiempo/.test(texto));
    escena.classList.toggle('en-labios', /labios/.test(texto));
    escena.classList.toggle('en-derretir', /derretir/.test(texto));
    escena.classList.toggle('en-ojos', /ojos|mirada/.test(texto));
    escena.classList.toggle('en-aire', /aire|respires/.test(texto));
    escena.classList.toggle('en-perder', /perder/.test(texto));
    escena.classList.toggle('en-pensando', /pensando/.test(texto));
    escena.classList.toggle('en-sol', /el sol/.test(texto));
    escena.classList.toggle('en-cielo', /cielo/.test(texto));
    escena.classList.toggle('en-mar', /del mar/.test(texto));
    escena.classList.toggle('en-sone', /soñ[eé]/.test(texto));
    escena.classList.toggle('en-final', /vez mas$/.test(texto));
  }
  function limpiar() { ESTADOS.forEach(function (c) { escena.classList.remove(c); }); ultima = null; }
  audio.addEventListener('timeupdate', reaccionar);
  audio.addEventListener('ended', limpiar);

  window.Escenas = window.Escenas || {};
  window.Escenas.sone = {
    el: escena,
    activar: function () {
      if (!construida) construir();
      activa = true;
      limpiar();
      clearInterval(timer);
      timer = setInterval(hervir, C.FPS_DIBUJO);
      hervir();
      // las líneas de marcador se dibujan solas y la foto se revela
      escena.classList.remove('dibujando');
      void escena.offsetWidth;
      escena.classList.add('dibujando');
    },
    desactivar: function () { activa = false; clearInterval(timer); }
  };
})();
