// Subtítulos de "Igual que ayer" (Enanitos Verdes) en formato LRC: [mm:ss.cc] texto.
// Una línea sin texto oculta el subtítulo. Para re-sincronizar usa sincronizar.html.
window.LETRA_AYER_LRC = `
[00:17.43] Nos conocimos sin saber
[00:20.62] Que un cigarrillo y un café
[00:24.35] Serían excusas para el tiempo de los dos
[00:31.21] Voy a salir a caminar
[00:34.78] Y aunque es muy grande la ciudad
[00:38.77] Yo presiento que nos vamos a encontrar
[00:45.72] ¿Por qué mantuviste encendida la chispa de nuestro amor?
[00:52.43] Yo ahora te llevo en cada latido de mi corazón
[00:59.62] Yo necesito tu amor
[01:02.81] Dame tu amor
[01:06.60] Yo necesito tu amor
[01:10.02] Igual que ayer
[01:13.24] ¿Cómo explicarte la emoción?
[01:16.77] Cuando escuché por fin tu voz
[01:20.15] Quedó desierta la ciudad
[01:23.63] Sólo para los dos
[01:27.13] Otra vez en el mismo bar
[01:30.68] Un cigarrillo y un café
[01:35.19] Viejas excusas de un encuentro sin final
[01:41.80] ¿Por qué mantuviste encendida la chispa de nuestro amor?
[01:48.44] Yo ahora te llevo en cada latido de mi corazón
[01:55.47] Yo necesito tu amor
[01:58.86] Dame tu amor
[02:02.39] Yo necesito tu amor
[02:05.83] Igual que ayer
[02:10.40]
[02:38.18] Parece que al final los dos
[02:44.78] Pudimos reaccionar
[02:48.26] Supimos reaccionar
[02:51.14] Recuperemos el lugar
[02:54.63] Lugar que nadie más llenó
[02:58.14] Y con las flores del jardín
[03:01.58] Florecerá el amor
[03:05.55] ¿Por qué mantuviste encendida la chispa de nuestro amor?
[03:12.59] Yo ahora te llevo en cada latido de mi corazón
[03:19.49] Yo necesito tu amor
[03:23.23] Dame tu amor
[03:26.67] Yo necesito tu amor
[03:30.10] Igual que ayer
[03:33.67] Yo necesito tu amor
[03:36.88] Dame tu amor
[03:40.52] Yo necesito tu amor
[03:44.07] Igual que ayer
[03:47.40] Yo necesito tu amor
[03:50.95] Yo necesito tu amo-or
[03:54.45] Yo necesito tu amor
[03:58.15] Igual que ayer
[04:01.37] Yo necesito tu amor
[04:05.08] Yo necesito tu amo-or
[04:08.54] Yo necesito tu amor
[04:12.07] Igual que ayer
[04:14.48]
`;

// Partes de la canción (en segundos) para la tipografía de los subtítulos.
// La escena además reacciona a lo que dice cada línea (ver js/escena-ayer.js).
window.SECCIONES_AYER = [
  { desde: 0,     tipo: 'intro' },
  { desde: 17,    tipo: 'verso' },
  { desde: 45.5,  tipo: 'coro' },
  { desde: 73,    tipo: 'verso' },
  { desde: 101.5, tipo: 'coro' },
  { desde: 130,   tipo: 'intro' },
  { desde: 158,   tipo: 'verso' },
  { desde: 185.5, tipo: 'coro' },
  { desde: 254,   tipo: 'intro' }
];
