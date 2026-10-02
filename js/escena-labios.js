// Escena "Labios rotos" (Zoé): el florero bajo la lámpara de atardecer, redibujado con el estilo
// del álbum (pastel al óleo + marcador negro, 3 cuadros que "hierven", movimientos a saltitos).
// Muro oscuro con el círculo de luz roja, las sombras gigantes de las flores proyectadas en la pared
// (dos flores arriba, una grande a la izquierda, helechos y la sombra del florero), y al frente el
// florero blanco con el ramo de flores rosas, tallos y hojitas. La luz sigue al mouse / dedo y las
// sombras se mueven al revés, como si moviera la lámpara.
// La escena reacciona a lo que dice cada línea de la letra:
//   "corazón"             → un corazón grande late dentro de la luz
//   "lugar"               → el círculo de luz se abre más
//   "flores"              → brotan flores nuevas en el ramo
//   "amor"                → suben corazoncitos desde las flores
//   "labios rotos"        → aparecen unos labios partidos en la luz
//   "besar"               → besitos por toda la pared
//   "curar / cuidar"      → la grieta se cierra y le ponen una curita
//   "raro"                → la luz cambia de color y las sombras bailan solas
//   "aparece"             → llueven pétalos
//   "distancia / tiempo"  → la luz cruza como el sol y las sombras se van con ella
//   "desierto"            → llueve sobre el ramo
//   "mirar / voz"         → las flores abren los ojos y cantan
//   "mano"                → dos manos de sombra se toman en la pared
//   "eternidad"           → se dibuja un infinito con estrellitas
//   "ah-ah-ah"            → el ramo se mece y la luz respira
// Usa las herramientas de crayón de js/escena.js (window.Crayon); se construye la primera vez
// que se elige en el menú de canciones (js/menu.js).
(function () {
  var escena = document.getElementById('escena-labios');
  var audio = document.getElementById('bg-music');
  var C = window.Crayon;
  if (!escena || !audio || !C) return;
  var el = C.el, rnd = C.rnd, pick = C.pick, rayado = C.rayado, trazar = C.trazar, grano = C.grano;
  var CUADROS = C.CUADROS;
  var W = 1200, H = 800;
  var SVG = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;overflow:visible">';
  var L = 'class="linea" pathLength="1" fill="none" stroke="#161616" stroke-linecap="round" stroke-linejoin="round"';
  var K = 'stroke="#161616" stroke-linecap="round" stroke-linejoin="round"';
  var SOMBRA = '#1c0a0f';
  var ESTADOS = ['en-corazon', 'en-lugar', 'en-flores', 'en-amor', 'en-labios', 'en-besar', 'en-curar', 'en-raro',
    'en-aparece', 'en-tiempo', 'en-lluvia', 'en-mirar', 'en-manos', 'en-eternidad', 'en-ah'];

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

  // ---- el muro oscuro (la luz roja va aparte para poder moverla) ----
  function pintarMuro() {
    var lista = [];
    zona(lista, 170, -40, W + 40, -40, H + 40, ['#1a1214', '#241a1e', '#160f12', '#2e2226', '#3a2228'], { len: [80, 260], ancho: [8, 14], alfa: [.6, .9] });
    // la mesa donde está el florero
    zona(lista, 40, 560, W + 40, 760, H + 20, ['#2a2226', '#3a3034', '#1e181a'], { ang: [-.1, .1], len: [120, 300], ancho: [8, 12], alfa: [.6, .85] });
    var urls = [];
    for (var q = 0; q < CUADROS; q++) {
      var cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      var cx = cv.getContext('2d');
      cx.fillStyle = '#170f12'; cx.fillRect(0, 0, W, H);
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

  // flor de sombra: cabezota con orilla de olanes
  function cabezaSombra(cx, cy, r) {
    var n = 9, d = '';
    for (var i = 0; i <= n; i++) {
      var a = i / n * Math.PI * 2, a2 = (i + .5) / n * Math.PI * 2, rr = r * rnd(.85, 1.08), rm = r * rnd(1.02, 1.2);
      var x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * .86;
      if (!i) { d = 'M' + f(x) + ' ' + f(y); continue; }
      var ax = cx + Math.cos(a2 - Math.PI * 2 / n) * rm, ay = cy + Math.sin(a2 - Math.PI * 2 / n) * rm * .86;
      d += ' Q' + f(ax) + ' ' + f(ay) + ' ' + f(x) + ' ' + f(y);
    }
    return '<path d="' + d + 'Z" fill="' + SOMBRA + '"/>';
  }
  // ramita de helecho: tallo con hojitas alternadas
  function helecho(x, y, ang, len, color, ancho) {
    var d = 'M0 0 L' + len + ' 0', hojas = '';
    for (var i = 1; i < 8; i++) {
      var px = len * i / 8, l = (1 - i / 9) * len * .3 + 8, s = i % 2 ? -1 : 1;
      hojas += 'M' + f(px) + ' 0 C' + f(px + l * .4) + ' ' + f(s * l * .5) + ' ' + f(px + l * .9) + ' ' + f(s * l * .5) + ' ' + f(px + l) + ' ' + f(s * l * .35) +
        ' C' + f(px + l * .6) + ' ' + f(s * l * .1) + ' ' + f(px + l * .3) + ' 0 ' + f(px) + ' 0Z ';
    }
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + ang + ')"><path d="' + d + '" stroke="' + color + '" stroke-width="' + ancho + '" stroke-linecap="round" fill="none"/>' +
      '<path d="' + hojas + '" fill="' + color + '"/></g>';
  }
  // mano de sombra abierta (la izquierda; la derecha es su espejo): antebrazo, palma y dedos en abanico
  function manoSombra() {
    var px = 200, py = 440, a0 = -20 * Math.PI / 180, d = '';
    function rayo(grados, desde, largo) {
      var a = a0 + grados * Math.PI / 180, x0 = px + Math.cos(a) * desde, y0 = py + Math.sin(a) * desde;
      d += 'M' + f(x0) + ' ' + f(y0) + ' L' + f(x0 + Math.cos(a) * largo) + ' ' + f(y0 + Math.sin(a) * largo) + ' ';
    }
    rayo(-30, 30, 58); rayo(-10, 32, 70); rayo(10, 32, 66); rayo(28, 30, 52); rayo(-78, 26, 48);
    return '<path d="M-40 560 C40 520 110 480 ' + (px - 20) + ' ' + (py + 8) + '" stroke="' + SOMBRA + '" stroke-width="54" stroke-linecap="round" fill="none"/>' +
      '<ellipse cx="' + px + '" cy="' + py + '" rx="46" ry="40" transform="rotate(-20 ' + px + ' ' + py + ')" fill="' + SOMBRA + '"/>' +
      '<path d="' + d + '" stroke="' + SOMBRA + '" stroke-width="19" stroke-linecap="round"/>';
  }
  // hoja del ramo
  function hoja(x, y, ang, len) {
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + ang + ')">' +
      '<path d="M0 0 C' + f(len * .3) + ' ' + f(-len * .22) + ' ' + f(len * .7) + ' ' + f(-len * .18) + ' ' + len + ' 0 C' + f(len * .7) + ' ' + f(len * .18) + ' ' + f(len * .3) + ' ' + f(len * .22) + ' 0 0Z" fill="#3a1418" ' + K + ' stroke-width="2.5"/>' +
      '<path d="M2 0 L' + f(len * .85) + ' 0" stroke="#8a2a34" stroke-width="1.6"/></g>';
  }
  // flor del ramo: pétalos rosas de afuera, pétalos encendidos adentro y botón oscuro
  function petalo(r, a, col, sw) {
    return '<path transform="rotate(' + f(a) + ')" d="M0 0 C' + f(-r * .78) + ' ' + f(-r * .25) + ' ' + f(-r * .72) + ' ' + f(-r * 1.05) + ' 0 ' + f(-r) +
      ' C' + f(r * .72) + ' ' + f(-r * 1.05) + ' ' + f(r * .78) + ' ' + f(-r * .25) + ' 0 0Z" fill="' + col + '" ' + K + ' stroke-width="' + sw + '"/>';
  }
  function flor(x, y, r, i, o) {
    o = o || {};
    var afuera = o.oscura ? ['#a8182e', '#c8243a', '#b81e34'] : ['#f8c8cc', '#f4b0b8', '#ffd6d8', '#f6bcc2'];
    var adentro = o.oscura ? ['#7a0c1c', '#8a1224'] : ['#e8707e', '#f08a96', '#e05a6a'];
    var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ')"><g class="' + (o.clase || 'flor') + '" style="--w:-' + (i * .37).toFixed(2) + 's">';
    var a0 = rnd(0, 60);
    for (var p = 0; p < 7; p++) s += petalo(r * rnd(.9, 1.05), a0 + p * 51.4, pick(afuera), 2.5);
    for (p = 0; p < 5; p++) s += petalo(r * .62, a0 + 25 + p * 72, pick(adentro), 2);
    s += '<path d="M' + f(-r * .55) + ' ' + f(-r * .55) + ' C' + f(-r * .3) + ' ' + f(-r * .75) + ' ' + f(r * .1) + ' ' + f(-r * .78) + ' ' + f(r * .3) + ' ' + f(-r * .7) + '" stroke="#fff0f0" stroke-width="' + f(r * .08) + '" fill="none" opacity=".7"/>' +
      '<circle r="' + f(r * .22) + '" fill="' + (o.oscura ? '#3a0610' : '#5a1420') + '" ' + K + ' stroke-width="2"/>' +
      '<circle cx="' + f(-r * .08) + '" cy="' + f(-r * .06) + '" r="' + f(r * .05) + '" fill="#f3c15a"/><circle cx="' + f(r * .08) + '" cy="' + f(r * .04) + '" r="' + f(r * .05) + '" fill="#f3c15a"/>';
    if (o.cara) {
      // ojitos y boquita que salen con "mirar" y "voz"
      s += '<g class="cara-flor"><g class="parpado-flor">' +
        '<ellipse cx="' + f(-r * .4) + '" cy="' + f(-r * .2) + '" rx="' + f(r * .15) + '" ry="' + f(r * .19) + '" fill="#fff" stroke="#161616" stroke-width="2"/>' +
        '<ellipse cx="' + f(r * .4) + '" cy="' + f(-r * .2) + '" rx="' + f(r * .15) + '" ry="' + f(r * .19) + '" fill="#fff" stroke="#161616" stroke-width="2"/>' +
        '<g class="pup"><circle cx="' + f(-r * .38) + '" cy="' + f(-r * .16) + '" r="' + f(r * .08) + '" fill="#161616"/><circle cx="' + f(r * .42) + '" cy="' + f(-r * .16) + '" r="' + f(r * .08) + '" fill="#161616"/></g></g>' +
        '<ellipse class="boca-flor" cx="0" cy="' + f(r * .42) + '" rx="' + f(r * .13) + '" ry="' + f(r * .1) + '" fill="#3a0610" stroke="#161616" stroke-width="2"/>' +
        '<circle cx="' + f(-r * .62) + '" cy="' + f(r * .16) + '" r="' + f(r * .1) + '" fill="#e8243f" opacity=".5"/><circle cx="' + f(r * .62) + '" cy="' + f(r * .16) + '" r="' + f(r * .1) + '" fill="#e8243f" opacity=".5"/></g>';
    }
    return s + '</g></g>';
  }
  var COR = 'M0 30 C-30 12 -40 -8 -32 -20 C-24 -32 -8 -30 0 -16 C8 -30 24 -32 32 -20 C40 -8 30 12 0 30Z';
  function corazon(x, y, s, i) {
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><g class="corazoncito" style="--w:-' + (i * .3).toFixed(2) + 's;--x:' + rnd(-50, 50).toFixed(0) + 'px">' +
      '<g filter="url(#pastel)" clip-path="url(#lrCor)"><image class="tex-rosa" href="' + tex.rosa[i % CUADROS] + '" x="-42" y="-36" width="84" height="70" preserveAspectRatio="none"/></g>' +
      '<path d="' + COR + '" fill="none" stroke="#161616" stroke-width="7" filter="url(#marcador)"/></g></g>';
  }
  // labios: labio de arriba con su arco de cupido y labio de abajo
  var LAB_ARRIBA = 'M-130 0 C-100 -30 -62 -62 -26 -48 C-12 -42 -6 -30 0 -32 C6 -30 12 -42 26 -48 C62 -62 100 -30 130 0 C60 10 -60 10 -130 0Z';
  var LAB_ABAJO = 'M-130 0 C-60 12 60 12 130 0 C100 50 52 76 0 76 C-52 76 -100 50 -130 0Z';
  var BESITO = 'M-30 0 C-22 -10 -12 -15 -5 -11 C-2 -9 2 -9 5 -11 C12 -15 22 -10 30 0 C20 18 -20 18 -30 0Z M-30 0 C-12 4 12 4 30 0';

  function construir() {
    construida = true;
    texFondo = pintarMuro();
    tex.luz = texSet('#e8243f', ['#f0304a', '#d81e3a', '#ff4a5e', '#c41632', '#f25a6a', '#ff6a72'], 60);
    tex.florero = texSet('#f2a8b0', ['#ffc8cc', '#e88a94', '#ffd8da', '#d86a78', '#fff0f0'], 40);
    tex.labios = texSet('#f27a8e', ['#ff96a6', '#e05a70', '#ffb0bc', '#c8405a', '#ffd0d8'], 45);
    tex.rosa = texSet('#ffc0c8', ['#ffd8dc', '#f4a0ac', '#fff0f2', '#e88a98'], 40);

    mundo = el('mundo', escena);

    // ---- capa 1: el muro, el círculo de luz roja y las sombras de las flores ----
    var sombras = '';
    // la sombra del florero
    sombras += '<path d="M330 812 C318 760 330 716 372 694 C366 680 368 664 380 656 L470 652 C482 662 484 678 476 690 C516 712 528 760 516 812Z" fill="' + SOMBRA + '"/>';
    // tallos de sombra que salen del florero
    var tallos = '';
    [[462, 150], [585, 145], [385, 420], [330, 600], [520, 300], [300, 280], [640, 230]].forEach(function (p) {
      tallos += 'M' + f(424 + rnd(-8, 8)) + ' 664 Q' + f((424 + p[0]) / 2 + rnd(-30, 30)) + ' ' + f((664 + p[1]) / 2) + ' ' + p[0] + ' ' + p[1] + ' ';
    });
    sombras += '<path d="' + tallos + '" stroke="' + SOMBRA + '" stroke-width="7" fill="none" stroke-linecap="round"/>';
    var cabezas = [[462, 150, 74], [585, 145, 76], [385, 420, 88], [330, 600, 56]];
    cabezas.forEach(function (c, i) {
      sombras += '<g class="sombra" style="--w:-' + (i * .6).toFixed(1) + 's">' + cabezaSombra(c[0], c[1], c[2]) + '</g>';
    });
    sombras += '<g class="sombra" style="--w:-.9s">' + helecho(300, 300, -150, 190, SOMBRA, 6) + helecho(330, 360, 170, 150, SOMBRA, 5) + '</g>' +
      '<g class="sombra" style="--w:-1.5s">' + helecho(560, 300, -60, 170, SOMBRA, 5) + helecho(640, 240, -30, 120, SOMBRA, 5) + '</g>' +
      '<g class="sombra" style="--w:-.3s">' + helecho(280, 520, 150, 140, SOMBRA, 5) + helecho(500, 470, -20, 130, SOMBRA, 5) + '</g>';
    // manos de sombra que se toman en "con tu mano en mi mano": suben en diagonal y se entrelazan los dedos
    sombras += '<g class="mano mano-izq">' + manoSombra() + '</g><g class="mano mano-der"><g transform="translate(590 0) scale(-1 1)">' + manoSombra() + '</g></g>';

    el('capa capa-fondo', mundo).innerHTML = SVG +
      '<defs>' +
        '<radialGradient id="lrGradSol"><stop offset=".7" stop-color="#fff"/><stop offset=".93" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
        '<mask id="lrMascara"><circle cx="520" cy="370" r="470" fill="url(#lrGradSol)"/></mask>' +
        '<radialGradient id="lrBrillo"><stop offset="0" stop-color="#ff8a8a" stop-opacity=".5"/><stop offset=".6" stop-color="#ff5a6a" stop-opacity=".12"/><stop offset="1" stop-color="#ff5a6a" stop-opacity="0"/></radialGradient>' +
      '</defs>' +
      '<image class="tex-fondo" href="' + texFondo[0] + '" x="0" y="0" width="' + W + '" height="' + H + '" preserveAspectRatio="none"/>' +
      '<g class="sol-mouse"><g class="sol-tiempo"><g class="sol">' +
        '<g mask="url(#lrMascara)"><g filter="url(#pastel)">' + imagen('luz', 40, -110, 960, 960) + '</g>' +
          '<circle class="tinte-raro" cx="520" cy="370" r="470"/>' +
          '<circle cx="470" cy="300" r="300" fill="url(#lrBrillo)"/></g>' +
        '<circle class="aro" cx="520" cy="370" r="448" fill="none" stroke="#ff8a96" stroke-width="5" stroke-dasharray="60 40 120 50" opacity=".35" filter="url(#marcador)"/>' +
      '</g></g></g>' +
      '<g class="sombras-mouse"><g class="sombras-tiempo"><g transform="translate(0 -60)" filter="url(#pastel)" opacity=".86">' + sombras + '</g></g></g>' +
    '</svg>';

    // ---- capa 2: la mesa, el florero y el ramo ----
    var ramo = '', tallosRamo = '', brotes = '';
    var FLORES = [[675, 333, 58, { cara: true }], [794, 430, 48, { cara: true }], [450, 504, 44, { cara: true }], [519, 511, 40], [581, 474, 42],
      [437, 592, 36, { oscura: true }], [640, 420, 32], [880, 560, 30, { oscura: true }]];
    FLORES.forEach(function (fl) {
      var vx = 700 + rnd(-14, 14);
      tallosRamo += 'M' + f(vx) + ' 704 Q' + f((vx + fl[0]) / 2 + rnd(-40, 40)) + ' ' + f((704 + fl[1]) / 2) + ' ' + fl[0] + ' ' + f(fl[1] + fl[2] * .5) + ' ';
    });
    var hojas = hoja(700, 640, -150, 90) + hoja(712, 620, -40, 80) + hoja(660, 560, -170, 70) + hoja(760, 520, -20, 74) + hoja(600, 560, -120, 64) +
      hoja(740, 600, 10, 70) + hoja(540, 560, 160, 60) + hoja(820, 480, -60, 56) + hoja(690, 440, -100, 54);
    var helechos = helecho(690, 650, -160, 220, '#2a1014', 4) + helecho(720, 640, -20, 210, '#2a1014', 4) + helecho(680, 600, -125, 170, '#2a1014', 3.5) +
      helecho(730, 580, -55, 180, '#2a1014', 3.5);
    FLORES.forEach(function (fl, i) { ramo += flor(fl[0], fl[1], fl[2], i, fl[3]); });
    // flores que brotan con "donde nacen las flores"
    [[560, 380, 30], [770, 320, 28], [910, 470, 26], [380, 440, 26], [620, 610, 22], [850, 380, 22]].forEach(function (b, i) {
      brotes += '<g class="brote" style="--w:' + (i * .12).toFixed(2) + 's"><path d="M' + f(b[0] + rnd(-20, 20)) + ' ' + f(b[1] + 70) + ' Q' + f(b[0] + rnd(-10, 10)) + ' ' + f(b[1] + 35) + ' ' + b[0] + ' ' + f(b[1] + b[2] * .4) + '" stroke="#2a1418" stroke-width="4" fill="none"/>' +
        flor(b[0], b[1], b[2], i + 3, { clase: 'flor-brote', oscura: i % 3 === 2 }) + '</g>';
    });

    el('capa capa-pared', mundo).innerHTML = SVG +
      '<defs><clipPath id="lrFlorero"><path d="M650 704 C640 726 610 752 612 820 L828 820 C830 752 800 726 790 704Z"/></clipPath></defs>' +
      // todo el florero va subido para que no lo corte la orilla de la pantalla
      '<g transform="translate(0 -100)">' +
      '<path d="M560 790 C760 782 1000 780 1240 786" stroke="#0d0809" stroke-width="5" fill="none" filter="url(#marcador)"/>' +
      '<g class="ramo">' +
        '<g filter="url(#marcador)">' + helechos + '</g>' +
        '<path ' + L + ' stroke="#2a1418" stroke-width="5" filter="url(#marcador)" d="' + tallosRamo + '"/>' +
        '<g filter="url(#marcador)">' + hojas + '</g>' +
        '<g class="brotes" filter="url(#marcador)">' + brotes + '</g>' +
        '<g filter="url(#marcador)">' + ramo + '</g>' +
      '</g>' +
      // el florero blanco pintado de rojo por la luz
      '<g filter="url(#pastel)" clip-path="url(#lrFlorero)">' + imagen('florero', 600, 690, 240, 140) + '</g>' +
      '<g filter="url(#marcador)"><path d="M650 704 C640 726 610 752 612 820 L828 820 C830 752 800 726 790 704" fill="none" ' + K + ' stroke-width="4"/>' +
        '<ellipse cx="720" cy="704" rx="72" ry="13" fill="#f6c2c8" ' + K + ' stroke-width="3.5"/><ellipse cx="720" cy="705" rx="56" ry="8" fill="#2a0c12"/>' +
        '<path d="M640 760 C636 780 636 800 640 816" stroke="#fff4f4" stroke-width="7" fill="none" opacity=".55"/>' +
        '<path d="M800 740 C812 770 816 796 812 818" stroke="#a81830" stroke-width="9" fill="none" opacity=".45"/></g>' +
      '</g>' +
    '</svg>';

    // ---- capa 3: lo que aparece en la luz (corazón, labios rotos, infinito) ----
    var estrellas = '';
    [[280, 190], [560, 180], [420, 150], [320, 320], [530, 320], [240, 260], [600, 250]].forEach(function (e, i) {
      estrellas += '<path class="estrellita" style="--w:-' + (i * .21).toFixed(2) + 's" d="M' + e[0] + ' ' + (e[1] - 14) + ' Q' + (e[0] + 2) + ' ' + (e[1] - 2) + ' ' + (e[0] + 14) + ' ' + e[1] +
        ' Q' + (e[0] + 2) + ' ' + (e[1] + 2) + ' ' + e[0] + ' ' + (e[1] + 14) + ' Q' + (e[0] - 2) + ' ' + (e[1] + 2) + ' ' + (e[0] - 14) + ' ' + e[1] + ' Q' + (e[0] - 2) + ' ' + (e[1] - 2) + ' ' + e[0] + ' ' + (e[1] - 14) + 'Z" fill="#fff0c8" stroke="#161616" stroke-width="2"/>';
    });
    var INF = 'M420 250 C460 190 550 190 550 250 C550 310 460 310 420 250 C380 190 290 190 290 250 C290 310 380 310 420 250Z';
    el('capa capa-luz', mundo).innerHTML = SVG +
      '<defs><clipPath id="lrCorGrande"><path d="' + COR + '"/></clipPath>' +
        '<clipPath id="lrLabios"><path d="' + LAB_ARRIBA + ' ' + LAB_ABAJO + '"/></clipPath>' +
        '<clipPath id="lrCor"><path d="' + COR + '"/></clipPath></defs>' +
      // corazón grande
      '<g class="centro-luz" transform="translate(0 90)"><g transform="translate(420 250) scale(3.1)"><g class="corazon-grande">' +
        '<g filter="url(#pastel)" clip-path="url(#lrCorGrande)">' + imagen('rosa', -42, -36, 84, 70) + '</g>' +
        '<path d="' + COR + '" fill="none" stroke="#161616" stroke-width="2.4" filter="url(#marcador)"/>' +
        '<path d="M-22 -14 C-18 -22 -10 -22 -6 -16" stroke="#fff" stroke-width="2.4" fill="none" opacity=".7"/></g></g>' +
      // labios rotos con su grieta y la curita
      '<g transform="translate(420 240)"><g class="labios">' +
        '<g filter="url(#pastel)" clip-path="url(#lrLabios)">' + imagen('labios', -140, -70, 280, 156) + '</g>' +
        '<g filter="url(#marcador)"><path d="' + LAB_ARRIBA + '" fill="none" ' + K + ' stroke-width="6"/><path d="' + LAB_ABAJO + '" fill="none" ' + K + ' stroke-width="6"/>' +
          '<path d="M-60 -30 C-40 -42 -20 -36 -12 -28 M30 40 C50 36 70 28 82 18" stroke="#fff4f6" stroke-width="7" fill="none" opacity=".7" stroke-linecap="round"/>' +
          '<path d="M-90 24 C-80 30 -70 32 -60 30 M60 50 C70 46 78 40 84 32" stroke="#a8183a" stroke-width="3" fill="none"/></g>' +
        '<g class="grieta-labios"><path class="grieta" pathLength="1" d="M-14 -36 L4 -16 L-12 4 L10 28 L-6 52 L6 76" fill="none" stroke="#3a0610" stroke-width="7" stroke-linejoin="round" stroke-linecap="round" filter="url(#marcador)"/>' +
          '<path d="M-22 -30 L-30 -36 M14 28 L24 22 M-10 52 L-20 58" stroke="#3a0610" stroke-width="3" stroke-linecap="round"/></g>' +
        '<g transform="rotate(-24)"><g class="curita" filter="url(#marcador)"><rect x="-70" y="-18" width="140" height="36" rx="18" fill="#e8c9a0" ' + K + ' stroke-width="3"/>' +
          '<rect x="-22" y="-12" width="44" height="24" rx="5" fill="#f6e2c4" stroke="#b08a60" stroke-width="2"/>' +
          '<path d="M-50 -6 h1 M-50 6 h1 M-40 0 h1 M40 0 h1 M50 -6 h1 M50 6 h1" stroke="#b08a60" stroke-width="3" stroke-linecap="round"/></g></g>' +
      '</g></g>' +
      // infinito con estrellitas en "por la eternidad"
      '<g class="eterno"><path class="infinito" pathLength="1" d="' + INF + '" fill="none" stroke="#161616" stroke-width="18" stroke-linecap="round" filter="url(#marcador)"/>' +
        '<path class="infinito" pathLength="1" d="' + INF + '" fill="none" stroke="#ffe8d0" stroke-width="9" stroke-linecap="round" filter="url(#pastel)"/>' + estrellas + '</g>' +
      '</g>' +
    '</svg>';

    // ---- capa 4: el frente (pétalos, lluvia, besitos, corazoncitos, título) ----
    var petalos = '';
    for (var p = 0; p < 20; p++) {
      var px = rnd(-40, W + 40);
      petalos += '<g transform="translate(' + f(px) + ' -40)"><path class="petalo-cae" style="--w:-' + rnd(0, 4).toFixed(2) + 's;--x:' + rnd(-160, 160).toFixed(0) + 'px" ' +
        'd="M0 0 C-16 -10 -18 -34 -2 -46 C8 -38 18 -14 0 0Z M-1 -6 C-3 -18 -3 -28 -2 -38" fill="' + pick(['#f8c8cc', '#f4b0b8', '#ffd6d8', '#e8707e']) + '" stroke="#161616" stroke-width="2"/></g>';
    }
    var gotas = '';
    for (var g = 0; g < 50; g++) {
      gotas += '<path class="gota" style="--w:-' + rnd(0, 1).toFixed(2) + 's" d="M' + f(rnd(-40, W + 120)) + ' ' + f(rnd(-120, 640)) + ' l-12 34" stroke="' + pick(['#ffe0e4', '#f0f4ff', '#ffc0c8']) + '" stroke-width="3.5" stroke-linecap="round"/>';
    }
    var besitos = '';
    [[330, 160, .9, -12], [790, 140, .8, 14], [400, 380, .7, 20], [740, 330, .85, -18], [250, 300, .6, 8], [880, 250, .7, -6], [560, 420, .6, 4], [480, 90, .55, -20], [650, 70, .6, 16]].forEach(function (b, i) {
      besitos += '<g transform="translate(' + b[0] + ' ' + b[1] + ') rotate(' + b[3] + ') scale(' + b[2] + ')"><g class="besito" style="--w:-' + (i * .27).toFixed(2) + 's">' +
        '<path d="' + BESITO + '" fill="#c8102e" stroke="#161616" stroke-width="3" filter="url(#marcador)"/></g></g>';
    });
    var corazones = '';
    [[480, 370, .5], [560, 330, .4], [660, 220, .55], [790, 300, .42], [440, 460, .38], [620, 420, .45], [720, 180, .35], [860, 420, .4]].forEach(function (b, i) {
      corazones += corazon(b[0], b[1], b[2], i);
    });

    el('capa capa-frente', mundo).innerHTML = SVG +
      '<g class="petalos">' + petalos + '</g>' +
      '<g class="lluvia" filter="url(#marcador)">' + gotas + '</g>' +
      '<g class="besitos">' + besitos + '</g>' +
      '<g class="corazones">' + corazones + '</g>' +
      // título pintado arriba a la derecha, en la parte oscura del muro
      '<g class="firma">' +
        '<text x="900" y="124" font-family="Caveat, cursive" font-weight="700" font-size="28" fill="#ff5a6a" transform="rotate(-5 900 124)" filter="url(#marcador)">Zoé</text>' +
        '<g class="titulo" filter="url(#pastel)" fill="#ffd0d6" stroke="#161616" stroke-width="2.5" paint-order="stroke" font-family="Fredoka, \'Arial Rounded MT Bold\', sans-serif" font-weight="700">' +
          letra('L', 898, 188, 62, -5, 0) + letra('a', 936, 184, 48, 4, 1) + letra('b', 970, 188, 54, -3, 2) + letra('i', 1002, 184, 50, 5, 3) + letra('o', 1020, 188, 48, -4, 4) + letra('s', 1052, 184, 50, 3, 5) +
          letra('r', 930, 248, 50, 4, 6) + letra('o', 960, 252, 54, -4, 7) + letra('t', 994, 248, 52, 5, 8) + letra('o', 1020, 252, 50, -3, 9) + letra('s', 1050, 248, 52, 4, 10) +
        '</g>' +
        '<g transform="translate(1106 224) scale(.7) rotate(-12)"><path d="' + BESITO + '" fill="#e8243f" stroke="#161616" stroke-width="3.5" filter="url(#marcador)"/>' +
          '<path d="M-2 -10 L4 -2 L-3 4 L3 12" stroke="#3a0610" stroke-width="2.5" fill="none"/></g>' +
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

    // parallax 3D; la luz sigue al mouse / dedo y las sombras se mueven al revés
    function mover(x, y) {
      mundo.style.setProperty('--ry', ((x - .5) * 14) + 'deg');
      mundo.style.setProperty('--rx', ((.5 - y) * 9) + 'deg');
      escena.style.setProperty('--px', ((x - .5) * 2).toFixed(2));
      escena.style.setProperty('--py', ((y - .5) * 2).toFixed(2));
    }
    window.addEventListener('mousemove', function (e) { if (activa) mover(e.clientX / innerWidth, e.clientY / innerHeight); });
    window.addEventListener('touchmove', function (e) { if (activa) { var t = e.touches[0]; mover(t.clientX / innerWidth, t.clientY / innerHeight); } }, { passive: true });
  }

  // ---- "hervor" ----
  function hervir() {
    cuadro = (cuadro + 1) % CUADROS;
    lienzosMarco.forEach(function (cv, i) { cv.style.opacity = i === cuadro ? 1 : 0; });
    escena.querySelectorAll('.tex-fondo').forEach(function (im) { im.setAttribute('href', texFondo[cuadro]); });
    Object.keys(tex).forEach(function (k) {
      escena.querySelectorAll('.tex-' + k).forEach(function (im, i) { im.setAttribute('href', tex[k][(cuadro + i) % CUADROS]); });
    });
  }

  // ---- la escena reacciona a lo que dice la línea que suena ----
  var lineas = [];
  (window.LETRA_LABIOS_LRC || '').split(/\r?\n/).forEach(function (l) {
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
    escena.classList.toggle('en-corazon', /corazón|^amor/.test(texto));
    escena.classList.toggle('en-lugar', /lugar/.test(texto));
    escena.classList.toggle('en-flores', /flores|nace el amor/.test(texto));
    escena.classList.toggle('en-amor', /nace el amor|todo mi amor|^amor/.test(texto));
    escena.classList.toggle('en-labios', /labios|besar|curar|cuidar/.test(texto));
    escena.classList.toggle('en-besar', /besar/.test(texto));
    escena.classList.toggle('en-curar', /curar|cuidar/.test(texto));
    escena.classList.toggle('en-raro', /raro/.test(texto));
    escena.classList.toggle('en-aparece', /aparece/.test(texto));
    escena.classList.toggle('en-tiempo', /distancia|tiempo|edad/.test(texto));
    escena.classList.toggle('en-lluvia', /desierto/.test(texto));
    escena.classList.toggle('en-mirar', /mirar|voz/.test(texto));
    escena.classList.toggle('en-manos', /mano/.test(texto));
    escena.classList.toggle('en-eternidad', /eternidad/.test(texto));
    escena.classList.toggle('en-ah', /^(\(uh\) )?ah-ah/.test(texto));
  }
  function limpiar() { ESTADOS.forEach(function (c) { escena.classList.remove(c); }); ultima = null; }
  audio.addEventListener('timeupdate', reaccionar);
  audio.addEventListener('ended', limpiar);

  window.Escenas = window.Escenas || {};
  window.Escenas.labios = {
    el: escena,
    activar: function () {
      if (!construida) construir();
      activa = true;
      limpiar();
      clearInterval(timer);
      timer = setInterval(hervir, C.FPS_DIBUJO);
      hervir();
      // las líneas de marcador se dibujan solas al llegar
      escena.classList.remove('dibujando');
      void escena.offsetWidth;
      escena.classList.add('dibujando');
    },
    desactivar: function () { activa = false; clearInterval(timer); }
  };
})();
