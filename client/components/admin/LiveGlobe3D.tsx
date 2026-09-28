'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export interface GlobeMarker {
  lat: number;
  lng: number;
  label: string;
  count: number;
  type: 'visitor' | 'order';
}

export const LiveGlobe3D: React.FC<{ markers?: GlobeMarker[] }> = ({ markers = [] }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 550;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 280;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 4. Main Sphere Geometry
    const sphereRadius = 90;
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, 64, 64);
    
    // Create canvas texture for stylized landmass dots
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#e2f5f5';
      ctx.fillRect(0, 0, 1024, 512);

      // Draw stylized world dot map grid
      ctx.fillStyle = '#14b8a6';
      for (let y = 0; y < 512; y += 8) {
        for (let x = 0; x < 1024; x += 8) {
          const lat = (y / 512) * Math.PI - Math.PI / 2;
          const lon = (x / 1024) * Math.PI * 2 - Math.PI;
          
          const isLand =
            (lon > -2.5 && lon < -0.5 && lat > -0.5 && lat < 1.0) || // Americas
            (lon > -0.2 && lon < 1.8 && lat > -0.6 && lat < 1.2) ||  // Eurasia/Africa
            (lon > 1.9 && lon < 2.7 && lat > -0.8 && lat < -0.1);    // Australia

          if (isLand && Math.sin(x * 0.1) * Math.cos(y * 0.1) > -0.3) {
            ctx.beginPath();
            ctx.arc(x, y, 2.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    const globeTexture = new THREE.CanvasTexture(canvas);
    const globeMat = new THREE.MeshPhongMaterial({
      map: globeTexture,
      shininess: 15,
      transparent: true,
      opacity: 0.95,
      color: new THREE.Color('#d1f4f4'),
    });
    const globeMesh = new THREE.Mesh(sphereGeo, globeMat);
    globeGroup.add(globeMesh);

    // Outer Glow Ring
    const atmosphereGeo = new THREE.SphereGeometry(sphereRadius + 3, 64, 64);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#2dd4bf'),
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphereMesh);

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(200, 150, 200);
    scene.add(dirLight);

    // 6. Convert Lat/Lng to 3D Coordinates
    const latLngToVector3 = (lat: number, lng: number, radius: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    // 7. Add Glowing Location Markers from REAL database data only
    markers.forEach((m) => {
      const pos = latLngToVector3(m.lat, m.lng, sphereRadius + 1.5);

      // Pin Mesh
      const pinGeo = new THREE.SphereGeometry(2.5, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({
        color: m.type === 'order' ? new THREE.Color('#a855f7') : new THREE.Color('#0284c7'),
      });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);
      globeGroup.add(pinMesh);

      // Pulsing Radar Ring
      const ringGeo = new THREE.RingGeometry(2, 5, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: m.type === 'order' ? new THREE.Color('#c084fc') : new THREE.Color('#38bdf8'),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(0, 0, 0);
      globeGroup.add(ringMesh);
    });

    // Rotation controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      globeGroup.rotation.y += deltaX * 0.005;
      globeGroup.rotation.x += deltaY * 0.005;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isDragging) {
        globeGroup.rotation.y += 0.002;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || 600;
      const newHeight = container.clientHeight || 550;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [markers]);

  return (
    <div className="relative w-full h-[550px] flex items-center justify-center overflow-hidden">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      
      {/* Legend Overlay */}
      <div className="absolute bottom-4 right-4 flex items-center space-x-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 shadow-md text-xs font-bold text-slate-800">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse"></span>
          <span className="font-extrabold text-slate-900">Orders</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse"></span>
          <span className="font-extrabold text-slate-900">Visitors right now</span>
        </div>
      </div>
    </div>
  );
};
