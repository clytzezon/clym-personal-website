import './architecture-full.css'
import { fullProjectConfigs } from './architecture-full-projects.js'

function imageTag(block) {
  const loading = block.eager ? 'eager' : 'lazy'
  const priority = block.eager ? ' fetchpriority="high"' : ''
  return `<img src="${block.src}" width="${block.width}" height="${block.height}" alt="${block.alt}" loading="${loading}"${priority} decoding="async">`
}

function imageMarkup(block) {
  const image = imageTag(block)
  const visual = block.highResolution
    ? `<a href="${block.src}" target="_blank" rel="noopener" aria-label="打开${block.alt}高分辨率原图">${image}<span class="full-project-high-res">OPEN HIGH-RES ↗</span></a>`
    : image

  return `
    <figure class="full-project-plate full-project-reveal ${block.modifier ?? ''}">
      ${block.label ? `<figcaption>${block.label}</figcaption>` : ''}
      ${visual}
    </figure>
  `
}

function horizontalImageMarkup(block) {
  return `
    <figure class="full-project-horizontal full-project-reveal">
      <figcaption>
        <span>${block.label ?? ''}</span>
        ${block.scrollCue ? '<span class="full-project-horizontal__cue">SCROLL →</span>' : ''}
      </figcaption>
      <div
        class="full-project-horizontal__viewport"
        data-horizontal-scroll
        tabindex="0"
        role="region"
        aria-label="可水平滚动查看：${block.alt}"
      >
        ${imageTag(block)}
      </div>
    </figure>
  `
}

function scenesMarkup(block) {
  return `
    <div class="full-project-scenes" aria-label="${block.label}">
      ${[block.scenes.slice(0, 3), block.scenes.slice(3)].map((group, groupIndex) => `
        <div class="full-project-scenes__group" aria-label="六境场景第${groupIndex + 1}组">
          ${group.map((scene, index) => `
            <figure class="full-project-scene full-project-reveal" style="--scene-delay: ${index * 120}ms">
              <div class="full-project-scene__image">
                <img src="${scene.src}" width="${scene.width}" height="${scene.height}" alt="西园集序六境场景：${scene.name}" loading="lazy" decoding="async">
              </div>
              <figcaption><span>0${groupIndex * 3 + index + 1}</span>${scene.name}</figcaption>
            </figure>
          `).join('')}
        </div>
      `).join('')}
    </div>
  `
}

function introMarkup(block) {
  return `
    <div class="full-project-intro full-project-reveal">
      ${block.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('')}
    </div>
  `
}

function blockMarkup(block) {
  if (block.type === 'horizontal-image') return horizontalImageMarkup(block)
  if (block.type === 'scene-grid') return scenesMarkup(block)
  if (block.type === 'intro') return introMarkup(block)
  return imageMarkup(block)
}

function chapterMarkup(chapter) {
  return `
    <section class="full-project-chapter" id="${chapter.id}" data-full-project-chapter>
      <header class="full-project-chapter__header full-project-reveal">
        <span>${chapter.number}</span>
        <div><h2>${chapter.title}</h2><p>${chapter.english}</p></div>
      </header>
      ${chapter.blocks.map(blockMarkup).join('')}
    </section>
  `
}

function renderProject(container, project, config) {
  const openingSpread = config.openingSpread
    ? `<figure class="full-project-opening-spread full-project-reveal">${imageTag(config.openingSpread)}</figure>`
    : ''

  container.innerHTML = `
    <article class="full-project-publication full-project-publication--${config.theme}">
      <header class="full-project-opening">
        <p class="full-project-opening__kicker">ARCHITECTURE · BOOK ${project.bookNumber}</p>
        <h1>${project.chineseTitle}</h1>
        <p class="full-project-opening__subtitle">${project.subtitle ?? ''}</p>
        <p class="full-project-opening__english">${project.englishTitle}</p>
        <p class="full-project-opening__meta">${config.headerMeta}</p>
      </header>

      ${openingSpread}

      <div class="full-project-body ${openingSpread ? '' : 'full-project-body--direct'}">
        <nav class="full-project-rail" aria-label="项目章节">
          <p>CONTENTS</p>
          <ol>
            ${config.chapters.map((chapter, index) => `
              <li><a href="#${chapter.id}" data-chapter-link="${chapter.id}" ${index === 0 ? 'class="is-active" aria-current="true"' : ''}>
                <span>${chapter.number}</span>${chapter.title}
              </a></li>
            `).join('')}
          </ol>
        </nav>
        <div class="full-project-chapters">
          ${config.chapters.map(chapterMarkup).join('')}
          <footer class="full-project-ending full-project-reveal">
            <span>${project.chineseTitle}</span>
            <p>END OF BOOK ${project.bookNumber}</p>
          </footer>
        </div>
      </div>
    </article>
  `
}

