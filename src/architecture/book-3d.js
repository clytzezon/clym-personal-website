import * as THREE from 'three'
import { createBookCoverTextures } from './book-cover-textures.js'

function shadeColor(color, amount) {
  const source = new THREE.Color(color)
  source.offsetHSL(0, 0, amount)
  return source
}

export function createBook3D(project, renderer, { bookIndex = null, onTextureUpdate } = {}) {
  const { width, height, depth } = project.dimensions
  const root = new THREE.Group()
  const geometry = new THREE.BoxGeometry(width, height, depth)
  const bookTextures = createBookCoverTextures(project, renderer, onTextureUpdate)
  const materials = [
    new THREE.MeshStandardMaterial({ color: shadeColor(project.color, 0.04), roughness: 0.82 }),
    new THREE.MeshStandardMaterial({
      color: bookTextures ? '#ffffff' : shadeColor(project.color, -0.09),
      map: bookTextures?.spine ?? null,
      roughness: 0.92,
    }),
    new THREE.MeshStandardMaterial({ color: shadeColor(project.color, 0.08), roughness: 0.8 }),
    new THREE.MeshStandardMaterial({ color: shadeColor(project.color, -0.12), roughness: 0.9 }),
    new THREE.MeshStandardMaterial({
      color: bookTextures ? '#ffffff' : project.color,
      map: bookTextures?.cover ?? null,
      roughness: 0.9,
    }),
    new THREE.MeshStandardMaterial({ color: shadeColor(project.color, -0.04), roughness: 0.84 }),
  ]
  const mesh = new THREE.Mesh(geometry, materials)

  mesh.position.set(width / 2, height / 2, -depth / 2)
  mesh.castShadow = true
  mesh.receiveShadow = true
  if (bookIndex !== null) mesh.userData.bookIndex = bookIndex
  root.add(mesh)

  return {
    project,
    dimensions: project.dimensions,
    root,
    mesh,
    geometry,
    materials,
    textures: bookTextures ? Object.values(bookTextures) : [],
    dispose() {
      geometry.dispose()
      materials.forEach((material) => material.dispose())
      if (bookTextures) Object.values(bookTextures).forEach((texture) => texture.dispose())
    },
  }
}
