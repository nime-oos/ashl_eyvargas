// Escena "Más humano": la parada de autobús de noche (foto de la portada) redibujada con el
// estilo del álbum: pastel al óleo + marcador negro, 3 cuadros que "hierven", movimientos a saltitos.
// Capas en 3D: fondo (árboles, edificios, calle mojada) → parada con el chico en la banca → calle
// (reflejos, autos que pasan, lluvia, título pintado en el asfalto). Marco de papel encima.
// Usa las herramientas de crayón de js/escena.js (window.Crayon) y se construye la primera vez
// que se activa desde el menú de canciones (js/menu.js).
(function () {
  var escena = document.getElementById('escena-humano');
  var C = window.Crayon;
  if (!escena || !C) return;
  var el = C.el, rnd = C.rnd, pick = C.pick, rayado = C.rayado, trazar = C.trazar, grano = C.grano;
  var CUADROS = C.CUADROS;
  var W = 1200, H = 800; // coordenadas del "mundo" (la portada, recortada a lo ancho)
  var SVG = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;overflow:visible">';

  var construida = false, activa = false, cuadro = 0, timer;
  var lienzosMarco = [], texFondo = [], tex = {}, mundo, parada;

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
  // textura pequeña de pastel para rellenar una figura
  function texSet(base, colores, n) {
    var lista = [];
    zona(lista, n || 40, -20, 220, -20, 220, colores, { len: [30, 110], ancho: [3, 8], alfa: [.4, .85] });
    return C.texturas(200, 200, base, lista, 1.2);
  }

  // ---- fondo pintado: noche, árboles, edificios naranjas, banqueta y calle mojada ----
  function pintarFondoNoche() {
    var lista = [];
    // cielo y follaje oscuro
    zona(lista, 300, -40, W + 40, -40, 450, ['#121a15', '#18241b', '#1e2c1e', '#0f1512', '#1a2030', '#232f22', '#0b0f0d'],
      { len: [60, 220], ancho: [6, 12], alfa: [.5, .85] });
    // follaje iluminado por el poste de luz
    zona(lista, 70, 240, 640, 110, 380, ['#3b4a2a', '#4a5a30', '#2f3f25', '#56653a', '#2a3a2c'], { len: [40, 130], alfa: [.35, .7] });
    // edificios naranjas detrás de la parada
    zona(lista, 80, 140, 470, 300, 445, ['#c8743c', '#d98a4a', '#b5622f', '#e09a5a', '#9c5228'], { len: [30, 110], alfa: [.45, .85] });
    zona(lista, 45, 990, W + 30, 300, 445, ['#c8743c', '#d98a4a', '#b5622f', '#e8a868', '#9c5228'], { len: [30, 110], alfa: [.45, .85] });
    zona(lista, 25, 860, 990, 330, 440, ['#2a2620', '#3a3024', '#c98a4a', '#1c1a18'], { len: [30, 90] });
    // letrero rojo con círculo blanco (a la izquierda, como en la foto)
    zona(lista, 16, 190, 240, 345, 425, ['#c8332a', '#b02a22', '#de4a3a'], { ang: [1.3, 1.8], len: [20, 60], ancho: [4, 8], alfa: [.6, .9] });
    // luces moradas entre los árboles
    zona(lista, 10, 560, 630, 270, 335, ['#7a44a8', '#9a5cd0', '#c27ae0'], { ang: [1.45, 1.65], len: [15, 45], ancho: [3, 6], alfa: [.5, .9] });
    // troncos
    lista.push(linea([[236, -20], [242, 120], [248, 260], [252, 400], [262, 530]], '#3e3c30', 26, .95));
    lista.push(linea([[230, -20], [236, 140], [242, 300], [248, 520]], '#7a7560', 6, .7));
    lista.push(linea([[306, -20], [300, 160], [294, 320], [290, 470]], '#3e3c30', 13, .9));
    lista.push(linea([[250, 300], [290, 250], [330, 230]], '#3e3c30', 8, .85));
    // seto y plantas detrás de la banca
    zona(lista, 120, -20, W + 20, 425, 505, ['#1d3f24', '#2a5a30', '#3e7a3a', '#1a2e1c', '#2f6a35'], { len: [30, 120], alfa: [.5, .85] });
    zona(lista, 40, 860, W + 20, 435, 500, ['#5aa84a', '#6cbf55', '#4f9440', '#8ad06a'], { len: [25, 90], alfa: [.4, .75] });
    zona(lista, 30, 195, 335, 455, 535, ['#3d6a3a', '#2b4f2c', '#4f8048'], { ang: [1.2, 1.95], len: [25, 70], ancho: [3, 6], alfa: [.6, .9] });
    // banqueta de ladrillo y orilla
    zona(lista, 80, -20, W + 20, 505, 545, ['#5e3428', '#6f3f2e', '#7d4a35', '#4f2c22', '#8a5540'], { ang: [-.06, .06], len: [80, 260], alfa: [.5, .85] });
    zona(lista, 45, -20, W + 20, 545, 580, ['#2e1d1a', '#3a2420', '#24161a', '#4a2c24'], { ang: [-.04, .04], len: [120, 320], alfa: [.6, .9] });
    // calle mojada: asfalto oscuro con franjas de reflejos azules y naranjas
    zona(lista, 90, -40, W + 40, 580, H + 20, ['#16161b', '#1d1c22', '#121216', '#24222a'], { ang: [-.04, .04], len: [200, 500], ancho: [8, 14], alfa: [.6, .9] });
    for (var b = 0; b < 8; b++) {
      var yb = 610 + b * 26, colores = b % 2 ? ['#8a4a2c', '#b06a3a', '#6e3a26', '#c98048'] : ['#3d6a9a', '#5b8fc4', '#2a4a72', '#7aaedc'];
      zona(lista, 22, -60, W + 20, yb - 6, yb + 6, colores, { ang: [-.03, .03], len: [140, 420], filas: 4, ancho: [4, 9], alfa: [.3, .7] });
    }

    var urls = [];
    for (var q = 0; q < CUADROS; q++) {
      var cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      var c = cv.getContext('2d');
      c.fillStyle = '#0c110f'; c.fillRect(0, 0, W, H);
      lista.forEach(function (tr) { trazar(c, tr, 1.6); });
      // halo del poste de luz
      var g = c.createRadialGradient(372, 236, 4, 372, 236, 150);
      g.addColorStop(0, 'rgba(255,246,222,.95)');
      g.addColorStop(.12, 'rgba(255,236,200,.55)');
      g.addColorStop(1, 'rgba(255,220,170,0)');
      c.fillStyle = g; c.fillRect(200, 80, 340, 320);
      grano(c, W, H, 14000, .09);
      urls.push(cv.toDataURL('image/jpeg', .85));
    }
    return urls;
  }

  // ---- marco de papel con orilla irregular (igual que en "No digas nada") ----
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

  // relleno de pastel recortado por una forma (como la cara de "No digas nada")
  function relleno(id, d, clase, x, y, w, h) {
    return '<clipPath id="' + id + '">' + d + '</clipPath>|' +
      '<g filter="url(#pastel)" clip-path="url(#' + id + ')"><image class="tex-' + clase + '" href="' + tex[clase][0] +
      '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" preserveAspectRatio="none"/></g>';
  }
  function letra(ch, x, y, tam, rot, i) {
    return '<text class="letra" x="' + x + '" y="' + y + '" font-size="' + tam + '" transform="rotate(' + rot + ' ' + x + ' ' + y + ')" ' +
      'style="animation-delay:-' + (i * .23).toFixed(2) + 's">' + ch + '</text>';
  }

  function construir() {
    construida = true;
    tex.techo = texSet('#1f7a5a', ['#2a9a6e', '#1f7a5a', '#3fb383', '#17614a', '#6fd6b0']);
    tex.poste = texSet('#55636b', ['#6f7f88', '#4b5860', '#8a9aa2', '#3c474e']);
    tex.panel = texSet('#f4f7f2', ['#ffffff', '#e6f2ef', '#fff6d8', '#dff5ef'], 25);
    tex.banca = texSet('#8a8578', ['#a39d8e', '#6f6a5f', '#b8b2a2', '#5a564d']);
    tex.sudadera = texSet('#2d3f35', ['#3a5244', '#22312a', '#4a6352', '#1a2620', '#6a7f5a']);
    tex.jean = texSet('#3f6fae', ['#4f82c4', '#2f5a92', '#6a9ad4', '#244a7a']);
    tex.piel = texSet('#d9a27a', ['#e6b48c', '#c88d66', '#f0c4a0'], 25);
    tex.gorra = texSet('#9a9a72', ['#b0ae84', '#84845e', '#c4c294'], 25);
    tex.rojo = C.texRojo;
    texFondo = pintarFondoNoche();

    mundo = el('mundo', escena);
    var L = 'class="linea" pathLength="1" fill="none" stroke="#161616" stroke-linecap="round" stroke-linejoin="round"';

    // ---- capa 1: fondo pintado + luces de la ciudad entre los árboles ----
    var luces = '';
    var coloresLuz = ['#b07cff', '#ff7ac8', '#fff4dc', '#7ff0d8', '#ffd28a'];
    for (var i = 0; i < 22; i++) {
      var col = pick(coloresLuz);
      luces += '<circle class="luz" cx="' + rnd(20, W - 20).toFixed(0) + '" cy="' + rnd(30, 330).toFixed(0) + '" r="' + rnd(3, 9).toFixed(1) +
        '" fill="' + col + '" style="--d:' + rnd(1.5, 4).toFixed(1) + 's;--w:-' + rnd(0, 4).toFixed(1) + 's"/>';
    }
    el('capa capa-fondo', mundo).innerHTML = SVG +
      '<defs><radialGradient id="halo"><stop offset="0" stop-color="#fff6de" stop-opacity=".8"/><stop offset="1" stop-color="#ffdcae" stop-opacity="0"/></radialGradient></defs>' +
      '<image class="tex-fondo" href="' + texFondo[0] + '" x="0" y="0" width="' + W + '" height="' + H + '" preserveAspectRatio="none"/>' +
      '<circle class="halo-poste" cx="372" cy="236" r="70" fill="url(#halo)"/>' +
      '<g filter="url(#pastel)">' + luces + '</g></svg>';

    // ---- capa 2: la parada, la banca y el chico ----
    var partes = [
      relleno('hTechoI', '<path d="M-30 296 L212 300 L215 323 L-30 321Z"/>', 'techo', -40, 280, 270, 60),
      relleno('hTecho', '<path d="M326 298 C600 291 900 291 1230 295 L1230 331 C900 326 600 326 330 333Z"/>', 'techo', 310, 280, 930, 70),
      relleno('hPostes', '<path d="M118 321 L146 321 L147 533 L119 533Z"/><path d="M474 331 L500 331 L502 532 L476 532Z"/><path d="M830 329 L856 329 L858 534 L832 534Z"/>', 'poste', 100, 310, 780, 240),
      relleno('hPanel', '<path d="M566 342 L770 340 L772 371 L568 373Z"/>', 'panel', 556, 330, 230, 55),
      relleno('hBanca', '<path d="M576 461 L828 461 L829 498 L576 498Z"/><path d="M498 497 L832 497 L832 509 L498 509Z"/>', 'banca', 490, 450, 350, 70)
    ];
    var chico = [
      relleno('hSudadera', '<path d="M512 470 C508 440 512 416 528 410 C536 407 546 407 554 410 C570 416 574 440 570 470 C556 476 526 476 512 470Z"/>' +
        '<path d="M514 418 C500 432 500 456 516 476 L530 471 C518 456 518 438 525 424Z"/><path d="M568 418 C582 432 582 456 566 476 L552 471 C564 456 564 438 557 424Z"/>', 'sudadera', 495, 400, 95, 85),
      relleno('hJean', '<path d="M512 468 L570 468 L575 489 L508 489Z"/><path d="M511 486 L531 486 L532 524 L514 524Z"/><path d="M551 486 L572 486 L570 524 L551 524Z"/>', 'jean', 500, 460, 85, 70)
    ];
    var cabeza = [
      relleno('hPiel', '<ellipse cx="541" cy="392" rx="15" ry="17"/>', 'piel', 520, 370, 45, 45),
      relleno('hGorra', '<path d="M524 386 C522 368 560 366 559 385 C548 380 534 380 524 386Z"/><path d="M526 384 C514 383 508 388 514 391 C520 390 526 388 528 386Z"/>', 'gorra', 500, 360, 70, 40)
    ];
    var manos = relleno('hManos', '<circle cx="522" cy="476" r="6"/><circle cx="560" cy="476" r="6"/>', 'piel', 510, 465, 60, 20);
    var COR = 'M0 30 C-30 12 -40 -8 -32 -20 C-24 -32 -8 -30 0 -16 C8 -30 24 -32 32 -20 C40 -8 30 12 0 30Z';
    var corazones = '';
    for (var k = 0; k < 6; k++) {
      corazones += '<g class="corh" style="--x:' + rnd(-70, 70).toFixed(0) + 'px;--d:' + rnd(3.5, 5.5).toFixed(1) + 's;--w:-' + rnd(0, 5).toFixed(1) + 's">' +
        '<g transform="translate(' + (578 + rnd(-10, 10)).toFixed(0) + ' 340) scale(' + rnd(.35, .6).toFixed(2) + ')">' +
        '<g filter="url(#pastel)" clip-path="url(#hCor)"><image class="tex-rojo" href="' + tex.rojo[k % CUADROS] + '" x="-42" y="-36" width="84" height="70" preserveAspectRatio="none"/></g>' +
        '<path d="' + COR + '" fill="none" stroke="#161616" stroke-width="7" filter="url(#marcador)"/></g></g>';
    }
    function defs(arr) { return arr.map(function (p) { return p.split('|')[0]; }).join(''); }
    function figs(arr) { return arr.map(function (p) { return p.split('|')[1]; }).join(''); }
    var todas = partes.concat(chico, cabeza, [manos]);

    parada = el('capa capa-parada', mundo);
    parada.innerHTML = SVG +
      '<defs>' + defs(todas) + '<clipPath id="hCor"><path d="' + COR + '"/></clipPath>' +
        '<radialGradient id="brillo"><stop offset="0" stop-color="#ffffff" stop-opacity=".75"/><stop offset=".5" stop-color="#e8fff8" stop-opacity=".25"/><stop offset="1" stop-color="#e8fff8" stop-opacity="0"/></radialGradient>' +
      '</defs>' +
      // luz del letrero y focos del techo
      '<ellipse class="brillo-panel" cx="669" cy="358" rx="190" ry="70" fill="url(#brillo)"/>' +
      '<ellipse class="foco" cx="488" cy="338" rx="26" ry="12" fill="url(#brillo)"/><ellipse class="foco" cx="843" cy="336" rx="26" ry="12" fill="url(#brillo)" style="animation-delay:-1.3s"/>' +
      figs(partes) +
      // tira de luces turquesa del cristal
      '<path class="leds" d="M-20 432 L116 432 M504 432 L828 431 M858 431 L1230 430" stroke="#3fd0b8" stroke-width="7" stroke-dasharray="14 9" filter="url(#pastel)"/>' +
      '<g filter="url(#marcador)">' +
        '<path ' + L + ' stroke-width="6" d="M-30 296 L212 300 L215 323 L-30 321"/>' +
        '<path ' + L + ' stroke-width="6" d="M326 298 C600 291 900 291 1230 295 M1230 331 C900 326 600 326 330 333 L326 298"/>' +
        '<path ' + L + ' stroke-width="5" d="M118 321 L119 533 M146 321 L147 533 M474 331 L476 532 M500 331 L502 532 M830 329 L832 534 M856 329 L858 534"/>' +
        '<path ' + L + ' stroke-width="5" d="M566 342 L770 340 L772 371 L568 373Z"/>' +
        '<path ' + L + ' stroke-width="3" stroke="#8fa0a6" d="M502 350 L830 348 M858 348 L1230 346 M502 416 L830 415 M858 415 L1230 414"/>' +
        '<path ' + L + ' stroke-width="5" d="M576 461 L828 461 L829 498 M498 497 L832 497 L832 509 L498 509Z M520 509 L522 532 M812 509 L813 532"/>' +
        '<path ' + L + ' stroke-width="3" d="M600 470 L805 470 M600 480 L805 480 M600 489 L805 489"/>' +
      '</g>' +
      // el chico sentado solo en la banca (un poco más grande que en la foto)
      '<g transform="translate(578 528) scale(1.3) translate(-541 -528)">' +
        '<g class="chico">' +
          figs(chico) +
          '<g filter="url(#marcador)">' +
            '<path ' + L + ' stroke-width="4" d="M512 470 C508 440 512 416 528 410 C536 407 546 407 554 410 C570 416 574 440 570 470 C556 476 526 476 512 470Z"/>' +
            '<path ' + L + ' stroke-width="4" d="M514 418 C500 432 500 456 516 476 M568 418 C582 432 582 456 566 476 M541 420 L541 440"/>' +
            '<path ' + L + ' stroke-width="4" d="M512 468 L570 468 L575 489 L508 489Z M511 489 L514 524 M531 489 L532 524 M551 489 L551 524 M572 489 L570 524"/>' +
          '</g>' +
          figs([manos]) +
          '<g class="pie"><ellipse cx="522" cy="528" rx="12" ry="5" fill="#e8e4da" stroke="#161616" stroke-width="3"/></g>' +
          '<g class="pie pie-d"><ellipse cx="562" cy="528" rx="12" ry="5" fill="#e8e4da" stroke="#161616" stroke-width="3"/></g>' +
          '<g class="cabeza">' +
            figs(cabeza) +
            '<g filter="url(#marcador)">' +
              '<path ' + L + ' stroke-width="4" d="M526 392 C526 412 556 412 556 392 M524 386 C522 368 560 366 559 385 C548 380 534 380 524 386 M526 384 C514 383 508 388 514 391 C520 390 526 388 528 386"/>' +
              '<g class="ojos"><circle cx="535" cy="395" r="2.4" fill="#161616"/><circle cx="547" cy="395" r="2.4" fill="#161616"/></g>' +
            '</g>' +
          '</g>' +
        '</g>' +
      '</g>' +
      '<g class="corazones">' + corazones + '</g>' +
    '</svg>';

    // ---- capa 3: la calle (reflejos, autos, lluvia, título pintado en el asfalto) ----
    var lluvia = '', charcos = '';
    for (var r = 0; r < 60; r++) {
      var x = rnd(-40, W + 40);
      lluvia += '<path d="M' + x.toFixed(0) + ' ' + rnd(-90, -10).toFixed(0) + ' l-6 ' + rnd(22, 38).toFixed(0) + '" style="--d:' + rnd(.7, 1.2).toFixed(2) + 's;--w:-' + rnd(0, 1.2).toFixed(2) + 's"/>';
    }
    for (var p = 0; p < 7; p++) {
      charcos += '<ellipse cx="' + rnd(60, W - 60).toFixed(0) + '" cy="' + rnd(600, 780).toFixed(0) + '" rx="22" ry="5" style="--d:' + rnd(1.4, 2.4).toFixed(1) + 's;--w:-' + rnd(0, 2).toFixed(1) + 's"/>';
    }
    el('capa capa-calle', mundo).innerHTML = SVG +
      '<defs>' +
        '<radialGradient id="faro"><stop offset="0" stop-color="#fffbe8"/><stop offset=".35" stop-color="#ffe7a8" stop-opacity=".8"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="reflejo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eafff8" stop-opacity=".55"/><stop offset="1" stop-color="#9ad8ff" stop-opacity="0"/></linearGradient>' +
      '</defs>' +
      // reflejo del letrero y de los postes en la calle mojada
      '<g class="reflejos" filter="url(#pastel)">' +
        '<path d="M600 585 L740 585 L720 790 L620 790Z" fill="url(#reflejo)"/>' +
        '<path d="M482 585 L496 585 L492 720 L486 720Z M838 585 L852 585 L848 720 L842 720Z" fill="#8fa0a6" opacity=".35"/>' +
        '<path d="M380 585 L400 585 L410 760 L372 760Z" fill="url(#reflejo)" opacity=".6"/>' +
      '</g>' +
      // auto que pasa: faros y su brillo sobre el asfalto
      '<g class="auto">' +
        '<ellipse cx="0" cy="690" rx="260" ry="46" fill="url(#faro)" opacity=".35"/>' +
        '<ellipse cx="-20" cy="640" rx="34" ry="20" fill="url(#faro)"/><ellipse cx="70" cy="642" rx="34" ry="20" fill="url(#faro)"/>' +
        '<path d="M-20 660 L-30 780 M70 662 L80 780" stroke="#ffe7a8" stroke-width="16" stroke-linecap="round" opacity=".35" filter="url(#pastel)"/>' +
      '</g>' +
      '<g class="charcos" fill="none" stroke="#b9d8f0" stroke-width="2.5">' + charcos + '</g>' +
      // título en letras blancas de crayón, pintado en el asfalto (como "No DiGAs NADA" en la otra portada)
      '<g class="titulo" filter="url(#pastel)" fill="#eef2f3" font-family="Fredoka, \'Arial Rounded MT Bold\', sans-serif" font-weight="700">' +
        letra('m', 680, 668, 46, -5, 0) + letra('Á', 716, 664, 50, 4, 1) + letra('s', 754, 666, 44, -3, 2) +
        letra('H', 802, 670, 52, 5, 3) + letra('u', 844, 668, 44, -4, 4) + letra('M', 880, 672, 52, 3, 5) +
        letra('A', 926, 666, 48, -5, 6) + letra('n', 964, 670, 44, 4, 7) + letra('O', 1000, 668, 50, -3, 8) +
      '</g>' +
      '<g class="lluvia" stroke="#b9d0ea" stroke-width="3" stroke-linecap="round" filter="url(#marcador)">' + lluvia + '</g>' +
    '</svg>';

    // marco de papel encima de todo (3 cuadros que hierven)
    for (var q = 0; q < CUADROS; q++) {
      var cv = document.createElement('canvas');
      cv.className = 'marco';
      escena.appendChild(cv);
      lienzosMarco.push(cv);
    }
    pintarMarco();
    var tRes;
    window.addEventListener('resize', function () { clearTimeout(tRes); tRes = setTimeout(pintarMarco, 200); });

    // parallax 3D con mouse / dedo
    function tilt(x, y) {
      mundo.style.setProperty('--ry', ((x - .5) * 14) + 'deg');
      mundo.style.setProperty('--rx', ((.5 - y) * 9) + 'deg');
    }
    window.addEventListener('mousemove', function (e) { if (activa) tilt(e.clientX / innerWidth, e.clientY / innerHeight); });
    window.addEventListener('touchmove', function (e) { if (activa) { var t = e.touches[0]; tilt(t.clientX / innerWidth, t.clientY / innerHeight); } }, { passive: true });
  }

  // ---- "hervor": cambia de cuadro ~8 veces por segundo, solo mientras la escena se ve ----
  function hervir() {
    cuadro = (cuadro + 1) % CUADROS;
    lienzosMarco.forEach(function (cv, i) { cv.style.opacity = i === cuadro ? 1 : 0; });
    escena.querySelectorAll('.tex-fondo').forEach(function (im) { im.setAttribute('href', texFondo[cuadro]); });
    Object.keys(tex).forEach(function (k) {
      escena.querySelectorAll('.tex-' + k).forEach(function (im, i) { im.setAttribute('href', tex[k][(cuadro + i) % CUADROS]); });
    });
  }

  function seccion(tipo) {
    escena.classList.remove('s-intro', 's-verso', 's-coro');
    escena.classList.add('s-' + (tipo || 'intro'));
  }
  document.addEventListener('seccion', function (e) { seccion(e.detail); });

  window.Escenas = window.Escenas || {};
  window.Escenas.humano = {
    el: escena,
    activar: function () {
      if (!construida) construir();
      activa = true;
      seccion('intro');
      clearInterval(timer);
      timer = setInterval(hervir, C.FPS_DIBUJO);
      hervir();
      // las líneas se dibujan solas al llegar a la parada
      parada.classList.remove('dibujando');
      void parada.offsetWidth;
      parada.classList.add('dibujando');
    },
    desactivar: function () { activa = false; clearInterval(timer); }
  };
})();
