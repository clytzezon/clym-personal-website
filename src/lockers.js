import polaroidCamera from './assets/locker-processed/polaroid-camera-polished.png'
import artSupplies from './assets/locker-processed/art-supplies-polished.png'
import backpack from './assets/locker-processed/backpack-polished.png'
import books from './assets/locker-processed/books-polished.png'
import cdPlayer from './assets/locker-processed/cd-player-polished.png'
import idCard from './assets/locker-processed/id-card-polished.png'
import poster from './assets/locker-originals/poster.png'

const COLUMNS = [
  {
    top: { number: '101', decor: 'a' },
    bottom: { number: '106', decor: 'b' },
  },
  {
    top: { number: '102', mine: true, decor: 'mine' },
    bottom: { number: '107', decor: 'c' },
  },
  {
    top: { number: '103', decor: 'd' },
    bottom: { number: '108', decor: 'a' },
  },
  {
    top: { number: '104', decor: 'b' },
    bottom: { number: '109', decor: 'd' },
  },
  {
    top: { number: '105', decor: 'c' },
    bottom: { number: '110', decor: 'a' },
  },
]

const INTERIOR_OBJECTS = [
  {
    id: 'architecture',
    asset: books,
    className: 'object--books',
    label: 'Architecture',
    ariaLabel: 'Books, architecture',
  },
  {
    id: 'art',
    asset: artSupplies,
    className: 'object--art',
    label: 'Art / Crafts',
    ariaLabel: 'Art and crafts supplies',
  },
  {
    id: 'photo',
    asset: polaroidCamera,
    className: 'object--camera',
    label: 'Photography',
    ariaLabel: 'Polaroid camera, photography',
  },
]

const SUPPORTING_OBJECTS = [
  { asset: poster, className: 'asset--poster' },
  { asset: backpack, className: 'asset--backpack' },
]

const DOOR_OBJECTS = [
  {
    id: 'id',
    asset: idCard,
    className: 'object--id',
    label: 'About',
    ariaLabel: 'Student ID, resume and about',
  },
  {
    id: 'music',
    asset: cdPlayer,
    className: 'object--music',
    label: 'Music',
    ariaLabel: 'CD player, music',
  },
]

function clickableObject({ id, asset, className, label, ariaLabel }) {
  return `
    <button type="button" class="object ${className}" data-object="${id}" aria-label="${ariaLabel}">
      <img class="object__image" src="${asset}" alt="" draggable="false" />
      <span class="object-label">${label}</span>
    </button>
  `
}

function supportingObject({ asset, className }) {
  return `
    <div class="locker-asset ${className}" aria-hidden="true">
      <img src="${asset}" alt="" draggable="false" />
    </div>
  `
}

function vents() {
  return `
    <div class="vents vents--top" aria-hidden="true"></div>
    <div class="vents vents--bottom" aria-hidden="true"></div>
  `
}

function latch() {
  return `
    <div class="latch" aria-hidden="true">
      <span class="latch__plate"></span>
      <span class="latch__slot"></span>
    </div>
  `
}

function hinges() {
  return `
    <div class="hinge hinge--top" aria-hidden="true"></div>
    <div class="hinge hinge--mid" aria-hidden="true"></div>
    <div class="hinge hinge--bottom" aria-hidden="true"></div>
  `
}

function outerDecor(kind) {
  if (kind === 'mine') {
    return `
      <div class="deco deco--polaroid deco--mine-1" aria-hidden="true">
        <span class="deco-photo deco-photo--fog"></span>
      </div>
      <div class="deco deco--tape deco--mine-2" aria-hidden="true"></div>
      <div class="deco deco--print deco--mine-3" aria-hidden="true"></div>
      <div class="deco deco--stamp deco--mine-4" aria-hidden="true">SEOUL</div>
      <div class="deco deco--strip deco--mine-5" aria-hidden="true"></div>
      <div class="deco deco--label deco--mine-6" aria-hidden="true">studio</div>
    `
  }
  if (kind === 'a') {
    return `
      <div class="deco deco--tape deco--a1" aria-hidden="true"></div>
      <div class="deco deco--print deco--a2" aria-hidden="true"></div>
    `
  }
  if (kind === 'b') {
    return `
      <div class="deco deco--polaroid deco--b1" aria-hidden="true">
        <span class="deco-photo deco-photo--warm"></span>
      </div>
      <div class="deco deco--label deco--b2" aria-hidden="true">keep</div>
    `
  }
  if (kind === 'c') {
    return `
      <div class="deco deco--stamp deco--c1" aria-hidden="true">’24</div>
      <div class="deco deco--tape deco--c2" aria-hidden="true"></div>
      <div class="deco deco--print deco--c3" aria-hidden="true"></div>
    `
  }
  return `
    <div class="deco deco--polaroid deco--d1" aria-hidden="true">
      <span class="deco-photo deco-photo--cool"></span>
    </div>
    <div class="deco deco--strip deco--d2" aria-hidden="true"></div>
  `
}

function innerDoor() {
  return `
    <div class="door-face door-face--back">
      <div class="door-liner">
        <div class="deco deco--polaroid deco--in-1" aria-hidden="true">
          <span class="deco-photo deco-photo--fog"></span>
        </div>
        <div class="deco deco--polaroid deco--in-2" aria-hidden="true">
          <span class="deco-photo deco-photo--warm"></span>
        </div>
        ${DOOR_OBJECTS.map(clickableObject).join('')}
      </div>
    </div>
  `
}

function interior() {
  return `
    <div class="cavity">
      <div class="room">
        <div class="wall wall--ceil"></div>
        <div class="wall wall--left"></div>
        <div class="wall wall--right"></div>
        <div class="wall wall--back"></div>
        <div class="wall wall--floor"></div>
        ${SUPPORTING_OBJECTS.map(supportingObject).join('')}
        <div class="shelf">
          <div class="shelf-top"></div>
          <div class="shelf-front"></div>
        </div>
        ${INTERIOR_OBJECTS.map(clickableObject).join('')}
      </div>
    </div>
  `
}

function compartmentMarkup(spec) {
  const mine = spec.mine ? ' locker--mine' : ''
  return `
    <article class="compartment${mine}" data-number="${spec.number}">
      <div class="recess">
        ${spec.mine ? interior() : ''}
        ${hinges()}
        <div class="locker-door">
          <div class="door-slab">
            <div class="door-face door-face--front metal">
              ${vents()}
              <div class="number-plate">${spec.number}</div>
              ${latch()}
              ${outerDecor(spec.decor)}
            </div>
            ${spec.mine ? innerDoor() : '<div class="door-face door-face--back door-liner"></div>'}
            <div class="door-face door-face--edge"></div>
          </div>
        </div>
      </div>
    </article>
  `
}

function columnMarkup(column) {
  return `
    <div class="column">
      ${compartmentMarkup(column.top)}
      ${compartmentMarkup(column.bottom)}
    </div>
  `
}

export function renderLockers(root) {
  root.innerHTML = `
    <div class="locker-bank">
      <div class="bank-thickness" aria-hidden="true"></div>
      <div class="bank-front metal">
        <div class="bank-grid">
          ${COLUMNS.map(columnMarkup).join('')}
        </div>
      </div>
    </div>
  `
}
