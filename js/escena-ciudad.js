// Escena "Ciudad de las luces" (LATIN MAFIA): la ciudad de noche con el estilo del álbum (pastel al óleo +
// marcador negro, 3 cuadros que "hierven", movimientos a saltitos).
// Al centro una noria gigante iluminada que gira, con cabinas de colores que se mecen y foquitos en el aro.
// Atrás, edificios con ventanas que se prenden y apagan, letreros de neón, luces desenfocadas, una luna y un
// farol. Abajo un puente por donde pasa el tren con las ventanas encendidas y un río que refleja toda la
// ciudad con ondas. Reflectores barren el cielo.
// La escena reacciona a lo que dice cada línea de la letra:
//   "desarmando"              → la noria y los edificios se desarman (las cabinas salen volando)
//   "construyéndote"          → todo se vuelve a armar
//   "si fue real / verte"     → los reflectores barren el cielo
//   "ciudad de las luces"     → se prenden todas las ventanas, los neones y los foquitos de la noria corren
//   "se luce"                 → la noria gira rápido y salen brillitos
//   "cautivé"                 → el corazón de neón late y suben corazones
//   "no sé quién es"          → en una ventana aparece una silueta misteriosa con signos de interrogación
//   "coincidimos"             → dos trenes se cruzan y dos estelas de luz cruzan el cielo
//   "en el aire"              → farolitos de papel suben desde el río
//   "fuimos uno"              → todo cambia de color al mismo tiempo
//   "solo quedar yo"          → se apaga la ciudad y queda una sola cabina encendida
//   "tus amigas / bailes"     → amigas bailando en silueta y bola disco
//   "viviera de nuevo"        → rebobinar: líneas de VHS y la noria gira al revés
//   "tus manos"               → dos estelas de luz rosa abrazan la noria
//   "te vuelvo a ver"         → el reflejo del río se ilumina y se llena de ondas
//   "confuso"                 → la ciudad se tambalea
//   "se sintió bien"          → fuegos artificiales
// Usa las herramientas de crayón de js/escena.js (window.Crayon); se construye la primera vez
// que se elige en el menú de canciones (js/menu.js).
(function () {
  var escena = document.getElementById('escena-ciudad');
  var audio = document.getElementById('bg-music');
  var C = window.Crayon;
  if (!escena || !audio || !C) return;
  var el = C.el, rnd = C.rnd, pick = C.pick, rayado = C.rayado, trazar = C.trazar, grano = C.grano;
  var CUADROS = C.CUADROS;
  var W = 1200, H = 800;
  var SVG = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;overflow:visible">';
  var K = 'stroke="#161616" stroke-linecap="round" stroke-linejoin="round"';
  var NEON = ['#ff3aa0', '#3ae8ff', '#ffd23a', '#a05aff', '#5aff9a', '#ff7a3a'];
  var NORIA = { x: 600, y: 350, r: 165 };
  var ESTADOS = ['en-desarma', 'en-real', 'en-luces', 'en-luce', 'en-cautive', 'en-quien', 'en-cruzan', 'en-aire', 'en-uno',
    'en-solo', 'en-amigas', 'en-baile', 'en-rebobina', 'en-manos', 'en-reflejos', 'en-confuso', 'en-arma', 'en-final'];

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
  function f(n) { return (+n).toFixed(1); }
  function imagen(clase, x, y, w, h) {
    return '<image class="tex-' + clase + '" href="' + tex[clase][0] + '" x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '" preserveAspectRatio="none"/>';
  }
  var nClip = 0;
  function pintado(d, clase, caja, borde) {
    var id = 'cdC' + (nClip++);
    return '<clipPath id="' + id + '"><path d="' + d + '"/></clipPath>' +
      '<g filter="url(#pastel)" clip-path="url(#' + id + ')">' + imagen(clase, caja[0], caja[1], caja[2], caja[3]) + '</g>' +
      (borde ? '<path d="' + d + '" fill="none" ' + K + ' stroke-width="' + borde + '" filter="url(#marcador)"/>' : '');
  }
  function estrella4(x, y, r, color, clase, w) {
    return '<path class="' + clase + '" style="--w:-' + w + 's" d="M' + f(x) + ' ' + f(y - r) + ' Q' + f(x + r * .15) + ' ' + f(y - r * .15) + ' ' + f(x + r) + ' ' + f(y) +
      ' Q' + f(x + r * .15) + ' ' + f(y + r * .15) + ' ' + f(x) + ' ' + f(y + r) + ' Q' + f(x - r * .15) + ' ' + f(y + r * .15) + ' ' + f(x - r) + ' ' + f(y) +
      ' Q' + f(x - r * .15) + ' ' + f(y - r * .15) + ' ' + f(x) + ' ' + f(y - r) + 'Z" fill="' + color + '" stroke="#161616" stroke-width="1.5"/>';
  }
  var COR = 'M0 30 C-30 12 -40 -8 -32 -20 C-24 -32 -8 -30 0 -16 C8 -30 24 -32 32 -20 C40 -8 30 12 0 30Z';
  function corazon(x, y, s, i) {
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><g class="corazoncito" style="--w:-' + (i * .3).toFixed(2) + 's;--x:' + rnd(-60, 60).toFixed(0) + 'px">' +
      '<g filter="url(#pastel)" clip-path="url(#cdCor)"><image class="tex-rojo" href="' + tex.rojo[i % CUADROS] + '" x="-42" y="-36" width="84" height="70" preserveAspectRatio="none"/></g>' +
      '<path d="' + COR + '" fill="none" stroke="#161616" stroke-width="7" filter="url(#marcador)"/></g></g>';
  }
  // ---- el cielo de la ciudad: azul noche arriba, morado y magenta abajo ----
  function pintarCielo() {
    var lista = [];
    zona(lista, 90, -40, W + 40, -40, 300, ['#0a0a24', '#12123a', '#1a1450', '#080818'], { len: [100, 300], ancho: [8, 14], alfa: [.6, .9] });
    zona(lista, 90, -40, W + 40, 250, 560, ['#2a1660', '#3a1a6a', '#22184a', '#4a1a70'], { len: [100, 300], ancho: [8, 14], alfa: [.55, .85] });
    zona(lista, 70, -40, W + 40, 480, H + 40, ['#6a1a6a', '#8a2a7a', '#c83a8a', '#3a1450', '#ff5aa0'], { len: [100, 300], ancho: [8, 14], alfa: [.45, .8] });
    var urls = [];
    for (var q = 0; q < CUADROS; q++) {
      var cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      var cx = cv.getContext('2d');
      cx.fillStyle = '#100c30'; cx.fillRect(0, 0, W, H);
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

  function construir() {
    construida = true;
    texFondo = pintarCielo();
    tex.rio = texSet('#0e1640', ['#14205a', '#0a0f30', '#1e2a70', '#3a1a5a'], 45);
    tex.edificio = texSet('#16142a', ['#201c3a', '#100e20', '#2a2244', '#1a1834'], 40);
    tex.edificio2 = texSet('#241a3e', ['#2e2250', '#1a1430', '#382a5a', '#201838'], 40);
    tex.luna = texSet('#f6eec8', ['#fff8d8', '#e8dca8', '#fffbe8'], 30);
    tex.rojo = C.texRojo;

    mundo = el('mundo', escena);

    // ---- capa 1: cielo, luna, luces desenfocadas y la ciudad con ventanas y neones ----
    var bokeh = '';
    for (var b = 0; b < 26; b++) {
      bokeh += '<circle class="bokeh" style="--w:-' + rnd(0, 4).toFixed(2) + 's" cx="' + f(rnd(0, W)) + '" cy="' + f(rnd(80, 560)) + '" r="' + f(rnd(10, 34)) + '" fill="' + pick(NEON) + '" opacity=".22"/>';
    }
    var estrellas = '';
    for (var e = 0; e < 26; e++) estrellas += '<circle class="estrella" style="--w:-' + rnd(0, 3).toFixed(2) + 's" cx="' + f(rnd(0, W)) + '" cy="' + f(rnd(10, 260)) + '" r="' + f(rnd(1, 2.4)) + '" fill="#fff6e0"/>';
    var edificios = '', ventanas = '', bloques = '';
    var lejos = [[0, 230, 90], [86, 300, 70], [150, 180, 100], [244, 260, 80], [320, 330, 70], [384, 220, 90], [780, 240, 90], [866, 160, 80], [940, 290, 90], [1024, 200, 80], [1100, 270, 110]];
    lejos.forEach(function (e, i) {
      var x = e[0], top = e[1], w = e[2], y1 = 640;
      var d = 'M' + x + ' ' + y1 + ' L' + x + ' ' + top + ' L' + (x + w) + ' ' + top + ' L' + (x + w) + ' ' + y1 + 'Z';
      if (i % 3 === 0) d += ' M' + (x + w * .4) + ' ' + top + ' L' + (x + w * .5) + ' ' + (top - 50) + ' L' + (x + w * .6) + ' ' + top + 'Z';
      var vent = '';
      for (var vy = top + 18; vy < y1 - 20; vy += 26) {
        for (var vx = x + 10; vx < x + w - 14; vx += 20) {
          if (Math.random() < .35) continue;
          var prendida = Math.random() < .55;
          vent += '<rect class="ventana' + (prendida ? ' prendida' : '') + '" style="--w:-' + rnd(0, 6).toFixed(2) + 's" x="' + f(vx) + '" y="' + f(vy) + '" width="10" height="13" fill="' + pick(['#ffd23a', '#ffe8a0', '#ff9ad0', '#9ae8ff']) + '"/>';
        }
      }
      bloques += '<g class="bloque" style="--w:' + (i * .06).toFixed(2) + 's;--dx:' + rnd(-60, 60).toFixed(0) + 'px;--dy:' + rnd(-80, 30).toFixed(0) + 'px;--dr:' + rnd(-14, 14).toFixed(0) + 'deg">' +
        pintado(d, i % 2 ? 'edificio' : 'edificio2', [x - 4, top - 54, w + 8, y1 - top + 60], 2.6) + vent + '</g>';
    });
    // la ventana de la silueta misteriosa ("no sé quién es")
    var misterio = '<g class="misterio"><rect x="934" y="470" width="62" height="78" fill="#ffd2ea" stroke="#161616" stroke-width="2.4"/>' +
      '<path d="M965 548 C952 548 946 536 948 522 C950 510 956 504 958 500 C952 494 952 482 960 478 C968 474 978 480 976 490 C976 496 972 500 970 502 C976 506 982 514 982 524 C984 538 978 548 965 548Z" fill="#1a1024"/>' +
      '<path d="M934 509 H996 M965 470 V548" stroke="#161616" stroke-width="2"/></g>';
    // letreros de neón
    var neones = '<g class="neon neon-a" filter="url(#cdBrillo)"><rect x="96" y="400" width="120" height="40" rx="8" fill="#1a0a20" stroke="#ff3aa0" stroke-width="3"/>' +
      '<text x="156" y="428" text-anchor="middle" font-family="Gochi Hand, cursive" font-size="26" fill="#ff7ac0">bar</text></g>' +
      '<g class="neon neon-b" filter="url(#cdBrillo)"><rect x="958" y="370" width="110" height="44" rx="8" fill="#0a1a20" stroke="#3ae8ff" stroke-width="3"/>' +
      '<text x="1013" y="401" text-anchor="middle" font-family="Fredoka, \'Arial Rounded MT Bold\', sans-serif" font-weight="700" font-size="24" fill="#9af4ff">143</text></g>' +
      '<g class="neon neon-c" filter="url(#cdBrillo)"><path d="' + COR + '" transform="translate(860 290) scale(.7)" fill="none" stroke="#ff3a6a" stroke-width="6"/></g>';

    el('capa capa-fondo', mundo).innerHTML = SVG +
      '<defs><filter id="cdBrillo" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
        '<radialGradient id="cdHaloLuna"><stop offset=".4" stop-color="#fff6d0" stop-opacity=".45"/><stop offset="1" stop-color="#fff6d0" stop-opacity="0"/></radialGradient></defs>' +
      '<image class="tex-fondo" href="' + texFondo[0] + '" x="0" y="0" width="' + W + '" height="' + H + '" preserveAspectRatio="none"/>' +
      '<rect class="tinte-uno" x="-100" y="-100" width="1400" height="1000" fill="#ff3aa0"/>' +
      '<g class="estrellas">' + estrellas + '</g>' +
      '<g class="luna"><circle cx="1010" cy="130" r="110" fill="url(#cdHaloLuna)"/><clipPath id="cdLuna"><circle cx="1010" cy="130" r="46"/></clipPath>' +
        '<g filter="url(#pastel)" clip-path="url(#cdLuna)">' + imagen('luna', 960, 80, 100, 100) + '</g><circle cx="1010" cy="130" r="46" fill="none" stroke="#161616" stroke-width="3" filter="url(#marcador)"/></g>' +
      '<g class="bokehs">' + bokeh + '</g>' +
      '<g class="ciudad" id="cdCiudad">' + bloques + misterio + neones + '</g>' +
      '<g class="farol"><path d="M1130 700 L1130 470 C1130 450 1110 446 1100 456" stroke="#161616" stroke-width="7" fill="none"/>' +
        '<circle class="luz-farol" cx="1096" cy="470" r="60" fill="url(#cdHaloLuna)"/><path d="M1084 456 L1108 456 L1102 474 L1090 474Z" fill="#ffe8a0" ' + K + ' stroke-width="2"/></g>' +
    '</svg>';

    // ---- capa 2: reflectores, la noria, el puente con el tren, el río con el reflejo y los farolitos ----
    var R = NORIA.r, cxN = NORIA.x, cyN = NORIA.y, rayos = '', cabinas = '', foquitos = '', piezas = '';
    for (var k = 0; k < 16; k++) {
      var a = k / 16 * Math.PI * 2;
      rayos += 'M' + cxN + ' ' + cyN + ' L' + f(cxN + Math.cos(a) * R) + ' ' + f(cyN + Math.sin(a) * R) + ' ';
    }
    for (var fq = 0; fq < 48; fq++) {
      var af = fq / 48 * Math.PI * 2;
      foquitos += '<circle class="foquito" style="--w:-' + (fq % 6 * .1).toFixed(2) + 's" cx="' + f(cxN + Math.cos(af) * R) + '" cy="' + f(cyN + Math.sin(af) * R) + '" r="4" fill="' + NEON[fq % NEON.length] + '"/>';
    }
    for (var c = 0; c < 12; c++) {
      var ac = c / 12 * Math.PI * 2, px = cxN + Math.cos(ac) * R, py = cyN + Math.sin(ac) * R, col = NEON[c % NEON.length];
      cabinas += '<g transform="translate(' + f(px) + ' ' + f(py) + ')"><g class="vuela" style="--dx:' + rnd(-260, 260).toFixed(0) + 'px;--dy:' + rnd(-260, 120).toFixed(0) + 'px;--dr:' + rnd(-90, 90).toFixed(0) + 'deg;--w:' + (c * .04).toFixed(2) + 's">' +
        '<g class="cabina' + (c === 3 ? ' unica' : '') + '"><g class="cuelga">' +
        '<path d="M0 0 L0 10" stroke="#161616" stroke-width="3"/>' +
        '<circle class="halo-cabina" cx="0" cy="30" r="30" fill="' + col + '"/>' +
        '<path d="M-20 12 L20 12 L24 22 L22 46 C22 50 18 52 14 52 L-14 52 C-18 52 -22 50 -22 46 L-24 22Z" fill="' + col + '" ' + K + ' stroke-width="2.6" filter="url(#marcador)"/>' +
        '<rect class="ventanilla" x="-15" y="20" width="30" height="16" rx="3" fill="#fff6c8" stroke="#161616" stroke-width="1.8"/>' +
        '<path d="M0 20 V36" stroke="#161616" stroke-width="1.6"/></g></g></g></g>';
    }
    // la estructura de la rueda en 6 pedazos para poder desarmarla
    for (var pz = 0; pz < 6; pz++) {
      var a0 = pz / 6 * Math.PI * 2, a1 = (pz + 1) / 6 * Math.PI * 2;
      piezas += '<g class="vuela" style="--dx:' + rnd(-160, 160).toFixed(0) + 'px;--dy:' + rnd(-160, 160).toFixed(0) + 'px;--dr:' + rnd(-40, 40).toFixed(0) + 'deg;--w:' + (pz * .05).toFixed(2) + 's">' +
        '<path d="M' + f(cxN + Math.cos(a0) * R) + ' ' + f(cyN + Math.sin(a0) * R) + ' A' + R + ' ' + R + ' 0 0 1 ' + f(cxN + Math.cos(a1) * R) + ' ' + f(cyN + Math.sin(a1) * R) +
        ' M' + f(cxN + Math.cos(a0) * R * .82) + ' ' + f(cyN + Math.sin(a0) * R * .82) + ' A' + f(R * .82) + ' ' + f(R * .82) + ' 0 0 1 ' + f(cxN + Math.cos(a1) * R * .82) + ' ' + f(cyN + Math.sin(a1) * R * .82) + '" ' +
        'stroke="#e8e4f0" stroke-width="6" fill="none" stroke-linecap="round" filter="url(#marcador)"/></g>';
    }
    var rueda = '<g class="rueda">' +
        '<path d="' + rayos + '" stroke="#c8c4d8" stroke-width="3.2" filter="url(#marcador)"/>' +
        '<circle cx="' + cxN + '" cy="' + cyN + '" r="' + f(R * .82) + '" fill="none" stroke="#161616" stroke-width="10" opacity=".5"/>' +
        '<circle cx="' + cxN + '" cy="' + cyN + '" r="' + R + '" fill="none" stroke="#161616" stroke-width="12" opacity=".5"/>' +
        piezas + '<g class="foquitos">' + foquitos + '</g>' + cabinas +
      '</g>';
    var patas = '<path d="M' + cxN + ' ' + cyN + ' L' + (cxN - 130) + ' 620 M' + cxN + ' ' + cyN + ' L' + (cxN + 130) + ' 620 M' + (cxN - 86) + ' 520 L' + (cxN + 86) + ' 520 M' + (cxN - 108) + ' 570 L' + (cxN + 108) + ' 570" stroke="#161616" stroke-width="16" stroke-linecap="round"/>' +
      '<path d="M' + cxN + ' ' + cyN + ' L' + (cxN - 130) + ' 620 M' + cxN + ' ' + cyN + ' L' + (cxN + 130) + ' 620 M' + (cxN - 86) + ' 520 L' + (cxN + 86) + ' 520 M' + (cxN - 108) + ' 570 L' + (cxN + 108) + ' 570" stroke="#8a86a0" stroke-width="10" stroke-linecap="round"/>' +
      '<circle cx="' + cxN + '" cy="' + cyN + '" r="20" fill="#ff3aa0" ' + K + ' stroke-width="3"/><circle cx="' + cxN + '" cy="' + cyN + '" r="8" fill="#ffd23a"/>';
    // tren con ventanas encendidas
    function tren(clase, dir) {
      var vag = '';
      for (var v = 0; v < 5; v++) {
        var x = v * 92;
        vag += '<rect x="' + x + '" y="0" width="86" height="34" rx="' + (v === 0 && dir > 0 || v === 4 && dir < 0 ? 14 : 4) + '" fill="#2a2a4a" ' + K + ' stroke-width="2.4"/>';
        for (var w2 = 0; w2 < 4; w2++) vag += '<rect x="' + (x + 8 + w2 * 19) + '" y="7" width="13" height="12" fill="' + pick(['#ffe8a0', '#ffd23a', '#ff9ad0']) + '"/>';
        vag += '<path d="M' + x + ' 26 H' + (x + 86) + '" stroke="#ff3aa0" stroke-width="3"/>';
      }
      return '<g class="' + clase + '"><g transform="translate(0 566)">' + vag + '<circle cx="' + (dir > 0 ? 452 : 4) + '" cy="20" r="6" fill="#fff6c8"/></g></g>';
    }
    var puente = '<path d="M-60 600 H1260" stroke="#161616" stroke-width="12"/><path d="M-60 600 H1260" stroke="#3a3654" stroke-width="7"/>';
    for (var pp = 0; pp < 14; pp++) puente += '<path d="M' + (pp * 92 - 20) + ' 600 L' + (pp * 92 + 26) + ' 640 L' + (pp * 92 + 72) + ' 600" stroke="#2a2640" stroke-width="5" fill="none"/>';
    // farolitos de papel que suben desde el río
    var farolitos = '';
    for (var fl = 0; fl < 16; fl++) {
      var fx = rnd(60, 1140), fy = rnd(660, 760);
      farolitos += '<g class="farolito" style="--w:-' + rnd(0, 4).toFixed(2) + 's;--x:' + rnd(-80, 80).toFixed(0) + 'px">' +
        '<circle cx="' + f(fx) + '" cy="' + f(fy) + '" r="18" fill="#ffb03a" opacity=".3"/>' +
        '<path d="M' + f(fx - 8) + ' ' + f(fy - 11) + ' L' + f(fx + 8) + ' ' + f(fy - 11) + ' L' + f(fx + 10) + ' ' + f(fy + 9) + ' L' + f(fx - 10) + ' ' + f(fy + 9) + 'Z" fill="#ffc86a" stroke="#161616" stroke-width="1.6"/>' +
        '<ellipse cx="' + f(fx) + '" cy="' + f(fy + 6) + '" rx="4" ry="2.4" fill="#fff6c8"/></g>';
    }
    var ondas = '';
    for (var o = 0; o < 12; o++) {
      var oy = rnd(650, 790), ox = rnd(0, 1100);
      ondas += '<path class="onda" style="--w:-' + rnd(0, 2).toFixed(2) + 's" d="M' + f(ox) + ' ' + f(oy) + ' q20 -6 40 0 t40 0 t40 0" stroke="' + pick(['#9af4ff', '#ffd2ea', '#ffe8a0']) + '" stroke-width="2.4" fill="none" opacity=".6"/>';
    }

    el('capa capa-pared', mundo).innerHTML = SVG +
      '<defs><radialGradient id="cdReflector" cx=".5" cy="1" r="1"><stop offset="0" stop-color="#fff6e0" stop-opacity=".5"/><stop offset="1" stop-color="#fff6e0" stop-opacity="0"/></radialGradient>' +
        '<clipPath id="cdRio"><rect x="-100" y="640" width="1400" height="300"/></clipPath>' +
        '<linearGradient id="cdAgua" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e1640" stop-opacity=".55"/><stop offset="1" stop-color="#05081e" stop-opacity=".9"/></linearGradient></defs>' +
      // reflectores que barren el cielo
      '<g class="reflectores"><path class="reflector r1" d="M300 640 L230 -60 L370 -60Z" fill="url(#cdReflector)"/><path class="reflector r2" d="M900 640 L830 -60 L970 -60Z" fill="url(#cdReflector)"/></g>' +
      // la noria
      '<g class="noria">' + patas + '<g id="cdRueda">' + rueda + '</g></g>' +
      // el río con el reflejo de la ciudad y la noria
      '<g clip-path="url(#cdRio)">' + pintado('M-100 640 H1300 V900 H-100Z', 'rio', [-100, 640, 1400, 260], 0) +
        '<g class="reflejo-rio"><use href="#cdCiudad" transform="translate(0 1268) scale(1 -1)"/><use href="#cdRueda" transform="translate(0 1268) scale(1 -1)"/></g>' +
        '<rect x="-100" y="640" width="1400" height="300" fill="url(#cdAgua)"/>' +
        '<g class="ondas">' + ondas + '</g></g>' +
      '<g class="puente">' + puente + '</g>' +
      '<g class="trenes">' + tren('tren t1', 1) + tren('tren t2', -1) + '</g>' +
      '<g class="farolitos">' + farolitos + '</g>' +
      // dos estelas de luz que se cruzan ("esa noche fuimos")
      '<g class="estelas" filter="url(#cdBrillo)"><path class="estela e1" pathLength="1" d="M-40 560 C300 440 500 120 1240 80" stroke="#ff3aa0" stroke-width="8" fill="none" stroke-linecap="round"/>' +
        '<path class="estela e2" pathLength="1" d="M1240 560 C900 440 700 120 -40 80" stroke="#3ae8ff" stroke-width="8" fill="none" stroke-linecap="round"/></g>' +
      // estelas rosas que abrazan la noria ("tus manos")
      '<g class="caricias" filter="url(#cdBrillo)"><path class="caricia" pathLength="1" d="M' + cxN + ' ' + (cyN + R + 40) + ' C' + (cxN - 320) + ' ' + (cyN + 140) + ' ' + (cxN - 280) + ' ' + (cyN - R - 120) + ' ' + cxN + ' ' + (cyN - 120) + '" stroke="#ff9ad0" stroke-width="7" fill="none" stroke-linecap="round"/>' +
        '<path class="caricia c2" pathLength="1" d="M' + cxN + ' ' + (cyN + R + 40) + ' C' + (cxN + 320) + ' ' + (cyN + 140) + ' ' + (cxN + 280) + ' ' + (cyN - R - 120) + ' ' + cxN + ' ' + (cyN - 120) + '" stroke="#ffd2ea" stroke-width="7" fill="none" stroke-linecap="round"/></g>' +
      '<rect class="apagon" x="-100" y="-100" width="1400" height="1000" fill="#05040e"/>' +
    '</svg>';

    // ---- capa 3: el frente (amigas, bola disco, brillitos, corazones, fuegos, VHS, título) ----
    var amigas = '';
    [[90, 1], [200, -1], [1000, 1], [1110, -1]].forEach(function (a, i) {
      var x = a[0];
      amigas += '<g class="amiga" style="--w:-' + (i * .3).toFixed(1) + 's"><g transform="translate(' + x + ' 800) scale(' + a[1] + ' 1)">' +
        '<path d="M-26 0 L-22 -110 C-22 -140 22 -140 22 -110 L26 0Z M-22 -120 C-40 -150 -46 -180 -40 -200 M22 -120 C38 -140 46 -150 50 -176" stroke="#0a0814" stroke-width="12" fill="#0a0814" stroke-linecap="round"/>' +
        '<circle cx="0" cy="-160" r="22" fill="#0a0814"/>' + (i % 2 ? '<path d="M-24 -170 C-30 -140 -26 -120 -34 -100 M24 -170 C30 -140 26 -120 34 -100" stroke="#0a0814" stroke-width="10"/>' : '<circle cx="0" cy="-182" r="16" fill="#0a0814"/>') +
        '</g></g>';
    });
    var cuadritos = '';
    for (var cy = 0; cy < 6; cy++) for (var cx = 0; cx < 6; cx++) {
      var dx = cx * 10 - 25, dy = cy * 10 - 25;
      if (dx * dx + dy * dy > 34 * 34) continue;
      cuadritos += '<rect x="' + (1000 + dx) + '" y="' + (40 + dy) + '" width="9" height="9" fill="' + pick(['#e8e8f0', '#b8b8c8', '#ffffff', '#9a9ab0']) + '"/>';
    }
    var rayosDisco = '';
    NEON.forEach(function (c, i) {
      rayosDisco += '<path class="rayo-disco" style="--w:-' + (i * .15).toFixed(2) + 's" d="M1005 45 L' + (200 + i * 160) + ' 820 L' + (260 + i * 160) + ' 820Z" fill="' + c + '" opacity=".18"/>';
    });
    var brillos = '';
    for (var br = 0; br < 14; br++) {
      var ang = br / 14 * Math.PI * 2;
      brillos += estrella4(600 + Math.cos(ang) * rnd(200, 280), 380 + Math.sin(ang) * rnd(230, 300), rnd(8, 16), pick(['#fff6c8', '#ffd2ea', '#9af4ff']), 'brillito', rnd(0, 1.5).toFixed(2));
    }
    var corazones = '';
    [[480, 380, .5], [560, 300, .4], [700, 320, .55], [760, 420, .42], [430, 520, .38], [800, 540, .45]].forEach(function (c, i) { corazones += corazon(c[0], c[1], c[2], i); });
    var fuegos = '';
    [[250, 200, '#ff3aa0'], [950, 180, '#3ae8ff'], [600, 110, '#ffd23a'], [380, 140, '#5aff9a'], [820, 120, '#a05aff']].forEach(function (fw, i) {
      var r = '';
      for (var k = 0; k < 12; k++) {
        var a = k / 12 * Math.PI * 2;
        r += 'M' + f(fw[0] + Math.cos(a) * 14) + ' ' + f(fw[1] + Math.sin(a) * 14) + ' L' + f(fw[0] + Math.cos(a) * 60) + ' ' + f(fw[1] + Math.sin(a) * 60) + ' ';
      }
      fuegos += '<g class="fuego-art" style="--w:-' + (i * .35).toFixed(2) + 's"><path d="' + r + '" stroke="' + fw[2] + '" stroke-width="5" stroke-linecap="round" filter="url(#cdBrillo2)"/></g>';
    });
    var vhs = '';
    for (var v = 0; v < 10; v++) vhs += '<rect class="linea-vhs" style="--w:-' + rnd(0, 1).toFixed(2) + 's" x="-100" y="' + f(rnd(0, 800)) + '" width="1400" height="' + f(rnd(3, 10)) + '" fill="#e8f0ff" opacity=".35"/>';

    el('capa capa-frente', mundo).innerHTML = SVG +
      '<defs><clipPath id="cdCor"><path d="' + COR + '"/></clipPath>' +
        '<filter id="cdBrillo2" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' +
      '<g class="disco"><g class="rayos-disco">' + rayosDisco + '</g>' +
        '<path d="M1005 -20 L1005 14" stroke="#161616" stroke-width="3"/>' +
        '<g class="bola"><circle cx="1005" cy="45" r="34" fill="#6a6a80"/>' + cuadritos + '<circle cx="1005" cy="45" r="34" fill="none" stroke="#161616" stroke-width="3"/></g></g>' +
      '<g class="amigas">' + amigas + '</g>' +
      '<g class="preguntas">' + [[920, 460, -14], [1010, 450, 12], [1000, 580, 8]].map(function (q, i) {
        return '<text class="pregunta" style="--w:-' + (i * .3).toFixed(1) + 's" x="' + q[0] + '" y="' + q[1] + '" transform="rotate(' + q[2] + ' ' + q[0] + ' ' + q[1] + ')" font-family="Fredoka, \'Arial Rounded MT Bold\', sans-serif" font-weight="700" font-size="36" fill="#ffd2ea" stroke="#161616" stroke-width="2" paint-order="stroke">?</text>';
      }).join('') + '</g>' +
      '<g class="brillitos">' + brillos + '</g>' +
      '<g class="corazones">' + corazones + '</g>' +
      '<g class="fuegos">' + fuegos + '</g>' +
      '<g class="vhs">' + vhs + '<text x="1080" y="720" font-family="monospace" font-size="30" fill="#e8f0ff" stroke="#161616" stroke-width="1" paint-order="stroke">◀◀</text></g>' +
      // título en neón arriba a la derecha
      '<g class="firma" filter="url(#cdBrillo2)">' +
        '<text x="1120" y="250" text-anchor="end" font-family="Caveat, cursive" font-weight="700" font-size="24" fill="#9af4ff" transform="rotate(-3 1120 250)">LATIN MAFIA</text>' +
        '<text class="titulo-neon" x="1120" y="300" text-anchor="end" font-family="Gochi Hand, cursive" font-size="46" fill="#ffd2ea" stroke="#ff3aa0" stroke-width="1.5" transform="rotate(-3 1120 300)">ciudad de</text>' +
        '<text class="titulo-neon t2" x="1120" y="346" text-anchor="end" font-family="Gochi Hand, cursive" font-size="46" fill="#ffd2ea" stroke="#ff3aa0" stroke-width="1.5" transform="rotate(-3 1120 346)">las luces</text>' +
      '</g>' +
      '<rect class="tinte-confuso" x="-100" y="-100" width="1400" height="1000" fill="#3ae8ff"/>' +
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

    // parallax 3D
    function mover(x, y) {
      mundo.style.setProperty('--ry', ((x - .5) * 14) + 'deg');
      mundo.style.setProperty('--rx', ((.5 - y) * 9) + 'deg');
      escena.style.setProperty('--px', ((x - .5) * 2).toFixed(2));
      escena.style.setProperty('--py', ((y - .5) * 2).toFixed(2));
    }
    window.addEventListener('mousemove', function (e) { if (activa) mover(e.clientX / innerWidth, e.clientY / innerHeight); });
    window.addEventListener('touchmove', function (e) { if (activa) { var t = e.touches[0]; mover(t.clientX / innerWidth, t.clientY / innerHeight); } }, { passive: true });
  }

  // ---- la noria gira a saltitos (la rueda para un lado y cada cabina al revés para colgar derechita) ----
  var angulo = 0, rueda = null, cuelgan = [];
  function girar() {
    if (!rueda) {
      rueda = escena.querySelector('.rueda');
      cuelgan = [].slice.call(escena.querySelectorAll('.cuelga'));
    }
    if (escena.classList.contains('en-desarma')) return;
    var paso = escena.classList.contains('en-luce') ? 5.6 : 1.1;
    if (escena.classList.contains('en-rebobina')) paso = -4.5;
    angulo = (angulo + paso + 360) % 360;
    rueda.setAttribute('transform', 'rotate(' + angulo.toFixed(1) + ' ' + NORIA.x + ' ' + NORIA.y + ')');
    cuelgan.forEach(function (g) { g.setAttribute('transform', 'rotate(' + (-angulo).toFixed(1) + ')'); });
  }

  // ---- "hervor" ----
  function hervir() {
    girar();
    cuadro = (cuadro + 1) % CUADROS;
    lienzosMarco.forEach(function (cv, i) { cv.style.opacity = i === cuadro ? 1 : 0; });
    escena.querySelectorAll('.tex-fondo').forEach(function (im) { im.setAttribute('href', texFondo[cuadro]); });
    Object.keys(tex).forEach(function (k) {
      escena.querySelectorAll('.tex-' + k).forEach(function (im, i) { im.setAttribute('href', tex[k][(cuadro + i) % CUADROS]); });
    });
  }

  // ---- la escena reacciona a lo que dice la línea que suena ----
  var lineas = [];
  (window.LETRA_CIUDAD_LRC || '').split(/\r?\n/).forEach(function (l) {
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
    var arma = /construyéndote/.test(texto);
    escena.classList.toggle('en-desarma', /desarmando/.test(texto) && !arma);
    escena.classList.toggle('en-arma', arma);
    escena.classList.toggle('en-real', /fue real|el momento los dos/.test(texto));
    escena.classList.toggle('en-luces', /ciudad de las luces|te ves tan bien/.test(texto));
    escena.classList.toggle('en-luce', /se luce|te ves tan bien/.test(texto));
    escena.classList.toggle('en-cautive', /cautivé/.test(texto));
    escena.classList.toggle('en-quien', /quién es/.test(texto));
    escena.classList.toggle('en-cruzan', /coincidimos/.test(texto));
    escena.classList.toggle('en-aire', /en el aire/.test(texto));
    escena.classList.toggle('en-uno', /fuimos uno/.test(texto));
    escena.classList.toggle('en-solo', /solo quedar yo/.test(texto));
    escena.classList.toggle('en-amigas', /amigas/.test(texto));
    escena.classList.toggle('en-baile', /bailes|amigas/.test(texto));
    escena.classList.toggle('en-rebobina', /viviera de nuevo/.test(texto));
    escena.classList.toggle('en-manos', /tus manos/.test(texto));
    escena.classList.toggle('en-reflejos', /te vuelvo a ver/.test(texto));
    escena.classList.toggle('en-confuso', /confuso/.test(texto));
    escena.classList.toggle('en-final', /se sintió bien/.test(texto));
  }
  function limpiar() { ESTADOS.forEach(function (c) { escena.classList.remove(c); }); ultima = null; }
  audio.addEventListener('timeupdate', reaccionar);
  audio.addEventListener('ended', limpiar);

  window.Escenas = window.Escenas || {};
  window.Escenas.ciudad = {
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
