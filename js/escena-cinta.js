// Escena "Just the way you are" (Bruno Mars): todo se hace con cinta de casete, como en el video de la canción
// (al estilo de Erika Iris Simmons). Sobre una mesa de madera clara hay un casete; la cinta SALE de él, va
// dibujando una figura según lo que dice la letra, y cuando la letra cambia se REBOBINA (se mete de nuevo al
// casete) y vuelve a salir para dibujar la siguiente:
//   inicio / "su cabello" / "es tan hermosa" / "cuando veo tu cara" → su retrato (lentes redondos, fleco, pelo ondulado)
//   "sus ojos" / "las estrellas"                                   → sus ojos de cerca, con los lentes y estrellas
//   "no me cree" / "¿me veo bien?"                                 → un espejo de mano con un signo de pregunta
//   "eres increíble" / "tal como eres"                             → un corazón grande con estrellas
//   "y cuando sonríes"                                             → su retrato sonriendo
//   "el mundo entero se detiene a mirarte"                         → un globo terráqueo con carita que se queda mirando
//   "sus labios" / "besarlos"                                      → sus labios de cerca y corazones
//   "su risa"                                                      → su retrato riéndose
// (La letra que sale en pantalla está traducida al español: js/letra-cinta.js.)
//
// Cómo funciona: cada figura es un <g> de SVG con sus trazos de cinta (sombra + cinta + brillo satinado), y cada
// trazo lleva sus tiempos (--d, --t para dibujarse; --r, --u para rebobinarse). Dibujar = la línea avanza con
// stroke-dashoffset; rebobinar = la misma transición al revés y en orden inverso (lo último en salir es lo
// primero en entrar, y la punta de cinta que sale del casete es lo último en meterse). Todo lo hace el navegador
// con transiciones de CSS: nada se repinta a mano en cada cuadro, así no se traba.
//
// La geometría de la cinta (curvas suaves, bucles, enredos y la conversión de foto → cinta con detección de
// bordes tipo Canny) está en js/cinta.js. Si existe img/cinta.jpg, el retrato se arma a partir de esa foto.
(function () {
  var escena = document.getElementById('escena-cinta');
  var audio = document.getElementById('bg-music');
  var T = window.Cinta;
  if (!escena || !audio || !T) return;
  var W = 1200, H = 800, ESC = 1.25;
  var FOTO = 'img/cinta.jpg';
  var CASETE = { x: 96, y: 548, rot: -7 };
  var REBOBINA = .8;   // segundos que tarda la cinta en meterse al casete
  var PAUSA = .3;       // segundos que se queda la figura completa antes de rebobinar

  var construida = false, activa = false, figuras = {}, svgFiguras = null;
  var actual = null, objetivo = null, estado = 'quieto', listaEn = 0, timerFin = null, timerEspera = null, ultima = null;

  function f(n) { return (+n).toFixed(1); }
  function enCasete(x, y) {
    var a = CASETE.rot * Math.PI / 180;
    return [CASETE.x + x * Math.cos(a) - y * Math.sin(a), CASETE.y + x * Math.sin(a) + y * Math.cos(a)];
  }

  // ---- la mesa de madera clara ----
  function pintarMesa(ctx) {
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#efe2c8'); g.addColorStop(1, '#e4d0ac');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    var rng = T.rng(11);
    // tablas: vetas largas y onduladas
    for (var i = 0; i < 170; i++) {
      var y0 = rng() * H, amp = 2 + rng() * 6, fr = .004 + rng() * .01, ph = rng() * 6;
      ctx.beginPath();
      for (var x = -10; x <= W + 10; x += 12) {
        var yy = y0 + Math.sin(x * fr + ph) * amp + Math.sin(x * .03 + ph) * .8;
        x < 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
      }
      ctx.strokeStyle = 'rgba(150, 105, 60, ' + (.04 + rng() * .1).toFixed(3) + ')';
      ctx.lineWidth = .5 + rng() * 1.6;
      ctx.stroke();
    }
    // separación entre tablas
    [180, 390, 600, 790].forEach(function (y) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y + 2);
      ctx.strokeStyle = 'rgba(120, 80, 40, .16)'; ctx.lineWidth = 2; ctx.stroke();
    });
    // un nudo de la madera
    [[1060, 520], [240, 300]].forEach(function (n) {
      for (var r = 4; r < 40; r += 4) {
        ctx.beginPath(); ctx.ellipse(n[0], n[1], r * 2.2, r * .7, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(130, 85, 45, ' + (.12 - r * .002).toFixed(3) + ')'; ctx.lineWidth = 1.2; ctx.stroke();
      }
    });
    // luz suave de ventana y viñeta
    var v = ctx.createRadialGradient(700, 380, 120, 640, 420, 820);
    v.addColorStop(0, 'rgba(255, 250, 238, .35)'); v.addColorStop(.6, 'rgba(255, 250, 238, 0)'); v.addColorStop(1, 'rgba(90, 55, 20, .28)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }

  // ---- herramientas para armar figuras ----
  // un trazo = { p: puntos, w: ancho, par: true si se dibuja "en montón" (como el pelo) en lugar de uno tras otro }
  function Figura() { this.trazos = []; }
  Figura.prototype.add = function (p, w, par) { this.trazos.push({ p: p, w: w || 5, par: !!par }); return this; };
  function suave(p, rng, temblor) {
    rng = rng || Math.random;
    return T.suavizar(p.map(function (q) { return [q[0] + (rng() - .5) * (temblor || 0), q[1] + (rng() - .5) * (temblor || 0)]; }), 3);
  }
  function espejoX(p) { return p.map(function (q) { return [-q[0], q[1]]; }); }
  // rellena una forma con tiras de cinta que van de un contorno al otro (mismo número de puntos en los dos)
  function relleno(arriba, abajo, sep) {
    var alto = 0, out = [];
    for (var i = 0; i < arriba.length; i++) alto = Math.max(alto, Math.hypot(abajo[i][0] - arriba[i][0], abajo[i][1] - arriba[i][1]));
    var n = Math.max(1, Math.ceil(alto / sep));
    for (var k = 0; k <= n; k++) {
      var t = k / n, pts = [];
      for (var j = 0; j < arriba.length; j++) pts.push([arriba[j][0] + (abajo[j][0] - arriba[j][0]) * t, arriba[j][1] + (abajo[j][1] - arriba[j][1]) * t]);
      // tiras alternadas de ida y vuelta, como la cinta que se dobla
      out.push(k % 2 ? pts.slice().reverse() : pts);
    }
    return out;
  }
  function elipse(cx, cy, rx, ry, a0, a1, paso) {
    var p = [];
    a0 = a0 || 0; a1 = a1 == null ? Math.PI * 2 : a1;
    for (var a = a0; a <= a1 + 1e-6; a += paso || .05) p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
    return p;
  }
  function corazon(cx, cy, s) {
    var p = [];
    for (var t = 0; t <= Math.PI * 2 + .01; t += .04) {
      p.push([cx + 16 * Math.pow(Math.sin(t), 3) * s, cy - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * s]);
    }
    return p;
  }
  function estrella(cx, cy, r) {
    var p = [];
    for (var i = 0; i <= 8; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 4, rr = i % 2 ? r * .32 : r;
      p.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    return T.suavizar(p, 2);
  }
  // iris: espiral de cinta que deja libre el brillito de arriba a la derecha
  function iris(cx, cy, r, vueltas) {
    var p = [], v = vueltas || 4.2;
    for (var a = 0; a < Math.PI * 2 * (v + 2); a += .12) {
      var rr = 1 + a * r / (Math.PI * 2 * v);
      if (rr > r) break;
      var ang = a + 2;
      if (rr > r * .45 && Math.cos(ang + .8) > .82) continue;
      p.push([cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr]);
    }
    return p;
  }
  // pasa los trazos de coordenadas "de la cara" (centrada en 0,0) a la mesa
  function colocar(fig, cx, cy, s) {
    var g = new Figura();
    fig.trazos.forEach(function (t) {
      g.trazos.push({ p: t.p.map(function (q) { return [cx + q[0] * s, cy + q[1] * s]; }), w: t.w, par: t.par });
    });
    return g;
  }

  // ---- ella: el retrato en coordenadas de la cara (centro de la cara = 0,0; de la frente a la barbilla ~210) ----
  // Rasgos de sus fotos: cara ovalada suave, lentes grandes, redondos y de alambre delgado que llegan casi a las
  // cejas, ojos almendrados, nariz chiquita, labios llenos, fleco tipo cortina y pelo largo ondulado con volumen.
  // partes: 'cuerpo', 'boca' ('seria' | 'sonrisa' | 'risa'), 'ojos' ('abiertos' | 'cerrados'), 'pelo'
  function rasgos(o) {
    o = o || {};
    var rng = T.rng(31), fig = new Figura(), S = o.s || 1.52;
    function tr(p, w, temblor, par) { fig.add(suave(p, rng, temblor || .4), w, par); }
    // el relleno se calcula para el tamaño final: siempre tiras de cinta pegaditas, sin huecos
    function rell(a, b, sep, w) { relleno(a, b, w * .78 / S).forEach(function (p) { fig.add(suave(p, rng, .3 / S), w); }); }

    if (o.cuerpo !== false) {
      // hombros descubiertos, cuello y el escote recto del vestido (hombros caídos)
      tr([[-190, 250], [-170, 212], [-132, 184], [-82, 164], [-34, 152]], 5);
      tr([[-34, 152], [-33, 126], [-31, 98]], 4.4);
      tr([[-16, 104], [0, 109], [16, 104]], 4.4);
      tr([[31, 98], [33, 126], [34, 152]], 4.4);
      tr([[34, 152], [82, 164], [132, 184], [170, 212], [190, 250]], 5);
      tr([[-178, 258], [-110, 240], [-40, 234], [0, 236], [40, 234], [110, 240], [178, 258]], 5);
      // mejillas apenas sugeridas
      tr([[72, -18], [70, 24], [60, 62], [42, 90]], 3.4);
      tr([[-72, -6], [-70, 32], [-60, 66]], 3);
    }
    if (o.boca !== false) {
      var b = o.boca || 'seria';
      if (b === 'seria') {
        var up = [[-30, 62], [-19, 55], [-7, 53], [0, 56], [7, 53], [19, 55], [30, 62]];
        var mid = [[-30, 62], [-18, 64], [-7, 65], [0, 65], [7, 65], [18, 64], [30, 62]];
        var low = [[-30, 62], [-21, 72], [-9, 77], [0, 78], [9, 77], [21, 72], [30, 62]];
        rell(up, mid, 3.6, 3.6);
        rell(mid, low, 3.6, 3.6);
      } else {
        // sonrisa (como en el video): labio de arriba en arco, la hilera de dientes clara y el labio de abajo
        var ab = b === 'risa' ? 7 : 0;
        rell([[-38, 49], [-25, 46], [-11, 44.5], [0, 47], [11, 44.5], [25, 46], [38, 49]],
             [[-38, 49], [-25, 50], [-11, 51], [0, 51.5], [11, 51], [25, 50], [38, 49]], 3.6, 3.4);
        // la orilla de los dientes de abajo, apenas marcada
        tr([[-27, 56 + ab * .6], [-14, 59 + ab * .8], [0, 60 + ab], [14, 59 + ab * .8], [27, 56 + ab * .6]], 1.8);
        rell([[-35, 51], [-23, 58 + ab * .7], [-11, 62 + ab], [0, 63 + ab], [11, 62 + ab], [23, 58 + ab * .7], [35, 51]],
             [[-38, 49], [-25, 61 + ab * .7], [-12, 67 + ab], [0, 68 + ab], [12, 67 + ab], [25, 61 + ab * .7], [38, 49]], 3.6, 3.4);
        // los hoyuelos de las comisuras
        tr([[-45, 41], [-46, 47], [-43, 52]], 2.4);
        tr([[45, 41], [46, 47], [43, 52]], 2.4);
      }
      // nariz: la curvita de abajo, como en el video
      if (o.nariz !== false) tr([[-11, 31], [-9, 36], [-4, 38], [0, 36.5], [4, 38], [9, 36], [11, 31]], 3.4);
      if (o.puente !== false) tr([[-7, -2], [-9, 14], [-11, 27]], 2.4);
    }
    if (o.ojos !== false) {
      [-1, 1].forEach(function (lado) {
        var m = lado < 0 ? function (p) { return p; } : espejoX, cx = 42 * lado;
        if (o.ojos === 'cerrados') {
          rell(m([[-62, -10], [-52, -3], [-42, -1], [-32, -3], [-22, -10]]), m([[-62, -8], [-52, -1], [-42, 1], [-32, -1], [-22, -8]]), 2.6, 3.6);
        } else {
          // párpado de arriba (delineado) con su colita, línea de abajo e iris
          rell(m([[-62, -6], [-54, -15], [-42, -19], [-30, -16], [-22, -8]]), m([[-61, -4], [-53, -12], [-42, -16], [-30, -13], [-22, -6]]), 2.6, 3.4);
          tr(m([[-62, -6], [-68, -10], [-71, -13]]), 3);
          tr(m([[-58, 1], [-48, 5], [-36, 5], [-26, 0]]), 2.4);
          fig.add(iris(cx + lado * 1, -8, 7.5, Math.max(3, 7.5 * S / 3)), 2.6);
        }
      });
      // los lentes: grandes, redondos, de alambre delgado
      fig.add(elipse(-42, -6, 36, 35, -Math.PI / 2, Math.PI * 1.5, .05), 2.4);
      tr([[-6, -10], [0, -15], [6, -10]], 2.4);
      fig.add(elipse(42, -6, 36, 35, -Math.PI / 2, Math.PI * 1.5, .05), 2.4);
      tr([[-78, -10], [-88, -12], [-96, -11]], 2.4);
      tr([[78, -10], [88, -12], [96, -11]], 2.4);
      // cejas: arcos rellenos que se adelgazan hacia la cola
      [-1, 1].forEach(function (lado) {
        var m = lado < 0 ? function (p) { return p; } : espejoX;
        rell(m([[-16, -48], [-28, -54], [-44, -57], [-60, -54], [-74, -46]]), m([[-16, -43], [-28, -48], [-44, -51], [-60, -49], [-72, -44]]), 2.6, 3.4);
      });
    }
    if (o.pelo !== false) {
      var r2 = T.rng(77);
      var adentro = [[0, -128], [-38, -122], [-64, -100], [-78, -60], [-80, -10], [-80, 40], [-76, 90], [-66, 140], [-74, 190], [-90, 250]];
      var afuera = [[0, -158], [-62, -152], [-110, -124], [-140, -80], [-156, -20], [-164, 40], [-170, 100], [-176, 160], [-182, 215], [-188, 270]];
      var desde = o.peloDesde == null ? -999 : o.peloDesde;
      [-1, 1].forEach(function (lado) {
        var faseG = r2() * 6;
        for (var k = 0; k < 22; k++) {
          var u = k / 21, fase = faseG + (r2() - .5) * 1.4, pts = [];
          for (var i = 0; i < adentro.length; i++) {
            var a = adentro[i], bb = afuera[i];
            var x = a[0] + (bb[0] - a[0]) * u, y = a[1] + (bb[1] - a[1]) * u;
            var onda = Math.sin(i * 1.1 + fase + u * 1.5) * (1.5 + i * 2.3);
            pts.push([(x + onda + (r2() - .5) * 2.5) * (lado < 0 ? 1 : -1), y + (r2() - .5) * 2.5]);
          }
          var corte = adentro.length - (r2() < .35 ? 1 + Math.floor(r2() * 2) : 0);
          pts = pts.slice(0, corte).filter(function (q) { return q[1] >= desde; });
          if (pts.length > 2) fig.add(T.suavizar(pts, 3), 4.4 + r2() * 1.4, true);
        }
        // la coronilla
        for (var c = 0; c < 6; c++) {
          var d = c * 5, cr = [[0, -152 + d * .4], [-40 - d, -148 + d * .5], [-82 - d * .8, -128 + d * .6], [-114 - d * .5, -96 + d]];
          if (lado > 0) cr = espejoX(cr);
          cr = cr.filter(function (q) { return q[1] >= desde; });
          if (cr.length > 2) fig.add(suave(cr, r2, 1.5), 4.8, true);
        }
        // fleco tipo cortina: cae de la raya, cruza la frente y baja junto a la cara
        for (var fl = 0; fl < 6; fl++) {
          var q = fl / 5, ox = 4 + q * 16;
          var cort = [[-ox, -140], [-20 - q * 12, -112], [-40 - q * 10, -84], [-56 - q * 8, -56], [-66 - q * 6, -26], [-72 - q * 4, 6]];
          if (lado > 0) cort = espejoX(cort);
          cort = cort.filter(function (q2) { return q2[1] >= desde; });
          if (cort.length > 2) fig.add(suave(cort, r2, 1.5), 4.6, true);
        }
        // dos mechones suaves que salen de la raya y se abren sobre la frente
        for (var cc = 0; cc < 2; cc++) {
          var cen = [[lado * 2, -142], [lado * (10 + cc * 6), -118], [lado * (24 + cc * 8), -96], [lado * (40 + cc * 8), -78]];
          cen = cen.filter(function (q3) { return q3[1] >= desde; });
          if (cen.length > 2) fig.add(suave(cen, r2, 1), 4.4, true);
        }
      });
    }
    return fig;
  }

  // ---- las figuras ----
  function figRetrato(boca, ojos) { return colocar(rasgos({ boca: boca, ojos: ojos, s: 1.52 }), 720, 452, 1.52); }
  function figOjos() {
    // de cerca: cejas, ojos, lentes y nariz (sin pelo); empieza por las estrellas de abajo y termina con las de arriba
    var g = new Figura(), cara = colocar(rasgos({ cuerpo: false, boca: false, pelo: false, s: 3.3 }), 720, 470, 3.3);
    [[400, 560, 20], [1050, 560, 24]].forEach(function (e) { g.add(estrella(e[0], e[1], e[2]), 4.2); });
    g.trazos = g.trazos.concat(cara.trazos);
    [[430, 250, 26], [1010, 240, 30], [960, 160, 14], [480, 160, 16]].forEach(function (e) { g.add(estrella(e[0], e[1], e[2]), 4.2); });
    return g;
  }
  function figLabios() {
    var g = colocar(rasgos({ cuerpo: false, ojos: false, pelo: false, boca: 'seria', puente: false, nariz: false, s: 5.4 }), 720, 110, 5.4);
    [[1000, 330, .9], [1060, 440, .7], [960, 520, .55]].forEach(function (c) { g.add(corazon(c[0], c[1], c[2] * 2.2), 4.2); });
    return g;
  }
  function figEspejo() {
    var g = new Figura();
    g.add(elipse(720, 380, 132, 165, Math.PI / 2, Math.PI * 2.5, .03), 5.2);
    g.add(elipse(720, 380, 116, 149, Math.PI / 2, Math.PI * 2.5, .03), 4);
    g.add(T.suavizar([[712, 548], [710, 600], [706, 660], [704, 714], [716, 734], [734, 714], [732, 660], [728, 600], [726, 548]], 3), 5.2);
    g.add(elipse(720, 752, 16, 12), 4.4);
    g.add(T.suavizar([[690, 214], [700, 200], [712, 206], [720, 196], [728, 206], [740, 200], [750, 214]], 2), 4.4);
    // reflejos
    g.add(T.suavizar([[634, 312], [646, 286], [664, 266]], 2), 4);
    g.add(T.suavizar([[640, 340], [656, 304], [684, 274]], 2), 4);
    // el signo de pregunta
    g.add(T.suavizar([[680, 346], [684, 314], [710, 294], [746, 298], [764, 326], [752, 356], [730, 374], [722, 402], [721, 432]], 3), 6);
    g.add(iris(721, 468, 8), 3.4);
    return g;
  }
  function figCorazon() {
    var g = new Figura();
    // los corazones empiezan por la punta de abajo
    function desdeAbajo(p) { var i = Math.floor(p.length / 2); return p.slice(i).concat(p.slice(1, i + 1)); }
    g.add(desdeAbajo(corazon(720, 420, 11.5)), 6);
    g.add(desdeAbajo(corazon(720, 410, 7.4)), 5);
    g.add(desdeAbajo(corazon(720, 402, 3.4)), 4.4);
    [[400, 230, 26], [1040, 230, 30], [380, 470, 20], [1060, 470, 24], [460, 680, 16], [980, 680, 20], [720, 140, 18]].forEach(function (e) { g.add(estrella(e[0], e[1], e[2]), 4.2); });
    return g;
  }
  function figMundo() {
    var g = new Figura(), cx = 720, cy = 392, r = 170;
    function cerrar(p) { return T.suavizar(p.concat([p[0], p[1]]).map(function (q) { return [cx + q[0] * r, cy + q[1] * r]; }), 3).slice(0, -6); }
    // el soporte: la base y el arco (empieza abajo, por donde llega la cinta)
    g.add(elipse(cx, cy + r + 70, 86, 16, Math.PI / 2, Math.PI * 2.5, .04), 5.4);
    g.add(T.suavizar([[cx, cy + r + 54], [cx, cy + r + 34], [cx - 4, cy + r + 22]], 3), 6);
    g.add(elipse(cx, cy, r + 24, r + 24, Math.PI * .6, Math.PI * 1.4, .03).reverse(), 5);
    // el globo, el ecuador y un meridiano (pocas líneas, como en el video)
    g.add(elipse(cx, cy, r, r, Math.PI / 2, Math.PI * 2.5, .03), 5.6);
    g.add(T.suavizar([[cx - r, cy + 30], [cx - r * .5, cy + 50], [cx, cy + 56], [cx + r * .5, cy + 50], [cx + r, cy + 30]], 3), 2.6);
    g.add(elipse(cx, cy, r * .55, r, -Math.PI / 2, Math.PI / 2, .04), 2.6);
    // continentes: América, Europa y África (contornos suaves)
    g.add(cerrar([[-.86, -.18], [-.74, -.44], [-.52, -.6], [-.4, -.52], [-.46, -.34], [-.36, -.22], [-.46, -.06], [-.62, .02], [-.78, -.04]]), 4.4);
    g.add(cerrar([[-.56, .18], [-.38, .14], [-.26, .28], [-.3, .48], [-.4, .7], [-.48, .74], [-.5, .5], [-.6, .32]]), 4.4);
    g.add(cerrar([[.46, -.22], [.6, -.34], [.76, -.3], [.82, -.16], [.68, -.08], [.54, -.1]]), 4.4);
    g.add(cerrar([[.3, .08], [.52, .02], [.72, .1], [.74, .3], [.6, .5], [.52, .7], [.42, .64], [.38, .4], [.26, .24]]), 4.4);
    // carita: ojos grandes que se quedan mirando y una sonrisita
    [-1, 1].forEach(function (l) {
      var ex = cx + l * 46, ey = cy - 70;
      g.add(elipse(ex, ey, 22, 26, Math.PI / 2, Math.PI * 2.5, .06), 4.4);
      g.add(iris(ex + l * 2, ey + 4, 11, 3.6), 3.2);
    });
    g.add(T.suavizar([[cx - 26, cy - 22], [cx - 12, cy - 12], [cx, cy - 9], [cx + 12, cy - 12], [cx + 26, cy - 22]], 3), 4.4);
    // rayitas de "se detiene a mirar" alrededor
    [[-1, -1], [1, -1], [-1, .2], [1, .2]].forEach(function (k, i) {
      var x = cx + k[0] * (r + 44), y = cy + k[1] * (r * .55);
      g.add(T.suavizar([[x, y - 18], [x + k[0] * 10, y], [x, y + 18]], 3), 4);
      g.add(T.suavizar([[x + k[0] * 22, y - 12], [x + k[0] * 30, y], [x + k[0] * 22, y + 12]], 3), 3.4);
    });
    return g;
  }

  // la punta de cinta que sale del casete y llega al primer trazo de la figura (con un bucle sobre la mesa)
  function punta(destino) {
    var m = enCasete(130, 168);
    return T.suavizar([m, [m[0] + 40, m[1] - 2], [432, 692], [470, 676], [478, 648], [456, 634], [434, 648], [444, 678], [486, 694],
      [(486 + destino[0]) / 2, Math.max(694, destino[1]) + 18], destino], 3);
  }

  // ---- de figura a SVG con tiempos ----
  function armar(id, fig, segundos) {
    var tr = fig.trazos.slice();
    tr.unshift({ p: punta(tr[0].p[0]), w: 5, par: false });
    var largo = function (p) { var L = 0; for (var i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return L; };
    var seq = tr.filter(function (t) { return !t.par; }), par = tr.filter(function (t) { return t.par; });
    var tSeq = par.length ? segundos * .55 : segundos, tPar = segundos - tSeq;
    var total = seq.reduce(function (s, t) { return s + largo(t.p); }, 0), reloj = 0;
    seq.forEach(function (t) { t.t = largo(t.p) / total * tSeq; t.d = reloj; reloj += t.t; });
    par.forEach(function (t, i) { t.t = Math.min(1.1, tPar * .6); t.d = tSeq + (tPar - t.t) * (i / Math.max(1, par.length - 1)); });
    var k = REBOBINA / segundos, html = '';
    tr.forEach(function (t) {
      var d = 'M' + t.p.map(function (q) { return f(q[0]) + ' ' + f(q[1]); }).join(' L');
      var r = (segundos - (t.d + t.t)) * k;
      html += '<g style="--d:' + t.d.toFixed(3) + 's;--t:' + t.t.toFixed(3) + 's;--r:' + r.toFixed(3) + 's;--u:' + (t.t * k).toFixed(3) + 's">' +
        '<path class="cs" pathLength="1" d="' + d + '" stroke-width="' + (t.w * 1.15 + 1).toFixed(1) + '"/>' +
        '<path class="cc" pathLength="1" d="' + d + '" stroke-width="' + t.w.toFixed(1) + '"/>' +
        '<path class="cb" pathLength="1" d="' + d + '" stroke-width="' + Math.max(1, t.w * .32).toFixed(1) + '"/></g>';
    });
    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'figura');
    g.style.display = 'none';
    g.innerHTML = html;
    svgFiguras.appendChild(g);
    figuras[id] = { el: g, seg: segundos };
  }

  // ---- la máquina: dibujar, mostrar completa, rebobinar y volver a dibujar ----
  // estados: 'quieto' (nada afuera o figura completa), 'dibujando', 'rebobinando'.
  // Cada figura se termina de dibujar y se queda un momentito antes de rebobinarse, aunque la letra ya haya
  // cambiado; el siguiente objetivo se guarda y se dibuja en cuanto la cinta vuelve a entrar al casete.
  function irA(id) {
    if (id) objetivo = id;
    if (activa && objetivo) revisar();
  }
  function revisar() {
    clearTimeout(timerEspera);
    if (!activa || !objetivo || estado !== 'quieto') return;   // al terminar de dibujar o rebobinar se vuelve a revisar
    if (actual === objetivo) return;
    if (!actual) return dibujar(objetivo);
    var falta = listaEn - performance.now();
    if (falta > 0) { timerEspera = setTimeout(revisar, falta); return; }
    rebobinar();
  }
  function dibujar(id) {
    var fg = figuras[id];
    if (!fg) return;
    actual = id; estado = 'dibujando';
    fg.el.style.display = '';
    void fg.el.getBoundingClientRect();
    fg.el.classList.add('on');
    escena.classList.remove('entrando'); escena.classList.add('saliendo');
    clearTimeout(timerFin);
    timerFin = setTimeout(function () {
      estado = 'quieto';
      listaEn = performance.now() + PAUSA * 1000;
      escena.classList.remove('saliendo');
      revisar();
    }, fg.seg * 1000 + 60);
  }
  function rebobinar() {
    var fg = figuras[actual];
    estado = 'rebobinando';
    escena.classList.remove('saliendo'); escena.classList.add('entrando');
    fg.el.classList.remove('on');
    clearTimeout(timerFin);
    timerFin = setTimeout(function () {
      fg.el.style.display = 'none';
      actual = null; estado = 'quieto';
      escena.classList.remove('entrando');
      revisar();
    }, REBOBINA * 1000 + 120);
  }
  function apagarTodo() {
    clearTimeout(timerFin); clearTimeout(timerEspera);
    Object.keys(figuras).forEach(function (k) { figuras[k].el.classList.remove('on'); figuras[k].el.style.display = 'none'; });
    actual = null; estado = 'quieto';
    escena.classList.remove('saliendo', 'entrando');
  }

  // qué figura toca según la línea que suena
  function figuraPara(texto, t) {
    if (!texto) return t < 30 ? 'retrato' : t > 226 ? 'corazon' : null;
    if (/sus ojos|estrellas/.test(texto)) return 'ojos';
    if (/sus labios|besarlos/.test(texto)) return 'labios';
    if (/su risa|sexy/.test(texto)) return 'risa';
    if (/mundo entero/.test(texto)) return 'mundo';
    if (/sonríes/.test(texto)) return 'sonrisa';
    if (/increíble|tal como eres/.test(texto)) return 'corazon';
    if (/lo sé, lo sé|no me cree|es tan, es tan|triste pensar|no ve lo que|me veo bien|le digo|te ves bien|te diré/.test(texto)) return 'espejo';
    if (/su cabello|cae perfecto|hermosa|todos los días|veo tu cara|cambiaría|cambiaras|perfección|quédate igual|sabes, sabes/.test(texto)) return 'retrato';
    return null;   // "Sí": se queda lo que está
  }

  function construir() {
    construida = true;
    var lienzoEl = document.createElement('div');
    lienzoEl.className = 'lienzo';
    escena.appendChild(lienzoEl);
    var mesa = document.createElement('canvas');
    mesa.width = W * ESC; mesa.height = H * ESC;
    mesa.className = 'mesa';
    lienzoEl.appendChild(mesa);
    var mctx = mesa.getContext('2d');
    mctx.scale(ESC, ESC);
    pintarMesa(mctx);

    // el casete: carcasa gris oscuro, etiqueta escrita a mano, ventanita con los carretes
    function casete() {
      var dientes = function (cx, cy) {
        var d = '';
        for (var i = 0; i < 6; i++) {
          var a = i * Math.PI / 3;
          d += '<rect x="' + f(cx - 1.4) + '" y="' + f(cy - 6.6) + '" width="2.8" height="3.4" fill="#2e3138" transform="rotate(' + (i * 60) + ' ' + cx + ' ' + cy + ')"/>';
        }
        return d;
      };
      return '<g transform="translate(' + CASETE.x + ' ' + CASETE.y + ') rotate(' + CASETE.rot + ')">' +
        '<rect x="6" y="9" width="260" height="166" rx="11" fill="rgba(40,24,10,.25)"/>' +
        '<rect x="0" y="0" width="260" height="166" rx="11" fill="#33373e" stroke="#16181c" stroke-width="2"/>' +
        '<rect x="4" y="4" width="252" height="158" rx="9" fill="none" stroke="#4a4f58" stroke-width="1.5"/>' +
        [[12, 12], [248, 12], [12, 154], [248, 154], [130, 154]].map(function (s) {
          return '<circle cx="' + s[0] + '" cy="' + s[1] + '" r="4" fill="#9aa0a8" stroke="#22252a" stroke-width="1"/><path d="M' + (s[0] - 2.4) + ' ' + s[1] + ' h4.8" stroke="#22252a" stroke-width="1"/>';
        }).join('') +
        // etiqueta
        '<rect x="18" y="16" width="224" height="92" rx="6" fill="#f4ecd8" stroke="#16181c" stroke-width="1.5"/>' +
        '<rect x="18" y="16" width="224" height="13" rx="6" fill="#e2a94a"/><rect x="18" y="26" width="224" height="4" fill="#d8603a"/>' +
        '<rect x="24" y="36" width="18" height="18" rx="3" fill="none" stroke="#2a2a3a" stroke-width="1.6"/><text x="33" y="50" text-anchor="middle" font-family="Fredoka, Arial, sans-serif" font-weight="700" font-size="13" fill="#2a2a3a">B</text>' +
        '<text x="52" y="50" font-family="Caveat, cursive" font-weight="700" font-size="21" fill="#2a3a8a">just the way you are</text>' +
        '<path d="M50 56 C110 54 170 57 232 55" stroke="#2a3a8a" stroke-width="1" opacity=".5" fill="none"/>' +
        // ventanita con los carretes
        '<rect x="62" y="62" width="136" height="38" rx="8" fill="#1a1c20" stroke="#16181c" stroke-width="1.5"/>' +
        '<rect x="104" y="66" width="52" height="30" rx="3" fill="#2a2d33" opacity=".8"/>' +
        '<circle cx="90" cy="81" r="15" fill="#3a2416"/><circle cx="170" cy="81" r="9" fill="#3a2416"/>' +
        '<g class="carrete"><circle cx="90" cy="81" r="7.5" fill="#f2f2ee" stroke="#16181c" stroke-width="1"/>' + dientes(90, 81) + '</g>' +
        '<g class="carrete"><circle cx="170" cy="81" r="7.5" fill="#f2f2ee" stroke="#16181c" stroke-width="1"/>' + dientes(170, 81) + '</g>' +
        '<text x="130" y="122" text-anchor="middle" font-family="Caveat, cursive" font-weight="700" font-size="15" fill="#5a4a3a">♡ para ti · 90 min</text>' +
        // la parte de abajo, por donde sale la cinta
        '<path d="M50 166 L64 132 L196 132 L210 166Z" fill="#2a2d33" stroke="#16181c" stroke-width="1.5"/>' +
        '<circle cx="80" cy="150" r="5" fill="#1a1c20"/><circle cx="180" cy="150" r="5" fill="#1a1c20"/><rect x="118" y="142" width="24" height="10" rx="2" fill="#1a1c20"/>' +
        '<path d="M70 160 L212 156" stroke="#24160f" stroke-width="2.6"/>' +
        '</g>';
    }

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('class', 'adornos');
    svg.innerHTML =
      '<defs><linearGradient id="ctSatin" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="46" y2="30" spreadMethod="reflect">' +
        '<stop offset="0" stop-color="#ffe4c4" stop-opacity=".04"/><stop offset=".55" stop-color="#ffe4c4" stop-opacity=".2"/><stop offset="1" stop-color="#fff2e2" stop-opacity=".62"/></linearGradient></defs>' +
      casete() +
      '<g class="figuras"></g>' +
      '<g class="firma"><text x="1132" y="706" text-anchor="end" font-family="Caveat, cursive" font-weight="700" font-size="30" fill="#6a5a4a" transform="rotate(-3 1132 706)">just the way you are</text>' +
        '<text x="1132" y="730" text-anchor="end" font-family="Caveat, cursive" font-size="20" fill="#8a7a6a" transform="rotate(-3 1132 730)">Bruno Mars</text></g>';
    lienzoEl.appendChild(svg);
    svgFiguras = svg.querySelector('.figuras');

    armar('ojos', figOjos(), 2.4);
    armar('labios', figLabios(), 2.2);
    armar('espejo', figEspejo(), 2.2);
    armar('corazon', figCorazon(), 2.2);
    armar('mundo', figMundo(), 2.6);
    armar('sonrisa', figRetrato('sonrisa'), 3);
    armar('risa', figRetrato('risa', 'cerrados'), 3);

    // el retrato principal: de su foto si existe img/cinta.jpg; si no, el dibujado
    var im = new Image();
    im.onload = function () {
      var r = T.desdeImagen(im, [500, 210, 940, 780], { semilla: 3 }), g = new Figura();
      r.lineas.forEach(function (p) { g.add(p, 4.4); });
      r.rellenos.forEach(function (p) { g.add(p, 3.6, true); });
      armar('retrato', g, 3.4);
      escena.classList.add('con-foto');
      irA(objetivo);
    };
    im.onerror = function () { armar('retrato', figRetrato('seria'), 3.4); irA(objetivo); };
    im.src = FOTO;
  }

  // ---- la escena sigue la letra ----
  var lineas = [];
  (window.LETRA_CINTA_LRC || '').split(/\r?\n/).forEach(function (l) {
    var m = l.match(/^\s*\[(\d+):(\d+(?:\.\d+)?)\](.*)$/);
    if (m) lineas.push({ t: +m[1] * 60 + +m[2], texto: m[3].trim().toLowerCase() });
  });
  function reaccionar() {
    if (!activa) return;
    var t = audio.currentTime, texto = '';
    for (var i = 0; i < lineas.length; i++) { if (lineas[i].t <= t) texto = lineas[i].texto; else break; }
    var clave = texto + '|' + (t < 30) + (t > 226);
    if (clave === ultima) return;
    ultima = clave;
    var id = figuraPara(texto, t);
    if (id && figuras[id]) irA(id);
  }
  audio.addEventListener('timeupdate', reaccionar);
  audio.addEventListener('ended', function () { ultima = null; });

  window.Escenas = window.Escenas || {};
  window.Escenas.cinta = {
    el: escena,
    activar: function () {
      if (!construida) construir();
      activa = true;
      ultima = null;
      // empieza desde el casete: todo guardado y sale la primera figura
      apagarTodo();
      objetivo = null;
      reaccionar();
      irA(objetivo || 'retrato');
    },
    desactivar: function () { activa = false; apagarTodo(); }
  };
})();
