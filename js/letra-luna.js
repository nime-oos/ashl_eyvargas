// Subtítulos de "Luna" (Zoé, MTV Unplugged) en formato LRC: [mm:ss.cc] texto.
// Una línea sin texto oculta el subtítulo. Para re-sincronizar usa sincronizar.html.
window.LETRA_LUNA_LRC = `
[00:31.61] Entiendo que no puedo suplicarle una vez más
[00:38.98] Pero nada se detiene
[00:43.27] Solo vivo para ti
[00:47.79] Dame solo un beso
[00:51.15] Que me alcance hasta morir
[00:55.28] Como un vicio que me duele
[00:58.92] Quiero mirarte a los ojos
[01:59.75] Luna, no me abandones más
[02:07.16] Que tiendo a recuperarme
[02:10.21] En la cuna de tus cráteres
[02:15.76] Silencio, se abre la tierra
[02:22.85] Y se alzan los mares
[02:26.23] Al compás del volcán
[02:47.98] Cuando te me acercas se acelera mi motor
[02:55.14] Me da fiebre, me hago fuego
[02:59.09] Y me vuelvo a consumir
[03:04.13] Dame solo un beso
[03:07.15] Que me alcance hasta morir
[03:11.48] Como un vicio que me duele
[03:15.25] Quiero mirarte a los ojos
[03:21.74] Luna, no me abandones más
[03:28.74] Que tiendo a recuperarme
[03:32.58] En la cuna de tus cráteres
[03:37.75] Silencio, se abre la tierra
[03:44.56] Y se alzan los mares
[03:48.37] Al compás del volcán
[03:52.83]
`;

// Partes de la canción (en segundos) para la tipografía de los subtítulos.
// La escena además reacciona a lo que dice cada línea (ver js/escena-luna.js):
// "luna" → sale la luna; "cráteres" → le laten los cráteres; "silencio" → se apaga el escenario
// y se abre el piso; "mares / volcán" → sube el mar y saltan chispas; "motor" → reflectores y
// batería a toda velocidad; "fiebre / fuego" → los globos se ponen rojos y hay llamas;
// "beso" → corazones; "ojos" → León y la luna te miran.
window.SECCIONES_LUNA = [
  { desde: 0,     tipo: 'intro' },
  { desde: 31,    tipo: 'verso' },
  { desde: 47.5,  tipo: 'coro' },
  { desde: 119.5, tipo: 'coro' },
  { desde: 135.5, tipo: 'verso' },
  { desde: 167.5, tipo: 'verso' },
  { desde: 183.5, tipo: 'coro' },
  { desde: 201.5, tipo: 'coro' },
  { desde: 217.5, tipo: 'verso' }
];