export function createArchitectureFull({ root }) {
  const scroller = root?.querySelector('[data-full-project-scroll]')
  const content = root?.querySelector('[data-full-project-content]')
  let renderedProjectId = null
  let activeConfig = null
  let chapterObserver = null
  let revealObserver = null
  let horizontalViewports = []

  function setActiveChapter(chapterId) {
    root.querySelectorAll('[data-chapter-link]').forEach((link) => {
      const active = link.dataset.chapterLink === chapterId
      link.classList.toggle('is-active', active)
      if (active) link.setAttribute('aria-current', 'true')
      else link.removeAttribute('aria-current')
    })
  }

  function stopObservers() {
    chapterObserver?.disconnect()
    revealObserver?.disconnect()
    chapterObserver = null
    revealObserver = null
  }

  function startObservers() {
    stopObservers()
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const reveals = root.querySelectorAll('.full-project-reveal')

    if (reducedMotion) {
      reveals.forEach((element) => element.classList.add('is-visible'))
    } else {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          revealObserver.unobserve(entry.target)
        })
      }, { root: scroller, rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
      reveals.forEach((element) => revealObserver.observe(element))
    }

    chapterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveChapter(entry.target.id)
      })
    }, { root: scroller, rootMargin: '-20% 0px -64% 0px', threshold: 0 })
    root.querySelectorAll('[data-full-project-chapter]').forEach((chapter) => {
      chapterObserver.observe(chapter)
    })
  }

  function normalizedDelta(event) {
    if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * 18
    if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * event.currentTarget.clientWidth
    return event.deltaY
  }

  function canScrollHorizontally(viewport, delta) {
    const edgeTolerance = 1
    const maximum = viewport.scrollWidth - viewport.clientWidth
    if (maximum <= edgeTolerance || delta === 0) return false
    if (delta < 0) return viewport.scrollLeft > edgeTolerance
    return viewport.scrollLeft < maximum - edgeTolerance
  }

  function onHorizontalWheel(event) {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
    const delta = normalizedDelta(event)
    if (!canScrollHorizontally(event.currentTarget, delta)) return

    event.preventDefault()
    event.currentTarget.scrollLeft += delta
  }

  function onHorizontalKeydown(event) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    const direction = event.key === 'ArrowLeft' ? -1 : 1
    const distance = Math.min(600, event.currentTarget.clientWidth * 0.72)
    if (!canScrollHorizontally(event.currentTarget, direction)) return

    event.preventDefault()
    event.currentTarget.scrollBy({
      left: direction * distance,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }

  function unbindHorizontalScroll() {
    horizontalViewports.forEach((viewport) => {
      viewport.removeEventListener('wheel', onHorizontalWheel)
      viewport.removeEventListener('keydown', onHorizontalKeydown)
    })
    horizontalViewports = []
  }

  function bindHorizontalScroll() {
    unbindHorizontalScroll()
    horizontalViewports = Array.from(root.querySelectorAll('[data-horizontal-scroll]'))
    horizontalViewports.forEach((viewport) => {
      viewport.addEventListener('wheel', onHorizontalWheel, { passive: false })
      viewport.addEventListener('keydown', onHorizontalKeydown)
    })
  }

  function onClick(event) {
    const link = event.target.closest('[data-chapter-link]')
    if (!link) return
    const chapter = root.querySelector(`#${link.dataset.chapterLink}`)
    if (!chapter) return

    event.preventDefault()
    setActiveChapter(link.dataset.chapterLink)
    chapter.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  scroller?.addEventListener('click', onClick)

  return {
    prepare(project) {
      const config = fullProjectConfigs[project?.fullProjectKey]
      if (!project?.fullProjectEnabled || !config || !scroller || !content) return false
      if (renderedProjectId !== project.id) {
        stopObservers()
        unbindHorizontalScroll()
        renderProject(content, project, config)
        renderedProjectId = project.id
        activeConfig = config
      }
      return true
    },
    activate() {
      if (!renderedProjectId || !activeConfig) return
      scroller.scrollTop = 0
      setActiveChapter(activeConfig.chapters[0].id)
      bindHorizontalScroll()
      requestAnimationFrame(startObservers)
    },
    pause() {
      stopObservers()
      unbindHorizontalScroll()
    },
    destroy() {
      stopObservers()
      unbindHorizontalScroll()
      scroller?.removeEventListener('click', onClick)
      content?.replaceChildren()
      renderedProjectId = null
      activeConfig = null
    },
  }
}
