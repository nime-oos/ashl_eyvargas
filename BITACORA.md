# Bitácora del proyecto — Flor Novia 3D

## 2026-09-29 — Análisis del proyecto y explicación de la animación

### Estructura
```
index.html      punto de entrada, botón de inicio, audio, canvas de galaxia y flor
css/style.css   estilos, transforms 3D y keyframes de todas las animaciones
js/main.js      versión "en producción" (minificada) + lógica de interacción (botón, mensajes, galaxia, corazón)
js/script.js    versión legible/de desarrollo de la flor 3D y la galaxia de fondo
musica/         pista de audio que acompaña la animación
```
`main.js` y `script.js` generan la misma flor; `main.js` es la copia comprimida que realmente corre en la página (cargada con `defer` en `index.html`), mientras `script.js` parece la versión de trabajo/legible del mismo código, más fácil de editar.

### Cómo se construye la flor 3D
La flor **no es un modelo 3D real**, es una ilusión hecha con `div`s y `transform-style: preserve-3d` de CSS.

1. `createFlower()` crea `maxPetals = 6` pétalos y los distribuye en círculo:
   - `angle = 360 / maxPetals` (60° entre cada uno).
   - Cada pétalo se rota con `rotateY(ánguloDelPétalo) rotateX(-30deg) translateZ(9vmin)`, lo que los separa en el espacio 3D como si salieran del centro.
2. `createPetal()` arma un pétalo apilando `maxParts = 20` "cajas" (`createBox`), una dentro de otra (anidamiento tipo muñeca rusa), donde cada caja:
   - Reduce su `font-size` progresivamente (`partsFontStep * posición`), lo que da el efecto de que el pétalo se afina hacia la punta.
   - Cambia de color con `hsl()`, variando el matiz (`baseHue = 320`, rosa) y el brillo según la posición, para simular sombreado/degradado desde el centro (más oscuro) hacia la punta (más claro).
   - Cada "caja" contiene un `.shape` (un círculo vía `border-radius:50%` + `box-shadow` para clonar puntos), que en conjunto arma la silueta redondeada de cada segmento del pétalo.
3. Las animaciones CSS hacen el resto:
   - `.flower { animation: rotate-flower 30s linear infinite }` gira toda la flor sobre el eje Y indefinidamente.
   - `.box { animation: rotate-box 12s infinite }` hace que cada segmento del pétalo oscile (`rotateX` entre 3.5° y -7°), dando el efecto de pétalos "respirando"/abriéndose y cerrándose.

En resumen: la ilusión 3D sale de combinar `rotateX/rotateY/translateZ` con `transform-style: preserve-3d` en varios niveles anidados, no de un motor 3D real (no usa WebGL/Three.js).

### Cómo se construye el fondo de "galaxia"
Hay dos capas de canvas/efectos:

1. **Estrellas de fondo** (`drawGalaxy()` en ambos JS): dibuja 120 puntos rosados aleatorios en un `<canvas>` que se mueven a velocidad baja y rebotan en los bordes (`requestAnimationFrame`), siempre visibles desde que carga la página.
2. **Galaxia interactiva** (dentro del `click` del botón, en `main.js`): al presionar "Presioname":
   - Se oculta el botón, aparece la flor, se reproduce la música.
   - 2 segundos después aparece un segundo `<canvas>` (`#galaxy-canvas`) con puntos ("dots") que se agregan uno por uno (`addDot`, cada 10ms) en órbitas aleatorias alrededor del centro.
   - Se conecta la música a la **Web Audio API** (`AudioContext` + `AnalyserNode`) para leer el volumen en tiempo real (`getByteFrequencyData`) y usarlo como `speedFactor`: cuando la canción suena más fuerte, los puntos se mueven más rápido — la animación "reacciona" a la música.
   - En paralelo se van mostrando mensajes con efecto de máquina de escribir (`typeText`, letra por letra cada 90ms).

### Cómo se forma el corazón
Cuando terminan de mostrarse todos los mensajes, se llama a `animateHeart()`:
- Calcula posiciones objetivo con la **fórmula paramétrica del corazón**:
  ```
  x(t) = cx + size * 16*sin³(t)
  y(t) = cy - size * (13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t))
  ```
  para `t` entre 0 y 2π, repartiendo un punto por cada "dot" existente.
- `moveDotsToHeart()` interpola la posición de cada punto hacia su destino en 14 pasos (`requestAnimationFrame`), con un factor de suavizado (`(target - actual) / (steps - step + 1)`) que hace que el movimiento desacelere al acercarse, dando un efecto de "ensamblaje" suave en vez de un salto brusco.

