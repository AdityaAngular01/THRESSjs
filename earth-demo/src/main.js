import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
import * as topojson from "topojson-client";

// --- Helpers ---
const deg2rad = Math.PI / 180;
function latLonToVec3(latDeg, lonDeg, radius) {
    const phi = (90 - latDeg) * deg2rad;
    const theta = (lonDeg + 180) * deg2rad;
    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    return new THREE.Vector3(x, y, z);
}

function makeFibonacciSpherePoints(count, radius) {
    const pts = [];
    const offset = 2 / count;
    const inc = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
        const y = i * offset - 1 + offset / 2;
        const r = Math.sqrt(1 - y * y);
        const phi = i * inc;
        const x = Math.cos(phi) * r;
        const z = Math.sin(phi) * r;
        const v = new THREE.Vector3(x, y, z).multiplyScalar(radius);
        pts.push(v.x, v.y, v.z);
    }
    return new Float32Array(pts);
}

function makeArcCurve(start, end, radius) {
    const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(radius * 1.4);
    return new THREE.CatmullRomCurve3([start, mid, end]);
}

function makeTubeFromCurve(curve, radius = 0.01, tubularSegments = 64) {
    return new THREE.TubeGeometry(curve, tubularSegments, radius, 8, false);
}

function makeSignalDot(size = 0.04, color = 0x00e5ff) {
    const geom = new THREE.SphereGeometry(size, 16, 16);
    const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
    });
    return new THREE.Mesh(geom, mat);
}

// --- Main ---
const container = document.getElementById("app");
const width = container.clientWidth;
const height = container.clientHeight;

// Scene
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x00040a, 0.15);

// Camera
const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 200);
camera.position.set(0, 1.6, 4.2);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x00040a, 1);
container.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lights
scene.add(new THREE.AmbientLight(0x334455, 0.2));
const rim = new THREE.DirectionalLight(0x88aaff, 0.4);
rim.position.set(-2, 1, 2);
scene.add(rim);

// Stars
const starCount = 1200;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
    const r = 40 * (0.6 + Math.random() * 0.4);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi);
    const z = r * Math.sin(phi) * Math.sin(theta);
    starPositions.set([x, y, z], i * 3);
}
const starsGeom = new THREE.BufferGeometry();
starsGeom.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
const starsMat = new THREE.PointsMaterial({
    size: 0.06,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
});
scene.add(new THREE.Points(starsGeom, starsMat));

// Earth dotted
const earthRadius = 1.4;
const earthGroup = new THREE.Group();
scene.add(earthGroup);

const dots = makeFibonacciSpherePoints(12000, earthRadius);
const dotGeom = new THREE.BufferGeometry();
dotGeom.setAttribute("position", new THREE.BufferAttribute(dots, 3));
const dotMat = new THREE.PointsMaterial({
    size: 0.015,
    color: 0x6fd2ff,
    transparent: true,
    opacity: 0.50,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
});
earthGroup.add(new THREE.Points(dotGeom, dotMat));

// India position
const INDIA = { lat: 18.562809777239593, lon: 73.78276311752121 };
const indiaPos = latLonToVec3(INDIA.lat, INDIA.lon, earthRadius * 1.001);
const indiaDot = makeSignalDot(0.015, 0xff6666);
indiaDot.position.copy(indiaPos);
earthGroup.add(indiaDot);
gsap.to(indiaDot.scale, { x: 1.8, y: 1.8, z: 1.8, yoyo: true, repeat: -1, duration: 1.2 });

// Targets
const TARGETS = [
    { lat: 37.7749, lon: -122.4194 }, // USA
    { lat: 51.5074, lon: -0.1278 },   // UK
    { lat: 35.6762, lon: 139.6503 },  // Japan
    { lat: -33.8688, lon: 151.2093 }, // Australia
];

