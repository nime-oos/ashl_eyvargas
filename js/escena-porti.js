// Escena "Es por ti" (Juanes): la carretera junto al mar, con el estilo del álbum (pastel al óleo + marcador
// negro, 3 cuadros que "hierven", movimientos a saltitos). La pareja de espaldas, recargada en la valla,
// mira el mar: él con su traje verde limón y ella con el pelo verde agua recogido, chamarra negra y falda
// roja. Al lado la moto azul, la señal de "no estacionarse" y, a lo lejos, un faro sobre la punta de tierra.
//
// Lo especial: el cielo vive un día entero al ritmo de la canción. Amanece con "me levanto", sale el sol con
// "tus ojos me llevan al sol", se pone rojo con "un rojo atardecer" y cae la noche estrellada con cada
// "es por ti". El brillo del sol o de la luna sobre el mar cambia de color con la hora.
//
// Para que no se trabe: los cielos (4 horas × 3 cuadros), el camino con la valla y la moto, y cada uno de
// los dos se pintan UNA vez y se guardan como imagen. Encima solo van cosas ligeras sin filtros que se
// mueven con transform / opacity (brillos del mar, estrellas, corazones, luciérnagas, el haz del faro...).
//
// La escena reacciona a lo que dice cada línea de la letra:
//   "me levanto"               → amanece (el sol asoma en el horizonte)
//   "a mi lado estás"          → ella aparece a su lado
//   "renovado"                 → rayos de sol
//   "aniquilado / si no estás" → ella desaparece y se hace de noche
//   "al sol"                   → es de día
//   "tu boca / hablar de amor" → suben corazones desde la pareja
//   "rojo atardecer"           → el cielo y el mar se ponen rojos
//   "es por ti"                → noche estrellada, estrellas fugaces y un halo sobre la pareja
//   "late mi corazón"          → los brillos del mar forman un corazón que late
//   "brillan mis ojos"         → el cielo se llena de destellos
//   "calma mi dolor"           → luciérnagas y el mar se queda en calma
//   "te busco / hallar"        → ella no está y el haz del faro barre el mar buscándola
//   "vagabundo / perdido"      → pasan coches con estelas de luz y se prende la moto
//   "desordenado"              → todo se tambalea
//   "mi felicidad"             → ella regresa entre destellos
// Usa las herramientas de crayón de js/escena.js (window.Crayon); se construye la primera vez
// que se elige en el menú de canciones (js/menu.js).
(function () {
  var escena = document.getElementById('escena-porti');
  var audio = document.getElementById('bg-music');
  var C = window.Crayon;
  if (!escena || !audio || !C) return;
  var el = C.el, rnd = C.rnd, pick = C.pick, rayado = C.rayado, trazar = C.trazar, grano = C.grano;
  var CUADROS = C.CUADROS;
  var W = 1200, H = 800, HORIZ = 432, ASTRO_X = 560;
  var SVG = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;overflow:visible">';
  var K = 'stroke="#161616" stroke-linecap="round" stroke-linejoin="round"';
  var HORAS = ['noche', 'amanecer', 'dia', 'atardecer'];
  var ESTADOS = ['en-renovado', 'en-hablar', 'en-porti', 'en-late', 'en-brillan', 'en-calma', 'en-busco', 'en-vagabundo', 'en-desorden', 'en-felicidad',
    'ausente', 'c-noche', 'c-amanecer', 'c-dia', 'c-atardecer'];

  var construida = false, activa = false, cuadro = 0, timer;
  var lienzosMarco = [], cielos = {}, fotos = { frente: [], el: [], ella: [] }, tex = {}, mundo;
  var hora = 'noche', presente = true;

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
  function f(n) { return (+n).toFixed(1); }
  function estrella4(x, y, r, color, clase, w) {
    return '<path class="' + clase + '" style="--w:-' + w + 's" d="M' + f(x) + ' ' + f(y - r) + ' Q' + f(x + r * .15) + ' ' + f(y - r * .15) + ' ' + f(x + r) + ' ' + f(y) +
      ' Q' + f(x + r * .15) + ' ' + f(y + r * .15) + ' ' + f(x) + ' ' + f(y + r) + ' Q' + f(x - r * .15) + ' ' + f(y + r * .15) + ' ' + f(x - r) + ' ' + f(y) +
      ' Q' + f(x - r * .15) + ' ' + f(y - r * .15) + ' ' + f(x) + ' ' + f(y - r) + 'Z" fill="' + color + '" stroke="#161616" stroke-width="1.4"/>';
  }
  var COR = 'M0 30 C-30 12 -40 -8 -32 -20 C-24 -32 -8 -30 0 -16 C8 -30 24 -32 32 -20 C40 -8 30 12 0 30Z';
  function corazon(x, y, s, i) {
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><g class="corazoncito" style="--w:-' + (i * .3).toFixed(2) + 's;--x:' + rnd(-70, 70).toFixed(0) + 'px">' +
      '<g clip-path="url(#ptCor)"><image class="tex-rojo" href="' + tex.rojo[i % CUADROS] + '" x="-42" y="-36" width="84" height="70" preserveAspectRatio="none"/></g>' +
      '<path d="' + COR + '" fill="none" stroke="#161616" stroke-width="6"/></g></g>';
  }

  // ---- los cielos: cada hora pintada con crayón (cielo + mar) ----
  var PALETAS = {
    noche: { base: '#08283a', arriba: ['#051c2a', '#08283a', '#0a2e44', '#062234'], medio: ['#0b3448', '#0e3a50', '#0a3044'], horizonte: ['#145266', '#1a5e72', '#0f4658'],
      mar: ['#0a3c56', '#0e4a68', '#08324a', '#0c4460'] },
    amanecer: { base: '#4a3a7a', arriba: ['#2e2a6a', '#3a3080', '#4a3a8a'], medio: ['#a85a9a', '#c86a8a', '#d87a8a'], horizonte: ['#ffb070', '#ffc88a', '#ff9a6a'],
      mar: ['#6a5a9a', '#9a6a9a', '#c87a8a', '#5a4a8a'] },
    dia: { base: '#5ab0e8', arriba: ['#3a90d8', '#4aa0e0', '#5ab0e8'], medio: ['#7ac0f0', '#8ac8f0', '#9ad0f4'], horizonte: ['#c8e8ff', '#d8f0ff', '#b8e0f8'],
      mar: ['#1a7ab8', '#2a8ac8', '#3aa0d8', '#1a6aa8'] },
    atardecer: { base: '#8a2a40', arriba: ['#3a1a40', '#5a1a48', '#4a1a3a'], medio: ['#c8342a', '#d8442a', '#b82a3a'], horizonte: ['#ff7a2a', '#ffa03a', '#ffc04a'],
      mar: ['#8a2a3a', '#a83a2a', '#c84a2a', '#6a2240'] }
  };
  function pintarCielo(p) {
    var lista = [];
    var hz = { ang: [-.12, .12], len: [120, 340], ancho: [8, 14], alfa: [.55, .9] };
    zona(lista, 70, -40, W + 40, -40, 170, p.arriba, hz);
    zona(lista, 70, -40, W + 40, 130, 330, p.medio, hz);
    zona(lista, 60, -40, W + 40, 300, HORIZ + 4, p.horizonte, hz);
    zona(lista, 80, -40, W + 40, HORIZ, H + 40, p.mar, { ang: [-.06, .06], len: [100, 300], ancho: [6, 10], alfa: [.55, .9] });
    var urls = [];
    for (var q = 0; q < CUADROS; q++) {
      var cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      var cx = cv.getContext('2d');
      cx.fillStyle = p.base; cx.fillRect(0, 0, W, H);
      lista.forEach(function (tr) { trazar(cx, tr, 1.6); });
      // línea del horizonte
      cx.strokeStyle = 'rgba(10,10,20,.55)'; cx.lineWidth = 3;
      cx.beginPath(); cx.moveTo(0, HORIZ + rnd(-1, 1)); cx.lineTo(W, HORIZ + rnd(-1, 1)); cx.stroke();
      grano(cx, W, H, 12000, .09);
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

  // ---- dibujos quietos: se pintan con filtros y se convierten en PNG una sola vez ----
  function patron(id, url) {
    return '<pattern id="' + id + '" patternUnits="userSpaceOnUse" width="160" height="160"><image href="' + url + '" width="160" height="160" preserveAspectRatio="none"/></pattern>';
  }
  function envolver(contenido, semilla) {
    var q = semilla % CUADROS;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + (W * 1.5) + '" height="' + (H * 1.5) + '"><defs>' +
      '<filter id="m" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".025" numOctaves="2" seed="' + semilla + '" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6"/></filter>' +
      '<filter id="p" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="2" seed="' + (semilla + 7) + '" result="w"/><feDisplacementMap in="SourceGraphic" in2="w" scale="7"/></filter>' +
      patron('tAsfalto', tex.asfalto[q]) + patron('tValla', tex.valla[q]) + patron('tTraje', tex.traje[q]) + patron('tPeloEl', tex.peloEl[q]) +
      patron('tPeloElla', tex.peloElla[q]) + patron('tFalda', tex.falda[q]) + patron('tChamarra', tex.chamarra[q]) + patron('tMoto', tex.moto[q]) + patron('tTierra', tex.tierra[q]) +
      '</defs>' + contenido + '</svg>';
  }
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

  // el camino: punta de tierra con el faro, la valla, el asfalto, la señal y la moto
  function svgFrente() {
    var s = '';
    // punta de tierra y faro a lo lejos
    s += '<g filter="url(#m)" transform="translate(-80 0)"><path d="M1040 ' + (HORIZ + 1) + ' C1080 414 1120 402 1180 398 L1330 398 L1330 ' + (HORIZ + 1) + 'Z" fill="url(#tTierra)" ' + K + ' stroke-width="2.4"/>' +
      '<path d="M1144 404 L1148 336 L1164 336 L1168 404Z" fill="#f4f0e6" ' + K + ' stroke-width="2"/>' +
      '<path d="M1146 360 L1166 360 L1166 372 L1146 372Z M1147 384 L1167 384 L1167 396 L1146 396Z" fill="#d83a2a"/>' +
      '<path d="M1142 336 L1170 336 L1166 322 L1146 322Z" fill="#2a2a3a" ' + K + ' stroke-width="1.8"/><path d="M1146 322 L1156 312 L1166 322Z" fill="#d83a2a" ' + K + ' stroke-width="1.6"/></g>';
    // el asfalto
    var CAMINO = 'M-40 604 L1240 600 L1240 830 L-40 830Z';
    s += '<g filter="url(#p)"><path d="' + CAMINO + '" fill="url(#tAsfalto)"/></g>' +
      '<g filter="url(#m)"><path d="M-40 604 L1240 600" stroke="#161616" stroke-width="3" fill="none"/>' +
      '<path d="M-40 622 L1240 618" stroke="#e8ecf0" stroke-width="5" fill="none"/>' +
      '<path d="M-40 760 L1240 754" stroke="#e8ecf0" stroke-width="6" stroke-dasharray="70 60" fill="none" opacity=".7"/></g>';
    // la valla de contención con sus postes
    var postes = '';
    for (var x = -10; x < 1250; x += 92) postes += '<path d="M' + x + ' 560 L' + (x - 1) + ' 612" stroke="#161616" stroke-width="11" stroke-linecap="round"/><path d="M' + x + ' 560 L' + (x - 1) + ' 612" stroke="#8a96a4" stroke-width="6" stroke-linecap="round"/>';
    s += '<g filter="url(#m)">' + postes +
      '<path d="M-40 552 L1240 546 L1240 584 L-40 590Z" fill="url(#tValla)" ' + K + ' stroke-width="3"/>' +
      '<path d="M-40 564 L1240 558 M-40 576 L1240 571" stroke="#5a6674" stroke-width="2.4" fill="none"/>' +
      '<path d="M-40 556 L1240 550" stroke="#f0f4f8" stroke-width="2.4" fill="none" opacity=".8"/></g>';
    // la señal de no estacionarse
    s += '<g filter="url(#m)"><path d="M1012 330 L1014 610" stroke="#161616" stroke-width="9"/><path d="M1012 330 L1014 610" stroke="#a8b0bc" stroke-width="5"/>' +
      '<circle cx="1012" cy="300" r="34" fill="#d82a2a" ' + K + ' stroke-width="3"/><circle cx="1012" cy="300" r="25" fill="#2a4ab8"/>' +
      '<path d="M994 282 L1030 318" stroke="#d82a2a" stroke-width="8" stroke-linecap="round"/>' +
      '<rect x="996" y="342" width="32" height="14" rx="2" fill="#f4f4f0" ' + K + ' stroke-width="1.8"/><path d="M1002 349 L1022 349 M1017 345 L1022 349 L1017 353" stroke="#d82a2a" stroke-width="2" fill="none"/></g>';
    // la moto deportiva azul: carenado completo, parabrisas, tanque, colín levantado y escape
    s += '<g filter="url(#m)">' +
      // llantas con rines de rayos
      '<circle cx="420" cy="642" r="40" fill="#1a1a22" ' + K + ' stroke-width="3"/><circle cx="420" cy="642" r="24" fill="#3a3a44" stroke="#161616" stroke-width="2"/>' +
      '<path d="M420 620 L420 664 M398 642 L442 642 M405 627 L435 657 M435 627 L405 657" stroke="#c8d0d8" stroke-width="3"/><circle cx="420" cy="642" r="6" fill="#c8d0d8" stroke="#161616" stroke-width="1.6"/>' +
      '<circle cx="584" cy="642" r="40" fill="#1a1a22" ' + K + ' stroke-width="3"/><circle cx="584" cy="642" r="24" fill="#3a3a44" stroke="#161616" stroke-width="2"/>' +
      '<path d="M584 620 L584 664 M562 642 L606 642 M569 627 L599 657 M599 627 L569 657" stroke="#c8d0d8" stroke-width="3"/><circle cx="584" cy="642" r="6" fill="#c8d0d8" stroke="#161616" stroke-width="1.6"/>' +
      '<circle cx="584" cy="642" r="15" fill="none" stroke="#d82a2a" stroke-width="3"/>' +
      // horquilla delantera inclinada y basculante
      '<path d="M584 642 L556 562" stroke="#161616" stroke-width="11" stroke-linecap="round"/><path d="M584 642 L556 562" stroke="#e8c83a" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M420 642 L486 618" stroke="#161616" stroke-width="12" stroke-linecap="round"/><path d="M420 642 L486 618" stroke="#8a96a4" stroke-width="7" stroke-linecap="round"/>' +
      // escape que sube bajo el colín
      '<path d="M478 628 L432 604 L398 590" stroke="#161616" stroke-width="13" stroke-linecap="round"/><path d="M478 628 L432 604 L398 590" stroke="#c8d0d8" stroke-width="8" stroke-linecap="round"/>' +
      '<path d="M396 584 L392 598" stroke="#161616" stroke-width="3"/>' +
      // colín levantado con su calavera
      '<path d="M372 552 L470 566 L478 590 L430 590 C410 588 388 574 372 552Z" fill="url(#tMoto)" ' + K + ' stroke-width="3"/>' +
      '<path d="M372 552 L364 556 L370 562" fill="#d82a2a" stroke="#161616" stroke-width="1.6"/>' +
      // asiento
      '<path d="M410 560 C430 552 456 552 478 560 L476 570 C456 564 432 564 412 568Z" fill="#1a1a22" ' + K + ' stroke-width="2"/>' +
      // tanque
      '<path d="M474 560 C484 536 520 530 548 540 L554 560 C530 556 500 560 478 572Z" fill="url(#tMoto)" ' + K + ' stroke-width="3"/>' +
      '<path d="M486 552 C500 542 522 540 540 546" stroke="#e8f0ff" stroke-width="3" fill="none" opacity=".7"/>' +
      // carenado principal con franja amarilla y el número
      '<path d="M470 572 C500 560 540 556 568 546 L616 572 C624 586 620 604 604 612 L548 616 C520 616 494 612 474 604 C466 594 464 582 470 572Z" fill="url(#tMoto)" ' + K + ' stroke-width="3"/>' +
      '<path d="M484 588 C520 584 566 580 612 584 L610 594 C566 590 520 594 486 598Z" fill="#e8c83a" stroke="#161616" stroke-width="1.8"/>' +
      '<path d="M500 604 L540 608 M520 570 L560 562" stroke="#1a3a98" stroke-width="2.4"/>' +
      '<circle cx="520" cy="580" r="10" fill="#f4f4f0" stroke="#161616" stroke-width="1.8"/><text x="520" y="584.5" text-anchor="middle" font-family="Fredoka, Arial, sans-serif" font-weight="700" font-size="12" fill="#161616">7</text>' +
      // nariz del carenado con el faro y el parabrisas
      '<path d="M568 546 C590 536 610 544 626 566 L616 572Z" fill="url(#tMoto)" ' + K + ' stroke-width="2.6"/>' +
      '<path d="M606 566 L624 570 L620 580 L604 578Z" fill="#fff6c8" stroke="#161616" stroke-width="1.8"/>' +
      '<path d="M562 548 C572 526 590 518 606 522 L616 548 C600 540 582 540 566 552Z" fill="#9ad0f0" fill-opacity=".75" stroke="#161616" stroke-width="2.2"/>' +
      '<path d="M574 536 C582 528 592 526 600 528" stroke="#ffffff" stroke-width="2" fill="none" opacity=".8"/>' +
      // manubrio y espejo
      '<path d="M552 546 L540 540 L532 542" stroke="#161616" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M566 526 L574 516" stroke="#161616" stroke-width="2.4"/><ellipse cx="577" cy="513" rx="6" ry="4" fill="#3a3a44" stroke="#161616" stroke-width="1.4"/>' +
      // estribera
      '<path d="M480 612 L498 616" stroke="#c8d0d8" stroke-width="4" stroke-linecap="round"/>' +
      '</g>';
    return s;
  }
  // él, de espaldas (pies en 770, 650)
  function svgEl() {
    var x = 770;
    return '<g filter="url(#m)">' +
      // piernas y zapatos
      '<path d="M' + (x - 16) + ' 500 L' + (x - 18) + ' 646 L' + (x - 2) + ' 646 L' + (x - 1) + ' 520 L' + (x + 2) + ' 520 L' + (x + 4) + ' 646 L' + (x + 20) + ' 646 L' + (x + 18) + ' 500Z" fill="url(#tTraje)" ' + K + ' stroke-width="2.6"/>' +
      '<path d="M' + (x - 22) + ' 646 L' + (x - 1) + ' 646 L' + (x - 1) + ' 656 L' + (x - 24) + ' 656Z M' + (x + 3) + ' 646 L' + (x + 24) + ' 646 L' + (x + 26) + ' 656 L' + (x + 3) + ' 656Z" fill="#3a2a1a" ' + K + ' stroke-width="2"/>' +
      // saco
      '<path d="M' + (x - 32) + ' 382 C' + (x - 20) + ' 370 ' + (x + 20) + ' 370 ' + (x + 32) + ' 382 L' + (x + 30) + ' 510 L' + (x - 30) + ' 510Z" fill="url(#tTraje)" ' + K + ' stroke-width="2.8"/>' +
      '<path d="M' + x + ' 440 L' + x + ' 510 M' + (x - 26) + ' 470 L' + (x + 26) + ' 470" stroke="#7a8a1a" stroke-width="2.4"/>' +
      // brazos
      '<path d="M' + (x - 30) + ' 386 C' + (x - 40) + ' 420 ' + (x - 42) + ' 460 ' + (x - 38) + ' 492" stroke="#161616" stroke-width="18" stroke-linecap="round" fill="none"/>' +
      '<path d="M' + (x - 30) + ' 386 C' + (x - 40) + ' 420 ' + (x - 42) + ' 460 ' + (x - 38) + ' 492" stroke="#b8c43a" stroke-width="13" stroke-linecap="round" fill="none"/>' +
      '<path d="M' + (x + 30) + ' 386 C' + (x + 40) + ' 420 ' + (x + 42) + ' 456 ' + (x + 36) + ' 486" stroke="#161616" stroke-width="18" stroke-linecap="round" fill="none"/>' +
      '<path d="M' + (x + 30) + ' 386 C' + (x + 40) + ' 420 ' + (x + 42) + ' 456 ' + (x + 36) + ' 486" stroke="#b8c43a" stroke-width="13" stroke-linecap="round" fill="none"/>' +
      // cuello y nuca
      '<path d="M' + (x - 9) + ' 372 L' + (x - 9) + ' 356 L' + (x + 9) + ' 356 L' + (x + 9) + ' 372Z" fill="#e0b08a" ' + K + ' stroke-width="2"/>' +
      '<path d="M' + (x - 12) + ' 374 L' + x + ' 382 L' + (x + 12) + ' 374" stroke="#f4f0e6" stroke-width="4" fill="none"/>' +
      '<ellipse cx="' + x + '" cy="336" rx="21" ry="25" fill="url(#tPeloEl)" ' + K + ' stroke-width="2.6"/>' +
      '<path d="M' + (x - 21) + ' 340 C' + (x - 24) + ' 330 ' + (x - 22) + ' 344 ' + (x - 24) + ' 348 L' + (x - 20) + ' 350Z M' + (x + 21) + ' 340 C' + (x + 24) + ' 330 ' + (x + 22) + ' 344 ' + (x + 24) + ' 348 L' + (x + 20) + ' 350Z" fill="#e0b08a" ' + K + ' stroke-width="1.6"/>' +
      '<path d="M' + (x - 12) + ' 318 C' + (x - 6) + ' 324 ' + (x + 6) + ' 324 ' + (x + 12) + ' 318" stroke="#7a4a2a" stroke-width="2" fill="none"/>' +
      '</g>';
  }
  // ella, de espaldas, tomada del brazo de él (pies en 828, 652)
  function svgElla() {
    var x = 828;
    return '<g filter="url(#m)">' +
      // falda larga roja
      '<path d="M' + (x - 22) + ' 470 C' + (x - 28) + ' 540 ' + (x - 32) + ' 600 ' + (x - 30) + ' 646 L' + (x + 30) + ' 646 C' + (x + 32) + ' 600 ' + (x + 28) + ' 540 ' + (x + 22) + ' 470Z" fill="url(#tFalda)" ' + K + ' stroke-width="2.6"/>' +
      '<path d="M' + (x - 8) + ' 490 C' + (x - 10) + ' 560 ' + (x - 12) + ' 600 ' + (x - 14) + ' 644 M' + (x + 10) + ' 494 C' + (x + 12) + ' 560 ' + (x + 12) + ' 600 ' + (x + 14) + ' 644" stroke="#8a1a1a" stroke-width="2" fill="none"/>' +
      '<path d="M' + (x - 18) + ' 646 L' + (x - 6) + ' 646 L' + (x - 6) + ' 656 L' + (x - 20) + ' 656Z M' + (x + 6) + ' 646 L' + (x + 18) + ' 646 L' + (x + 20) + ' 656 L' + (x + 6) + ' 656Z" fill="#1a1a22" ' + K + ' stroke-width="1.8"/>' +
      // chamarra negra
      '<path d="M' + (x - 26) + ' 406 C' + (x - 16) + ' 396 ' + (x + 16) + ' 396 ' + (x + 26) + ' 406 L' + (x + 26) + ' 482 L' + (x - 26) + ' 482Z" fill="url(#tChamarra)" ' + K + ' stroke-width="2.6"/>' +
      // brazo que toma el de él
      '<path d="M' + (x - 24) + ' 412 C' + (x - 40) + ' 430 ' + (x - 48) + ' 446 ' + (x - 54) + ' 456" stroke="#161616" stroke-width="15" stroke-linecap="round" fill="none"/>' +
      '<path d="M' + (x - 24) + ' 412 C' + (x - 40) + ' 430 ' + (x - 48) + ' 446 ' + (x - 54) + ' 456" stroke="#24222c" stroke-width="10" stroke-linecap="round" fill="none"/>' +
      '<path d="M' + (x + 24) + ' 412 C' + (x + 32) + ' 440 ' + (x + 32) + ' 466 ' + (x + 28) + ' 488" stroke="#161616" stroke-width="15" stroke-linecap="round" fill="none"/>' +
      '<path d="M' + (x + 24) + ' 412 C' + (x + 32) + ' 440 ' + (x + 32) + ' 466 ' + (x + 28) + ' 488" stroke="#24222c" stroke-width="10" stroke-linecap="round" fill="none"/>' +
      // cuello y cabeza con el pelo verde agua recogido
      '<path d="M' + (x - 6) + ' 400 L' + (x - 6) + ' 388 L' + (x + 6) + ' 388 L' + (x + 6) + ' 400Z" fill="#e8bc98" ' + K + ' stroke-width="1.8"/>' +
      '<ellipse cx="' + x + '" cy="370" rx="18" ry="21" fill="url(#tPeloElla)" ' + K + ' stroke-width="2.4"/>' +
      '<circle cx="' + (x + 4) + '" cy="346" r="11" fill="url(#tPeloElla)" ' + K + ' stroke-width="2.2"/>' +
      '<path d="M' + (x - 10) + ' 356 C' + (x - 4) + ' 362 ' + (x + 6) + ' 362 ' + (x + 12) + ' 356" stroke="#1a7a6a" stroke-width="2" fill="none"/>' +
      '<path d="M' + (x - 3) + ' 340 L' + (x + 12) + ' 352" stroke="#e8c83a" stroke-width="2.6"/>' +
      '</g>';
  }

  function construir() {
    construida = true;
    HORAS.forEach(function (h) { cielos[h] = pintarCielo(PALETAS[h]); });
    tex.asfalto = texSet('#3a4452', ['#4a5462', '#2a3442', '#566070', '#323c4a'], 45);
    tex.valla = texSet('#b8c0ca', ['#c8d0d8', '#9aa4b0', '#d8e0e8'], 30);
    tex.traje = texSet('#b8c43a', ['#c8d24a', '#a0ac2a', '#d8e05a', '#8a9a1a'], 35);
    tex.peloEl = texSet('#7a4a2a', ['#8a5a3a', '#5a3418', '#9a6a40'], 30);
    tex.peloElla = texSet('#3aa898', ['#4ab8a8', '#2a8a7a', '#5ac8b8', '#1a7a6a'], 30);
    tex.falda = texSet('#d83a2a', ['#e84a3a', '#b82a1a', '#f05a40'], 30);
    tex.chamarra = texSet('#1e1c26', ['#2a2834', '#14121a', '#34323e'], 25);
    tex.moto = texSet('#2a4ab8', ['#3a5ac8', '#1a3a98', '#4a6ad8', '#2a3a8a'], 30);
    tex.tierra = texSet('#1e2a2a', ['#2a3a34', '#141e1e', '#34443a'], 25);
    tex.rojo = C.texRojo;
    for (var q = 0; q < CUADROS; q++) (function (q) {
      fotos.frente[q] = aImagen(envolver(svgFrente(), q + 1), function (png) { fotos.frente[q] = png; });
      fotos.el[q] = aImagen(envolver(svgEl(), q + 1), function (png) { fotos.el[q] = png; });
      fotos.ella[q] = aImagen(envolver(svgElla(), q + 1), function (png) { fotos.ella[q] = png; });
    })(q);

    mundo = el('mundo', escena);

    // ---- capa 1: los cuatro cielos encimados, estrellas, luna, sol, rayos y brillos del mar ----
    var capasCielo = '';
    HORAS.forEach(function (h) {
      capasCielo += '<image class="cielo cielo-' + h + '" data-hora="' + h + '" href="' + cielos[h][0] + '" x="0" y="0" width="' + W + '" height="' + H + '" preserveAspectRatio="none"/>';
    });
    var estrellas = '';
    for (var e = 0; e < 60; e++) {
      var ex = rnd(10, W - 10), ey = rnd(10, HORIZ - 30);
      estrellas += Math.random() < .3 ? estrella4(ex, ey, rnd(3, 6), pick(['#fff6c8', '#ffffff', '#c8f0ff']), 'estrella', rnd(0, 3).toFixed(2))
        : '<circle class="estrella" style="--w:-' + rnd(0, 3).toFixed(2) + 's" cx="' + f(ex) + '" cy="' + f(ey) + '" r="' + f(rnd(1, 2.6)) + '" fill="#f4fbff"/>';
    }
    var destellos = '';
    for (var d = 0; d < 16; d++) destellos += estrella4(rnd(40, W - 40), rnd(30, HORIZ - 40), rnd(8, 18), pick(['#fff6c8', '#ffffff', '#ffd2ea', '#c8f0ff']), 'destello', rnd(0, 1.2).toFixed(2));
    var fugaces = '';
    [[1100, 60, 0], [900, 30, .8], [1180, 140, 1.6], [700, 50, 2.3]].forEach(function (s) {
      fugaces += '<g class="fugaz" style="--w:-' + s[2] + 's"><path d="M' + s[0] + ' ' + s[1] + ' l90 -40" stroke="#fff6c8" stroke-width="4" stroke-linecap="round" opacity=".7"/>' + estrella4(s[0], s[1], 9, '#fff6c8', 'punta', 0) + '</g>';
    });
    var rayos = '';
    for (var r = 0; r < 14; r++) {
      var a = Math.PI + r / 13 * Math.PI, a1 = a - .05, a2 = a + .05;
      rayos += 'M' + ASTRO_X + ' ' + HORIZ + ' L' + f(ASTRO_X + Math.cos(a1) * 900) + ' ' + f(HORIZ + Math.sin(a1) * 900) + ' L' + f(ASTRO_X + Math.cos(a2) * 900) + ' ' + f(HORIZ + Math.sin(a2) * 900) + 'Z ';
    }
    // brillos del mar bajo el sol / la luna
    var brillos = '';
    for (var b = 0; b < 80; b++) {
      var by = HORIZ + 4 + Math.pow(Math.random(), 1.3) * 120, ancho = 16 + (by - HORIZ) * 1.6;
      brillos += '<ellipse class="brillo" style="--w:-' + rnd(0, 2).toFixed(2) + 's" cx="' + f(ASTRO_X + rnd(-1, 1) * ancho) + '" cy="' + f(by) + '" rx="' + f(rnd(3, 9) * (1 + (by - HORIZ) / 120)) + '" ry="' + f(rnd(1.2, 2.4)) + '"/>';
    }
    // corazón hecho de brillos en el mar ("late mi corazón")
    var corMar = '';
    for (var c = 0; c < 44; c++) {
      var t = c / 44 * Math.PI * 2;
      var hx = 16 * Math.pow(Math.sin(t), 3), hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      corMar += '<ellipse cx="' + f(ASTRO_X + hx * 7.5) + '" cy="' + f(478 + hy * 2.3) + '" rx="' + f(rnd(4, 7)) + '" ry="2" fill="#ff8ab0"/>';
    }

    el('capa capa-fondo', mundo).innerHTML = SVG +
      '<defs><radialGradient id="ptHaloLuna"><stop offset=".35" stop-color="#e8fbff" stop-opacity=".5"/><stop offset="1" stop-color="#e8fbff" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="ptHaloSol"><stop offset=".25" stop-color="#ffe08a" stop-opacity=".8"/><stop offset="1" stop-color="#ffa03a" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="ptRayo" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff2c8" stop-opacity=".45"/><stop offset="1" stop-color="#fff2c8" stop-opacity="0"/></linearGradient>' +
        '<clipPath id="ptCielo"><rect x="-100" y="-100" width="1400" height="' + (HORIZ + 100) + '"/></clipPath></defs>' +
      capasCielo +
      '<g class="estrellas">' + estrellas + '</g>' +
      '<g class="fugaces">' + fugaces + '</g>' +
      '<g clip-path="url(#ptCielo)">' +
        '<g class="rayos"><path d="' + rayos + '" fill="url(#ptRayo)"/></g>' +
        // la luna
        '<g class="luna"><circle cx="' + ASTRO_X + '" cy="250" r="120" fill="url(#ptHaloLuna)"/><circle cx="' + ASTRO_X + '" cy="250" r="30" fill="#f0fbff" stroke="#161616" stroke-width="2.4"/>' +
          '<circle cx="' + (ASTRO_X - 7) + '" cy="243" r="6" fill="#c8e0ea"/><circle cx="' + (ASTRO_X + 8) + '" cy="259" r="7" fill="#c8e0ea"/></g>' +
        // el sol (sube y baja con la hora)
        '<g class="sol"><circle cx="' + ASTRO_X + '" cy="150" r="190" fill="url(#ptHaloSol)"/><circle class="disco-sol" cx="' + ASTRO_X + '" cy="150" r="52" stroke="#161616" stroke-width="3"/></g>' +
      '</g>' +
      '<g class="destellos">' + destellos + '</g>' +
      '<g class="brillos">' + brillos + '</g>' +
      '<g class="cor-mar">' + corMar + '</g>' +
    '</svg>';

    // ---- capa 2: el camino, la pareja (ya pintados) y lo que pasa a su alrededor ----
    var coches = '';
    [[0, '#ffe8a0', 1], [1.3, '#ff6a5a', -1], [2.4, '#ffe8a0', 1]].forEach(function (c, i) {
      coches += '<g class="coche ' + (c[2] > 0 ? 'ida' : 'vuelta') + '" style="--w:-' + c[0] + 's"><rect x="-260" y="' + (642 + i * 24) + '" width="260" height="10" rx="5" fill="url(#ptEstela' + (c[2] > 0 ? 'A' : 'B') + ')"/>' +
        '<circle cx="' + (c[2] > 0 ? 0 : -260) + '" cy="' + (647 + i * 24) + '" r="7" fill="' + c[1] + '"/></g>';
    });
    var luciernagas = '';
    for (var l = 0; l < 26; l++) {
      luciernagas += '<circle class="luciernaga" style="--w:-' + rnd(0, 4).toFixed(2) + 's;--x:' + rnd(-50, 50).toFixed(0) + 'px;--y:' + rnd(-60, -10).toFixed(0) + 'px" cx="' + f(rnd(100, 1100)) + '" cy="' + f(rnd(300, 640)) + '" r="' + f(rnd(2.5, 4.5)) + '" fill="#f8ff9a"/>';
    }
    var chispas = '';
    for (var ch = 0; ch < 14; ch++) {
      var ang = ch / 14 * Math.PI * 2;
      chispas += estrella4(828 + Math.cos(ang) * rnd(40, 80), 470 + Math.sin(ang) * rnd(80, 140), rnd(6, 11), pick(['#fff6c8', '#ffd2ea', '#c8f0ff']), 'chispa', rnd(0, 1).toFixed(2));
    }
    var corazones = '';
    [[790, 330, .4], [830, 300, .32], [760, 290, .36], [850, 340, .3], [810, 260, .28], [740, 340, .3]].forEach(function (c, i) { corazones += corazon(c[0], c[1], c[2], i); });

    el('capa capa-pared', mundo).innerHTML = SVG +
      '<defs><clipPath id="ptCor"><path d="' + COR + '"/></clipPath>' +
        '<linearGradient id="ptEstelaA" x1="0" x2="1"><stop offset="0" stop-color="#ffe8a0" stop-opacity="0"/><stop offset="1" stop-color="#ffe8a0" stop-opacity=".9"/></linearGradient>' +
        '<linearGradient id="ptEstelaB" x1="1" x2="0"><stop offset="0" stop-color="#ff6a5a" stop-opacity="0"/><stop offset="1" stop-color="#ff6a5a" stop-opacity=".9"/></linearGradient>' +
        '<radialGradient id="ptHalo"><stop offset=".2" stop-color="#ffe8f4" stop-opacity=".55"/><stop offset="1" stop-color="#ffd2ea" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="ptHaz" x1="1" x2="0"><stop offset="0" stop-color="#fff6c8" stop-opacity=".6"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></linearGradient>' +
        '<radialGradient id="ptFaro"><stop offset="0" stop-color="#ffe8a0" stop-opacity=".8"/><stop offset="1" stop-color="#ffe8a0" stop-opacity="0"/></radialGradient></defs>' +
      // el haz del faro que barre el mar
      '<g class="haz-faro"><path d="M1076 328 L540 290 L540 380Z" fill="url(#ptHaz)"/></g>' +
      '<circle class="luz-faro" cx="1076" cy="328" r="16" fill="url(#ptFaro)"/>' +
      '<g class="desorden">' +
        '<image class="foto-frente" href="' + fotos.frente[0] + '" x="0" y="0" width="' + W + '" height="' + H + '"/>' +
        // la luz de la moto
        '<g class="faro-moto"><path d="M620 574 L780 540 L780 620Z" fill="url(#ptFaro)"/><circle cx="618" cy="574" r="8" fill="#fff6c8"/></g>' +
        '<ellipse class="halo-pareja" cx="800" cy="470" rx="140" ry="210" fill="url(#ptHalo)"/>' +
        '<g class="el"><image class="foto-el" href="' + fotos.el[0] + '" x="0" y="0" width="' + W + '" height="' + H + '"/></g>' +
        '<g class="ella"><image class="foto-ella" href="' + fotos.ella[0] + '" x="0" y="0" width="' + W + '" height="' + H + '"/></g>' +
        '<g class="chispas">' + chispas + '</g>' +
        '<g class="coches">' + coches + '</g>' +
      '</g>' +
      '<g class="corazones">' + corazones + '</g>' +
      '<g class="luciernagas">' + luciernagas + '</g>' +
    '</svg>';

    // ---- capa 3: el título pintado en el asfalto como señal de carretera ----
    el('capa capa-frente', mundo).innerHTML = SVG +
      '<g class="firma">' +
        '<text x="128" y="628" font-family="Caveat, cursive" font-weight="700" font-size="26" fill="#ffe08a" transform="rotate(-3 128 628)" stroke="#161616" stroke-width="1" paint-order="stroke">Juanes</text>' +
        '<g transform="translate(126 680) skewX(-20) scale(1 .7)"><text class="titulo-camino" x="0" y="0" font-family="Fredoka, \'Arial Rounded MT Bold\', sans-serif" font-weight="700" font-size="58" fill="#f4f6f8" stroke="#161616" stroke-width="3" paint-order="stroke" letter-spacing="2">ES POR TI</text></g>' +
        '<path class="cor-camino" d="' + COR + '" transform="translate(262 624) scale(.42)" fill="#ff5a7a" stroke="#161616" stroke-width="5"/>' +
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

  // ---- "hervor": solo se cambian imágenes ya pintadas (barato); los cielos tapados no se tocan ----
  function hervir() {
    cuadro = (cuadro + 1) % CUADROS;
    lienzosMarco.forEach(function (cv, i) { cv.style.opacity = i === cuadro ? 1 : 0; });
    escena.querySelectorAll('.cielo').forEach(function (im) {
      var h = im.getAttribute('data-hora');
      if (h === 'noche' || h === hora) im.setAttribute('href', cielos[h][cuadro]);
    });
    escena.querySelector('.foto-frente').setAttribute('href', fotos.frente[cuadro]);
    escena.querySelector('.foto-el').setAttribute('href', fotos.el[cuadro]);
    escena.querySelector('.foto-ella').setAttribute('href', fotos.ella[cuadro]);
    escena.querySelectorAll('.tex-rojo').forEach(function (im, i) { im.setAttribute('href', tex.rojo[(cuadro + i) % CUADROS]); });
  }

  // ---- la escena reacciona a lo que dice la línea que suena ----
  var lineas = [];
  (window.LETRA_PORTI_LRC || '').split(/\r?\n/).forEach(function (l) {
    var m = l.match(/^\s*\[(\d+):(\d+(?:\.\d+)?)\](.*)$/);
    if (m) lineas.push({ t: +m[1] * 60 + +m[2], texto: m[3].trim().toLowerCase() });
  });
  // la hora del cielo y si ella está se quedan como estaban hasta que otra línea las cambie
  function ponerHora(h) {
    hora = h;
    HORAS.forEach(function (o) { escena.classList.toggle('c-' + o, o === h); });
  }
  var ultima = null;
  function reaccionar() {
    if (!activa) return;
    var t = audio.currentTime, texto = '', idx = -1;
    for (var i = 0; i < lineas.length; i++) { if (lineas[i].t <= t) { texto = lineas[i].texto; idx = i; } else break; }
    if (texto === ultima) return;
    ultima = texto;
    // antes de la primera línea: el estado inicial
    if (idx < 0) { ponerHora('noche'); presente = true; }
    if (/levanto/.test(texto)) ponerHora('amanecer');
    if (/al sol/.test(texto)) ponerHora('dia');
    if (/atardecer|tu piel/.test(texto)) ponerHora('atardecer');
    if (/aniquilado|te busco|^y es por ti/.test(texto)) ponerHora('noche');
    if (/a mi lado|controlas|felicidad|tus ojos/.test(texto)) presente = true;
    if (/si no estás|te busco|hallar|vagabundo|perdido/.test(texto)) presente = false;
    escena.classList.toggle('ausente', !presente);
    escena.classList.toggle('en-renovado', /renovado/.test(texto));
    escena.classList.toggle('en-hablar', /tu boca|hablar de amor/.test(texto));
    escena.classList.toggle('en-porti', /por ti|^que /.test(texto));
    escena.classList.toggle('en-late', /late mi corazón/.test(texto));
    escena.classList.toggle('en-brillan', /brillan mis ojos/.test(texto));
    escena.classList.toggle('en-calma', /calma mi dolor/.test(texto));
    escena.classList.toggle('en-busco', /te busco|hallar/.test(texto));
    escena.classList.toggle('en-vagabundo', /vagabundo|perdido/.test(texto));
    escena.classList.toggle('en-desorden', /desordenado/.test(texto));
    escena.classList.toggle('en-felicidad', /felicidad/.test(texto));
  }
  function limpiar() { ESTADOS.forEach(function (c) { escena.classList.remove(c); }); ultima = null; presente = true; ponerHora('noche'); }
  audio.addEventListener('timeupdate', reaccionar);
  audio.addEventListener('ended', limpiar);

  window.Escenas = window.Escenas || {};
  window.Escenas.porti = {
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
