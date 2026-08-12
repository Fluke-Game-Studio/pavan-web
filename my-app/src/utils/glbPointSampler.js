import * as THREE from 'three';
import { DRACOLoader, GLTFLoader, MeshSurfaceSampler } from 'three-stdlib';

let sharedLoader = null;

function getLoader() {
  if (!sharedLoader) {
    sharedLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    sharedLoader.setDRACOLoader(dracoLoader);
  }
  return sharedLoader;
}

// Bakes a mesh's vertices into world space, applying skinning (rest pose) and
// morph targets via getVertexPosition, so rigged models sample as rendered.
function bakeWorldGeometry(mesh) {
  const source = mesh.geometry;
  const count = source.getAttribute('position').count;
  const baked = new Float32Array(count * 3);
  const vertex = new THREE.Vector3();

  if (mesh.isSkinnedMesh) {
    mesh.skeleton.update();
  }

  for (let i = 0; i < count; i += 1) {
    mesh.getVertexPosition(i, vertex);
    vertex.applyMatrix4(mesh.matrixWorld);
    baked[i * 3] = vertex.x;
    baked[i * 3 + 1] = vertex.y;
    baked[i * 3 + 2] = vertex.z;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(baked, 3));
  if (source.index) geometry.setIndex(source.index);
  return geometry;
}

// Weights each vertex by inverse triangle area^bias so densely-modeled regions
// (face, hands, ornaments) attract proportionally more sample points than big
// flat surfaces. bias 0 = pure area sampling, 1 = uniform per triangle.
function addDensityWeights(geometry, bias) {
  const pos = geometry.getAttribute('position');
  const index = geometry.index;
  const triCount = Math.floor((index ? index.count : pos.count) / 3);
  const weights = new Float32Array(pos.count);
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const ab = new THREE.Vector3();
  const ac = new THREE.Vector3();

  for (let t = 0; t < triCount; t += 1) {
    const i0 = index ? index.getX(t * 3) : t * 3;
    const i1 = index ? index.getX(t * 3 + 1) : t * 3 + 1;
    const i2 = index ? index.getX(t * 3 + 2) : t * 3 + 2;
    a.fromBufferAttribute(pos, i0);
    b.fromBufferAttribute(pos, i1);
    c.fromBufferAttribute(pos, i2);
    ab.subVectors(b, a);
    ac.subVectors(c, a);
    const area = ab.cross(ac).length() * 0.5;
    const w = Math.pow(1 / Math.max(area, 1e-8), bias);
    weights[i0] = Math.max(weights[i0], w);
    weights[i1] = Math.max(weights[i1], w);
    weights[i2] = Math.max(weights[i2], w);
  }

  geometry.setAttribute('sampleWeight', new THREE.BufferAttribute(weights, 1));
}

// Total surface area of a geometry — used to distribute samples across
// sub-meshes proportionally to their size, not their vertex density
function computeSurfaceArea(geometry) {
  const pos = geometry.getAttribute('position');
  const index = geometry.index;
  const triCount = Math.floor((index ? index.count : pos.count) / 3);
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const ab = new THREE.Vector3();
  const ac = new THREE.Vector3();
  let area = 0;

  for (let t = 0; t < triCount; t += 1) {
    const i0 = index ? index.getX(t * 3) : t * 3;
    const i1 = index ? index.getX(t * 3 + 1) : t * 3 + 1;
    const i2 = index ? index.getX(t * 3 + 2) : t * 3 + 2;
    a.fromBufferAttribute(pos, i0);
    b.fromBufferAttribute(pos, i1);
    c.fromBufferAttribute(pos, i2);
    ab.subVectors(b, a);
    ac.subVectors(c, a);
    area += ab.cross(ac).length() * 0.5;
  }

  return area;
}

function sampleScenePoints(root, count, size, { detailBias = 0 } = {}) {
  const meshes = [];
  root.traverse((child) => {
    if (child.isMesh && child.geometry) {
      meshes.push(child);
    }
  });

  if (!meshes.length) {
    throw new Error('No mesh geometry found in the model.');
  }

  root.updateWorldMatrix(true, true);

  const bounds = new THREE.Box3();
  const weightedMeshes = meshes.map((mesh) => {
    const geometry = bakeWorldGeometry(mesh);
    geometry.computeBoundingBox();
    bounds.union(geometry.boundingBox);

    const sampler = new MeshSurfaceSampler(new THREE.Mesh(geometry));
    if (detailBias > 0) {
      addDensityWeights(geometry, detailBias);
      sampler.setWeightAttribute('sampleWeight');
    }

    return {
      sampler: sampler.build(),
      // Weight by surface area, not vertex count — otherwise densely-modeled
      // sub-meshes (e.g. a character's face) hog most of the points
      weight: Math.max(1e-8, computeSurfaceArea(geometry)),
    };
  });

  const center = bounds.getCenter(new THREE.Vector3());
  const dimensions = bounds.getSize(new THREE.Vector3());
  const maxDimension = Math.max(dimensions.x, dimensions.y, dimensions.z, 1e-6);
  const scale = size / maxDimension;

  const totalWeight = weightedMeshes.reduce((sum, item) => sum + item.weight, 0);
  const points = new Float32Array(count * 3);
  const samplePosition = new THREE.Vector3();
  const sampleNormal = new THREE.Vector3();

  for (let i = 0; i < count; i += 1) {
    let chosen = weightedMeshes[0];
    let pick = Math.random() * totalWeight;

    for (let j = 0; j < weightedMeshes.length; j += 1) {
      pick -= weightedMeshes[j].weight;
      if (pick <= 0) {
        chosen = weightedMeshes[j];
        break;
      }
    }

    chosen.sampler.sample(samplePosition, sampleNormal);
    samplePosition.sub(center).multiplyScalar(scale);

    points[i * 3] = samplePosition.x;
    points[i * 3 + 1] = samplePosition.y;
    points[i * 3 + 2] = samplePosition.z;
  }

  return points;
}

/**
 * Loads a GLB/GLTF from a URL and returns a centered, size-normalized
 * Float32Array of `count * 3` surface-sampled point positions.
 * Supports static, Draco-compressed, and skinned (rigged) meshes.
 * options.detailBias (0..1) skews sampling toward densely-modeled regions.
 */
export function loadGlbPoints(url, count, size, options = {}) {
  return new Promise((resolve, reject) => {
    getLoader().load(
      url,
      (gltf) => {
        try {
          resolve(sampleScenePoints(gltf.scene, count, size, options));
        } catch (error) {
          reject(error);
        }
      },
      undefined,
      reject,
    );
  });
}
