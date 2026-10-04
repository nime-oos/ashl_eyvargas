// Motor de "retrato con cinta de casete" (estilo Erika Iris Simmons).
//
// Convierte dibujos en cinta magnética: líneas continuas de grosor constante, color café oscuro satinado
// con reflejos sutiles, y zonas oscuras (pelo, sombras) hechas con bucles y enredos de cinta acumulada.
//
//   Cinta.rng(semilla)                       → generador aleatorio con semilla (el retrato sale igual siempre)
//   Cinta.suavizar(puntos, paso)             → curva suave (Catmull-Rom, equivalente a Bézier) que pasa por los puntos
//   Cinta.resorte(x0, y0, x1, y1, r, vueltas, rng) → bucles de cinta enrollada entre dos puntos (enredos)
//   Cinta.rellenar(dentro, caja, n, rng, o)  → enredos de bucles dentro de una zona (pelo, sombras)
//   Cinta.dibujar(ctx, puntos, o)            → pinta un tramo de cinta en un canvas (sombra + cinta + brillo)
//   Cinta.aSVG(puntos, clase)                → la misma cinta como <path> de SVG (para los adornos animados)
//   Cinta.desdeImagen(imagen, caja, o)       → detección de bordes tipo Canny + zonas oscuras → trazos de cinta
//
// Todas las coordenadas son las del dibujo (1200 × 800).
(function () {
  var ANCHO = 5.2;                       // ancho de la cinta (el de una cinta de casete a esta escala)
  var COLOR = '#2a1810';                 // café oscuro de cinta magnética
  var SOMBRA = 'rgba(46, 26, 10, .22)';  // sombrita sobre la mesa
  var BRILLO = '255, 228, 196';          // reflejo satinado

  function rng(semilla) {
    var a = semilla >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // curva suave que pasa por todos los puntos (Catmull-Rom); 'paso' = distancia aproximada entre muestras
  function suavizar(p, paso) {
    paso = paso || 2;
    if (p.length < 3) return p.slice();
    var out = [];
    for (var i = 0; i < p.length - 1; i++) {
      var p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
      var d = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]), n = Math.max(2, Math.ceil(d / paso));
      for (var k = 0; k < n; k++) {
        var t = k / n, t2 = t * t, t3 = t2 * t;
        out.push([
          .5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
          .5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
        ]);
      }
    }
    out.push(p[p.length - 1]);
    return out;
  }

  // bucles de cinta enrollada (como un resorte estirado) de un punto a otro
  function resorte(x0, y0, x1, y1, r, vueltas, rng) {
    var pts = [], n = Math.max(24, Math.round(vueltas * 28)), fase = rng() * Math.PI * 2;
    var dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
    for (var i = 0; i <= n; i++) {
      var t = i / n, a = fase + t * vueltas * Math.PI * 2;
      var rr = r * (.75 + .35 * Math.sin(t * 7 + fase)) * (.6 + .4 * Math.sin(t * Math.PI));
      var cx = x0 + dx * t, cy = y0 + dy * t;
      // el bucle se aplana un poco en la dirección del avance, como la cinta de verdad
      var ca = Math.cos(a) * rr * .8, sa = Math.sin(a) * rr;
      pts.push([cx + ca * ux - sa * uy, cy + ca * uy + sa * ux]);
    }
    return pts;
  }

  // enredos de cinta dentro de una zona: 'dentro(x, y)' dice si el punto pertenece a la zona
  function rellenar(dentro, caja, n, rng, o) {
    o = o || {};
    var trazos = [], intentos = 0, rMin = o.rMin || 4, rMax = o.rMax || 12, dir = o.dir;
    while (trazos.length < n && intentos < n * 30) {
      intentos++;
      var x = caja[0] + rng() * (caja[2] - caja[0]), y = caja[1] + rng() * (caja[3] - caja[1]);
      if (!dentro(x, y)) continue;
      var r = rMin + rng() * (rMax - rMin), largo = r * (4 + rng() * 6);
      var ang = dir ? dir(x, y) + (rng() - .5) * .8 : rng() * Math.PI * 2;
      var x1 = x + Math.cos(ang) * largo, y1 = y + Math.sin(ang) * largo;
      if (!dentro(x1, y1)) continue;
      trazos.push(resorte(x, y, x1, y1, r, 2 + rng() * 4, rng));
    }
    return trazos;
  }

  // ---- pintar la cinta ----
  function camino(ctx, p, a, b, dx, dy) {
    ctx.beginPath();
    ctx.moveTo(p[a][0] + dx, p[a][1] + dy);
    for (var i = a + 1; i <= b; i++) ctx.lineTo(p[i][0] + dx, p[i][1] + dy);
  }
  // pinta los puntos [a, b] de un tramo (sirve para irlo dibujando poco a poco).
  // La cinta es un listón: de frente se ve ancha y cuando se tuerce se angosta y brilla en la orilla.
  function dibujar(ctx, p, o) {
    o = o || {};
    var a = o.desde || 0, b = Math.min(o.hasta == null ? p.length - 1 : o.hasta, p.length - 1), w = o.ancho || ANCHO;
    if (b - a < 1) return;
    var fase = o.fase || 0, giro = o.giro == null ? .016 : o.giro, i;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // sombrita de todo el tramo
    camino(ctx, p, a, b, 1.4, 2); ctx.strokeStyle = SOMBRA; ctx.lineWidth = w * .9 + 1; ctx.stroke();
    // la cinta, segmento por segmento con su ancho según qué tan torcida va
    ctx.strokeStyle = o.color || COLOR;
    for (i = a; i < b; i += 2) {
      var j = Math.min(i + 2, b), tw = .42 + .58 * Math.abs(Math.cos(i * giro * 1.6 + fase));
      camino(ctx, p, i, j, 0, 0); ctx.lineWidth = w * tw; ctx.stroke();
    }
    // brillo satinado: más fuerte donde la cinta se tuerce
    for (i = a; i < b; i += 3) {
      var k = Math.min(i + 3, b), t2 = Math.abs(Math.cos(i * giro * 1.6 + fase)), al = .05 + .42 * Math.pow(1 - t2, 2) + .1 * Math.pow(.5 + .5 * Math.sin(i * .05 + fase), 4);
      camino(ctx, p, i, k, -.45, -.55);
      ctx.strokeStyle = 'rgba(' + BRILLO + ',' + al.toFixed(3) + ')';
      ctx.lineWidth = Math.max(.8, w * (.42 + .58 * t2) * .3);
      ctx.stroke();
    }
  }

  // la cinta como SVG (sin filtros: ligera para animar)
  function aSVG(p, clase, w) {
    w = w || ANCHO;
    var d = 'M' + p.map(function (q) { return q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join(' L');
    return '<g class="' + (clase || '') + '" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
      '<path class="cs" pathLength="1" d="' + d + '" transform="translate(1.6 2.2)" stroke="' + SOMBRA + '" stroke-width="' + (w + 1.2) + '"/>' +
      '<path class="cc" pathLength="1" d="' + d + '" stroke="' + COLOR + '" stroke-width="' + w + '"/>' +
      '<path class="cb" pathLength="1" d="' + d + '" transform="translate(-.5 -.6)" stroke="rgba(' + BRILLO + ',.3)" stroke-width="' + (w * .38) + '" stroke-dasharray=".02 .05"/></g>';
  }

  // ---- de imagen a cinta: bordes tipo Canny + zonas oscuras ----
  // imagen: <img> o <canvas>; caja: [x0, y0, x1, y1] donde se acomoda el retrato en el dibujo
  function desdeImagen(imagen, caja, o) {
    o = o || {};
    var semilla = rng(o.semilla || 7);
    var iw = imagen.naturalWidth || imagen.width, ih = imagen.naturalHeight || imagen.height;
    var esc = Math.min(1, 240 / Math.max(iw, ih)), w = Math.round(iw * esc), h = Math.round(ih * esc);
    var cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    var cx = cv.getContext('2d');
    cx.drawImage(imagen, 0, 0, w, h);
    var px = cx.getImageData(0, 0, w, h).data, N = w * h, gris = new Float32Array(N), i, x, y;
    for (i = 0; i < N; i++) gris[i] = .299 * px[i * 4] + .587 * px[i * 4 + 1] + .114 * px[i * 4 + 2];

    // 1) suavizado gaussiano 5×5 (separable)
    var K = [1, 4, 6, 4, 1], tmp = new Float32Array(N), suave = new Float32Array(N);
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      var s = 0;
      for (var k = -2; k <= 2; k++) s += K[k + 2] * gris[y * w + Math.min(w - 1, Math.max(0, x + k))];
      tmp[y * w + x] = s / 16;
    }
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      var s2 = 0;
      for (var k2 = -2; k2 <= 2; k2++) s2 += K[k2 + 2] * tmp[Math.min(h - 1, Math.max(0, y + k2)) * w + x];
      suave[y * w + x] = s2 / 16;
    }
    // 2) gradiente de Sobel
    var mag = new Float32Array(N), dirq = new Uint8Array(N);
    for (y = 1; y < h - 1; y++) for (x = 1; x < w - 1; x++) {
      var p = function (dx, dy) { return suave[(y + dy) * w + x + dx]; };
      var gx = -p(-1, -1) - 2 * p(-1, 0) - p(-1, 1) + p(1, -1) + 2 * p(1, 0) + p(1, 1);
      var gy = -p(-1, -1) - 2 * p(0, -1) - p(1, -1) + p(-1, 1) + 2 * p(0, 1) + p(1, 1);
      i = y * w + x;
      mag[i] = Math.hypot(gx, gy);
      var ang = (Math.atan2(gy, gx) * 180 / Math.PI + 180) % 180;
      dirq[i] = ang < 22.5 || ang >= 157.5 ? 0 : ang < 67.5 ? 1 : ang < 112.5 ? 2 : 3;
    }
    // 3) supresión de no máximos
    var fino = new Float32Array(N), OFF = [[1, 0], [1, 1], [0, 1], [-1, 1]];
    for (y = 1; y < h - 1; y++) for (x = 1; x < w - 1; x++) {
      i = y * w + x;
      var d = OFF[dirq[i]], m = mag[i];
      if (m >= mag[i + d[1] * w + d[0]] && m >= mag[i - d[1] * w - d[0]]) fino[i] = m;
    }
    // 4) doble umbral + histéresis (los umbrales salen de la propia imagen)
    var vals = [];
    for (i = 0; i < N; i++) if (fino[i] > 0) vals.push(fino[i]);
    vals.sort(function (a, b) { return a - b; });
    var alto = vals[Math.floor(vals.length * (o.percentil || .86))] || 50, bajo = alto * .45;
    var borde = new Uint8Array(N), pila = [];
    for (i = 0; i < N; i++) if (fino[i] >= alto) { borde[i] = 1; pila.push(i); }
    while (pila.length) {
      var c = pila.pop(), cxp = c % w, cyp = (c / w) | 0;
      for (var oy = -1; oy <= 1; oy++) for (var ox = -1; ox <= 1; ox++) {
        var nx = cxp + ox, ny = cyp + oy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        var j = ny * w + nx;
        if (!borde[j] && fino[j] >= bajo) { borde[j] = 1; pila.push(j); }
      }
    }
    // 5) seguir los bordes para convertirlos en líneas
    var visto = new Uint8Array(N), lineas = [];
    var VEC = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
    for (i = 0; i < N; i++) {
      if (!borde[i] || visto[i]) continue;
      var linea = [], actual = i;
      while (actual >= 0) {
        visto[actual] = 1;
        linea.push([actual % w, (actual / w) | 0]);
        var sig = -1;
        for (var v = 0; v < 8; v++) {
          var qx = actual % w + VEC[v][0], qy = ((actual / w) | 0) + VEC[v][1];
          if (qx < 0 || qy < 0 || qx >= w || qy >= h) continue;
          var q = qy * w + qx;
          if (borde[q] && !visto[q]) { sig = q; break; }
        }
        actual = sig;
      }
      if (linea.length >= (o.minLargo || 10)) lineas.push(linea);
    }
    // 6) simplificar, suavizar y acomodar en la caja del dibujo
    var ex = (caja[2] - caja[0]) / w, ey = (caja[3] - caja[1]) / h, e = Math.min(ex, ey);
    var ox0 = caja[0] + ((caja[2] - caja[0]) - w * e) / 2, oy0 = caja[1] + ((caja[3] - caja[1]) - h * e) / 2;
    function aDibujo(q) { return [ox0 + q[0] * e, oy0 + q[1] * e]; }
    var trazos = lineas.map(function (l) { return suavizar(rdp(l, 1.3).map(aDibujo), 2); });
    // 7) zonas oscuras → enredos de cinta
    var media = 0;
    for (i = 0; i < N; i++) media += suave[i];
    media /= N;
    var umbral = Math.min(90, media * .55);
    var rellenos = rellenar(function (X, Y) {
      var ix = Math.round((X - ox0) / e), iy = Math.round((Y - oy0) / e);
      return ix >= 0 && iy >= 0 && ix < w && iy < h && suave[iy * w + ix] < umbral;
    }, caja, o.enredos || 260, semilla, { rMin: 3, rMax: 9 });
    return { lineas: trazos, rellenos: rellenos };
  }
  // Ramer-Douglas-Peucker: quita puntos que no cambian la forma
  function rdp(p, eps) {
    if (p.length < 3) return p;
    var a = p[0], b = p[p.length - 1], max = 0, idx = 0;
    for (var i = 1; i < p.length - 1; i++) {
      var d = distLinea(p[i], a, b);
      if (d > max) { max = d; idx = i; }
    }
    if (max <= eps) return [a, b];
    return rdp(p.slice(0, idx + 1), eps).slice(0, -1).concat(rdp(p.slice(idx), eps));
  }
  function distLinea(q, a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
    if (!L) return Math.hypot(q[0] - a[0], q[1] - a[1]);
    return Math.abs(dy * q[0] - dx * q[1] + b[0] * a[1] - b[1] * a[0]) / L;
  }

  window.Cinta = { rng: rng, suavizar: suavizar, resorte: resorte, rellenar: rellenar, dibujar: dibujar, aSVG: aSVG, desdeImagen: desdeImagen, ANCHO: ANCHO };
})();
