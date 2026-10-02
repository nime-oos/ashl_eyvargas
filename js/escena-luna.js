// Escena "Luna" (Zoé, MTV Unplugged): el escenario del unplugged redibujado con el estilo del álbum
// (pastel al óleo + marcador negro, 3 cuadros que "hierven", movimientos a saltitos).
// Escenario azul con cortinas, globos de luz naranja en pedestales, reflectores de cuadritos,
// alfombras persas, la banda tocando (guitarrista con tenis blancos, teclados, clavecín, la chica
// del teclado rojo, León en su banquito con guitarra y armónica, batería, contrabajo), una jaula
// con pajarito y una guitarra en su base. Un haz de luz sigue al mouse / dedo.
// La escena reacciona a lo que dice cada línea de la letra:
//   "luna"            → la luna sale grande sobre el escenario y León la mira
//   "cráteres"        → a la luna le laten los cráteres
//   "silencio"        → se apaga el escenario (solo queda la luna) y se abre el piso
//   "mares / volcán"  → sube el mar desde abajo y de la grieta saltan chispas
//   "motor"           → reflectores en estrobo, batería y guitarras a toda velocidad
//   "fiebre / fuego"  → los globos se ponen rojos y salen llamas al frente
//   "beso"            → suben corazones
//   "ojos"            → León y la luna abren los ojos y te miran
// Usa las herramientas de crayón de js/escena.js (window.Crayon); se construye la primera vez
// que se elige en el menú de canciones (js/menu.js).
(function () {
  var escena = document.getElementById('escena-luna');
  var audio = document.getElementById('bg-music');
  var C = window.Crayon;
  if (!escena || !audio || !C) return;
  var el = C.el, rnd = C.rnd, pick = C.pick, rayado = C.rayado, trazar = C.trazar, grano = C.grano;
  var CUADROS = C.CUADROS;
  var W = 1200, H = 800;
  var SVG = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;overflow:visible">';
  var L = 'class="linea" pathLength="1" fill="none" stroke="#161616" stroke-linecap="round" stroke-linejoin="round"';
  var K = 'stroke="#161616" stroke-linecap="round" stroke-linejoin="round"';
  var ESTADOS = ['en-luna', 'en-crateres', 'en-silencio', 'en-mares', 'en-motor', 'en-fuego', 'en-beso', 'en-ojos'];

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

  // ---- el foro: muro azul con cortinas, luz azul desde abajo, resplandor naranja, piso oscuro ----
  function pintarForo() {
    var lista = [];
    zona(lista, 160, -40, W + 40, -40, 520, ['#0d1a3a', '#12244f', '#1b3570', '#0a1430', '#1a2a5c'], { len: [80, 260], ancho: [8, 14], alfa: [.6, .9] });
    // pliegues de las cortinas
    for (var c = 0; c < 14; c++) {
      var xc = c * 90 + rnd(-10, 10);
      zona(lista, 8, xc - 10, xc + 10, -10, 480, ['#22356e', '#2a3f80', '#0c1636'], { ang: [1.5, 1.64], len: [150, 400], ancho: [4, 8], alfa: [.3, .6] });
    }
    // columnas de luz azul que suben desde el piso
    [150, 380, 610, 840, 1060].forEach(function (x) {
      zona(lista, 18, x - 50, x + 50, 280, 500, ['#2b5fb8', '#3f7fd8', '#5a8fe0', '#2a4fa0'], { ang: [1.45, 1.7], len: [80, 220], alfa: [.25, .55] });
    });
    // resplandor cálido de las lámparas a los lados
    zona(lista, 40, -20, 200, 100, 400, ['#c8743c', '#e8892e', '#8a3a1e', '#b05a2a'], { alfa: [.2, .45] });
    zona(lista, 25, 1080, W + 20, 170, 380, ['#c8743c', '#e8892e', '#8a3a1e', '#b05a2a'], { alfa: [.2, .45] });
    // piso del escenario
    zona(lista, 120, -40, W + 40, 470, H + 20, ['#1c2333', '#2a3245', '#11151f', '#232b3d', '#323a50'], { ang: [-.12, .12], len: [120, 360], ancho: [8, 14], alfa: [.55, .85] });
    zona(lista, 30, 200, 1000, 480, 560, ['#3f7fd8', '#2b5fb8'], { ang: [-.08, .08], len: [80, 240], alfa: [.12, .3] });

    var urls = [];
    for (var q = 0; q < CUADROS; q++) {
      var cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      var cx = cv.getContext('2d');
      cx.fillStyle = '#0a1128'; cx.fillRect(0, 0, W, H);
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

  // guitarra acústica acostada: cuerpo de 8, boca, puente, mástil y clavijero
  function guitarra(x, y, s) {
    var p = function (dx, dy) { return f(x + dx * s) + ' ' + f(y + dy * s); };
    return '<path d="M' + p(-70, 0) + ' C' + p(-70, -28) + ' ' + p(-36, -32) + ' ' + p(-20, -20) + ' C' + p(-4, -40) + ' ' + p(60, -40) + ' ' + p(60, 0) +
      ' C' + p(60, 40) + ' ' + p(-4, 40) + ' ' + p(-20, 20) + ' C' + p(-36, 32) + ' ' + p(-70, 28) + ' ' + p(-70, 0) + 'Z" fill="#d89a52" ' + K + ' stroke-width="3"/>' +
      '<path d="M' + p(-58, -6) + ' C' + p(-50, -22) + ' ' + p(-30, -20) + ' ' + p(-24, -14) + '" fill="none" stroke="#f0c890" stroke-width="' + f(5 * s) + '" opacity=".7"/>' +
      '<circle cx="' + f(x - 10 * s) + '" cy="' + f(y) + '" r="' + f(12 * s) + '" fill="#2a1a10" stroke="#8a5a2a" stroke-width="2"/>' +
      '<rect x="' + f(x + 30 * s) + '" y="' + f(y - 9 * s) + '" width="' + f(7 * s) + '" height="' + f(18 * s) + '" fill="#2a1a10"/>' +
      '<rect x="' + f(x - 190 * s) + '" y="' + f(y - 6 * s) + '" width="' + f(122 * s) + '" height="' + f(12 * s) + '" fill="#3a2418" ' + K + ' stroke-width="2"/>' +
      '<rect x="' + f(x - 214 * s) + '" y="' + f(y - 9 * s) + '" width="' + f(26 * s) + '" height="' + f(18 * s) + '" rx="3" fill="#2a1a10" ' + K + ' stroke-width="2"/>' +
      '<path d="M' + p(-190, -3) + ' L' + p(34, -3) + ' M' + p(-190, 0) + ' L' + p(34, 0) + ' M' + p(-190, 3) + ' L' + p(34, 3) + '" stroke="#e8e4da" stroke-width=".8"/>';
  }
  function corazon(x, y, s, i) {
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><g class="beso" style="--w:-' + (i * .3).toFixed(2) + 's;--x:' + rnd(-40, 40).toFixed(0) + 'px">' +
      '<g filter="url(#pastel)" clip-path="url(#lCor)"><image class="tex-rojo" href="' + tex.rojo[i % CUADROS] + '" x="-42" y="-36" width="84" height="70" preserveAspectRatio="none"/></g>' +
      '<path d="' + COR + '" fill="none" stroke="#161616" stroke-width="7" filter="url(#marcador)"/></g></g>';
  }
  var COR = 'M0 30 C-30 12 -40 -8 -32 -20 C-24 -32 -8 -30 0 -16 C8 -30 24 -32 32 -20 C40 -8 30 12 0 30Z';

  function construir() {
    construida = true;
    texFondo = pintarForo();
    tex.alfombraRoja = texSet('#8a2a22', ['#a8322a', '#6a1a16', '#c8573a', '#e0a070', '#3a1210'], 60);
    tex.alfombraBeige = texSet('#b89a74', ['#c9ab84', '#a08060', '#d8c0a0', '#8a6a4a'], 50);
    tex.alfombraAzul = texSet('#2f3478', ['#3a3f8a', '#22286a', '#5a4a9a', '#8a7ab8', '#1a1e50'], 55);
    tex.madera = texSet('#b07a42', ['#c89a62', '#8a5a2a', '#d8aa72', '#6a4220'], 30);
    tex.luna = texSet('#f3e9b8', ['#fff6d0', '#e8d898', '#f8f0c8', '#d9c98a', '#ffffff'], 45);
    tex.rojo = C.texRojo;

    mundo = el('mundo', escena);

    // ---- capa 1: el foro con globos de luz, reflectores, lámpara y jaula ----
    var globos = '';
    [[55, 150, 38], [300, 118, 24], [468, 92, 17], [790, 96, 19], [1010, 150, 26], [1165, 240, 32]].forEach(function (g, i) {
      globos += '<path d="M' + g[0] + ' ' + (g[1] + g[2]) + ' L' + (g[0] + rnd(-3, 3)).toFixed(0) + ' 505" stroke="#3a3f4a" stroke-width="4" stroke-linecap="round"/>' +
        '<g class="globo" style="--w:-' + rnd(0, 3).toFixed(2) + 's">' +
        '<circle cx="' + g[0] + '" cy="' + g[1] + '" r="' + f(g[2] * 3.4) + '" fill="url(#lGlobo)"/>' +
        '<circle class="halo-fuego" cx="' + g[0] + '" cy="' + g[1] + '" r="' + f(g[2] * 3.8) + '" fill="url(#lGloboRojo)"/>' +
        '<circle class="globo-luz" cx="' + g[0] + '" cy="' + g[1] + '" r="' + g[2] + '" fill="#f2a03a" stroke="#161616" stroke-width="2.5" filter="url(#marcador)"/>' +
        '<circle cx="' + f(g[0] - g[2] * .3) + '" cy="' + f(g[1] - g[2] * .3) + '" r="' + f(g[2] * .38) + '" fill="#ffe2a0" opacity=".85"/></g>';
    });
    var reflectores = '';
    [[360, 18], [655, 4], [1105, 52]].forEach(function (r, i) {
      reflectores += '<g class="reflector"><ellipse cx="' + (r[0] + 22) + '" cy="' + (r[1] + 26) + '" rx="70" ry="50" fill="url(#lReflector)"/>' +
        '<rect x="' + r[0] + '" y="' + r[1] + '" width="44" height="44" rx="4" fill="#2a2a30" stroke="#161616" stroke-width="3" filter="url(#marcador)"/>';
      for (var a = 0; a < 3; a++) for (var b = 0; b < 3; b++) {
        reflectores += '<rect class="foco" x="' + (r[0] + 4 + b * 13) + '" y="' + (r[1] + 4 + a * 13) + '" width="10" height="10" rx="2" fill="#f6f6f2" style="--w:-' + rnd(0, 5).toFixed(2) + 's"/>';
      }
      reflectores += '</g>';
    });
    var barrotes = '';
    for (var bx = 935; bx <= 975; bx += 10) barrotes += 'M' + bx + ' ' + (bx === 955 ? 104 : 116) + ' L' + bx + ' 208 ';

    el('capa capa-fondo', mundo).innerHTML = SVG +
      '<defs>' +
        '<radialGradient id="lGlobo"><stop offset="0" stop-color="#ffb860" stop-opacity=".7"/><stop offset=".35" stop-color="#e8892e" stop-opacity=".3"/><stop offset="1" stop-color="#e8892e" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="lGloboRojo"><stop offset="0" stop-color="#ff5a3a" stop-opacity=".8"/><stop offset=".4" stop-color="#e2502f" stop-opacity=".35"/><stop offset="1" stop-color="#e2502f" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="lReflector"><stop offset="0" stop-color="#ffffff" stop-opacity=".45"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>' +
      '</defs>' +
      '<image class="tex-fondo" href="' + texFondo[0] + '" x="0" y="0" width="' + W + '" height="' + H + '" preserveAspectRatio="none"/>' +
      // pliegues de cortina con marcador
      '<g filter="url(#marcador)" stroke="#0a1022" stroke-width="3" fill="none" opacity=".7">' +
        '<path d="M90 0 C84 160 96 320 88 480 M240 0 C248 170 236 330 244 470 M520 0 C514 150 526 320 518 470 M760 0 C766 160 754 330 762 470 M960 0 C952 150 964 320 958 480 M1130 0 C1138 160 1126 320 1134 480"/></g>' +
      '<path d="M-20 488 C300 482 900 480 1220 486" stroke="#0a1022" stroke-width="5" fill="none" filter="url(#marcador)"/>' +
      reflectores + globos +
      // lámpara de mesa a la izquierda
      '<g class="lampara"><ellipse cx="42" cy="300" rx="90" ry="70" fill="url(#lGlobo)"/></g>' +
      '<g filter="url(#marcador)"><path d="M12 258 L72 258 L84 296 L0 296Z" fill="#f2e2b8" ' + K + ' stroke-width="3"/>' +
        '<path d="M42 296 L42 342" stroke="#3a2418" stroke-width="5"/><path d="M-10 342 L96 342 L92 400 L-6 400Z" fill="#3a2418" ' + K + ' stroke-width="3"/>' +
        '<path d="M-6 400 L-4 500 M90 400 L88 500" stroke="#3a2418" stroke-width="6"/></g>' +
      // jaula dorada con pajarito
      '<g filter="url(#marcador)"><path d="M955 40 L955 100" stroke="#8a7a4a" stroke-width="2"/>' +
        '<path d="M925 208 L925 140 C925 96 985 96 985 140 L985 208" fill="rgba(201,162,74,.12)" stroke="#c9a24a" stroke-width="3.5"/>' +
        '<path d="' + barrotes + '" stroke="#c9a24a" stroke-width="2"/>' +
        '<rect x="918" y="206" width="74" height="9" fill="#c9a24a" stroke="#161616" stroke-width="2"/>' +
        '<path d="M932 182 H978" stroke="#8a6a3a" stroke-width="3"/>' +
        '<g class="pajaro"><path d="M948 180 C946 170 954 164 962 168 L968 166 L964 172 C966 178 960 182 948 180Z" fill="#e8c34a" ' + K + ' stroke-width="1.8"/><circle cx="961" cy="170" r="1.3" fill="#161616"/></g>' +
        '<path d="M955 215 L955 500" stroke="#3a3f4a" stroke-width="4"/></g>' +
    '</svg>';

    // ---- capa 2: alfombras, grieta y la banda ----
    var RUG1 = 'M-20 560 C100 552 220 546 330 540 L470 805 L-20 805Z';
    var RUG2 = 'M330 500 C500 494 680 490 840 492 L905 640 C720 648 540 650 375 652Z';
    var RUG3 = 'M640 610 C820 596 1000 584 1220 572 L1220 805 L700 805Z';
    var rombos = '';
    [[110, 640], [240, 618], [170, 720], [320, 700], [60, 760], [390, 780]].forEach(function (r) {
      rombos += 'M' + r[0] + ' ' + (r[1] - 26) + ' L' + (r[0] + 30) + ' ' + r[1] + ' L' + r[0] + ' ' + (r[1] + 26) + ' L' + (r[0] - 30) + ' ' + r[1] + 'Z ' +
        'M' + r[0] + ' ' + (r[1] - 12) + ' L' + (r[0] + 14) + ' ' + r[1] + ' L' + r[0] + ' ' + (r[1] + 12) + ' L' + (r[0] - 14) + ' ' + r[1] + 'Z ';
    });
    var olasAlfombra = '';
    for (var k = 0; k < 8; k++) {
      var yo = 612 + k * 26, d = 'M640 ' + yo + ' Q680 ' + (yo - 13) + ' 720 ' + yo;
      for (var xo = 800; xo <= 1280; xo += 80) d += ' T' + xo + ' ' + yo;
      olasAlfombra += d + ' ';
    }
    var grieta = 'M300 805 L340 762 L322 734 L382 714 L366 690 L432 672 L420 650 L500 632 L492 612 L560 598';
    var chispas = '';
    [[330, 750], [350, 720], [400, 700], [430, 672], [460, 660], [500, 632], [530, 610], [372, 706], [318, 770], [548, 600]].forEach(function (c, i) {
      chispas += '<circle class="chispa" cx="' + c[0] + '" cy="' + c[1] + '" r="' + rnd(3, 6).toFixed(1) + '" fill="' + pick(['#f3c15a', '#e2502f', '#ff8a3a']) +
        '" style="--w:-' + rnd(0, 1.4).toFixed(2) + 's;--x:' + rnd(-30, 30).toFixed(0) + 'px"/>';
    });
    var teclas = function (x, y, w) {
      var d = '';
      for (var t = x + 5; t < x + w - 3; t += 7) if ((t - x) % 49 !== 26) d += 'M' + t + ' ' + y + ' V' + (y + 5) + ' ';
      return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="8" fill="#f2f0ea"/><path d="' + d + '" stroke="#161616" stroke-width="2.5"/>';
    };

    el('capa capa-pared', mundo).innerHTML = SVG +
      '<defs><clipPath id="lRug1"><path d="' + RUG1 + '"/></clipPath><clipPath id="lRug2"><path d="' + RUG2 + '"/></clipPath><clipPath id="lRug3"><path d="' + RUG3 + '"/></clipPath>' +
        '<clipPath id="lClave"><path d="M370 312 L540 306 L548 356 L374 362Z"/></clipPath></defs>' +
      // alfombras persas
      '<g class="alfombras">' +
        '<g clip-path="url(#lRug1)"><g filter="url(#pastel)">' + imagen('alfombraRoja', -30, 530, 510, 290) + '</g>' +
          '<path d="M6 584 L318 564 L440 805 M24 610 L300 590 L410 805" fill="none" stroke="#e8c9a0" stroke-width="4" filter="url(#marcador)"/>' +
          '<path d="' + rombos + '" fill="none" stroke="#e8c9a0" stroke-width="3" filter="url(#marcador)"/></g>' +
        '<path ' + L + ' stroke-width="4" filter="url(#marcador)" d="' + RUG1 + '"/>' +
        '<g clip-path="url(#lRug2)"><g filter="url(#pastel)">' + imagen('alfombraBeige', 320, 486, 600, 170) + '</g>' +
          '<path d="M352 512 C500 506 680 502 826 504 L880 630 C720 636 540 638 390 640Z" fill="none" stroke="#6a4a2a" stroke-width="3" filter="url(#marcador)"/>' +
          '<ellipse cx="615" cy="572" rx="96" ry="30" fill="#8a2a22" opacity=".55" stroke="#6a4a2a" stroke-width="3" filter="url(#marcador)"/>' +
          '<ellipse cx="615" cy="572" rx="46" ry="14" fill="none" stroke="#e8c9a0" stroke-width="3" filter="url(#marcador)"/></g>' +
        '<path ' + L + ' stroke-width="4" filter="url(#marcador)" d="' + RUG2 + '"/>' +
        '<g clip-path="url(#lRug3)"><g filter="url(#pastel)">' + imagen('alfombraAzul', 630, 560, 600, 250) + '</g>' +
          '<path d="' + olasAlfombra + '" fill="none" stroke="#e8d6a8" stroke-width="3" opacity=".8" filter="url(#marcador)"/></g>' +
        '<path ' + L + ' stroke-width="4" filter="url(#marcador)" d="' + RUG3 + '"/>' +
      '</g>' +
      // la grieta que se abre en "silencio, se abre la tierra"
      '<g class="grieta-g"><path class="grieta-lava" d="' + grieta + '" fill="none" stroke="#e8892e" stroke-width="18" stroke-linejoin="round" filter="url(#pastel)"/>' +
        '<path class="grieta" pathLength="1" d="' + grieta + '" fill="none" stroke="#161616" stroke-width="7" stroke-linejoin="round" filter="url(#marcador)"/></g>' +

      // ---- teclados con el tecladista de gorro ----
      '<g filter="url(#marcador)">' +
        '<g class="cabecea" style="--w:-.4s"><path d="M248 300 C250 276 300 276 302 300 L306 340 L244 340Z" fill="#26262e" ' + K + ' stroke-width="3"/>' +
          '<circle cx="275" cy="262" r="17" fill="#c88d66" ' + K + ' stroke-width="2.5"/>' +
          '<path d="M257 260 C256 236 294 236 293 260Z" fill="#2a2a33" ' + K + ' stroke-width="2.5"/>' +
          '<path d="M268 268 h3 M280 268 h3" stroke="#161616" stroke-width="2"/></g>' +
        '<path d="M195 350 L360 470 M360 350 L195 470" stroke="#3a3f4a" stroke-width="5"/>' +
        '<rect x="300" y="282" width="48" height="16" fill="#d9d4c4" ' + K + ' stroke-width="2.5"/>' +
        '<circle cx="310" cy="290" r="3" fill="#c8332a"/><circle cx="322" cy="290" r="3" fill="#2b5fb8"/><circle cx="334" cy="290" r="3" fill="#e8c34a"/>' +
        '<rect x="200" y="300" width="150" height="16" fill="#a8322a" ' + K + ' stroke-width="3"/>' + teclas(206, 304, 138) +
        '<rect x="180" y="330" width="190" height="20" fill="#1b1b1f" ' + K + ' stroke-width="3"/>' + teclas(186, 335, 178) +
      '</g>' +

      // ---- clavecín de madera con el organista de lentes ----
      '<g filter="url(#marcador)">' +
        '<g class="cabecea" style="--w:-1.1s"><path d="M412 290 C414 266 466 266 468 290 L472 330 L408 330Z" fill="#3a3a44" ' + K + ' stroke-width="3"/>' +
          '<circle cx="440" cy="252" r="16" fill="#e6b48c" ' + K + ' stroke-width="2.5"/>' +
          '<path d="M424 250 C422 230 458 230 456 250 C450 242 432 242 424 250Z" fill="#3a2a20" ' + K + ' stroke-width="2"/>' +
          '<path d="M428 252 h10 v7 h-10Z M443 252 h10 v7 h-10Z M438 255 h5" fill="rgba(255,255,255,.35)" stroke="#161616" stroke-width="2"/></g>' +
      '</g>' +
      '<g filter="url(#pastel)" clip-path="url(#lClave)">' + imagen('madera', 366, 300, 186, 66) + '</g>' +
      '<g filter="url(#marcador)"><path ' + L + ' stroke-width="3.5" d="M370 312 L540 306 L548 356 L374 362Z M372 330 L544 324"/>' +
        '<rect x="392" y="312" width="130" height="7" fill="#f2f0ea" stroke="#161616" stroke-width="1.5"/>' +
        '<path d="M382 362 L386 478 M540 356 L536 478" stroke="#5a3a22" stroke-width="7" stroke-linecap="round"/></g>' +

      // ---- contrabajo ----
      '<g filter="url(#marcador)"><path d="M612 168 L612 254" stroke="#2a1a10" stroke-width="6" stroke-linecap="round"/><circle cx="612" cy="164" r="6" fill="#5a3a22" ' + K + ' stroke-width="2"/>' +
        '<path d="M612 250 C590 250 584 274 596 290 C578 308 580 352 612 358 C644 352 646 308 628 290 C640 274 634 250 612 250Z" fill="#8a4a2a" ' + K + ' stroke-width="3"/>' +
        '<path d="M601 296 C597 306 601 316 597 324 M623 296 C627 306 623 316 627 324" stroke="#161616" stroke-width="2" fill="none"/>' +
        '<path d="M612 358 L612 380" stroke="#5a5f66" stroke-width="3"/></g>' +

      // ---- batería con "Zoé" en el bombo ----
      '<g filter="url(#marcador)">' +
        '<path d="M822 282 L830 480 M988 266 L984 480 M792 334 L796 480" stroke="#8a9095" stroke-width="3"/>' +
        '<g class="cabecea" style="--w:-.2s"><path d="M878 262 C880 242 930 242 932 262 L936 330 L874 330Z" fill="#2a2a33" ' + K + ' stroke-width="3"/>' +
          '<circle cx="905" cy="226" r="17" fill="#c88d66" ' + K + ' stroke-width="2.5"/>' +
          '<path d="M888 222 C886 202 924 202 922 222 C914 214 896 214 888 222Z" fill="#1e1410" ' + K + ' stroke-width="2"/></g>' +
        '<g class="baqueta"><path d="M884 270 L860 304" stroke="#2a2a33" stroke-width="8" stroke-linecap="round"/><path d="M860 304 L828 296" stroke="#e8d6a8" stroke-width="3" stroke-linecap="round"/></g>' +
        '<g class="baqueta der"><path d="M926 270 L950 304" stroke="#2a2a33" stroke-width="8" stroke-linecap="round"/><path d="M950 304 L982 292" stroke="#e8d6a8" stroke-width="3" stroke-linecap="round"/></g>' +
        '<g class="platillo" style="--w:-.3s"><ellipse cx="822" cy="280" rx="36" ry="7" fill="#d4a84a" ' + K + ' stroke-width="2.5"/></g>' +
        '<g class="platillo" style="--w:-.7s"><ellipse cx="988" cy="262" rx="40" ry="8" fill="#d4a84a" ' + K + ' stroke-width="2.5"/></g>' +
        '<g class="platillo" style="--w:-.1s"><ellipse cx="792" cy="330" rx="26" ry="5" fill="#d4a84a" ' + K + ' stroke-width="2"/><ellipse cx="792" cy="337" rx="26" ry="5" fill="#c09640" ' + K + ' stroke-width="2"/></g>' +
        '<path d="M848 312 L848 334 C848 342 892 342 892 334 L892 312" fill="#a8322a" ' + K + ' stroke-width="2.5"/><ellipse cx="870" cy="312" rx="22" ry="8" fill="#ece6d4" ' + K + ' stroke-width="2.5"/>' +
        '<path d="M916 312 L916 334 C916 342 960 342 960 334 L960 312" fill="#a8322a" ' + K + ' stroke-width="2.5"/><ellipse cx="938" cy="312" rx="22" ry="8" fill="#ece6d4" ' + K + ' stroke-width="2.5"/>' +
        '<path d="M816 350 L816 364 C816 372 862 372 862 364 L862 350" fill="#b9bfc4" ' + K + ' stroke-width="2.5"/><ellipse cx="839" cy="350" rx="23" ry="7" fill="#ece6d4" ' + K + ' stroke-width="2.5"/>' +
        '<path d="M818 370 L810 470 M860 370 L868 470" stroke="#8a9095" stroke-width="3"/>' +
        '<path d="M958 372 L958 412 C958 422 1014 422 1014 412 L1014 372" fill="#a8322a" ' + K + ' stroke-width="2.5"/><ellipse cx="986" cy="372" rx="28" ry="9" fill="#ece6d4" ' + K + ' stroke-width="2.5"/>' +
        '<path d="M962 418 L958 470 M1010 418 L1014 470" stroke="#8a9095" stroke-width="3"/>' +
        '<g class="bombo"><circle cx="910" cy="404" r="48" fill="#ece6d4" ' + K + ' stroke-width="4"/><circle cx="910" cy="404" r="42" fill="none" stroke="#a8322a" stroke-width="5"/>' +
          '<path d="M926 384 C912 380 900 392 904 404 C908 414 920 416 928 410 C916 410 908 396 926 384Z" fill="#e8c34a" stroke="#161616" stroke-width="1.5"/>' +
          '<text x="896" y="428" text-anchor="middle" font-family="Fredoka, \'Arial Rounded MT Bold\', sans-serif" font-weight="700" font-size="22" fill="#161616">Zoé</text></g>' +
        '<path d="M876 440 L862 476 M944 440 L958 476" stroke="#8a9095" stroke-width="3"/>' +
      '</g>' +

      // ---- guitarra en su base ----
      '<g filter="url(#marcador)"><path d="M1120 508 L1094 548 M1120 508 L1146 548 M1104 440 L1100 400" stroke="#3a3f4a" stroke-width="4" stroke-linecap="round"/>' +
        '<rect x="1115" y="300" width="10" height="90" fill="#3a2418" ' + K + ' stroke-width="2"/><rect x="1111" y="280" width="18" height="22" rx="3" fill="#2a1a10" ' + K + ' stroke-width="2"/>' +
        '<path d="M1120 385 C1145 385 1152 410 1142 428 C1170 440 1168 505 1120 508 C1072 505 1070 440 1098 428 C1088 410 1095 385 1120 385Z" fill="#c27a3a" ' + K + ' stroke-width="3"/>' +
        '<circle cx="1120" cy="446" r="10" fill="#2a1a10"/><rect x="1110" y="478" width="20" height="5" fill="#2a1a10"/></g>' +

      // ---- la chica del teclado rojo ----
      '<g filter="url(#marcador)">' +
        '<path d="M522 420 L516 546 M558 420 L564 546 M520 490 H560" stroke="#5a3a22" stroke-width="4" stroke-linecap="round"/>' +
        '<ellipse cx="540" cy="418" rx="26" ry="7" fill="#5a3a22" ' + K + ' stroke-width="2.5"/>' +
        '<path d="M548 546 L548 300 L560 288" stroke="#5a5f66" stroke-width="3" fill="none"/>' +
        '<g class="mece">' +
          '<path d="M524 408 L512 478 L514 540 M552 408 L564 478 L560 540" stroke="#141418" stroke-width="10" stroke-linecap="round" fill="none"/>' +
          '<ellipse cx="510" cy="544" rx="11" ry="5" fill="#2a1a14"/><ellipse cx="564" cy="544" rx="11" ry="5" fill="#2a1a14"/>' +
          '<path d="M518 292 C520 280 562 280 564 292 L572 412 L510 412Z" fill="#141418" ' + K + ' stroke-width="3"/>' +
          '<path d="M522 270 C516 232 568 232 561 270 L566 308 C560 302 556 296 556 284 C548 262 536 262 527 284 C527 296 522 302 516 308Z" fill="#5a3a24" ' + K + ' stroke-width="2.5"/>' +
          '<circle cx="541" cy="266" r="15" fill="#f0c4a0" ' + K + ' stroke-width="2.5"/>' +
          '<path d="M526 262 C528 246 554 246 557 262 C548 256 536 256 526 262Z" fill="#5a3a24"/>' +
          '<path d="M533 268 q3 2 6 0 M544 268 q3 2 6 0 M538 276 q3 1.5 6 0" stroke="#161616" stroke-width="1.6" fill="none"/>' +
          '<path d="M520 300 L512 360 L520 370 M562 300 L570 360 L560 370" stroke="#141418" stroke-width="8" stroke-linecap="round" fill="none"/>' +
          '<circle cx="520" cy="370" r="5" fill="#f0c4a0"/><circle cx="560" cy="370" r="5" fill="#f0c4a0"/>' +
        '</g>' +
        '<ellipse cx="561" cy="286" rx="4" ry="8" fill="#2a2a30" transform="rotate(40 561 286)"/>' +
        '<path d="M506 380 L576 450 M576 380 L506 450" stroke="#3a3f4a" stroke-width="4"/>' +
        '<rect x="500" y="366" width="80" height="14" fill="#c8332a" ' + K + ' stroke-width="2.5"/>' + teclas(504, 369, 72) +
      '</g>' +

      // ---- León en su banquito: guitarra, armónica y el pelo tapándole los ojos ----
      '<g filter="url(#marcador)">' +
        '<path d="M676 438 L666 566 M712 438 L722 566 M670 506 H718" stroke="#8a9095" stroke-width="4" stroke-linecap="round"/>' +
        '<ellipse cx="694" cy="432" rx="36" ry="12" fill="#e8892e" ' + K + ' stroke-width="3"/>' +
        '<path d="M662 432 C670 440 718 440 726 432 M670 426 C680 432 708 432 718 426" stroke="#5a4a9a" stroke-width="3" fill="none"/>' +
        '<path d="M652 566 L656 296 L674 270" stroke="#5a5f66" stroke-width="3" fill="none"/>' +
        '<path d="M676 418 L704 480 L690 554 M708 418 L744 470 L734 554" stroke="#1e2230" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
        '<ellipse cx="688" cy="560" rx="13" ry="5" fill="#0d0d10"/><ellipse cx="736" cy="560" rx="13" ry="5" fill="#0d0d10"/>' +
        '<path d="M664 284 C668 270 714 270 718 284 L726 420 L660 420Z" fill="#1e2230" ' + K + ' stroke-width="3"/>' +
        '<path d="M682 274 L691 298 L700 274Z" fill="#e8e4da"/>' +
        '<g class="cabeza-leon">' +
          '<circle cx="691" cy="254" r="19" fill="#d9a27a" ' + K + ' stroke-width="2.5"/>' +
          '<g class="ojos-leon"><circle cx="684" cy="259" r="3.6" fill="#fff" stroke="#161616" stroke-width=".8"/><circle cx="699" cy="259" r="3.6" fill="#fff" stroke="#161616" stroke-width=".8"/>' +
            '<g class="pup"><circle cx="684" cy="259" r="2" fill="#161616"/><circle cx="699" cy="259" r="2" fill="#161616"/></g></g>' +
          '<path d="M668 264 C656 236 668 212 690 216 C710 208 728 228 718 250 C724 260 716 270 712 262 C708 252 702 256 698 250 C692 258 682 252 678 258 C674 262 672 270 668 264Z" fill="#1a1412" ' + K + ' stroke-width="2.5"/>' +
          '<rect x="680" y="268" width="22" height="6" rx="1.5" fill="#b9bfc4" ' + K + ' stroke-width="1.5"/>' +
          '<path d="M678 274 C668 284 670 298 676 304 M704 274 C714 284 712 298 706 304" stroke="#8a9095" stroke-width="2" fill="none"/>' +
        '</g>' +
        '<ellipse cx="672" cy="268" rx="4" ry="7" fill="#2a2a30" transform="rotate(60 672 268)"/>' +
        '<path d="M668 292 L632 340 L585 363" stroke="#1e2230" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
        '<g transform="rotate(14 700 395)">' + guitarra(700, 395, .85) + '<circle cx="581" cy="392" r="7" fill="#d9a27a" ' + K + ' stroke-width="1.5"/></g>' +
        '<g class="rasguea"><path d="M716 296 L742 360 L724 394" stroke="#1e2230" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="724" cy="396" r="7" fill="#d9a27a" ' + K + ' stroke-width="1.5"/></g>' +
      '</g>' +

      // ---- el guitarrista de la izquierda, tenis blancos ----
      '<g filter="url(#marcador)">' +
        '<path d="M100 470 L94 574 M140 470 L144 574 M97 524 H143" stroke="#3a3f4a" stroke-width="4" stroke-linecap="round"/>' +
        '<ellipse cx="120" cy="468" rx="26" ry="7" fill="#3a3f4a" ' + K + ' stroke-width="2.5"/>' +
        '<path d="M104 455 L160 476 L166 560 M134 455 L190 466 L198 550" stroke="#2a3346" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
        '<ellipse cx="170" cy="564" rx="15" ry="6" fill="#f2f0ea" ' + K + ' stroke-width="2"/><ellipse cx="204" cy="554" rx="15" ry="6" fill="#f2f0ea" ' + K + ' stroke-width="2"/>' +
        '<path d="M92 352 C96 338 140 338 144 352 L150 460 L88 460Z" fill="#8a9098" ' + K + ' stroke-width="3"/>' +
        '<g class="cabecea" style="--w:-.8s"><circle cx="118" cy="318" r="18" fill="#e6b48c" ' + K + ' stroke-width="2.5"/>' +
          '<path d="M100 316 C98 294 138 294 136 316 C128 306 108 306 100 316Z" fill="#2a1a14" ' + K + ' stroke-width="2"/>' +
          '<path d="M110 322 h4 M122 322 h4" stroke="#161616" stroke-width="2"/></g>' +
        '<path d="M140 360 L190 410 L223 425" stroke="#8a9098" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
        '<g transform="rotate(-10 110 445) translate(110 445) scale(-.78 .78) translate(-110 -445)">' + guitarra(110, 445, 1) + '</g>' +
        '<circle cx="223" cy="425" r="6" fill="#e6b48c" ' + K + ' stroke-width="1.5"/>' +
        '<g class="rasguea2"><path d="M96 362 L72 420 L84 446" stroke="#8a9098" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="85" cy="448" r="6" fill="#e6b48c" ' + K + ' stroke-width="1.5"/></g>' +
        '<rect x="214" y="590" width="96" height="20" rx="3" fill="#1b1b1f" ' + K + ' stroke-width="2.5"/>' +
        '<rect x="222" y="594" width="18" height="12" fill="#c8332a"/><rect x="246" y="594" width="18" height="12" fill="#2b5fb8"/><rect x="270" y="594" width="18" height="12" fill="#e8c34a"/>' +
        '<path d="M310 600 C350 620 340 650 400 640" stroke="#0d0d10" stroke-width="3" fill="none"/>' +
      '</g>' +
      '<g class="chispas">' + chispas + '</g>' +
      '<rect class="tinte-fuego" x="-100" y="-100" width="1400" height="1000" fill="#e2502f"/>' +
      '<rect class="apagon" x="-100" y="-100" width="1400" height="1000" fill="#03050d"/>' +
    '</svg>';

    // ---- capa 3: la luna (va aparte para que no le afecte el apagón) ----
    var crateres = '';
    [[-34, -28, 11], [30, -34, 8], [-38, 18, 7], [36, 22, 10], [0, -46, 5], [10, 42, 6]].forEach(function (c, i) {
      crateres += '<circle class="crater" cx="' + (610 + c[0]) + '" cy="' + (135 + c[1]) + '" r="' + c[2] + '" fill="#d9c98a" stroke="#8a7a4a" stroke-width="2" style="--w:-' + (i * .13).toFixed(2) + 's"/>';
    });
    el('capa capa-luna', mundo).innerHTML = SVG +
      '<defs><clipPath id="lLuna"><circle cx="610" cy="135" r="62"/></clipPath>' +
        '<radialGradient id="lHaloLuna"><stop offset=".3" stop-color="#fff6d0" stop-opacity=".5"/><stop offset="1" stop-color="#fff6d0" stop-opacity="0"/></radialGradient></defs>' +
      '<g transform="translate(0 28)"><g class="luna"><g class="luna-flota">' +
        '<circle class="luna-halo" cx="610" cy="135" r="190" fill="url(#lHaloLuna)"/>' +
        '<g filter="url(#pastel)" clip-path="url(#lLuna)">' + imagen('luna', 546, 71, 128, 128) + '</g>' +
        crateres +
        '<circle cx="610" cy="135" r="62" fill="none" stroke="#161616" stroke-width="4" filter="url(#marcador)"/>' +
        '<g class="luna-ojos"><g class="luna-parpado"><ellipse cx="592" cy="130" rx="8" ry="10" fill="#fff" stroke="#161616" stroke-width="2"/><ellipse cx="628" cy="130" rx="8" ry="10" fill="#fff" stroke="#161616" stroke-width="2"/>' +
          '<circle cx="595" cy="135" r="4.5" fill="#161616"/><circle cx="631" cy="135" r="4.5" fill="#161616"/></g>' +
          '<path d="M600 156 Q610 164 620 156" fill="none" stroke="#161616" stroke-width="2.5" stroke-linecap="round"/>' +
          '<circle cx="582" cy="152" r="6" fill="#e8765a" opacity=".55"/><circle cx="638" cy="152" r="6" fill="#e8765a" opacity=".55"/></g>' +
      '</g></g></g>' +
    '</svg>';

    // ---- capa 4: el frente (haz de luz, pufs, cables, mar, llamas, corazones, título) ----
    var llamas = '';
    for (var l = 0; l < 13; l++) {
      var lx = 20 + l * 96 + rnd(-20, 20), lh = rnd(110, 180), yb = 780;
      llamas += '<g class="llama" style="--w:-' + rnd(0, .5).toFixed(2) + 's">' +
        '<path d="M' + f(lx - 34) + ' ' + yb + ' C' + f(lx - 36) + ' ' + f(yb - 50) + ' ' + f(lx - 8) + ' ' + f(yb - lh * .6) + ' ' + f(lx) + ' ' + f(yb - lh) +
        ' C' + f(lx + 8) + ' ' + f(yb - lh * .6) + ' ' + f(lx + 36) + ' ' + f(yb - 50) + ' ' + f(lx + 34) + ' ' + yb + 'Z" fill="' + pick(['#e2502f', '#c8332a', '#e8892e']) + '" stroke="#161616" stroke-width="3"/>' +
        '<path d="M' + f(lx - 16) + ' ' + yb + ' C' + f(lx - 18) + ' ' + f(yb - 30) + ' ' + f(lx - 4) + ' ' + f(yb - lh * .4) + ' ' + f(lx) + ' ' + f(yb - lh * .55) +
        ' C' + f(lx + 4) + ' ' + f(yb - lh * .4) + ' ' + f(lx + 18) + ' ' + f(yb - 30) + ' ' + f(lx + 16) + ' ' + yb + 'Z" fill="#f3c15a"/></g>';
    }
    var mares = '';
    ['#1b3570', '#2b5fb8', '#3f7fd8'].forEach(function (col, i) {
      var y0 = 680 + i * 42, d = 'M-60 ' + y0 + ' Q-10 ' + (y0 - 26) + ' 40 ' + y0;
      for (var x = 140; x <= 1360; x += 100) d += ' T' + x + ' ' + y0;
      mares += '<g class="ola" style="--w:-' + (i * .7).toFixed(1) + 's"><path d="' + d + ' L1360 840 L-60 840Z" fill="' + col + '" opacity=".92" stroke="#dfeaf5" stroke-width="4"/></g>';
    });
    var besos = '';
    [[540, 230, .5], [600, 250, .4], [690, 210, .55], [740, 250, .42], [500, 270, .38], [650, 280, .45], [570, 200, .35], [720, 300, .4]].forEach(function (b, i) {
      besos += corazon(b[0], b[1], b[2], i);
    });

    el('capa capa-frente', mundo).innerHTML = SVG +
      '<defs><linearGradient id="lHaz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffdf2" stop-opacity=".28"/><stop offset="1" stop-color="#fffdf2" stop-opacity=".04"/></linearGradient>' +
        '<clipPath id="lCor"><path d="' + COR + '"/></clipPath></defs>' +
      '<g class="haz"><path d="M615 -40 L470 820 L760 820Z" fill="url(#lHaz)"/></g>' +
      // pufs de rayas
      '<g filter="url(#marcador)">' +
        '<path d="M392 768 L392 800 C392 830 552 830 552 800 L552 768" fill="#c8573a" ' + K + ' stroke-width="3.5"/>' +
        '<path d="M392 784 C420 800 524 800 552 784" stroke="#5a4a9a" stroke-width="6" fill="none"/>' +
        '<ellipse cx="472" cy="768" rx="80" ry="26" fill="#e8892e" ' + K + ' stroke-width="3.5"/>' +
        '<ellipse cx="472" cy="768" rx="58" ry="18" fill="none" stroke="#5a4a9a" stroke-width="5"/><ellipse cx="472" cy="768" rx="34" ry="10" fill="none" stroke="#e8d6a8" stroke-width="5"/><ellipse cx="472" cy="768" rx="12" ry="4" fill="#c8332a"/>' +
        '<path d="M962 702 L962 724 C962 744 1062 744 1062 724 L1062 702" fill="#5a4a9a" ' + K + ' stroke-width="3"/>' +
        '<ellipse cx="1012" cy="702" rx="50" ry="17" fill="#8a7ab8" ' + K + ' stroke-width="3"/>' +
        '<ellipse cx="1012" cy="702" rx="32" ry="10" fill="none" stroke="#e8892e" stroke-width="4"/><ellipse cx="1012" cy="702" rx="14" ry="4" fill="none" stroke="#e8d6a8" stroke-width="4"/>' +
        '<path d="M580 805 C620 760 700 790 760 740 S880 720 940 690" stroke="#0d0d10" stroke-width="4" fill="none"/>' +
      '</g>' +
      '<g class="mares" filter="url(#pastel)">' + mares + '</g>' +
      '<g class="llamas" filter="url(#pastel)">' + llamas + '</g>' +
      '<g class="besos">' + besos + '</g>' +
      // título pintado abajo a la izquierda, con una lunita
      '<g class="firma">' +
        '<text x="104" y="630" font-family="Caveat, cursive" font-weight="700" font-size="26" fill="#f3c15a" transform="rotate(-4 104 630)" filter="url(#marcador)">Zoé · unplugged</text>' +
        '<g class="titulo" filter="url(#pastel)" fill="#f3e9b8" stroke="#161616" stroke-width="2.5" paint-order="stroke" font-family="Fredoka, \'Arial Rounded MT Bold\', sans-serif" font-weight="700">' +
          letra('L', 104, 696, 66, -5, 0) + letra('u', 150, 690, 54, 4, 1) + letra('N', 190, 698, 64, -3, 2) + letra('a', 240, 692, 56, 5, 3) +
        '</g>' +
        '<path d="M312 640 C280 646 276 694 314 702 C282 712 258 690 262 666 C266 646 290 634 312 640Z" fill="#f3e9b8" stroke="#161616" stroke-width="2.5" filter="url(#marcador)"/>' +
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

    // parallax 3D + el haz de luz y los ojos de León siguen al mouse / dedo
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
  (window.LETRA_LUNA_LRC || '').split(/\r?\n/).forEach(function (l) {
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
    escena.classList.toggle('en-luna', /luna|abandones|recuperarme|cráteres/.test(texto));
    escena.classList.toggle('en-crateres', /cráteres/.test(texto));
    escena.classList.toggle('en-silencio', /silencio/.test(texto));
    escena.classList.toggle('en-mares', /mares|volcán/.test(texto));
    escena.classList.toggle('en-motor', /motor/.test(texto));
    escena.classList.toggle('en-fuego', /fiebre|fuego|consumir/.test(texto));
    escena.classList.toggle('en-beso', /beso|morir/.test(texto));
    escena.classList.toggle('en-ojos', /ojos/.test(texto));
  }
  function limpiar() { ESTADOS.forEach(function (c) { escena.classList.remove(c); }); ultima = null; }
  audio.addEventListener('timeupdate', reaccionar);
  audio.addEventListener('ended', limpiar);

  window.Escenas = window.Escenas || {};
  window.Escenas.luna = {
    el: escena,
    activar: function () {
      if (!construida) construir();
      activa = true;
      limpiar();
      clearInterval(timer);
      timer = setInterval(hervir, C.FPS_DIBUJO);
      hervir();
      // las líneas de marcador se dibujan solas al llegar al escenario
      escena.classList.remove('dibujando');
      void escena.offsetWidth;
      escena.classList.add('dibujando');
    },
    desactivar: function () { activa = false; clearInterval(timer); }
  };
})();
