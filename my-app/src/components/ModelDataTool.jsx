import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { DRACOLoader, GLTFLoader, MeshSurfaceSampler } from 'three-stdlib';
import './ModelDataTool.css';

function sampleModelPoints(root, count, size) {
  const meshes = [];
  root.traverse((child) => {
    if (child.isMesh && child.geometry) {
      meshes.push(child);
    }
  });

  if (!meshes.length) {
    throw new Error('No mesh geometry found in the uploaded model.');
  }

  root.updateWorldMatrix(true, true);

  const bounds = new THREE.Box3().setFromObject(root);
  const center = bounds.getCenter(new THREE.Vector3());
  const dimensions = bounds.getSize(new THREE.Vector3());
  const maxDimension = Math.max(dimensions.x, dimensions.y, dimensions.z, 1);
  const scale = size / maxDimension;

  const weightedMeshes = meshes.map((mesh) => {
    const positionAttr = mesh.geometry.getAttribute('position');
    const weight = positionAttr ? Math.max(1, Math.floor(positionAttr.count / 3)) : 1;

    return {
      mesh,
      sampler: new MeshSurfaceSampler(mesh).build(),
      weight,
    };
  });

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
    samplePosition.applyMatrix4(chosen.mesh.matrixWorld);
    samplePosition.sub(center).multiplyScalar(scale);

    points[i * 3] = samplePosition.x;
    points[i * 3 + 1] = samplePosition.y;
    points[i * 3 + 2] = samplePosition.z;
  }

  return points;
}

function ModelDataTool({ onGeneratedPoints }) {
  const fileInputRef = useRef(null);
  const objectUrlRef = useRef('');
  const loader = useMemo(() => {
    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    gltfLoader.setDRACOLoader(dracoLoader);
    return gltfLoader;
  }, []);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('Upload a GLB/GLTF file to generate point data.');
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [sampleCount, setSampleCount] = useState(7000);
  const [shapeSize, setShapeSize] = useState(14);
  const [output, setOutput] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const clearOutput = () => {
    setOutput('');
    setStatus('Upload a GLB/GLTF file to generate point data.');
    setFileName('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generateFromFile = async (file) => {
    if (!file) return;

    setBusy(true);
    setStatus('Loading model...');
    setOutput('');
    setFileName(file.name);

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;

    try {
      const gltf = await new Promise((resolve, reject) => {
        loader.load(objectUrl, resolve, undefined, reject);
      });

      setStatus('Sampling surface points...');
      const points = sampleModelPoints(gltf.scene, sampleCount, shapeSize);
      const values = Array.from(points);
      const text = `export const GADA_POINTS = new Float32Array([${values.join(',')}]);\n`;

      setOutput(text);
      if (typeof onGeneratedPoints === 'function') {
        onGeneratedPoints(points, text, file.name);
      }
      setStatus(`Done. Generated ${sampleCount.toLocaleString()} points from ${file.name}.`);
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : 'Failed to sample model.');
    } finally {
      setBusy(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      setStatus(`Ready to convert ${file.name}.`);
      setOutput('');
    }
  };

  const handleConvert = () => {
    if (!selectedFile || busy) return;
    void generateFromFile(selectedFile);
  };

  const handleCopy = async () => {
    if (!output) return;

    await navigator.clipboard.writeText(output);
    setStatus('Copied generated data to clipboard.');
  };

  const handleDownload = () => {
    if (!output) return;

    const blob = new Blob([output], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName ? fileName.replace(/\.[^.]+$/, '') : 'gada'}-points.js`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`model-data-tool${open ? ' model-data-tool--open' : ''}`}>
      <button
        type="button"
        className="model-data-tool__toggle"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? 'Close Model Tool' : 'Model Data Tool'}
      </button>

      {open && (
        <div className="model-data-tool__panel">
          <div className="model-data-tool__header">
            <strong>Model Data Tool</strong>
            <span>{status}</span>
          </div>

          <div className="model-data-tool__row">
            <label className="model-data-tool__label">
              Upload model
              <input
                ref={fileInputRef}
                type="file"
                accept=".glb,.gltf"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <div className="model-data-tool__grid">
            <label className="model-data-tool__label">
              Points
              <input
                type="number"
                min="100"
                step="100"
                value={sampleCount}
                onChange={(event) => setSampleCount(Number(event.target.value) || 0)}
              />
            </label>

            <label className="model-data-tool__label">
              Size
              <input
                type="number"
                min="1"
                step="1"
                value={shapeSize}
                onChange={(event) => setShapeSize(Number(event.target.value) || 0)}
              />
            </label>
          </div>

          <div className="model-data-tool__actions">
            <button
              type="button"
              className="model-data-tool__button"
              disabled={busy || !selectedFile}
              onClick={handleConvert}
            >
              Convert
            </button>
            <button
              type="button"
              className="model-data-tool__button"
              disabled={busy || !output}
              onClick={handleCopy}
            >
              Copy
            </button>
            <button
              type="button"
              className="model-data-tool__button"
              disabled={busy || !output}
              onClick={handleDownload}
            >
              Download
            </button>
            <button
              type="button"
              className="model-data-tool__button model-data-tool__button--ghost"
              disabled={busy}
              onClick={clearOutput}
            >
              Reset
            </button>
          </div>

          <textarea
            className="model-data-tool__output"
            readOnly
            value={output}
            placeholder="Generated Float32Array output will appear here."
          />
        </div>
      )}
    </div>
  );
}

export default ModelDataTool;
