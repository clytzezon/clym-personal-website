import * as THREE from 'three'
import { createBook3D } from './book-3d.js'

export const DETAIL_BOOK_POSE = {
  initialRotationY: THREE.MathUtils.degToRad(62),
  finalRotationY: THREE.MathUtils.degToRad(22),
  initialRotationX: THREE.MathUtils.degToRad(-1),
  finalRotationX: THREE.MathUtils.degToRad(-4),
  duration: 820,
}

export const DETAIL_BOOK_INTERACTION = {
  minRotationY: THREE.MathUtils.degToRad(10),
  maxRotationY: THREE.MathUtils.degToRad(34),
  minRotationX: THREE.MathUtils.degToRad(-8),
  maxRotationX: THREE.MathUtils.degToRad(1),
  stiffness: 280,
  damping: 26,
}

class InertialRotation {
  constructor(value, min, max) {
    this.value = value
    this.target = value
    this.velocity = 0
    this.min = min
    this.max = max
  }

  setTarget(value) {
    this.target = THREE.MathUtils.clamp(value, this.min, this.max)
  }

  reset(value) {
    this.value = value
    this.target = value
    this.velocity = 0
  }

  step(deltaTime) {
    const dt = Math.min(deltaTime, 1 / 30)
    this.velocity +=
      (this.target - this.value) * DETAIL_BOOK_INTERACTION.stiffness * dt
    this.velocity *= Math.exp(-DETAIL_BOOK_INTERACTION.damping * dt)
    this.value += this.velocity * dt
    this.value = THREE.MathUtils.clamp(this.value, this.min, this.max)

    if (this.isSettled()) {
      this.value = this.target
      this.velocity = 0
    }

    return this.value
  }

  isSettled() {
    return Math.abs(this.target - this.value) < 0.002 && Math.abs(this.velocity) < 0.01
  }
}

function easeOutQuart(value) {
  return 1 - (1 - value) ** 4
}

