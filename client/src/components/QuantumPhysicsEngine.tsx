import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Atom, Zap, Calculator, BarChart3, TrendingUp } from "lucide-react";

interface QuantumState {
  waveFunction: number[];
  probability: number[];
  energy: number;
  momentum: number;
  uncertainty: number;
}

interface QuantumPhysicsEngineProps {
  musicFrequency: number;
  musicAmplitude: number;
  particleResonance: number;
  onPhysicsUpdate: (data: any) => void;
}

export function QuantumPhysicsEngine({ 
  musicFrequency, 
  musicAmplitude, 
  particleResonance,
  onPhysicsUpdate 
}: QuantumPhysicsEngineProps) {
  const [quantumState, setQuantumState] = useState<QuantumState>({
    waveFunction: [],
    probability: [],
    energy: 0,
    momentum: 0,
    uncertainty: 0
  });
  
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [quantumNumbers, setQuantumNumbers] = useState({
    n: 1, // Principal quantum number
    l: 0, // Angular momentum
    m: 0, // Magnetic quantum number
    s: 0.5 // Spin
  });
  
  const [isRunning, setIsRunning] = useState(true);

  // Quantum simulation calculations
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      // Schrödinger equation simulation
      const hbar = 1.054571817e-34; // Reduced Planck constant
      const mass = 9.1093837015e-31; // Electron mass
      
      // Music-influenced quantum parameters
      const omega = (musicFrequency / 440) * 2 * Math.PI; // Angular frequency
      const amplitude = musicAmplitude;
      
      // Generate wave function based on music
      const waveFunction = Array.from({ length: 100 }, (_, i) => {
        const x = (i - 50) / 10; // Position
        const t = Date.now() / 1000 * simulationSpeed;
        
        // Quantum harmonic oscillator wave function
        const psi = amplitude * Math.exp(-0.5 * x * x) * 
                   Math.cos(omega * t + particleResonance * Math.PI);
        
        return psi;
      });
      
      // Calculate probability density
      const probability = waveFunction.map(psi => psi * psi);
      
      // Calculate energy eigenvalue
      const energy = hbar * omega * (quantumNumbers.n + 0.5);
      
      // Calculate momentum using de Broglie relation
      const momentum = Math.sqrt(2 * mass * energy);
      
      // Heisenberg uncertainty principle
      const deltaX = Math.sqrt(
        probability.reduce((sum, p, i) => sum + p * Math.pow((i - 50) / 10, 2), 0) /
        probability.reduce((sum, p) => sum + p, 0)
      );
      const deltaP = hbar / (2 * deltaX);
      const uncertainty = deltaX * deltaP;
      
      const newState: QuantumState = {
        waveFunction,
        probability,
        energy: energy * 1e18, // Convert to eV scale
        momentum: momentum * 1e31,
        uncertainty: uncertainty * 1e65
      };
      
      setQuantumState(newState);
      
      // Send physics data to parent component
      onPhysicsUpdate({
        quantumState: newState,
        resonanceFreq: omega / (2 * Math.PI),
        energyLevel: energy,
        quantumNumbers
      });
      
    }, 100 / simulationSpeed);

    return () => clearInterval(interval);
  }, [musicFrequency, musicAmplitude, particleResonance, simulationSpeed, quantumNumbers, isRunning, onPhysicsUpdate]);

  const updateQuantumNumber = (key: keyof typeof quantumNumbers, value: number) => {
    setQuantumNumbers(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const renderWaveFunction = () => {
    const maxAbs = Math.max(...quantumState.waveFunction.map(Math.abs));
    if (maxAbs === 0) return null;

    return (
      <div className="w-full h-24 border rounded bg-gradient-to-r from-blue-950 to-purple-950 relative overflow-hidden">
        <svg className="w-full h-full">
          {/* Wave function */}
          <path
            d={`M ${quantumState.waveFunction.map((psi, i) => 
              `${(i / quantumState.waveFunction.length) * 100}% ${50 - (psi / maxAbs) * 40}%`
            ).join(' L ')}`}
            fill="none"
            stroke="cyan"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Probability density */}
          <path
            d={`M ${quantumState.probability.map((p, i) => 
              `${(i / quantumState.probability.length) * 100}% ${50 + (p / Math.max(...quantumState.probability)) * 40}%`
            ).join(' L ')}`}
            fill="none"
            stroke="orange"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Grid lines */}
          <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
          <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
        </svg>
        
        <div className="absolute bottom-1 left-2 text-xs text-cyan-400">ψ(x)</div>
        <div className="absolute bottom-1 right-2 text-xs text-orange-400">|ψ|²</div>
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Atom className="h-5 w-5" />
          Quantum Physics Engine
          <Badge variant="outline" className="ml-auto">
            n={quantumNumbers.n} l={quantumNumbers.l}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Simulation Controls */}
        <div className="flex gap-2 items-center flex-wrap">
          <Button
            size="sm"
            onClick={() => setIsRunning(!isRunning)}
            variant={isRunning ? "default" : "outline"}
          >
            {isRunning ? "Pause" : "Run"}
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-xs">Speed:</span>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={simulationSpeed}
              onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
              className="w-16"
            />
            <span className="text-xs">{simulationSpeed}x</span>
          </div>
        </div>

        {/* Wave Function Visualization */}
        <div>
          <div className="text-sm font-medium mb-2">Wave Function & Probability</div>
          {renderWaveFunction()}
        </div>

        {/* Quantum Numbers */}
        <div>
          <div className="text-sm font-medium mb-2">Quantum Numbers</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Principal (n)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={quantumNumbers.n}
                onChange={(e) => updateQuantumNumber('n', parseInt(e.target.value))}
                className="w-full px-2 py-1 border rounded text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Angular (l)</label>
              <input
                type="number"
                min="0"
                max={quantumNumbers.n - 1}
                value={quantumNumbers.l}
                onChange={(e) => updateQuantumNumber('l', parseInt(e.target.value))}
                className="w-full px-2 py-1 border rounded text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Magnetic (m)</label>
              <input
                type="number"
                min={-quantumNumbers.l}
                max={quantumNumbers.l}
                value={quantumNumbers.m}
                onChange={(e) => updateQuantumNumber('m', parseInt(e.target.value))}
                className="w-full px-2 py-1 border rounded text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Spin (s)</label>
              <select
                value={quantumNumbers.s}
                onChange={(e) => updateQuantumNumber('s', parseFloat(e.target.value))}
                className="w-full px-2 py-1 border rounded text-xs"
              >
                <option value={0.5}>1/2</option>
                <option value={-0.5}>-1/2</option>
              </select>
            </div>
          </div>
        </div>

        {/* Physics Measurements */}
        <div>
          <div className="text-sm font-medium mb-2">Quantum Measurements</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between items-center">
              <span>Energy:</span>
              <Badge variant="outline" className="text-xs">
                {quantumState.energy.toFixed(2)} eV
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Momentum:</span>
              <Badge variant="outline" className="text-xs">
                {quantumState.momentum.toFixed(2)} kg⋅m/s
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Uncertainty:</span>
              <Badge variant="outline" className="text-xs">
                {quantumState.uncertainty.toFixed(2)} ℏ
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Music Coupling:</span>
              <Badge variant="outline" className="text-xs">
                {(musicAmplitude * particleResonance * 100).toFixed(1)}%
              </Badge>
            </div>
          </div>
        </div>

        {/* AI Quantum Analysis */}
        <div className="border-t pt-3">
          <div className="text-sm font-medium mb-2 flex items-center gap-1">
            <Calculator className="h-4 w-4" />
            AI Quantum Analysis
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div>• Wave function exhibits {musicFrequency > 440 ? 'high' : 'low'} frequency coupling</div>
            <div>• Particle resonance indicates {particleResonance > 0.5 ? 'strong' : 'weak'} quantum entanglement</div>
            <div>• Energy levels suggest {quantumNumbers.n > 2 ? 'excited' : 'ground'} state configuration</div>
            <div>• Uncertainty principle: ΔxΔp ≥ ℏ/2 {quantumState.uncertainty > 0.5 ? '✓' : '⚠'}</div>
          </div>
        </div>

        {/* Quantum Phenomena Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline">
            <Zap className="h-3 w-3 mr-1" />
            Tunneling
          </Button>
          <Button size="sm" variant="outline">
            <TrendingUp className="h-3 w-3 mr-1" />
            Superposition
          </Button>
          <Button size="sm" variant="outline">
            <BarChart3 className="h-3 w-3 mr-1" />
            Entanglement
          </Button>
          <Button size="sm" variant="outline">
            <Atom className="h-3 w-3 mr-1" />
            Decoherence
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}