const ENTER_DELAY = 65
const LEAVE_DELAY = 125

export function createBookshelfInput({
  element,
  hitTest,
  getFocusedIndex,
  onFocus,
  onSelect,
  onPan,
}) {
  const pointer = {
    x: 0,
    y: 0,
    seen: false,
    inside: false,
    down: false,
    id: null,
    type: 'mouse',
    startX: 0,
    startY: 0,
    lastX: 0,
    moved: 0,
    downIndex: -1,
  }

  let candidateIndex = -1
  let candidateSince = 0
  let leaveSince = 0
  let wheelLocked = false

  function resetIntent() {
    candidateIndex = -1
    candidateSince = 0
    leaveSince = 0
  }

  function onPointerEnter(event) {
    pointer.inside = true
    pointer.seen = true
    pointer.x = event.clientX
    pointer.y = event.clientY
  }

  function onPointerMove(event) {
    if (pointer.id !== null && event.pointerId !== pointer.id) return

    pointer.inside = true
    pointer.seen = true
    pointer.type = event.pointerType || 'mouse'
    pointer.x = event.clientX
    pointer.y = event.clientY
    wheelLocked = false

    if (!pointer.down) return

    const deltaX = event.clientX - pointer.lastX
    pointer.lastX = event.clientX
    pointer.moved = Math.max(
      pointer.moved,
      Math.hypot(event.clientX - pointer.startX, event.clientY - pointer.startY),
    )

    if (pointer.moved > 6) {
      resetIntent()
      onPan(deltaX)
    }
  }

  function onPointerLeave() {
    pointer.inside = false
    wheelLocked = false
    candidateIndex = -1
    candidateSince = 0
    if (!pointer.down && getFocusedIndex() >= 0) leaveSince = performance.now()
  }

  function onPointerDown(event) {
    if (pointer.id !== null) return

    pointer.id = event.pointerId
    pointer.down = true
    pointer.type = event.pointerType || 'mouse'
    pointer.startX = event.clientX
    pointer.startY = event.clientY
    pointer.lastX = event.clientX
    pointer.moved = 0
    pointer.downIndex = hitTest(event.clientX, event.clientY)
    element.setPointerCapture(event.pointerId)
  }

  function finishPointer(event) {
    if (pointer.id !== null && event.pointerId !== pointer.id) return

    const releasedIndex = hitTest(event.clientX, event.clientY)
    const wasTap = pointer.moved < 10 && releasedIndex === pointer.downIndex

    if (wasTap && releasedIndex >= 0) {
      if (getFocusedIndex() === releasedIndex) onSelect(releasedIndex)
      else onFocus(releasedIndex)
    }

    pointer.id = null
    pointer.down = false
    pointer.downIndex = -1
  }

  function cancelPointer(event) {
    if (pointer.id !== null && event.pointerId !== pointer.id) return
    pointer.id = null
    pointer.down = false
    pointer.downIndex = -1
  }

  function onWheel(event) {
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.deltaY

    if (delta === 0) return
    event.preventDefault()
    wheelLocked = true
    resetIntent()
    onPan(-delta * 0.75)
  }

  function update(now = performance.now()) {
    if (!pointer.seen || pointer.down || pointer.type !== 'mouse') return

    if (!pointer.inside) {
      if (getFocusedIndex() >= 0 && leaveSince > 0 && now - leaveSince >= LEAVE_DELAY) {
        onFocus(-1)
        leaveSince = 0
      }
      return
    }

    if (wheelLocked) return

    const hitIndex = hitTest(pointer.x, pointer.y)
    const focusedIndex = getFocusedIndex()

    if (hitIndex >= 0) {
      leaveSince = 0
      if (hitIndex === focusedIndex) {
        candidateIndex = -1
        return
      }

      if (candidateIndex !== hitIndex) {
        candidateIndex = hitIndex
        candidateSince = now
        return
      }

      if (now - candidateSince >= ENTER_DELAY) {
        onFocus(hitIndex)
        candidateIndex = -1
      }
      return
    }

    candidateIndex = -1
    if (focusedIndex < 0) {
      leaveSince = 0
      return
    }

    if (leaveSince === 0) leaveSince = now
    else if (now - leaveSince >= LEAVE_DELAY) {
      onFocus(-1)
      leaveSince = 0
    }
  }

  element.addEventListener('pointerenter', onPointerEnter)
  element.addEventListener('pointermove', onPointerMove)
  element.addEventListener('pointerleave', onPointerLeave)
  element.addEventListener('pointerdown', onPointerDown)
  element.addEventListener('pointerup', finishPointer)
  element.addEventListener('pointercancel', cancelPointer)
  element.addEventListener('lostpointercapture', cancelPointer)
  element.addEventListener('wheel', onWheel, { passive: false })

  return {
    update,
    destroy() {
      element.removeEventListener('pointerenter', onPointerEnter)
      element.removeEventListener('pointermove', onPointerMove)
      element.removeEventListener('pointerleave', onPointerLeave)
      element.removeEventListener('pointerdown', onPointerDown)
      element.removeEventListener('pointerup', finishPointer)
      element.removeEventListener('pointercancel', cancelPointer)
      element.removeEventListener('lostpointercapture', cancelPointer)
      element.removeEventListener('wheel', onWheel)
    },
  }
}
