const width = 500
const height = 500
const scene = new THREE.Scene()

// environment
let renderer, camera

// lights
let spotLight, lightHelper, shadowCameraHelper

// objects
let bot

function createSurface() {
    const loader = new THREE.TextureLoader();
    const groundTexture = loader.load('assets/pavement_texture.jpg');
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(500, 500);
    groundTexture.anisotropy = 16;
    groundTexture.encoding = THREE.sRGBEncoding;

    const material = new THREE.MeshLambertMaterial({ map: groundTexture });
    // const material = new THREE.MeshPhongMaterial({ color: 0x808080, dithering: true })
    const geometry = new THREE.PlaneGeometry(2000, 2000)
    let mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(0, 0, 0)
    mesh.receiveShadow = true
    return mesh
}

function createMainSpotlight() {
    spotLight = new THREE.SpotLight(0xffffff, 1)
    spotLight.position.set(0, 0, 5)
    spotLight.angle = Math.PI / 4
    spotLight.penumbra = 0.1
    spotLight.decay = 0
    spotLight.distance = 200

    spotLight.castShadow = true
    spotLight.shadow.mapSize.width = 512
    spotLight.shadow.mapSize.height = 512
    spotLight.shadow.camera.near = 1
    spotLight.shadow.camera.far = 5
    spotLight.shadow.focus = 1

    return spotLight
}

function loadRoom(scene) {
    const loader = new THREE.GLTFLoader().setPath('assets/rocks');

    // Load a glTF resource
    loader.load(
        // resource URL
        'scene.gltf',
        // called when the resource is loaded
        function (gltf) {
            scene.add(gltf.scene);
            gltf.animations; // Array<THREE.AnimationClip>
            gltf.scene; // THREE.Group
            gltf.scenes; // Array<THREE.Group>
            gltf.cameras; // Array<THREE.Camera>6
            gltf.asset; // Object
        },
        // called while loading is progressing
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // called when loading has errors
        function (error) {
            console.log('An error happened');
            console.log(error)
        }
    );
}

function createMainDirectionLight() {
    scene.add(new THREE.AmbientLight(0x666666));

    const light = new THREE.DirectionalLight(0xdfebff, 1);
    light.position.set(50, 200, 100);
    light.position.multiplyScalar(1.3);

    light.castShadow = true;

    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;

    const d = 300;

    light.shadow.camera.left = - d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = - d;

    light.shadow.camera.far = 1000;

    return light
}

function init() {
    // renderer setup
    renderer = new THREE.WebGLRenderer({ canvas: artifactCanvas })
    renderer.setSize(width, height)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // camera setup
    camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
    camera.position.set(0, 0, 5) // top down view

    loadRoom(scene)

    // create sky-like background
    scene.background = new THREE.Color(0xcce0ff);
    scene.fog = new THREE.Fog(0xcce0ff, 500, 10000);

    // camera controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement)
    controls.addEventListener('change', render)

    // create bot
    bot = new CircleBot(0, 0, 0)

    // add shapes
    scene.add(bot.cylinder)
    scene.add(bot.triangle)
    scene.add(createSurface())

    // add lights
    scene.add(new THREE.AmbientLight(0x666666))
    scene.add(createMainDirectionLight())

    // axis helper, (x,y,z) => (red,green,blue)
    const axesHelper = new THREE.AxesHelper(5)
    scene.add(axesHelper)
}

function render() {
    renderer.render(scene, camera)
}

function animate() {
    requestAnimationFrame(animate)
    if (pressedKeys[38]) // up arrow
        bot.move(0.004)

    if (pressedKeys[37]) // left arrow
        bot.rotate(0.004)

    if (pressedKeys[39]) // right arrow
        bot.rotate(-0.004)

    renderer.render(scene, camera)
}

// pressed keys dictionary
let pressedKeys = {};
window.onkeyup = function (e) { pressedKeys[e.keyCode] = false; }
window.onkeydown = function (e) { pressedKeys[e.keyCode] = true; }
init()
animate()