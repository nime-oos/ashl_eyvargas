// Subtítulos de "Brillas" (León Larregui) en formato LRC: [mm:ss.cc] texto.
// Una línea sin texto oculta el subtítulo. Para re-sincronizar usa sincronizar.html.
window.LETRA_BRILLAS_LRC = `
[00:22.13] Nos dimos todo lo que se nos dio
[00:28.11] Nos dimos todo eso y mucho más
[00:33.17] Para después reconocernos, otra vez
[00:41.02] Y nos damos todo lo que se nos da
[00:46.23] Nos damos todo eso y mucho más
[00:51.13] Amanecer colgado de tus labios
[00:57.41]
[00:59.48] Brillas y brillas tan lindo
[01:03.45] Y brillamos juntos entre pestañas
[01:09.40] Divina, divina sonrisa
[01:14.05] Abrazo de luna, de luna llena
[01:19.80] Ah ah ah
[01:24.48] Ah ah ah
[01:29.78] Ah ah ah
[01:34.79] Ah ah ah
[01:39.71] Ahh ah
[01:45.12]
[01:48.23] Nos dimos todo lo que se nos dio
[01:53.37] Nos dimos todo eso y mucho más
[01:58.46] Para después reconocernos, otra vez
[02:06.46] Brillas y brillas tan lindo
[02:10.61] Y brillamos juntos entre pestañas
[02:16.15] Divina, divina sonrisa
[02:21.02] Abrazo de luna, de luna llena
[02:26.77] Y así, juntitos los dos
[02:31.81] Y así, lo que se nos dio
[02:37.05] Y así, juntitos los dos
[02:42.08] Y así, lo que se nos da
[02:47.74] Ah ah ah
[02:52.80] Ah ah ah
[02:57.56] Ah ah ah
[03:03.07] Ah ah ah
[03:08.12] Ah ah ah
[03:13.29] Ah ah ah
[03:18.37] Ah ah ah
[03:23.59] Ah ah ah
[03:28.62] Ah ah ah
[03:33.61] Ah ah ah
[03:38.61]
`;

// Partes de la canción (en segundos) para la tipografía de los subtítulos.
// La escena además reacciona a lo que dice cada línea (ver js/escena-brillas.js).
window.SECCIONES_BRILLAS = [
  { desde: 0,     tipo: 'intro' },
  { desde: 21.5,  tipo: 'verso' },
  { desde: 58.5,  tipo: 'coro' },
  { desde: 79,    tipo: 'intro' },
  { desde: 107.5, tipo: 'verso' },
  { desde: 125.5, tipo: 'coro' },
  { desde: 167,   tipo: 'intro' }
];
