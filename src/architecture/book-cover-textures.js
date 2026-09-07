import * as THREE from 'three'

const COVER_WIDTH = 1400
const COVER_HEIGHT = 2289
const SPINE_WIDTH = 420
const SPINE_HEIGHT = 2420
const CHINESE_DISPLAY_FONT =
  '"TypeLand 康熙字典體 Trial", "Songti SC", "Noto Serif CJK SC", SimSun, serif'
const CHINESE_TEXT_FONT = '"Songti SC", "Noto Serif CJK SC", SimSun, serif'
const LATIN_FONT = 'Georgia, "Times New Roman", serif'

function makeCanvas(width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

function seededRandom(seed = 1837) {
  let value = seed
  return () => {
    value = (value * 48271) % 2147483647
    return value / 2147483647
  }
}

function addPaperTexture(context, width, height, ink, accent) {
  const random = seededRandom()

  context.save()
  context.fillStyle = ink
  for (let index = 0; index < width * height * 0.0022; index += 1) {
    context.globalAlpha = 0.012 + random() * 0.026
    const size = 0.4 + random() * 1.7
    context.fillRect(random() * width, random() * height, size, size)
  }

  context.lineWidth = 0.65
  for (let index = 0; index < Math.round(height * 0.3); index += 1) {
    const x = random() * width
    const y = random() * height
    const length = 8 + random() * 34
    context.strokeStyle = random() > 0.82 ? accent : ink
    context.globalAlpha = 0.018 + random() * 0.025
    context.beginPath()
    context.moveTo(x, y)
    context.quadraticCurveTo(x + length * 0.48, y + random() * 2 - 1, x + length, y)
    context.stroke()
  }
  context.restore()
}

function drawTrackedText(context, text, x, y, tracking) {
  const characters = Array.from(text)
  const width = characters.reduce(
    (total, character) => total + context.measureText(character).width,
    Math.max(0, characters.length - 1) * tracking,
  )
  const alignment = context.textAlign
  let cursor = alignment === 'right' ? x - width : alignment === 'center' ? x - width / 2 : x

  context.textAlign = 'left'
  for (const character of characters) {
    context.fillText(character, cursor, y)
    cursor += context.measureText(character).width + tracking
  }
  context.textAlign = alignment
}

function drawVerticalText(context, text, x, y, lineHeight) {
  Array.from(text).forEach((character, index) => {
    context.fillText(character, x, y + index * lineHeight)
  })
}

function drawVerticalPoem(context, lines, x, y, columnGap, lineHeight) {
  lines.forEach((line, column) => {
    drawVerticalText(context, line, x + column * columnGap, y, lineHeight)
  })
}

function drawSeal(context, x, y, color) {
  context.save()
  context.strokeStyle = color
  context.fillStyle = color
  context.lineWidth = 3
  context.strokeRect(x, y, 42, 42)
  context.strokeRect(x + 6, y + 6, 30, 30)
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = `24px ${CHINESE_TEXT_FONT}`
  context.fillText('園', x + 21, y + 21)
  context.restore()
}

function drawIntegratedArtwork(context, image, paper) {
  const artCanvas = makeCanvas(COVER_WIDTH, 1120)
  const artContext = artCanvas.getContext('2d')
  const artwork = { x: -70, y: 0, width: 1540, height: 1081 }

  artContext.save()
  artContext.filter = 'saturate(0.76) contrast(0.96) sepia(0.08)'
  artContext.globalAlpha = 0.95
  artContext.drawImage(image, artwork.x, artwork.y, artwork.width, artwork.height)
  artContext.restore()

  artContext.globalCompositeOperation = 'destination-in'
  const verticalFade = artContext.createLinearGradient(0, 0, 0, artCanvas.height)
  verticalFade.addColorStop(0, 'rgba(0,0,0,0)')
  verticalFade.addColorStop(0.11, 'rgba(0,0,0,0.74)')
  verticalFade.addColorStop(0.22, 'rgba(0,0,0,1)')
  verticalFade.addColorStop(0.86, 'rgba(0,0,0,0.96)')
  verticalFade.addColorStop(1, 'rgba(0,0,0,0)')
  artContext.fillStyle = verticalFade
  artContext.fillRect(0, 0, artCanvas.width, artCanvas.height)

  const horizontalFade = artContext.createLinearGradient(0, 0, artCanvas.width, 0)
  horizontalFade.addColorStop(0, 'rgba(0,0,0,0.34)')
  horizontalFade.addColorStop(0.075, 'rgba(0,0,0,1)')
  horizontalFade.addColorStop(0.925, 'rgba(0,0,0,1)')
  horizontalFade.addColorStop(1, 'rgba(0,0,0,0.34)')
  artContext.fillStyle = horizontalFade
  artContext.fillRect(0, 0, artCanvas.width, artCanvas.height)

  context.drawImage(artCanvas, 0, 625)
  context.save()
  context.globalAlpha = 0.06
  context.fillStyle = paper
  context.fillRect(0, 625, COVER_WIDTH, artCanvas.height)
  context.restore()
}

function configureTexture(texture, renderer) {
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
  texture.needsUpdate = true
  return texture
}

function drawFrontTypography(context, project) {
  const { ink, accent, seal } = project.coverPalette

  context.textAlign = 'left'
  context.textBaseline = 'top'
  context.fillStyle = ink
  context.font = `500 166px ${CHINESE_DISPLAY_FONT}`
  drawTrackedText(context, project.chineseTitle, 114, 104, 32)

  context.font = `500 29px ${LATIN_FONT}`
  drawTrackedText(context, project.englishTitle, 118, 292, 9)

  context.font = `31px ${CHINESE_TEXT_FONT}`
  context.fillText('基于《西园雅集》典故的', 118, 385)
  context.fillText('江南古典园林建筑设计', 118, 432)

  context.fillStyle = accent
  context.font = `500 20px ${LATIN_FONT}`
  drawTrackedText(context, project.projectTypeEnglish.toUpperCase(), 120, 498, 6)

  context.fillStyle = ink
  context.textAlign = 'center'
  context.font = `23px ${CHINESE_TEXT_FONT}`
  drawVerticalPoem(
    context,
    ['人间清旷之乐，不过于此。', '炉烟方袅，草木自馨。', '水石潺潺，风竹相吞。'],
    1110,
    112,
    52,
    35,
  )
  context.fillStyle = accent
  context.fillRect(1270, 405, 2, 61)

  context.textAlign = 'left'
  context.fillStyle = ink
  context.font = `500 39px ${LATIN_FONT}`
  context.fillText('01', 106, 2160)
  context.fillStyle = accent
  context.fillRect(174, 2180, 760, 2)

  context.fillStyle = ink
  context.textAlign = 'right'
  context.font = `17px ${LATIN_FONT}`
  drawTrackedText(context, 'A GARDEN FOR', 1052, 2148, 4)
  drawTrackedText(context, 'THE LITERATI', 1052, 2177, 4)
  drawSeal(context, 1244, 2143, seal)
}

function createFrontCoverTexture(project, renderer, onUpdate) {
  const canvas = makeCanvas(COVER_WIDTH, COVER_HEIGHT)
  const context = canvas.getContext('2d')
  const { paper, ink, accent } = project.coverPalette

  context.fillStyle = paper
  context.fillRect(0, 0, COVER_WIDTH, COVER_HEIGHT)
  addPaperTexture(context, COVER_WIDTH, COVER_HEIGHT, ink, accent)
  drawFrontTypography(context, project)

  const texture = configureTexture(new THREE.CanvasTexture(canvas), renderer)
  const image = new Image()
  image.decoding = 'async'
  image.onload = () => {
    drawIntegratedArtwork(context, image, paper)
    texture.needsUpdate = true
    onUpdate?.()
  }
  image.src = project.coverSource

  return texture
}

function createSpineTexture(project, renderer) {
  const canvas = makeCanvas(SPINE_WIDTH, SPINE_HEIGHT)
  const context = canvas.getContext('2d')
  const { paper, ink, accent } = project.coverPalette

  context.fillStyle = paper
  context.fillRect(0, 0, SPINE_WIDTH, SPINE_HEIGHT)
  addPaperTexture(context, SPINE_WIDTH, SPINE_HEIGHT, ink, accent)

  context.save()
  context.globalAlpha = 0.34
  context.fillStyle = accent
  context.fillRect(0, 78, SPINE_WIDTH, 31)
  context.fillRect(0, 2312, SPINE_WIDTH, 34)
  context.globalAlpha = 0.13
  context.fillRect(0, 65, SPINE_WIDTH, 12)
  context.fillRect(0, 2347, SPINE_WIDTH, 10)
  context.restore()

  context.textAlign = 'center'
  context.textBaseline = 'top'
  context.fillStyle = ink
  context.font = `500 108px ${CHINESE_DISPLAY_FONT}`
  drawVerticalText(context, project.spineText.chinese, SPINE_WIDTH / 2, 214, 168)

  context.save()
  context.translate(SPINE_WIDTH / 2, 890)
  context.rotate(Math.PI / 2)
  context.textAlign = 'left'
  context.textBaseline = 'middle'
  context.font = `500 38px ${LATIN_FONT}`
  drawTrackedText(context, project.spineText.english, 0, 0, 7)
  context.restore()

  context.fillStyle = accent
  context.fillRect(158, 2015, 104, 2)
  context.fillRect(158, 2126, 104, 2)
  context.fillStyle = ink
  context.font = `42px ${LATIN_FONT}`
  context.fillText('01', SPINE_WIDTH / 2, 2050)

  context.font = `17px ${LATIN_FONT}`
  drawTrackedText(context, 'GARDEN', SPINE_WIDTH / 2, 2180, 4)
  drawTrackedText(context, 'ARCHITECTURE', SPINE_WIDTH / 2, 2210, 3)
  drawTrackedText(context, 'DESIGN', SPINE_WIDTH / 2, 2240, 4)

  return configureTexture(new THREE.CanvasTexture(canvas), renderer)
}

export function createBookCoverTextures(project, renderer, onUpdate) {
  if (!project.coverSource || !project.coverPalette || !project.spineText) return null

  return {
    cover: createFrontCoverTexture(project, renderer, onUpdate),
    spine: createSpineTexture(project, renderer),
  }
}
