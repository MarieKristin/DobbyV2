import {Component, OnInit, AfterViewInit} from '@angular/core';

@Component({
  selector: 'app-graphics',
  templateUrl: './graphics.component.html',
  styleUrls: ['./graphics.component.css']
})
export class GraphicsComponent implements AfterViewInit {

  public container;
  public camera;
  public scene;
  public renderer;
  public controls;

  constructor() { }

  public ngAfterViewInit() {
    this.container = document.getElementById('container');

    this.camera = new THREE.PerspectiveCamera(45, this.container.offsetWidth / this.container.offsetHeight, 1, 500);
    this.camera.position.set(0, 0, 30);

    this.scene = new THREE.Scene();

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('assets/earth.jpg', texture => {
      const geometry = new THREE.SphereGeometry(5, 32, 32);
      const material = new THREE.MeshLambertMaterial({ map: texture });
      const sphere = new THREE.Mesh(geometry, material);

      this.scene.add(sphere);
    });

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    this.renderer.setClearColor(0x000000);

    const ambientLights = new THREE.AmbientLight(0x999999);
    this.scene.add(ambientLights);

    const spotLight = new THREE.PointLight(0xffffff);
    spotLight.position.set(0, 0, 500);
    this.scene.add(spotLight);

    this.container.appendChild(this.renderer.domElement);

    this.controls = new THREE.TrackballControls(this.camera);

    this.animate();
  }

  public animate() {
    window.requestAnimationFrame(() => this.animate());

    this.controls.update();

    this.renderer.render(this.scene, this.camera);
  }
}
