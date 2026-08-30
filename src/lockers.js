const LOCKERS = [
  { number: '101', tilt: -20 },
  { number: '102', tilt: -8, mine: true },
  { number: '103', tilt: 4 },
  { number: '104', tilt: 12 },
  { number: '105', tilt: 20 },
]

function faces() {
  return `
    <div class="face face--left metal"></div>
    <div class="face face--right metal"></div>
    <div class="face face--top metal"></div>
    <div class="face face--bottom metal"></div>
  `
}

function outerDoor(number, mine) {
  return `
    <div class="door-outer metal">
      <div class="vents" aria-hidden="true"></div>
      <div class="number-plate">${number}</div>
      <div class="handle" aria-hidden="true"><span></span></div>
      ${mine ? outerStickers() : '<div class="scuff" aria-hidden="true"></div>'}
    </div>
  `
}

function outerStickers() {
  return `
    <div class="sticker sticker--star" aria-hidden="true">★</div>
    <div class="sticker sticker--round" aria-hidden="true">별</div>
    <div class="sticker sticker--tape" aria-hidden="true"></div>
    <div class="sticker sticker--photo" aria-hidden="true"></div>
    <div class="sticker sticker--heart" aria-hidden="true">♡</div>
    <div class="sticker sticker--name" aria-hidden="true">mine</div>
  `
}

function innerDoor() {
  return `
    <div class="door-inner">
      <div class="polaroid polaroid--one" aria-hidden="true">
        <div class="polaroid__img polaroid__img--sky"></div>
      </div>
      <div class="polaroid polaroid--two" aria-hidden="true">
        <div class="polaroid__img polaroid__img--room"></div>
      </div>
      <div class="memo" aria-hidden="true">studio pin-up<br />don’t forget</div>
      <div class="cartoon cartoon--sun" aria-hidden="true">☼</div>
      <div class="cartoon cartoon--blob" aria-hidden="true"></div>
      <div class="washi" aria-hidden="true"></div>
    </div>
  `
}

function interior() {
  return `
    <div class="cavity">
      <div class="cavity-back"></div>
      <div class="shelf" aria-hidden="true"></div>
      <button type="button" class="object object--id" data-object="id" aria-label="Student ID, resume and about">
        <span class="id-mini">
          <span class="id-mini__photo"></span>
          <span class="id-mini__lines">
            <span></span><span></span>
          </span>
        </span>
        <span class="object-label">ID</span>
      </button>
      <button type="button" class="object object--model" data-object="architecture" aria-label="Architecture model">
        <span class="model">
          <span class="model__base"></span>
          <span class="model__a"></span>
          <span class="model__b"></span>
          <span class="model__roof"></span>
        </span>
        <span class="object-label">Architecture</span>
      </button>
      <button type="button" class="object object--art" data-object="art" aria-label="Art and crafts supplies">
        <span class="cup">
          <span class="brush brush--a"></span>
          <span class="brush brush--b"></span>
          <span class="pencil"></span>
        </span>
        <span class="object-label">Art</span>
      </button>
      <button type="button" class="object object--camera" data-object="photo" aria-label="Camera, photography">
        <span class="camera">
          <span class="camera__body"></span>
          <span class="camera__lens"></span>
          <span class="camera__flash"></span>
        </span>
        <span class="object-label">Photo</span>
      </button>
    </div>
  `
}

function lockerMarkup(locker) {
  const mineClass = locker.mine ? ' locker--mine' : ''
  const doorInner = locker.mine ? innerDoor() : ''
  const cavity = locker.mine ? interior() : ''

  return `
    <article class="locker${mineClass}" data-number="${locker.number}" style="--tilt: ${locker.tilt}deg">
      <div class="locker-cube">
        ${faces()}
        ${cavity}
        <div class="face face--front">
          <div class="locker-door">
            ${outerDoor(locker.number, locker.mine)}
            ${doorInner}
          </div>
        </div>
      </div>
    </article>
  `
}

export function renderLockers(row) {
  row.innerHTML = LOCKERS.map(lockerMarkup).join('')
}
