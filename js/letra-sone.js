// Subtítulos de "Soñé" (Zoé, Unplugged) en formato LRC: [mm:ss.cc] texto.
// Una línea sin texto oculta el subtítulo. Para re-sincronizar usa sincronizar.html.
window.LETRA_SONE_LRC = `
[00:39.53] Ruego al tiempo aquel momento
[00:43.45] En que mi mundo se paraba entre tus labios
[00:50.00] Sólo para revivir y derretirme una vez más
[00:57.41] Mirando tus ojos negros
[01:02.44] Tengo ganas de ser aire y me respires para siempre
[01:09.80] Pues no tengo nada que perder
[01:14.88]
[01:18.54] Y todo el tiempo estoy pensando en ti
[01:25.12] En el brillo del sol y en un rincón del cielo
[01:31.17] Y todo el tiempo estoy pensando en ti
[01:36.61] En el eco del mar que retumba en tus ojos, soñé
[01:45.90]
[01:48.23] Sólo para revivir y derretirme una vez más
[01:55.72] Mirando tus ojos negros
[02:00.43] Tengo ganas de ser aire y me respires para siempre
[02:08.01] Pues no tengo nada que perder
[02:13.04] Y todo el tiempo estoy pensando en ti
[02:16.99] En el brillo del sol y en un rincón del cielo
[02:23.60] Y todo el tiempo estoy pensando en ti
[02:28.38] En el eco del mar que retumba en tus ojos
[02:35.18] Y todo el tiempo estoy pensando en ti
[02:40.15] En el brillo del sol y una mirada tuya, soñe
[02:48.24] Si te soñé
[02:51.19] Si te soñé, una vez mas
[02:55.24]
`;

// Partes de la canción (en segundos) para la tipografía de los subtítulos.
// La escena además reacciona a lo que dice cada línea (ver js/escena-sone.js):
// "tiempo" → sale un reloj que gira para atrás; "labios" → el mundo se congela y ella manda un
// beso; "derretirme" → todo se derrite; "ojos" / "mirada" → zoom a sus ojos; "aire" → remolinos
// de viento; "perder" → se van volando los globos; "pensando en ti" → los recuerdos vienen al
// frente; "sol" → sale el sol; "cielo" → estrellas fugaces; "mar" → sube el mar y hay ondas en
// sus lentes; "soñé" → noche de sueño con polvo de estrellas.
window.SECCIONES_SONE = [
  { desde: 0,     tipo: 'intro' },
  { desde: 39,    tipo: 'verso' },
  { desde: 78,    tipo: 'coro' },
  { desde: 105.5, tipo: 'intro' },
  { desde: 108,   tipo: 'verso' },
  { desde: 132.5, tipo: 'coro' },
  { desde: 168,   tipo: 'intro' }
];
