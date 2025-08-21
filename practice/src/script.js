// import * as THREE from "three";
// import gsap from "gsap";
//
// const target = document.querySelector("canvas.webgl");
//
// // const geometry = new THREE.BoxGeometry(1,1,1);
// const geometry = new THREE.SphereGeometry(1,
//     64,
//     64,
//     Math.PI*2
// )
// // const material = [
// //     new THREE.MeshBasicMaterial({ color: 0xff0000 }), // right
// //     new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // left
// //     new THREE.MeshBasicMaterial({ color: 0x0000ff }), // top
// //     new THREE.MeshBasicMaterial({ color: 0xffff00 }), // bottom
// //     new THREE.MeshBasicMaterial({ color: 0xff00ff }), // front
// //     new THREE.MeshBasicMaterial({ color: 0x00ffff })  // back
// // ];
// const material = new THREE.MeshBasicMaterial({color: 0xff0000});
// const mesh = new THREE.Mesh(geometry, material);
//
// const scene = new THREE.Scene();
// scene.add(mesh);
//
// const camera = new THREE.PerspectiveCamera(
//     75,
//     window.innerWidth / window.innerHeight,
// );
// camera.position.z = 5;
// scene.add(camera);
//
// const renderer = new THREE.WebGLRenderer({canvas: target});
// renderer.setSize(window.innerWidth, window.innerHeight);
//
// function animate() {
//     requestAnimationFrame(animate);
//     mesh.rotation.x += 0.01;
//     mesh.rotation.y += 0.01;
//     renderer.render(scene, camera);
// }
//
// animate();


//Earth Material Loading
import * as THREE from "three";

const target = document.querySelector('canvas.webgl');

// Sphere geometry (radius, widthSegments, heightSegments)
const geometry = new THREE.SphereGeometry(1, 64, 64);

// Load Earth texture (use any Earth image)
const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load("./earth2.jpg"); // <-- your earth image path

// Apply texture to material
const material = new THREE.MeshStandardMaterial({
    map: earthTexture
});

const earth = new THREE.Mesh(geometry, material);

// Scene
const scene = new THREE.Scene();
scene.add(earth);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;

// Lights (needed for MeshStandardMaterial)
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 3, 5);
scene.add(light);

const ambient = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambient);

// Renderer
const renderer = new THREE.WebGLRenderer({canvas: target});
renderer.setSize(window.innerWidth, window.innerHeight);

// Animation
function animate() {
    requestAnimationFrame(animate);
    earth.rotation.y += 0.002; // slow rotation
    renderer.render(scene, camera);
}

animate();