### Diferencias móvil vs escritorio
- `isMobile = innerWidth <= 600`.
- En móvil hay un pequeño retraso extra (1200ms) antes de mostrar el texto, pensado para simular una carga ("loader"), y los estilos (`@media (max-width: 480px)`) reposicionan la flor y el mensaje para pantalla vertical.
- En escritorio la flor y el texto aparecen juntos, sin esa espera.

### Notas técnicas / posibles mejoras futuras
- `main.js` y `script.js` están duplicados (misma lógica de flor). Si se sigue editando el proyecto, conviene mantener un solo archivo fuente y generar el minificado a partir de él, para no tener que replicar cambios dos veces.
- El código usa `alert()` si el navegador bloquea el autoplay del audio; podría reemplazarse por un mensaje visual menos intrusivo.
- No hay control de reproducción/pausa de la música una vez iniciada.

## 2026-09-30 — Segunda canción "Más humano" + menú de canciones

- **Menú** (`js/menu.js`, estilos en `css/humano.css`): dos portaditas de crayón pegadas con cinta arriba a la izquierda (lado A / lado B). La activa se marca con un círculo rojo de marcador; un ecualizador de crayón se mueve mientras suena la música. También se puede abrir directo con `index.html#humano`.
- **Transición**: un borrón de crayón (canvas `#borron`) tapa la pantalla con los colores de la canción elegida y su título; debajo se cambian escena, letra y audio, y el borrón se desvanece. Al terminar una canción sigue la otra.
- **Escena "Más humano"** (`js/escena-humano.js`): la parada de autobús de noche de la portada redibujada en el mismo estilo (pastel + marcador, 3 cuadros que hierven, parallax 3D). Se construye la primera vez que se elige. Reacciona a las partes de la canción (`SECCIONES_HUMANO` en `js/letra-humano.js`): en los versos llueve y salen charcos; en el coro el letrero brilla más, el chico mira hacia arriba y le salen corazones.
- `js/escena.js` solo cambió en dos cosas: expone sus herramientas de crayón (`window.Crayon`) y permite cambiar la letra (`window.cargarLetra`). Además avisa la parte de la canción con el evento `seccion`. La escena de "No digas nada" no cambió.
- `sincronizar.html` ahora deja elegir cuál canción sincronizar.
- Pendiente, que ya venía de antes: `animateHeart()` en `main.js` usa `galaxyCanvas` fuera de su alcance y lanza `galaxyCanvas is not defined` al terminar los mensajes, así que el corazón de puntos nunca se forma.

## 2026-10-01 — Tercera canción "Piensas en mí" (LATIN MAFIA, Fred again..)

- **Menú**: nueva portadita **lado C · Piensas en mí** (enlace directo: `index.html#piensas-en-mi`; `#alvafro` también funciona). Los colores del borrón y del título ahora se definen en cada canción (`tinta`, `sombra` en `js/menu.js`); las dos anteriores quedaron igual.
- **Escena** (`js/escena-alvafro.js`, `css/alvafro.css`): el estudio de la portada redibujado: muro blanco frotado con pintura gris azulada (las manchas se vuelven a pintar solas), fotos pegadas con cinta, collage de caritas, paisaje rojizo con ciclistas, cortinas rojas, escalera, tela que se mece, sillón envuelto en plástico, banquito, botes de pintura y papeles en el piso. Título "PiENsAs EN mí" pintado en el muro. (Audio: `musica/Fred again.., LATIN MAFIA - Piensas En Mi.mp3`. Los archivos del código conservan el nombre `alvafro`.)
- **"Todo el mundo está observando"**: los ojos de todas las fotos siguen al mouse o al dedo. En las líneas que dicen "observando" todas te miran de frente, se asoman celulares en la oscuridad y hay flashes de cámara.
- **"Tú y yo"**: se encierran con marcador rojo dos fotos del collage (el chico de la gorra de "Más humano" y una chica) y les sale un corazón.
- **"Me pregunto…"**: se escribe "¿piensas en mí?" en rojo en el muro y los papeles del piso se agitan.
- Guiño: entre las fotos de arriba está la carita verde de "No digas nada".
- La escena lee la letra directamente (`LETRA_ALVAFRO_LRC`) para saber qué dice cada línea; no se tocaron las escenas anteriores.

## 2026-10-01 — Mensajes de ánimo
- Los dos mensajes que se escriben al presionar el botón (`messages` en `js/main.js`) ahora son: "No llores, todo pasa 🤍" y "¡Ánimo! Aquí estoy contigo 🌷" (este último es el que se queda).
- En escritorio pasaron a la esquina de arriba a la derecha, frente al menú (`css/escena.css`), para no tapar ninguna escena. En móvil siguen arriba al centro.

## 2026-10-01 — Cuarta canción "Luna" (Zoé, MTV Unplugged)

