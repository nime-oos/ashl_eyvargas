// Escena "Brillas" (León Larregui): pintar con luz.
// Dos estrellas fugaces (tú, dorada, y yo, turquesa) bailan en un cielo psicodélico de los setenta y van
// dibujando con su estela: espirales, flores de espirógrafo, el infinito, una sonrisa, un abrazo alrededor de
// la luna llena y, en los "ah ah ah", mandalas de caleidoscopio que cambian de color. Al fondo: estrellas,
// nebulosas, la luna perla con sus anillos, un sol retro de rayas que sale al amanecer, cerros y un lago que
// refleja la luna. El mouse (o el dedo) jala un poquito a la estrella dorada: la puedes guiar.
//
// Para que no se trabe: las estelas y las chispas se pintan en un canvas a resolución reducida que se va
// desvaneciendo poco a poco (sin limpiarse); las cabezas de las estrellas son dos elementos que solo se mueven
// con transform, y todo lo demás es DOM/SVG animado con transform/opacity.
//
// Qué pasa con cada línea:
//   intro                         → las dos estrellas aparecen y se buscan en espiral
//   "nos dimos todo lo que..."    → se lanzan chispas una a la otra
//   "y mucho más"                 → estallido de luz
//   "reconocernos, otra vez"      → se alejan y vuelven a encontrarse (destello al tocarse)
//   "amanecer colgado de tus labios" → amanece: sale el sol retro de rayas y el cielo se pone rosa y naranja
//   "brillas y brillas tan lindo" → dibujan una flor de espirógrafo y todo el cielo brilla
//   "entre pestañas"              → caen pestañas de luz (para pedir un deseo)
//   "divina sonrisa"              → dibujan una sonrisa enorme
//   "abrazo de luna llena"        → abrazan la luna girando a su alrededor y la luna late con anillos
//   "ah ah ah"                    → caleidoscopio: mandalas de colores y una aurora que gira
//   "y así, juntitos los dos"     → viajan juntitos dibujando el infinito
//   el final                      → dibujan un corazón
(function () {
  var escena = document.getElementById('escena-brillas');
  var audio = document.getElementById('bg-music');
  if (!escena || !audio) return;
  var NS = 'http://www.w3.org/2000/svg';
  var ESTADOS = ['en-inicio', 'en-dimos', 'en-reconocer', 'en-amanecer', 'en-brillas', 'en-pestanas', 'en-sonrisa', 'en-luna', 'en-mandala', 'en-juntitos', 'en-final'];
  var SUBS = { letras: true, claves: /^(brillas|brillamos|lindo|pestañas|divina|sonrisa|luna|llena|labios|amanecer|juntos|juntitos|dos|todo|abrazo)$/ };

  var construida = false, activa = false, raf = 0, ultima = null;
  var lienzos = [], actualL = 0, ctxT, W2 = 0, H2 = 0, unidad = 1, estira = 1, cx = 0, cy = 0, res = 1;
  var modo = 'deriva', figura = '', tt = 0, tau = 0, enLienzo = 0, ultimoCuadro = 0, desvanece = 0, emitir = 0, cooldown = 0;
  var mouse = { x: 0, y: 0, peso: 0 };
  var estrellas = [{ x: 0, y: 0, h: 42 }, { x: 0, y: 0, h: 188 }];
  var particulas = [];

  function f(n) { return (+n).toFixed(1); }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function destello(x, y, r, color) {
    return '<path d="M' + f(x) + ' ' + f(y - r) + ' Q' + f(x + r * .12) + ' ' + f(y - r * .12) + ' ' + f(x + r) + ' ' + f(y) + ' Q' + f(x + r * .12) + ' ' + f(y + r * .12) + ' ' + f(x) + ' ' + f(y + r) +
      ' Q' + f(x - r * .12) + ' ' + f(y + r * .12) + ' ' + f(x - r) + ' ' + f(y) + ' Q' + f(x - r * .12) + ' ' + f(y - r * .12) + ' ' + f(x) + ' ' + f(y - r) + 'Z" fill="' + color + '"/>';
  }
  function el(tag, clase, html, padre) {
    var e = document.createElement(tag);
    e.className = clase;
    if (html) e.innerHTML = html;
    (padre || escena).appendChild(e);
    return e;
  }
  function svg(clase, vb, html, aspecto) {
    return '<svg class="' + clase + '" viewBox="' + vb + '" preserveAspectRatio="' + (aspecto || 'xMidYMid slice') + '">' + html + '</svg>';
  }

  // ---- cómo se mueve cada estrella en cada modo (en "unidades": 1 = 38% del lado corto de la pantalla) ----
  // devuelven [x, y]; los modos "sim" se dibujan con caleidoscopio y sin estirar a lo ancho
  var MODOS = {
    deriva: { dura: 2.8, figura: 'deriva', pos: function (t, a, i) {
      var c = [Math.sin(t * .13) * .55, Math.sin(t * .21) * .18], r = .26 + .1 * Math.sin(t * .5), th = t * .9 + i * Math.PI;
      return [c[0] + Math.cos(th) * r, c[1] + Math.sin(th) * r * .62];
    } },
    dimos: { dura: 3, figura: 'deriva', pos: function (t, a, i) { return MODOS.deriva.pos(t, a, i); } },
    reconocer: { dura: 3, pos: function (t, a, i) {
      var d = .95 * Math.abs(Math.cos(a * .56)), ph = t * .3;
      var s = i ? -1 : 1;
      return [Math.cos(ph) * d * s, Math.sin(ph) * d * .45 * s];
    } },
    amanecer: { dura: 3.5, figura: 'deriva', pos: function (t, a, i) { return MODOS.deriva.pos(t * .8, a, i); } },
    brillas: { dura: 4.6, fijo: true, figura: 'flor', pos: function (t, a, i) {
      // espirógrafo (hipotrocoide): una flor de luz
      var R = 1, r = .3, d = .55, th = t * 1.5 + i * 1.6, k = (R - r) / r;
      return [((R - r) * Math.cos(th) + d * Math.cos(k * th)) * .62, ((R - r) * Math.sin(th) - d * Math.sin(k * th)) * .62];
    } },
    pestanas: { dura: 4.6, fijo: true, figura: 'flor', pos: function (t, a, i) { return MODOS.brillas.pos(t, a, i); } },
    sonrisa: { dura: 3.6, pos: function (t, a, i) {
      var u = Math.sin(t * 1.25 + i * Math.PI);
      return [u * 1.05, .42 + .26 * (1 - u * u)];
    } },
    luna: { dura: 3.2, fijo: true, pos: function (t, a, i) {
      var R = .36 + .04 * Math.sin(t * 3), th = t * 1.9 + i * Math.PI;
      return [Math.cos(th) * R, Math.sin(th) * R * .9];
    } },
    mandala: { dura: 7, sim: 6, pos: function (t, a, i) {
      var th = i ? -t * .47 : t * .55;
      var r = i ? .16 + .58 * Math.abs(Math.cos(2.2 * th)) : .2 + .6 * Math.abs(Math.sin(1.7 * th));
      return [Math.cos(th) * r, Math.sin(th) * r];
    } },
    juntitos: { dura: 5, pos: function (t, a, i) {
      // el infinito, uno al ladito del otro
      var th = t * 1.0, s = Math.sin(th), c = Math.cos(th), q = 1 + s * s;
      var x = 1.15 * c / q, y = .62 * s * c / q;
      var dx = -1.15 * s / q, dy = .62 * Math.cos(2 * th) / q, L = Math.hypot(dx, dy) || 1;
      var o = i ? .045 : -.045;
      return [x - dy / L * o, y + dx / L * o];
    } },
    final: { dura: 6, fijo: true, pos: function (t, a, i) {
      var th = t * 1.1 + i * Math.PI, s = Math.sin(th);
      return [16 * s * s * s / 17 * .8, -(13 * Math.cos(th) - 5 * Math.cos(2 * th) - 2 * Math.cos(3 * th) - Math.cos(4 * th)) / 17 * .8 - .1];
    } }
  };

  function medir() {
    res = Math.min(1, 1200 / innerWidth);
    W2 = Math.round(innerWidth * res); H2 = Math.round(innerHeight * res);
    lienzos.forEach(function (l) { l.c.width = W2; l.c.height = H2; });
    unidad = Math.min(W2 * .42, H2 * .36); // en celular (vertical) las figuras aprovechan todo el ancho
    estira = Math.min(1.75, Math.max(1, W2 / H2 * .95));
    cx = W2 / 2; cy = H2 * .44;
  }
  // cuando cambia la figura, el dibujo de antes se desvanece entero en su propio lienzo y el nuevo empieza limpio
  // (así no quedan fantasmas: el desvanecido del canvas nunca llega del todo a cero)
  function lienzoNuevo() {
    var viejo = lienzos[actualL];
    actualL = 1 - actualL;
    var nuevo = lienzos[actualL];
    clearTimeout(nuevo.t);
    nuevo.ctx.clearRect(0, 0, W2, H2);
    nuevo.c.className = 'trazos';
    viejo.c.className = 'trazos se-va';
    viejo.t = setTimeout(function () { viejo.ctx.clearRect(0, 0, W2, H2); viejo.c.className = 'trazos quieto'; }, 1700);
    ctxT = nuevo.ctx;
    desvanece = 0; enLienzo = 0;
  }
  function color(i, a, l) {
    var h = estrellas[i].h;
    return 'hsla(' + f(h) + ',100%,' + (l || 66) + '%,' + a + ')';
  }

  // ---- partículas ----
  function chispa(x, y, vx, vy, h, vida, tam) {
    if (particulas.length > 420) particulas.shift();
    particulas.push({ x: x, y: y, vx: vx, vy: vy, h: h, vida: vida, max: vida, tam: tam || 1 });
  }
  function estallido(x, y, n, h, fuerza) {
    for (var k = 0; k < n; k++) {
      var a = Math.random() * Math.PI * 2, v = unidad * rnd(.3, 1) * (fuerza || 1);
      chispa(x, y, Math.cos(a) * v, Math.sin(a) * v, h + rnd(-25, 25), rnd(.8, 1.6), rnd(.8, 1.8));
    }
  }
  function viaje(de, a) {
    if (particulas.length > 420) particulas.shift();
    particulas.push({ viaje: true, de: de, a: a, p: 0, dur: rnd(.9, 1.4), off: rnd(-.25, .25), h: estrellas[de].h, vida: 1, max: 1, tam: rnd(.9, 1.5) });
  }

  // ---- un tramo de estela, con caleidoscopio si el modo lo pide ----
  function tramo(path, x1, y1, x2, y2, sim) {
    if (!sim) { path.push([x1, y1, x2, y2]); return; }
    var a1x = x1 - cx, a1y = y1 - cy, a2x = x2 - cx, a2y = y2 - cy;
    for (var k = 0; k < sim; k++) {
      var g = k / sim * Math.PI * 2, c = Math.cos(g), s = Math.sin(g);
      path.push([cx + a1x * c - a1y * s, cy + a1x * s + a1y * c, cx + a2x * c - a2y * s, cy + a2x * s + a2y * c]);
      path.push([cx - a1x * c - a1y * s, cy - a1x * s + a1y * c, cx - a2x * c - a2y * s, cy - a2x * s + a2y * c]);
    }
  }
  function trazar(segs, estilo, ancho) {
    ctxT.strokeStyle = estilo; ctxT.lineWidth = ancho;
    ctxT.beginPath();
    segs.forEach(function (q) { ctxT.moveTo(q[0], q[1]); ctxT.lineTo(q[2], q[3]); });
    ctxT.stroke();
  }

  function cuadro(ahora) {
    if (!activa) return;
    raf = requestAnimationFrame(cuadro);
    var dt = Math.min(.05, (ahora - (ultimoCuadro || ahora)) / 1000);
    ultimoCuadro = ahora;
    if (!dt) return;
    tt += dt; tau += dt; enLienzo += dt; cooldown -= dt;
    var m = MODOS[modo] || MODOS.deriva, sim = m.sim || 0;
    var fig = m.figura || modo;
    if (fig !== figura || enLienzo > 16) { figura = fig; lienzoNuevo(); }

    // la estela se va desvaneciendo (se acumula para no dejar rastro gris)
    desvanece += 1 - Math.pow(.1, dt / m.dura);
    if (desvanece >= .07) {
      ctxT.globalCompositeOperation = 'destination-out';
      ctxT.fillStyle = 'rgba(0,0,0,' + desvanece.toFixed(3) + ')';
      ctxT.fillRect(0, 0, W2, H2);
      desvanece = 0;
    }
    ctxT.globalCompositeOperation = 'lighter';
    ctxT.lineCap = 'round';

    // colores: dorado y turquesa; en el caleidoscopio y el final cambian solos
    if (modo === 'mandala' || modo === 'final') { estrellas[0].h = (tt * 32) % 360; estrellas[1].h = (estrellas[0].h + 150) % 360; }
    else { estrellas[0].h += (42 - estrellas[0].h) * Math.min(1, dt * 2); estrellas[1].h += (188 - estrellas[1].h) * Math.min(1, dt * 2); }

    mouse.peso = Math.max(0, mouse.peso - dt * .5);
    estrellas.forEach(function (e, i) {
      var o = m.pos(tt, tau, i), sxu = sim || m.fijo ? unidad : unidad * estira;
      var tx = cx + o[0] * sxu, ty = cy + o[1] * unidad;
      if (i === 0 && mouse.peso > 0) { tx += (mouse.x - tx) * mouse.peso * .35; ty += (mouse.y - ty) * mouse.peso * .35; }
      if (!e.listo) { e.x = tx; e.y = ty; e.listo = true; }
      var d = Math.hypot(tx - e.x, ty - e.y), k = 1 - Math.exp(-dt * (d > unidad * .3 ? 3.5 : 14));
      var nx = e.x + (tx - e.x) * k, ny = e.y + (ty - e.y) * k;
      var segs = [];
      tramo(segs, e.x, e.y, nx, ny, sim);
      var g = sim ? .55 : 1;
      trazar(segs, color(i, .12 * g), unidad * .055);
      trazar(segs, color(i, .28 * g, 70), unidad * .018);
      trazar(segs, color(i, .92, 84), unidad * .0065);
      e.px = e.x; e.py = e.y; e.x = nx; e.y = ny;
    });

    // chispas que suelta cada modo
    emitir -= dt;
    if (emitir <= 0) {
      emitir = .045;
      var A = estrellas[0], B = estrellas[1];
      if (modo === 'dimos') { if (Math.random() < .5) viaje(0, 1); else viaje(1, 0); }
      // diamantina: se desprende de las estrellas y cae despacito (en el lienzo deja una gotita de luz)
      if (modo === 'brillas' || modo === 'pestanas' || modo === 'final' || (modo === 'mandala' && Math.random() < .5)) {
        estrellas.forEach(function (e) { chispa(e.x + rnd(-1, 1) * unidad * .05, e.y + rnd(-1, 1) * unidad * .05, rnd(-1, 1) * unidad * .01, unidad * rnd(.01, .035), e.h + rnd(-30, 30), rnd(.3, .6), rnd(.6, 1.1)); });
      }
      if (modo === 'luna' && Math.random() < .6) {
        var a = Math.random() * Math.PI * 2;
        chispa(cx + Math.cos(a) * unidad * .3, cy + Math.sin(a) * unidad * .3, Math.cos(a) * unidad * .4, Math.sin(a) * unidad * .4, rnd(30, 60), 1.2, 1.2);
      }
      if (modo === 'reconocer') {
        var dAB = Math.hypot(A.x - B.x, A.y - B.y);
        if (dAB < unidad * .05 && cooldown <= 0) { cooldown = 2; estallido((A.x + B.x) / 2, (A.y + B.y) / 2, 90, 50, 1.4); flash(); }
      }
    }

    // las chispas se pintan en el mismo lienzo de luz: dejan su propia estelita (como bengalas)
    for (var p = particulas.length - 1; p >= 0; p--) {
      var q = particulas[p], ox = q.x, oy = q.y;
      q.vida -= dt;
      if (q.viaje) {
        q.p += dt / q.dur;
        if (q.p >= 1) { particulas.splice(p, 1); continue; }
        var s0 = estrellas[q.de], s1 = estrellas[q.a], u = q.p * q.p * (3 - 2 * q.p);
        var mx = s0.x + (s1.x - s0.x) * u, my = s0.y + (s1.y - s0.y) * u, dx = s1.x - s0.x, dy = s1.y - s0.y;
        var bulto = Math.sin(q.p * Math.PI) * q.off;
        q.x = mx - dy * bulto; q.y = my + dx * bulto;
        q.vida = Math.sin(q.p * Math.PI);
        if (ox === undefined) continue;
      } else {
        if (q.vida <= 0) { particulas.splice(p, 1); continue; }
        q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= .97; q.vy *= .97;
      }
      var al = Math.max(0, q.vida / q.max);
      ctxT.strokeStyle = 'hsla(' + f(q.h) + ',100%,74%,' + (al * .6).toFixed(3) + ')';
      ctxT.lineWidth = unidad * .014 * q.tam;
      ctxT.beginPath(); ctxT.moveTo(ox, oy); ctxT.lineTo(q.x + .01, q.y); ctxT.stroke();
    }

    // las cabezas de las estrellas son dos elementos que solo se mueven (no se repinta nada)
    var grande = modo === 'brillas' || modo === 'pestanas' ? 1.4 : modo === 'mandala' || modo === 'final' ? 1.15 : 1;
    estrellas.forEach(function (e) {
      e.esc = (e.esc || 1) + (grande - (e.esc || 1)) * Math.min(1, dt * 3);
      e.el.style.transform = 'translate3d(' + f(e.x / res) + 'px,' + f(e.y / res) + 'px,0) scale(' + e.esc.toFixed(3) + ')';
      var h = Math.round(e.h);
      if (h !== e.hPintado) { e.hPintado = h; e.el.style.setProperty('--h', h); }
    });
  }

  var elFlash;
  function flash() {
    elFlash.classList.remove('on');
    void elFlash.offsetWidth;
    elFlash.classList.add('on');
  }

  function construir() {
    construida = true;
    el('div', 'cielo');
    el('div', 'cielo-dia');
    el('div', 'aurora');
    // estrellas del fondo, en tres grupos que titilan a destiempo
    [11, 23, 37].forEach(function (sem, g) {
      var h = '', a = sem;
      function r() { a = (a * 9301 + 49297) % 233280; return a / 233280; }
      for (var i = 0; i < 70; i++) {
        var x = r() * 1600, y = r() * 760;
        h += r() < .25 ? destello(x, y, 3 + r() * 6, ['#fff8e8', '#ffe2f4', '#dff4ff'][i % 3]) : '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(.8 + r() * 1.6) + '" fill="#fff8f0"/>';
      }
      el('div', 'estrellas e' + (g + 1), svg('', '0 0 1600 1000', h));
    });
    // el sol retro de rayas (sale al amanecer)
    el('div', 'sol', svg('', '-100 -100 200 200',
      '<defs><linearGradient id="brSol" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe27a"/><stop offset=".5" stop-color="#ff9a5a"/><stop offset="1" stop-color="#ff4a8a"/></linearGradient>' +
      '<clipPath id="brSolCorte"><rect x="-100" y="-100" width="200" height="118"/><rect x="-100" y="24" width="200" height="12"/><rect x="-100" y="42" width="200" height="9"/><rect x="-100" y="57" width="200" height="7"/><rect x="-100" y="70" width="200" height="5"/></clipPath></defs>' +
      '<circle r="96" fill="#ff8a6a" opacity=".25"/><circle r="70" fill="url(#brSol)" clip-path="url(#brSolCorte)"/>', 'xMidYMid meet'));
    // la luna perla con sus anillos
    el('div', 'luna', svg('', '-100 -100 200 200',
      '<defs><radialGradient id="brLuna" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="#fffaf2"/><stop offset=".55" stop-color="#f4e4f4"/><stop offset="1" stop-color="#c8b4e8"/></radialGradient>' +
      '<radialGradient id="brHalo"><stop offset=".5" stop-color="#ffe8f8" stop-opacity=".45"/><stop offset="1" stop-color="#ffe8f8" stop-opacity="0"/></radialGradient></defs>' +
      '<circle class="halo" r="100" fill="url(#brHalo)"/>' +
      '<circle class="anillo a1" r="62" fill="none" stroke="#ffe2f6" stroke-width="1.2"/><circle class="anillo a2" r="62" fill="none" stroke="#e2d4ff" stroke-width="1"/><circle class="anillo a3" r="62" fill="none" stroke="#fff4d8" stroke-width="1"/>' +
      '<circle r="52" fill="url(#brLuna)"/>' +
      '<circle cx="-16" cy="-14" r="9" fill="#e0cce8" opacity=".55"/><circle cx="18" cy="10" r="12" fill="#e0cce8" opacity=".5"/><circle cx="-10" cy="24" r="6" fill="#e0cce8" opacity=".5"/><circle cx="22" cy="-22" r="4" fill="#e0cce8" opacity=".55"/>', 'xMidYMid meet'));
    // los lienzos de luz
    [0, 1].forEach(function (k) { var c = el('canvas', 'trazos' + (k ? ' quieto' : '')); lienzos.push({ c: c, ctx: c.getContext('2d') }); });
    ctxT = lienzos[0].ctx;
    // las dos estrellas: halo, destello en cruz que gira y el centro blanco
    estrellas.forEach(function (e, i) {
      e.el = el('div', 'cabeza c' + i, '<i class="halo-c"></i><i class="cruz"></i><i class="nucleo"></i>');
    });
    medir();
    window.addEventListener('resize', function () { if (construida) medir(); });
    // cerros, lago y el reflejo de la luna
    el('div', 'horizonte', svg('', '0 0 1200 220',
      '<defs><linearGradient id="brLago" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a1a5a"/><stop offset="1" stop-color="#120626"/></linearGradient></defs>' +
      '<path d="M0 120 C80 70 150 80 220 96 C300 60 380 40 470 84 C540 110 600 92 680 70 C760 50 840 72 900 96 C980 60 1060 66 1120 90 C1160 84 1190 90 1200 92 L1200 140 L0 140Z" fill="#2a1240"/>' +
      '<path d="M0 132 C100 110 200 116 300 124 C420 104 520 112 620 126 C740 108 860 112 980 126 C1080 116 1150 120 1200 124 L1200 142 L0 142Z" fill="#1a0a2e"/>' +
      '<path d="M0 120 C80 70 150 80 220 96 C300 60 380 40 470 84 C540 110 600 92 680 70 C760 50 840 72 900 96 C980 60 1060 66 1120 90 C1160 84 1190 90 1200 92" stroke="#ff9ad8" stroke-width="1.6" fill="none" opacity=".5"/>' +
      '<rect y="140" width="1200" height="80" fill="url(#brLago)"/>', 'none'));
    var reflejo = '';
    for (var i = 0; i < 9; i++) reflejo += '<rect class="ola" style="--w:-' + (i * .37).toFixed(2) + 's" x="' + f(-40 + i * 4 - i * i * .6) + '" y="' + (i * 9) + '" width="' + f(80 - i * 6) + '" height="3" rx="1.5" fill="#ffe8f8" opacity="' + f(.75 - i * .07) + '"/>';
    el('div', 'reflejo', svg('', '-60 0 120 90', reflejo, 'xMidYMin meet'));
    // pestañas de luz que caen (para pedir un deseo)
    var pest = el('div', 'pestanas');
    for (var p = 0; p < 13; p++) {
      el('div', 'pestana', svg('', '-40 -20 80 40',
        '<path d="M-30 6 C-14 -10 10 -12 30 -2 C10 -6 -10 -4 -30 10Z" fill="#ffd27a" opacity=".35" transform="scale(1.3)"/>' +
        '<path d="M-30 6 C-14 -10 10 -12 30 -2 C10 -6 -10 -4 -30 10Z" fill="#fff2c8"/>', 'xMidYMid meet'), pest)
        .style.cssText = 'left:' + rnd(4, 94).toFixed(1) + '%;--w:-' + rnd(0, 9).toFixed(2) + 's;--x:' + rnd(-80, 80).toFixed(0) + 'px;--g:' + rnd(-200, 200).toFixed(0) + 'deg;--s:' + rnd(.7, 1.3).toFixed(2);
    }
    // destellos por todo el cielo ("brillas y brillas")
    var ch = el('div', 'chispas');
    for (var c = 0; c < 14; c++) {
      el('div', 'chispa-cielo', svg('', '-50 -50 100 100', destello(0, 0, 46, ['#fff6d0', '#ffd2f0', '#d2f4ff'][c % 3]), 'xMidYMid meet'), ch)
        .style.cssText = 'left:' + rnd(3, 97).toFixed(1) + '%;top:' + rnd(6, 72).toFixed(1) + '%;--w:-' + rnd(0, 2).toFixed(2) + 's;--s:' + rnd(.5, 1.4).toFixed(2);
    }
    // el título en neón
    el('div', 'titulo', svg('', '0 0 420 150',
      '<text x="210" y="86" text-anchor="middle" font-family="Pacifico, cursive" font-size="78" fill="none" stroke="#ff7ad0" stroke-width="10" opacity=".25">Brillas</text>' +
      '<text x="210" y="86" text-anchor="middle" font-family="Pacifico, cursive" font-size="78" fill="#fff4fb" stroke="#ff9ad8" stroke-width="2">Brillas</text>' +
      '<text x="210" y="128" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="30" fill="#ffd27a">León Larregui ✦</text>', 'xMidYMid meet'));
    elFlash = el('div', 'flash');

    // el mouse o el dedo jalan a la estrella dorada
    function guiar(x, y) {
      if (!activa) return;
      mouse.x = x * res; mouse.y = y * res; mouse.peso = 1;
    }
    window.addEventListener('mousemove', function (e) { guiar(e.clientX, e.clientY); });
    window.addEventListener('touchmove', function (e) { var t = e.touches[0]; guiar(t.clientX, t.clientY); }, { passive: true });
  }

  // ---- la escena sigue la letra ----
  var lineas = [];
  (window.LETRA_BRILLAS_LRC || '').split(/\r?\n/).forEach(function (l) {
    var m = l.match(/^\s*\[(\d+):(\d+(?:\.\d+)?)\](.*)$/);
    if (m) lineas.push({ t: +m[1] * 60 + +m[2], texto: m[3].trim().toLowerCase() });
  });
  function modoPara(texto, t) {
    if (t >= 208) return 'final';
    if (/^ah/.test(texto)) return 'mandala';
    if (/juntitos|^y así/.test(texto)) return 'juntitos';
    if (/reconocernos/.test(texto)) return 'reconocer';
    if (/amanecer/.test(texto)) return 'amanecer';
    if (/pestañas/.test(texto)) return 'pestanas';
    if (/brillas/.test(texto)) return 'brillas';
    if (/sonrisa/.test(texto)) return 'sonrisa';
    if (/luna/.test(texto)) return 'luna';
    if (/nos d/.test(texto)) return 'dimos';
    return 'deriva';
  }
  function reaccionar() {
    if (!activa) return;
    var t = audio.currentTime, texto = '', ultimoTexto = '';
    for (var i = 0; i < lineas.length; i++) {
      if (lineas[i].t <= t) { texto = lineas[i].texto; if (texto) ultimoTexto = texto; } else break;
    }
    // en los silencios entre líneas se queda lo último que se dibujó
    var nuevo = modoPara(ultimoTexto, t);
    var clave = texto + '|' + nuevo;
    if (clave === ultima) return;
    var antes = ultima;
    ultima = clave;
    if (nuevo !== modo) { modo = nuevo; tau = 0; }
    // "y mucho más": estallido de luz
    if (/mucho más/.test(texto) && antes && antes.split('|')[0] !== texto) {
      estrellas.forEach(function (e) { estallido(e.x, e.y, 60, e.h, 1.2); });
      flash();
    }
    escena.classList.toggle('en-dimos', modo === 'dimos');
    escena.classList.toggle('en-reconocer', modo === 'reconocer');
    escena.classList.toggle('en-amanecer', modo === 'amanecer');
    escena.classList.toggle('en-brillas', modo === 'brillas' || modo === 'pestanas');
    escena.classList.toggle('en-pestanas', modo === 'pestanas');
    escena.classList.toggle('en-sonrisa', modo === 'sonrisa');
    escena.classList.toggle('en-luna', modo === 'luna');
    escena.classList.toggle('en-mandala', modo === 'mandala' || modo === 'final');
    escena.classList.toggle('en-juntitos', modo === 'juntitos');
    escena.classList.toggle('en-final', modo === 'final');
    escena.classList.toggle('en-inicio', t < 21);
  }
  function limpiar() { ESTADOS.forEach(function (c) { escena.classList.remove(c); }); ultima = null; }
  audio.addEventListener('timeupdate', reaccionar);
  audio.addEventListener('ended', function () { limpiar(); modo = 'deriva'; });

  window.Escenas = window.Escenas || {};
  window.Escenas.brillas = {
    el: escena,
    activar: function () {
      if (!construida) construir();
      activa = true;
      window.SUB_ESPECIAL = SUBS;
      limpiar();
      modo = 'deriva';
      figura = '';
      reaccionar();
      cancelAnimationFrame(raf);
      ultimoCuadro = 0;
      raf = requestAnimationFrame(cuadro);
    },
    desactivar: function () {
      activa = false;
      cancelAnimationFrame(raf);
      if (window.SUB_ESPECIAL === SUBS) window.SUB_ESPECIAL = null;
    }
  };
})();
