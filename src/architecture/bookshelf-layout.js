export const CLOSED_ROTATION = (82 * Math.PI) / 180

export function projectedBookWidth(dimensions, rotationY) {
  const cover = Math.abs(Math.cos(rotationY)) * dimensions.width
  const spine = Math.abs(Math.sin(rotationY)) * dimensions.depth
  return cover + spine
}

export function calculateBookLayout(books, focusIndex, gap = 0.13) {
  const closedWidths = books.map(({ dimensions }) =>
    projectedBookWidth(dimensions, CLOSED_ROTATION),
  )
  const liveWidths = books.map(({ dimensions, rotationY }) =>
    projectedBookWidth(dimensions, rotationY),
  )
  const closedLefts = []
  let cursor = 0

  closedWidths.forEach((width, index) => {
    closedLefts[index] = cursor
    cursor += width + gap
  })

  const closedTotal = Math.max(0, cursor - gap)
  const shelfCenter = closedTotal / 2
  const lefts = closedLefts.slice()
  const focus = Math.max(0, Math.min(focusIndex, books.length - 1))
  const focusCenter = closedLefts[focus] + closedWidths[focus] / 2

  lefts[focus] = focusCenter - liveWidths[focus] / 2

  for (let index = focus - 1; index >= 0; index -= 1) {
    lefts[index] = lefts[index + 1] - gap - liveWidths[index]
  }

  for (let index = focus + 1; index < books.length; index += 1) {
    lefts[index] = lefts[index - 1] + liveWidths[index - 1] + gap
  }

  const positions = lefts.map((left) => left - shelfCenter)
  const leftEdge = positions[0]
  const lastIndex = books.length - 1
  const rightEdge = positions[lastIndex] + liveWidths[lastIndex]

  return {
    positions,
    leftEdge,
    rightEdge,
    width: rightEdge - leftEdge,
  }
}

export function calculateShelfBounds(leftEdge, rightEdge, viewWidth, margin = 0.16) {
  const halfView = Math.max(0, viewWidth / 2 - margin)
  const shelfWidth = rightEdge - leftEdge

  if (shelfWidth <= halfView * 2) {
    const centeredOffset = -(leftEdge + rightEdge) / 2
    return { min: centeredOffset, max: centeredOffset }
  }

  return {
    min: halfView - rightEdge,
    max: -halfView - leftEdge,
  }
}
