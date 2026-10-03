// Escena "Luz de día" (Enanitos Verdes), noche de Halloween con el estilo del álbum (pastel al óleo +
// marcador negro, 3 cuadros que "hierven", movimientos a saltitos).
// Una luna llena gigante; delante, la colina que termina en espiral y arriba de ella la pareja tomada de
// la mano: el esqueleto flaquísimo de traje a rayas con moño de murciélago y la muñeca de trapo pelirroja
// con su vestido de parches y sus costuras. Atrás un pueblo torcido con ventanas encendidas, un árbol
// seco de ramas en espiral, murciélagos y un perrito fantasma con nariz de calabaza. Al frente el
// panteón: lápidas chuecas con velas, reja de fierro con remolinos, calabazas encendidas y la botella.
// La escena reacciona a lo que dice cada línea de la letra:
//   "champagne"            → sale volando el corcho y brotan burbujas
//   "apaga las luces"      → se apaga todo menos la luna y las calabazas
//   "velas"                → se prenden las velas del panteón
//   "heridas"              → los fantasmitas se van volando
//   "pienses / pasado"     → sube la neblina
//   "copas"                → dos copas chocan, ¡clink!
//   "encontrado"           → la pareja se acerca y sale un corazón entre los dos
//   "cielo"                → estrellas fugaces
//   "manos"                → él se inclina a besarle la mano
//   "cuerpo / nombre"      → bailan juntos arriba de la colina
//   "caricias / fuego"     → la brisa sopla hojas y las calabazas echan llamas
//   "amor / corazones"     → los murciélagos forman un corazón en la luna y suben corazones
//   "luz de noche / día"   → la noche se vuelve día y otra vez noche
//   "frenar el mundo"      → todo se congela un segundo (hasta el crayón deja de hervir)
//   "huella"               → aparecen huellas brillantes subiendo por la colina
//   "piel / distintas"     → la pareja brilla
//   "todo vale"            → fiesta: calabazas y fantasmas bailan, confeti
//   "vez más"              → la espiral da vueltas y la pareja brinca
//   "sin tu amor"          → final: todo junto
// Usa las herramientas de crayón de js/escena.js (window.Crayon); se construye la primera vez
// que se elige en el menú de canciones (js/menu.js).
(function () {
  var escena = document.getElementById('escena-luz');
  var audio = document.getElementById('bg-music');
  var C = window.Crayon;
  if (!escena || !audio || !C) return;
  var el = C.el, rnd = C.rnd, pick = C.pick, rayado = C.rayado, trazar = C.trazar, grano = C.grano;
  var CUADROS = C.CUADROS;
  var W = 1200, H = 800;
  var SVG = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;overflow:visible">';
  var K = 'stroke="#161616" stroke-linecap="round" stroke-linejoin="round"';
  var ESTADOS = ['en-champagne', 'en-apaga', 'en-velas', 'en-heridas', 'en-pasado', 'en-copas', 'en-encontrado', 'en-cielo',
    'en-manos', 'en-cuerpo', 'en-fuego', 'en-amor', 'en-dia', 'en-frena', 'en-huella', 'en-piel', 'en-fiesta', 'en-espiral', 'en-final'];
  var LUNA = [730, 330, 250];

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
  function f(n) { return (+n).toFixed(1); }
  function imagen(clase, x, y, w, h) {
    return '<image class="tex-' + clase + '" href="' + tex[clase][0] + '" x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '" preserveAspectRatio="none"/>';
  }
  // relleno de crayón recortado a una forma, con su contorno de marcador
  var nClip = 0;
  function pintado(d, clase, caja, borde) {
    var id = 'lzC' + (nClip++);
    return '<clipPath id="' + id + '"><path d="' + d + '"/></clipPath>' +
      '<g filter="url(#pastel)" clip-path="url(#' + id + ')">' + imagen(clase, caja[0], caja[1], caja[2], caja[3]) + '</g>' +
      '<path d="' + d + '" fill="none" ' + K + ' stroke-width="' + (borde || 3) + '" filter="url(#marcador)"/>';
  }
  function estrella4(x, y, r, color, clase, w) {
    return '<path class="' + clase + '" style="--w:-' + w + 's" d="M' + f(x) + ' ' + f(y - r) + ' Q' + f(x + r * .15) + ' ' + f(y - r * .15) + ' ' + f(x + r) + ' ' + f(y) +
      ' Q' + f(x + r * .15) + ' ' + f(y + r * .15) + ' ' + f(x) + ' ' + f(y + r) + ' Q' + f(x - r * .15) + ' ' + f(y + r * .15) + ' ' + f(x - r) + ' ' + f(y) +
      ' Q' + f(x - r * .15) + ' ' + f(y - r * .15) + ' ' + f(x) + ' ' + f(y - r) + 'Z" fill="' + color + '" stroke="#161616" stroke-width="1.5"/>';
  }
  var COR = 'M0 30 C-30 12 -40 -8 -32 -20 C-24 -32 -8 -30 0 -16 C8 -30 24 -32 32 -20 C40 -8 30 12 0 30Z';
  function corazon(x, y, s, i) {
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><g class="corazoncito" style="--w:-' + (i * .3).toFixed(2) + 's;--x:' + rnd(-60, 60).toFixed(0) + 'px">' +
      '<g filter="url(#pastel)" clip-path="url(#lzCor)"><image class="tex-rojo" href="' + tex.rojo[i % CUADROS] + '" x="-42" y="-36" width="84" height="70" preserveAspectRatio="none"/></g>' +
      '<path d="' + COR + '" fill="none" stroke="#161616" stroke-width="7" filter="url(#marcador)"/></g></g>';
  }
  var BAT = 'M0 0 C-5 -7 -14 -9 -24 -4 C-19 -1 -18 4 -20 9 C-14 4 -7 4 -3 7 L0 3 L3 7 C7 4 14 4 20 9 C18 4 19 -1 24 -4 C14 -9 5 -7 0 0Z';
  function murcielago(x, y, s, clase, w) {
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><g class="' + clase + '" style="--w:-' + w + 's">' +
      '<path class="ala" d="' + BAT + '" fill="#121018" stroke="#3a3448" stroke-width="1.2"/>' +
      '<circle cx="-2" cy="-1" r=".9" fill="#ffd35a"/><circle cx="2" cy="-1" r=".9" fill="#ffd35a"/></g></g>';
  }

  // ---- el cielo de noche: azul tinta arriba, morado y verde pantano abajo ----
  function pintarCielo() {
    var lista = [];
    zona(lista, 90, -40, W + 40, -40, 300, ['#0c0b1a', '#141230', '#1a1640', '#0a0814'], { len: [100, 300], ancho: [8, 14], alfa: [.6, .9] });
    zona(lista, 80, -40, W + 40, 250, 560, ['#1e1a40', '#2a2050', '#241a3a', '#18203a'], { len: [100, 300], ancho: [8, 14], alfa: [.55, .85] });
    zona(lista, 60, -40, W + 40, 500, H + 40, ['#1a2a2a', '#22303a', '#2a2240', '#14201e'], { len: [100, 300], ancho: [8, 14], alfa: [.55, .85] });
    // resplandor de la luna
    zona(lista, 50, 480, 980, 80, 580, ['#4a3a50', '#5a4858', '#3a3048'], { len: [60, 200], ancho: [4, 8], alfa: [.12, .3] });
    var urls = [];
    for (var q = 0; q < CUADROS; q++) {
      var cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      var cx = cv.getContext('2d');
      cx.fillStyle = '#100e22'; cx.fillRect(0, 0, W, H);
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

  // ---- la pareja (pies en 0,0) ----
  // él: esqueleto altísimo de traje negro a rayas, moño de murciélago, calavera con sonrisa cosida
  function esqueleto() {
    var rayas = '';
    for (var x = -14; x <= 14; x += 5) rayas += 'M' + x + ' -188 L' + f(x * .62) + ' -122 ';
    return '<g class="esqueleto">' +
      // piernas larguísimas y zapatos puntiagudos enroscados
      '<g class="piernas-el"><path d="M-6 -122 C-8 -80 -10 -40 -11 -2 M6 -122 C8 -80 10 -40 12 -2" stroke="#121016" stroke-width="7" fill="none" stroke-linecap="round"/>' +
        '<path d="M-6 -110 L-9 -10 M6 -110 L10 -10" stroke="#5a5866" stroke-width="1.2"/>' +
        '<path d="M-11 0 C-18 0 -26 -2 -30 -8 C-33 -13 -28 -16 -26 -12" stroke="#121016" stroke-width="5" fill="none" stroke-linecap="round"/>' +
        '<path d="M12 0 C19 0 27 -2 31 -8 C34 -13 29 -16 27 -12" stroke="#121016" stroke-width="5" fill="none" stroke-linecap="round"/></g>' +
      // saco a rayas con colitas
      '<path d="M-10 -126 L-20 -96 L-4 -120Z M10 -126 L20 -96 L4 -120Z" fill="#121016" ' + K + ' stroke-width="1.5"/>' +
      '<path d="M-17 -190 L17 -190 L11 -122 L-11 -122Z" fill="#121016" ' + K + ' stroke-width="2"/>' +
      '<path d="' + rayas + '" stroke="#6a6876" stroke-width="1.3"/>' +
      // brazo que se levanta hacia la luna
      '<g class="brazo-alto"><path d="M-14 -184 C-30 -196 -40 -214 -50 -238" stroke="#121016" stroke-width="6" fill="none" stroke-linecap="round"/>' +
        '<path d="M-50 -238 L-58 -256 M-50 -238 L-50 -260 M-50 -238 L-42 -256 M-50 -238 L-62 -248" stroke="#f4f1e8" stroke-width="2.4" stroke-linecap="round"/></g>' +
      // brazo que le da la mano a ella
      '<g class="brazo-mano"><path d="M14 -184 C24 -170 34 -146 44 -118" stroke="#121016" stroke-width="6" fill="none" stroke-linecap="round"/>' +
        '<path d="M44 -118 L52 -112 M44 -118 L50 -108 M44 -118 L46 -106" stroke="#f4f1e8" stroke-width="2.4" stroke-linecap="round"/></g>' +
      // moño de murciélago
      '<path d="M0 -190 C-6 -197 -15 -198 -22 -193 C-18 -190 -17 -186 -19 -182 C-13 -186 -6 -186 0 -184 C6 -186 13 -186 19 -182 C17 -186 18 -190 22 -193 C15 -198 6 -197 0 -190Z" fill="#121016" stroke="#8a8896" stroke-width="1.2"/>' +
      '<path d="M0 -190 L0 -198" stroke="#f4f1e8" stroke-width="5"/>' +
      // calavera
      '<g class="calavera"><ellipse cx="0" cy="-226" rx="25" ry="31" fill="#f4f1e8" ' + K + ' stroke-width="2.6" filter="url(#marcador)"/>' +
        '<path d="M-17 -246 C-12 -252 -4 -250 -3 -240 C-3 -230 -12 -228 -16 -232 C-20 -236 -20 -242 -17 -246Z M17 -246 C12 -252 4 -250 3 -240 C3 -230 12 -228 16 -232 C20 -236 20 -242 17 -246Z" fill="#121016"/>' +
        '<g class="brillo-ojos"><circle cx="-10" cy="-240" r="2.6" fill="#ffd35a"/><circle cx="10" cy="-240" r="2.6" fill="#ffd35a"/></g>' +
        '<path d="M-2.5 -224 L-1 -219 M2.5 -224 L1 -219" stroke="#121016" stroke-width="2" stroke-linecap="round"/>' +
        '<path d="M-17 -211 Q0 -200 17 -211" stroke="#121016" stroke-width="2" fill="none"/>' +
        '<path d="M-12 -211 L-11 -205 M-6 -208 L-6 -202 M0 -206.5 L0 -200.5 M6 -208 L6 -202 M12 -211 L11 -205" stroke="#121016" stroke-width="1.4"/></g>' +
      '</g>';
  }
  // ella: muñeca de trapo, pelo rojo largo, cara azulita con costuras, vestido de parches, medias a rayas
  function muneca() {
    var VESTIDO = 'M-12 -124 C-20 -104 -32 -76 -40 -56 C-20 -50 20 -50 40 -56 C32 -76 20 -104 12 -124Z';
    return '<g class="muneca">' +
      // pelo de atrás, largo y ondulado
      '<path class="pelo-rojo" d="M-14 -186 C-26 -176 -24 -150 -18 -128 C-14 -116 -4 -112 6 -110 C22 -108 34 -116 44 -126 C38 -130 34 -138 34 -148 C34 -170 20 -192 0 -192 C-6 -192 -10 -190 -14 -186Z" fill="#b8322a" ' + K + ' stroke-width="2.4"/>' +
      '<path d="M18 -170 C24 -150 28 -136 40 -128 M8 -176 C14 -150 14 -130 24 -116" stroke="#e05a3a" stroke-width="2" fill="none"/>' +
      // piernas con medias a rayas
      '<path d="M-6 -56 L-8 -2 M6 -56 L8 -2" stroke="#c8d8ec" stroke-width="5.5" stroke-linecap="round"/>' +
      '<path d="M-10 -46 h7 M-10 -36 h7 M-10 -26 h7 M-10 -16 h7 M4 -46 h7 M4 -36 h7 M4 -26 h7 M4 -16 h7" stroke="#2a2a3a" stroke-width="2"/>' +
      '<path d="M-8 0 C-14 0 -18 -1 -18 -4 M8 0 C14 0 18 -1 18 -4" stroke="#121016" stroke-width="4" stroke-linecap="round"/>' +
      // vestido de parches con costuras
      pintado(VESTIDO, 'parches', [-42, -126, 84, 76], 2.6) +
      '<path d="M-24 -86 L22 -88 M-30 -70 L32 -70 M-6 -124 L-14 -56 M8 -124 L14 -56" stroke="#2a2a3a" stroke-width="1.6" stroke-dasharray="3 3" fill="none"/>' +
      '<path d="M-12 -150 L12 -150 L12 -124 L-12 -124Z" fill="#4a6a9a" ' + K + ' stroke-width="2"/>' +
      '<path d="M-12 -138 L12 -140" stroke="#2a2a3a" stroke-width="1.4" stroke-dasharray="2 2"/>' +
      // brazo que le da la mano a él
      '<g class="brazo-ella"><path d="M-10 -146 C-22 -140 -34 -130 -44 -118" stroke="#c8d8ec" stroke-width="5" fill="none" stroke-linecap="round"/>' +
        '<path d="M-26 -136 l3 4 M-34 -128 l3 4" stroke="#2a2a3a" stroke-width="1.2"/></g>' +
      '<path d="M10 -146 C18 -134 20 -118 18 -104" stroke="#c8d8ec" stroke-width="5" fill="none" stroke-linecap="round"/>' +
      // cuello y cabeza con costuras
      '<path d="M0 -150 L0 -158" stroke="#c8d8ec" stroke-width="6"/><path d="M-4 -154 h8" stroke="#2a2a3a" stroke-width="1.2" stroke-dasharray="2 1.5"/>' +
      '<ellipse cx="0" cy="-174" rx="16" ry="19" fill="#c8d8ec" ' + K + ' stroke-width="2.4" filter="url(#marcador)"/>' +
      '<path d="M-12 -164 L4 -186 M-10 -168 l4 2 M-6 -174 l4 2 M-2 -180 l4 2" stroke="#2a2a3a" stroke-width="1.1" fill="none"/>' +
      '<g class="ojos-ella"><ellipse cx="-6" cy="-176" rx="3.2" ry="4" fill="#f6f6f2" stroke="#161616" stroke-width="1"/><ellipse cx="7" cy="-176" rx="3.2" ry="4" fill="#f6f6f2" stroke="#161616" stroke-width="1"/>' +
        '<circle cx="-5.5" cy="-175.5" r="1.8" fill="#161616"/><circle cx="7.5" cy="-175.5" r="1.8" fill="#161616"/>' +
        '<path d="M-10 -180 l-3 -2 M-9 -181 l-2 -3 M11 -180 l3 -2 M10 -181 l2 -3" stroke="#161616" stroke-width="1"/></g>' +
      '<path d="M-4 -165 Q1 -162 6 -165" stroke="#3a1a2a" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      // fleco rojo
      '<path d="M-16 -178 C-18 -194 -4 -198 6 -194 C14 -192 18 -184 16 -176 C12 -184 6 -188 -2 -186 C-8 -184 -12 -182 -16 -178Z" fill="#b8322a" ' + K + ' stroke-width="2"/>' +
      '</g>';
  }

  // calabaza encendida con cara tallada
  function calabaza(cx, cy, r, i, cara) {
    var cuerpo = 'M' + f(cx - r) + ' ' + f(cy) + ' C' + f(cx - r) + ' ' + f(cy - r * .9) + ' ' + f(cx - r * .3) + ' ' + f(cy - r * .85) + ' ' + f(cx) + ' ' + f(cy - r * .78) +
      ' C' + f(cx + r * .3) + ' ' + f(cy - r * .85) + ' ' + f(cx + r) + ' ' + f(cy - r * .9) + ' ' + f(cx + r) + ' ' + f(cy) +
      ' C' + f(cx + r) + ' ' + f(cy + r * .75) + ' ' + f(cx - r) + ' ' + f(cy + r * .75) + ' ' + f(cx - r) + ' ' + f(cy) + 'Z';
    var ojos = cara === 1
      ? 'M' + f(cx - r * .55) + ' ' + f(cy - r * .1) + ' L' + f(cx - r * .3) + ' ' + f(cy - r * .45) + ' L' + f(cx - r * .1) + ' ' + f(cy - r * .1) + 'Z M' + f(cx + r * .1) + ' ' + f(cy - r * .1) + ' L' + f(cx + r * .3) + ' ' + f(cy - r * .45) + ' L' + f(cx + r * .55) + ' ' + f(cy - r * .1) + 'Z'
      : 'M' + f(cx - r * .55) + ' ' + f(cy - r * .35) + ' L' + f(cx - r * .1) + ' ' + f(cy - r * .2) + ' L' + f(cx - r * .45) + ' ' + f(cy - r * .02) + 'Z M' + f(cx + r * .55) + ' ' + f(cy - r * .35) + ' L' + f(cx + r * .1) + ' ' + f(cy - r * .2) + ' L' + f(cx + r * .45) + ' ' + f(cy - r * .02) + 'Z';
    var boca = 'M' + f(cx - r * .6) + ' ' + f(cy + r * .15) + ' L' + f(cx - r * .4) + ' ' + f(cy + r * .3) + ' L' + f(cx - r * .25) + ' ' + f(cy + r * .18) + ' L' + f(cx - r * .1) + ' ' + f(cy + r * .38) +
      ' L' + f(cx + r * .1) + ' ' + f(cy + r * .2) + ' L' + f(cx + r * .25) + ' ' + f(cy + r * .38) + ' L' + f(cx + r * .4) + ' ' + f(cy + r * .2) + ' L' + f(cx + r * .6) + ' ' + f(cy + r * .15) +
      ' C' + f(cx + r * .4) + ' ' + f(cy + r * .55) + ' ' + f(cx - r * .4) + ' ' + f(cy + r * .55) + ' ' + f(cx - r * .6) + ' ' + f(cy + r * .15) + 'Z';
    var llama = 'M' + f(cx - r * .4) + ' ' + f(cy - r * .7) + ' C' + f(cx - r * .5) + ' ' + f(cy - r * 1.3) + ' ' + f(cx - r * .1) + ' ' + f(cy - r * 1.4) + ' ' + f(cx) + ' ' + f(cy - r * 2) +
      ' C' + f(cx + r * .2) + ' ' + f(cy - r * 1.5) + ' ' + f(cx + r * .55) + ' ' + f(cy - r * 1.3) + ' ' + f(cx + r * .4) + ' ' + f(cy - r * .7) + 'Z';
    return '<g class="calabaza" style="--w:-' + (i * .37).toFixed(2) + 's">' +
      '<circle class="halo-calabaza" cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r * 2.4) + '" fill="url(#lzHaloCal)"/>' +
      '<path class="fuego-calabaza" d="' + llama + '" fill="#f08a2a" stroke="#161616" stroke-width="2.4"/>' +
      pintado(cuerpo, 'calabaza', [cx - r - 4, cy - r, r * 2 + 8, r * 1.8], 3) +
      '<path d="M' + f(cx - r * .45) + ' ' + f(cy - r * .78) + ' C' + f(cx - r * .7) + ' ' + f(cy - r * .2) + ' ' + f(cx - r * .7) + ' ' + f(cy + r * .4) + ' ' + f(cx - r * .45) + ' ' + f(cy + r * .62) +
        ' M' + f(cx + r * .45) + ' ' + f(cy - r * .78) + ' C' + f(cx + r * .7) + ' ' + f(cy - r * .2) + ' ' + f(cx + r * .7) + ' ' + f(cy + r * .4) + ' ' + f(cx + r * .45) + ' ' + f(cy + r * .62) + '" stroke="#a84a14" stroke-width="2" fill="none"/>' +
      '<path d="M' + f(cx - 3) + ' ' + f(cy - r * .78) + ' C' + f(cx - 4) + ' ' + f(cy - r * 1.05) + ' ' + f(cx + 2) + ' ' + f(cy - r * 1.15) + ' ' + f(cx + 8) + ' ' + f(cy - r * 1.1) + '" stroke="#3a4a1a" stroke-width="5" fill="none" stroke-linecap="round"/>' +
      '<path class="cara-calabaza" d="' + ojos + ' ' + boca + '" fill="#ffd35a" ' + K + ' stroke-width="1.8"/></g>';
  }
  function vela(x, y, h, i) {
    return '<g class="vela"><rect x="' + f(x - 5) + '" y="' + f(y - h) + '" width="10" height="' + h + '" rx="2" fill="#f2ead2" ' + K + ' stroke-width="1.6"/>' +
      '<path d="M' + f(x - 5) + ' ' + f(y - h + 4) + ' q3 6 1 10" stroke="#f2ead2" stroke-width="3" fill="none"/>' +
      '<path d="M' + f(x) + ' ' + f(y - h) + ' v-4" stroke="#161616" stroke-width="1.4"/>' +
      '<circle class="brillo-vela" cx="' + f(x) + '" cy="' + f(y - h - 10) + '" r="22" fill="url(#lzHaloCal)"/>' +
      '<path class="llama-vela" style="--w:-' + (i * .13).toFixed(2) + 's" d="M' + f(x) + ' ' + f(y - h - 3) + ' C' + f(x - 5) + ' ' + f(y - h - 8) + ' ' + f(x - 2) + ' ' + f(y - h - 14) + ' ' + f(x) + ' ' + f(y - h - 19) +
        ' C' + f(x + 2) + ' ' + f(y - h - 14) + ' ' + f(x + 5) + ' ' + f(y - h - 8) + ' ' + f(x) + ' ' + f(y - h - 3) + 'Z" fill="#ffb03a" stroke="#161616" stroke-width="1"/></g>';
  }
  function lapida(x, y, w, h, rot, tipo, texto) {
    var d = tipo === 'cruz'
      ? 'M' + f(x - w * .15) + ' ' + f(y) + ' L' + f(x - w * .15) + ' ' + f(y - h * .6) + ' L' + f(x - w * .5) + ' ' + f(y - h * .6) + ' L' + f(x - w * .5) + ' ' + f(y - h * .78) +
        ' L' + f(x - w * .15) + ' ' + f(y - h * .78) + ' L' + f(x - w * .15) + ' ' + f(y - h) + ' L' + f(x + w * .15) + ' ' + f(y - h) + ' L' + f(x + w * .15) + ' ' + f(y - h * .78) +
        ' L' + f(x + w * .5) + ' ' + f(y - h * .78) + ' L' + f(x + w * .5) + ' ' + f(y - h * .6) + ' L' + f(x + w * .15) + ' ' + f(y - h * .6) + ' L' + f(x + w * .15) + ' ' + f(y) + 'Z'
      : 'M' + f(x - w / 2) + ' ' + f(y) + ' L' + f(x - w / 2) + ' ' + f(y - h + w / 2) + ' A' + f(w / 2) + ' ' + f(w / 2) + ' 0 0 1 ' + f(x + w / 2) + ' ' + f(y - h + w / 2) + ' L' + f(x + w / 2) + ' ' + f(y) + 'Z';
    return '<g transform="rotate(' + rot + ' ' + x + ' ' + y + ')">' + pintado(d, 'piedra', [x - w / 2 - 4, y - h - 4, w + 8, h + 8], 3) +
      (texto ? '<text x="' + x + '" y="' + f(y - h * .45) + '" text-anchor="middle" font-family="Fredoka, \'Arial Rounded MT Bold\', sans-serif" font-weight="700" font-size="' + f(w * .26) + '" fill="#2a2836">' + texto + '</text>' : '') +
      '<path d="M' + f(x + w * .2) + ' ' + f(y - h * .7) + ' l-6 10 l5 6 l-4 9" stroke="#2a2836" stroke-width="1.6" fill="none"/>' +
      '<path d="M' + f(x - w / 2) + ' ' + f(y - 4) + ' q' + f(w * .2) + ' -8 ' + f(w * .4) + ' 0" stroke="#3a6a3a" stroke-width="4" fill="none"/></g>';
  }
  function fantasma(x, y, s, i) {
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')"><g class="fantasma" style="--w:-' + (i * .6).toFixed(1) + 's">' +
      '<path d="M-22 20 C-24 -10 -16 -34 0 -34 C16 -34 24 -10 22 20 L16 14 L10 22 L4 14 L-2 22 L-8 14 L-14 22Z" fill="#eef2f6" fill-opacity=".9" ' + K + ' stroke-width="2.2"/>' +
      '<ellipse cx="-7" cy="-12" rx="3" ry="4.5" fill="#161616"/><ellipse cx="7" cy="-12" rx="3" ry="4.5" fill="#161616"/>' +
      '<ellipse cx="0" cy="0" rx="4" ry="5" fill="#161616"/></g></g>';
  }

  function construir() {
    construida = true;
    texFondo = pintarCielo();
    tex.luna = texSet('#f6d98a', ['#ffe8a8', '#f0c86a', '#fff2c8', '#e8b85a', '#ffd88a'], 50);
    tex.cerro = texSet('#1a1622', ['#2a2236', '#100e16', '#3a2a48', '#24202e', '#1e2a2a'], 50);
    tex.tierra = texSet('#1c1626', ['#2a2236', '#14101c', '#2a3a2a', '#3a2a3a', '#1e2a22'], 50);
    tex.calabaza = texSet('#f08a2a', ['#ff9a3a', '#d8701a', '#ffb05a', '#c85a14', '#ffa040'], 40);
    tex.piedra = texSet('#6a6878', ['#7a7888', '#56546a', '#8a8898', '#4a4a5a'], 35);
    tex.parches = texSet('#6a8ab8', ['#d8b04a', '#8a4a8a', '#4a7a4a', '#c86a4a', '#4a6a9a', '#e8d8a0'], 40);
    tex.pueblo = texSet('#1a1828', ['#262236', '#121020', '#2e2a40'], 35);
    tex.rojo = C.texRojo;

    mundo = el('mundo', escena);

    // ---- capa 1: cielo, estrellas, la luna (y el sol de "luz de día"), murciélagos en corazón y el pueblo ----
    var estrellas = '';
    for (var e = 0; e < 50; e++) {
      var ex = rnd(20, W - 20), ey = rnd(20, 480);
      if (Math.hypot(ex - LUNA[0], ey - LUNA[1]) < LUNA[2] + 20) continue;
      estrellas += Math.random() < .5 ? estrella4(ex, ey, rnd(3, 7), pick(['#fff6c8', '#ffffff', '#d8e8ff']), 'estrella', rnd(0, 3).toFixed(2))
        : '<circle class="estrella" style="--w:-' + rnd(0, 3).toFixed(2) + 's" cx="' + f(ex) + '" cy="' + f(ey) + '" r="' + f(rnd(1.2, 2.6)) + '" fill="#fff6e0"/>';
    }
    var fugaces = '';
    [[1150, 60, 0], [1080, 30, .9], [1180, 150, 1.7], [420, 70, 1.2]].forEach(function (s) {
      fugaces += '<g class="fugaz" style="--w:-' + s[2] + 's"><path d="M' + s[0] + ' ' + s[1] + ' l90 -40" stroke="#fff6c8" stroke-width="4" stroke-linecap="round" opacity=".7"/>' +
        estrella4(s[0], s[1], 10, '#fff6c8', 'punta-fugaz', 0) + '</g>';
    });
    var rayos = '';
    for (var r = 0; r < 16; r++) {
      var a = r / 16 * Math.PI * 2, a1 = a - .08, a2 = a + .08;
      rayos += 'M' + f(LUNA[0] + Math.cos(a1) * (LUNA[2] + 6)) + ' ' + f(LUNA[1] + Math.sin(a1) * (LUNA[2] + 6)) + ' L' + f(LUNA[0] + Math.cos(a) * (LUNA[2] + 70)) + ' ' + f(LUNA[1] + Math.sin(a) * (LUNA[2] + 70)) +
        ' L' + f(LUNA[0] + Math.cos(a2) * (LUNA[2] + 6)) + ' ' + f(LUNA[1] + Math.sin(a2) * (LUNA[2] + 6)) + 'Z ';
    }
    // murciélagos que forman un corazón en la luna con "de nuestro amor"
    var batCorazon = '';
    for (var b = 0; b < 18; b++) {
      var t = b / 18 * Math.PI * 2;
      var hx = 16 * Math.pow(Math.sin(t), 3), hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      batCorazon += murcielago(LUNA[0] + hx * 9.5, LUNA[1] - 20 + hy * 9.5, .8, 'bat-cor', (b * .05).toFixed(2));
    }
    // pueblo torcido a lo lejos
    var casas = '', ventanas = '';
    [[40, 600, 70, 90, 6], [104, 600, 60, 130, -4], [160, 600, 80, 80, 3], [236, 600, 52, 170, -6], [282, 600, 76, 100, 5], [350, 600, 64, 70, -3], [406, 600, 70, 110, 4]].forEach(function (c, i) {
      var x = c[0], y = c[1], w = c[2], h = c[3], s = c[4];
      casas += 'M' + x + ' ' + y + ' L' + (x + s) + ' ' + (y - h) + ' L' + (x + w / 2 + s * 2) + ' ' + (y - h - w * .8) + ' L' + (x + w + s) + ' ' + (y - h) + ' L' + (x + w) + ' ' + y + 'Z ';
      for (var v = 0; v < 3; v++) {
        if (Math.random() < .3) continue;
        ventanas += '<rect class="ventana" style="--w:-' + rnd(0, 3).toFixed(2) + 's" x="' + f(x + w * .25 + (v % 2) * w * .3 + s * .5) + '" y="' + f(y - h * .3 - v * h * .25) + '" width="' + f(w * .18) + '" height="' + f(w * .22) + '" fill="#ffd35a" stroke="#161616" stroke-width="1.2"/>';
      }
    });

    el('capa capa-fondo', mundo).innerHTML = SVG +
      '<defs><radialGradient id="lzHaloLuna"><stop offset=".55" stop-color="#ffe8a8" stop-opacity=".5"/><stop offset="1" stop-color="#ffe8a8" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="lzDia" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7ac0f0"/><stop offset=".6" stop-color="#f8c08a"/><stop offset="1" stop-color="#f08a6a"/></linearGradient>' +
        '<clipPath id="lzLunaClip"><circle cx="' + LUNA[0] + '" cy="' + LUNA[1] + '" r="' + LUNA[2] + '"/></clipPath></defs>' +
      '<image class="tex-fondo" href="' + texFondo[0] + '" x="0" y="0" width="' + W + '" height="' + H + '" preserveAspectRatio="none"/>' +
      '<rect class="cielo-dia" x="-100" y="-100" width="1400" height="1000" fill="url(#lzDia)"/>' +
      '<g class="estrellas">' + estrellas + '</g>' +
      '<g class="fugaces">' + fugaces + '</g>' +
      // la luna llena (con "luz de día" se vuelve sol)
      '<g class="luna">' +
        '<circle class="halo-luna" cx="' + LUNA[0] + '" cy="' + LUNA[1] + '" r="' + (LUNA[2] + 110) + '" fill="url(#lzHaloLuna)"/>' +
        '<g class="rayos-sol"><path d="' + rayos + '" fill="#ffc34a" stroke="#161616" stroke-width="2.5" stroke-linejoin="round" filter="url(#marcador)"/></g>' +
        '<g filter="url(#pastel)" clip-path="url(#lzLunaClip)">' + imagen('luna', LUNA[0] - LUNA[2], LUNA[1] - LUNA[2], LUNA[2] * 2, LUNA[2] * 2) + '</g>' +
        '<circle class="cara-sol" cx="' + LUNA[0] + '" cy="' + LUNA[1] + '" r="' + LUNA[2] + '" fill="#ffc83a" opacity="0"/>' +
        '<g fill="#e8c070" opacity=".6"><circle cx="640" cy="230" r="26"/><circle cx="830" cy="200" r="18"/><circle cx="880" cy="330" r="30"/><circle cx="600" cy="380" r="16"/><circle cx="760" cy="420" r="22"/></g>' +
        '<circle cx="' + LUNA[0] + '" cy="' + LUNA[1] + '" r="' + LUNA[2] + '" fill="none" stroke="#161616" stroke-width="4" filter="url(#marcador)"/>' +
      '</g>' +
      '<g class="bats-corazon">' + batCorazon + '</g>' +
      // el pueblo
      '<g class="pueblo">' + pintado(casas, 'pueblo', [20, 370, 480, 240], 2.5) +
        '<path d="M262 430 C252 400 272 390 264 360 C260 344 272 336 282 342" stroke="#161616" stroke-width="5" fill="none"/>' +
        ventanas + '</g>' +
    '</svg>';

    // ---- capa 2: el árbol seco, la colina espiral, la pareja, huellas, murciélagos y el perrito fantasma ----
    var CERRO = 'M300 820 C360 700 470 580 600 520 C660 494 720 486 790 488 L800 520 C700 522 620 562 560 622 C512 682 500 760 520 820Z';
    var ESPIRAL = 'M600 510 C680 486 740 486 800 488 C872 490 936 508 950 558 C962 602 926 634 892 624 C862 616 858 582 882 572 C902 566 914 584 900 594';
    var huellas = '';
    [[440, 700], [470, 660], [500, 628], [536, 596], [572, 568], [612, 542], [650, 522], [688, 504]].forEach(function (h, i) {
      var lado = i % 2 ? 6 : -6;
      huellas += '<g class="huella" style="--d:' + (i * .22).toFixed(2) + 's"><ellipse cx="' + f(h[0] + lado) + '" cy="' + f(h[1]) + '" rx="5" ry="8" transform="rotate(50 ' + f(h[0] + lado) + ' ' + h[1] + ')" fill="#ffe08a"/>' +
        '<circle cx="' + f(h[0] + lado + 7) + '" cy="' + f(h[1] - 7) + '" r="2.4" fill="#ffe08a"/></g>';
    });
    var bats = '';
    [[300, 260, .9], [380, 220, .7], [980, 200, 1], [1060, 260, .75], [560, 140, .6], [880, 120, .7], [1120, 330, .8], [450, 330, .6]].forEach(function (b, i) {
      bats += murcielago(b[0], b[1], b[2] * 1.7, 'bat', (i * .37).toFixed(2));
    });
    var corazones = '';
    [[700, 360, .4], [760, 330, .35], [820, 360, .45], [740, 280, .3], [680, 300, .35], [800, 290, .3]].forEach(function (c, i) {
      corazones += corazon(c[0], c[1], c[2], i);
    });

    el('capa capa-pared', mundo).innerHTML = SVG +
      '<defs><clipPath id="lzCor"><path d="' + COR + '"/></clipPath>' +
        '<radialGradient id="lzHaloPareja"><stop offset=".2" stop-color="#ffe8a8" stop-opacity=".7"/><stop offset="1" stop-color="#ffe8a8" stop-opacity="0"/></radialGradient></defs>' +
      // árbol seco de ramas en espiral
      '<g class="arbol" filter="url(#marcador)" fill="none" stroke="#121016" stroke-linecap="round">' +
        '<path d="M130 820 C150 700 110 600 140 480 C160 400 120 340 150 280" stroke-width="22"/>' +
        '<path d="M140 470 C190 430 250 440 270 400 C284 372 262 352 246 366 C236 376 250 388 258 380" stroke-width="9"/>' +
        '<path d="M136 400 C90 370 60 330 70 300 C78 276 104 282 100 302" stroke-width="8"/>' +
        '<path d="M150 300 C190 260 230 268 238 240 C244 220 224 214 218 228" stroke-width="7"/>' +
        '<path d="M148 560 C100 540 70 560 60 530" stroke-width="7"/></g>' +
      '<g class="bats">' + bats + '</g>' +
      // la colina con la espiral
      '<g class="cerro">' + pintado(CERRO, 'cerro', [290, 480, 520, 345], 3.5) +
        '<g class="espiral"><path d="' + ESPIRAL + '" stroke="#161616" stroke-width="50" fill="none" stroke-linecap="round"/>' +
          '<path d="' + ESPIRAL + '" stroke="#1e1a28" stroke-width="44" fill="none" stroke-linecap="round"/>' +
          '<path d="M610 492 C680 470 740 468 800 470 C866 472 922 486 940 520" stroke="#f6d98a" stroke-width="3" fill="none" opacity=".55" filter="url(#marcador)"/></g></g>' +
      '<g class="huellas">' + huellas + '</g>' +
      // la pareja arriba de la colina, frente a la luna
      '<g class="pareja">' +
        '<ellipse class="halo-pareja" cx="745" cy="360" rx="150" ry="170" fill="url(#lzHaloPareja)"/>' +
        '<g class="el-pos"><g transform="translate(700 470)">' + esqueleto() + '</g></g>' +
        '<g class="ella-pos"><g transform="translate(790 470)">' + muneca() + '</g></g>' +
        '<g class="corazon-pareja"><path d="' + COR + '" transform="translate(745 300) scale(.55)" fill="#e8243f" stroke="#161616" stroke-width="5"/></g>' +
        '<g class="besito-mano"><path d="' + COR + '" transform="translate(750 336) scale(.22)" fill="#ff5a7a" stroke="#161616" stroke-width="6"/></g>' +
        '<g class="corazones">' + corazones + '</g>' +
      '</g>' +
      // perrito fantasma con nariz de calabaza
      '<g class="perrito"><g filter="url(#marcador)">' +
        '<path d="M1010 270 C1010 246 1050 240 1060 262 C1068 280 1056 300 1040 306 C1024 316 1010 336 990 344 C1000 330 1006 314 1004 300 C994 296 1000 282 1010 270Z" fill="#eef2f6" fill-opacity=".9" ' + K + ' stroke-width="2.2"/>' +
        '<path d="M1016 256 C1004 246 998 262 1006 272 M1050 252 C1066 240 1072 258 1060 266" stroke="#161616" stroke-width="2" fill="#eef2f6"/>' +
        '<circle cx="1028" cy="266" r="2.6" fill="#161616"/><circle cx="1046" cy="266" r="2.6" fill="#161616"/>' +
        '<path d="M1028 290 h16" stroke="#3a3a4a" stroke-width="3"/></g>' +
        '<circle class="nariz" cx="1037" cy="278" r="7" fill="#f08a2a" stroke="#161616" stroke-width="1.6"/>' +
        '<circle class="halo-nariz" cx="1037" cy="278" r="18" fill="url(#lzHaloPareja)"/></g>' +
      // el apagón deja un hueco para la luna: la pareja queda en silueta contra ella
      '<path class="apagon" fill-rule="evenodd" d="M-100 -100 H1300 V900 H-100Z M' + (LUNA[0] - LUNA[2]) + ' ' + LUNA[1] + ' a' + LUNA[2] + ' ' + LUNA[2] + ' 0 1 0 ' + (LUNA[2] * 2) + ' 0 a' + LUNA[2] + ' ' + LUNA[2] + ' 0 1 0 ' + (-LUNA[2] * 2) + ' 0Z" fill="#04030a"/>' +
    '</svg>';

    // ---- capa 3: el panteón al frente ----
    var reja = '';
    function tramoReja(x0, x1, y) {
      var d = 'M' + x0 + ' ' + (y - 50) + ' H' + x1 + ' M' + x0 + ' ' + (y - 14) + ' H' + x1 + ' ';
      for (var x = x0 + 10; x < x1; x += 26) {
        d += 'M' + x + ' ' + y + ' V' + (y - 66) + ' M' + x + ' ' + (y - 66) + ' c-6 -4 -6 -12 0 -12 c4 0 5 5 1 7 ';
      }
      return d;
    }
    reja = '<path d="' + tramoReja(0, 330, 640) + tramoReja(950, 1210, 630) + '" stroke="#121016" stroke-width="4" fill="none" stroke-linecap="round" filter="url(#marcador)"/>';
    var TIERRA = 'M-40 820 L-40 650 C80 630 200 660 320 648 C440 636 520 664 640 660 C760 656 860 640 980 648 C1080 654 1160 640 1240 646 L1240 820Z';
    var hojas = '';
    for (var hh = 0; hh < 16; hh++) {
      hojas += '<path class="hoja" style="--w:-' + rnd(0, 3).toFixed(2) + 's;--y:' + rnd(-160, 40).toFixed(0) + 'px" d="M' + f(rnd(-80, 200)) + ' ' + f(rnd(380, 740)) + ' c6 -10 16 -10 20 0 c-6 8 -14 8 -20 0Z" fill="' + pick(['#f08a2a', '#c85a14', '#e8c34a', '#8a3a1a']) + '" stroke="#161616" stroke-width="1.2"/>';
    }
    var niebla = '';
    for (var n = 0; n < 9; n++) {
      niebla += '<ellipse class="nube-niebla" style="--w:-' + (n * .8).toFixed(1) + 's" cx="' + f(n * 150 + rnd(-30, 30)) + '" cy="' + f(rnd(640, 740)) + '" rx="' + f(rnd(140, 220)) + '" ry="' + f(rnd(36, 60)) + '" fill="#d8dcea" opacity=".55"/>';
    }
    var fantasmas = '';
    [[160, 520, .9], [1030, 520, .8], [470, 560, .7], [880, 470, .7]].forEach(function (g, i) { fantasmas += fantasma(g[0], g[1], g[2], i); });
    var burbujas = '';
    for (var bb = 0; bb < 16; bb++) {
      burbujas += '<circle class="burbuja" style="--w:-' + rnd(0, 1.4).toFixed(2) + 's;--x:' + rnd(-60, 60).toFixed(0) + 'px" cx="' + f(338 + rnd(-6, 6)) + '" cy="' + f(600 + rnd(-6, 6)) + '" r="' + f(rnd(3, 7)) + '" fill="#e8ffc8" fill-opacity=".6" stroke="#161616" stroke-width="1.2"/>';
    }
    var confeti = '';
    for (var cf = 0; cf < 30; cf++) {
      confeti += '<rect class="confeti" style="--w:-' + rnd(0, 3).toFixed(2) + 's;--x:' + rnd(-80, 80).toFixed(0) + 'px" x="' + f(rnd(0, W)) + '" y="-30" width="8" height="12" fill="' + pick(['#f08a2a', '#8a4ad8', '#4ad88a', '#ffd35a', '#e8243f']) + '" stroke="#161616" stroke-width="1"/>';
    }

    el('capa capa-frente', mundo).innerHTML = SVG +
      '<defs><radialGradient id="lzHaloCal"><stop offset="0" stop-color="#ffb03a" stop-opacity=".6"/><stop offset="1" stop-color="#ffb03a" stop-opacity="0"/></radialGradient></defs>' +
      '<g transform="translate(0 -64)">' +
      '<g class="nieblas" filter="url(#pastel)">' + niebla + '</g>' +
      reja +
      pintado(TIERRA, 'tierra', [-40, 630, 1280, 190], 3.5) +
      lapida(110, 700, 80, 110, -6, 'redonda', 'RIP') + lapida(430, 716, 54, 90, 5, 'cruz') + lapida(880, 706, 84, 100, 4, 'redonda', 'RIP') + lapida(1112, 696, 70, 120, -8, 'redonda', '') +
      '<g class="velas">' + vela(96, 586, 26, 0) + vela(122, 590, 18, 1) + vela(880, 600, 24, 2) + vela(470, 738, 22, 3) + vela(820, 740, 30, 4) + vela(1104, 576, 20, 5) + '</g>' +
      // la botella de champagne
      '<g class="botella" filter="url(#marcador)"><path d="M322 740 L322 650 C322 636 332 630 332 616 L332 596 L344 596 L344 616 C344 630 354 636 354 650 L354 740Z" fill="#1e4a2a" ' + K + ' stroke-width="2.4"/>' +
        '<rect x="324" y="662" width="28" height="30" fill="#e8d8a0" stroke="#161616" stroke-width="1.6"/><path d="M330 672 h16 M330 680 h12" stroke="#8a3a1a" stroke-width="2"/>' +
        '<path d="M330 600 L346 600 L346 612 L330 612Z" fill="#d8b04a"/></g>' +
      '<g class="corcho"><rect x="331" y="584" width="14" height="14" rx="2" fill="#c89a5a" stroke="#161616" stroke-width="1.6"/></g>' +
      '<g class="burbujas">' + burbujas + '</g>' +
      // las copas que chocan
      '<g class="copas" filter="url(#marcador)"><g class="copa copa-izq"><path d="M560 600 L600 600 C600 630 588 642 580 644 L580 680 L566 690 L594 690 L580 680" fill="#e8f0ff" fill-opacity=".5" ' + K + ' stroke-width="2.4"/><path d="M563 610 L597 610 C596 628 588 636 580 638 C572 636 564 628 563 610Z" fill="#f0d070"/></g>' +
        '<g class="copa copa-der"><path d="M610 600 L650 600 C650 630 638 642 630 644 L630 680 L616 690 L644 690 L630 680" fill="#e8f0ff" fill-opacity=".5" ' + K + ' stroke-width="2.4"/><path d="M613 610 L647 610 C646 628 638 636 630 638 C622 636 614 628 613 610Z" fill="#f0d070"/></g>' +
        '<g class="clink">' + estrella4(605, 586, 16, '#fff6c8', 'chispa-clink', 0) + '<text x="605" y="556" text-anchor="middle" font-family="Gochi Hand, cursive" font-size="28" fill="#fff6c8" stroke="#161616" stroke-width="1.5" paint-order="stroke">¡clink!</text></g></g>' +
      calabaza(230, 724, 42, 0, 1) + calabaza(540, 738, 34, 1, 2) + calabaza(760, 742, 30, 2, 1) + calabaza(1000, 726, 44, 3, 2) +
      '<g class="fantasmas">' + fantasmas + '</g>' +
      '<g class="hojas">' + hojas + '</g>' +
      '</g>' +
      '<g class="confetis">' + confeti + '</g>' +
      '<rect class="pausa" x="-100" y="-100" width="1400" height="1000" fill="#c8d8f0"/>' +
      // título
      '<g class="firma">' +
        '<text x="106" y="250" font-family="Caveat, cursive" font-weight="700" font-size="26" fill="#7ad86a" transform="rotate(-4 106 250)" filter="url(#marcador)">Enanitos Verdes</text>' +
        '<g class="titulo" filter="url(#pastel)" fill="#f08a2a" stroke="#161616" stroke-width="2.5" paint-order="stroke" font-family="Fredoka, \'Arial Rounded MT Bold\', sans-serif" font-weight="700">' +
          letra('L', 106, 316, 64, -6, 0) + letra('u', 148, 310, 50, 4, 1) + letra('z', 182, 316, 52, -3, 2) +
          letra('d', 226, 310, 44, 5, 3) + letra('e', 256, 314, 40, -4, 4) +
          letra('d', 120, 378, 56, 4, 5) + letra('í', 160, 374, 50, -5, 6) + letra('a', 186, 380, 54, 3, 7) +
        '</g>' + murcielago(280, 358, 1.6, 'bat', .4) +
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

  // ---- "hervor" (se detiene con "frenar el mundo por un segundo") ----
  function hervir() {
    if (escena.classList.contains('en-frena')) return;
    cuadro = (cuadro + 1) % CUADROS;
    lienzosMarco.forEach(function (cv, i) { cv.style.opacity = i === cuadro ? 1 : 0; });
    escena.querySelectorAll('.tex-fondo').forEach(function (im) { im.setAttribute('href', texFondo[cuadro]); });
    Object.keys(tex).forEach(function (k) {
      escena.querySelectorAll('.tex-' + k).forEach(function (im, i) { im.setAttribute('href', tex[k][(cuadro + i) % CUADROS]); });
    });
  }

  // ---- la escena reacciona a lo que dice la línea que suena ----
  var lineas = [];
  (window.LETRA_LUZ_LRC || '').split(/\r?\n/).forEach(function (l) {
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
    var final = /sin tu amor/.test(texto);
    escena.classList.toggle('en-champagne', /champagne/.test(texto));
    escena.classList.toggle('en-apaga', /apaga las luces/.test(texto));
    escena.classList.toggle('en-velas', /velas/.test(texto) || final);
    escena.classList.toggle('en-heridas', /heridas/.test(texto));
    escena.classList.toggle('en-pasado', /pienses|pasado/.test(texto));
    escena.classList.toggle('en-copas', /copas/.test(texto));
    escena.classList.toggle('en-encontrado', /encontrado/.test(texto));
    escena.classList.toggle('en-cielo', /cielo/.test(texto));
    escena.classList.toggle('en-manos', /manos/.test(texto));
    escena.classList.toggle('en-cuerpo', /cuerpo|nombre/.test(texto));
    escena.classList.toggle('en-fuego', /caricias|fuego/.test(texto));
    escena.classList.toggle('en-amor', /de nuestro amor|corazones|memoria|cuanto querías/.test(texto) || final);
    escena.classList.toggle('en-dia', /luz de día|luz de dia/.test(texto));
    escena.classList.toggle('en-frena', /frenar/.test(texto));
    escena.classList.toggle('en-huella', /huella|tiempo dejó/.test(texto));
    escena.classList.toggle('en-piel', /piel|reconocen|distintas/.test(texto));
    escena.classList.toggle('en-fiesta', /todo vale/.test(texto) || final);
    escena.classList.toggle('en-espiral', /vez más/.test(texto));
    escena.classList.toggle('en-final', final);
  }
  function limpiar() { ESTADOS.forEach(function (c) { escena.classList.remove(c); }); ultima = null; }
  audio.addEventListener('timeupdate', reaccionar);
  audio.addEventListener('ended', limpiar);

  window.Escenas = window.Escenas || {};
  window.Escenas.luz = {
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