// TARGETS.forEach((t, idx) => {
//     const targetPos = latLonToVec3(t.lat, t.lon, earthRadius * 1.001);
//     const marker = makeSignalDot(0.015, 0xffff66);
//     marker.position.copy(targetPos);
//     earthGroup.add(marker);
//
//     const curve = makeArcCurve(indiaPos, targetPos, earthRadius);
//     const tube = new THREE.Mesh(makeTubeFromCurve(curve, 0.01, 160),
//         new THREE.MeshBasicMaterial({
//             color: 0x00ffff,
//             transparent: true,
//             opacity: 0.1,
//             blending: THREE.AdditiveBlending,
//         })
//     );
//     earthGroup.add(tube);
//
//     const pulse = makeSignalDot(0.02, 0xff66ff);
//     earthGroup.add(pulse);
//
//     const obj = { t: 0 };
//     gsap.to(obj, {
//         t: 1,
//         duration: 3,
//         delay: 0.5 + idx * 0.2,
//         repeat: -1,
//         onUpdate: () => {
//             pulse.position.copy(curve.getPointAt(obj.t));
//         },
//     });
//
// });
TARGETS.forEach((t, idx) => {
    const targetPos = latLonToVec3(t.lat, t.lon, earthRadius * 1.001);
    const marker = makeSignalDot(0.015, 0xffff66);
    marker.position.copy(targetPos);
    earthGroup.add(marker);

    const curve = makeArcCurve(indiaPos, targetPos, earthRadius);

    // Base faint arc
    const baseTube = new THREE.Mesh(
        makeTubeFromCurve(curve, 0.01, 160),
        new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.1,
            blending: THREE.AdditiveBlending,
        })
    );
    earthGroup.add(baseTube);

    // Neon pulse tube
    const neonMat = new THREE.MeshBasicMaterial({
        color: 0xff00ff, // neon pink
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
    });

    let neonTube = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.02, 16, false), neonMat);
    earthGroup.add(neonTube);

    const obj = { t: 0 };
    const maxLen = 0.3; // max pulse length (0–1 fraction of curve)

    gsap.to(obj, {
        t: 1 + maxLen, // travel full + shrink phase
        duration: 5,
        delay: 0.5 + idx * 0.3,
        repeat: -1,
        onUpdate: () => {
            let head, tail;

            if (obj.t < maxLen) {
                // --- Growing phase ---
                head = obj.t;
                tail = 0;
            } else if (obj.t <= 1) {
                // --- Constant length travel ---
                head = obj.t;
                tail = head - maxLen;
            } else {
                // --- Shrinking at the end ---
                head = 1;
                tail = obj.t - maxLen; // tail moves forward to shrink
            }

            // Sample points between tail→head
            const divisions = 50;
            const pts = [];
            for (let i = 0; i <= divisions; i++) {
                const tVal = tail + (head - tail) * (i / divisions);
                pts.push(curve.getPointAt(Math.min(1, tVal)));
            }

            const segmentCurve = new THREE.CatmullRomCurve3(pts);

            // Update tube
            neonTube.geometry.dispose();
            neonTube.geometry = new THREE.TubeGeometry(
                segmentCurve,
                64,    // tubular segments
                0.02,  // thickness
                16,    // radial segments
                false
            );
        },
    });
});





// Rotate earth slowly
gsap.to(earthGroup.rotation, { y: Math.PI * 2, duration: 80, repeat: -1, ease: "none" });

// --- Country Borders ---
async function loadCountries() {
    const res = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
    const topo = await res.json();
    const geo = topojson.feature(topo, topo.objects.countries);

    geo.features.forEach((feature) => {
        feature.geometry.coordinates.forEach((polygon) => {
            const coordsArray = Array.isArray(polygon[0][0]) ? polygon : [polygon];
            coordsArray.forEach((coords) => {
                const points = coords.map(([lon, lat]) =>
                    latLonToVec3(lat, lon, earthRadius * 1.002)
                );
                const geom = new THREE.BufferGeometry().setFromPoints(points);
                const mat = new THREE.LineBasicMaterial({ color: 0x44ffaa });
                const line = new THREE.LineLoop(geom, mat);
                earthGroup.add(line);
            });
        });
    });
}
loadCountries();

// Resize
window.addEventListener("resize", () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
});

// Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();
