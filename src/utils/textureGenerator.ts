import * as THREE from 'three';

/**
 * Procedural normal map generator for carbon fiber and metallic paint flakes.
 * These run in JavaScript at load time, creating high-quality, seamless,
 * lightweight textures without requiring external files.
 */

// Generates a seamless carbon fiber weave normal map
export function createCarbonWeaveTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Fill with base flat normal: (128, 128, 255)
  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, size, size);

  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  // Weave parameters
  const weaveScale = 8; // Size of weave cell
  const depth = 45;    // Normal map depth (perturbation strength)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Twill weave formula: diagonal pattern
      // Determine warp vs weft threads
      // A typical 2x2 twill pattern can be approximated by diagonal phase
      const phase = (x + y) % (weaveScale * 2) < weaveScale;
      const angle = phase ? Math.PI / 4 : -Math.PI / 4;

      // Calculate thread surface normal
      // Threads are curved, so we use a sine wave shape across the thread width
      const threadPos = (phase ? (x - y) : (x + y)) % weaveScale;
      const t = threadPos / weaveScale - 0.5; // range [-0.5, 0.5]
      
      // Calculate normal offset based on thread curvature (sine wave profile)
      const nx = Math.sin(t * Math.PI) * Math.cos(angle) * (depth / 255);
      const ny = Math.sin(t * Math.PI) * Math.sin(angle) * (depth / 255);
      
      // Add cross-thread fine grain details to simulate fiber strands
      const fiberStrand = Math.sin(((phase ? (x + y) : (x - y)) * 1.5) * Math.PI) * 0.05;
      
      const finalNx = nx + (phase ? fiberStrand : -fiberStrand);
      const finalNy = ny + (phase ? -fiberStrand : fiberStrand);
      const finalNz = Math.sqrt(Math.max(0, 1 - finalNx * finalNx - finalNy * finalNy));

      // Map normal [-1, 1] to RGB [0, 255]
      data[idx] = Math.floor((finalNx + 1) * 127.5);     // R (X)
      data[idx + 1] = Math.floor((finalNy + 1) * 127.5); // G (Y)
      data[idx + 2] = Math.floor((finalNz + 1) * 127.5); // B (Z)
      data[idx + 3] = 255;                               // A
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(40, 40); // Standard high frequency repeat
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  
  return texture;
}

// Generates a seamless metal flake normal map for automotive paint
export function createMetalFlakeTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, size, size);

  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  // Perturb normals slightly at each pixel to simulate micro-flakes pointing in random directions
  const flakeStrength = 0.15; // Flake reflection variance

  for (let i = 0; i < data.length; i += 4) {
    const nx = (Math.random() - 0.5) * flakeStrength;
    const ny = (Math.random() - 0.5) * flakeStrength;
    const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));

    data[i] = Math.floor((nx + 1) * 127.5);     // R (X)
    data[i + 1] = Math.floor((ny + 1) * 127.5); // G (Y)
    data[i + 2] = Math.floor((nz + 1) * 127.5); // B (Z)
    data[i + 3] = 255;                          // A
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(120, 120); // Very fine noise frequency
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;

  return texture;
}
