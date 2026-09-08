import './architecture-full.css'
import xiyuanIndexSpread from '../assets/architecture/xiyuan/full-project/xiyuan-index-spread.png'
import xiyuanMasterPerspective from '../assets/architecture/xiyuan/full-project/xiyuan-master-perspective.png'
import xiyuanFiveScenesAnalysis from '../assets/architecture/xiyuan/full-project/xiyuan-five-scenes-analysis.png'
import xiyuanMasterplan from '../assets/architecture/xiyuan/full-project/xiyuan-masterplan.png'
import groundFloorPlan from '../assets/architecture/xiyuan/full-project/ground-floor-plan.png'
import section01 from '../assets/architecture/xiyuan/full-project/section-01.png'
import buildingCaomu from '../assets/architecture/xiyuan/full-project/building-caomu-fullpage.png'
import buildingBajiao from '../assets/architecture/xiyuan/full-project/building-bajiao-fullpage.png'
import scene01 from '../assets/architecture/xiyuan/full-project/scenes/scene-01.jpg'
import scene02 from '../assets/architecture/xiyuan/full-project/scenes/scene-02.jpg'
import scene03 from '../assets/architecture/xiyuan/full-project/scenes/scene-03.jpg'
import scene04 from '../assets/architecture/xiyuan/full-project/scenes/scene-04.jpg'
import scene05 from '../assets/architecture/xiyuan/full-project/scenes/scene-05.jpg'
import scene06 from '../assets/architecture/xiyuan/full-project/scenes/scene-06.jpg'

const scenes = [
  { src: scene01, width: 2177, height: 5120, name: '集会' },
  { src: scene02, width: 2177, height: 5120, name: '观书' },
  { src: scene03, width: 2177, height: 5120, name: '拨阮' },
  { src: scene04, width: 2177, height: 5120, name: '作画' },
  { src: scene05, width: 2435, height: 5727, name: '题石' },
  { src: scene06, width: 2177, height: 5120, name: '论禅' },
]

const chapters = [
  {
    id: 'six-realms',
    number: '01',
    title: '六境',
    english: 'SIX REALMS',
    scenes: true,
    plates: [
      {
        src: xiyuanMasterPerspective,
        width: 3508,
        height: 2480,
        alt: '西园集序园林建筑总体鸟瞰手绘透视图',
      },
    ],
  },
  {
    id: 'origin',
    number: '02',
    title: '缘起',
    english: 'ORIGIN',
    plates: [
      { src: xiyuanFiveScenesAnalysis, width: 3508, height: 2480, alt: '西园集序五场景空间分析完整图版' },
    ],
  },
  {
    id: 'seeking-meaning',
    number: '03',
    title: '寻意',
    english: 'SEEKING MEANING',
    plates: [
      {
        src: xiyuanMasterplan,
        width: 1717,
        height: 2150,
        alt: '西园集序园林建筑总平面图',
        label: 'MASTERPLAN · 总平面图',
        modifier: 'full-project-plate--portrait full-project-plate--technical',
        highResolution: true,
      },
    ],
  },
  {
    id: 'making-the-garden',
    number: '04',
    title: '营园',
    english: 'MAKING THE GARDEN',
    plates: [
      {
        src: groundFloorPlan,
        width: 3352,
        height: 2480,
        alt: '西园集序园林建筑首层平面图',
        label: 'GROUND FLOOR PLAN · 首层平面图',
        modifier: 'full-project-plate--technical',
        highResolution: true,
      },
      {
        src: section01,
        width: 3287,
        height: 845,
        alt: '西园集序园林建筑剖面图',
        label: 'SECTION 01 · 建筑剖面图',
        modifier: 'full-project-plate--technical full-project-plate--section',
        highResolution: true,
      },
    ],
  },
  {
    id: 'fine-building',
    number: '05',
    title: '精筑',
    english: 'ARCHITECTURAL DETAILS',
    plates: [
      { src: buildingCaomu, width: 3508, height: 2480, alt: '西园集序草木建筑设计完整图版' },
      { src: buildingBajiao, width: 3508, height: 2480, alt: '西园集序芭蕉建筑设计完整图版' },
    ],
  },
]

function scenesMarkup() {
  return `
    <div class="full-project-scenes" aria-label="西园集序六境场景">
      ${[scenes.slice(0, 3), scenes.slice(3)].map((group, groupIndex) => `
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

function plateMarkup(plate) {
  const image = `<img src="${plate.src}" width="${plate.width}" height="${plate.height}" alt="${plate.alt}" loading="lazy" decoding="async">`
  const visual = plate.highResolution
    ? `<a href="${plate.src}" target="_blank" rel="noopener" aria-label="打开${plate.alt}高分辨率原图">${image}<span class="full-project-high-res">OPEN HIGH-RES ↗</span></a>`
    : image

  return `
    <figure class="full-project-plate full-project-reveal ${plate.modifier ?? ''}">
      ${plate.label ? `<figcaption>${plate.label}</figcaption>` : ''}
      ${visual}
    </figure>
  `
}

function chapterMarkup(chapter) {
  return `
    <section class="full-project-chapter" id="${chapter.id}" data-full-project-chapter>
      <header class="full-project-chapter__header full-project-reveal">
        <span>${chapter.number}</span>
        <div><h2>${chapter.title}</h2><p>${chapter.english}</p></div>
      </header>
      ${chapter.scenes ? scenesMarkup() : ''}
      ${chapter.plates.map(plateMarkup).join('')}
    </section>
  `
}

function renderProject(container, project) {
  container.innerHTML = `
    <article class="full-project-publication">
      <header class="full-project-opening">
        <p class="full-project-opening__kicker">ARCHITECTURE · BOOK 01</p>
        <h1>${project.chineseTitle}</h1>
        <p class="full-project-opening__subtitle">${project.subtitle ?? ''}</p>
        <p class="full-project-opening__english">${project.englishTitle}</p>
        <p class="full-project-opening__meta">GARDEN ARCHITECTURE DESIGN · COURSE PROJECT</p>
      </header>

      <figure class="full-project-opening-spread full-project-reveal">
        <img src="${xiyuanIndexSpread}" width="3508" height="2480" alt="西园集序项目目录与六境概览完整跨页" loading="eager" fetchpriority="high" decoding="async">
      </figure>

      <div class="full-project-body">
        <nav class="full-project-rail" aria-label="项目章节">
          <p>CONTENTS</p>
          <ol>
            ${chapters.map((chapter, index) => `
              <li><a href="#${chapter.id}" data-chapter-link="${chapter.id}" ${index === 0 ? 'class="is-active" aria-current="true"' : ''}>
                <span>${chapter.number}</span>${chapter.title}
              </a></li>
            `).join('')}
          </ol>
        </nav>
        <div class="full-project-chapters">
          ${chapters.map(chapterMarkup).join('')}
          <footer class="full-project-ending full-project-reveal">
            <span>西园集序</span>
            <p>END OF BOOK 01</p>
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
  let chapterObserver = null
  let revealObserver = null

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
      if (!project?.fullProjectEnabled || !scroller || !content) return false
      if (renderedProjectId !== project.id) {
        renderProject(content, project)
        renderedProjectId = project.id
      }
      return true
    },
    activate() {
      if (!renderedProjectId) return
      scroller.scrollTop = 0
      setActiveChapter(chapters[0].id)
      requestAnimationFrame(startObservers)
    },
    pause() {
      stopObservers()
    },
    destroy() {
      stopObservers()
      scroller?.removeEventListener('click', onClick)
      content?.replaceChildren()
      renderedProjectId = null
    },
  }
}
