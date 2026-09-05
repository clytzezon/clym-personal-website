import * as THREE from 'three'
import {
  CLOSED_ROTATION,
  calculateBookLayout,
  calculateShelfBounds,
} from './bookshelf-layout.js'
import { createBookshelfInput } from './bookshelf-input.js'

const SHELF_STAGE_SCALE = 0.75
const SHELF_STAGE_Y = -0.08

class RestrainedSpring {
  constructor(value, stiffness = 90, damping = 20) {
    this.value = value
    this.target = value
    this.velocity = 0
    this.stiffness = stiffness
    this.damping = damping
  }

  step(deltaTime) {
    const dt = Math.min(deltaTime, 1 / 30)
    this.velocity += (this.target - this.value) * this.stiffness * dt
    this.velocity *= Math.exp(-this.damping * dt)
    this.value += this.velocity * dt

    if (Math.abs(this.target - this.value) < 0.0001 && Math.abs(this.velocity) < 0.0001) {
      this.value = this.target
      this.velocity = 0
    }

    return this.value
  }
}

function shadeColor(color, amount) {
  const source = new THREE.Color(color)
  source.offsetHSL(0, 0, amount)
  return source
}

export function createBookshelfScene({ container, projects, onFocus, onSelect }) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#dedbd4')

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50)
  camera.position.set(0, 1.32, 5.15)
  camera.lookAt(0, 1.32, 0)

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.domElement.className = 'architecture-bookshelf__canvas'
  container.append(renderer.domElement)

  scene.add(new THREE.HemisphereLight(0xffffff, 0x77736d, 1.7))

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.35)
  keyLight.position.set(-3, 6, 7)
  keyLight.castShadow = true
  keyLight.shadow.mapSize.set(1024, 1024)
  keyLight.shadow.camera.left = -7
  keyLight.shadow.camera.right = 7
  keyLight.shadow.camera.top = 5
  keyLight.shadow.camera.bottom = -1
  scene.add(keyLight)

  const shelf = new THREE.Group()
  shelf.position.y = SHELF_STAGE_Y
  shelf.scale.setScalar(SHELF_STAGE_SCALE)
  scene.add(shelf)

  const books = projects.map((project, index) => {
    const { width, height, depth } = project.dimensions
    const root = new THREE.Group()
    const geometry = new THREE.BoxGeometry(width, height, depth)
    const materials = [
      new THREE.MeshStandardMaterial({ color: shadeColor(project.color, 0.04), roughness: 0.82 }),
      new THREE.MeshStandardMaterial({ color: shadeColor(project.color, -0.09), roughness: 0.88 }),
      new THREE.MeshStandardMaterial({ color: shadeColor(project.color, 0.08), roughness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: shadeColor(project.color, -0.12), roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ color: project.color, roughness: 0.78 }),
      new THREE.MeshStandardMaterial({ color: shadeColor(project.color, -0.04), roughness: 0.84 }),
    ]
    const mesh = new THREE.Mesh(geometry, materials)

    // The front cover rests on the z=0 baseline plane while the volume extends
    // away from the camera. The live root offset below accounts for the part of
    // this volume that projects left of its spine pivot while folded.
    mesh.position.set(width / 2, height / 2, -depth / 2)
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.userData.bookIndex = index
    root.rotation.y = CLOSED_ROTATION
    root.add(mesh)
    shelf.add(root)

    return {
      project,
      dimensions: project.dimensions,
      root,
      mesh,
      geometry,
      materials,
      rotation: new RestrainedSpring(CLOSED_ROTATION, 112, 20),
    }
  })

  const floorGeometry = new THREE.PlaneGeometry(30, 8)
  const floorMaterial = new THREE.ShadowMaterial({ color: 0x35322f, opacity: 0.18 })
  const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.rotation.x = -Math.PI / 2
  floor.position.set(0, SHELF_STAGE_Y - 0.012, 0)
  floor.receiveShadow = true
  scene.add(floor)

  const raycaster = new THREE.Raycaster()
  const pointerNdc = new THREE.Vector2()
  const shelfPan = new RestrainedSpring(0, 88, 22)
  const timer = new THREE.Timer()
  timer.connect(document)
  let focusedIndex = -1
  let layoutIndex = Math.floor(books.length / 2)
  let panBounds = { min: 0, max: 0 }
  let frameId = null
  let running = false
  let destroyed = false
  let viewWidth = 1

  function hitTest(clientX, clientY) {
    const bounds = renderer.domElement.getBoundingClientRect()
    if (!bounds.width || !bounds.height) return -1

    pointerNdc.set(
      ((clientX - bounds.left) / bounds.width) * 2 - 1,
      -((clientY - bounds.top) / bounds.height) * 2 + 1,
    )
    raycaster.setFromCamera(pointerNdc, camera)
    const hit = raycaster.intersectObjects(books.map((book) => book.mesh), false)[0]
    return hit ? hit.object.userData.bookIndex : -1
  }

  function setFocusedIndex(index) {
    if (index === focusedIndex) return
    focusedIndex = index
    if (index >= 0) layoutIndex = index

    books.forEach((book, bookIndex) => {
      const isOpening = bookIndex === focusedIndex
      book.rotation.target = isOpening ? 0 : CLOSED_ROTATION
      book.rotation.stiffness = isOpening ? 112 : 48
      book.rotation.damping = isOpening ? 20 : 16
      book.mesh.renderOrder = isOpening ? 10 : 0
    })

    onFocus(index >= 0 ? books[index].project : null)
  }

  function selectIndex(index) {
    if (index < 0 || index !== focusedIndex) return
    if (!books[index].project.interactive) return
    onSelect(books[index].project)
  }

  function panByPixels(pixelDelta) {
    const worldPerPixel = viewWidth / Math.max(1, renderer.domElement.clientWidth)
    shelfPan.target = THREE.MathUtils.clamp(
      shelfPan.target + pixelDelta * worldPerPixel,
      panBounds.min,
      panBounds.max,
    )
  }

  const input = createBookshelfInput({
    element: renderer.domElement,
    hitTest,
    getFocusedIndex: () => focusedIndex,
    onFocus: setFocusedIndex,
    onSelect: selectIndex,
    onPan: panByPixels,
  })

  function resize() {
    const width = Math.max(1, container.clientWidth)
    const height = Math.max(1, container.clientHeight)
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    viewWidth = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z * camera.aspect
  }

  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(container)
  resize()

  function renderFrame(timestamp) {
    if (!running || destroyed) return
    frameId = requestAnimationFrame(renderFrame)
    timer.update(timestamp)
    const deltaTime = Math.min(timer.getDelta(), 0.05)

    input.update()
    books.forEach((book) => {
      book.root.rotation.y = book.rotation.step(deltaTime)
    })

    const layout = calculateBookLayout(
      books.map((book) => ({
        dimensions: book.dimensions,
        rotationY: book.rotation.value,
      })),
      layoutIndex,
    )

    books.forEach((book, index) => {
      const pivotCorrection = Math.sin(book.rotation.value) * book.dimensions.depth
      book.root.position.x = layout.positions[index] + pivotCorrection
    })

    panBounds = calculateShelfBounds(
      layout.leftEdge * SHELF_STAGE_SCALE,
      layout.rightEdge * SHELF_STAGE_SCALE,
      viewWidth,
    )
    shelfPan.target = THREE.MathUtils.clamp(shelfPan.target, panBounds.min, panBounds.max)
    shelf.position.x = THREE.MathUtils.clamp(
      shelfPan.step(deltaTime),
      panBounds.min,
      panBounds.max,
    )

    renderer.render(scene, camera)
  }

  return {
    pause() {
      running = false
      if (frameId !== null) cancelAnimationFrame(frameId)
      frameId = null
    },
    resume() {
      if (running || destroyed) return
      running = true
      timer.reset()
      frameId = requestAnimationFrame(renderFrame)
    },
    destroy() {
      if (destroyed) return
      destroyed = true
      this.pause()
      input.destroy()
      resizeObserver.disconnect()
      timer.dispose()
      books.forEach((book) => {
        book.geometry.dispose()
        book.materials.forEach((material) => material.dispose())
      })
      floorGeometry.dispose()
      floorMaterial.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
