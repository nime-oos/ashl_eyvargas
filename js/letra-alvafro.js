// Subtítulos de "Piensas en mí" (LATIN MAFIA, Fred again..) en formato LRC: [mm:ss.cc] texto.
// Una línea sin texto oculta el subtítulo. Para re-sincronizar usa sincronizar.html.
window.LETRA_ALVAFRO_LRC = `
[00:00.85] Todo el mundo está observando
[00:11.71] Cuando estamos juntos
[00:20.07] Cuando me siento junto a ti (todo el mundo está observando)
[00:28.22] Solo tú causas tanto tema en mí
[00:34.77] Y tú no puedes verlo así
[00:37.78] Me ves, me ves en mí
[00:43.89] Me pregunto si no piensas en mí
[00:47.98] Me pregunto si no piensas en mí
[00:52.10] Me pregunto si no piensas en mí
[00:56.23] Me pregunto si no, si no, oh
[01:04.62] Tú y yo, you know
[01:12.92] Tú y yo, you know
[01:18.09] Cuando estamos juntos
[01:26.20] Cuando me siento junto a ti
[01:34.45] Solo tú causas tanto tema en mí, yeah
[01:41.05] Y tú no puedes verlo así, yeah, así, yeah
[01:46.76] Solo, oh, solo, oh
[01:50.06] Me pregunto si no piensas en mí
[01:54.19] Me pregunto si no piensas en mí
[01:58.33] Me pregunto si no piensas en mí
[02:02.52] Me pregunto si no, si no, oh
[02:10.83] Tú y yo, you know (todo el mundo está observando)
[02:15.98] Oh, tú y yo, you know (todo el mundo está observando)
[02:24.14] Oh, tú y yo, you know (todo el mundo está observándote)
[02:32.51] Oh, tú y yo, you know (todo el mundo está observándote)
[02:48.42] Todo el mundo está observando
[02:56.74] Todo el mundo está observando (uh)
[03:00.19]
`;

// Partes de la canción (en segundos) para la tipografía de los subtítulos.
// La escena además reacciona a lo que dice cada línea (ver js/escena-alvafro.js):
// "observando" → todas las fotos te miran y hay flashes; "tú y yo" → se encierran dos fotos
// con marcador rojo; "me pregunto" → se escribe "¿piensas en mí?" en el muro.
window.SECCIONES_ALVAFRO = [
  { desde: 0,     tipo: 'intro' },
  { desde: 11,    tipo: 'verso' },
  { desde: 43.5,  tipo: 'coro' },
  { desde: 64,    tipo: 'intro' },
  { desde: 78,    tipo: 'verso' },
  { desde: 109.5, tipo: 'coro' },
  { desde: 130.5, tipo: 'coro' },
  { desde: 168,   tipo: 'intro' }
];
