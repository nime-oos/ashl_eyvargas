// Escena "Igual que ayer" (Enanitos Verdes): un castillo mágico de noche sobre un acantilado junto al lago,
// con el estilo del álbum (pastel al óleo + marcador negro, 3 cuadros que "hierven", movimientos a saltitos).
// El gran salón con sus ventanales, la torre redonda de techo cónico, la torre del reloj, el racimo de agujas,
// el puente de arcos, la escalera que baja en zigzag hasta la casita del muelle, un pino, la luna llena y el lago.
//
// Para que no se trabe: todo lo quieto (cielo, castillo, acantilado, lago) se dibuja UNA vez con los filtros de
// crayón y se guarda como imagen (3 cuadros para el "hervor"). Encima van solo cosas ligeras sin filtros que se
// mueven con transform / opacity: ventanas que se prenden, velas flotantes, lechuzas, nubes, corazones...
//
// La escena reacciona a lo que dice cada línea de la letra:
//   "nos conocimos"            → dos lucecitas recorren el castillo y se encuentran
//   "cigarrillo y un café"     → una taza humeante flota al frente y salen aros de humo
//   "el tiempo de los dos"     → las manecillas del reloj de la torre giran
//   "salir a caminar"          → se prenden uno a uno los faroles de la escalera
//   "grande la ciudad"         → se prenden todas las ventanas del castillo
//   "nos vamos a encontrar"    → las dos lucecitas se encuentran y sale un corazón
//   "chispa"                   → chispas mágicas salen de la torre más alta
//   "latido de mi corazón"     → la luna late como corazón
//   "necesito tu amor"         → suben velas flotantes
//   "dame tu amor"             → corazones
//   "igual que ayer"           → lechuzas cruzan el cielo y todo se pone color "recuerdo" (sepia)
//   "la emoción / tu voz"      → notas musicales salen de la torre
//   "quedó desierta / los dos" → se apagan todas las ventanas menos dos
//   "el mismo bar"             → la casita del muelle se enciende
//   "encuentro sin final"      → aros de humo
//   "reaccionar"               → destello mágico
//   "recuperemos el lugar"     → las ventanas del gran salón forman un corazón
//   "flores / florecerá"       → florecen flores en el acantilado
// Usa las herramientas de crayón de js/escena.js (window.Crayon); se construye la primera vez
// que se elige en el menú de canciones (js/menu.js).
(function () {
  var escena = document.getElementById('escena-ayer');
  var audio = document.getElementById('bg-music');
  var C = window.Crayon;
  if (!escena || !audio || !C) return;
  var el = C.el, rnd = C.rnd, pick = C.pick, rayado = C.rayado, trazar = C.trazar, grano = C.grano;
  var CUADROS = C.CUADROS;
  var W = 1200, H = 800;
  var SVG = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;overflow:visible">';
  var K = 'stroke="#161616" stroke-linecap="round" stroke-linejoin="round"';
  var LUNA = [1050, 150, 44];
  // el castillo se dibuja en sus propias coordenadas y se acomoda más chico en la escena
  var T = 'translate(232 128) scale(.74)', ORILLA = 587;
  var ESTADOS = ['en-conocimos', 'en-cafe', 'en-tiempo', 'en-caminar', 'en-ciudad', 'en-encontrar', 'en-chispa', 'en-latido',
    'en-velas', 'en-dame', 'en-ayer', 'en-voz', 'en-desierta', 'en-bar', 'en-humo', 'en-reaccionar', 'en-lugar', 'en-flores'];

  var construida = false, activa = false, cuadro = 0, timer;
  var lienzosMarco = [], texFondo = [], fotosCastillo = [], tex = {}, mundo;

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
  function f(n) { return (+n).toFixed(1); }
  function estrella4(x, y, r, color, clase, w) {
    return '<path class="' + clase + '" style="--w:-' + w + 's" d="M' + f(x) + ' ' + f(y - r) + ' Q' + f(x + r * .15) + ' ' + f(y - r * .15) + ' ' + f(x + r) + ' ' + f(y) +
      ' Q' + f(x + r * .15) + ' ' + f(y + r * .15) + ' ' + f(x) + ' ' + f(y + r) + ' Q' + f(x - r * .15) + ' ' + f(y + r * .15) + ' ' + f(x - r) + ' ' + f(y) +
      ' Q' + f(x - r * .15) + ' ' + f(y - r * .15) + ' ' + f(x) + ' ' + f(y - r) + 'Z" fill="' + color + '" stroke="#161616" stroke-width="1.5"/>';
  }
  var COR = 'M0 30 C-30 12 -40 -8 -32 -20 C-24 -32 -8 -30 0 -16 C8 -30 24 -32 32 -20 C40 -8 30 12 0 30Z';
  function corazon(x, y, s, i) {
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><g class="corazoncito" style="--w:-' + (i * .3).toFixed(2) + 's;--x:' + rnd(-60, 60).toFixed(0) + 'px">' +
      '<g clip-path="url(#ayCor)"><image class="tex-rojo" href="' + tex.rojo[i % CUADROS] + '" x="-42" y="-36" width="84" height="70" preserveAspectRatio="none"/></g>' +
      '<path d="' + COR + '" fill="none" stroke="#161616" stroke-width="6"/></g></g>';
  }

  // ---- el cielo: azul tinta con nubes moradas y el resplandor de la luna ----
  function pintarCielo() {
    var lista = [];
    zona(lista, 90, -40, W + 40, -40, 260, ['#0e1430', '#16204a', '#1a2a5a', '#0a0e24'], { len: [100, 300], ancho: [8, 14], alfa: [.6, .9] });
    zona(lista, 80, -40, W + 40, 200, 500, ['#24305e', '#2e3a6a', '#3a3a6e', '#1e2a50'], { len: [100, 300], ancho: [8, 14], alfa: [.55, .85] });
    zona(lista, 50, 500, W + 40, 60, 300, ['#5a4a7a', '#6a5a8a', '#8a6a9a', '#4a3a6a'], { len: [80, 260], ancho: [8, 14], alfa: [.35, .6] });
    zona(lista, 40, -40, 400, 0, 260, ['#3a5a8a', '#5a7aaa', '#2a4a7a'], { len: [60, 200], ancho: [6, 10], alfa: [.3, .5] });
    zona(lista, 40, -40, W + 40, 560, H + 40, ['#141a40', '#0e1430', '#1e2a5a'], { len: [100, 300], ancho: [8, 14], alfa: [.6, .9] });
    var montes = [];
    zona(montes, 50, -40, W + 40, 370, 620, ['#242a56', '#141a3a', '#2e2a5a', '#1e2448'], { len: [80, 220], ancho: [6, 12], alfa: [.5, .8] });
    var urls = [];
    for (var q = 0; q < CUADROS; q++) {
      var cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      var cx = cv.getContext('2d');
      cx.fillStyle = '#121a3c'; cx.fillRect(0, 0, W, H);
      lista.forEach(function (tr) { trazar(cx, tr, 1.6); });
      // montañas lejanas a todo lo ancho
      cx.save();
      cx.beginPath();
      [[-40, 470], [80, 420], [180, 450], [300, 400], [420, 440], [560, 390], [700, 430], [840, 380], [980, 420], [1100, 370], [1240, 410], [1240, 620], [-40, 620]].forEach(function (p, i) { i ? cx.lineTo(p[0], p[1]) : cx.moveTo(p[0], p[1]); });
      cx.closePath();
      cx.fillStyle = '#1a2044'; cx.fill();
      cx.clip();
      montes.forEach(function (tr) { trazar(cx, tr, 1.6); });
      cx.restore();
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

  // ---- el castillo (dibujo quieto, se convierte en imagen) ----
  // torre: cuerpo con relleno de piedra + techo cónico; devuelve también el lugar de sus ventanitas
  var VENTANAS = [];
  function torre(x, y0, y1, w, punta, conVentanas) {
    var cuerpo = 'M' + f(x - w / 2) + ' ' + f(y1) + ' L' + f(x - w / 2) + ' ' + f(y0) + ' L' + f(x + w / 2) + ' ' + f(y0) + ' L' + f(x + w / 2) + ' ' + f(y1) + 'Z';
    var techo = 'M' + f(x - w / 2 - 4) + ' ' + f(y0 + 2) + ' L' + f(x) + ' ' + f(punta) + ' L' + f(x + w / 2 + 4) + ' ' + f(y0 + 2) + 'Z';
    if (conVentanas) for (var v = y0 + 16; v < y1 - 16; v += 26) VENTANAS.push([x - 3, v, 6, 11]);
    return '<path d="' + cuerpo + '" fill="url(#ayPiedra)" ' + K + ' stroke-width="2.4"/>' +
      '<path d="M' + f(x + w * .18) + ' ' + f(y0 + 4) + ' L' + f(x + w * .18) + ' ' + f(y1) + '" stroke="#4a3e58" stroke-width="' + f(w * .3) + '" opacity=".35"/>' +
      '<path d="' + techo + '" fill="url(#ayTecho)" ' + K + ' stroke-width="2.4"/>' +
      '<path d="M' + f(x) + ' ' + f(punta) + ' L' + f(x) + ' ' + f(punta - 12) + '" stroke="#161616" stroke-width="2"/>';
  }
  function svgCastillo(semilla) {
    VENTANAS = [];
    var s = '';
    // montañas lejanas
    // el acantilado
    var ROCA = 'M120 620 L150 520 L170 430 L210 395 L300 380 L420 388 L520 372 L640 384 L760 378 L860 392 L940 400 L980 440 L1000 520 L1010 620Z';
    s += '<g filter="url(#ayPastel)"><path d="' + ROCA + '" fill="url(#ayRoca)"/></g>' +
      '<g filter="url(#ayMarcador)"><path d="' + ROCA + '" fill="none" ' + K + ' stroke-width="3.5"/>' +
      '<path d="M200 430 C240 470 220 520 260 560 M320 400 C300 460 340 500 320 580 M460 400 C480 450 450 520 490 600 M600 392 C580 440 620 500 600 560 M740 392 C760 460 730 520 760 600 M880 410 C860 460 900 520 880 590" stroke="#2a1e30" stroke-width="3" fill="none"/></g>';
    // la escalera que baja en zigzag hasta la casita del muelle
    s += '<g filter="url(#ayMarcador)"><path d="M520 390 L640 470 L560 520 L760 560 L700 590 L880 600" stroke="#161616" stroke-width="16" fill="none" stroke-linejoin="round"/>' +
      '<path d="M520 390 L640 470 L560 520 L760 560 L700 590 L880 600" stroke="#9a8a9a" stroke-width="10" fill="none" stroke-linejoin="round"/>' +
      '<path d="M520 390 L640 470 L560 520 L760 560 L700 590 L880 600" stroke="#6a5a72" stroke-width="10" fill="none" stroke-dasharray="3 6"/></g>';
    // la casita del muelle
    s += '<g filter="url(#ayMarcador)"><path d="M870 600 L870 560 L930 560 L930 600Z" fill="url(#ayPiedra)" ' + K + ' stroke-width="2.4"/>' +
      '<path d="M864 562 L900 530 L936 562Z" fill="url(#ayTecho)" ' + K + ' stroke-width="2.4"/>' + torre(940, 540, 600, 18, 500, false) + '</g>';
    // el gran salón con sus ventanales
    var salon = 'M200 380 L200 268 L470 262 L470 380Z';
    var techoSalon = 'M196 270 L214 226 L456 222 L474 264Z';
    s += '<g filter="url(#ayMarcador)"><path d="' + salon + '" fill="url(#ayPiedra)" ' + K + ' stroke-width="3"/>' +
      '<path d="' + techoSalon + '" fill="url(#ayTecho)" ' + K + ' stroke-width="3"/>';
    for (var b = 0; b < 11; b++) {
      var bx = 210 + b * 25;
      s += '<path d="M' + bx + ' 380 L' + bx + ' 262" stroke="#4a3e58" stroke-width="4"/>' +
        '<path d="M' + bx + ' 236 L' + (bx + 4) + ' 214 L' + (bx + 8) + ' 236Z" fill="url(#ayTecho)" ' + K + ' stroke-width="1.6"/>';
      if (b < 10) { VENTANAS.push([bx + 7, 290, 10, 26, 'salon']); VENTANAS.push([bx + 8, 344, 8, 14, 'salon']); }
    }
    s += torre(200, 220, 380, 22, 140, true) + torre(470, 214, 380, 22, 150, true) + '</g>';
    // torre grande redonda de techo cónico
    s += '<g filter="url(#ayMarcador)"><path d="M455 330 L455 150 C455 140 545 140 545 150 L545 330Z" fill="url(#ayPiedra)" ' + K + ' stroke-width="3"/>' +
      '<path d="M455 200 C470 208 530 208 545 200 M455 260 C470 268 530 268 545 260" stroke="#161616" stroke-width="2" fill="none"/>' +
      '<path d="M446 154 C450 140 550 140 554 154 L500 28Z" fill="url(#ayTecho)" ' + K + ' stroke-width="3"/>' +
      '<path d="M500 28 L500 12" stroke="#161616" stroke-width="2.4"/></g>';
    [[475, 170], [500, 172], [525, 170], [470, 226], [495, 230], [520, 228], [480, 285], [510, 288]].forEach(function (v) { VENTANAS.push([v[0], v[1], 7, 12, 'torre']); });
    // torrecita redonda al frente
    s += '<g filter="url(#ayMarcador)"><path d="M398 395 L398 310 L458 310 L458 395Z" fill="url(#ayPiedra)" ' + K + ' stroke-width="2.6"/>' +
      '<path d="M392 312 L428 280 L464 312Z" fill="#5a8aa0" ' + K + ' stroke-width="2.6"/></g>';
    // el puente de arcos al centro
    s += '<g filter="url(#ayMarcador)"><path d="M470 340 L660 330 L660 372 L470 380Z" fill="url(#ayPiedra)" ' + K + ' stroke-width="2.6"/>';
    for (var a = 0; a < 6; a++) s += '<path d="M' + (482 + a * 30) + ' 376 L' + (482 + a * 30) + ' 356 C' + (482 + a * 30) + ' 346 ' + (500 + a * 30) + ' 346 ' + (500 + a * 30) + ' 356 L' + (500 + a * 30) + ' 375Z" fill="#2a2238" stroke="#161616" stroke-width="1.6"/>';
    s += '</g>';
    // racimo de agujas a la derecha (y la torre del reloj)
    s += '<g filter="url(#ayMarcador)">' +
      torre(580, 270, 360, 22, 200, true) + torre(620, 250, 360, 30, 160, true) + torre(668, 210, 390, 40, 100, true) +
      torre(720, 240, 395, 52, 120, false) + torre(770, 270, 395, 30, 170, true) + torre(812, 250, 395, 26, 150, true) +
      torre(850, 280, 395, 36, 175, true) + torre(898, 300, 398, 30, 220, true) + torre(940, 320, 400, 22, 260, true) +
      '<path d="M560 395 L560 330 L960 336 L960 400Z" fill="url(#ayPiedra)" ' + K + ' stroke-width="2.6"/>' +
      '<circle cx="720" cy="275" r="18" fill="#efe6c8" ' + K + ' stroke-width="2.4"/></g>';
    for (var r = 0; r < 14; r++) VENTANAS.push([570 + r * 28, 356, 7, 12, 'base']);
    // el pino
    s += '<g filter="url(#ayMarcador)"><path d="M60 600 L60 520" stroke="#161616" stroke-width="8"/>' +
      '<path d="M60 300 L20 380 L44 376 L10 450 L40 446 L0 530 L120 530 L82 446 L110 450 L78 376 L100 380Z" fill="#16202a" ' + K + ' stroke-width="2.4"/></g>';
    // la orilla del lago
    s += '<path d="M-40 618 C200 610 500 622 800 612 C1000 606 1100 616 1240 612" stroke="#0a0e24" stroke-width="6" fill="none" filter="url(#ayMarcador)"/>';

    var defs = '<defs>' +
      '<filter id="ayMarcador" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".025" numOctaves="2" seed="' + semilla + '" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6"/></filter>' +
      '<filter id="ayPastel" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="2" seed="' + (semilla + 7) + '" result="w"/><feDisplacementMap in="SourceGraphic" in2="w" scale="8"/></filter>' +
      patron('ayPiedra', tex.piedra[semilla % CUADROS]) + patron('ayTecho', tex.techo[semilla % CUADROS]) + patron('ayRoca', tex.roca[semilla % CUADROS]) +
      '</defs>';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + (W * 1.5) + '" height="' + (H * 1.5) + '">' + defs + s + '</svg>';
  }
  function patron(id, url) {
    return '<pattern id="' + id + '" patternUnits="userSpaceOnUse" width="160" height="160"><image href="' + url + '" width="160" height="160" preserveAspectRatio="none"/></pattern>';
  }
  // convierte el dibujo en una imagen PNG ya pintada (una sola vez), así los filtros no se recalculan nunca
  function aImagen(svg, listo) {
    var url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    var im = new Image();
    im.onload = function () {
      var cv = document.createElement('canvas');
      cv.width = W * 1.5; cv.height = H * 1.5;
      cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
      cv.toBlob(function (b) { listo(URL.createObjectURL(b)); });
    };
    im.src = url;
    return url;
  }

  // ---- lechuza volando ----
  function lechuza(i) {
    return '<g class="lechuza" style="--w:-' + (i * 1.3).toFixed(1) + 's;--y:' + (120 + i * 70) + 'px">' +
      '<g class="ala-izq"><path d="M0 0 C-14 -16 -34 -18 -46 -8 C-34 -6 -22 0 -8 6Z" fill="#c8a878" ' + K + ' stroke-width="1.8"/></g>' +
      '<g class="ala-der"><path d="M0 0 C14 -16 34 -18 46 -8 C34 -6 22 0 8 6Z" fill="#c8a878" ' + K + ' stroke-width="1.8"/></g>' +
      '<ellipse cx="0" cy="4" rx="11" ry="14" fill="#e8dcc0" ' + K + ' stroke-width="1.8"/>' +
      '<circle cx="-4" cy="-1" r="3.4" fill="#fff" stroke="#161616" stroke-width="1"/><circle cx="4" cy="-1" r="3.4" fill="#fff" stroke="#161616" stroke-width="1"/>' +
      '<circle cx="-4" cy="-1" r="1.6" fill="#161616"/><circle cx="4" cy="-1" r="1.6" fill="#161616"/><path d="M-1.4 3 L0 6 L1.4 3Z" fill="#e8a83a"/></g>';
  }
  // vela flotante
  function vela(x, y, i) {
    return '<g class="vela" style="--w:-' + rnd(0, 4).toFixed(2) + 's;--x:' + rnd(-30, 30).toFixed(0) + 'px">' +
      '<circle cx="' + f(x) + '" cy="' + f(y - 18) + '" r="16" fill="url(#ayLuzVela)"/>' +
      '<rect x="' + f(x - 5) + '" y="' + f(y - 6) + '" width="10" height="26" rx="2" fill="#f4ecd6" ' + K + ' stroke-width="1.6"/>' +
      '<path class="flama" d="M' + f(x) + ' ' + f(y - 8) + ' C' + f(x - 5) + ' ' + f(y - 13) + ' ' + f(x - 2) + ' ' + f(y - 19) + ' ' + f(x) + ' ' + f(y - 24) +
        ' C' + f(x + 2) + ' ' + f(y - 19) + ' ' + f(x + 5) + ' ' + f(y - 13) + ' ' + f(x) + ' ' + f(y - 8) + 'Z" fill="#ffc04a" stroke="#161616" stroke-width="1"/></g>';
  }

  function construir() {
    construida = true;
    texFondo = pintarCielo();
    tex.piedra = texSet('#8a7a90', ['#9a8aa0', '#6a5a7a', '#a898b0', '#5a4a6a', '#b8a8b8'], 45);
    tex.techo = texSet('#3e5070', ['#4a6a8a', '#2e3a5a', '#5a7aa0', '#3a8a9a'], 40);
    tex.roca = texSet('#5a4058', ['#6a4a5a', '#3a2a40', '#7a5a6a', '#4a3a4a', '#8a6a6a'], 50);
    tex.luna = texSet('#eef0f6', ['#ffffff', '#d8dce8', '#f6f8ff', '#c8d0e0'], 30);
    tex.nube = texSet('#4a4a7a', ['#5a5a8a', '#6a5a8a', '#3a3a6a', '#8a7aa0'], 30);
    tex.rojo = C.texRojo;
    // mientras se pinta el PNG se usa el SVG directo; al terminar se cambia por el PNG
    for (var q = 0; q < CUADROS; q++) (function (q) {
      fotosCastillo[q] = aImagen(svgCastillo(q + 1), function (png) { fotosCastillo[q] = png; });
    })(q);

    mundo = el('mundo', escena);

    // ---- capa 1: cielo, estrellas, luna y nubes ----
    var estrellas = '';
    for (var e = 0; e < 40; e++) {
      var ex = rnd(20, W - 20), ey = rnd(10, 330);
      estrellas += Math.random() < .4 ? estrella4(ex, ey, rnd(3, 6), pick(['#fff6c8', '#ffffff', '#d8e8ff']), 'estrella', rnd(0, 3).toFixed(2))
        : '<circle class="estrella" style="--w:-' + rnd(0, 3).toFixed(2) + 's" cx="' + f(ex) + '" cy="' + f(ey) + '" r="' + f(rnd(1, 2.4)) + '" fill="#fff6e0"/>';
    }
    var nubes = '';
    [[640, 110, 1.4], [880, 70, 1], [300, 210, .8], [1130, 250, .9]].forEach(function (n, i) {
      var d = 'M' + f(n[0] - 90 * n[2]) + ' ' + f(n[1]) + ' C' + f(n[0] - 90 * n[2]) + ' ' + f(n[1] - 30 * n[2]) + ' ' + f(n[0] - 40 * n[2]) + ' ' + f(n[1] - 44 * n[2]) + ' ' + f(n[0] - 10 * n[2]) + ' ' + f(n[1] - 26 * n[2]) +
        ' C' + f(n[0] + 10 * n[2]) + ' ' + f(n[1] - 50 * n[2]) + ' ' + f(n[0] + 70 * n[2]) + ' ' + f(n[1] - 40 * n[2]) + ' ' + f(n[0] + 70 * n[2]) + ' ' + f(n[1] - 14 * n[2]) +
        ' C' + f(n[0] + 110 * n[2]) + ' ' + f(n[1] - 14 * n[2]) + ' ' + f(n[0] + 110 * n[2]) + ' ' + f(n[1] + 16 * n[2]) + ' ' + f(n[0] + 70 * n[2]) + ' ' + f(n[1] + 16 * n[2]) +
        ' L' + f(n[0] - 80 * n[2]) + ' ' + f(n[1] + 16 * n[2]) + ' C' + f(n[0] - 110 * n[2]) + ' ' + f(n[1] + 16 * n[2]) + ' ' + f(n[0] - 110 * n[2]) + ' ' + f(n[1]) + ' ' + f(n[0] - 90 * n[2]) + ' ' + f(n[1]) + 'Z';
      nubes += '<g class="nube" style="--w:-' + (i * 5) + 's"><clipPath id="ayNube' + i + '"><path d="' + d + '"/></clipPath>' +
        '<g clip-path="url(#ayNube' + i + ')" opacity=".8"><image class="tex-nube" href="' + tex.nube[0] + '" x="' + f(n[0] - 120 * n[2]) + '" y="' + f(n[1] - 60 * n[2]) + '" width="' + f(240 * n[2]) + '" height="' + f(90 * n[2]) + '" preserveAspectRatio="none"/></g>' +
        '<path d="' + d + '" fill="none" stroke="#161616" stroke-width="2.4" opacity=".7"/></g>';
    });

    el('capa capa-fondo', mundo).innerHTML = SVG +
      '<defs><radialGradient id="ayHaloLuna"><stop offset=".35" stop-color="#e8f0ff" stop-opacity=".55"/><stop offset="1" stop-color="#e8f0ff" stop-opacity="0"/></radialGradient>' +
        '<clipPath id="ayLuna"><circle cx="' + LUNA[0] + '" cy="' + LUNA[1] + '" r="' + LUNA[2] + '"/></clipPath></defs>' +
      '<image class="tex-fondo" href="' + texFondo[0] + '" x="0" y="0" width="' + W + '" height="' + H + '" preserveAspectRatio="none"/>' +
      '<g class="estrellas">' + estrellas + '</g>' +
      '<g class="luna"><circle class="halo-luna" cx="' + LUNA[0] + '" cy="' + LUNA[1] + '" r="' + (LUNA[2] * 2.6) + '" fill="url(#ayHaloLuna)"/>' +
        '<g clip-path="url(#ayLuna)"><image class="tex-luna" href="' + tex.luna[0] + '" x="' + (LUNA[0] - LUNA[2]) + '" y="' + (LUNA[1] - LUNA[2]) + '" width="' + (LUNA[2] * 2) + '" height="' + (LUNA[2] * 2) + '" preserveAspectRatio="none"/></g>' +
        '<circle cx="' + (LUNA[0] - 12) + '" cy="' + (LUNA[1] - 12) + '" r="9" fill="#c8d0e0" opacity=".7"/><circle cx="' + (LUNA[0] + 16) + '" cy="' + (LUNA[1] + 12) + '" r="12" fill="#c8d0e0" opacity=".6"/><circle cx="' + (LUNA[0] + 10) + '" cy="' + (LUNA[1] - 18) + '" r="5" fill="#c8d0e0" opacity=".7"/>' +
        '<circle cx="' + LUNA[0] + '" cy="' + LUNA[1] + '" r="' + LUNA[2] + '" fill="none" stroke="#161616" stroke-width="3"/>' +
        '<path class="cor-luna" d="' + COR + '" transform="translate(' + LUNA[0] + ' ' + (LUNA[1] + 4) + ') scale(.9)" fill="#ff5a7a" opacity="0" stroke="#161616" stroke-width="3"/></g>' +
      '<g class="nubes">' + nubes + '</g>' +
    '</svg>';

    // ---- capa 2: el castillo (imagen ya dibujada) y lo que se enciende encima ----
    var ventanas = '';
    VENTANAS.forEach(function (v, i) {
      var cls = 'ventana ' + (v[4] || '') + (i % 3 === 0 ? ' siempre' : '') + (i === 7 || i === 13 ? ' pareja' : '');
      ventanas += '<rect class="' + cls + '" style="--w:-' + rnd(0, 6).toFixed(2) + 's" x="' + f(v[0] - v[2] / 2) + '" y="' + f(v[1]) + '" width="' + v[2] + '" height="' + v[3] + '" rx="' + f(v[2] / 2) + '" fill="#ffd36a"/>';
    });
    // corazón de ventanas en el gran salón ("recuperemos el lugar")
    var corVentanas = '';
    for (var cy2 = 0; cy2 < 10; cy2++) for (var cx2 = 0; cx2 < 13; cx2++) {
      var u = (cx2 - 6) / 5, w2 = (4.2 - cy2) / 4.2;
      var dentro = Math.pow(u * u + w2 * w2 - 1, 3) - u * u * Math.pow(w2, 3) < 0;
      if (dentro) corVentanas += '<rect x="' + (214 + cx2 * 19.5) + '" y="' + (270 + cy2 * 10.5) + '" width="15" height="8.5" rx="2" fill="#ff7a9a"/>';
    }
    var faroles = '';
    [[530, 398], [575, 428], [620, 458], [600, 500], [640, 532], [700, 548], [740, 572], [780, 590], [830, 596], [870, 598]].forEach(function (p, i) {
      faroles += '<g class="farol" style="--d:' + (i * .25).toFixed(2) + 's"><circle cx="' + p[0] + '" cy="' + (p[1] - 8) + '" r="12" fill="url(#ayLuzVela)"/><circle cx="' + p[0] + '" cy="' + (p[1] - 8) + '" r="3.4" fill="#ffd36a" stroke="#161616" stroke-width="1"/></g>';
    });
    var flores = '';
    for (var fl = 0; fl < 22; fl++) {
      var fx = rnd(160, 990), fy = 600 - rnd(0, 26);
      var col = pick(['#ff7a9a', '#ffd36a', '#c89aff', '#ff9a5a', '#ffffff']);
      flores += '<g class="flor" style="--w:' + (fl * .06).toFixed(2) + 's"><path d="M' + f(fx) + ' ' + f(fy + 16) + ' L' + f(fx) + ' ' + f(fy) + '" stroke="#3a7a4a" stroke-width="2.4"/>' +
        '<circle cx="' + f(fx - 4) + '" cy="' + f(fy) + '" r="4" fill="' + col + '"/><circle cx="' + f(fx + 4) + '" cy="' + f(fy) + '" r="4" fill="' + col + '"/><circle cx="' + f(fx) + '" cy="' + f(fy - 4) + '" r="4" fill="' + col + '"/><circle cx="' + f(fx) + '" cy="' + f(fy + 4) + '" r="4" fill="' + col + '"/>' +
        '<circle cx="' + f(fx) + '" cy="' + f(fy) + '" r="2.6" fill="#ffd36a" stroke="#161616" stroke-width=".8"/></g>';
    }
    var chispas = '';
    for (var ch = 0; ch < 18; ch++) {
      chispas += estrella4(500, 30, rnd(4, 9), pick(['#fff6c8', '#ffd36a', '#9af4ff', '#ff9ad0']), 'chispa', rnd(0, 1.6).toFixed(2)).replace('style="', 'style="--x:' + rnd(-200, 200).toFixed(0) + 'px;--y:' + rnd(-40, 160).toFixed(0) + 'px;');
    }
    var notas = '';
    ['♪', '♫', '♪', '♬', '♫', '♪'].forEach(function (n, i) {
      notas += '<text class="nota" style="--w:-' + (i * .45).toFixed(2) + 's;--x:' + rnd(-90, 90).toFixed(0) + 'px" x="' + (480 + i * 8) + '" y="130" font-size="' + (26 + i % 3 * 6) + '" fill="#fff6c8" stroke="#161616" stroke-width="1.4" paint-order="stroke">' + n + '</text>';
    });

    el('capa capa-pared', mundo).innerHTML = SVG +
      '<defs><radialGradient id="ayLuzVela"><stop offset="0" stop-color="#ffd36a" stop-opacity=".7"/><stop offset="1" stop-color="#ffb03a" stop-opacity="0"/></radialGradient>' +
        '<clipPath id="ayLago"><rect x="-100" y="' + (ORILLA - 3) + '" width="1400" height="400"/></clipPath>' +
        '<linearGradient id="ayAgua" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121a40" stop-opacity=".45"/><stop offset="1" stop-color="#060a20" stop-opacity=".9"/></linearGradient></defs>' +
      // el lago y el reflejo del castillo (la misma imagen volteada)
      '<rect x="-100" y="' + (ORILLA - 3) + '" width="1400" height="400" fill="#141a40"/>' +
      '<g clip-path="url(#ayLago)"><g class="reflejo"><g transform="translate(0 ' + (ORILLA * 2) + ') scale(1 -1)"><g transform="' + T + '"><image class="castillo" href="' + fotosCastillo[0] + '" x="0" y="0" width="' + W + '" height="' + H + '" opacity=".5"/></g></g></g>' +
        '<rect x="-100" y="' + ORILLA + '" width="1400" height="400" fill="url(#ayAgua)"/>' +
        '<g class="brillos-lago">' + [[1010, 620], [1040, 660], [1020, 700], [500, 640], [700, 690], [300, 650], [160, 720]].map(function (b, i) {
          return '<path class="brillo-lago" style="--w:-' + (i * .3).toFixed(1) + 's" d="M' + b[0] + ' ' + b[1] + ' h' + (30 + i % 3 * 14) + '" stroke="#c8d8ff" stroke-width="3" stroke-linecap="round"/>';
        }).join('') + '</g></g>' +
      '<g transform="' + T + '">' +
      '<image class="castillo" href="' + fotosCastillo[0] + '" x="0" y="0" width="' + W + '" height="' + H + '"/>' +
      '<g class="ventanas">' + ventanas + '</g>' +
      '<g class="cor-ventanas">' + corVentanas + '</g>' +
      '<g class="faroles">' + faroles + '</g>' +
      '<g class="bar"><circle cx="900" cy="578" r="30" fill="url(#ayLuzVela)"/><rect x="886" y="570" width="12" height="14" fill="#ffc04a" stroke="#161616" stroke-width="1.2"/><rect x="904" y="570" width="12" height="14" fill="#ffc04a" stroke="#161616" stroke-width="1.2"/></g>' +
      // manecillas del reloj de la torre
      '<g class="reloj"><path class="hora" d="M720 275 L720 264" stroke="#161616" stroke-width="3" stroke-linecap="round"/><path class="minuto" d="M720 275 L732 275" stroke="#c8332a" stroke-width="2.2" stroke-linecap="round"/><circle cx="720" cy="275" r="2.4" fill="#161616"/></g>' +
      '<g class="flores">' + flores + '</g>' +
      '<g class="chispas">' + chispas + '</g>' +
      '<g class="notas">' + notas + '</g>' +
      // dos lucecitas que se buscan
      '<g class="luz-a"><circle r="14" fill="url(#ayLuzVela)"/><circle r="4" fill="#fff6c8" stroke="#161616" stroke-width="1"/></g>' +
      '<g class="luz-b"><circle r="14" fill="url(#ayLuzVela)"/><circle r="4" fill="#ffd2ea" stroke="#161616" stroke-width="1"/></g>' +
      '<g class="encuentro"><path d="' + COR + '" transform="translate(600 300) scale(.6)" fill="#ff5a7a" stroke="#161616" stroke-width="5"/></g>' +
      '</g>' +
    '</svg>';

    // ---- capa 3: el frente (velas flotantes, lechuzas, taza de café, corazones, título) ----
    var velas = '';
    for (var vv = 0; vv < 16; vv++) velas += vela(rnd(120, 1080), rnd(300, 600), vv);
    var lechuzas = '';
    for (var lc = 0; lc < 3; lc++) lechuzas += lechuza(lc);
    var corazones = '';
    [[420, 520, .45], [520, 460, .38], [660, 500, .5], [780, 470, .4], [360, 430, .35], [860, 540, .42], [600, 400, .32], [720, 380, .36]].forEach(function (c, i) { corazones += corazon(c[0], c[1], c[2], i); });
    var aros = '';
    for (var ar = 0; ar < 4; ar++) aros += '<ellipse class="aro" style="--w:-' + (ar * .7).toFixed(1) + 's" cx="1050" cy="570" rx="16" ry="7" fill="none" stroke="#e8e8f4" stroke-width="3"/>';

    el('capa capa-frente', mundo).innerHTML = SVG +
      '<defs><clipPath id="ayCor"><path d="' + COR + '"/></clipPath>' +
        '<radialGradient id="ayLuzVela2"><stop offset="0" stop-color="#ffd36a" stop-opacity=".7"/><stop offset="1" stop-color="#ffb03a" stop-opacity="0"/></radialGradient></defs>' +
      '<g class="velas">' + velas.replace(/ayLuzVela/g, 'ayLuzVela2') + '</g>' +
      '<g class="lechuzas">' + lechuzas + '</g>' +
      '<g class="corazones">' + corazones + '</g>' +
      // la taza de café humeante (y los aros de humo)
      '<g class="taza"><g transform="translate(1050 650)">' +
        '<path class="vapor" d="M-10 -40 C-18 -56 -2 -64 -10 -80 M6 -40 C-2 -58 14 -64 6 -84" stroke="#e8e8f4" stroke-width="4" fill="none" stroke-linecap="round"/>' +
        '<path d="M22 -26 C40 -26 40 -4 20 -6" stroke="#161616" stroke-width="7" fill="none"/><path d="M22 -26 C36 -26 36 -6 20 -8" stroke="#f4ecd6" stroke-width="3.5" fill="none"/>' +
        '<path d="M-28 -34 L28 -34 L22 4 C20 12 -20 12 -22 4Z" fill="#f4ecd6" ' + K + ' stroke-width="2.6"/>' +
        '<ellipse cx="0" cy="-34" rx="28" ry="6" fill="#6a3a1a" ' + K + ' stroke-width="2.4"/>' +
        '<path d="' + COR + '" transform="translate(0 -14) scale(.3)" fill="#ff5a7a"/>' +
        '<ellipse cx="0" cy="10" rx="40" ry="7" fill="#e8e0cc" ' + K + ' stroke-width="2.4"/></g></g>' +
      '<g class="aros">' + aros + '</g>' +
      '<rect class="sepia" x="-100" y="-100" width="1400" height="1000" fill="#c89a5a"/>' +
      '<rect class="destello" x="-100" y="-100" width="1400" height="1000" fill="#f0f4ff"/>' +
      // título
      '<g class="firma">' +
        '<text x="370" y="600" text-anchor="end" font-family="Caveat, cursive" font-weight="700" font-size="24" fill="#7ad86a" transform="rotate(-4 370 600)">Enanitos Verdes</text>' +
        '<g class="titulo" fill="#fff0c0" stroke="#161616" stroke-width="2.5" paint-order="stroke" font-family="Fredoka, \'Arial Rounded MT Bold\', sans-serif" font-weight="700">' +
          letra('I', 130, 646, 44, -5, 0) + letra('g', 146, 642, 36, 4, 1) + letra('u', 171, 646, 34, -3, 2) + letra('a', 194, 642, 34, 5, 3) + letra('l', 215, 646, 38, -4, 4) +
          letra('q', 240, 646, 32, 3, 5) + letra('u', 260, 649, 30, -4, 6) + letra('e', 279, 646, 30, 5, 7) +
          letra('a', 306, 646, 34, -3, 8) + letra('y', 327, 642, 34, 4, 9) + letra('e', 348, 646, 32, -5, 10) + letra('r', 366, 642, 32, 3, 11) +
        '</g>' + estrella4(116, 610, 8, '#fff6c8', 'estrella', .5) + estrella4(380, 614, 6, '#fff6c8', 'estrella', 1.3) +
      '</g>' +
    '</svg>';

    for (var q2 = 0; q2 < CUADROS; q2++) {
      var cv = document.createElement('canvas');
      cv.className = 'marco';
      escena.appendChild(cv);
      lienzosMarco.push(cv);
    }
    pintarMarco();
    var tRes;
    window.addEventListener('resize', function () { clearTimeout(tRes); tRes = setTimeout(pintarMarco, 200); });

    // parallax 3D
    function mover(x, y) {
      mundo.style.setProperty('--ry', ((x - .5) * 14) + 'deg');
      mundo.style.setProperty('--rx', ((.5 - y) * 9) + 'deg');
    }
    window.addEventListener('mousemove', function (e) { if (activa) mover(e.clientX / innerWidth, e.clientY / innerHeight); });
    window.addEventListener('touchmove', function (e) { if (activa) { var t = e.touches[0]; mover(t.clientX / innerWidth, t.clientY / innerHeight); } }, { passive: true });
  }

  // ---- "hervor": solo se cambian las imágenes ya dibujadas (barato) ----
  function hervir() {
    cuadro = (cuadro + 1) % CUADROS;
    lienzosMarco.forEach(function (cv, i) { cv.style.opacity = i === cuadro ? 1 : 0; });
    escena.querySelectorAll('.tex-fondo').forEach(function (im) { im.setAttribute('href', texFondo[cuadro]); });
    escena.querySelectorAll('.castillo').forEach(function (im) { im.setAttribute('href', fotosCastillo[cuadro]); });
    Object.keys(tex).forEach(function (k) {
      escena.querySelectorAll('.tex-' + k).forEach(function (im, i) { im.setAttribute('href', tex[k][(cuadro + i) % CUADROS]); });
    });
  }

  // ---- la escena reacciona a lo que dice la línea que suena ----
  var lineas = [];
  (window.LETRA_AYER_LRC || '').split(/\r?\n/).forEach(function (l) {
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
    escena.classList.toggle('en-conocimos', /nos conocimos|al final los dos/.test(texto));
    escena.classList.toggle('en-cafe', /café/.test(texto));
    escena.classList.toggle('en-tiempo', /el tiempo de los dos/.test(texto));
    escena.classList.toggle('en-caminar', /caminar/.test(texto));
    escena.classList.toggle('en-ciudad', /grande la ciudad/.test(texto));
    escena.classList.toggle('en-encontrar', /encontrar|sólo para los dos/.test(texto));
    escena.classList.toggle('en-chispa', /chispa/.test(texto));
    escena.classList.toggle('en-latido', /latido/.test(texto));
    escena.classList.toggle('en-velas', /necesito tu amo/.test(texto));
    escena.classList.toggle('en-dame', /dame tu amor/.test(texto));
    escena.classList.toggle('en-ayer', /igual que ayer/.test(texto));
    escena.classList.toggle('en-voz', /emoción|tu voz/.test(texto));
    escena.classList.toggle('en-desierta', /desierta|sólo para los dos/.test(texto));
    escena.classList.toggle('en-bar', /mismo bar|café/.test(texto) && !/nos conocimos/.test(texto));
    escena.classList.toggle('en-humo', /cigarrillo|excusas/.test(texto));
    escena.classList.toggle('en-reaccionar', /reaccionar/.test(texto));
    escena.classList.toggle('en-lugar', /lugar/.test(texto));
    escena.classList.toggle('en-flores', /flores|florecerá/.test(texto));
  }
  function limpiar() { ESTADOS.forEach(function (c) { escena.classList.remove(c); }); ultima = null; }
  audio.addEventListener('timeupdate', reaccionar);
  audio.addEventListener('ended', limpiar);

  window.Escenas = window.Escenas || {};
  window.Escenas.ayer = {
    el: escena,
    activar: function () {
      if (!construida) construir();
      activa = true;
      limpiar();
      clearInterval(timer);
      timer = setInterval(hervir, C.FPS_DIBUJO);
      hervir();
      escena.classList.remove('dibujando');
      void escena.offsetWidth;
      escena.classList.add('dibujando');
    },
    desactivar: function () { activa = false; clearInterval(timer); }
  };
})();
