import './architecture-detail.css'
import { architectureProjects } from '../data/architecture-projects.js'
import { createBookDetailScene } from './book-detail-scene.js'

function setText(root, selector, value) {
  const element = root.querySelector(selector)
  if (element) element.textContent = value ?? ''
}

function renderProjectContent(root, project) {
  const view = root.querySelector('.book-detail-view')
  if (view) view.dataset.projectTheme = project.detailTheme ?? 'default'

  setText(root, '[data-detail-kicker]', `ARCHITECTURE · BOOK ${project.bookNumber}`)
  setText(root, '[data-detail-chinese-title]', project.chineseTitle)
  setText(root, '[data-detail-subtitle]', project.subtitle)
  setText(root, '[data-detail-english-title]', project.englishTitle)
  setText(root, '[data-detail-period]', project.period)
  setText(root, '[data-detail-design-type]', project.designType)
  setText(root, '[data-detail-area]', project.area)
  setText(root, '[data-detail-work-type]', project.workType)
  setText(root, '[data-detail-contribution]', project.personalContribution.join(' / '))
  setText(root, '[data-detail-instructor]', project.instructor)

  const areaRow = root.querySelector('[data-detail-area-row]')
  if (areaRow) areaRow.hidden = !project.area

  const description = root.querySelector('[data-detail-description]')
  if (description) {
    description.replaceChildren(
      ...project.description.map((paragraph) => {
        const element = document.createElement('p')
        element.textContent = paragraph
        return element
      }),
    )
  }
}

export function createArchitectureDetail({ root }) {
  const stage = root?.querySelector('[data-book-detail-stage]')
  let scene = null
  let activeProject = null

  return {
    prepare(projectId) {
      const project = architectureProjects.find((candidate) => candidate.id === projectId)
      if (!project?.detailEnabled || !stage) return false

      if (activeProject?.id !== project.id) {
        scene?.destroy()
        activeProject = project
        renderProjectContent(root, project)
        scene = createBookDetailScene({ container: stage, project })
      }

      scene.restartEntry()
      return true
    },
    pause() {
      scene?.pause()
    },
    resume() {
      scene?.resume()
    },
    destroy() {
      scene?.destroy()
      scene = null
      activeProject = null
    },
    get project() {
      return activeProject
    },
  }
}
