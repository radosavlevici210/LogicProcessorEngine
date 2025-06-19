import React, { useState, useCallback } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { MusicStudio } from '@/components/MusicStudio';
import { ParticleVisualization } from '@/components/ParticleVisualization';
import { QuantumPhysicsEngine } from '@/components/QuantumPhysicsEngine';
import { SystemStatus } from '@/components/SystemStatus';
import { PerformanceMonitor } from '@/components/PerformanceMonitor';
import { AIInsights } from '@/components/AIInsights';
import { useWebSocket } from '@/lib/websocket';

interface MusicState {
  frequency: number;
  amplitude: number;
  waveform: string;
}

interface QuantumData {
  quantumState: any;
  resonanceFreq: number;
  energyLevel: number;
  quantumNumbers: any;
}

export default function QuantumStudio() {
  const [musicState, setMusicState] = useState<MusicState>({
    frequency: 440,
    amplitude: 0.3,
    waveform: 'sine'
  });
  
  const [quantumResonance, setQuantumResonance] = useState(0);
  const [particleResonance, setParticleResonance] = useState(0);
  const [quantumData, setQuantumData] = useState<QuantumData | null>(null);
  const [systemLogs, setSystemLogs] = useState<Array<{ timestamp: string; message: string; type: 'info' | 'success' | 'error' }>>([]);

  // WebSocket for real-time updates
  const { isConnected, sendMessage } = useWebSocket((message) => {
    if (message.type === 'system_status') {
      const log = {
        timestamp: new Date().toLocaleTimeString(),
        message: `System update: ${message.data.status}`,
        type: 'info' as const
      };
      setSystemLogs(prev => [log, ...prev.slice(0, 49)]);
    }
  });

  const handleMusicChange = useCallback((frequency: number, amplitude: number, waveform: string) => {
    setMusicState({ frequency, amplitude, waveform });
    
    // Send music data via WebSocket
    if (isConnected) {
      sendMessage({
        type: 'music_update',
        data: { frequency, amplitude, waveform }
      });
    }
    
    // Log music changes
    const log = {
      timestamp: new Date().toLocaleTimeString(),
      message: `Music: ${frequency}Hz ${waveform} wave at ${(amplitude * 100).toFixed(1)}%`,
      type: 'success' as const
    };
    setSystemLogs(prev => [log, ...prev.slice(0, 49)]);
  }, [isConnected, sendMessage]);

  const handleQuantumResonance = useCallback((resonance: number) => {
    setQuantumResonance(resonance);
  }, []);

  const handleParticleResonance = useCallback((resonance: number) => {
    setParticleResonance(resonance);
  }, []);

  const handlePhysicsUpdate = useCallback((data: QuantumData) => {
    setQuantumData(data);
    
    // Send physics data via WebSocket
    if (isConnected) {
      sendMessage({
        type: 'physics_update',
        data
      });
    }
  }, [isConnected, sendMessage]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        {/* Header */}
        <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Quantum RealArtist AI</h1>
                <p className="text-slate-400 text-sm">Music Production × Quantum Physics × Particle Simulation</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-slate-400">
                  WebSocket: <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div className="text-sm text-slate-400">
                  Resonance: <span className="text-cyan-400">{(quantumResonance * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex h-[calc(100vh-80px)]">
          {/* Left Panel - Music Studio */}
          <div className="w-80 border-r border-slate-800 bg-slate-900/30 backdrop-blur-sm">
            <div className="p-4 h-full overflow-y-auto">
              <MusicStudio
                onMusicChange={handleMusicChange}
                quantumResonance={quantumResonance}
              />
            </div>
          </div>

          {/* Center Panel - Particle Visualization */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-4">
              <ParticleVisualization
                musicFrequency={musicState.frequency}
                musicAmplitude={musicState.amplitude}
                waveform={musicState.waveform}
                onQuantumResonance={handleParticleResonance}
              />
            </div>
            
            {/* AI Insights Below Visualization */}
            <div className="p-4 border-t border-slate-800">
              <AIInsights
                gates={[]} // Empty for now, will be used for quantum states
                connectionCount={Math.floor(particleResonance * 10)}
                weatherInput={quantumResonance > 0.5}
              />
            </div>
          </div>

          {/* Right Panel - Quantum Physics & Monitoring */}
          <div className="w-80 border-l border-slate-800 bg-slate-900/30 backdrop-blur-sm flex flex-col overflow-hidden">
            {/* System Status */}
            <div className="p-4 border-b border-slate-800">
              <SystemStatus />
            </div>

            {/* Quantum Physics Engine */}
            <div className="p-4 border-b border-slate-800 flex-1 overflow-y-auto">
              <QuantumPhysicsEngine
                musicFrequency={musicState.frequency}
                musicAmplitude={musicState.amplitude}
                particleResonance={particleResonance}
                onPhysicsUpdate={handlePhysicsUpdate}
              />
            </div>

            {/* Performance Monitor */}
            <div className="p-4 border-b border-slate-800">
              <PerformanceMonitor />
            </div>

            {/* System Logs */}
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="text-sm font-medium text-white mb-2">System Logs</div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {systemLogs.map((log, index) => (
                  <div key={index} className="text-xs flex gap-2">
                    <span className="text-slate-500 flex-shrink-0">{log.timestamp}</span>
                    <span className={
                      log.type === 'error' ? 'text-red-400' :
                      log.type === 'success' ? 'text-green-400' :
                      'text-slate-300'
                    }>
                      {log.message}
                    </span>
                  </div>
                ))}
                {systemLogs.length === 0 && (
                  <div className="text-xs text-slate-500 italic">No system events yet...</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-sm border-t border-slate-800 px-6 py-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex gap-6">
              <span>Music: {musicState.frequency}Hz {musicState.waveform}</span>
              <span>Particles: {Math.floor(particleResonance * 100)}</span>
              <span>Quantum: {quantumData?.quantumNumbers?.n || 1}n{quantumData?.quantumNumbers?.l || 0}l</span>
            </div>
            <div className="flex gap-6">
              <span>Energy: {quantumData?.energyLevel ? (quantumData.energyLevel * 1e18).toFixed(2) : '0.00'} eV</span>
              <span>Resonance: {(quantumResonance * particleResonance * 100).toFixed(1)}%</span>
              <span>© 2025 Ervin Remus Radosavlevici</span>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}