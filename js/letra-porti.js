// Subtítulos de "Es por ti" (Juanes) en formato LRC: [mm:ss.cc] texto.
// Una línea sin texto oculta el subtítulo. Para re-sincronizar usa sincronizar.html.
window.LETRA_PORTI_LRC = `
[00:03.02] Cada vez que me levanto
[00:06.47] Y veo que a mi lado estás
[00:10.72] Me siento renovado
[00:13.93] Y me siento aniquilado
[00:17.94] Aniquilado si no estás
[00:21.23] Tú controlas toda mi verdad
[00:25.49] Y todo lo que está de más
[00:29.19] Tus ojos me llevan lentamente al sol
[00:32.70] Y tu boca me habla del amor y el corazón
[00:36.56] Tu piel tiene el color
[00:40.16] De un rojo atardecer
[00:43.83] Y es por ti
[00:47.54] Que late mi corazón
[00:51.24] Y es por ti
[00:55.02] Que brillan mis ojos hoy
[00:58.67] Y es por ti
[01:02.48] Que he vuelto a hablar de amor
[01:06.00] Y es por ti
[01:09.74] Que calma mi dolor
[01:13.50]
[01:16.70] Y cada vez que yo te busco
[01:20.97] Y no te puedo aún hallar
[01:24.46] Me siento un vagabundo
[01:27.77] Perdido por el mundo
[01:31.87] Desordenado si no estás
[01:35.23] Cómo mueves tú mi felicidad
[01:39.30] Y todo lo que está de más
[01:42.93] Tus ojos me llevan lentamente al sol
[01:46.50] Y tu boca me habla del amor y el corazón
[01:50.42] Tu piel tiene el color
[01:54.03] De un rojo atardecer
[01:57.64] Y es por ti
[02:01.54] Que late mi corazón
[02:05.01] Y es por ti
[02:08.76] Que he vuelto a hablar de amor
[02:12.58] Y es por ti
[02:16.17] Que brillan mis ojos hoy
[02:19.99] Y es por ti
[02:23.57] Que calma mi dolor
[02:29.21]
[02:45.55] Cada vez que me levanto
[02:48.98] Y veo que a mi lado estás
[02:53.14] Me siento renovado
[02:56.82] Tus ojos me llevan lentamente al sol
[03:00.52] Y tu boca me habla del amor y el corazón
[03:04.28] Tu piel tiene el color
[03:07.77] De un rojo atardecer
[03:11.64] Y es por ti
[03:15.26] Que late mi corazón
[03:19.05] Y es por ti
[03:22.54] Que he vuelto a hablar de amor
[03:26.40] Y es por ti
[03:30.16] Que brillan mis ojos hoy
[03:33.71] Y es por ti
[03:37.57] Que calma mi dolor
[03:41.03] Y es por ti
[03:43.46]
[03:48.48] Y es por ti
[03:52.28]
[03:55.81] Y es por ti
[03:58.83]
[04:03.24] Y es por ti
[04:06.93] Que calma mi dolor
[04:07.42]
`;

// Partes de la canción (en segundos) para la tipografía de los subtítulos.
// La escena además reacciona a lo que dice cada línea (ver js/escena-porti.js).
window.SECCIONES_PORTI = [
  { desde: 0,     tipo: 'verso' },
  { desde: 43.5,  tipo: 'coro' },
  { desde: 73,    tipo: 'intro' },
  { desde: 76.5,  tipo: 'verso' },
  { desde: 117.5, tipo: 'coro' },
  { desde: 149,   tipo: 'intro' },
  { desde: 165,   tipo: 'verso' },
  { desde: 191.5, tipo: 'coro' }
];
