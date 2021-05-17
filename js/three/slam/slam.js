const width = 900
const height = 900
const scene = new THREE.Scene()

// environment
let renderer, camera, up_direction

// lights
let spotLight

// objects
let bot, room

// latest points from lidar
let pr

// holds wrapper for the C++ occupancy grid class
let grid_wrapper

function changePointRendererHeight(height) {
    pr.changeBucket(height)
}

function loadRoom(scene) {
    const loader = new THREE.GLTFLoader().setPath('https://raw.githubusercontent.com/MahmoodMahmood/Motion-Planning-Demos/master/assets/room/');

    // Load a glTF resource
    loader.load(
        // resource URL
        'scene.gltf',
        // called when the resource is loaded
        function (gltf) {
            if (!gltf.scene.up.equals(new THREE.Vector3(0, 1, 0))) {
                alert("SCENE HAS AN UNEXPECTED UP DIRECTION")
            }
            // gltf.scene.scale.multiplyScalar(0.3)
            gltf.scene.receiveShadow = true
            room = gltf.scene.children[0].children[0].children[0].children
            scene.add(gltf.scene);
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

function createMainSpotlight(x,y,z) {
    spotLight = new THREE.SpotLight(0xffffff, 1)
    spotLight.position.set(x, y, z)
    spotLight.angle = Math.PI / 6
    spotLight.penumbra = 0.1
    spotLight.decay = 0
    spotLight.distance = 40

    spotLight.castShadow = true
    spotLight.shadow.mapSize.width = 1024
    spotLight.shadow.mapSize.height = 1024
    spotLight.shadow.camera.near = 0.1
    spotLight.shadow.camera.far = 10
    spotLight.shadow.focus = 1

    return spotLight
}

function createMainDirectionLight() {
    const light = new THREE.DirectionalLight(0xdfebff, 1);
    light.position.set(0, 100, 0);

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
    camera.position.set(12, 8, 12)

    // Load the external room asset
    loadRoom(scene)

    // create sky-like background
    scene.background = new THREE.Color(0xcce0ff);
    scene.fog = new THREE.Fog(0xcce0ff, 500, 10000);

    // camera controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement)
    controls.addEventListener('change', render)


    // add lights
    scene.add(new THREE.AmbientLight(0x666666))
    scene.add(createMainDirectionLight())
    scene.add(createMainSpotlight(0, 15, -20))
    scene.add(createMainSpotlight(0, 15, 20))

    // create bot
    bot = new CircleBot(3, 5, 0)
    scene.add(bot.cylinder)
    scene.add(bot.triangle)

    // // HELPERS:
    // // axis helper, (x,y,z) => (red,green,blue)
    // const axesHelper = new THREE.AxesHelper(5)
    // scene.add(axesHelper)
}

function render() {
    renderer.render(scene, camera)
}

let start_time, last_time
let counter = 0
function animate(cur_time) {
    requestAnimationFrame(animate)
    if (!start_time) start_time = cur_time
    if (!last_time) lastTime = cur_time
    total_elapsed_time = cur_time - start_time
    let dt = Math.min(cur_time - last_time, 100)
    last_time = cur_time

    if (!room) return
    if (pressed_keys[38]) { // up arrow
        bot.move(0.001*dt)
        if (bot.collisionCheck(room)) bot.move(-0.001*dt)
    }

    if (pressed_keys[37]) // left arrow
        bot.rotate(0.003*dt)

    if (pressed_keys[39]) // right arrow
        bot.rotate(-0.003*dt)

    bot.updateHeight(-0.0008*dt)

    if (bot.collisionCheck(room)) bot.updateHeight(0.0008*dt)
    renderer.render(scene, camera)

    if (cur_time > 7000 && counter%10==0) {
        bot.lidar.castRays(room)
        if (bot.lidar.points) {
            scene.add(bot.lidar.points)
            pr.addThreeJSPoints(bot.lidar.points)
        }
        bot.lidar.rotate(0.06*dt)
        if (grid_wrapper) grid_wrapper.updatePoints(bot.lidar.points)
    }
    counter++
}

// pressed keys dictionary
let pressed_keys = {};
window.onkeyup = function (e) { pressed_keys[e.keyCode] = false; }
window.onkeydown = function (e) { pressed_keys[e.keyCode] = true; }
window.addEventListener("keydown", function (e) {
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);

init()
animate()
pr = new pointRenderer()

// TODO: move this somewhere nicer
// TODO: this doesnt work from here for some reason, used to work from the script tag
// Prepare the initialization of the occupancy grid module and its wrapper
Module.onRuntimeInitialized = async _ => {
    grid_wrapper = new occupancyGridWrapper(Module);
}