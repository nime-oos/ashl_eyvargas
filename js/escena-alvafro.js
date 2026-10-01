// Escena "Piensas en mí" (LATIN MAFIA, Fred again..): el estudio de la portada redibujado con el estilo
// del álbum (pastel al óleo + marcador negro, 3 cuadros que "hierven", movimientos a saltitos).
// Un muro blanco a medio pintar con fotos pegadas en un cuarto oscuro: escalera, tela colgada,
// sillón envuelto en plástico, botes de pintura y papeles en el piso.
// "Todo el mundo está observando": las caritas de las fotos siguen al mouse / dedo con los ojos.
// La escena reacciona a lo que dice cada línea de la letra:
//   "observando" → todas las fotos te miran, se asoman celulares en la oscuridad y hay flashes
//   "tú y yo"    → dos fotos se encierran con marcador rojo y les sale un corazón
//   "me pregunto"→ se escribe "¿piensas en mí?" en el muro y los papeles del piso se agitan
// Usa las herramientas de crayón de js/escena.js (window.Crayon); se construye la primera vez
// que se elige en el menú de canciones (js/menu.js).
(function () {
  var escena = document.getElementById('escena-alvafro');
  var audio = document.getElementById('bg-music');
  var C = window.Crayon;
  if (!escena || !audio || !C) return;
  var el = C.el, rnd = C.rnd, pick = C.pick, rayado = C.rayado, trazar = C.trazar, grano = C.grano;
  var CUADROS = C.CUADROS;
  var W = 1200, H = 800;
  var SVG = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;overflow:visible">';
  var L = 'class="linea" pathLength="1" fill="none" stroke="#161616" stroke-linecap="round" stroke-linejoin="round"';

  var construida = false, activa = false, cuadro = 0, timer;
  var lienzosMarco = [], texFondo = [], tex = {}, mundo, pared;

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
  function linea(pts, color, ancho, alfa) { return { pts: pts, color: color, ancho: ancho, alfa: alfa }; }
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

  // ---- cuarto oscuro: techo de madera, cortinas rojas a los lados, piso de concreto ----
  function pintarCuarto() {
    var lista = [];
    zona(lista, 140, -40, W + 40, -40, 640, ['#0d0b0a', '#141110', '#1a1614', '#100d0c', '#1c1817'], { len: [80, 260], ancho: [8, 14], alfa: [.6, .9] });
    // techo de tablas de madera
    for (var t = 0; t < 9; t++) {
      var yt = 8 + t * 11;
      zona(lista, 10, -60, W, yt - 3, yt + 3, ['#3a2a1e', '#4f3a28', '#2a1e16', '#5e4632'], { ang: [-.05, .05], len: [200, 480], filas: 3, ancho: [5, 9], alfa: [.5, .85] });
    }
    // cortinas rojo oscuro
    zona(lista, 60, -20, 280, 100, 640, ['#3a0f10', '#5a1a1a', '#2a0a0c', '#4a1414', '#160606'], { ang: [1.45, 1.7], len: [120, 380], ancho: [8, 14], alfa: [.5, .85] });
    zona(lista, 30, 905, 975, 140, 640, ['#3a0f10', '#5a1a1a', '#2a0a0c'], { ang: [1.45, 1.7], len: [120, 320], ancho: [6, 12], alfa: [.5, .85] });
    zona(lista, 40, 960, W + 30, 90, 640, ['#141110', '#1d1816', '#26201c'], { ang: [1.4, 1.75], len: [120, 340], alfa: [.6, .9] });
    // piso de concreto, más claro bajo el muro (le llega la luz)
    zona(lista, 120, -40, W + 40, 600, H + 20, ['#4a4640', '#5a554e', '#3a3632', '#2e2b28', '#6b665e'], { ang: [-.12, .12], len: [120, 360], ancho: [8, 14], alfa: [.5, .85] });
    zona(lista, 40, 260, 940, 605, 690, ['#8a857c', '#7a756c', '#9a958b'], { ang: [-.08, .08], len: [100, 300], alfa: [.35, .65] });
    // salpicaduras de pintura en el piso
    zona(lista, 30, 200, 1000, 615, 780, ['#e9e8e2', '#8fa3b0', '#c8332a', '#b5c2c9'], { len: [6, 22], filas: 3, ancho: [2, 5], alfa: [.4, .8] });

    var urls = [];
    for (var q = 0; q < CUADROS; q++) {
      var cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      var c = cv.getContext('2d');
      c.fillStyle = '#0d0b0a'; c.fillRect(0, 0, W, H);
      lista.forEach(function (tr) { trazar(c, tr, 1.6); });
      grano(c, W, H, 14000, .09);
      urls.push(cv.toDataURL('image/jpeg', .85));
    }
    return urls;
  }

  // ---- muro blanco frotado con pintura gris azulada en círculos, con escurrimientos ----
  function pintarMuro() {
    var lista = [], k, a;
    zona(lista, 90, -20, 620, -20, 540, ['#dcdcd6', '#f6f5f0', '#c8ced0', '#e4e6e2'], { len: [60, 200], ancho: [5, 10], alfa: [.3, .6] });
    for (k = 0; k < 26; k++) {
      var cx = rnd(-40, 640), cy = rnd(-20, 540), r = rnd(70, 260), a0 = rnd(0, 6.3), span = rnd(1.5, 4.5), pts = [];
      for (a = a0; a < a0 + span; a += .14) pts.push([cx + Math.cos(a) * r + rnd(-3, 3), cy + Math.sin(a) * r * .8 + rnd(-3, 3)]);
      lista.push(linea(pts, pick(['#8fa3b0', '#6f8796', '#b5c2c9', '#5b7080', '#a9b6bd']), rnd(14, 40), rnd(.12, .32)));
    }
    for (k = 0; k < 3; k++) {
      var px = rnd(200, 340), py = rnd(330, 430), pp = [];
      for (a = 0; a < 3.5; a += .2) pp.push([px + Math.cos(a) * 70, py + Math.sin(a) * 50]);
      lista.push(linea(pp, '#c9a0a0', rnd(14, 24), .25));
    }
    for (k = 0; k < 34; k++) {
      var dx = rnd(10, 590), dy = rnd(240, 470);
      lista.push(linea([[dx, dy], [dx + rnd(-2, 2), dy + rnd(30, 130)]], pick(['#9aa8b0', '#7f95a3', '#b9c4c9']), rnd(2, 4), rnd(.3, .55)));
    }
    return C.texturas(600, 520, '#ecebe6', lista, 1.2);
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

  // ---- una foto pegada al muro: retrato de crayón con ojos que siguen al mouse ----
  var PIELES = ['#e6b48c', '#d9a27a', '#c88d66', '#a86e4a', '#f0c4a0', '#8a5a3a'];
  var PELOS = ['#1e1410', '#2a1a14', '#4a3020', '#161616', '#6a4a2a', '#c8a060'];
  var ROPAS = ['#2d3f35', '#c8332a', '#3f6fae', '#e9e8e2', '#6a5a8a', '#d9a03a', '#1f7a5a', '#161616'];
  var FONDOS = ['#c9a48a', '#8a6a5a', '#d8c3b0', '#6a7f8a', '#b07a6a', '#9ab0a8', '#a89a7a', '#7a8aa0'];
  function foto(x, y, w, h, rot, o) {
    o = o || {};
    var cx = w / 2, cy = h * .47, rx = w * .2, ry = h * .22, er = Math.max(1.7, w * .055);
    var ex = rx * .45, ey = cy + ry * .02, piel = o.piel || pick(PIELES), pelo = o.pelo || pick(PELOS);
    var s = '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot) + ')"><g class="aletea' + (o.clase ? ' ' + o.clase : '') +
      '" style="--w:-' + rnd(0, 2).toFixed(2) + 's">';
    s += '<rect width="' + w + '" height="' + h + '" fill="#f4f1ea"/>';
    s += '<rect x="2.5" y="2.5" width="' + (w - 5) + '" height="' + (h - 5) + '" fill="' + (o.bg || pick(FONDOS)) + '"/>';
    if (o.tipo === 'carita') {
      // guiño: la carita de "No digas nada" pegada entre las fotos
      s += '<rect x="' + f(w * .14) + '" y="' + f(h * .2) + '" width="' + f(w * .72) + '" height="' + f(h * .58) + '" rx="' + f(w * .16) + '" fill="#27a88e" stroke="#161616" stroke-width="2.5"/>';
      s += '<path d="M' + f(w * .3) + ' ' + f(h * .7) + ' C' + f(w * .45) + ' ' + f(h * .64) + ' ' + f(w * .6) + ' ' + f(h * .64) + ' ' + f(w * .72) + ' ' + f(h * .7) + '" fill="none" stroke="#161616" stroke-width="2.5"/>';
      s += '<circle cx="' + f(w * .24) + '" cy="' + f(h * .6) + '" r="' + f(w * .06) + '" fill="#d13a22"/><circle cx="' + f(w * .78) + '" cy="' + f(h * .62) + '" r="' + f(w * .06) + '" fill="#d13a22"/>';
      cy = h * .44; ex = w * .17; ey = cy; er = w * .085;
      cx = w / 2;
    } else {
      if (o.tipo === 'largo') s += '<path d="M' + f(cx - rx * 1.25) + ' ' + f(cy + ry * 1.4) + ' C' + f(cx - rx * 1.5) + ' ' + f(cy - ry * 1.5) + ' ' + f(cx + rx * 1.5) + ' ' + f(cy - ry * 1.5) + ' ' + f(cx + rx * 1.25) + ' ' + f(cy + ry * 1.4) + 'Z" fill="' + pelo + '"/>';
      s += '<path d="M' + f(w * .1) + ' ' + (h - 2.5) + ' C' + f(w * .14) + ' ' + f(h * .7) + ' ' + f(w * .86) + ' ' + f(h * .7) + ' ' + f(w * .9) + ' ' + (h - 2.5) + 'Z" fill="' + (o.ropa || pick(ROPAS)) + '"/>';
      s += '<ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="' + f(rx) + '" ry="' + f(ry) + '" fill="' + piel + '"/>';
      if (o.tipo === 'gorra') {
        s += '<path d="M' + f(cx - rx * 1.05) + ' ' + f(cy - ry * .25) + ' C' + f(cx - rx) + ' ' + f(cy - ry * 1.5) + ' ' + f(cx + rx) + ' ' + f(cy - ry * 1.5) + ' ' + f(cx + rx * 1.05) + ' ' + f(cy - ry * .25) + 'Z" fill="#9a9a72" stroke="#161616" stroke-width="1.5"/>';
        s += '<path d="M' + f(cx - rx) + ' ' + f(cy - ry * .3) + ' L' + f(cx - rx * 1.8) + ' ' + f(cy - ry * .15) + '" stroke="#161616" stroke-width="2.5" stroke-linecap="round"/>';
      } else {
        s += '<path d="M' + f(cx - rx * 1.02) + ' ' + f(cy - ry * .05) + ' C' + f(cx - rx * 1.1) + ' ' + f(cy - ry * 1.45) + ' ' + f(cx + rx * 1.1) + ' ' + f(cy - ry * 1.45) + ' ' + f(cx + rx * 1.02) + ' ' + f(cy - ry * .05) + ' C' + f(cx + rx * .5) + ' ' + f(cy - ry * .75) + ' ' + f(cx - rx * .5) + ' ' + f(cy - ry * .75) + ' ' + f(cx - rx * 1.02) + ' ' + f(cy - ry * .05) + 'Z" fill="' + pelo + '"/>';
      }
      s += '<path d="M' + f(cx - rx * .3) + ' ' + f(cy + ry * .55) + ' Q' + f(cx) + ' ' + f(cy + ry * .7) + ' ' + f(cx + rx * .3) + ' ' + f(cy + ry * .55) + '" fill="none" stroke="#161616" stroke-width="1.3" stroke-linecap="round"/>';
    }
    // ojos: blanco + pupila que sigue al mouse (.sigue) y además pasea sola (.pup)
    s += '<g class="ojos"><circle cx="' + f(cx - ex) + '" cy="' + f(ey) + '" r="' + f(er) + '" fill="#fff" stroke="#161616" stroke-width=".8"/>' +
      '<circle cx="' + f(cx + ex) + '" cy="' + f(ey) + '" r="' + f(er) + '" fill="#fff" stroke="#161616" stroke-width=".8"/>' +
      '<g class="sigue" style="--m:' + f(er * .45) + '"><g class="pup" style="animation-delay:-' + rnd(0, 6).toFixed(2) + 's">' +
      '<circle cx="' + f(cx - ex) + '" cy="' + f(ey) + '" r="' + f(er * .55) + '" fill="#161616"/><circle cx="' + f(cx + ex) + '" cy="' + f(ey) + '" r="' + f(er * .55) + '" fill="#161616"/>' +
      '</g></g></g>';
    s += '<rect width="' + w + '" height="' + h + '" fill="none" stroke="#161616" stroke-width="1.6"/>';
    if (o.cinta) s += '<rect x="' + f(w / 2 - 10) + '" y="-5" width="20" height="9" fill="rgba(233,230,138,.75)" transform="rotate(' + f(rnd(-8, 8)) + ' ' + f(w / 2) + ' 0)"/>';
    return s + '</g></g>';
  }

  function construir() {
    construida = true;
    texFondo = pintarCuarto();
    tex.muro = pintarMuro();
    tex.paisaje = texSet('#b0646a', ['#b0646a', '#8a4a50', '#d8a0a0', '#6a3a40', '#e8c0b0', '#7a8aa0'], 50);
    tex.madera = texSet('#c89a62', ['#d8aa72', '#a87a48', '#e0b888', '#8a6a40'], 30);
    tex.tela = texSet('#e9e8e2', ['#f6f5f0', '#d8d7d0', '#c9c8c0', '#ffffff'], 35);
    tex.plastico = texSet('#c9cdcd', ['#e6e9e9', '#b0b6b8', '#f4f6f6', '#9aa2a6'], 35);
    tex.rojo = C.texRojo;

    mundo = el('mundo', escena);

    // ---- capa 1: el cuarto ----
    el('capa capa-fondo', mundo).innerHTML = SVG +
      '<image class="tex-fondo" href="' + texFondo[0] + '" x="0" y="0" width="' + W + '" height="' + H + '" preserveAspectRatio="none"/></svg>';

    // ---- capa 2: el muro con las fotos ----
    var MURO = 'M300 92 C500 88 700 88 902 92 L906 612 C700 616 500 616 298 612Z';
    var manchas = '';
    for (var k = 0; k < 6; k++) {
      var mx = rnd(360, 840), my = rnd(150, 540), d = 'M' + f(mx) + ' ' + f(my);
      for (var z = 0; z < 3; z++) {
        d += ' C' + f(mx + rnd(-160, 160)) + ' ' + f(my + rnd(-120, 120)) + ' ' + f(mx + rnd(-160, 160)) + ' ' + f(my + rnd(-120, 120)) + ' ' + f(mx += rnd(-90, 90)) + ' ' + f(my += rnd(-60, 60));
        mx = Math.max(330, Math.min(870, mx)); my = Math.max(120, Math.min(580, my));
      }
      manchas += '<path pathLength="1" d="' + d + '" stroke="' + pick(['#7f95a3', '#6f8796', '#9aaeb8']) + '" stroke-width="' + rnd(18, 34).toFixed(0) +
        '" style="--d:' + rnd(9, 14).toFixed(1) + 's;--w:-' + rnd(0, 14).toFixed(1) + 's"/>';
    }
    // fotos de arriba a la izquierda (tono turquesa, como en la portada)
    var fotos = '';
    fotos += foto(312, 128, 46, 62, -3, { bg: '#c9b8a8', cinta: true });
    fotos += foto(392, 172, 80, 72, -4, { bg: '#5aa8b0', cinta: true });
    fotos += foto(474, 164, 82, 74, 3, { bg: '#4a8a96', tipo: 'largo' });
    fotos += foto(398, 246, 78, 72, 2, { tipo: 'carita', cinta: true });
    fotos += foto(478, 240, 84, 76, -3, { bg: '#7ac0c4' });
    // collage de abajo a la derecha: paisaje rojizo + muchas caritas chiquitas
    var collage = '';
    var tuyo = [];
    for (var fila = 0; fila < 5; fila++) {
      for (var col = 0; col < 6; col++) {
        var fx = 646 + col * 43 + rnd(-3, 3), fy = 392 + fila * 42 + rnd(-3, 3), fw = rnd(37, 42), fh = rnd(37, 42);
        var o = { tipo: Math.random() < .3 ? 'largo' : '' };
        if (fila === 1 && col === 1) { o = { tipo: 'gorra', piel: '#d9a27a', ropa: '#2d3f35', bg: '#3a4a5a', clase: 'tu' }; tuyo.push([fx, fy, fw, fh]); }
        if (fila === 1 && col === 2) { o = { tipo: 'largo', piel: '#e6b48c', pelo: '#2a1a14', ropa: '#c8332a', bg: '#d8c3b0', clase: 'yo' }; tuyo.push([fx, fy, fw, fh]); }
        collage += foto(fx, fy, fw, fh, rnd(-7, 7), o);
      }
    }
    for (var e = 0; e < 4; e++) collage += foto(rnd(860, 885), rnd(420, 560), rnd(36, 42), rnd(36, 42), rnd(-10, 10));
    // círculo rojo de marcador alrededor de "tú y yo" + corazón
    var tcx = (tuyo[0][0] + tuyo[1][0] + tuyo[1][2]) / 2, tcy = tuyo[0][1] + tuyo[0][3] / 2;
    var circulo = 'M' + f(tcx) + ' ' + f(tcy - 34) + ' C' + f(tcx + 60) + ' ' + f(tcy - 38) + ' ' + f(tcx + 66) + ' ' + f(tcy + 36) + ' ' + f(tcx) + ' ' + f(tcy + 34) +
      ' C' + f(tcx - 64) + ' ' + f(tcy + 34) + ' ' + f(tcx - 62) + ' ' + f(tcy - 36) + ' ' + f(tcx + 8) + ' ' + f(tcy - 38);
    var COR = 'M0 30 C-30 12 -40 -8 -32 -20 C-24 -32 -8 -30 0 -16 C8 -30 24 -32 32 -20 C40 -8 30 12 0 30Z';
    var nota = '¿piensas en mí?', notaSvg = '', nx = 676;
    for (var n = 0; n < nota.length; n++) {
      if (nota[n] !== ' ') notaSvg += '<text class="ch" x="' + nx + '" y="' + (176 + Math.sin(n) * 2).toFixed(1) + '" style="--i:' + n + '">' + nota[n] + '</text>';
      nx += nota[n] === 'm' ? 18 : /[ ií¿?]/.test(nota[n]) ? 8 : 13; // ancho aproximado de cada letra en Caveat
    }

    pared = el('capa capa-pared', mundo);
    pared.innerHTML = SVG +
      '<defs><clipPath id="aMuro"><path d="' + MURO + '"/></clipPath>' +
        '<clipPath id="aPaisaje"><rect width="140" height="122"/></clipPath>' +
        '<clipPath id="aCor"><path d="' + COR + '"/></clipPath>' +
        '<radialGradient id="aFoco"><stop offset="0" stop-color="#fffdf2" stop-opacity=".35"/><stop offset="1" stop-color="#fffdf2" stop-opacity="0"/></radialGradient>' +
      '</defs>' +
      '<g clip-path="url(#aMuro)"><image class="tex-muro" href="' + tex.muro[0] + '" x="298" y="88" width="610" height="530" preserveAspectRatio="none"/>' +
        '<g class="manchas" fill="none" stroke-linecap="round" opacity=".42" filter="url(#pastel)">' + manchas + '</g></g>' +
      '<path ' + L + ' stroke-width="6" filter="url(#marcador)" d="' + MURO + '"/>' +
      // letrero rojo escrito a mano arriba a la derecha (como en la portada)
      '<g filter="url(#marcador)" fill="#c8332a" font-family="Caveat, cursive" font-weight="700">' +
        '<text x="742" y="128" font-size="22" transform="rotate(-3 742 128)">todos miran</text>' +
        '<g class="nota" font-size="30">' + notaSvg + '</g>' +
      '</g>' +
      // paisaje rojizo con gente en bici
      '<g transform="translate(503 424) rotate(-2)"><g clip-path="url(#aPaisaje)" filter="url(#pastel)"><image class="tex-paisaje" href="' + tex.paisaje[0] + '" width="140" height="122" preserveAspectRatio="none"/></g>' +
        '<g class="ciclistas" filter="url(#marcador)" fill="none" stroke="#161616" stroke-width="2.4" stroke-linecap="round">' +
          '<circle cx="30" cy="96" r="9"/><circle cx="56" cy="96" r="9"/><path d="M30 96 L42 82 L56 96 M42 82 L40 70 M38 60 L40 70 L48 78"/><circle cx="38" cy="56" r="4"/>' +
          '<path d="M90 100 L92 76 M86 84 L98 84 M92 76 L92 70"/><circle cx="92" cy="66" r="4"/><path d="M110 100 L112 78 M112 78 L112 72"/><circle cx="112" cy="68" r="4"/>' +
        '</g><rect width="140" height="122" fill="none" stroke="#161616" stroke-width="2"/></g>' +
      '<g filter="url(#pastel)">' + fotos + collage + '</g>' +
      '<g class="tuyyo-marca"><path class="circulo-rojo" pathLength="1" d="' + circulo + '" fill="none" stroke="#d13a22" stroke-width="5" stroke-linecap="round" filter="url(#marcador)"/>' +
        '<g transform="translate(' + f(tcx) + ' ' + f(tcy - 52) + ') scale(.42)"><g class="cor-tuyo"><g filter="url(#pastel)" clip-path="url(#aCor)"><image class="tex-rojo" href="' + tex.rojo[0] + '" x="-42" y="-36" width="84" height="70" preserveAspectRatio="none"/></g>' +
        '<path d="' + COR + '" fill="none" stroke="#161616" stroke-width="7" filter="url(#marcador)"/></g></g></g>' +
      // título pintado con la misma pintura gris azulada del muro, abajo a la izquierda
      '<g class="firma"><text x="334" y="500" font-family="Caveat, cursive" font-weight="700" font-size="24" fill="#c8332a" transform="rotate(-4 334 500)" filter="url(#marcador)">con Fred again..</text>' +
      '<g class="titulo" filter="url(#pastel)" fill="#5b7080" font-family="Fredoka, \'Arial Rounded MT Bold\', sans-serif" font-weight="700">' +
        letra('P', 330, 552, 44, -4, 0) + letra('i', 358, 548, 38, 5, 1) + letra('E', 374, 552, 42, -3, 2) + letra('N', 401, 554, 44, 4, 3) +
        letra('s', 430, 548, 38, -5, 4) + letra('A', 451, 552, 42, 3, 5) + letra('s', 478, 550, 38, -4, 6) +
        letra('E', 352, 600, 46, 4, 7) + letra('N', 382, 596, 48, -3, 8) +
        letra('m', 424, 600, 44, 5, 9) + letra('í', 460, 596, 46, -4, 10) +
      '</g>' +
      '<path d="M346 606 L347 640 M398 604 L399 652 M470 604 L470 630" stroke="#5b7080" stroke-width="4" stroke-linecap="round" opacity=".7" filter="url(#marcador)"/></g>' +
      '<ellipse class="foco-muro" cx="600" cy="330" rx="420" ry="330" fill="url(#aFoco)"/>' +
    '</svg>';

    // ---- capa 3: el frente (piso, escalera, tela, sillón, lámpara, celulares, flashes) ----
    var papeles = '', telefonos = '', flashes = '';
    for (var p = 0; p < 16; p++) {
      var ppx = rnd(320, 1140), ppy = rnd(640, 790), pw = rnd(26, 52), ph = rnd(18, 36);
      papeles += '<g transform="translate(' + f(ppx) + ' ' + f(ppy) + ') rotate(' + f(rnd(-40, 40)) + ')"><g class="papel" style="--w:-' + rnd(0, 1.5).toFixed(2) + 's">' +
        '<path d="M0 0 L' + f(pw) + ' ' + f(rnd(-3, 3)) + ' L' + f(pw + rnd(-3, 3)) + ' ' + f(ph) + ' L' + f(rnd(-3, 3)) + ' ' + f(ph) + 'Z" fill="#f2f0ea" stroke="#161616" stroke-width="2.2"/>' +
        (Math.random() < .5 ? '<rect x="' + f(pw * .2) + '" y="' + f(ph * .2) + '" width="' + f(pw * .5) + '" height="' + f(ph * .5) + '" fill="' + pick(FONDOS) + '"/>' : '') + '</g></g>';
    }
    var lados = [[30, 260], [930, 1170]];
    for (var tl = 0; tl < 10; tl++) {
      var lado = lados[tl % 2], tx = rnd(lado[0], lado[1]), ty = rnd(120, 560);
      telefonos += '<g transform="translate(' + f(tx) + ' ' + f(ty) + ') rotate(' + f(rnd(-15, 15)) + ')"><g class="telefono" style="--w:' + rnd(0, .8).toFixed(2) + 's">' +
        '<ellipse cx="9" cy="16" rx="34" ry="40" fill="url(#aPantalla)"/>' +
        '<rect width="18" height="32" rx="3" fill="#dff4ff" stroke="#161616" stroke-width="2.5"/><circle cx="9" cy="5" r="1.6" fill="#161616"/>' +
        '<path d="M-2 30 C-6 40 -4 52 4 58 L16 58 C22 50 22 40 20 30" fill="#2a2420" stroke="#161616" stroke-width="2.5"/></g></g>';
    }
    for (var fl = 0; fl < 8; fl++) {
      var fla = lados[fl % 2];
      flashes += '<circle class="flash" cx="' + f(rnd(fla[0], fla[1])) + '" cy="' + f(rnd(110, 560)) + '" r="' + rnd(60, 120).toFixed(0) + '" fill="url(#aFlash)" style="--w:-' + rnd(0, 2.6).toFixed(2) + 's"/>';
    }
    var latas = '';
    [[470, 602], [486, 606], [502, 600], [520, 604], [538, 601], [556, 606], [1050, 690], [1090, 700]].forEach(function (lt, i) {
      var lw = i > 5 ? 34 : 14, lh = i > 5 ? 40 : 26, col = i > 5 ? '#e9e8e2' : pick(['#b8bcc0', '#9aa0a4', '#d0d4d6', '#5b7080']);
      latas += '<g transform="translate(' + lt[0] + ' ' + lt[1] + ')"><rect width="' + lw + '" height="' + lh + '" fill="' + col + '" stroke="#161616" stroke-width="2.2"/>' +
        '<ellipse cx="' + (lw / 2) + '" cy="0" rx="' + (lw / 2) + '" ry="' + (lw * .2) + '" fill="' + col + '" stroke="#161616" stroke-width="2.2"/></g>';
    });
    var peldanos = '';
    for (var pe = 1; pe < 10; pe++) {
      var tt = pe / 10;
      peldanos += 'M' + f(985 + 25 * tt) + ' ' + f(255 + 515 * tt) + ' L' + f(1060 + 40 * tt) + ' ' + f(255 + 515 * tt) + ' ';
    }

    el('capa capa-frente', mundo).innerHTML = SVG +
      '<defs>' +
        '<radialGradient id="aLuz"><stop offset="0" stop-color="#fffdf2" stop-opacity=".7"/><stop offset="1" stop-color="#fffdf2" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="aFlash"><stop offset="0" stop-color="#ffffff"/><stop offset=".25" stop-color="#ffffff" stop-opacity=".7"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="aPantalla"><stop offset="0" stop-color="#bfe6ff" stop-opacity=".55"/><stop offset="1" stop-color="#bfe6ff" stop-opacity="0"/></radialGradient>' +
        '<clipPath id="aTela"><path d="M940 116 C1000 108 1120 104 1214 114 L1214 470 C1180 482 1150 460 1120 478 C1090 494 1060 470 1030 484 C1000 496 970 470 948 482 L944 300Z"/></clipPath>' +
        '<clipPath id="aSillon"><path d="M-40 706 C20 670 160 668 250 690 C300 704 312 760 292 830 L-40 830Z"/></clipPath>' +
        '<clipPath id="aBanco"><path d="M175 600 L270 598 L272 613 L176 615Z M180 652 L268 650 L268 658 L180 660Z"/></clipPath>' +
      '</defs>' +
      '<ellipse cx="600" cy="645" rx="430" ry="58" fill="url(#aLuz)" opacity=".5"/>' +
      '<g class="telefonos">' + telefonos + '</g>' +
      // tela blanca colgada que se mece
      '<g class="tela"><g filter="url(#pastel)" clip-path="url(#aTela)"><image class="tex-tela" href="' + tex.tela[0] + '" x="930" y="100" width="290" height="400" preserveAspectRatio="none"/></g>' +
        '<g filter="url(#marcador)"><path ' + L + ' stroke-width="5" d="M940 116 C1000 108 1120 104 1214 114 M1214 470 C1180 482 1150 460 1120 478 C1090 494 1060 470 1030 484 C1000 496 970 470 948 482 L944 300 L940 116"/>' +
        '<path ' + L + ' stroke-width="3" stroke="#9a9a92" d="M985 130 C980 250 990 350 1000 470 M1050 120 C1060 250 1050 360 1062 476 M1120 118 C1110 240 1125 360 1118 472 M1170 120 C1176 260 1166 380 1180 466"/></g></g>' +
      // escalera de aluminio
      '<g filter="url(#marcador)">' +
        '<path d="M1040 255 L1150 765" stroke="#7d8388" stroke-width="7" stroke-linecap="round"/>' +
        '<path d="' + peldanos + '" stroke="#a7adb2" stroke-width="8" stroke-linecap="round"/>' +
        '<path d="M985 255 L1010 770 M1060 255 L1100 770" stroke="#b9bfc4" stroke-width="11" stroke-linecap="round"/>' +
        '<path ' + L + ' stroke-width="3" d="M979 255 L1004 770 M991 255 L1016 770 M1054 255 L1094 770 M1066 255 L1106 770"/>' +
        '<path d="M978 246 L1070 246 L1070 260 L978 260Z" fill="#8a9095" stroke="#161616" stroke-width="3"/>' +
      '</g>' +
      // lámpara de estudio a la izquierda
      '<ellipse class="softbox-luz" cx="40" cy="335" rx="190" ry="170" fill="url(#aLuz)"/>' +
      '<path class="softbox" d="M-30 288 L42 298 L50 372 L-30 388Z" fill="#f6f6f2" stroke="#161616" stroke-width="4" filter="url(#marcador)"/>' +
      // banquito de madera y vaso rojo
      '<g filter="url(#pastel)" clip-path="url(#aBanco)"><image class="tex-madera" href="' + tex.madera[0] + '" x="170" y="590" width="110" height="80" preserveAspectRatio="none"/></g>' +
      '<g filter="url(#marcador)"><path ' + L + ' stroke-width="4" d="M175 600 L270 598 L272 613 L176 615Z M182 615 L178 702 M264 613 L268 702 M180 652 L268 650 L268 658 L180 660Z"/>' +
        '<path d="M196 688 L218 688 L214 716 L200 716Z" fill="#d13a22" stroke="#161616" stroke-width="3"/></g>' +
      '<g filter="url(#marcador)">' + latas + '</g>' +
      '<g class="papeles" filter="url(#marcador)">' + papeles + '</g>' +
      // sillón envuelto en plástico
      '<g filter="url(#pastel)" clip-path="url(#aSillon)"><image class="tex-plastico" href="' + tex.plastico[0] + '" x="-50" y="660" width="360" height="180" preserveAspectRatio="none"/></g>' +
      '<g filter="url(#marcador)"><path ' + L + ' stroke-width="5" d="M-40 706 C20 670 160 668 250 690 C300 704 312 760 292 830"/>' +
        '<path ' + L + ' stroke-width="3" stroke="#ffffff" d="M20 700 C80 690 150 694 200 712 M240 716 C262 740 268 770 262 800 M40 740 C90 730 130 736 170 760"/></g>' +
      '<g class="flashes">' + flashes + '</g>' +
    '</svg>';
    el('destello', escena);

    for (var q = 0; q < CUADROS; q++) {
      var cv = document.createElement('canvas');
      cv.className = 'marco';
      escena.appendChild(cv);
      lienzosMarco.push(cv);
    }
    pintarMarco();
    var tRes;
    window.addEventListener('resize', function () { clearTimeout(tRes); tRes = setTimeout(pintarMarco, 200); });

    // parallax 3D + los ojos de las fotos siguen al mouse / dedo
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
  (window.LETRA_ALVAFRO_LRC || '').split(/\r?\n/).forEach(function (l) {
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
    escena.classList.toggle('mirando', /observ/.test(texto));
    escena.classList.toggle('tuyyo', /tú y yo/.test(texto));
    escena.classList.toggle('pregunto', /pregunto/.test(texto));
  }
  audio.addEventListener('timeupdate', reaccionar);
  audio.addEventListener('ended', function () { escena.classList.remove('mirando', 'tuyyo', 'pregunto'); ultima = null; });

  window.Escenas = window.Escenas || {};
  window.Escenas.alvafro = {
    el: escena,
    activar: function () {
      if (!construida) construir();
      activa = true;
      ultima = null;
      escena.classList.remove('mirando', 'tuyyo', 'pregunto');
      clearInterval(timer);
      timer = setInterval(hervir, C.FPS_DIBUJO);
      hervir();
      // las líneas de marcador se dibujan solas al llegar al estudio
      escena.classList.remove('dibujando');
      void escena.offsetWidth;
      escena.classList.add('dibujando');
    },
    desactivar: function () { activa = false; clearInterval(timer); }
  };
})();
