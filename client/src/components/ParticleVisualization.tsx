import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Atom, Zap, Waves, Sparkles, RotateCcw, Play, Pause } from "lucide-react";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  charge: number;
  mass: number;
  trail: { x: number; y: number }[];
}

interface ParticleVisualizationProps {
  musicFrequency: number;
  musicAmplitude: number;
  waveform: string;
  onQuantumResonance: (resonance: number) => void;
}

export function ParticleVisualization({ 
  musicFrequency, 
  musicAmplitude, 
  waveform, 
  onQuantumResonance 
}: ParticleVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [particleCount, setParticleCount] = useState(50);
  const [quantumField, setQuantumField] = useState(0.5);
  const [resonanceLevel, setResonanceLevel] = useState(0);

  // Initialize particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    particlesRef.current = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      radius: Math.random() * 3 + 1,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      charge: Math.random() > 0.5 ? 1 : -1,
      mass: Math.random() * 2 + 0.5,
      trail: []
    }));
  }, [particleCount]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const animate = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      // Clear canvas with quantum field effect
      ctx.fillStyle = `rgba(0, 0, 20, ${0.1 + quantumField * 0.1})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Music-responsive effects
      const musicIntensity = musicAmplitude * (musicFrequency / 440);
      const waveEffect = waveform === 'sine' ? Math.sin : 
                        waveform === 'square' ? (x: number) => Math.sign(Math.sin(x)) :
                        waveform === 'triangle' ? (x: number) => Math.asin(Math.sin(x)) :
                        Math.sin; // default to sine

      let totalResonance = 0;

      particlesRef.current.forEach((particle, index) => {
        // Physics simulation
        const time = Date.now() * 0.001;
        const musicWave = waveEffect(time * musicFrequency * 0.01) * musicIntensity;
        
        // Quantum field interactions
        const fieldForceX = Math.sin(particle.x * 0.01 + time) * quantumField;
        const fieldForceY = Math.cos(particle.y * 0.01 + time) * quantumField;
        
        // Music-responsive forces
        const musicForceX = musicWave * Math.cos(index * 0.1) * 0.5;
        const musicForceY = musicWave * Math.sin(index * 0.1) * 0.5;
        
        // Apply forces
        particle.vx += (fieldForceX + musicForceX) / particle.mass;
        particle.vy += (fieldForceY + musicForceY) / particle.mass;
        
        // Particle interactions
        particlesRef.current.forEach((other, otherIndex) => {
          if (index === otherIndex) return;
          
          const dx = other.x - particle.x;
          const dy = other.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 50 && distance > 0) {
            const force = (particle.charge * other.charge) / (distance * distance);
            const fx = (dx / distance) * force * 0.1;
            const fy = (dy / distance) * force * 0.1;
            
            particle.vx -= fx / particle.mass;
            particle.vy -= fy / particle.mass;
            
            // Calculate resonance
            totalResonance += Math.abs(force) * 0.01;
          }
        });
        
        // Apply damping
        particle.vx *= 0.99;
        particle.vy *= 0.99;
        
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Boundary conditions with quantum tunneling effect
        if (particle.x < 0 || particle.x > canvas.width) {
          if (Math.random() < quantumField * 0.1) {
            // Quantum tunneling
            particle.x = particle.x < 0 ? canvas.width : 0;
          } else {
            particle.vx *= -0.8;
            particle.x = Math.max(0, Math.min(canvas.width, particle.x));
          }
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          if (Math.random() < quantumField * 0.1) {
            particle.y = particle.y < 0 ? canvas.height : 0;
          } else {
            particle.vy *= -0.8;
            particle.y = Math.max(0, Math.min(canvas.height, particle.y));
          }
        }
        
        // Update trail
        particle.trail.push({ x: particle.x, y: particle.y });
        if (particle.trail.length > 20) {
          particle.trail.shift();
        }
        
        // Draw trail
        if (particle.trail.length > 1) {
          ctx.strokeStyle = particle.color + '40';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
          for (let i = 1; i < particle.trail.length; i++) {
            ctx.lineTo(particle.trail[i].x, particle.trail[i].y);
          }
          ctx.stroke();
        }
        
        // Draw particle
        const glowSize = particle.radius + musicIntensity * 10;
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, glowSize
        );
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw core
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw charge indicator
        ctx.fillStyle = particle.charge > 0 ? '#ff6b6b' : '#4ecdc4';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
          particle.charge > 0 ? '+' : '-',
          particle.x,
          particle.y + 2
        );
      });
      
      // Update resonance
      const normalizedResonance = Math.min(totalResonance / particleCount, 1);
      setResonanceLevel(normalizedResonance);
      onQuantumResonance(normalizedResonance);
      
      // Draw quantum field visualization
      drawQuantumField(ctx, canvas.width, canvas.height, musicFrequency, musicAmplitude);
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, quantumField, musicFrequency, musicAmplitude, waveform, onQuantumResonance, particleCount]);

  const drawQuantumField = (ctx: CanvasRenderingContext2D, width: number, height: number, freq: number, amp: number) => {
    const time = Date.now() * 0.001;
    ctx.strokeStyle = `rgba(100, 200, 255, ${amp * 0.3})`;
    ctx.lineWidth = 1;
    
    // Draw field lines
    for (let x = 0; x < width; x += 20) {
      ctx.beginPath();
      for (let y = 0; y < height; y += 5) {
        const fieldX = x + Math.sin(y * 0.01 + time * freq * 0.001) * quantumField * 10;
        const fieldY = y + Math.cos(x * 0.01 + time * freq * 0.001) * quantumField * 10;
        
        if (y === 0) {
          ctx.moveTo(fieldX, fieldY);
        } else {
          ctx.lineTo(fieldX, fieldY);
        }
      }
      ctx.stroke();
    }
  };

  const resetSimulation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    particlesRef.current.forEach(particle => {
      particle.x = Math.random() * canvas.width;
      particle.y = Math.random() * canvas.height;
      particle.vx = (Math.random() - 0.5) * 2;
      particle.vy = (Math.random() - 0.5) * 2;
      particle.trail = [];
    });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Atom className="h-5 w-5" />
          Quantum Particle Visualization
          <Badge variant="outline" className="ml-auto">
            Resonance: {(resonanceLevel * 100).toFixed(1)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex gap-2 items-center flex-wrap">
          <Button
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            variant={isPlaying ? "default" : "outline"}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          <Button size="sm" onClick={resetSimulation} variant="outline">
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <input
              type="range"
              min="0"
              max="100"
              value={quantumField * 100}
              onChange={(e) => setQuantumField(parseInt(e.target.value) / 100)}
              className="w-20"
            />
            <span className="text-xs">Field</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs">Particles:</span>
            <input
              type="number"
              min="10"
              max="200"
              value={particleCount}
              onChange={(e) => setParticleCount(parseInt(e.target.value))}
              className="w-16 px-2 py-1 border rounded text-xs"
            />
          </div>
        </div>

        {/* Canvas */}
        <div className="border rounded-lg overflow-hidden bg-gradient-to-br from-indigo-950 to-purple-950">
          <canvas
            ref={canvasRef}
            width={400}
            height={300}
            className="w-full h-[300px] cursor-crosshair"
            onClick={(e) => {
              const canvas = canvasRef.current;
              if (!canvas) return;
              
              const rect = canvas.getBoundingClientRect();
              const x = (e.clientX - rect.left) * (canvas.width / rect.width);
              const y = (e.clientY - rect.top) * (canvas.height / rect.height);
              
              // Add new particle at click position
              particlesRef.current.push({
                id: Date.now(),
                x, y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                radius: Math.random() * 3 + 2,
                color: `hsl(${Math.random() * 360}, 70%, 60%)`,
                charge: Math.random() > 0.5 ? 1 : -1,
                mass: Math.random() * 2 + 0.5,
                trail: []
              });
            }}
          />
        </div>

        {/* Physics Info */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span>Music Frequency:</span>
            <Badge variant="outline">{musicFrequency.toFixed(0)} Hz</Badge>
          </div>
          <div className="flex justify-between">
            <span>Music Amplitude:</span>
            <Badge variant="outline">{(musicAmplitude * 100).toFixed(1)}%</Badge>
          </div>
          <div className="flex justify-between">
            <span>Waveform:</span>
            <Badge variant="outline">{waveform}</Badge>
          </div>
          <div className="flex justify-between">
            <span>Particles:</span>
            <Badge variant="outline">{particlesRef.current.length}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}