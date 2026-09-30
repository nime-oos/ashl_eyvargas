.flower-message {
  position: absolute;
  top: 50%;
  left: calc(50vw + 16vmin);
  transform: translateY(-50%);
  color: #fff;
  font-family: 'Montserrat', 'Arial Black', Arial, sans-serif;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -2px;
  z-index: 10;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.7s;
  /* Solo texto, sin fondo ni contorno */
  /* Removed font-size, background, padding, border, shadow, and extra spacing */
}
HTML, BODY {
  height: 100%;
  overflow: hidden;
}

BODY {
  background: #0a0a0a;
  background-image: linear-gradient(#0f0f0f 1px, transparent 1px), linear-gradient(to right, #0f0f0f 1px, transparent 1px);
  background-size: 3.3333333333vmin 3.3333333333vmin;
}

.range {
  /* display: none; */
  position: absolute;
}

.wrapper {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  width: 10vmin;
  height: 10vmin;
  font-size: 10vmin;
  transform: rotateX(-45deg);
  transform-style: preserve-3d;
  animation: move-left 1.5s cubic-bezier(.7,0,.3,1) 1 forwards;
}
@keyframes move-left {
  0% {
    transform: rotateX(-45deg) translateX(0);
  }
  100% {
    transform: rotateX(-45deg) translateX(-20vw);
  }
}

@keyframes move-up {
  0% {
    transform: rotateX(-45deg) translateY(0);
  }
  100% {
    transform: rotateX(-45deg) translateY(-15vh);
  }
}

@media (max-width: 480px) {
  .wrapper {
    width: 25vmin !important;
    height: 25vmin !important;
    font-size: 15vmin !important;
    animation: move-up 1.2s cubic-bezier(.7,0,.3,1) 1 forwards !important;
    left: 43% !important;
    transform: translateX(-50%) rotateX(-45deg) !important;
  }
  .flower-message {
    position: fixed !important;
    top: auto !important;
    bottom: 10vh !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    white-space: normal !important;
    font-size: 8vmin !important;
    text-align: center !important;
    max-width: 90vw !important;
    z-index: 100 !important;
  }
}

@media (min-width: 481px) and (max-width: 768px) {
  .wrapper {
    width: 20vmin !important;
    height: 20vmin !important;
    font-size: 12vmin !important;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .wrapper {
    width: 15vmin !important;
    height: 15vmin !important;
    font-size: 10vmin !important;
  }
}

@media (min-width: 1025px) {
  .wrapper {
    width: 12vmin !important;
    height: 12vmin !important;
    font-size: 8vmin !important;
  }
  .flower-message {
    font-size: 6vmin !important;
    left: calc(50vw + 28vmin) !important;
    transform: translateY(-50%) !important;
  }
}

.flower {
  width: 10vmin;
  height: 10vmin;
  -webkit-animation: rotate-flower 30s linear infinite;
          animation: rotate-flower 30s linear infinite;
  transform-style: preserve-3d;
}
.flower:before {
  content: "";
  display: block;
  position: absolute;
  width: 95%;
  height: 95%;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  background: radial-gradient(circle, hsl(340,80%,85%) 0%, hsl(320,70%,65%) 60%, hsl(0, 12%, 75%) 100%);   /* Followers - Color de centro */
  border-radius: 50%;
  transform: rotateX(90deg);
}

.petal {
  position: absolute;
  z-index: 20;
  bottom: 80%;
  left: -10vmin;
  transform-style: preserve-3d;
  transform-origin: bottom;
}

.box {
  width: 30vmin;
  transform-style: preserve-3d;
  transform-origin: bottom;
  -webkit-animation: rotate-box 12s infinite;
          animation: rotate-box 12s infinite;
}

.shape {
  width: 0.5em;
  height: 0.5em;
  margin: auto;
  background: currentColor;
  box-shadow: 0.5em 0 0 0, 1em 0 0 0, -1em 0 0 0, -0.5em 0 0 0;
  border-radius: 50%;
}

@-webkit-keyframes rotate-box {
  0% {
    transform: rotateX(3.5deg);
  }
  15% {
    transform: rotateX(3.5deg);
  }
  50% {
    transform: rotateX(-7deg);
  }
  80% {
    transform: rotateX(-7deg);
  }
  100% {
    transform: rotateX(3.5deg);
  }
}

@keyframes rotate-box {
  0% {
    transform: rotateX(3.5deg);
  }
  15% {
    transform: rotateX(3.5deg);
  }
  50% {
    transform: rotateX(-7deg);
  }
  80% {
    transform: rotateX(-7deg);
  }
  100% {
    transform: rotateX(3.5deg);
  }
}
@-webkit-keyframes rotate-flower {
  100% {
    transform: rotateY(360deg);
  }
}
@keyframes rotate-flower {
  100% {
    transform: rotateY(360deg);
  }
}

#galaxy-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 1;
  background: transparent;
}

/* From Uiverse.io by Spacious74 */
.container .button {
  font-size: 1.4em;
  padding: 0.6em 0.8em;
  border-radius: 0.5em;
  border: none;
  background-color: #000;
  color: #fff;
  cursor: pointer;
  box-shadow: 2px 2px 3px #000000b4;
}

@media (min-width: 1025px) {
  .container .button {
    font-size: 2.2em;
    padding: 1em 1.5em;
  }
}
.container {
  position: relative;
  padding: 3px;
  background: linear-gradient(90deg, #03a9f4, #f441a5);
  border-radius: 0.9em;
  transition: all 0.4s ease;
}
.container::before {
  content: "";
  position: absolute;
  inset: 0;
  margin: auto;
  border-radius: 0.9em;
  z-index: -10;
  filter: blur(0);
  transition: filter 0.4s ease;
}
.container:hover::before {
  background: linear-gradient(90deg, #03a9f4, #f441a5);
  filter: blur(1.2em);
}
.container:active::before {
  filter: blur(0.2em);
}