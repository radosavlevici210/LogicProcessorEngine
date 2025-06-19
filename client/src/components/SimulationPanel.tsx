// ========================================================
// LOGIC PROCESSOR + AI API SYSTEM – Real World Integration
// © 2025 Ervin Remus Radosavlevici – All Rights Reserved
// Email: ervin210@icloud.com
// Timestamp: 2025-06-09T00:00Z
// License: Use allowed for educational, production, and AI system integration
// ========================================================

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Play, Pause, SkipForward, RotateCcw, Zap } from "lucide-react";
import type { LogicGate, Connection } from '@shared/schema';

interface SimulationPanelProps {
  gates: LogicGate[];
  connections: Connection[];
  onSimulationStep: () => void;
  onResetSimulation: () => void;
}

export function SimulationPanel({ gates, connections, onSimulationStep, onResetSimulation }: SimulationPanelProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState([500]);
  const [stepCount, setStepCount] = useState(0);
  const [signalPropagation, setSignalPropagation] = useState<string[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        onSimulationStep();
        setStepCount(prev => prev + 1);
        
        // Simulate signal propagation visualization
        const activeGates = gates.filter(gate => gate.output).map(gate => gate.id);
        setSignalPropagation(activeGates);
      }, speed[0]);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, speed, onSimulationStep, gates]);

  const handlePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const handleStep = () => {
    if (!isRunning) {
      onSimulationStep();
      setStepCount(prev => prev + 1);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setStepCount(0);
    setSignalPropagation([]);
    onResetSimulation();
  };

  const getSimulationStats = () => {
    const activeGates = gates.filter(gate => gate.output).length;
    const totalGates = gates.length;
    const propagationDelay = Math.floor(Math.random() * 50 + 10); // Simulated delay
    
    return {
      activeGates,
      totalGates,
      propagationDelay,
      efficiency: totalGates > 0 ? Math.round((activeGates / totalGates) * 100) : 0
    };
  };

  const stats = getSimulationStats();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Circuit Simulation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Control Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePlayPause}
            size="sm"
            className={isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button onClick={handleStep} disabled={isRunning} size="sm" variant="outline">
            <SkipForward className="h-4 w-4" />
          </Button>
          <Button onClick={handleReset} size="sm" variant="outline">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Speed Control */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Speed</label>
            <Badge variant="outline">{(1000 / speed[0]).toFixed(1)} Hz</Badge>
          </div>
          <div className="flex gap-1">
            <Button 
              size="sm" 
              variant={speed[0] === 100 ? "default" : "outline"}
              onClick={() => setSpeed([100])}
            >
              Fast
            </Button>
            <Button 
              size="sm" 
              variant={speed[0] === 500 ? "default" : "outline"}
              onClick={() => setSpeed([500])}
            >
              Med
            </Button>
            <Button 
              size="sm" 
              variant={speed[0] === 1000 ? "default" : "outline"}
              onClick={() => setSpeed([1000])}
            >
              Slow
            </Button>
          </div>
        </div>

        {/* Simulation Stats */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Steps:</span>
              <Badge variant="outline">{stepCount}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Active Gates:</span>
              <span className="font-mono">{stats.activeGates}/{stats.totalGates}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Efficiency:</span>
              <Badge variant={stats.efficiency > 50 ? 'default' : 'destructive'}>
                {stats.efficiency}%
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Delay:</span>
              <span className="font-mono text-xs">{stats.propagationDelay}ns</span>
            </div>
          </div>
        </div>

        {/* Signal Propagation Visualization */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Signal Flow</label>
          <div className="border rounded p-2 h-16 overflow-hidden">
            {signalPropagation.length > 0 ? (
              <div className="space-y-1">
                {signalPropagation.slice(0, 3).map((gateId, index) => (
                  <div key={gateId} className="flex items-center text-xs">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2" />
                    <span className="font-mono">Gate {gateId.slice(-4)} → HIGH</span>
                  </div>
                ))}
                {signalPropagation.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{signalPropagation.length - 3} more signals...
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                No active signals
              </div>
            )}
          </div>
        </div>

        {/* Simulation Status */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span>Status:</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`} />
              <span className={isRunning ? 'text-green-600' : 'text-gray-500'}>
                {isRunning ? 'Running' : 'Stopped'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}