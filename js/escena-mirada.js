// Escena "Can't take my eyes off you" (Frankie Valli): noche de Halloween sin personajes.
// Una mansión embrujada en la colina, recortada contra una luna gigante; al frente el panteón con su reja de
// fierro, lápidas, un caldero que burbujea, un árbol seco con una linterna colgando y una telaraña, calabazas
// talladas encendidas, fuegos fatuos, murciélagos y neblina. Y como la canción dice "no puedo apartar mis ojos
// de ti": en la oscuridad hay ojos (entre los arbustos, en el hueco del árbol) que siguen al mouse.
//
// Dibujo: ilustración limpia con línea oscura, colores planos con degradados y halos de luz (sin crayón).
// Para que no se trabe: cada parte que se mueve es su propio <svg> o <div> y solo se anima con transform /
// opacity; los brillos son degradados radiales (sin filtros).
//
// La escena reacciona a lo que dice cada línea de la letra:
//   "demasiado buena para ser verdad" → polvo mágico alrededor de la luna
//   "no puedo apartar mis ojos de ti" → se abren todos los ojos (las ventanas de la mansión también) y te miran
//   "tocar el cielo"                  → estrellas fugaces
//   "abrazarte" / "quédate"           → los murciélagos rodean la luna
//   "el amor ha llegado"              → se prenden las ventanas de la mansión y se abre la puerta
//   "gracias a Dios por estar vivo"   → se encienden las velas y suben los fuegos fatuos
//   "perdona la forma en que te miro" → todo se tiñe de rosa
//   "sin fuerzas" / "te necesito"     → la calabaza gigante late con un corazón adentro
//   "no me quedan palabras"           → todo se oscurece y sube la neblina; solo quedan los ojos
//   "si sientes lo que yo siento"     → corazones de fuego salen de las calabazas
//   "dime que es real" / "créeme"     → ¡relámpago!
//   el coro "te amo, nena" (y el solo de metales que lo anuncia) → muchos fuegos artificiales con su cohete
//                                       y calabazas-linterna que suben al cielo
//   momentos clave ("el amor ha llegado", "estar vivo", "tocar el cielo", "dime que es real", "déjame amarte")
//                                     → también fuegos artificiales
//   "entibiar una noche solitaria"    → la chimenea echa humo y todo se pone cálido
//   "déjame amarte" / "preciosa"      → fuegos de corazón, murciélagos en corazón alrededor de la luna y pétalos de rosa
(function () {
  var escena = document.getElementById('escena-mirada');
  var audio = document.getElementById('bg-music');
  if (!escena || !audio) return;
  var W = 1200, H = 800, NS = 'http://www.w3.org/2000/svg';
  var L = '#120a1e';                     // línea
  var LUNA = { x: 870, y: 300, r: 150 };
  var ESTADOS = ['en-buena', 'en-ojos', 'en-cielo', 'en-abrazo', 'en-llegado', 'en-vivo', 'en-sonrojo', 'en-latido', 'en-calma',
    'en-sientes', 'en-real', 'en-fuegos', 'en-muchos', 'en-calido', 'en-amarte'];

  var construida = false, activa = false, ultima = null;

  // ---- utilidades ----
  function rng(semilla) {
    var a = semilla >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var R = rng(1031);
  function f(n) { return (+n).toFixed(1); }
  function capa(padre, clase, contenido, defs) {
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    s.setAttribute('preserveAspectRatio', 'none');
    s.setAttribute('class', 'capa-m ' + clase);
    s.innerHTML = (defs ? '<defs>' + defs + '</defs>' : '') + contenido;
    padre.appendChild(s);
    return s;
  }
  function grupo(padre, clase) {
    var d = document.createElement('div');
    d.className = clase;
    padre.appendChild(d);
    return d;
  }
  // un efecto suelto colocado en coordenadas del dibujo (dibujado en su propio cuadro de -100..100)
  function suelto(padre, clase, x, y, tam, svg, estilo) {
    var d = document.createElement('div');
    d.className = 'suelto ' + clase;
    d.style.cssText = 'left:' + (x / W * 100) + '%;top:' + (y / H * 100) + '%;width:' + (tam / W * 100) + '%;height:' + (tam / H * 100) + '%;' + (estilo || '');
    d.innerHTML = '<svg viewBox="-100 -100 200 200" width="100%" height="100%" overflow="visible">' + svg + '</svg>';
    padre.appendChild(d);
    return d;
  }
  var COR = 'M0 30 C-30 12 -40 -8 -32 -20 C-24 -32 -8 -30 0 -16 C8 -30 24 -32 32 -20 C40 -8 30 12 0 30Z';
  function destello(x, y, r, color) {
    return '<path d="M' + f(x) + ' ' + f(y - r) + ' Q' + f(x + r * .12) + ' ' + f(y - r * .12) + ' ' + f(x + r) + ' ' + f(y) + ' Q' + f(x + r * .12) + ' ' + f(y + r * .12) + ' ' + f(x) + ' ' + f(y + r) +
      ' Q' + f(x - r * .12) + ' ' + f(y + r * .12) + ' ' + f(x - r) + ' ' + f(y) + ' Q' + f(x - r * .12) + ' ' + f(y - r * .12) + ' ' + f(x) + ' ' + f(y - r) + 'Z" fill="' + color + '"/>';
  }
  var MURCIELAGO = 'M0 2 C-6 -6 -14 -9 -26 -6 C-21 -2 -20 3 -22 8 C-16 4 -9 4 -5 8 L-2 3 L0 6 L2 3 L5 8 C9 4 16 4 22 8 C20 3 21 -2 26 -6 C14 -9 6 -6 0 2Z';
  function murcielago(color) {
    return '<g class="aleteo"><path d="' + MURCIELAGO + '" transform="scale(3)" fill="' + (color || '#100818') + '"/></g>' +
      '<path d="M-3 -8 L-6 -16 L-1 -11 Z M3 -8 L6 -16 L1 -11Z" fill="' + (color || '#100818') + '"/>' +
      '<circle cx="-3" cy="-4" r="1.4" fill="#ffcf5a"/><circle cx="3" cy="-4" r="1.4" fill="#ffcf5a"/>';
  }

  // ---- el cielo, la luna y lo lejano ----
  function cielo() {
    var d = '<linearGradient id="hwCielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c0820"/><stop offset=".45" stop-color="#2a1650"/>' +
        '<stop offset=".72" stop-color="#5c2a6e"/><stop offset=".9" stop-color="#b8486a"/><stop offset="1" stop-color="#f08a4a"/></linearGradient>' +
      '<radialGradient id="hwNebula" cx=".2" cy=".3" r=".5"><stop offset="0" stop-color="#7a4ac8" stop-opacity=".35"/><stop offset="1" stop-color="#7a4ac8" stop-opacity="0"/></radialGradient>';
    var s = '<rect width="' + W + '" height="' + H + '" fill="url(#hwCielo)"/><rect width="' + W + '" height="' + H + '" fill="url(#hwNebula)"/>';
    // polvo de estrellas
    for (var i = 0; i < 160; i++) {
      var x = R() * W, y = R() * 480;
      if (Math.hypot(x - LUNA.x, y - LUNA.y) < LUNA.r + 30) continue;
      s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(.4 + R() * .9) + '" fill="#f6eaff" opacity="' + f(.2 + R() * .5) + '"/>';
    }
    return { defs: d, s: s };
  }
  function estrellas(semilla, n) {
    var r2 = rng(semilla), s = '';
    for (var i = 0; i < n; i++) {
      var x = r2() * W, y = r2() * 470;
      if (Math.hypot(x - LUNA.x, y - LUNA.y) < LUNA.r + 40) continue;
      if (r2() < .3) s += destello(x, y, 3 + r2() * 5, '#fff6e8');
      else s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(.9 + r2() * 1.4) + '" fill="#fffaf0"/>';
    }
    return s;
  }
  function luna() {
    var x = LUNA.x, y = LUNA.y, r = LUNA.r;
    var d = '<radialGradient id="hwHaloLuna"><stop offset=".42" stop-color="#ffe9b8" stop-opacity=".55"/><stop offset=".62" stop-color="#ffb870" stop-opacity=".18"/><stop offset="1" stop-color="#ff9a5a" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="hwLuna" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#fff8dc"/><stop offset=".6" stop-color="#ffe6a8"/><stop offset="1" stop-color="#f6c47a"/></radialGradient>';
    var s = '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 2.1) + '" fill="url(#hwHaloLuna)"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="url(#hwLuna)"/>';
    // cráteres
    [[-60, -50, 22], [40, -70, 14], [70, 10, 26], [-30, 40, 18], [10, 90, 12], [-90, 20, 10], [100, -30, 9], [-20, -100, 9]].forEach(function (c) {
      s += '<circle cx="' + (x + c[0]) + '" cy="' + (y + c[1]) + '" r="' + c[2] + '" fill="#ecc788" opacity=".55"/>' +
        '<path d="M' + f(x + c[0] - c[2] * .7) + ' ' + f(y + c[1] - c[2] * .2) + ' A' + c[2] + ' ' + c[2] + ' 0 0 1 ' + f(x + c[0] + c[2] * .5) + ' ' + f(y + c[1] - c[2] * .6) + '" stroke="#d8a868" stroke-width="2" fill="none" opacity=".6"/>';
    });
    return { defs: d, s: s };
  }
  function nubes() {
    var s = '';
    [[560, 300, 1.2], [880, 420, 1], [180, 360, .9], [980, 180, .7]].forEach(function (n) {
      var x = n[0], y = n[1], k = n[2];
      s += '<path d="M' + f(x) + ' ' + f(y) + ' C' + f(x + 30 * k) + ' ' + f(y - 20 * k) + ' ' + f(x + 70 * k) + ' ' + f(y - 16 * k) + ' ' + f(x + 90 * k) + ' ' + f(y - 6 * k) +
        ' C' + f(x + 120 * k) + ' ' + f(y - 22 * k) + ' ' + f(x + 170 * k) + ' ' + f(y - 14 * k) + ' ' + f(x + 180 * k) + ' ' + f(y + 2 * k) +
        ' C' + f(x + 220 * k) + ' ' + f(y) + ' ' + f(x + 230 * k) + ' ' + f(y + 14 * k) + ' ' + f(x + 210 * k) + ' ' + f(y + 16 * k) + ' L' + f(x - 20 * k) + ' ' + f(y + 16 * k) +
        ' C' + f(x - 40 * k) + ' ' + f(y + 14 * k) + ' ' + f(x - 30 * k) + ' ' + f(y) + ' ' + f(x) + ' ' + f(y) + 'Z" fill="#3a2258" opacity=".75"/>' +
        '<path d="M' + f(x + 4 * k) + ' ' + f(y - 2 * k) + ' C' + f(x + 30 * k) + ' ' + f(y - 18 * k) + ' ' + f(x + 70 * k) + ' ' + f(y - 14 * k) + ' ' + f(x + 88 * k) + ' ' + f(y - 4 * k) + '" stroke="#f0a8a0" stroke-width="' + f(2 * k) + '" fill="none" opacity=".45"/>';
    });
    return s;
  }
  function lejanos() {
    // colinas lejanas con arbolitos secos en silueta
    var s = '<path d="M-10 600 L-10 548 C80 520 160 540 250 528 C340 516 400 486 480 500 C560 512 600 540 700 536 C820 530 900 500 1000 512 C1080 520 1140 540 1210 532 L1210 600Z" fill="#2c1c48"/>' +
      '<path d="M-10 548 C80 520 160 540 250 528 C340 516 400 486 480 500 C560 512 600 540 700 536 C820 530 900 500 1000 512 C1080 520 1140 540 1210 532" stroke="#7a4a8a" stroke-width="2" fill="none" opacity=".6"/>';
    [[60, 534], [300, 520], [420, 496], [1040, 514], [1150, 532]].forEach(function (t, i) {
      var x = t[0], y = t[1], h = 28 + i % 3 * 10;
      s += '<path d="M' + x + ' ' + y + ' L' + x + ' ' + (y - h) + ' M' + x + ' ' + (y - h * .6) + ' L' + (x - 10) + ' ' + (y - h * .9) + ' M' + x + ' ' + (y - h * .45) + ' L' + (x + 9) + ' ' + (y - h * .8) +
        ' M' + x + ' ' + (y - h) + ' L' + (x - 5) + ' ' + (y - h - 8) + ' M' + x + ' ' + (y - h) + ' L' + (x + 6) + ' ' + (y - h - 6) + '" stroke="#1c1232" stroke-width="2.4" stroke-linecap="round"/>';
    });
    return s;
  }

  // ---- la mansión embrujada ----
  var VENTANAS = [   // [x, y, w, h, prendida desde el inicio]
    [570, 440, 30, 40, true], [638, 400, 24, 36, true], [690, 400, 24, 36, false], [742, 400, 24, 36, true], [638, 452, 24, 36, false], [742, 452, 24, 36, true],
    [808, 350, 24, 34, false], [808, 410, 24, 34, true]
  ];
  function arco(x, y, w, h) {
    return 'M' + x + ' ' + (y + h) + ' L' + x + ' ' + (y + w / 2) + ' A' + (w / 2) + ' ' + (w / 2) + ' 0 0 1 ' + (x + w) + ' ' + (y + w / 2) + ' L' + (x + w) + ' ' + (y + h) + 'Z';
  }
  function mansion() {
    var d = '<linearGradient id="hwMuro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2a5c"/><stop offset="1" stop-color="#241a3c"/></linearGradient>' +
      '<linearGradient id="hwTecho" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1c42"/><stop offset="1" stop-color="#1a1230"/></linearGradient>' +
      '<radialGradient id="hwVentanaM" cx=".5" cy=".6" r=".7"><stop offset="0" stop-color="#fff2b0"/><stop offset=".55" stop-color="#ffb84a"/><stop offset="1" stop-color="#e8701c"/></radialGradient>' +
      '<radialGradient id="hwHaloVentana"><stop offset="0" stop-color="#ffb84a" stop-opacity=".55"/><stop offset="1" stop-color="#ffb84a" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="hwColina" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2048"/><stop offset="1" stop-color="#160f2a"/></linearGradient>';
    var s = '';
    // la colina
    // la colina con una explanada donde se asienta la casa
    var COLINA = 'M400 652 C440 610 480 560 516 530 C530 520 540 516 556 515 L876 515 C900 516 924 524 950 538 C1000 566 1060 596 1130 610 C1160 616 1190 618 1210 619 L1210 660 L400 660Z';
    s += '<path d="' + COLINA + '" fill="url(#hwColina)"/>' +
      '<path d="M420 634 C460 590 500 546 530 522 C540 517 548 515 556 515 L876 515 C900 516 924 524 950 538 C1000 566 1060 596 1130 610" stroke="#8a6ab8" stroke-width="2.4" fill="none" opacity=".55"/>' +
      '<ellipse cx="712" cy="522" rx="190" ry="12" fill="#0c0618" opacity=".55"/>';
    // el camino que baja de la puerta hasta la reja
    s += '<path d="M694 526 L722 526 C730 548 760 560 752 582 C744 604 712 612 734 652 L686 652 C668 614 700 600 706 582 C712 562 686 548 694 526Z" fill="#43345e" opacity=".9"/>';
    // ala izquierda
    s += '<path d="M548 505 L548 418 L622 418 L622 505Z" fill="url(#hwMuro)" stroke="' + L + '" stroke-width="2"/>' +
      '<path d="M536 424 L585 366 L634 424Z" fill="url(#hwTecho)" stroke="' + L + '" stroke-width="2"/>' +
      '<path d="M536 424 L585 366 L634 424" stroke="#c8b0ff" stroke-width="1.6" fill="none" opacity=".55"/>';
    // cuerpo principal con su techo mansarda y la buhardilla redonda
    s += '<path d="M612 505 L612 382 L802 382 L802 505Z" fill="url(#hwMuro)" stroke="' + L + '" stroke-width="2"/>' +
      '<path d="M600 388 L640 318 L776 318 L814 388Z" fill="url(#hwTecho)" stroke="' + L + '" stroke-width="2"/>' +
      '<path d="M600 388 L640 318 L776 318 L814 388" stroke="#c8b0ff" stroke-width="1.8" fill="none" opacity=".6"/>' +
      '<path d="M618 360 L790 360 M630 340 L780 340" stroke="#3a2a58" stroke-width="2" opacity=".8"/>' +
      // la chimenea
      '<path d="M752 330 L752 286 L774 286 L774 330Z" fill="#2c1e46" stroke="' + L + '" stroke-width="2"/><path d="M748 286 L778 286 L778 280 L748 280Z" fill="#1c1230" stroke="' + L + '" stroke-width="2"/>' +
      // buhardilla
      '<path d="M684 340 L684 304 L730 304 L730 340Z" fill="url(#hwMuro)" stroke="' + L + '" stroke-width="2"/>' +
      '<path d="M676 308 L707 274 L738 308Z" fill="url(#hwTecho)" stroke="' + L + '" stroke-width="2"/><path d="M676 308 L707 274 L738 308" stroke="#c8b0ff" stroke-width="1.6" fill="none" opacity=".6"/>';
    // la torre
    s += '<path d="M790 505 L790 330 L852 330 L852 505Z" fill="url(#hwMuro)" stroke="' + L + '" stroke-width="2"/>' +
      '<path d="M778 336 L821 236 L864 336Z" fill="url(#hwTecho)" stroke="' + L + '" stroke-width="2"/>' +
      '<path d="M778 336 L821 236" stroke="#c8b0ff" stroke-width="1.8" fill="none" opacity=".6"/>' +
      '<path d="M821 236 L821 210" stroke="' + L + '" stroke-width="2.4"/>';
    // la veleta de murciélago
    s += '<g class="veleta"><path d="' + MURCIELAGO + '" transform="translate(821 206) scale(.9)" fill="' + L + '"/></g>';
    // tablitas del muro
    s += '<path d="M612 440 L802 440 M612 494 L802 494 M790 390 L852 390 M790 460 L852 460" stroke="#2c2048" stroke-width="2"/>';
    // el cimiento de piedra: la casa se apoya en la explanada
    s += '<path d="M542 503 L858 503 L862 520 L538 520Z" fill="#4a4068" stroke="' + L + '" stroke-width="2"/>' +
      '<path d="M542 511 L858 511 M570 503 L568 511 M610 511 L612 520 M650 503 L648 511 M700 511 L702 520 M760 503 L758 511 M810 511 L812 520 M846 503 L844 511" stroke="' + L + '" stroke-width="1.4" opacity=".7"/>' +
      '<path d="M542 504 L858 504" stroke="#8a7ab8" stroke-width="1.4" opacity=".6"/>';
    // la puerta con su porche y escalones (la luz de adentro se ve cuando se abre)
    s += '<path d="M684 505 L684 470 C684 456 724 456 724 470 L724 505Z" fill="#1c1230" stroke="' + L + '" stroke-width="2"/>' +
      '<path class="puerta-luz" d="M688 505 L688 472 C688 462 720 462 720 472 L720 505Z" fill="url(#hwVentanaM)"/>' +
      '<path class="puerta" d="M688 505 L688 472 C688 462 720 462 720 472 L720 505Z" fill="#3a2410" stroke="' + L + '" stroke-width="1.6"/>' +
      '<path d="M672 456 L736 456 L744 450 L664 450Z" fill="#1c1230" stroke="' + L + '" stroke-width="2"/><path d="M670 456 L670 505 M738 456 L738 505" stroke="' + L + '" stroke-width="4"/>' +
      '<path d="M676 505 L732 505 L736 512 L672 512Z M670 512 L738 512 L742 520 L666 520Z M664 520 L744 520 L750 528 L658 528Z" fill="#2c2048" stroke="' + L + '" stroke-width="1.6"/>';
    // las ventanas (con su halo); las apagadas se prenden con "el amor ha llegado"
    VENTANAS.forEach(function (v, i) {
      var cx = v[0] + v[2] / 2, cy = v[1] + v[3] / 2;
      s += '<path d="' + arco(v[0], v[1], v[2], v[3]) + '" fill="#2a1e44"/>' +
        '<g class="ventana' + (v[4] ? '' : ' apagada') + '" style="--w:' + (i * .25).toFixed(2) + 's">' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + (v[3] * 1.3) + '" fill="url(#hwHaloVentana)"/>' +
        '<path d="' + arco(v[0], v[1], v[2], v[3]) + '" fill="url(#hwVentanaM)"/></g>' +
        '<path d="' + arco(v[0], v[1], v[2], v[3]) + ' M' + cx + ' ' + (v[1] + 4) + ' L' + cx + ' ' + (v[1] + v[3]) + ' M' + v[0] + ' ' + (v[1] + v[3] * .55) + ' L' + (v[0] + v[2]) + ' ' + (v[1] + v[3] * .55) + '" fill="none" stroke="' + L + '" stroke-width="2"/>';
    });
    // la ventana redonda de la buhardilla y unas contraventanas chuecas
    s += '<circle cx="707" cy="322" r="18" fill="url(#hwHaloVentana)"/><circle cx="707" cy="322" r="11" fill="url(#hwVentanaM)" stroke="' + L + '" stroke-width="2"/>' +
      '<path d="M696 322 L718 322 M707 311 L707 333" stroke="' + L + '" stroke-width="1.6"/>' +
      '<path d="M766 452 L782 456 L780 492 L764 488Z" fill="#2c1e46" stroke="' + L + '" stroke-width="1.6"/>' +
      '<path d="M620 452 L634 448 L636 488 L622 490Z" fill="#2c1e46" stroke="' + L + '" stroke-width="1.6"/>';
    // arbustos al pie de la casa
    [[548, 520, 20], [576, 522, 16], [626, 522, 18], [652, 524, 13], [768, 522, 17], [792, 521, 14], [838, 522, 20], [862, 522, 15]].forEach(function (a) {
      s += '<ellipse cx="' + a[0] + '" cy="' + a[1] + '" rx="' + a[2] + '" ry="' + (a[2] * .62) + '" fill="#1a2a2a" stroke="' + L + '" stroke-width="1.6"/>' +
        '<path d="M' + (a[0] - a[2] * .7) + ' ' + (a[1] - a[2] * .3) + ' Q' + a[0] + ' ' + (a[1] - a[2] * .75) + ' ' + (a[0] + a[2] * .6) + ' ' + (a[1] - a[2] * .35) + '" stroke="#4a6a5a" stroke-width="1.6" fill="none" opacity=".7"/>';
    });
    // la hiedra que sube por el ala izquierda
    s += '<path d="M552 505 C560 480 548 460 562 440 C570 428 566 418 574 410" stroke="#1e3a2a" stroke-width="3" fill="none"/>';
    [[556, 492], [552, 474], [560, 458], [566, 440], [570, 424]].forEach(function (h) { s += '<ellipse cx="' + h[0] + '" cy="' + h[1] + '" rx="6" ry="4" fill="#2a5a3a" transform="rotate(-30 ' + h[0] + ' ' + h[1] + ')"/>'; });
    return { defs: d, s: s };
  }
  // los ojos que aparecen en las ventanas
  function ojosVentanas() {
    var s = '';
    VENTANAS.concat([[694, 307, 26, 30, true]]).forEach(function (v, i) {
      var cx = v[0] + v[2] / 2, cy = v[1] + v[3] * .58, rx = v[2] * .42, ry = v[3] * .26;
      s += '<g class="ojo-ventana" style="--w:' + (i * .08).toFixed(2) + 's"><ellipse cx="' + f(cx) + '" cy="' + f(cy) + '" rx="' + f(rx) + '" ry="' + f(ry) + '" fill="#fff8e0" stroke="' + L + '" stroke-width="1.6"/>' +
        '<g class="pupila"><circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(ry * .85) + '" fill="#e8501c"/><circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(ry * .4) + '" fill="#120808"/></g></g>';
    });
    return s;
  }
  function humo() {
    var s = '';
    for (var i = 0; i < 5; i++) {
      s += '<circle class="bocanada" style="--w:-' + (i * .9).toFixed(1) + 's" cx="763" cy="272" r="' + (12 + i * 2) + '" fill="url(#hwHumo)"/>';
    }
    return '<defs><radialGradient id="hwHumo"><stop offset="0" stop-color="#b8a8d0" stop-opacity=".7"/><stop offset="1" stop-color="#b8a8d0" stop-opacity="0"/></radialGradient></defs>' + s;
  }

  // ---- el panteón ----
  function cerca(x0, x1, base) {
    var s = '', d = '';
    for (var x = x0; x <= x1; x += 22) {
      d += 'M' + x + ' ' + base + ' L' + x + ' ' + (base - 54) + ' ';
      s += '<path d="M' + (x - 4) + ' ' + (base - 54) + ' L' + x + ' ' + (base - 66) + ' L' + (x + 4) + ' ' + (base - 54) + 'Z" fill="' + L + '"/>';
    }
    d += 'M' + x0 + ' ' + (base - 44) + ' L' + x1 + ' ' + (base - 44) + ' M' + x0 + ' ' + (base - 12) + ' L' + x1 + ' ' + (base - 12);
    return '<path d="' + d + '" stroke="' + L + '" stroke-width="3.4" fill="none"/>' + s +
      '<path d="M' + x0 + ' ' + (base - 44) + ' L' + x1 + ' ' + (base - 44) + '" stroke="#8a6ab8" stroke-width="1" opacity=".5"/>';
  }
  function reja() {
    var s = cerca(-10, 640, 640) + cerca(760, 1210, 640);
    // la puerta abierta, con remolinos de fierro
    s += '<g stroke="' + L + '" stroke-width="3.6" fill="none" stroke-linecap="round">' +
      '<path d="M640 640 L640 560 M640 560 C652 548 664 548 676 556 M640 600 L676 590 M676 556 L676 650 M640 640 L676 650"/>' +
      '<path d="M760 640 L760 560 M760 560 C748 548 736 548 724 556 M760 600 L724 590 M724 556 L724 650 M760 640 L724 650"/>' +
      '<path d="M652 618 c6 -8 14 -6 14 0 c0 6 -8 8 -10 2 M748 618 c-6 -8 -14 -6 -14 0 c0 6 8 8 10 2"/></g>' +
      '<path d="M630 640 L630 540 M770 640 L770 540" stroke="' + L + '" stroke-width="10"/>' +
      '<circle cx="630" cy="534" r="9" fill="' + L + '"/><circle cx="770" cy="534" r="9" fill="' + L + '"/>';
    return s;
  }
  function lapida(x, y, w, h, rot, tipo, texto) {
    var d = tipo === 'cruz'
      ? 'M' + f(x - w * .14) + ' ' + y + ' L' + f(x - w * .14) + ' ' + f(y - h * .62) + ' L' + f(x - w * .5) + ' ' + f(y - h * .62) + ' L' + f(x - w * .5) + ' ' + f(y - h * .8) +
        ' L' + f(x - w * .14) + ' ' + f(y - h * .8) + ' L' + f(x - w * .14) + ' ' + (y - h) + ' L' + f(x + w * .14) + ' ' + (y - h) + ' L' + f(x + w * .14) + ' ' + f(y - h * .8) +
        ' L' + f(x + w * .5) + ' ' + f(y - h * .8) + ' L' + f(x + w * .5) + ' ' + f(y - h * .62) + ' L' + f(x + w * .14) + ' ' + f(y - h * .62) + ' L' + f(x + w * .14) + ' ' + y + 'Z'
      : 'M' + f(x - w / 2) + ' ' + y + ' L' + f(x - w / 2) + ' ' + f(y - h + w / 2) + ' A' + f(w / 2) + ' ' + f(w / 2) + ' 0 0 1 ' + f(x + w / 2) + ' ' + f(y - h + w / 2) + ' L' + f(x + w / 2) + ' ' + y + 'Z';
    var s = '<g transform="rotate(' + rot + ' ' + x + ' ' + y + ')">' +
      '<path d="' + d + '" fill="url(#hwPiedra)" stroke="' + L + '" stroke-width="2.4" stroke-linejoin="round"/>';
    if (tipo !== 'cruz') {
      s += '<path d="M' + f(x + w * .2) + ' ' + f(y - 2) + ' L' + f(x + w * .2) + ' ' + f(y - h + w / 2) + ' A' + f(w / 2) + ' ' + f(w / 2) + ' 0 0 1 ' + f(x + w / 2) + ' ' + f(y - h + w / 2) + ' L' + f(x + w / 2) + ' ' + y + 'Z" fill="#2a2240" opacity=".45"/>';
      s += '<path d="M' + f(x - w / 2 + 4) + ' ' + f(y - h + w / 2) + ' A' + f(w / 2 - 4) + ' ' + f(w / 2 - 4) + ' 0 0 1 ' + f(x + w * .1) + ' ' + f(y - h + 4) + '" stroke="#c8b8e8" stroke-width="2" fill="none" opacity=".6"/>';
      if (texto) s += '<text x="' + x + '" y="' + f(y - h * .42) + '" text-anchor="middle" font-family="Creepster, Fredoka, cursive" font-size="' + f(w * .3) + '" fill="#2a2240" letter-spacing="1">' + texto + '</text>';
      s += '<path d="M' + f(x - w * .25) + ' ' + f(y - h * .7) + ' l6 10 l-5 6 l5 9" stroke="#2a2240" stroke-width="1.6" fill="none"/>';
    }
    s += '<path d="M' + f(x - w / 2 - 6) + ' ' + y + ' q' + f(w * .25) + ' -10 ' + f(w * .5) + ' -2 q' + f(w * .25) + ' -6 ' + f(w * .6) + ' 2" stroke="#2a4a3a" stroke-width="5" fill="none" stroke-linecap="round"/></g>';
    return s;
  }
  function vela(x, y, h, i) {
    return '<g class="vela" style="--w:-' + (i * .17).toFixed(2) + 's"><circle class="halo-vela" cx="' + x + '" cy="' + (y - h - 8) + '" r="22" fill="url(#hwHaloVela)"/>' +
      '<rect x="' + (x - 4) + '" y="' + (y - h) + '" width="8" height="' + h + '" rx="2" fill="#f2e6cc" stroke="' + L + '" stroke-width="1.4"/>' +
      '<path d="M' + (x - 4) + ' ' + (y - h + 3) + ' q2 5 0 8" stroke="#f2e6cc" stroke-width="3" fill="none"/>' +
      '<path class="llama" d="M' + x + ' ' + (y - h - 2) + ' C' + (x - 4) + ' ' + (y - h - 7) + ' ' + (x - 1.5) + ' ' + (y - h - 12) + ' ' + x + ' ' + (y - h - 16) + ' C' + (x + 1.5) + ' ' + (y - h - 12) + ' ' + (x + 4) + ' ' + (y - h - 7) + ' ' + x + ' ' + (y - h - 2) + 'Z" fill="#ffc04a" stroke="#c8501a" stroke-width=".8"/></g>';
  }
  function caldero(x, y) {
    var s = '<ellipse cx="' + x + '" cy="' + (y + 40) + '" rx="56" ry="10" fill="#0c0618" opacity=".6"/>' +
      '<path d="M' + (x - 30) + ' ' + (y + 34) + ' L' + (x - 40) + ' ' + (y + 46) + ' M' + (x + 30) + ' ' + (y + 34) + ' L' + (x + 40) + ' ' + (y + 46) + '" stroke="' + L + '" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M' + (x - 48) + ' ' + (y - 4) + ' C' + (x - 52) + ' ' + (y + 30) + ' ' + (x - 30) + ' ' + (y + 44) + ' ' + x + ' ' + (y + 44) + ' C' + (x + 30) + ' ' + (y + 44) + ' ' + (x + 52) + ' ' + (y + 30) + ' ' + (x + 48) + ' ' + (y - 4) + 'Z" fill="#1c1626" stroke="' + L + '" stroke-width="2.4"/>' +
      '<path d="M' + (x - 40) + ' ' + (y + 6) + ' C' + (x - 40) + ' ' + (y + 28) + ' ' + (x - 24) + ' ' + (y + 38) + ' ' + (x - 6) + ' ' + (y + 40) + '" stroke="#6a5a8a" stroke-width="3" fill="none" opacity=".7"/>' +
      '<circle cx="' + x + '" cy="' + (y - 20) + '" r="70" fill="url(#hwHaloPocion)"/>' +
      '<ellipse cx="' + x + '" cy="' + (y - 4) + '" rx="52" ry="12" fill="#2a2236" stroke="' + L + '" stroke-width="2.4"/>' +
      '<ellipse cx="' + x + '" cy="' + (y - 3) + '" rx="44" ry="8" fill="url(#hwPocion)"/>';
    for (var i = 0; i < 7; i++) {
      s += '<circle class="burbuja" style="--w:-' + (i * .4).toFixed(1) + 's;--x:' + ((R() - .5) * 30).toFixed(0) + 'px" cx="' + (x - 26 + i * 9) + '" cy="' + (y - 6) + '" r="' + (3 + i % 3 * 2) + '" fill="#9aff6a" stroke="#1e5a1a" stroke-width="1"/>';
    }
    return s;
  }
  function arbol() {
    // árbol seco: tronco y ramas como trazos que se adelgazan
    var ramas = [
      ['M92 660 C96 600 84 540 98 470 C108 420 96 380 112 330', 30],
      ['M104 470 C150 440 210 430 260 396 C300 370 330 372 368 350', 13],
      ['M110 400 C80 370 60 330 52 290 C46 262 30 250 20 236', 11],
      ['M112 340 C130 300 160 278 196 262 C224 250 238 230 250 210', 9],
      ['M260 396 C276 370 296 360 312 330', 6], ['M210 425 C220 450 240 462 262 466', 6],
      ['M196 262 C180 240 170 222 172 200', 5], ['M60 300 C82 286 94 270 98 252', 5], ['M368 350 C388 348 400 336 410 322', 4],
      ['M92 520 C70 506 52 506 36 494', 7]
    ];
    var s = '';
    ramas.forEach(function (r) { s += '<path d="' + r[0] + '" stroke="#140c20" stroke-width="' + r[1] + '" fill="none" stroke-linecap="round"/>'; });
    ramas.forEach(function (r) { s += '<path d="' + r[0] + '" stroke="#3a2a52" stroke-width="' + (r[1] * .25) + '" fill="none" stroke-linecap="round" opacity=".7" transform="translate(-' + (r[1] * .22) + ' 0)"/>'; });
    // raíces y el hueco del tronco
    s += '<path d="M70 664 C80 650 86 646 92 640 C98 646 108 652 124 664Z" fill="#140c20"/>' +
      '<ellipse cx="98" cy="560" rx="14" ry="22" fill="#05020a" stroke="#3a2a52" stroke-width="2"/>';
    // la telaraña entre las ramas
    var cx = 70, cy = 330, web = '';
    for (var a = 0; a < 7; a++) {
      var ang = -1.9 + a * .42;
      web += 'M' + cx + ' ' + cy + ' L' + f(cx + Math.cos(ang) * 74) + ' ' + f(cy + Math.sin(ang) * 74) + ' ';
    }
    for (var rr = 16; rr <= 70; rr += 13) {
      for (var b = 0; b < 6; b++) {
        var a1 = -1.9 + b * .42, a2 = a1 + .42;
        web += 'M' + f(cx + Math.cos(a1) * rr) + ' ' + f(cy + Math.sin(a1) * rr) + ' Q' + f(cx + Math.cos(a1 + .21) * rr * .86) + ' ' + f(cy + Math.sin(a1 + .21) * rr * .86) + ' ' + f(cx + Math.cos(a2) * rr) + ' ' + f(cy + Math.sin(a2) * rr) + ' ';
      }
    }
    s += '<path d="' + web + '" stroke="#e8e0ff" stroke-width="1" fill="none" opacity=".55"/>';
    return s;
  }
  // la linterna que cuelga de la rama
  function linterna() {
    return '<path d="M330 362 L330 392" stroke="#140c20" stroke-width="2"/>' +
      '<circle class="halo-linterna" cx="330" cy="414" r="48" fill="url(#hwHaloVela)"/>' +
      '<path d="M318 394 L342 394 L346 400 L314 400Z" fill="#1c1230" stroke="' + L + '" stroke-width="1.6"/>' +
      '<path d="M316 400 L344 400 L340 432 L320 432Z" fill="url(#hwVentana)" stroke="' + L + '" stroke-width="1.8"/>' +
      '<path d="M330 400 L330 432 M318 416 L342 416" stroke="' + L + '" stroke-width="1.4"/>' +
      '<path d="M318 432 L342 432 L338 438 L322 438Z" fill="#1c1230" stroke="' + L + '" stroke-width="1.6"/>';
  }
  // el letrero de madera con el título
  function letrero() {
    return '<g transform="rotate(-4 340 560)">' +
      '<path d="M262 560 L262 650 M418 560 L418 650" stroke="#2a1a10" stroke-width="9" stroke-linecap="round"/>' +
      '<path d="M236 516 L446 506 L450 590 L240 600Z" fill="#5a3a22" stroke="' + L + '" stroke-width="2.6" stroke-linejoin="round"/>' +
      '<path d="M240 540 L446 530 M242 566 L448 556" stroke="#3a2412" stroke-width="2" opacity=".7"/>' +
      '<path d="M238 518 L444 508" stroke="#8a5a32" stroke-width="2" opacity=".8"/>' +
      '<circle cx="250" cy="526" r="2.6" fill="#1a1008"/><circle cx="436" cy="516" r="2.6" fill="#1a1008"/><circle cx="252" cy="586" r="2.6" fill="#1a1008"/><circle cx="440" cy="578" r="2.6" fill="#1a1008"/>' +
      '<text x="343" y="548" text-anchor="middle" font-family="Creepster, Fredoka, cursive" font-size="27" fill="#ff9a3a" stroke="#1a0a04" stroke-width="1.2" paint-order="stroke">can\'t take my</text>' +
      '<text x="345" y="580" text-anchor="middle" font-family="Creepster, Fredoka, cursive" font-size="27" fill="#ff9a3a" stroke="#1a0a04" stroke-width="1.2" paint-order="stroke">eyes off you</text>' +
      '</g>';
  }
  function calabaza(cx, cy, r, cara, id) {
    var s = '<ellipse cx="' + cx + '" cy="' + f(cy + r * .78) + '" rx="' + f(r * 1.05) + '" ry="' + f(r * .18) + '" fill="#06030c" opacity=".55"/>';
    s += '<circle class="halo-calabaza" cx="' + cx + '" cy="' + cy + '" r="' + f(r * 2.2) + '" fill="url(#hwHaloCalabaza)"/>';
    // gajos de atrás hacia adelante
    [[-.58, .42, '#b8480e'], [.58, .42, '#b8480e'], [-.3, .46, '#d8601a'], [.3, .46, '#d8601a'], [0, .44, 'url(#hwCalabaza)']].forEach(function (g) {
      s += '<ellipse cx="' + f(cx + g[0] * r) + '" cy="' + cy + '" rx="' + f(g[1] * r) + '" ry="' + f(r * .8) + '" fill="' + g[2] + '" stroke="#3a1406" stroke-width="' + f(Math.max(1.6, r * .035)) + '"/>';
    });
    s += '<path d="M' + f(cx - r * .62) + ' ' + f(cy - r * .5) + ' C' + f(cx - r * .7) + ' ' + f(cy - r * .1) + ' ' + f(cx - r * .7) + ' ' + f(cy + r * .3) + ' ' + f(cx - r * .55) + ' ' + f(cy + r * .55) + '" stroke="#ffb060" stroke-width="' + f(r * .05) + '" fill="none" opacity=".5" stroke-linecap="round"/>';
    // el tallo y un zarcillo
    s += '<path d="M' + f(cx - r * .08) + ' ' + f(cy - r * .74) + ' C' + f(cx - r * .1) + ' ' + f(cy - r * .98) + ' ' + f(cx + r * .02) + ' ' + f(cy - r * 1.08) + ' ' + f(cx + r * .16) + ' ' + f(cy - r * 1.04) +
      ' L' + f(cx + r * .1) + ' ' + f(cy - r * .74) + 'Z" fill="#4a5a22" stroke="#1a2008" stroke-width="2"/>' +
      '<path d="M' + f(cx + r * .1) + ' ' + f(cy - r * .82) + ' c' + f(r * .2) + ' ' + f(-r * .1) + ' ' + f(r * .3) + ' ' + f(r * .08) + ' ' + f(r * .2) + ' ' + f(r * .14) + ' c' + f(-r * .08) + ' ' + f(r * .04) + ' ' + f(-r * .08) + ' ' + f(-r * .08) + ' ' + f(-r * .02) + ' ' + f(-r * .06) + '" stroke="#4a5a22" stroke-width="2" fill="none"/>';
    // la cara tallada, iluminada por dentro (con su borde de cáscara)
    var c = cara === 1
      ? 'M' + f(cx - r * .48) + ' ' + f(cy - r * .02) + ' L' + f(cx - r * .3) + ' ' + f(cy - r * .38) + ' L' + f(cx - r * .1) + ' ' + f(cy - r * .02) + 'Z M' + f(cx + r * .1) + ' ' + f(cy - r * .02) + ' L' + f(cx + r * .3) + ' ' + f(cy - r * .38) + ' L' + f(cx + r * .48) + ' ' + f(cy - r * .02) + 'Z' +
        ' M' + f(cx - r * .07) + ' ' + f(cy + r * .1) + ' L' + f(cx) + ' ' + f(cy - r * .02) + ' L' + f(cx + r * .07) + ' ' + f(cy + r * .1) + 'Z' +
        ' M' + f(cx - r * .55) + ' ' + f(cy + r * .2) + ' C' + f(cx - r * .3) + ' ' + f(cy + r * .62) + ' ' + f(cx + r * .3) + ' ' + f(cy + r * .62) + ' ' + f(cx + r * .55) + ' ' + f(cy + r * .2) +
        ' L' + f(cx + r * .36) + ' ' + f(cy + r * .3) + ' L' + f(cx + r * .3) + ' ' + f(cy + r * .2) + ' L' + f(cx + r * .2) + ' ' + f(cy + r * .34) + ' L' + f(cx + r * .06) + ' ' + f(cy + r * .26) +
        ' L' + f(cx - r * .06) + ' ' + f(cy + r * .36) + ' L' + f(cx - r * .18) + ' ' + f(cy + r * .26) + ' L' + f(cx - r * .3) + ' ' + f(cy + r * .36) + ' L' + f(cx - r * .36) + ' ' + f(cy + r * .22) + 'Z'
      : 'M' + f(cx - r * .42) + ' ' + f(cy - r * .3) + ' L' + f(cx - r * .14) + ' ' + f(cy - r * .14) + ' L' + f(cx - r * .38) + ' ' + f(cy + r * .02) + 'Z M' + f(cx + r * .42) + ' ' + f(cy - r * .3) + ' L' + f(cx + r * .14) + ' ' + f(cy - r * .14) + ' L' + f(cx + r * .38) + ' ' + f(cy + r * .02) + 'Z' +
        ' M' + f(cx - r * .46) + ' ' + f(cy + r * .18) + ' Q' + f(cx) + ' ' + f(cy + r * .66) + ' ' + f(cx + r * .46) + ' ' + f(cy + r * .18) + ' Q' + f(cx) + ' ' + f(cy + r * .36) + ' ' + f(cx - r * .46) + ' ' + f(cy + r * .18) + 'Z';
    s += '<path d="' + c + '" fill="#5a1c06" stroke="#3a1406" stroke-width="2" transform="translate(0 ' + f(-r * .03) + ')"/>' +
      '<path class="cara-calabaza" d="' + c + '" fill="url(#hwFuego)" transform="translate(' + f(r * .02) + ' ' + f(r * .02) + ')"/>';
    return '<g class="calabaza" style="--w:-' + (id * .37).toFixed(2) + 's">' + s + '</g>';
  }
  // ojos brillantes en la oscuridad (de gato, con la pupila rasgada)
  function ojosOscuridad(x, y, sep, tam, color, i, siempre) {
    var s = '';
    [-1, 1].forEach(function (l) {
      var cx = x + l * sep / 2;
      s += '<ellipse cx="' + f(cx) + '" cy="' + y + '" rx="' + f(tam * 2.2) + '" ry="' + f(tam * 1.6) + '" fill="' + color + '" opacity=".22"/>' +
        '<path d="M' + f(cx - tam) + ' ' + y + ' Q' + f(cx) + ' ' + f(y - tam * .9) + ' ' + f(cx + tam) + ' ' + y + ' Q' + f(cx) + ' ' + f(y + tam * .9) + ' ' + f(cx - tam) + ' ' + y + 'Z" fill="' + color + '"/>' +
        '<g class="pupila"><ellipse cx="' + f(cx) + '" cy="' + y + '" rx="' + f(tam * .18) + '" ry="' + f(tam * .62) + '" fill="#0a0410"/></g>';
    });
    return '<g class="ojos-oscuro' + (siempre ? ' siempre' : '') + '" style="--w:-' + (i * .9).toFixed(1) + 's">' + s + '</g>';
  }
  function arbusto(x, y, w, h) {
    var s = '', n = Math.round(w / 26);
    for (var i = 0; i < n; i++) {
      var bx = x + (i + .5) * w / n, br = h * (.45 + R() * .25);
      s += '<circle cx="' + f(bx) + '" cy="' + f(y - br * .6) + '" r="' + f(br) + '" fill="#160d28"/>' +
        '<path d="M' + f(bx - br * .8) + ' ' + f(y - br * 1.1) + ' A' + f(br) + ' ' + f(br) + ' 0 0 1 ' + f(bx + br * .6) + ' ' + f(y - br * 1.45) + '" stroke="#5a4a8a" stroke-width="2.4" fill="none" opacity=".75"/>';
      for (var j = 0; j < 3; j++) {
        var hx = bx + (R() - .5) * br * 1.2, hy = y - br * (.6 + R() * .9);
        s += '<path d="M' + f(hx) + ' ' + f(hy) + ' q4 -6 9 -3 q-3 6 -9 3Z" fill="#2a1e44"/>';
      }
    }
    return s + '<rect x="' + x + '" y="' + f(y - h * .5) + '" width="' + w + '" height="' + f(h * .5 + 4) + '" fill="#160d28"/>';
  }

  // ---- efectos ----
  function fuego(colores, rayos, radio) {
    var s = '';
    for (var i = 0; i < rayos; i++) {
      var a = i / rayos * Math.PI * 2, c = colores[i % colores.length];
      var x1 = Math.cos(a) * radio * .25, y1 = Math.sin(a) * radio * .25, x2 = Math.cos(a) * radio, y2 = Math.sin(a) * radio;
      s += '<path d="M' + f(x1) + ' ' + f(y1) + ' L' + f(x2) + ' ' + f(y2) + '" stroke="' + c + '" stroke-width="3" stroke-linecap="round" opacity=".9"/>' +
        '<circle cx="' + f(x2 * 1.08) + '" cy="' + f(y2 * 1.08) + '" r="3.4" fill="#fffaf0"/>';
      var a2 = a + Math.PI / rayos;
      s += '<circle cx="' + f(Math.cos(a2) * radio * .62) + '" cy="' + f(Math.sin(a2) * radio * .62) + '" r="2.4" fill="' + c + '"/>';
    }
    return '<circle r="' + f(radio * 1.1) + '" fill="' + colores[0] + '" opacity=".12"/>' + s + '<circle r="7" fill="#fffaf0"/>';
  }
  function calabazaLinterna() {
    return '<circle r="60" fill="#ffb84a" opacity=".22"/>' +
      '<ellipse cx="-14" cy="0" rx="18" ry="24" fill="#d8601a" stroke="#3a1406" stroke-width="2"/><ellipse cx="14" cy="0" rx="18" ry="24" fill="#d8601a" stroke="#3a1406" stroke-width="2"/>' +
      '<ellipse cx="0" cy="0" rx="18" ry="25" fill="#f08a2a" stroke="#3a1406" stroke-width="2"/>' +
      '<path d="M-12 -6 L-6 -14 L0 -6Z M2 -6 L8 -14 L14 -6Z M-14 6 Q0 18 14 6 Q0 11 -14 6Z" fill="#fff2a0"/>' +
      '<path d="M0 -25 L0 -40 M-10 -40 L10 -40" stroke="#3a2412" stroke-width="2"/>';
  }
  var PETALO = '<path d="M0 -22 C14 -18 16 4 0 22 C-16 4 -14 -18 0 -22Z" fill="#b8102e" stroke="#5a0614" stroke-width="2"/><path d="M0 -14 L0 12" stroke="#e83a5a" stroke-width="2"/>';
  var FUEGO_FATUO = '<circle r="60" fill="#7affd8" opacity=".18"/><circle r="30" fill="#9affe8" opacity=".3"/>' +
    '<path d="M0 26 C-18 22 -22 4 -12 -8 C-6 -16 -4 -26 0 -40 C4 -26 10 -18 14 -8 C22 6 16 22 0 26Z" fill="#b8fff0" stroke="#3ac8a8" stroke-width="2"/>';

  function construir() {
    construida = true;
    var lienzo = grupo(escena, 'lienzo');
    var lejos = grupo(lienzo, 'plano p-lejos'), medio = grupo(lienzo, 'plano p-medio'), frente = grupo(lienzo, 'plano p-cerca');

    // ---- lejos: cielo, estrellas, luna, nubes, murciélagos y fuegos artificiales ----
    var c = cielo();
    capa(lejos, 'cielo', c.s, c.defs);
    capa(lejos, 'estrellas e1', estrellas(11, 40));
    capa(lejos, 'estrellas e2', estrellas(22, 34));
    capa(lejos, 'estrellas e3', estrellas(33, 28));
    var l = luna();
    capa(lejos, 'luna', l.s, l.defs);
    capa(lejos, 'nubes', nubes());
    [[300, 260, 0], [520, 220, 1.3], [1100, 200, 2.4], [200, 330, 3.2]].forEach(function (p, i) {
      suelto(lejos, 'hw-fugaz', p[0], p[1], 260,
        '<defs><linearGradient id="hwFugaz' + i + '" x1="1" x2="0"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>' +
        '<path d="M-90 -30 L60 20" stroke="url(#hwFugaz' + i + ')" stroke-width="3" stroke-linecap="round"/>' + destello(60, 20, 9, '#fff'), '--w:-' + p[2] + 's');
    });
    var colores = [['#ff8a2a', '#ffd27a', '#fff'], ['#a05aff', '#e0c8ff', '#fff'], ['#6aff8a', '#d0ffd8', '#fff'], ['#ff4a6a', '#ffc0cc', '#fff']];
    [[260, 300, 0, 0], [520, 240, .7, 1], [1100, 170, 1.3, 2], [160, 420, 1.9, 3], [430, 380, 2.4, 0], [1130, 430, 3.1, 1], [640, 210, 3.6, 2],
     [340, 200, .35, 2], [600, 330, 1.05, 3], [1060, 300, 1.6, 0], [200, 250, 2.1, 1], [480, 150, 2.8, 3]].forEach(function (p, i) {
      suelto(lejos, 'hw-fuego' + (i > 6 ? ' extra' : ''), p[0], p[1], i > 6 ? 150 : 190, fuego(colores[p[3]], 16, 80), '--w:' + p[2] + 's');
      // la estela del cohete que sube antes de reventar
      suelto(lejos, 'hw-cohete' + (i > 6 ? ' extra' : ''), p[0], p[1] + 150, 60, '<path d="M0 -40 L0 60" stroke="' + colores[p[3]][0] + '" stroke-width="5" stroke-linecap="round" opacity=".8"/><circle cx="0" cy="-40" r="6" fill="#fffaf0"/>', '--w:' + p[2] + 's');
    });
    // fuegos de corazón (para "déjame amarte" y el final)
    [[360, 260, .4, '#ff4a6a'], [580, 190, 1.5, '#ff8ab0'], [1100, 250, 2.5, '#ff5a8a']].forEach(function (p) {
      var c2 = '<circle r="90" fill="' + p[3] + '" opacity=".1"/>';
      for (var k = 0; k < 30; k++) {
        var tk = k / 30 * Math.PI * 2;
        var x2 = 16 * Math.pow(Math.sin(tk), 3) * 4.6, y2 = -(13 * Math.cos(tk) - 5 * Math.cos(2 * tk) - 2 * Math.cos(3 * tk) - Math.cos(4 * tk)) * 4.6;
        c2 += '<path d="M' + f(x2 * .3) + ' ' + f(y2 * .3) + ' L' + f(x2 * .92) + ' ' + f(y2 * .92) + '" stroke="' + p[3] + '" stroke-width="2" stroke-linecap="round" opacity=".55"/><circle cx="' + f(x2) + '" cy="' + f(y2) + '" r="3.6" fill="#fff4fb"/>';
      }
      suelto(lejos, 'hw-fuego-cor', p[0], p[1], 200, c2, '--w:' + p[2] + 's');
    });
    // murciélagos que vuelan siempre, los que rodean la luna y los que forman el corazón
    for (var b = 0; b < 6; b++) {
      suelto(lejos, 'hw-murcielago vuela v' + (b % 3), 200 + R() * 800, 180 + R() * 220, 44 + R() * 20, murcielago(), '--w:-' + (b * 2.3).toFixed(1) + 's');
    }
    for (var a = 0; a < 14; a++) {
      var ang = a / 14 * Math.PI * 2;
      suelto(lejos, 'hw-murcielago anillo', LUNA.x + Math.cos(ang) * (LUNA.r + 40), LUNA.y + Math.sin(ang) * (LUNA.r + 40), 40, murcielago(), '--w:' + (a * .05).toFixed(2) + 's');
    }
    for (var h = 0; h < 40; h++) {
      var t = h / 40 * Math.PI * 2;
      var hx = 16 * Math.pow(Math.sin(t), 3), hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      suelto(lejos, 'hw-murcielago corazon-bat', LUNA.x + hx * 7.6, LUNA.y + 16 + hy * 7.6, 24, murcielago(), '--w:' + (h * .035).toFixed(2) + 's');
    }

    // ---- medio: colinas lejanas, mansión, humo, ojos en las ventanas, árbol, reja, panteón y calabazas ----
    capa(medio, 'lejanos', lejanos());
    var m = mansion();
    capa(medio, 'mansion', m.s, m.defs);
    capa(medio, 'humo', humo());
    capa(medio, 'ojos-mansion', ojosVentanas());
    var defsPanteon = '<linearGradient id="hwPiedra" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8a80a8"/><stop offset="1" stop-color="#4a4268"/></linearGradient>' +
      '<radialGradient id="hwHaloVela"><stop offset="0" stop-color="#ffc04a" stop-opacity=".6"/><stop offset="1" stop-color="#ffc04a" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="hwVentana" cx=".5" cy=".6" r=".7"><stop offset="0" stop-color="#fff2b0"/><stop offset=".55" stop-color="#ffb84a"/><stop offset="1" stop-color="#e8701c"/></radialGradient>' +
      '<radialGradient id="hwPocion"><stop offset="0" stop-color="#d8ff8a"/><stop offset="1" stop-color="#4ac81a"/></radialGradient>' +
      '<radialGradient id="hwHaloPocion"><stop offset="0" stop-color="#9aff6a" stop-opacity=".35"/><stop offset="1" stop-color="#9aff6a" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="hwSuelo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e1636"/><stop offset="1" stop-color="#0c0818"/></linearGradient>';
    capa(medio, 'reja', reja());
    capa(medio, 'suelo', '<path d="M-10 640 C200 628 420 646 640 640 C820 634 1000 646 1210 638 L1210 810 L-10 810Z" fill="url(#hwSuelo)"/>' +
      '<path d="M-10 640 C200 628 420 646 640 640 C820 634 1000 646 1210 638" stroke="#4a3a6e" stroke-width="2.4" fill="none"/>', defsPanteon);
    capa(medio, 'arbol', arbol() + linterna(), defsPanteon);
    capa(medio, 'tumbas',
      letrero() +
      lapida(500, 690, 70, 96, 5, 'redonda', 'RIP') + lapida(600, 700, 50, 86, -6, 'cruz') + lapida(186, 700, 64, 88, -7, 'redonda', 'RIP') +
      lapida(800, 690, 56, 80, 6, 'redonda', '') + caldero(400, 684) +
      '<g class="velas">' + vela(486, 600, 18, 0) + vela(512, 604, 12, 1) + vela(170, 616, 16, 2) + vela(812, 612, 14, 3) + vela(700, 660, 20, 4) + vela(724, 666, 14, 5) + '</g>', defsPanteon);
    capa(medio, 'calabazas', calabaza(1016, 642, 68, 1, 0) + calabaza(1128, 676, 40, 2, 1) + calabaza(910, 682, 32, 2, 2) + calabaza(58, 672, 28, 1, 3) +
      '<g class="corazon-calabaza"><path d="' + COR + '" transform="translate(1016 644) scale(.84)" fill="#ff3a5a" stroke="#fff2a0" stroke-width="3"/></g>',
      '<radialGradient id="hwCalabaza" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#ffb04a"/><stop offset=".6" stop-color="#f0801c"/><stop offset="1" stop-color="#c8560e"/></radialGradient>' +
      '<radialGradient id="hwFuego" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#fffbe0"/><stop offset=".5" stop-color="#ffd84a"/><stop offset="1" stop-color="#ff8a1a"/></radialGradient>' +
      '<radialGradient id="hwHaloCalabaza"><stop offset="0" stop-color="#ffa03a" stop-opacity=".5"/><stop offset="1" stop-color="#ffa03a" stop-opacity="0"/></radialGradient>');
    // fuegos fatuos del panteón
    [[300, 600], [560, 590], [860, 600], [140, 560], [760, 560]].forEach(function (p, i) {
      suelto(medio, 'hw-fatuo', p[0], p[1], 34, FUEGO_FATUO, '--w:-' + (i * 1.1).toFixed(1) + 's;--x:' + ((R() - .5) * 60).toFixed(0) + 'px');
    });

    // ---- frente: arbustos con ojos, neblina, araña, efectos, relámpago y tintes ----
    capa(frente, 'arbustos', arbusto(-20, 740, 170, 70) + arbusto(1150, 700, 80, 50) + arbusto(840, 650, 60, 30));
    capa(frente, 'ojos-oscuridad',
      ojosOscuridad(60, 694, 30, 9, '#ffd84a', 0, true) + ojosOscuridad(112, 676, 22, 6, '#9aff6a', 1, false) + ojosOscuridad(98, 554, 14, 4, '#ff5a3a', 2, true) +
      ojosOscuridad(870, 634, 20, 5, '#ffd84a', 3, false) + ojosOscuridad(1180, 676, 22, 6, '#ff8a3a', 4, false) + ojosOscuridad(24, 716, 18, 5, '#d08aff', 5, false) +
      ojosOscuridad(570, 530, 16, 4, '#ffd84a', 6, false) + ojosOscuridad(1080, 612, 18, 5, '#9aff6a', 7, false));
    capa(frente, 'niebla',
      '<defs><radialGradient id="hwNiebla"><stop offset="0" stop-color="#c8b8f0" stop-opacity=".42"/><stop offset="1" stop-color="#c8b8f0" stop-opacity="0"/></radialGradient></defs>' +
      [[200, 690, 320, 50], [620, 672, 380, 46], [1020, 700, 320, 52], [420, 740, 360, 44]].map(function (n, i) {
        return '<ellipse class="nube-niebla" style="--w:-' + (i * 3) + 's" cx="' + n[0] + '" cy="' + n[1] + '" rx="' + n[2] + '" ry="' + n[3] + '" fill="url(#hwNiebla)"/>';
      }).join(''));
    capa(frente, 'niebla-alta',
      '<defs><linearGradient id="hwNieblaAlta" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#b8a8e0" stop-opacity=".55"/><stop offset="1" stop-color="#b8a8e0" stop-opacity="0"/></linearGradient></defs>' +
      '<rect x="-20" y="420" width="1240" height="400" fill="url(#hwNieblaAlta)"/>');
    // la araña que baja de la telaraña
    suelto(frente, 'hw-arana', 70, 360, 30, '<path d="M0 -100 L0 -14" stroke="#e8e0ff" stroke-width="2" opacity=".7"/><ellipse cx="0" cy="0" rx="14" ry="16" fill="#100818"/><circle cx="0" cy="-16" r="9" fill="#100818"/>' +
      '<path d="M-12 -4 L-30 -16 L-36 -6 M-12 4 L-32 4 L-36 16 M12 -4 L30 -16 L36 -6 M12 4 L32 4 L36 16 M-10 10 L-24 24 M10 10 L24 24" stroke="#100818" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<circle cx="-4" cy="-18" r="2" fill="#ff5a3a"/><circle cx="4" cy="-18" r="2" fill="#ff5a3a"/>');
    // polvo mágico alrededor de la luna
    for (var d2 = 0; d2 < 12; d2++) {
      var a2 = d2 / 12 * Math.PI * 2;
      suelto(frente, 'hw-destello', LUNA.x + Math.cos(a2) * (LUNA.r + 30 + R() * 40), LUNA.y + Math.sin(a2) * (LUNA.r + 30 + R() * 40), 26 + R() * 14, destello(0, 0, 90, ['#fff6d0', '#ffd27a', '#e0c8ff'][d2 % 3]), '--w:-' + (R() * 1.6).toFixed(2) + 's');
    }
    // corazones de fuego que salen de las calabazas
    for (var cf = 0; cf < 10; cf++) {
      var orig = [[1016, 610], [1128, 656], [910, 664]][cf % 3];
      suelto(frente, 'hw-corazon', orig[0] + (R() - .5) * 30, orig[1], 30 + R() * 18, '<path d="' + COR + '" transform="scale(2.6)" fill="' + ['#ff6a2a', '#ffb03a', '#ff3a5a'][cf % 3] + '" stroke="#fff2b0" stroke-width="2.4"/>',
        '--w:-' + (cf * .4).toFixed(2) + 's;--x:' + ((R() - .5) * 100).toFixed(0) + 'px');
    }
    // calabazas-linterna que suben al cielo
    for (var cl = 0; cl < 9; cl++) {
      suelto(frente, 'hw-linterna', 120 + R() * 980, 700 + R() * 60, 36 + R() * 16, calabazaLinterna(), '--w:-' + (R() * 9).toFixed(2) + 's;--x:' + ((R() - .5) * 120).toFixed(0) + 'px');
    }
    // pétalos de rosa
    for (var pe = 0; pe < 22; pe++) {
      suelto(frente, 'hw-petalo', R() * 1200, -40, 18 + R() * 10, PETALO, '--w:-' + (R() * 7).toFixed(2) + 's;--x:' + (-80 - R() * 220).toFixed(0) + 'px;--g:' + (R() * 720 - 360).toFixed(0) + 'deg');
    }
    // el relámpago
    capa(frente, 'rayo', '<path d="M980 60 L940 170 L972 172 L920 300 L956 300 L880 470" stroke="#c8b8ff" stroke-width="16" fill="none" stroke-linejoin="round" opacity=".4"/>' +
      '<path d="M980 60 L940 170 L972 172 L920 300 L956 300 L880 470" stroke="#fffaf0" stroke-width="6" fill="none" stroke-linejoin="round"/>');
    grupo(frente, 'tinte destello-rayo');
    grupo(frente, 'tinte tinte-calido');
    grupo(frente, 'tinte tinte-calma');
    grupo(frente, 'tinte tinte-rosa');

    // parallax: el cielo se mueve poquito, el frente un poco más; las pupilas siguen al mouse
    function mover(x, y) {
      escena.style.setProperty('--px', ((x - .5) * 2).toFixed(3));
      escena.style.setProperty('--py', ((y - .5) * 2).toFixed(3));
    }
    window.addEventListener('mousemove', function (ev) { if (activa) mover(ev.clientX / innerWidth, ev.clientY / innerHeight); });
    window.addEventListener('touchmove', function (ev) { if (activa) { var t2 = ev.touches[0]; mover(t2.clientX / innerWidth, t2.clientY / innerHeight); } }, { passive: true });
  }

  // ---- la escena reacciona a lo que dice la línea que suena ----
  var lineas = [];
  (window.LETRA_MIRADA_LRC || '').split(/\r?\n/).forEach(function (l2) {
    var mm = l2.match(/^\s*\[(\d+):(\d+(?:\.\d+)?)\](.*)$/);
    if (mm) lineas.push({ t: +mm[1] * 60 + +mm[2], texto: mm[3].trim().toLowerCase() });
  });
  function reaccionar() {
    if (!activa) return;
    var t = audio.currentTime, texto = '';
    for (var i = 0; i < lineas.length; i++) { if (lineas[i].t <= t) texto = lineas[i].texto; else break; }
    // el coro ("te amo, nena") y el solo de metales que lo anuncia: fuegos todo el tiempo
    var coro = (t >= 79 && t < 126) || (t >= 158);
    var clave = texto + '|' + coro;
    if (clave === ultima) return;
    ultima = clave;
    // momentos clave con fuegos artificiales aunque no sea el coro
    var clave2 = /ha llegado|estar vivo|tocar el cielo|déjame amarte|es real/.test(texto);
    escena.classList.toggle('en-buena', /demasiado buena/.test(texto));
    escena.classList.toggle('en-ojos', /apartar mis ojos|te miro/.test(texto));
    escena.classList.toggle('en-cielo', /el cielo/.test(texto));
    escena.classList.toggle('en-abrazo', /abrazarte|quédate/.test(texto));
    escena.classList.toggle('en-llegado', /ha llegado|estar vivo|si sientes|es real/.test(texto));
    escena.classList.toggle('en-vivo', /estar vivo/.test(texto));
    escena.classList.toggle('en-sonrojo', /te miro|se te compare/.test(texto));
    escena.classList.toggle('en-latido', /sin fuerzas|se te compare|te necesito/.test(texto));
    escena.classList.toggle('en-calma', /no me quedan palabras/.test(texto));
    escena.classList.toggle('en-sientes', /si sientes|te amo|si no te molesta/.test(texto));
    escena.classList.toggle('en-real', /es real|créeme/.test(texto));
    escena.classList.toggle('en-fuegos', coro || clave2);
    escena.classList.toggle('en-muchos', coro);
    escena.classList.toggle('en-calido', /noche solitaria/.test(texto));
    escena.classList.toggle('en-amarte', /déjame amarte|no me decepciones|preciosa/.test(texto));
  }
  function limpiar() { ESTADOS.forEach(function (c2) { escena.classList.remove(c2); }); ultima = null; }
  audio.addEventListener('timeupdate', reaccionar);
  audio.addEventListener('ended', limpiar);

  window.Escenas = window.Escenas || {};
  window.Escenas.mirada = {
    el: escena,
    activar: function () {
      if (!construida) construir();
      activa = true;
      // subtítulos de Halloween: letra por letra, con palabras clave resaltadas y salida en humo (css/mirada.css)
      window.SUB_ESPECIAL = { letras: true, claves: /^(ojos|amor|cielo|real|vivo|amarte|nena|preciosa|amo|necesito|quédate|verdad|buena|abrazarte|miro|palabras|fuerzas)$/ };
      limpiar();
      reaccionar();
    },
    desactivar: function () { activa = false; window.SUB_ESPECIAL = null; }
  };
})();
