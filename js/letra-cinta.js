// Subtítulos de "Just the way you are" (Bruno Mars), traducidos al español, en formato LRC: [mm:ss.cc] texto.
// Una línea sin texto oculta el subtítulo. Para re-sincronizar usa sincronizar.html.
window.LETRA_CINTA_LRC = `
[00:30.93] Oh, sus ojos, sus ojos
[00:34.58] Hacen que las estrellas parezcan no brillar
[00:37.51] Su cabello, su cabello
[00:39.56] Cae perfecto sin que ella lo intente
[00:42.05] Es tan hermosa
[00:44.97] Y se lo digo todos los días
[00:49.92] Sí, lo sé, lo sé
[00:52.55] Cuando le digo algo bonito, no me cree
[00:55.13] Y es tan, es tan
[00:56.92] Triste pensar que no ve lo que yo veo
[00:59.55] Pero cada vez que me pregunta: "¿Me veo bien?"
[01:03.60] Yo le digo
[01:07.10] Cuando veo tu cara
[01:10.71] No hay nada que yo cambiaría
[01:16.02] Porque eres increíble
[01:19.33] Tal como eres
[01:24.90] Y cuando sonríes
[01:29.09] El mundo entero se detiene a mirarte un rato
[01:33.78] Porque, niña, eres increíble
[01:36.86] Tal como eres
[01:43.00] Sí
[01:44.74] Sus labios, sus labios
[01:46.05] Podría besarlos todo el día si me dejara
[01:48.56] Su risa, su risa
[01:50.30] Ella la odia, pero a mí me parece tan sexy
[01:52.89] Es tan hermosa
[01:56.20] Y se lo digo todos los días
[02:00.89] Oh, tú sabes, sabes, sabes
[02:03.06] Que nunca te pediría que cambiaras
[02:06.15] Si lo que buscas es la perfección
[02:07.99] Entonces quédate igual
[02:10.69] Así que ni te molestes en preguntar si te ves bien
[02:14.54] Ya sabes lo que te diré
[02:18.10] Cuando veo tu cara
[02:21.76] No hay nada que yo cambiaría
[02:26.79] Porque eres increíble
[02:30.28] Tal como eres
[02:36.30] Y cuando sonríes
[02:40.04] El mundo entero se detiene a mirarte un rato
[02:44.60] Porque, niña, eres increíble
[02:48.22] Tal como eres
[02:53.49] Tal como eres
[02:57.71] Tal como eres
[03:02.42] Niña, eres increíble
[03:05.50] Tal como eres
[03:11.34] Cuando veo tu cara
[03:15.86] No hay nada que yo cambiaría
[03:20.30] Porque eres increíble
[03:23.53] Tal como eres
[03:29.03] Y cuando sonríes
[03:33.15] El mundo entero se detiene a mirarte un rato
[03:37.42] Porque, niña, eres increíble
[03:41.06] Tal como eres
[03:46.10] Sí
[03:48.60]
`;

// Partes de la canción (en segundos) para la tipografía de los subtítulos.
// La escena además reacciona a lo que dice cada línea (ver js/escena-cinta.js).
window.SECCIONES_CINTA = [
  { desde: 0,     tipo: 'intro' },
  { desde: 30.5,  tipo: 'verso' },
  { desde: 66.5,  tipo: 'coro' },
  { desde: 102,   tipo: 'verso' },
  { desde: 137.5, tipo: 'coro' },
  { desde: 170.5, tipo: 'coro' }
];
