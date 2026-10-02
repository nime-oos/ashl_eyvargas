// Subtítulos de "Labios rotos" (Zoé) en formato LRC: [mm:ss.cc] texto.
// Una línea sin texto oculta el subtítulo. Para re-sincronizar usa sincronizar.html.
window.LETRA_LABIOS_LRC = `
[00:24.48] Regálame tu corazón
[00:27.44] Déjame entrar a ese lugar
[00:33.79] Donde nacen las flores
[00:38.02] Donde nace el amor
[00:42.04] Entrégame tus labios rotos
[00:44.88] Los quiero besar, los quiero curar
[00:51.25] Los voy a cuidar
[00:55.73] Con todo mi amor
[00:59.38]
[01:02.23] Es raro el amor (Ah, ah, ah)
[01:06.88] Es raro el amor (Ah, ah, ah)
[01:10.75] Que se te aparece cuando menos piensas
[01:15.45] Es raro el amor (Ah, ah, ah)
[01:20.17] Es raro el amor (Ah, ah, ah)
[01:23.82] No importa la distancia, ni el tiempo, ni la edad, uh, uh, uh
[01:35.02]
[01:56.91] Moja el desierto de mi alma
[01:59.71] Con tu mirar, con tu tierna voz
[02:06.04] Con tu mano en mi mano
[02:10.66] Por la eternidad
[02:14.43] Y entrégame esos labios rotos
[02:17.13] Los quiero besar, los quiero curar
[02:23.63] Los voy a cuidar
[02:28.01] Con todo mi amor
[02:31.75]
[02:34.77] Es raro el amor (Ah, ah, ah)
[02:39.12] Es raro el amor (Ah, ah, ah)
[02:43.23] Que se te aparece cuando menos piensas
[02:47.93] Es raro el amor (Ah, ah, ah)
[02:52.48] Es raro el amor (Ah, ah, ah)
[02:56.35] No importa la distancia, ni el tiempo, ni la edad
[03:02.79] (Uh) Ah-ah-ah
[03:07.44] (Uh) Ah-ah-ah
[03:11.03]
[03:17.79] Ah-ah-ah
[03:22.28] Ah-ah-ah
[03:26.38] Amor, amor
[03:28.28] Amor, amor
[03:30.20] Amor, amor
[03:32.53] Amor, amor
[03:34.67] Amor, amor
[03:36.86] Amor, amor, amor
[03:41.24]
[03:43.36] Ah-ah-ah
[03:48.01] Ah-ah-ah
[03:49.67]
`;

// Partes de la canción (en segundos) para la tipografía de los subtítulos.
// La escena además reacciona a lo que dice cada línea (ver js/escena-labios.js):
// "corazón" → un corazón late en la luz; "lugar" → el círculo de luz se abre; "flores" → brotan
// flores nuevas; "amor" → suben corazones; "labios rotos" → aparecen unos labios partidos;
// "besar" → besitos; "curar / cuidar" → se cierra la grieta con una curita; "raro" → la luz cambia
// de color y las sombras bailan solas; "aparece" → llueven pétalos; "distancia / tiempo" → la luz
// cruza como el sol y las sombras giran; "desierto" → llueve; "mirar / voz" → las flores abren
// los ojos y cantan; "mano" → dos manos de sombra se toman; "eternidad" → un infinito en la luz;
// "ah-ah-ah" → las flores se mecen.
window.SECCIONES_LABIOS = [
  { desde: 0,     tipo: 'intro' },
  { desde: 24,    tipo: 'verso' },
  { desde: 61.5,  tipo: 'coro' },
  { desde: 95,    tipo: 'intro' },
  { desde: 116.5, tipo: 'verso' },
  { desde: 154.5, tipo: 'coro' },
  { desde: 182.5, tipo: 'intro' },
  { desde: 206,   tipo: 'coro' },
  { desde: 221,   tipo: 'intro' }
];
