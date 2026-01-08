export default function GameLoop(engine) {
  function frame() {
    engine.update();
    engine.render();
    requestAnimationFrame(frame);
  }
  frame();
}
