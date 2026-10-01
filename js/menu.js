// Menú de canciones: dos "portaditas" de crayón pegadas con cinta en la esquina.
// Al elegir una, un borrón de crayón tapa la pantalla con el título de la canción, se cambia
// la escena, la letra y el audio, y el borrón se va. Al terminar una canción sigue la otra.
(function () {
  var audio = document.getElementById('bg-music');
  var C = window.Crayon;
  if (!audio || !C || !window.cargarLetra) return;

  window.Escenas = window.Escenas || {};
  window.Escenas.nada = window.Escenas.nada || { el: document.getElementById('escena'), activar: function () {}, desactivar: function () {} };

  var CANCIONES = [
    { id: 'nada', lado: 'lado A', titulo: 'No digas nada', src: 'musica/LATIN MAFIA - No digas nada (LYRIC VIDEO).mp3',
      lrc: window.LETRA_LRC, secciones: window.SECCIONES,
      borron: ['#2ba6ea', '#3ab4f0', '#1f93dc', '#5cc4f4', '#25a58c', '#34b58b'], base: '#2fa9ea' },
    { id: 'humano', lado: 'lado B', titulo: 'Más humano', src: 'musica/LATIN MAFIA Más humano (Audio Oficial).mp3',
      lrc: window.LETRA_HUMANO_LRC, secciones: window.SECCIONES_HUMANO,
      borron: ['#121a15', '#1e2c1e', '#1f7a5a', '#3d6a9a', '#b06a3a', '#0c110f'], base: '#101612' }
  ];

  // mini portadas dibujadas con marcador
  var MINI = {
    nada: '<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#2fa9ea"/>' +
      '<path d="M12 40 C14 26 24 22 40 20 C62 18 80 19 88 24 C94 30 92 70 84 78 C70 86 36 86 20 82 C10 78 8 54 12 40Z" fill="#27a88e" stroke="#161616" stroke-width="4"/>' +
      '<path d="M26 44 C26 34 46 32 48 44Z M54 44 C54 34 76 34 76 46Z" fill="none" stroke="#161616" stroke-width="3.5" stroke-linejoin="round"/>' +
      '<path d="M28 58 C44 54 64 54 80 58 C80 70 70 76 54 76 C40 76 28 72 28 58Z" fill="none" stroke="#161616" stroke-width="3.5"/>' +
      '<path d="M22 56 C16 52 16 46 20 45 C23 44 24 47 24 48 C25 45 29 45 29 49 C29 52 26 54 22 56Z M82 62 C76 58 76 52 80 51 C83 50 84 53 84 54 C85 51 89 51 89 55 C89 58 86 60 82 62Z" fill="#d13a22"/>' +
      '</svg>',
    humano: '<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#101612"/>' +
      '<path d="M0 0 H100 V40 H0Z" fill="#18241b"/><circle cx="30" cy="22" r="9" fill="#fff4dc" opacity=".55"/>' +
      '<rect x="0" y="40" width="100" height="16" fill="#c8743c" opacity=".55"/><rect x="0" y="56" width="100" height="10" fill="#2a5a30"/>' +
      '<path d="M20 38 L100 37 L100 42 L20 43Z" fill="#1f9a6e" stroke="#161616" stroke-width="2"/>' +
      '<rect x="40" y="45" width="18" height="3" fill="#fff"/>' +
      '<path d="M34 43 V68 M72 42 V68" stroke="#8fa0a6" stroke-width="3"/>' +
      '<path d="M36 66 H72" stroke="#a39d8e" stroke-width="3"/><circle cx="41" cy="58" r="2.6" fill="#d9a27a"/><path d="M38 61 H44 V66 H38Z" fill="#2d3f35"/><path d="M38 66 H44 V70" stroke="#3f6fae" stroke-width="2.4" fill="none"/>' +
      '<rect x="0" y="70" width="100" height="4" fill="#3a2420"/>' +
      '<path d="M0 80 H100 M0 88 H100 M0 95 H100" stroke="#5b8fc4" stroke-width="3" opacity=".7"/><path d="M0 84 H100 M0 92 H100" stroke="#b06a3a" stroke-width="3" opacity=".7"/>' +
      '</svg>'
  };

  // ---- menú ----
  var menu = document.createElement('nav');
  menu.id = 'discos';
  menu.setAttribute('aria-label', 'Canciones');
  menu.innerHTML = '<div class="discos-titulo">canciones <span class="ecualizador"><i></i><i></i><i></i></span></div>';
  var botones = {};
  CANCIONES.forEach(function (c, i) {
    var b = document.createElement('button');
    b.className = 'disco';
    b.type = 'button';
    b.style.setProperty('--rot', (i ? 4 : -5) + 'deg');
    b.innerHTML = '<span class="cinta"></span><span class="portadita">' + MINI[c.id] + '</span>' +
      '<span class="disco-lado">' + c.lado + '</span><span class="disco-nombre">' + c.titulo + '</span>' +
      '<svg class="circulo" viewBox="0 0 120 150" aria-hidden="true"><path pathLength="1" d="M60 6 C100 4 116 30 114 76 C112 122 96 146 58 144 C18 142 4 118 6 72 C8 30 26 8 66 10" fill="none" stroke="#d13a22" stroke-width="6" stroke-linecap="round"/></svg>';
    b.addEventListener('click', function () { elegir(c.id); });
    menu.appendChild(b);
    botones[c.id] = b;
  });
  document.body.appendChild(menu);

  // ---- borrón de crayón para la transición ----
  var borron = document.createElement('canvas');
  borron.id = 'borron';
  document.body.appendChild(borron);

  function cubrir(c, listo) {
    var w = borron.width = innerWidth, h = borron.height = innerHeight, ctx = borron.getContext('2d');
    borron.classList.remove('fuera');
    borron.style.display = 'block';
    var trazos = [], n = 26, alto = h / n;
    for (var i = 0; i < n; i++) {
      // zigzag de crayón grueso de lado a lado, de arriba hacia abajo
      trazos.push(C.rayado(null, -60, i * alto - alto, .04 + C.rnd(-.03, .03), w + 120, 4, alto * .55, alto * 1.1, C.pick(c.borron), .95));
    }
    var hechos = 0, porCuadro = 4;
    (function paso() {
      for (var k = 0; k < porCuadro && hechos < trazos.length; k++, hechos++) C.trazar(ctx, trazos[hechos], 4);
      if (hechos < trazos.length) return setTimeout(paso, 40); // a saltitos, como animación dibujada
      // tapa los huecos que hayan quedado y escribe el título encima
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = c.base; ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
      C.grano(ctx, w, h, w * h / 90, .12);
      var tam = Math.min(w * .11, h * .14);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '700 ' + (tam * .38) + 'px "Gochi Hand", cursive';
      ctx.fillStyle = '#ebe6da';
      ctx.fillText(c.lado, w / 2, h / 2 - tam * .75);
      ctx.font = '700 ' + tam + 'px Fredoka, "Arial Rounded MT Bold", sans-serif';
      ctx.lineJoin = 'round';
      ctx.lineWidth = tam * .12;
      ctx.strokeStyle = '#161616';
      ctx.save();
      ctx.translate(w / 2, h / 2 + tam * .15);
      ctx.rotate(-.04);
      ctx.fillStyle = c.id === 'nada' ? '#1f8fd6' : '#e07a35';
      ctx.fillText(c.titulo, tam * .06, tam * .08);
      ctx.strokeText(c.titulo, 0, 0);
      ctx.fillStyle = '#eef2f3';
      ctx.fillText(c.titulo, 0, 0);
      ctx.restore();
      listo();
    })();
  }
  function destapar() {
    borron.classList.add('fuera');
    setTimeout(function () { borron.style.display = 'none'; }, 700);
  }

  // ---- cambiar de canción ----
  var actual = null, cambiando = false;
  function aplicar(c) {
    CANCIONES.forEach(function (o) {
      var esc = window.Escenas[o.id];
      if (!esc || !esc.el) return;
      var on = o.id === c.id;
      esc.el.style.display = on ? '' : 'none';
      esc.el.classList.toggle('visible', on);
      if (on) esc.activar(); else esc.desactivar();
      botones[o.id].classList.toggle('activo', on);
      botones[o.id].setAttribute('aria-pressed', on);
    });
    document.body.classList.remove('cancion-nada', 'cancion-humano');
    document.body.classList.add('cancion-' + c.id);
    window.cargarLetra(c.lrc, c.secciones);
    actual = c.id;
    try { history.replaceState(null, '', '#' + c.id); } catch (e) {}
  }
  function elegir(id, sinTransicion) {
    var c = CANCIONES.filter(function (o) { return o.id === id; })[0];
    if (!c || cambiando || id === actual) return;
    var sonando = !audio.paused || document.body.classList.contains('empezo');
    function cambiar() {
      document.body.classList.add('cambiando');
      aplicar(c);
      audio.pause();
      audio.src = c.src;
      if (sonando) { audio.currentTime = 0; audio.play().catch(function () {}); }
      requestAnimationFrame(function () { document.body.classList.remove('cambiando'); });
    }
    if (sinTransicion) return cambiar();
    cambiando = true;
    cubrir(c, function () {
      cambiar();
      setTimeout(function () { destapar(); cambiando = false; }, 650);
    });
  }

  // la música ya arrancó con el botón "Presioname": a partir de ahí el cambio también cambia el audio
  audio.addEventListener('play', function () { document.body.classList.add('empezo', 'sonando'); });
  audio.addEventListener('pause', function () { document.body.classList.remove('sonando'); });
  audio.addEventListener('ended', function () {
    var i = CANCIONES.map(function (o) { return o.id; }).indexOf(actual);
    elegir(CANCIONES[(i + 1) % CANCIONES.length].id);
  });

  // canción inicial: la del enlace (#humano) o la del lado A
  var inicial = location.hash.replace('#', '');
  if (!CANCIONES.some(function (o) { return o.id === inicial; })) inicial = 'nada';
  if (inicial === 'nada') { aplicar(CANCIONES[0]); } else { elegir(inicial, true); }
})();
