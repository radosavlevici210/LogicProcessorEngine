import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Square, Volume2, Mic, Disc, Waves } from "lucide-react";

interface MusicStudioProps {
  onMusicChange: (frequency: number, amplitude: number, waveform: string) => void;
  quantumResonance: number;
}

interface AudioTrack {
  id: string;
  name: string;
  frequency: number;
  amplitude: number;
  waveform: 'sine' | 'square' | 'triangle' | 'sawtooth';
  isPlaying: boolean;
}

export function MusicStudio({ onMusicChange, quantumResonance }: MusicStudioProps) {
  const [tracks, setTracks] = useState<AudioTrack[]>([
    { id: '1', name: 'Quantum Bass', frequency: 55, amplitude: 0.3, waveform: 'sine', isPlaying: false },
    { id: '2', name: 'Particle Synth', frequency: 440, amplitude: 0.2, waveform: 'triangle', isPlaying: false },
    { id: '3', name: 'Wave Function', frequency: 880, amplitude: 0.15, waveform: 'square', isPlaying: false },
  ]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.7);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<Map<string, OscillatorNode>>(new Map());

  useEffect(() => {
    // Initialize Web Audio API
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    // Notify parent component of music changes
    const activeTrack = tracks.find(t => t.isPlaying);
    if (activeTrack) {
      onMusicChange(activeTrack.frequency, activeTrack.amplitude, activeTrack.waveform);
    }
  }, [tracks, onMusicChange]);

  const playTrack = (trackId: string) => {
    if (!audioContextRef.current) return;

    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    // Create oscillator
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.type = track.waveform;
    oscillator.frequency.setValueAtTime(track.frequency, audioContextRef.current.currentTime);
    
    // Apply quantum resonance effect
    const resonanceFreq = track.frequency * (1 + quantumResonance * 0.1);
    oscillator.frequency.setValueAtTime(resonanceFreq, audioContextRef.current.currentTime);
    
    gainNode.gain.setValueAtTime(track.amplitude * masterVolume, audioContextRef.current.currentTime);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.start();
    oscillatorsRef.current.set(trackId, oscillator);
    
    setTracks(prev => prev.map(t => 
      t.id === trackId ? { ...t, isPlaying: true } : t
    ));
  };

  const stopTrack = (trackId: string) => {
    const oscillator = oscillatorsRef.current.get(trackId);
    if (oscillator) {
      oscillator.stop();
      oscillatorsRef.current.delete(trackId);
    }
    
    setTracks(prev => prev.map(t => 
      t.id === trackId ? { ...t, isPlaying: false } : t
    ));
  };

  const updateTrackFrequency = (trackId: string, frequency: number) => {
    setTracks(prev => prev.map(t => 
      t.id === trackId ? { ...t, frequency } : t
    ));
  };

  const updateTrackAmplitude = (trackId: string, amplitude: number) => {
    setTracks(prev => prev.map(t => 
      t.id === trackId ? { ...t, amplitude: amplitude / 100 } : t
    ));
  };

  const generateQuantumHarmony = () => {
    // Generate harmonics based on quantum resonance
    const baseFreq = 220 * (1 + quantumResonance);
    const harmonics = [1, 1.5, 2, 2.5, 3].map(ratio => baseFreq * ratio);
    
    setTracks(prev => prev.map((track, index) => ({
      ...track,
      frequency: harmonics[index] || track.frequency
    })));
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Waves className="h-5 w-5" />
          Quantum Music Studio
          <Badge variant="outline" className="ml-auto">
            Resonance: {(quantumResonance * 100).toFixed(1)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Master Controls */}
        <div className="flex gap-2 items-center">
          <Button
            onClick={() => setIsRecording(!isRecording)}
            variant={isRecording ? "destructive" : "outline"}
            size="sm"
          >
            <Mic className="h-4 w-4 mr-1" />
            {isRecording ? 'Stop' : 'Record'}
          </Button>
          
          <Button
            onClick={generateQuantumHarmony}
            variant="outline"
            size="sm"
          >
            <Disc className="h-4 w-4 mr-1" />
            Quantum Harmony
          </Button>
          
          <div className="flex items-center gap-2 ml-auto">
            <Volume2 className="h-4 w-4" />
            <input
              type="range"
              min="0"
              max="100"
              value={masterVolume * 100}
              onChange={(e) => setMasterVolume(parseInt(e.target.value) / 100)}
              className="w-20"
            />
          </div>
        </div>

        {/* Track Controls */}
        <div className="space-y-3">
          {tracks.map((track) => (
            <div key={track.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{track.name}</span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={track.isPlaying ? "default" : "outline"}
                    onClick={() => track.isPlaying ? stopTrack(track.id) : playTrack(track.id)}
                  >
                    {track.isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => stopTrack(track.id)}
                  >
                    <Square className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-muted-foreground">Frequency (Hz)</label>
                  <input
                    type="number"
                    value={track.frequency}
                    onChange={(e) => updateTrackFrequency(track.id, parseInt(e.target.value))}
                    className="w-full px-2 py-1 border rounded text-xs"
                    min="20"
                    max="2000"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground">Amplitude</label>
                  <input
                    type="range"
                    value={track.amplitude * 100}
                    onChange={(e) => updateTrackAmplitude(track.id, parseInt(e.target.value))}
                    className="w-full"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              
              <div className="flex gap-1">
                {(['sine', 'square', 'triangle', 'sawtooth'] as const).map((waveform) => (
                  <Button
                    key={waveform}
                    size="sm"
                    variant={track.waveform === waveform ? "default" : "outline"}
                    onClick={() => setTracks(prev => prev.map(t => 
                      t.id === track.id ? { ...t, waveform } : t
                    ))}
                    className="text-xs px-2 py-1"
                  >
                    {waveform}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* AI Music Generation */}
        <div className="border-t pt-3">
          <div className="text-sm font-medium mb-2">AI Music Generation</div>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline">
              Quantum Sequence
            </Button>
            <Button size="sm" variant="outline">
              Physics Rhythm
            </Button>
            <Button size="sm" variant="outline">
              Particle Melody
            </Button>
            <Button size="sm" variant="outline">
              Wave Pattern
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}