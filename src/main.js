import './style.css'
import { renderLockers } from './lockers.js'
import {
  VIEW,
  getView,
  setView,
  goBack,
  viewForObject,
  isContentView,
  updateCameraOrigin,
} from './views.js'

const stage = document.querySelector('#stage')
const row = document.querySelector('#locker-row')
const architectureRoot = document.querySelector('[data-layer="architecture"]')
const ARCHITECTURE_ENTER_DURATION = 820
const ARCHITECTURE_EXIT_DURATION = 460
let architectureIndex = null
let architectureImport = null
let architectureIsVisible = false
let viewTransitionInProgress = false

function transitionDuration(duration) {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : duration
}

function wait(duration) {
  return new Promise((resolve) => window.setTimeout(resolve, transitionDuration(duration)))
}

function setTransitionLock(locked) {
  viewTransitionInProgress = locked
  stage.classList.toggle('is-view-transitioning', locked)
  if (locked) stage.setAttribute('aria-busy', 'true')
  else stage.removeAttribute('aria-busy')
}

function ensureArchitecture() {
  if (architectureIndex) {
    architectureIndex.mount()
    return Promise.resolve(architectureIndex)
  }

  architectureImport ??= import('./architecture/architecture-index.js').then(
    ({ createArchitectureIndex }) => {
      architectureIndex = createArchitectureIndex({
        root: architectureRoot,
        onProjectSelect(projectId) {
          console.info('Architecture project selected:', projectId)
        },
      })
      architectureIndex.mount()
      return architectureIndex
    },
  )

  return architectureImport
}

function syncArchitecture(view) {
  architectureIsVisible = view === VIEW.ARCHITECTURE

  if (!architectureIsVisible) {
    architectureIndex?.pause()
    return
  }

  if (architectureIndex) {
    architectureIndex.mount()
    architectureIndex.resume()
    return
  }

  ensureArchitecture().then(() => {
    if (architectureIsVisible) {
      architectureIndex.resume()
    }
  })
}

function showView(view) {
  setView(stage, view)
  syncArchitecture(view)
}

function showPreviousView() {
  goBack(stage)
  syncArchitecture(getView(stage))
}

async function showArchitecture(trigger) {
  if (viewTransitionInProgress) return

  setTransitionLock(true)
  stage.classList.add('is-architecture-entering')
  trigger?.classList.add('is-transition-source')

  try {
    await ensureArchitecture()
    showView(VIEW.ARCHITECTURE)
    await wait(ARCHITECTURE_ENTER_DURATION)
  } finally {
    trigger?.classList.remove('is-transition-source')
    stage.classList.remove('is-architecture-entering')
    setTransitionLock(false)
  }
}

async function leaveArchitecture() {
  if (viewTransitionInProgress) return

  setTransitionLock(true)
  stage.classList.add('is-architecture-leaving')
  showView(VIEW.OPEN)

  try {
    await wait(ARCHITECTURE_EXIT_DURATION)
  } finally {
    stage.classList.remove('is-architecture-leaving')
    setTransitionLock(false)
  }
}

renderLockers(row)
showView(VIEW.ROW)
updateCameraOrigin(stage)

stage.addEventListener('click', (event) => {
  if (viewTransitionInProgress) return

  const view = getView(stage)

  if (event.target.closest('[data-return]')) {
    if (view === VIEW.ARCHITECTURE) leaveArchitecture()
    else showView(VIEW.OPEN)
    return
  }

  if (event.target.closest('[data-stay]')) {
    return
  }

  if (isContentView(view)) {
    showPreviousView()
    return
  }

  const object = event.target.closest('[data-object]')
  if (object && view === VIEW.OPEN) {
    const next = viewForObject(object.dataset.object)
    if (next === VIEW.ARCHITECTURE) showArchitecture(object)
    else if (next) showView(next)
    return
  }

  const mine = event.target.closest('.locker--mine')
  const door = event.target.closest('.locker--mine .locker-door')

  if (view === VIEW.ROW && mine) {
    updateCameraOrigin(stage)
    showView(VIEW.ZOOMED)
    return
  }

  if (view === VIEW.ZOOMED && door) {
    showView(VIEW.OPEN)
    return
  }

  if (view === VIEW.OPEN || view === VIEW.ZOOMED) {
    showPreviousView()
  }
})

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || viewTransitionInProgress) return
  if (getView(stage) === VIEW.ARCHITECTURE) leaveArchitecture()
  else showPreviousView()
})

window.addEventListener('resize', () => {
  updateCameraOrigin(stage)
})

window.addEventListener('beforeunload', () => {
  architectureIndex?.destroy()
})