- **Menú**: nueva portadita **lado D · Luna** (enlace directo: `index.html#luna`). Borrón azul noche con el título en crema y sombra naranja. Con cuatro portaditas, en celulares el letrero "canciones" pasa debajo del menú.
- **Escena** (`js/escena-luna.js`, `css/luna.css`, letra en `js/letra-luna.js`): el escenario del unplugged redibujado con crayón y marcador: foro azul con cortinas y luz azul desde el piso, globos de luz naranja en pedestales, reflectores de cuadritos, lámpara de mesa, jaula dorada con pajarito, alfombras persas (roja con rombos, beige con medallón, azul con olas), pufs de rayas, cables y pedalera. La banda: guitarrista con tenis blancos, tecladista de gorro con teclados rojos, organista de lentes en el clavecín de madera, contrabajo, la chica del teclado rojo, León en su banquito con guitarra, armónica y el pelo tapándole los ojos, baterista con "Zoé" y una lunita en el bombo, y una guitarra en su base. Todos tocan a saltitos. Título "LuNa" pintado abajo a la izquierda. Un haz de luz sigue al mouse o al dedo.
- **La escena reacciona a cada línea**:
  - "Luna": sale la luna grande con carita; León abre los ojos y la mira. En "cráteres" le laten los cráteres.
  - "Silencio, se abre la tierra": apagón (solo queda la luna) y se abre una grieta de lava en el piso.
  - "Se alzan los mares, al compás del volcán": sube el mar desde abajo y la grieta escupe chispas.
  - "Se acelera mi motor": reflectores en estrobo, batería y guitarras a toda velocidad, el piso tiembla.
  - "Me da fiebre, me hago fuego": los globos se ponen rojos y salen llamas al frente.
  - "Dame solo un beso": suben corazones. "Mirarte a los ojos": León y la luna te miran (los ojos de León siguen al mouse).
- La luna va en su propia capa 3D (`capa-luna`, un poco al frente) para que el apagón no la tape.
- `sincronizar.html` ya incluye "Luna". Audio: `musica/Zoé - Luna (MTV Unplugged).mp3`.
- Letra corregida (versión del unplugged, líneas más cortas y nuevos tiempos). Como ahora las frases vienen partidas, la escena también reacciona a "recuperarme" (luna), "consumir" (fuego) y "morir" (beso) para que el efecto siga durante toda la frase.

## 2026-10-01 — Quinta canción "Labios rotos" (Zoé)

- **Menú**: nueva portadita **lado E · Labios rotos** (enlace directo: `index.html#labios-rotos`). Borrón rojo de lámpara con el título en rosa y sombra vino.
- **Escena** (`js/escena-labios.js`, `css/labios.css`, letra en `js/letra-labios.js`): la foto del florero bajo la lámpara de atardecer redibujada con crayón y marcador: muro oscuro con el gran círculo de luz roja, las sombras gigantes de las flores en la pared (dos flores arriba, una grande a la izquierda, helechos, tallos y la sombra del florero), y al frente el florero blanco teñido de rosa con el ramo de flores rosas, dos rojas oscuras, tallos, hojas y helechos. Título "Labios rotos" pintado arriba a la derecha con un besito partido. La luz sigue al mouse o al dedo y las sombras se mueven al revés, como si movieras la lámpara.
- **La escena reacciona a cada línea**:
  - "Regálame tu corazón": un corazón grande late dentro de la luz. "Déjame entrar a ese lugar": el círculo de luz se abre.
  - "Donde nacen las flores": brotan seis flores nuevas en el ramo. "Nace el amor" / "con todo mi amor": suben corazoncitos.
  - "Entrégame tus labios rotos": aparecen unos labios con una grieta que se dibuja sola. "Los quiero besar": los labios mandan besos y salen besitos por toda la pared. "Curar" / "cuidar": la grieta se borra y le ponen una curita.
  - "Es raro el amor": la luz cambia de color a saltos y las sombras bailan solas. "Que se te aparece…": llueven pétalos.
  - "No importa la distancia, ni el tiempo, ni la edad": la luz cruza de lado a lado como el sol y las sombras se estiran con ella.
  - "Moja el desierto de mi alma": llueve. "Con tu mirar, con tu tierna voz": tres flores abren los ojos (siguen al mouse) y cantan.
  - "Con tu mano en mi mano": dos manos de sombra entran por la pared y se tocan. "Por la eternidad": se dibuja un infinito con estrellitas.
  - "Ah-ah-ah": el ramo se mece y la luz respira. "Amor, amor": corazón grande y corazoncitos.
- En pantallas verticales el título, los labios, el corazón y el infinito se recorren al centro para que no los corte la orilla.
- `sincronizar.html` ya incluye "Labios rotos". Audio: `musica/Labios Rotos - Zoé Letra. ♡.mp3`.
