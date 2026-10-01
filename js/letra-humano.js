// Subtítulos de "Más humano" (formato LRC: [mm:ss.cc] texto).
// Una línea sin texto oculta el subtítulo. Para re-sincronizar usa sincronizar.html.
window.LETRA_HUMANO_LRC = `
[00:00.58] Roger, zero-G and I feel fine
[00:06.30]
[00:09.05] Que ya quiero bailar y gritar
[00:11.74] Que ya no duele igual
[00:16.30] Ah-ah-ah
[00:18.49] Que después de un punto final
[00:20.03] Ya no hay más que escribir ni contar
[00:25.88] Yeah, ah-ah-ah
[00:27.95] Y a pesar del daño
[00:32.72] Que me estás causando
[00:37.42] Me hiciste más humano
[00:42.32] Te lo agradezco a diario
[00:47.69] Tengo fotos que me encantan
[00:50.27] Y a la vez, a mí me matan
[00:53.98]
[00:57.15] Los mensajes que mandabas
[00:59.74] Cuando ya era tarde en la madrugada, yeah
[01:06.51] Y aunque fue el año pasado
[01:11.15] Te pienso de vez en cuando
[01:15.90] Recuerdos buenos y malos
[01:20.79] Me hacen viajar al pasado
[01:26.06] Y era difícil vernos
[01:30.68] Pero más el no tenernos
[01:35.34] Y si mañana nos vemos
[01:40.18] Platicamos, nos perdemos, pero eso de querernos
[01:45.32] No se puede aunque intentemos (Roger, zero-G and I feel fine)
[01:50.35] No se puede aunque intentemos
[01:54.56] Y ahora que veo el panorama
[02:00.01] Quererte me quita la calma
[02:03.94]
[02:28.25] Y a pesar del daño
[02:32.85] Que me estás causando
[02:37.63] Me hiciste más humano
[02:42.38] Te lo agradezco a diario
[02:44.02]
`;

// Partes de la canción (en segundos). En el coro la parada se ilumina y salen corazones;
// en los versos llueve.
window.SECCIONES_HUMANO = [
  { desde: 0,     tipo: 'intro' },
  { desde: 8.5,   tipo: 'verso' },
  { desde: 27.5,  tipo: 'coro' },
  { desde: 47,    tipo: 'verso' },
  { desde: 85.5,  tipo: 'coro' },
  { desde: 114,   tipo: 'verso' },
  { desde: 147.5, tipo: 'coro' }
];
