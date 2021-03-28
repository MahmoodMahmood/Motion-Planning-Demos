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
    const material = new THREE.MeshPhongMaterial({ color: 0x808080, dithering: true })
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

function init() {
    // renderer setup
    renderer = new THREE.WebGLRenderer({ canvas: artifactCanvas })
    renderer.setSize(width, height)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // camera setup
    camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
    camera.position.set(0, 0, 5) // top down view

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
    const ambient = new THREE.AmbientLight(0xffffff, 0.3)
    scene.add(ambient)
    scene.add(createMainSpotlight())


    // HELPERS:

    lightHelper = new THREE.SpotLightHelper(spotLight)
    scene.add(lightHelper)

    shadowCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera)
    scene.add(shadowCameraHelper)

    // axis helper, (x,y,z) => (red,green,blue)
    const axesHelper = new THREE.AxesHelper(5)
    scene.add(axesHelper)
}

function render() {
    lightHelper.update()
    shadowCameraHelper.update()
    renderer.render(scene, camera)
}

function animate() {
    requestAnimationFrame(animate)
    bot.rotate(0.001)
    bot.move(0.001)
    renderer.render(scene, camera)
}

init()
animate()