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
const architectureDetailRoot = document.querySelector('[data-layer="architecture-detail"]')
const ARCHITECTURE_ENTER_DURATION = 820
const ARCHITECTURE_EXIT_DURATION = 460
const DETAIL_ENTER_DURATION = 900
const DETAIL_EMPHASIS_DURATION = 80
const DETAIL_EXIT_DURATION = 520
const FULL_PROJECT_TRANSITION_DURATION = 520
let architectureIndex = null
let architectureImport = null
let architectureDetail = null
let architectureDetailImport = null
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
          showArchitectureDetail(projectId)
        },
      })
      architectureIndex.mount()
      return architectureIndex
    },
  )

  return architectureImport
}

function ensureArchitectureDetail() {
  if (architectureDetail) return Promise.resolve(architectureDetail)

  architectureDetailImport ??= import('./architecture/architecture-detail.js').then(
    ({ createArchitectureDetail }) => {
      architectureDetail = createArchitectureDetail({ root: architectureDetailRoot })
      return architectureDetail
    },
  )

  return architectureDetailImport
}

function syncScenes(view) {
  const architectureIsVisible = view === VIEW.ARCHITECTURE
  const detailIsVisible = view === VIEW.ARCHITECTURE_DETAIL

  if (!architectureIsVisible) {
    architectureIndex?.pause()
  } else if (architectureIndex) {
    architectureIndex.mount()
    architectureIndex.resume()
  } else {
    ensureArchitecture().then(() => {
      if (getView(stage) === VIEW.ARCHITECTURE) architectureIndex.resume()
    })
  }

  if (detailIsVisible) architectureDetail?.resume()
  else architectureDetail?.pause()
}

function showView(view) {
  setView(stage, view)
  syncScenes(view)
}

function showPreviousView() {
  goBack(stage)
  syncScenes(getView(stage))
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

async function showArchitectureDetail(projectId) {
  if (viewTransitionInProgress || getView(stage) !== VIEW.ARCHITECTURE) return

  setTransitionLock(true)
  stage.classList.add('is-architecture-detail-entering')

  try {
    const detail = await ensureArchitectureDetail()
    if (!detail.prepare(projectId)) return

    await wait(DETAIL_EMPHASIS_DURATION)
    showView(VIEW.ARCHITECTURE_DETAIL)
    await wait(DETAIL_ENTER_DURATION - DETAIL_EMPHASIS_DURATION)
  } finally {
    stage.classList.remove('is-architecture-detail-entering')
    setTransitionLock(false)
  }
}

async function leaveArchitectureDetail() {
  if (viewTransitionInProgress || getView(stage) !== VIEW.ARCHITECTURE_DETAIL) return

  setTransitionLock(true)
  stage.classList.add('is-detail-leaving')
  architectureDetail?.pause()
  showView(VIEW.ARCHITECTURE)

  try {
    await wait(DETAIL_EXIT_DURATION)
  } finally {
    stage.classList.remove('is-detail-leaving')
    setTransitionLock(false)
  }
}

async function showFullProject() {
  if (
    viewTransitionInProgress ||
    getView(stage) !== VIEW.ARCHITECTURE_DETAIL ||
    !architectureDetail?.project?.fullProjectEnabled
  ) return

  setTransitionLock(true)
  architectureDetail.pause()
  showView(VIEW.ARCHITECTURE_FULL)

  try {
    await wait(FULL_PROJECT_TRANSITION_DURATION)
  } finally {
    setTransitionLock(false)
  }
}

async function leaveFullProject() {
  if (viewTransitionInProgress || getView(stage) !== VIEW.ARCHITECTURE_FULL) return

  setTransitionLock(true)
  stage.classList.add('is-full-project-leaving')
  showView(VIEW.ARCHITECTURE_DETAIL)

  try {
    await wait(FULL_PROJECT_TRANSITION_DURATION)
  } finally {
    stage.classList.remove('is-full-project-leaving')
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

  if (event.target.closest('[data-read-more]')) {
    showFullProject()
    return
  }

  if (event.target.closest('[data-return]')) {
    if (view === VIEW.ARCHITECTURE) leaveArchitecture()
    else if (view === VIEW.ARCHITECTURE_DETAIL) leaveArchitectureDetail()
    else if (view === VIEW.ARCHITECTURE_FULL) leaveFullProject()
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
  const view = getView(stage)
  if (view === VIEW.ARCHITECTURE) leaveArchitecture()
  else if (view === VIEW.ARCHITECTURE_DETAIL) leaveArchitectureDetail()
  else if (view === VIEW.ARCHITECTURE_FULL) leaveFullProject()
  else showPreviousView()
})

window.addEventListener('resize', () => {
  updateCameraOrigin(stage)
})

window.addEventListener('beforeunload', () => {
  architectureIndex?.destroy()
  architectureDetail?.destroy()
})
