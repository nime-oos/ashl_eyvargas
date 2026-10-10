// Subtítulos de "Virgen" (Adolescent's Orquesta) en formato LRC: [mm:ss.cc] texto.
// Una línea sin texto oculta el subtítulo. Para re-sincronizar usa sincronizar.html.
window.LETRA_VIRGEN_LRC = `
[00:12.84] No finjas, que ya lo sé todo
[00:14.61] Soy mayor que tú
[00:17.77] No pienses que con eso voy a atarme a tus sentimientos
[00:23.31] No es tu primera vez, ya me di cuenta
[00:27.32] Ya no llores, ya no temas
[00:31.24] Eso no es todo en el amor
[00:33.74] Tranquila, que aquí estoy yo
[00:36.52] Tampoco pienses que soy como aquel que burló tu inocencia
[00:42.15] Sé que sí te lastimó, no hablemos más del tema
[00:47.28] Pero algo aquí falló
[00:49.83] Y para eso estoy yo
[00:52.76] Para hablarte del amor
[00:57.75] Ahora entrégate
[01:00.79] Si lloro o tiemblo es por ti, amor
[01:05.62] Es que Dios me mandó para ti
[01:09.76] A adorarte para toda la vida
[01:13.98] Siénteme
[01:16.45] Soy el hombre que muere contigo, amor
[01:21.37] Te respeta y nació para ti
[01:26.60] Niña de mi vida
[01:32.41]
[01:40.27] Como aquel que pisó la rosa y creyó que se marchitó
[01:45.23] Yo aquí fui el escogido para levantarte
[01:50.40] Te amaré y cuidaré
[01:52.87] Y te protegeré
[01:55.65] Y es que hasta mi vida te doy
[02:00.72] Y ahora entrégate
[02:03.50] Si lloro o tiemblo es por ti, amor
[02:08.75] Es que Dios me mandó para ti
[02:13.01] A adorarte para toda la vida
[02:17.07] Siénteme
[02:19.81] Soy el hombre que muere contigo, amor
[02:24.66] Yo sí te amo y vivo por ti
[02:29.98] Mi linda querida
[02:37.53]
[02:42.79] No me importa
[02:44.27] Ya no llores, no me importa tu pasado
[02:47.60] Si yo te amo
[02:49.23] Perdóname a mí por llegar tarde
[02:52.21] A lo que Dios me ha mandado
[02:53.81] No me importa
[02:55.88] Te enseñaré que eso no es todo en el amor
[02:58.20] Si yo te amo
[02:59.85] Tus sentimientos vi por dentro
[03:02.95] Y nada había pasado
[03:04.15] No me importa
[03:05.95] Para, somos una sola persona
[03:08.78] Si yo te amo
[03:10.32] Si la vida tiene tantas cosas bellas
[03:15.98]
[03:20.52] Adolescentes
[03:28.68]
[03:40.23] No llores, niña
[03:42.18] No sientas que se te acaba la vida
[03:44.93] No tienes la culpa de enamorarte
[03:47.50] Y que hayan jugado con tus sentimientos
[03:50.92] Ríe, mi vida
[03:52.93] Que ahora empieza una nueva vida que nos espera
[03:55.88] Ríe
[03:57.47] ¿Cómo evitarlo?
[03:59.15] Tú corres por mis venas
[04:01.29] Así te amo
[04:03.23] Eres la rosa más bella, mi alma es toda tuya
[04:06.77] No me importa
[04:08.26] Olvida eso, de verdad te lo pido
[04:11.45] Si yo te amo
[04:12.73] Es que yo soy tuyo
[04:14.75] Cuerpo y alma, cuerpo y mente
[04:18.62]
[04:29.34] Adolescentes
[04:29.77]
`;

// Partes de la canción (en segundos) para la tipografía de los subtítulos.
// La escena además reacciona a lo que dice cada línea (ver js/escena-virgen.js).
window.SECCIONES_VIRGEN = [
  { desde: 0,     tipo: 'intro' },
  { desde: 12.3,  tipo: 'verso' },
  { desde: 57.2,  tipo: 'coro' },
  { desde: 92,    tipo: 'intro' },
  { desde: 99.7,  tipo: 'verso' },
  { desde: 120.2, tipo: 'coro' },
  { desde: 157,   tipo: 'intro' },
  { desde: 162.3, tipo: 'coro' },
  { desde: 196,   tipo: 'intro' },
  { desde: 219.7, tipo: 'coro' },
  { desde: 268.8, tipo: 'intro' }
];
