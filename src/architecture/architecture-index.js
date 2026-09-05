import './architecture.css'
import { architectureProjects } from '../data/architecture-projects.js'
import { createBookshelfScene } from './bookshelf-scene.js'

export function createArchitectureIndex({ root, onProjectSelect = () => {} }) {
  const container = root?.querySelector('[data-architecture-bookshelf]')
  const selection = root?.querySelector('[data-architecture-selection]')
  let scene = null

  function updateSelection(project, selected = false) {
    if (!selection) return
    if (!project) {
      selection.textContent = 'Hover a spine to open a project.'
      return
    }

    if (!project.interactive) {
      selection.textContent = 'Decorative archive volume.'
      return
    }

    selection.textContent = selected
      ? `${project.title} selected · ${project.id}`
      : `${project.title} · ${project.year}`
  }

  return {
    mount() {
      if (scene || !container) return
      scene = createBookshelfScene({
        container,
        projects: architectureProjects,
        onFocus: (project) => updateSelection(project),
        onSelect(project) {
          if (!project.interactive) return
          updateSelection(project, true)
          onProjectSelect(project.id)
        },
      })
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
    },
  }
}