export function createBookDetailScene({ container, project }) {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 30)
  camera.position.set(0, 0.08, 5.8)
  camera.lookAt(0, 0, 0)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.domElement.className = 'book-detail-stage__canvas'
  container.append(renderer.domElement)

  scene.add(new THREE.HemisphereLight(0xf7f0df, 0x20231f, 1.72))

  const keyLight = new THREE.DirectionalLight(0xfff8e8, 3.35)
  keyLight.position.set(-3.2, 4.6, 5.8)
  keyLight.castShadow = true
  keyLight.shadow.mapSize.set(1024, 1024)
  keyLight.shadow.camera.left = -3
  keyLight.shadow.camera.right = 3
  keyLight.shadow.camera.top = 3
  keyLight.shadow.camera.bottom = -3
  scene.add(keyLight)

  const rimLight = new THREE.DirectionalLight(0x718b80, 1.1)
  rimLight.position.set(4.2, 1.4, -1.8)
  scene.add(rimLight)

  let destroyed = false
  let running = false
  let frameId = null
  let entryStartedAt = null
  let entryPending = true
  let active = false
  let interactionEnabled = false
  let lastFrameAt = null

  const book = createBook3D(project, renderer, {
    onTextureUpdate() {
      if (!destroyed && !running) renderer.render(scene, camera)
    },
  })
  const presentation = new THREE.Group()
  book.root.position.set(-project.dimensions.width / 2, -project.dimensions.height / 2, 0)
  presentation.add(book.root)
  scene.add(presentation)

  const rotationX = new InertialRotation(
    DETAIL_BOOK_POSE.finalRotationX,
    DETAIL_BOOK_INTERACTION.minRotationX,
    DETAIL_BOOK_INTERACTION.maxRotationX,
  )
  const rotationY = new InertialRotation(
    DETAIL_BOOK_POSE.finalRotationY,
    DETAIL_BOOK_INTERACTION.minRotationY,
    DETAIL_BOOK_INTERACTION.maxRotationY,
  )

  const floorGeometry = new THREE.PlaneGeometry(7, 5)
  const floorMaterial = new THREE.ShadowMaterial({ color: 0x070806, opacity: 0.52 })
  const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.rotation.x = -Math.PI / 2
  floor.position.set(0, -project.dimensions.height / 2 - 0.035, 0)
  floor.receiveShadow = true
  scene.add(floor)

  function setPose(progress) {
    const eased = easeOutQuart(progress)
    presentation.rotation.y = THREE.MathUtils.lerp(
      DETAIL_BOOK_POSE.initialRotationY,
      DETAIL_BOOK_POSE.finalRotationY,
      eased,
    )
    presentation.rotation.x = THREE.MathUtils.lerp(
      DETAIL_BOOK_POSE.initialRotationX,
      DETAIL_BOOK_POSE.finalRotationX,
      eased,
    )
    const scale = THREE.MathUtils.lerp(0.82, 1, eased)
    presentation.scale.setScalar(scale)
    presentation.position.x = THREE.MathUtils.lerp(-0.18, 0, eased)
    presentation.position.y = THREE.MathUtils.lerp(-0.07, 0, eased)
  }

  function resetInteractionPose() {
    rotationX.reset(DETAIL_BOOK_POSE.finalRotationX)
    rotationY.reset(DETAIL_BOOK_POSE.finalRotationY)
    presentation.rotation.x = rotationX.value
    presentation.rotation.y = rotationY.value
  }

  function requestInteractionFrame() {
    if (!active || !interactionEnabled || running) return
    running = true
    lastFrameAt = null
    frameId = requestAnimationFrame(renderFrame)
  }

  function setRestingTargets() {
    rotationX.setTarget(DETAIL_BOOK_POSE.finalRotationX)
    rotationY.setTarget(DETAIL_BOOK_POSE.finalRotationY)
    requestInteractionFrame()
  }

  function onPointerMove(event) {
    if (!active || !interactionEnabled) return

    const bounds = container.getBoundingClientRect()
    if (!bounds.width || !bounds.height) return

    const pointerX = THREE.MathUtils.clamp((event.clientX - bounds.left) / bounds.width, 0, 1)
    const pointerY = THREE.MathUtils.clamp((event.clientY - bounds.top) / bounds.height, 0, 1)
    const targetX = pointerY < 0.5
      ? THREE.MathUtils.lerp(DETAIL_BOOK_POSE.finalRotationX, DETAIL_BOOK_INTERACTION.maxRotationX, (0.5 - pointerY) * 2)
      : THREE.MathUtils.lerp(DETAIL_BOOK_POSE.finalRotationX, DETAIL_BOOK_INTERACTION.minRotationX, (pointerY - 0.5) * 2)

    rotationY.setTarget(
      THREE.MathUtils.lerp(
        DETAIL_BOOK_INTERACTION.minRotationY,
        DETAIL_BOOK_INTERACTION.maxRotationY,
        pointerX,
      ),
    )
    rotationX.setTarget(targetX)
    requestInteractionFrame()
  }

  function onPointerLeave() {
    if (!active || !interactionEnabled) return
    setRestingTargets()
  }

  function resize() {
    const width = Math.max(1, container.clientWidth)
    const height = Math.max(1, container.clientHeight)
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.position.z = camera.aspect < 0.75 ? 6.6 : 5.8
    camera.updateProjectionMatrix()
    renderer.render(scene, camera)
  }

  function renderFrame(timestamp) {
    if (!running || destroyed || !active) return

    if (entryPending) {
      if (entryStartedAt === null) entryStartedAt = timestamp
      const progress = Math.min(1, (timestamp - entryStartedAt) / DETAIL_BOOK_POSE.duration)
      setPose(progress)
      renderer.render(scene, camera)

      if (progress < 1) {
        frameId = requestAnimationFrame(renderFrame)
      } else {
        running = false
        frameId = null
        entryPending = false
        interactionEnabled = true
        resetInteractionPose()
      }
      return
    }

    if (lastFrameAt === null) lastFrameAt = timestamp
    const deltaTime = Math.min((timestamp - lastFrameAt) / 1000, 0.05)
    lastFrameAt = timestamp
    presentation.rotation.x = rotationX.step(deltaTime)
    presentation.rotation.y = rotationY.step(deltaTime)
    renderer.render(scene, camera)

    if (!rotationX.isSettled() || !rotationY.isSettled()) {
      frameId = requestAnimationFrame(renderFrame)
    } else {
      running = false
      frameId = null
      lastFrameAt = null
    }
  }

  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(container)
  container.addEventListener('pointermove', onPointerMove)
  container.addEventListener('pointerleave', onPointerLeave)
  setPose(0)
  resize()

  return {
    restartEntry() {
      entryPending = true
      entryStartedAt = null
      interactionEnabled = false
      resetInteractionPose()
      setPose(0)
    },
    pause() {
      active = false
      interactionEnabled = false
      running = false
      if (frameId !== null) cancelAnimationFrame(frameId)
      frameId = null
      lastFrameAt = null
      resetInteractionPose()
    },
    resume() {
      if (destroyed || running) return
      active = true
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        entryPending = false
        interactionEnabled = false
        resetInteractionPose()
        setPose(1)
        renderer.render(scene, camera)
        return
      }
      if (!entryPending) {
        interactionEnabled = true
        resetInteractionPose()
        setPose(1)
        renderer.render(scene, camera)
        return
      }
      running = true
      entryStartedAt = null
      frameId = requestAnimationFrame(renderFrame)
    },
    destroy() {
      if (destroyed) return
      destroyed = true
      this.pause()
      resizeObserver.disconnect()
      container.removeEventListener('pointermove', onPointerMove)
      container.removeEventListener('pointerleave', onPointerLeave)
      book.dispose()
      floorGeometry.dispose()
      floorMaterial.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
