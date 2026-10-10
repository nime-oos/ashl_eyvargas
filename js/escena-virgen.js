// Escena "Virgen" (Adolescent's Orquesta): la rosa más bella.
// Noche de lluvia en un jardín: una rosa caída en el piso mojado. Llega un paraguas rojo a cubrirla ("aquí estoy
// yo"), la rosa se levanta ("para hablarte del amor") y en "ahora entrégate" deja de llover, se abren las nubes y
// la rosa florece en un medallón dorado con la foto de ella, rodeado de rosas. Cada línea agrega algo: lágrimas de
// luz que se vuelven estrellas, rayos de luz ("Dios me mandó"), pétalos, latido, corazones, una cúpula de cristal
// que la protege, bola disco y luces de salsa en los instrumentales y el montuno, letrero de neón y fuegos
// artificiales en "Adolescentes", y al final amanece y crecen enredaderas de rosas ("tú corres por mis venas").
//
// Para que no se trabe: todo es SVG/DOM en capas que solo animan transform/opacity; la lluvia son dos tiras con
// patrón que se deslizan, y la foto se carga solo cuando se abre esta canción.
(function () {
  var escena = document.getElementById('escena-virgen');
  var audio = document.getElementById('bg-music');
  if (!escena || !audio) return;
  var FOTO = 'img/virgen.jpg';
  var SUBS = { letras: true, claves: /^(amor|rosa|vida|niña|dios|siénteme|entrégate|amo|amaré|adorarte|linda|querida|alma|bella|tuyo|ríe|cuidaré|protegeré)$/ };
  var ESTADOS = ['inicio', 'llueve', 'llovizna', 'paraguas', 'rosa-de-pie', 'con-foto', 'brota', 'tiembla', 'lagrimas', 'rayos', 'petalos',
    'latido', 'corazones', 'nina', 'marchita', 'cupula', 'disco', 'por-dentro', 'unidos', 'bellas', 'neon', 'amanecer', 'venas', 'corona'];

  var construida = false, activa = false, antes = {}, elFlash, tBrota = 0;

  function f(n) { return (+n).toFixed(1); }
  var semilla = 7;
  function rnd(a, b) { semilla = (semilla * 9301 + 49297) % 233280; return a + semilla / 233280 * (b - a); }
  function el(tag, clase, html, padre) {
    var e = document.createElement(tag);
    e.className = clase;
    if (html) e.innerHTML = html;
    (padre || escena).appendChild(e);
    return e;
  }
  function svg(vb, html, aspecto, clase) {
    return '<svg' + (clase ? ' class="' + clase + '"' : '') + ' viewBox="' + vb + '" preserveAspectRatio="' + (aspecto || 'xMidYMid meet') + '">' + html + '</svg>';
  }

  // ---- dibujos ----
  // rosa vista desde arriba (para la corona del medallón, el jardín y las enredaderas)
  var PALETAS = {
    roja: ['#5a0820', '#a8123a', '#d81e4a', '#f0406a', '#ff7a96'],
    rosa: ['#7a1840', '#c8386a', '#ea5a8a', '#ff86aa', '#ffb8cc'],
    vino: ['#3a0614', '#6a0e28', '#8a1434', '#a81c40', '#c42a50'],
    gris: ['#2a2228', '#4a4048', '#5e545c', '#726870', '#8a8088']
  };
  function rosaArriba(x, y, r, pal, rot) {
    var p = PALETAS[pal] || pal, h = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot || 0) + ')">';
    h += '<circle r="' + f(r) + '" fill="' + p[0] + '"/>';
    [[5, .98, .64, 1, 0], [5, .76, .52, 2, 36], [4, .52, .4, 3, 14], [3, .32, .28, 4, 50]].forEach(function (an) {
      for (var k = 0; k < an[0]; k++) {
        var rr = r * an[1], w = r * an[2];
        h += '<path transform="rotate(' + f(an[4] + k * 360 / an[0]) + ')" d="M0 0 C' + f(w) + ' ' + f(-rr * .3) + ' ' + f(w * .8) + ' ' + f(-rr) + ' 0 ' + f(-rr) +
          ' C' + f(-w * .8) + ' ' + f(-rr) + ' ' + f(-w) + ' ' + f(-rr * .3) + ' 0 0Z" fill="' + p[an[3]] + '" stroke="' + p[0] + '" stroke-width="' + f(r * .045) + '"/>';
      }
    });
    h += '<path d="M' + f(-r * .12) + ' 0 C' + f(-r * .12) + ' ' + f(-r * .16) + ' ' + f(r * .14) + ' ' + f(-r * .14) + ' ' + f(r * .12) + ' ' + f(r * .04) + '" stroke="' + p[0] + '" stroke-width="' + f(r * .05) + '" fill="none" stroke-linecap="round"/>';
    return h + '</g>';
  }
  function hoja(x, y, l, rot, color) {
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot) + ')"><path d="M0 0 C' + f(l * .3) + ' ' + f(-l * .32) + ' ' + f(l * .75) + ' ' + f(-l * .3) + ' ' + f(l) + ' 0 C' + f(l * .75) + ' ' + f(l * .3) + ' ' + f(l * .3) + ' ' + f(l * .32) + ' 0 0Z" fill="' + (color || '#2f6b34') + '"/>' +
      '<path d="M' + f(l * .08) + ' 0 L' + f(l * .9) + ' 0" stroke="#1c4420" stroke-width="' + f(l * .04) + '" opacity=".7"/></g>';
  }
  function corazon(x, y, s, color, extra) {
    return '<path ' + (extra || '') + ' transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')" d="M0 6 C-14 -4 -10 -16 0 -9 C10 -16 14 -4 0 6Z" fill="' + color + '"/>';
  }
  function destello(r, color) {
    return '<path d="M0 ' + -r + ' Q' + f(r * .14) + ' ' + f(-r * .14) + ' ' + r + ' 0 Q' + f(r * .14) + ' ' + f(r * .14) + ' 0 ' + r + ' Q' + f(-r * .14) + ' ' + f(r * .14) + ' ' + -r + ' 0 Q' + f(-r * .14) + ' ' + f(-r * .14) + ' 0 ' + -r + 'Z" fill="' + color + '"/>';
  }

  // rosa de lado con su tallo (la que está caída y se levanta). La cabeza tiene versión marchita (gris) y viva.
  function cabezaRosa(id, c) {
    return '<defs><linearGradient id="' + id + 'a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c[3] + '"/><stop offset=".55" stop-color="' + c[2] + '"/><stop offset="1" stop-color="' + c[0] + '"/></linearGradient>' +
      '<linearGradient id="' + id + 'b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c[2] + '"/><stop offset="1" stop-color="' + c[0] + '"/></linearGradient>' +
      '<linearGradient id="' + id + 'c" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c[2] + '"/><stop offset="1" stop-color="' + c[1] + '"/></linearGradient></defs>' +
      '<path d="M-8 30 C-30 38 -46 32 -54 18 C-38 24 -22 24 -10 24Z M8 30 C30 38 46 32 54 18 C38 24 22 24 10 24Z" fill="' + c[5] + '"/>' +
      '<path d="M-44 -8 C-50 -42 -20 -60 0 -48 C20 -60 50 -42 44 -8 C40 18 20 32 0 32 C-20 32 -40 18 -44 -8Z" fill="' + c[1] + '"/>' +
      '<path d="M-26 -20 C-24 -46 24 -46 26 -20 C26 4 14 20 0 22 C-14 20 -26 4 -26 -20Z" fill="url(#' + id + 'a)"/>' +
      '<path d="M-26 -20 C-14 -31 14 -31 26 -20 C14 -13 -14 -13 -26 -20Z" fill="' + c[4] + '"/>' +
      '<path d="M-14 -24 C-12 -42 12 -42 14 -24 C6 -28 -6 -28 -14 -24Z" fill="' + c[1] + '"/>' +
      '<path d="M-7 -32 C-3 -38 8 -36 8 -27 C2 -31 -2 -29 -7 -32Z" fill="' + c[4] + '"/>' +
      '<path d="M-48 -12 C-54 16 -34 40 -4 40 C-22 28 -30 8 -26 -18 C-34 -20 -42 -18 -48 -12Z" fill="url(#' + id + 'b)"/>' +
      '<path d="M48 -12 C54 16 34 40 4 40 C22 28 30 8 26 -18 C34 -20 42 -18 48 -12Z" fill="url(#' + id + 'c)"/>' +
      '<path d="M-30 4 C-24 32 24 32 30 4 C22 15 -22 15 -30 4Z" fill="' + c[2] + '"/>' +
      '<path d="M-30 4 C-22 11 22 11 30 4" stroke="' + c[4] + '" stroke-width="2.2" fill="none" opacity=".8"/>' +
      '<path d="M-47 -11 C-42 -15 -33 -18 -26 -18 M47 -11 C42 -15 33 -18 26 -18" stroke="' + c[4] + '" stroke-width="1.6" fill="none" opacity=".6"/>';
  }
  function rosaConTallo() {
    var tallo = '<path d="M0 30 C-4 120 6 220 -2 300 C-6 340 2 380 0 420" stroke="#2c6a30" stroke-width="7" fill="none" stroke-linecap="round"/>' +
      '<path d="M0 30 C-4 120 6 220 -2 300 C-6 340 2 380 0 420" stroke="#4a9a4a" stroke-width="2" fill="none" opacity=".6" transform="translate(-1.5 0)"/>' +
      '<path d="M-2 110 l-8 -5 l9 -1Z M3 190 l8 -6 l-1 9Z M-3 270 l-8 -4 l8 -3Z M-1 350 l9 -3 l-7 6Z" fill="#244f26"/>' +
      hoja(0, 160, 64, 200, '#2f7a38') + hoja(-1, 240, 58, -20, '#2a6a32') + hoja(-2, 320, 48, 210, '#357e3c');
    return svg('-110 -70 220 495', tallo +
      '<g class="cabeza-viva">' + cabezaRosa('vgRV', ['#7a0a26', '#a8123a', '#d81e4a', '#ff5a7a', '#ff9ab0', '#2f6b2a']) + '</g>' +
      '<g class="cabeza-gris">' + cabezaRosa('vgRG', ['#2c2028', '#4a3a44', '#62505a', '#7a6670', '#8e7c86', '#3a4a34']) + '</g>', 'xMidYMax meet');
  }

  // el medallón: marco dorado con cuentas y una argolla de corazón arriba
  function marco() {
    var h = '<defs><linearGradient id="vgOro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2c0"/><stop offset=".3" stop-color="#f2c46a"/><stop offset=".55" stop-color="#b8802a"/><stop offset=".8" stop-color="#f6d88a"/><stop offset="1" stop-color="#a86e1e"/></linearGradient></defs>' +
      '<circle r="44.5" fill="none" stroke="url(#vgOro)" stroke-width="7"/>' +
      '<circle r="41" fill="none" stroke="#6a3e0c" stroke-width="1.2"/>' +
      '<circle r="48.2" fill="none" stroke="#7a4a12" stroke-width=".9"/>';
    for (var k = 0; k < 40; k++) {
      var a = k / 40 * Math.PI * 2;
      h += '<circle cx="' + f(Math.cos(a) * 44.5) + '" cy="' + f(Math.sin(a) * 44.5) + '" r="1.3" fill="#fff4d0" opacity=".85"/>';
    }
    // argolla y moño de filigrana
    h += '<path d="M-10 -49 C-22 -54 -24 -64 -14 -64 C-8 -64 -4 -58 0 -53 C4 -58 8 -64 14 -64 C24 -64 22 -54 10 -49Z" fill="url(#vgOro)" stroke="#7a4a12" stroke-width=".8"/>' +
      '<path d="M0 -60 C-6 -66 -11 -60 -6 -56 C-4 -54 -1 -52 0 -50 C1 -52 4 -54 6 -56 C11 -60 6 -66 0 -60Z" fill="#d81e4a" stroke="#7a0a26" stroke-width=".6"/>' +
      '<path d="M-30 46 C-20 52 -8 50 0 46 C8 50 20 52 30 46" stroke="url(#vgOro)" stroke-width="2.4" fill="none"/>';
    return h;
  }
  // corona de rosas alrededor del marco
  function corona(pal) {
    var h = '', R = 50;
    var hojas = [[112, 22, 0], [140, 20, 0], [60, 22, 1], [32, 20, 1], [168, 18, 0], [8, 18, 1], [200, 16, 0], [-22, 16, 1], [228, 14, 0], [-48, 14, 1]];
    hojas.forEach(function (q) {
      var a = q[0] * Math.PI / 180;
      h += hoja(Math.cos(a) * (R + 4), Math.sin(a) * (R + 4), q[1], q[0] + (q[2] ? -60 : 60), '#2f6b34');
    });
    var rosas = [[90, 11, 'roja'], [118, 9.5, 'rosa'], [62, 9.5, 'rosa'], [143, 8.5, 'roja'], [37, 8.5, 'roja'], [166, 7, 'rosa'], [14, 7, 'rosa'],
      [190, 6, 'roja'], [-10, 6, 'roja'], [214, 5, 'rosa'], [-34, 5, 'rosa']];
    rosas.forEach(function (q, i) {
      var a = q[0] * Math.PI / 180;
      h += '<g class="rc" style="--k:' + i + '">' + rosaArriba(Math.cos(a) * R, Math.sin(a) * R, q[1], pal || q[2], i * 47) + '</g>';
    });
    return h;
  }

  function paraguas() {
    var borde = 'M-56 0';
    for (var k = 0; k < 7; k++) { var x0 = -56 + k * 16; borde += ' Q' + f(x0 + 8) + ' 9 ' + f(x0 + 16) + ' 0'; }
    return svg('-62 -52 124 140',
      '<defs><linearGradient id="vgPar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a0f2e"/><stop offset=".45" stop-color="#e8304e"/><stop offset="1" stop-color="#a8123a"/></linearGradient></defs>' +
      '<path d="' + borde + ' C56 -24 30 -46 0 -46 C-30 -46 -56 -24 -56 0Z" fill="url(#vgPar)"/>' +
      '<path d="M0 -46 C-12 -30 -16 -14 -24 0 M0 -46 C12 -30 16 -14 24 0 M0 -46 V0" stroke="#6a0820" stroke-width="1.2" fill="none" opacity=".7"/>' +
      '<path d="M-40 -26 C-30 -38 -16 -44 -4 -45" stroke="#ff9ab0" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7"/>' +
      '<path d="M0 -46 V-52" stroke="#3a2a20" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M0 0 V70 C0 80 -12 80 -12 70" stroke="#3a2a20" stroke-width="3" fill="none" stroke-linecap="round"/>', 'xMidYMid meet');
  }
  function mariposa(c1, c2) {
    return svg('-30 -24 60 48',
      '<g class="ala-i"><path d="M-2 -2 C-14 -24 -30 -18 -26 -4 C-24 4 -12 4 -2 0Z" fill="' + c1 + '"/><path d="M-2 2 C-14 6 -24 18 -14 20 C-8 20 -4 12 -2 4Z" fill="' + c2 + '"/>' +
      '<circle cx="-16" cy="-10" r="3" fill="#fff6e0" opacity=".7"/></g>' +
      '<g class="ala-d"><path d="M2 -2 C14 -24 30 -18 26 -4 C24 4 12 4 2 0Z" fill="' + c1 + '"/><path d="M2 2 C14 6 24 18 14 20 C8 20 4 12 2 4Z" fill="' + c2 + '"/>' +
      '<circle cx="16" cy="-10" r="3" fill="#fff6e0" opacity=".7"/></g>' +
      '<path d="M0 -8 V14" stroke="#2a1420" stroke-width="2.6" stroke-linecap="round"/><path d="M0 -8 C-2 -14 -5 -16 -7 -17 M0 -8 C2 -14 5 -16 7 -17" stroke="#2a1420" stroke-width=".9" fill="none"/>');
  }
  function bolaDisco() {
    var h = '<defs><radialGradient id="vgBola" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="#c8c4d8"/><stop offset="1" stop-color="#4a4660"/></radialGradient>' +
      '<clipPath id="vgBolaC"><circle r="40"/></clipPath></defs>' +
      '<path d="M0 -200 V-40" stroke="#c8c0d8" stroke-width="1.4"/>' +
      '<circle r="40" fill="url(#vgBola)"/><g clip-path="url(#vgBolaC)"><g class="facetas">';
    for (var x = -96; x <= 96; x += 8) {
      for (var y = -40; y < 40; y += 8) {
        var b = .3 + ((x * 7 + y * 13) % 5 + 5) % 5 * .12;
        h += '<rect x="' + x + '" y="' + y + '" width="7" height="7" fill="#fff" opacity="' + f(b * .5) + '"/>';
      }
    }
    h += '</g></g><circle r="40" fill="none" stroke="#2a2640" stroke-width="1"/>' + '<g transform="translate(-14 -16)">' + destello(9, '#fff') + '</g>';
    return svg('-50 -200 100 250', h, 'xMidYMax meet');
  }

  // jardín de abajo: arbustos de rosas a los lados, el piso mojado al centro. "angosto" es la versión para celular
  // (en vertical el jardín ancho se recorta y solo se verían las orillas)
  function jardin(pal, conGlow, angosto) {
    var W = angosto ? 640 : 1600, k = W / 1600, lados = angosto ? [[0, 235, 1], [405, 640, -1]] : [[0, 560, 1], [1040, 1600, -1]];
    var h = '';
    semilla = 31;
    if (!conGlow) {
      h += '<defs><linearGradient id="vgPiso' + W + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a0c22"/><stop offset="1" stop-color="#12040e"/></linearGradient></defs>' +
        '<path d="M0 210 C' + f(300 * k) + ' 196 ' + f(600 * k) + ' 204 ' + f(W / 2) + ' 200 C' + f(1000 * k) + ' 204 ' + f(1300 * k) + ' 196 ' + W + ' 210 V300 H0Z" fill="url(#vgPiso' + W + ')"/>' +
        '<ellipse cx="' + f(W / 2) + '" cy="246" rx="' + f(angosto ? 150 : 190) + '" ry="14" fill="#7a3a6a" opacity=".22"/><ellipse cx="' + f(W / 2) + '" cy="246" rx="' + f(angosto ? 90 : 120) + '" ry="7" fill="#c86a9a" opacity=".16"/>';
      // matas de hojas
      lados.forEach(function (lado) {
        var ancho = lado[1] - lado[0];
        for (var i = 0; i < (angosto ? 24 : 46); i++) {
          var x = rnd(lado[0], lado[1]), borde = lado[2] > 0 ? (lado[1] - x) / ancho : (x - lado[0]) / ancho;
          var y = 210 - rnd(20, 150) * (.35 + .65 * (1 - borde * borde)) + rnd(-10, 10);
          h += '<circle cx="' + f(x) + '" cy="' + f(y + 30) + '" r="' + f(rnd(26, 46)) + '" fill="' + ['#16301e', '#1c3a24', '#12281a', '#204428'][i % 4] + '"/>';
        }
      });
    }
    semilla = 77;
    lados.forEach(function (lado) {
      var r0 = lado[0] + 30 * k, r1 = lado[1] - 20 * k;
      for (var i = 0; i < (angosto ? 5 : 9); i++) {
        var x = rnd(r0, r1), cerca = Math.min(x - r0, r1 - x) / ((r1 - r0) / 2);
        var y = 210 - rnd(30, 120) * (.4 + .6 * Math.min(1, cerca)) + rnd(-8, 8);
        if (conGlow) h += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="34" fill="url(#vgGlowR' + W + ')"/>';
        h += rosaArriba(x, y, rnd(13, 20), pal, rnd(0, 360));
      }
    });
    if (conGlow) h = '<defs><radialGradient id="vgGlowR' + W + '"><stop offset="0" stop-color="#ff6a8a" stop-opacity=".55"/><stop offset="1" stop-color="#ff6a8a" stop-opacity="0"/></radialGradient></defs>' + h;
    return svg('0 0 ' + W + ' 300', h, 'xMidYMax slice');
  }
  // enredaderas que suben por la orilla ("tú corres por mis venas")
  function enredadera() {
    semilla = 53;
    var h = '<path pathLength="1" class="rama" d="M20 600 C30 520 10 460 40 400 C70 340 40 280 70 220 C94 172 80 120 110 70" stroke="#2f6b34" stroke-width="7" fill="none" stroke-linecap="round"/>' +
      '<path pathLength="1" class="rama r2" d="M40 400 C90 380 120 340 150 330 M70 220 C110 210 140 180 170 176 M30 520 C70 500 90 470 120 466" stroke="#2f6b34" stroke-width="4.5" fill="none" stroke-linecap="round"/>' +
      '<path pathLength="1" class="rama r3" d="M20 600 C40 520 60 470 50 400 C42 340 72 300 64 240" stroke="#c8163e" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".8"/>';
    var puntos = [[110, 70, 20], [170, 176, 16], [150, 330, 18], [120, 466, 15], [70, 220, 13], [40, 400, 14], [64, 240, 9], [22, 560, 12]];
    puntos.forEach(function (q, i) {
      h += '<g class="flor-e" style="--k:' + i + '">' + hoja(q[0] - 4, q[1] + 10, q[2] * 1.4, 150 + i * 30) + rosaArriba(q[0], q[1], q[2], i % 2 ? 'rosa' : 'roja', i * 40) + '</g>';
    });
    return svg('0 0 220 600', h, 'xMinYMax meet');
  }

  function construir() {
    construida = true;
    semilla = 7;
    el('div', 'cielo');
    el('div', 'cielo-dia');
    // estrellas
    var est = '';
    for (var i = 0; i < 90; i++) {
      var x = rnd(0, 1600), y = rnd(0, 620);
      est += i % 5 ? '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(rnd(.8, 2)) + '" fill="#fff4f0"/>' : '<g transform="translate(' + f(x) + ' ' + f(y) + ')">' + destello(rnd(4, 8), '#ffe8f0') + '</g>';
    }
    el('div', 'estrellas', svg('0 0 1600 900', est, 'xMidYMid slice'));
    el('div', 'luna', svg('-50 -50 100 100', '<defs><radialGradient id="vgLuna"><stop offset=".55" stop-color="#ffe8f0" stop-opacity=".5"/><stop offset="1" stop-color="#ffe8f0" stop-opacity="0"/></radialGradient></defs>' +
      '<circle r="50" fill="url(#vgLuna)"/><path d="M4 -30 A30 30 0 0 0 4 30 A36 36 0 0 1 4 -30Z" fill="#fff2e8"/>'));
    el('div', 'rayos');
    el('div', 'sol');
    // nubes de lluvia
    var nub = '';
    semilla = 19;
    for (var n = 0; n < 26; n++) nub += '<ellipse cx="' + f(rnd(-60, 1660)) + '" cy="' + f(rnd(-30, 120)) + '" rx="' + f(rnd(120, 260)) + '" ry="' + f(rnd(50, 90)) + '" fill="' + ['#2a1430', '#341a3a', '#22102a'][n % 3] + '"/>';
    el('div', 'nubes', svg('0 0 1600 260', nub, 'xMidYMin slice'));
    // salsa: reflejos de la bola disco y reflectores
    var refl = el('div', 'reflejos');
    semilla = 5;
    for (var r = 0; r < 26; r++) {
      el('i', '', '', refl).style.cssText = 'left:' + f(rnd(-10, 110)) + '%;top:' + f(rnd(-10, 110)) + '%;--c:' + ['#fff', '#ffd2e8', '#ffe6a8', '#d8c8ff'][r % 4] + ';--s:' + f(rnd(.6, 1.4));
    }
    ['f1', 'f2', 'f3'].forEach(function (c) { el('div', 'foco ' + c); });
    el('div', 'bola', bolaDisco());
    // fuegos artificiales ("Adolescentes")
    [['18%', '34%', '#ff5a8a', 0], ['82%', '30%', '#ffd27a', .7], ['30%', '22%', '#c8a0ff', 1.3], ['70%', '18%', '#7ae8ff', 1.9], ['50%', '12%', '#ff8a5a', 2.4]].forEach(function (q) {
      var fu = el('div', 'fuego');
      fu.style.cssText = 'left:' + q[0] + ';top:' + q[1] + ';--c:' + q[2] + ';--w:' + q[3] + 's';
      for (var k = 0; k < 14; k++) el('i', '', '', fu).style.setProperty('--a', (k * 360 / 14) + 'deg');
    });
    // enredaderas en las orillas
    el('div', 'venas v-izq', enredadera());
    el('div', 'venas v-der', enredadera());
    // jardín
    el('div', 'jardin ancho', jardin('vino'));
    el('div', 'jardin-flor ancho', jardin('roja', true));
    el('div', 'jardin angosto', jardin('vino', false, true));
    el('div', 'jardin-flor angosto', jardin('roja', true, true));
    // la rosa con su tallo y pétalos caídos
    el('div', 'petalos-piso', svg('-120 -20 240 40',
      '<path d="M-90 4 C-84 -6 -70 -6 -66 4 C-74 8 -84 8 -90 4Z" fill="#6a1a30"/><path d="M60 8 C66 -2 80 -2 84 8 C76 12 66 12 60 8Z" fill="#5a1428"/>' +
      '<path d="M-30 10 C-24 2 -12 2 -8 10 C-16 14 -24 14 -30 10Z" fill="#7a2038"/><path d="M20 -2 C26 -10 36 -8 38 0 C32 4 24 4 20 -2Z" fill="#62182e"/>'));
    el('div', 'rosa', rosaConTallo());
    // luciérnagas
    var luc = el('div', 'luciernagas');
    semilla = 41;
    for (var l = 0; l < 14; l++) el('i', '', '', luc).style.cssText = 'left:' + f(rnd(4, 96)) + '%;top:' + f(rnd(58, 92)) + '%;--w:-' + f(rnd(0, 6)) + 's;--x:' + f(rnd(-40, 40)) + 'px;--y:' + f(rnd(-50, -10)) + 'px';
    // el medallón con la foto (la imagen se pide solo al abrir esta canción)
    var plano = el('div', 'plano-m');
    var med = el('div', 'medallon', '', plano);
    el('div', 'halo', '', med);
    el('div', 'onda', '', med);
    el('div', 'corazon-luz', svg('-20 -20 40 40', '<defs><radialGradient id="vgCL"><stop offset="0" stop-color="#ff4a7a" stop-opacity=".7"/><stop offset="1" stop-color="#ff4a7a" stop-opacity="0"/></radialGradient></defs>' +
      '<path d="M0 14 C-26 -2 -18 -24 0 -12 C18 -24 26 -2 0 14Z" fill="url(#vgCL)" transform="scale(1.1)"/>'), med);
    var foto = el('div', 'foto', '', med);
    var img = new Image();
    img.alt = '';
    img.decoding = 'async';
    img.src = FOTO;
    foto.appendChild(img);
    el('div', 'luz-dentro', '', med);
    el('div', 'marco', svg('-76 -76 152 152', '<g class="cor-hojas">' + corona() + '</g>' + marco()), med);
    el('div', 'marco-gris', svg('-76 -76 152 152', corona('gris')), med);
    var anillo = '';
    for (var k = 0; k < 12; k++) {
      var a = k / 12 * Math.PI * 2;
      anillo += '<g class="ac" style="--k:' + k + '">' + corazon(Math.cos(a) * 68, Math.sin(a) * 68, .5, k % 2 ? '#ff6a9a' : '#ffd27a') + '</g>';
    }
    el('div', 'anillo-cor', svg('-76 -76 152 152', anillo), med);
    var cor = '';
    for (var c = 0; c < 9; c++) {
      var b = (-150 + c * 15) * Math.PI / 180;
      cor += '<g class="cc" style="--k:' + c + '" transform="translate(' + f(Math.cos(b) * 62) + ' ' + f(Math.sin(b) * 62) + ')">' + destello(c % 2 ? 3.5 : 5.5, c % 2 ? '#fff6d0' : '#ffd27a') + '</g>';
    }
    el('div', 'brillos-corona', svg('-76 -76 152 152', cor), med);
    el('div', 'cupula', svg('-80 -90 160 180',
      '<defs><linearGradient id="vgVid" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d8f0ff" stop-opacity=".35"/><stop offset=".25" stop-color="#d8f0ff" stop-opacity=".06"/><stop offset=".8" stop-color="#d8f0ff" stop-opacity=".04"/><stop offset="1" stop-color="#d8f0ff" stop-opacity=".3"/></linearGradient></defs>' +
      '<path d="M-66 74 V-10 C-66 -60 -36 -80 0 -80 C36 -80 66 -60 66 -10 V74Z" fill="url(#vgVid)" stroke="#e8f6ff" stroke-width="1.6" stroke-opacity=".7"/>' +
      '<path d="M-54 50 V-8 C-54 -46 -34 -64 -12 -68" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".55"/>' +
      '<path d="M50 -30 C48 -44 40 -54 30 -60" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".4"/>' +
      '<ellipse cx="0" cy="-84" rx="8" ry="5" fill="#e8f6ff" opacity=".7"/>' +
      '<path d="M-74 74 H74 C74 84 -74 84 -74 74Z" fill="#f2c46a" opacity=".85"/>'), med);
    // el paraguas rojo
    el('div', 'paraguas', paraguas());
    // la lluvia
    var lluvia = el('div', 'lluvia');
    // una sola tira con gotas largas y cortas (el patrón se repite cada 200px, así el ciclo no brinca)
    semilla = 27;
    var g = '';
    [[9, .55, 30], [6, .3, 18]].forEach(function (tipo) {
      for (var i = 0; i < tipo[0]; i++) {
        var x = rnd(0, 160), y = rnd(0, 200);
        [y, y - 200].forEach(function (yy) {
          if (yy + tipo[2] < 0) return;
          g += '<path d="M' + f(x) + ' ' + f(yy) + ' l-3 ' + tipo[2] + '" stroke="rgba(214,226,255,' + tipo[1] + ')" stroke-width="1.3" stroke-linecap="round"/>';
        });
      }
    });
    el('div', 'gotas', '', lluvia).style.backgroundImage = 'url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="200">' + g + '</svg>') + '")';
    var salp = el('div', 'salpicaduras');
    semilla = 61;
    for (var s = 0; s < 8; s++) el('i', '', '', salp).style.cssText = 'left:' + f(rnd(8, 92)) + '%;top:' + f(rnd(84, 96)) + '%;--w:-' + f(rnd(0, 1)) + 's';
    // pétalos que caen
    var pet = el('div', 'petalos');
    semilla = 13;
    for (var p = 0; p < 18; p++) {
      el('i', '', svg('-10 -8 20 16', '<path d="M-9 2 C-6 -8 6 -8 9 0 C4 6 -4 7 -9 2Z" fill="' + ['#d81e4a', '#ff5a7a', '#a8123a', '#ff86aa'][p % 4] + '"/>'), pet)
        .style.cssText = 'left:' + f(rnd(2, 98)) + '%;--w:-' + f(rnd(0, 7)) + 's;--x:' + f(rnd(-90, 90)) + 'px;--g:' + f(rnd(-180, 180)) + 'deg;--s:' + f(rnd(.7, 1.4)) + ';--d:' + f(rnd(6, 9)) + 's';
    }
    // lágrimas de luz que se vuelven estrellitas
    var lag = el('div', 'lagrimas');
    semilla = 23;
    for (var g = 0; g < 12; g++) {
      el('i', '', svg('-10 -14 20 28', '<g class="gota"><path d="M0 -12 C5 -4 7 2 7 5 A7 7 0 0 1 -7 5 C-7 2 -5 -4 0 -12Z" fill="#dff2ff" opacity=".85"/><ellipse cx="-2.4" cy="3" rx="1.6" ry="2.6" fill="#fff"/></g><g class="estrellita">' + destello(9, '#fff6d0') + '</g>'), lag)
        .style.cssText = 'left:' + f(rnd(10, 90)) + '%;--w:-' + f(rnd(0, 4)) + 's;--y:' + f(rnd(30, 60)) + 'vh';
    }
    // corazones que suben
    var cors = el('div', 'corazones');
    semilla = 29;
    for (var h2 = 0; h2 < 11; h2++) {
      el('i', '', svg('-16 -14 32 24', corazon(0, 0, 1.1, ['#ff4a7a', '#ff86aa', '#ffd27a', '#e8305a'][h2 % 4])), cors)
        .style.cssText = 'left:' + f(rnd(6, 94)) + '%;--w:-' + f(rnd(0, 5)) + 's;--x:' + f(rnd(-50, 50)) + 'px;--s:' + f(rnd(.7, 1.4));
    }
    // dos corazones que se juntan ("somos una sola persona")
    el('div', 'unidos u1', svg('-16 -14 32 24', corazon(0, 0, 1.1, '#ff4a7a')));
    el('div', 'unidos u2', svg('-16 -14 32 24', corazon(0, 0, 1.1, '#ffd27a')));
    el('div', 'unidos u3', svg('-16 -14 32 24', corazon(0, 0, 1.1, '#ff6a8a')));
    // mariposas
    var mar = el('div', 'mariposas');
    [['#ff86aa', '#ffd27a'], ['#ffd27a', '#ff5a7a'], ['#c8a0ff', '#ff86aa'], ['#ff5a7a', '#ffe6a8'], ['#ffb0d0', '#c8a0ff']].forEach(function (cc, i) {
      el('i', 'm' + i, mariposa(cc[0], cc[1]), mar);
    });
    // letrero de neón
    el('div', 'neon', svg('0 0 600 170',
      '<text x="300" y="98" text-anchor="middle" font-family="Lobster, cursive" font-size="96" fill="none" stroke="#ff3a9a" stroke-width="14" opacity=".28">Adolescent\'s</text>' +
      '<text x="300" y="98" text-anchor="middle" font-family="Lobster, cursive" font-size="96" fill="#fff0f8" stroke="#ff6ab8" stroke-width="2.5">Adolescent\'s</text>' +
      '<text x="300" y="150" text-anchor="middle" font-family="Lobster, cursive" font-size="40" fill="#e8f8ff" stroke="#3ad8ff" stroke-width="1.6" letter-spacing="10">ORQUESTA</text>'));
    // título del principio
    el('div', 'titulo', svg('0 0 460 170',
      '<text x="230" y="96" text-anchor="middle" font-family="Lobster, cursive" font-size="92" fill="#ffe6ec" stroke="#d81e4a" stroke-width="2.5">Virgen</text>' +
      '<text x="230" y="146" text-anchor="middle" font-family="\'Dancing Script\', cursive" font-weight="700" font-size="34" fill="#f2c46a">Adolescent\'s Orquesta</text>'));
    elFlash = el('div', 'flash');

    // el mouse mueve un poquito las capas (paralaje)
    var pend = false, mx = 0, my = 0;
    window.addEventListener('mousemove', function (e) {
      if (!activa) return;
      mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1;
      if (pend) return;
      pend = true;
      requestAnimationFrame(function () { pend = false; escena.style.setProperty('--px', mx.toFixed(3)); escena.style.setProperty('--py', my.toFixed(3)); });
    });
  }

  function flash() {
    elFlash.classList.remove('on');
    void elFlash.offsetWidth;
    elFlash.classList.add('on');
  }

  // ---- la escena sigue la letra ----
  var lineas = [];
  (window.LETRA_VIRGEN_LRC || '').split(/\r?\n/).forEach(function (l) {
    var m = l.match(/^\s*\[(\d+):(\d+(?:\.\d+)?)\](.*)$/);
    if (m) lineas.push({ t: +m[1] * 60 + +m[2], texto: m[3].trim().toLowerCase() });
  });
  function reaccionar() {
    if (!activa) return;
    var t = audio.currentTime, x = '', u = '';
    for (var i = 0; i < lineas.length; i++) {
      if (lineas[i].t <= t) { x = lineas[i].texto; if (x) u = x; } else break;
    }
    var e = {
      'inicio': t < 12.5,
      'llueve': t < 27.3,
      'llovizna': (t >= 27.3 && t < 57.75) || (t >= 100.27 && t < 105.23),
      'paraguas': t >= 33.74 && t < 57.75,
      'rosa-de-pie': t >= 52.76,
      'con-foto': t >= 57.75,
      'tiembla': /tiemblo/.test(x),
      'lagrimas': t >= 57 && /lloro|llores/.test(x),
      'rayos': /dios/.test(x),
      'petalos': /entrégate|adorarte|muere contigo|mi vida te doy|rosa más bella/.test(x),
      'latido': /siénteme|hasta mi vida|soy tuyo|cuerpo y alma/.test(x),
      'corazones': /nació para ti|vivo por ti|si yo te amo|así te amo|te amaré|enamorarte/.test(x),
      'nina': /niña de mi vida|linda querida/.test(u) && !(t >= 100.27 && t < 120.72) && t < 162.79,
      'marchita': t >= 100.27 && t < 105.23,
      'cupula': /cuidaré|protegeré|mi vida te doy/.test(x),
      'disco': (t >= 92.41 && t < 100.27) || (t >= 157.53 && t < 200.52) || (t >= 208.68 && t < 220.23),
      'por-dentro': /por dentro|nada había pasado/.test(x),
      'unidos': /una sola persona/.test(x),
      'bellas': t >= 190.32,
      'neon': (t >= 200.52 && t < 208.68) || t >= 269.34,
      'amanecer': t >= 230.92,
      'venas': t >= 239.15,
      'corona': t >= 243.23
    };
    // momentos de una sola vez: la rosa florece en el medallón, y se vuelve a levantar
    if (e['con-foto'] && antes['con-foto'] === false) { flash(); tBrota = t; }
    if (!e.marchita && antes.marchita && t >= 105) flash();
    e.brota = e['con-foto'] && t - tBrota < 3 && t >= tBrota;
    // (con prefijo vg- para no chocar con clases globales como .disco del menú)
    ESTADOS.forEach(function (c) { escena.classList.toggle('vg-' + c, !!e[c]); });
    antes = e;
  }
  audio.addEventListener('timeupdate', reaccionar);

  window.Escenas = window.Escenas || {};
  window.Escenas.virgen = {
    el: escena,
    activar: function () {
      if (!construida) construir();
      activa = true;
      window.SUB_ESPECIAL = SUBS;
      antes = {}; tBrota = -10;
      reaccionar();
    },
    desactivar: function () {
      activa = false;
      if (window.SUB_ESPECIAL === SUBS) window.SUB_ESPECIAL = null;
    }
  };
})();
