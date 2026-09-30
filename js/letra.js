// Subtítulos de la canción (formato LRC: [mm:ss.cc] texto).
// Una línea sin texto oculta el subtítulo.
// Para re-sincronizar usa sincronizar.html.
window.LETRA_LRC = `
[00:08.12] El hombre más desnudo está hablando
[00:12.74] El hombre me habla
[00:15.22] Please, please, please, please (silence, please)
[00:16.41] Ay, no (yeah)
[00:20.56] No digas nada
[00:23.76] Creo que la ropa ya está pesada
[00:28.05] Soñar más lindo contigo de almohada, yeah
[00:33.51] Si no estás tú (woah, yeah)
[00:38.07] ¿Cómo estoy yo? (woah)
[00:42.42] Si no estás tú (woah)
[00:46.79] Mejor no estoy (woah)
[00:51.33] Porfa, entiéndeme, ya estuve roto
[00:55.72] Un hombre más llorando, todos saquen foto
[01:00.17] Aquí estamo' ayer, pensando en todo
[01:04.69] El plan no era hablar y nos contamos todo
[01:09.20] ¿Molestar en abrazarme?
[01:11.91] Créeme no es molestia, va a sanarme
[01:15.22] El hombre más desnudo está intentando hablarte
[01:19.52] Con pocas palabras porque lo han muteado bastante
[01:23.70] Lo han callado bastante (yeah)
[01:27.25]
[01:30.39] (No digas nada)
[01:33.46] Creo que la ropa ya está pesada
[01:37.86] (Soñar más lindo contigo de almohada)
[01:43.44] Si no estás tú (si no estás tú)
[01:47.81] ¿Cómo estoy yo? (¿Cómo estoy yo?)
[01:52.27] Si no estás tú (si no estás tú)
[01:56.51] Mejor no estoy
[02:01.12] No me siento mal, me siento raro
[02:05.84] Es diferente, eso sí, lo tengo claro
[02:09.94] Prendo un cigarro, y yo ya no fumo
[02:14.31] Pero si a ti te gusta, ven, te paso el humo
[02:18.55] Tómame la mano, abrázame fuerte
[02:22.89] Soy quién demuestra como adulto, pero como un niño siente
[02:28.13] Préstame un espacio, pero que sea de esos
[02:32.47] De unos que no siente
[02:35.85] Y se le olvida
[02:39.19] Cuán mierda la ha estado pasando
[02:42.62] Dicen que todo pasa y me estoy apagando
[02:48.76] Me estoy apagando
[02:51.96]
[02:58.87] (¿Cómo estoy yo?)
[03:00.85] Creo que la ropa ya está pesada
[03:05.16] Soñar más lindo contigo de almohada
[03:10.70] Si no estás tú (woah)
[03:14.97] ¿Cómo estoy yo?
[03:19.53] Si no estás tú (woah)
[03:23.90] Mejor no estoy
[03:28.17] ¿Cómo estoy yo?
[03:29.35]
`;

// Partes de la canción (en segundos): cada una tiene su propia tipografía en css/escena.css
window.SECCIONES = [
  { desde: 0,      tipo: 'intro' },  // susurro, letra a mano fina
  { desde: 20.5,   tipo: 'coro' },   // letras gordas blancas como el título de la portada
  { desde: 51,     tipo: 'verso' },  // marcador negro sobre tira de papel
  { desde: 90,     tipo: 'coro' },
  { desde: 121,    tipo: 'verso' },
  { desde: 178.5,  tipo: 'coro' }
];
