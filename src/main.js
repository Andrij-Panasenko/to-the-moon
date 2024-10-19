import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

//сцена
const scene = new THREE.Scene();
//камера
const camera = new THREE.PerspectiveCamera(
  110,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();

const controlCamera = new OrbitControls(camera, renderer.domElement);

controlCamera.update();
controlCamera.enableDamping = true;
controlCamera.minDistance = 100;
controlCamera.enabled = false;

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 1));
scene.add(new THREE.PointLight(0xffffff, 1));
scene.add(new THREE.HemisphereLight(0xffffff, 0.1));

const clock = new THREE.Clock();

//scene background
const textureLoader = new THREE.TextureLoader();
textureLoader.load('./models/background.jpeg', texture => {
  scene.background = texture;
});

let car;

const loader = new GLTFLoader();

// stones
let rocks = [];
for (let i = 0; i < 10; i++) {
  const geometry = new THREE.BoxGeometry(10, 10, 10); // Створюємо куби розміром 5x5x5
  const material = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Зелений колір кубів
  const rock = new THREE.Mesh(geometry, material); // Створюємо куб як Mesh

  // Випадкові позиції кубів на дорозі
  const randomX = (Math.random() - 0.5) * 100; // Випадкове положення по осі X
  const randomZ = -Math.random() * 1000; // Випадкове положення по осі Z (вздовж дороги)
  rock.position.set(randomX, -75, randomZ); // Розміщуємо куб на сцені

  scene.add(rock); // Додаємо куб на сцену
  rocks.push(rock); // Зберігаємо куб у масив для подальшої обробки
}

let roads = [];

// дорога
loader.load(
  './models/road/scene.gltf',
  gltf => {
    for (let i = 0; i < 3; i++) {
      // Створюємо кілька екземплярів дороги
      const road = gltf.scene.clone(); // Клонуємо кожен екземпляр
      road.position.set(0, -90, i * -276); // Розміщуємо дороги одну за одною
      road.scale.set(35, 35, 35);
      scene.add(road);
      roads.push(road); // Додаємо дорогу в масив
    }
  },
  undefined,
  err => {
    console.log('error load road', err);
  }
);

//автомобіль
loader.load(
  './models/car/scene.gltf',
  gltf => {
    car = gltf.scene;
    car.position.set(0, -15, -10);
    window.addEventListener('keypress', event => {
      switch (event.code) {
        case 'KeyW':
          if (car.position.z >= -20) {
            car.position.z += -2;
          }
          break;
        case 'KeyS':
          if (car.position.z <= 0) {
            car.position.z += 2;
          }
          break;
        case 'KeyA':
          if (car.position.x > -10) {
            car.position.x += -2;
          }
          break;
        case 'KeyD':
          if (car.position.x < 10) {
            car.position.x += 2;
          }
          break;
        case 'KeyQ':
          if (car.position.x > -10) {
            car.position.x += -2;
            car.position.z += -2;
          }

          break;
        case 'KeyE':
          if (car.position.x < 10) {
            car.position.z += -2;
            car.position.x += 2;
          }
          break;
      }
    });
    scene.add(car);
    camera.lookAt(car.position);
  },
  undefined,
  err => {
    console.log('loader error', err);
  }
);

function animate() {
  // roads animate
  roads.forEach(road => {
    road.position.z += 0.7;
    if (road.position.z > 276) {
      const lastRoad = roads.reduce((last, current) =>
        last.position.z > current.position.z ? last : current
      );
      road.position.z = lastRoad.position.z - 276 * 3;
    }
  });

  //rocks animate
  rocks.forEach(rock => {
    rock.position.z += 0.7;

    if (rock.position.z > camera.position.z + 50) {
      rock.position.z = -400; // Повертаємо куб на початок дороги
      rock.position.x = (Math.random() - 0.5) * 100; // Нове випадкове положення по осі X
    }
  });

  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
