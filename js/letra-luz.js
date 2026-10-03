// Subtítulos de "Luz de día" (Enanitos Verdes) en formato LRC: [mm:ss.cc] texto.
// Una línea sin texto oculta el subtítulo. Para re-sincronizar usa sincronizar.html.
window.LETRA_LUZ_LRC = `
[00:14.98] Destapa el champagne
[00:18.65] Apaga las luces
[00:22.82] Dejemos las velas encendidas
[00:27.31] Y afuera las heridas
[00:30.85] Ya no pienses más
[00:34.52] En nuestro pasado
[00:38.58] Hagamos que choquen nuestras copas
[00:42.72] Por habernos encontrado
[00:46.47] Y porque puedo mirar el cielo, besar tus manos
[00:52.08] Sentir tu cuerpo, decir tu nombre
[00:55.99] Y las caricias serán la brisa que aviva el fuego
[01:01.47] De nuestro amor
[01:05.61] De nuestro amor
[01:11.43] Puedo ser luz de noche, ser luz de día
[01:15.92] Frenar el mundo por un segundo
[01:19.62] Y las caricias serán la brisa que aviva el fuego
[01:25.49] De nuestro amor
[01:29.40] De nuestro amor
[01:34.00]
[01:49.25] El tiempo dejó
[01:53.25] Su huella imborrable
[01:57.25] Y aunque nuestras vidas son distintas
[02:01.75] Esta noche todo vale
[02:04.68] Tu piel y mi piel
[02:08.53] Ves que se reconocen
[02:12.82] Es la memoria que hay
[02:17.53] En nuestros corazones
[02:20.79] Porque puedo mirar el cielo, besar tus manos
[02:26.64] Sentir tu cuerpo, decir tu nombre
[02:30.91] Y las caricias serán la brisa que aviva el fuego
[02:36.73] De nuestro amor
[02:40.43] De nuestro amor
[02:44.89] Puedo ser luz de noche, ser luz de día
[02:50.18] Frenar el mundo por un segundo
[02:54.16] Y que me digas cuanto querías
[02:58.69] Que esto pasara una vez más
[03:03.93] Y otra vez más
[03:08.77] Porque puedo ser luz de noche, ser luz de día
[03:14.06] Frenar el mundo por un segundo
[03:17.96] Y que me digas cuanto querías
[03:22.94] Que esto pasara una vez más
[03:27.75] Y otra vez más
[03:32.25] Y otra vez más
[03:37.50] (Sin tu amor no sé vivir)
[03:38.17] (Porque sin tu amor yo me voy a morir de pena)
[03:39.19]
`;

// Partes de la canción (en segundos) para la tipografía de los subtítulos.
// La escena además reacciona a lo que dice cada línea (ver js/escena-luz.js).
window.SECCIONES_LUZ = [
  { desde: 0,     tipo: 'intro' },
  { desde: 14.5,  tipo: 'verso' },
  { desde: 46,    tipo: 'coro' },
  { desde: 93.5,  tipo: 'intro' },
  { desde: 109,   tipo: 'verso' },
  { desde: 140.5, tipo: 'coro' },
  { desde: 188.5, tipo: 'coro' },
  { desde: 217,   tipo: 'intro' }
];
