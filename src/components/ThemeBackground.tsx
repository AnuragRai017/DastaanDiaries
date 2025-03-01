import { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import * as THREE from 'three';

const ThemeBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create scene with enhanced settings
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: 'high-performance'
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Performance optimization
    containerRef.current.appendChild(renderer.domElement);

    // Create multiple particle groups for layered effect
    const particleGroups = [];
    const layerCount = 4; // Added one more layer for depth
    
    // Colors based on theme
    const primaryColor = theme === 'dark' 
      ? new THREE.Color(0x2979ff) // Bluish for dark theme
      : new THREE.Color(0x333333); // Dark for light theme
      
    const accentColor = theme === 'dark' 
      ? new THREE.Color(0xff4081) // Pink for dark theme
      : new THREE.Color(0x1565C0); // Blue for light theme
    
    for (let layer = 0; layer < layerCount; layer++) {
      // Create floating particles with different sizes for each layer
      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 800 + (layer * 300); // More particles in deeper layers
      const posArray = new Float32Array(particlesCount * 3);
      const scaleArray = new Float32Array(particlesCount);
      const colorArray = new Float32Array(particlesCount * 3);
      
      // Create particles in spherical distribution with different densities
      for(let i = 0; i < particlesCount; i++) {
        // Spherical distribution with variations
        const radius = 2 + (layer * 1.7); // Larger radius for deeper layers
        const theta = Math.random() * Math.PI * 2; // Random angle in XY plane
        const phi = Math.acos((Math.random() * 2) - 1); // Random angle from Z axis
        
        // Add some randomness to make it less uniform
        const radialOffset = Math.random() * 0.5;
        
        const x = (radius + radialOffset) * Math.sin(phi) * Math.cos(theta);
        const y = (radius + radialOffset) * Math.sin(phi) * Math.sin(theta);
        const z = (radius + radialOffset) * Math.cos(phi);
        
        posArray[i * 3] = x;
        posArray[i * 3 + 1] = y;
        posArray[i * 3 + 2] = z;
        
        // Different sizes for particles
        scaleArray[i] = Math.random() * 0.012 + 0.003;
        
        // Color variation between primary and accent
        const colorMix = Math.random();
        const color = new THREE.Color();
        color.lerpColors(primaryColor, accentColor, colorMix);
        
        colorArray[i * 3] = color.r;
        colorArray[i * 3 + 1] = color.g;
        colorArray[i * 3 + 2] = color.b;
      }
      
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      particlesGeometry.setAttribute('scale', new THREE.BufferAttribute(scaleArray, 1));
      particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
      
      // Custom shader material for better-looking particles
      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.015,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.7 / (layer + 1), // Fading opacity for deeper layers
        blending: THREE.AdditiveBlending,
        vertexColors: true, // Use vertex colors
      });
      
      const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particlesMesh);
      particleGroups.push({ 
        mesh: particlesMesh, 
        geometry: particlesGeometry, 
        material: particlesMaterial,
        initialRotation: {
          x: Math.random() * Math.PI * 2,
          y: Math.random() * Math.PI * 2,
          z: Math.random() * Math.PI * 2
        }
      });
    }
    
    // Add a subtle glow effect to the scene
    const glowGeometry = new THREE.SphereGeometry(4, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: theme === 'dark' ? 0x1a1a2e : 0xffffff,
      transparent: true,
      opacity: 0.05,
      side: THREE.BackSide
    });
    
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.scale.multiplyScalar(1.2);
    scene.add(glowMesh);
    
    camera.position.z = 4;
    
    // Mouse movement effect variables
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    
    // Add mouse movement tracking for interactive background
    const onDocumentMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - window.innerWidth / 2) / 100;
      mouseY = (event.clientY - window.innerHeight / 2) / 100;
    };
    
    document.addEventListener('mousemove', onDocumentMouseMove);
    
    const clock = new THREE.Clock();
    
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      requestAnimationFrame(animate);
      
      // Smooth camera movement based on mouse position
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;
      camera.position.x += (targetX - camera.position.x) * 0.01;
      camera.position.y += (-targetY - camera.position.y) * 0.01;
      camera.lookAt(scene.position);
      
      // Animate each particle group differently with varying speeds and directions
      particleGroups.forEach((group, index) => {
        const layer = index + 1;
        const rotationSpeed = 0.0003 * layer;
        const pulseFrequency = 0.2 * layer;
        const initialRotation = group.initialRotation;
        
        // Different rotation pattern for each layer
        group.mesh.rotation.x = initialRotation.x + elapsedTime * rotationSpeed;
        group.mesh.rotation.y = initialRotation.y + elapsedTime * rotationSpeed * 1.5;
        group.mesh.rotation.z = initialRotation.z + elapsedTime * rotationSpeed * 0.5;
        
        // Pulse effect with different phases for each layer
        const pulsePhase = index * (Math.PI / layerCount);
        const scale = Math.sin(elapsedTime * pulseFrequency + pulsePhase) * 0.1 + 1;
        group.mesh.scale.set(scale, scale, scale);
      });
      
      // Animate glow
      const glowScale = 1 + Math.sin(elapsedTime * 0.2) * 0.05;
      glowMesh.scale.set(glowScale, glowScale, glowScale);
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Handle user interaction like scroll to create parallax effect
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const scrollProgress = Math.min(scrollY / maxScroll, 1);
      
      // Subtle camera movement based on scroll position
      camera.position.y = -scrollProgress * 0.5;
      camera.position.z = 4 - scrollProgress * 0.5;
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      document.removeEventListener('mousemove', onDocumentMouseMove);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      containerRef.current?.removeChild(renderer.domElement);
      
      // Clean up resources
      particleGroups.forEach(group => {
        scene.remove(group.mesh);
        group.geometry.dispose();
        group.material.dispose();
      });
      
      scene.remove(glowMesh);
      glowGeometry.dispose();
      glowMaterial.dispose();
      
      renderer.dispose();
    };
  }, [theme]);

  return (
    <div 
      ref={containerRef} 
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
      style={{ 
        opacity: theme === 'dark' ? 0.8 : 0.5,
        transition: 'opacity 1s ease-in-out'
      }}
    />
  );
};

export default ThemeBackground;
