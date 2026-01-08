import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";

export default class Renderer {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.domElement = this.renderer.domElement;
    document.body.appendChild(this.renderer.domElement);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(1, 2, 1);
    this.scene.add(dirLight);
    this.dirLight = dirLight;

    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambient);
    this.ambient = ambient;

    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
