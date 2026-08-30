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

renderLockers(row)
setView(stage, VIEW.ROW)
updateCameraOrigin(stage)

stage.addEventListener('click', (event) => {
  const view = getView(stage)

  if (event.target.closest('[data-return]')) {
    setView(stage, VIEW.OPEN)
    return
  }

  if (event.target.closest('[data-stay]')) {
    return
  }

  if (isContentView(view)) {
    goBack(stage)
    return
  }

  const object = event.target.closest('[data-object]')
  if (object && view === VIEW.OPEN) {
    const next = viewForObject(object.dataset.object)
    if (next) setView(stage, next)
    return
  }

  const mine = event.target.closest('.locker--mine')
  const door = event.target.closest('.locker--mine .locker-door')

  if (view === VIEW.ROW && mine) {
    updateCameraOrigin(stage)
    setView(stage, VIEW.ZOOMED)
    return
  }

  if (view === VIEW.ZOOMED && door) {
    setView(stage, VIEW.OPEN)
    return
  }

  if (view === VIEW.OPEN || view === VIEW.ZOOMED) {
    goBack(stage)
  }
})

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') goBack(stage)
})

window.addEventListener('resize', () => {
  updateCameraOrigin(stage)
})
