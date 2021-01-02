/* global THREE, fetch */

// Workaround for process.versions.node not existing in the browser
process.versions.node = '14.0.0'

const mineflayer = require('mineflayer')
const { WorldView, Viewer, MapControls } = require('prismarine-viewer/viewer')
const { Vec3 } = require('vec3')
global.THREE = require('three')

async function main () {
  const version = '1.16.4'

  const viewDistance = 6

  const bot = mineflayer.createBot({
    host: '95.111.249.143',
    port: 10000,
    username: 'echo',
  })

  bot.on('chat', (username, message) => {
    if (username === bot.username) return
    bot.chat(message)
  })

  bot.once('spawn', () => {
    console.log('bot spawned - starting viewer')

    const center = bot.entity.position

    const worldView = new WorldView(bot.world, viewDistance, center)

    // Create three.js context, add to page
    const renderer = new THREE.WebGLRenderer()
    renderer.setPixelRatio(window.devicePixelRatio || 1)
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    // Create viewer
    const viewer = new Viewer(renderer)
    viewer.setVersion(version)
    // Attach controls to viewer
    const controls = new MapControls(viewer.camera, renderer.domElement)

    worldView.listenToBot(bot)

    function botPosition () {
      worldView.updatePosition(bot.entity.position)
      viewer.camera.position.set(bot.entity.position.x, bot.entity.position.y, bot.entity.position.z)
    }

    bot.on('move', botPosition)

    bot.on('chunkColumnLoad', () => {
      console.log('chunkload')
    })

    // Link WorldView and Viewer
    viewer.listen(worldView)

    viewer.camera.position.set(center.x, center.y, center.z)
    controls.update()

    // Browser animation loop
    const animate = () => {
      window.requestAnimationFrame(animate)
      if (controls) controls.update()
      worldView.updatePosition(controls.target)
      // worldView.updatePosition(bot.entity.position)
      renderer.render(viewer.scene, viewer.camera)
    }
    animate()
  })
}
main()
