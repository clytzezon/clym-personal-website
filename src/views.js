export const VIEW = {
  ROW: 'row',
  ZOOMED: 'zoomed',
  OPEN: 'open',
  ID: 'id',
  ARCHITECTURE: 'architecture',
  ART: 'art',
  PHOTO: 'photo',
}

const OBJECT_TO_VIEW = {
  id: VIEW.ID,
  architecture: VIEW.ARCHITECTURE,
  art: VIEW.ART,
  photo: VIEW.PHOTO,
}

const BACK = {
  [VIEW.ID]: VIEW.OPEN,
  [VIEW.ARCHITECTURE]: VIEW.OPEN,
  [VIEW.ART]: VIEW.OPEN,
  [VIEW.PHOTO]: VIEW.OPEN,
  [VIEW.OPEN]: VIEW.ZOOMED,
  [VIEW.ZOOMED]: VIEW.ROW,
}

const HINTS = {
  [VIEW.ROW]: 'Click the decorated locker.',
  [VIEW.ZOOMED]: 'Click the door to open · empty space to step back.',
  [VIEW.OPEN]: 'Click an object · empty space to close the door.',
  [VIEW.ID]: 'Click empty space to return.',
  [VIEW.ARCHITECTURE]: 'Click empty space to return to the locker.',
  [VIEW.ART]: 'Click empty space to return to the locker.',
  [VIEW.PHOTO]: 'Click empty space to return to the locker.',
}

export function getView(stage) {
  return stage.dataset.view
}

export function setView(stage, view) {
  stage.dataset.view = view
  stage.querySelectorAll('.content-view').forEach((el) => {
    el.setAttribute('aria-hidden', String(el.dataset.layer !== view))
  })
  const hint = stage.querySelector('.hint')
  if (hint) hint.textContent = HINTS[view] ?? ''
}

export function goBack(stage) {
  const next = BACK[getView(stage)]
  if (next) setView(stage, next)
}

export function viewForObject(objectId) {
  return OBJECT_TO_VIEW[objectId]
}

export function isContentView(view) {
  return (
    view === VIEW.ID ||
    view === VIEW.ARCHITECTURE ||
    view === VIEW.ART ||
    view === VIEW.PHOTO
  )
}

export function updateCameraOrigin(stage) {
  if (getView(stage) !== VIEW.ROW) return
  const hall = stage.querySelector('.hall')
  const mine = stage.querySelector('.locker--mine')
  if (!hall || !mine) return
  const hallBox = hall.getBoundingClientRect()
  const mineBox = mine.getBoundingClientRect()
  const mineCx = mineBox.left + mineBox.width / 2
  const mineCy = mineBox.top + mineBox.height / 2
  const hallCx = hallBox.left + hallBox.width / 2
  const hallCy = hallBox.top + hallBox.height / 2
  const x = ((mineCx - hallBox.left) / hallBox.width) * 100
  const y = ((mineCy - hallBox.top) / hallBox.height) * 100
  hall.style.setProperty('--cam-x', `${x}%`)
  hall.style.setProperty('--cam-y', `${y}%`)
  hall.style.setProperty('--shift-x', `${Math.round(hallCx - mineCx)}px`)
  hall.style.setProperty('--shift-y', `${Math.round(hallCy - mineCy - hallBox.height * 0.03)}px`)
}
