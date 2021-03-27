const width = 500
const height = 500
const scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: artifactCanvas });
renderer.setSize(width, height);

// cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// ambient light
const light = new THREE.AmbientLight(0x404040); // soft white light
scene.add(light);

// directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
scene.add(directionalLight);

// axis helper, (x,y,z) => (red,green,blue)
const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );




camera.position.z = 5;

function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();