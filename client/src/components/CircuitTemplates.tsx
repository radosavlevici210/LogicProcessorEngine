// ========================================================
// LOGIC PROCESSOR + AI API SYSTEM – Real World Integration
// © 2025 Ervin Remus Radosavlevici – All Rights Reserved
// Email: ervin210@icloud.com
// Timestamp: 2025-06-09T00:00Z
// License: Use allowed for educational, production, and AI system integration
// ========================================================

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Upload, Copy } from "lucide-react";
import type { LogicGate, Connection, GateType } from '@shared/schema';

interface CircuitTemplate {
  id: string;
  name: string;
  description: string;
  category: 'basic' | 'advanced' | 'arithmetic' | 'memory';
  gates: Omit<LogicGate, 'id'>[];
  connections: Omit<Connection, 'id' | 'from' | 'to'>[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface CircuitTemplatesProps {
  onLoadTemplate: (template: CircuitTemplate) => void;
}

const predefinedTemplates: CircuitTemplate[] = [
  {
    id: 'half-adder',
    name: 'Half Adder',
    description: 'Adds two single bits with sum and carry output',
    category: 'arithmetic',
    difficulty: 'beginner',
    gates: [
      { type: 'XOR', position: { x: 200, y: 100 }, inputs: { a: false, b: false }, output: false },
      { type: 'AND', position: { x: 200, y: 200 }, inputs: { a: false, b: false }, output: false }
    ],
    connections: []
  },
  {
    id: 'full-adder',
    name: 'Full Adder',
    description: 'Adds three bits with sum and carry output',
    category: 'arithmetic',
    difficulty: 'intermediate',
    gates: [
      { type: 'XOR', position: { x: 150, y: 100 }, inputs: { a: false, b: false }, output: false },
      { type: 'XOR', position: { x: 300, y: 100 }, inputs: { a: false, b: false }, output: false },
      { type: 'AND', position: { x: 150, y: 200 }, inputs: { a: false, b: false }, output: false },
      { type: 'AND', position: { x: 300, y: 200 }, inputs: { a: false, b: false }, output: false },
      { type: 'OR', position: { x: 450, y: 200 }, inputs: { a: false, b: false }, output: false }
    ],
    connections: []
  },
  {
    id: 'decoder-2to4',
    name: '2-to-4 Decoder',
    description: 'Decodes 2-bit input to 4 output lines',
    category: 'advanced',
    difficulty: 'intermediate',
    gates: [
      { type: 'NOT', position: { x: 100, y: 100 }, inputs: { a: false }, output: false },
      { type: 'NOT', position: { x: 100, y: 200 }, inputs: { a: false }, output: false },
      { type: 'AND', position: { x: 250, y: 50 }, inputs: { a: false, b: false }, output: false },
      { type: 'AND', position: { x: 250, y: 120 }, inputs: { a: false, b: false }, output: false },
      { type: 'AND', position: { x: 250, y: 190 }, inputs: { a: false, b: false }, output: false },
      { type: 'AND', position: { x: 250, y: 260 }, inputs: { a: false, b: false }, output: false }
    ],
    connections: []
  },
  {
    id: 'sr-latch',
    name: 'SR Latch',
    description: 'Set-Reset latch memory element',
    category: 'memory',
    difficulty: 'advanced',
    gates: [
      { type: 'NOR', position: { x: 200, y: 100 }, inputs: { a: false, b: false }, output: false },
      { type: 'NOR', position: { x: 200, y: 200 }, inputs: { a: false, b: false }, output: false }
    ],
    connections: []
  },
  {
    id: 'weather-alarm',
    name: 'Weather Alarm System',
    description: 'Alarm triggers based on weather conditions',
    category: 'basic',
    difficulty: 'beginner',
    gates: [
      { type: 'AND', position: { x: 200, y: 150 }, inputs: { a: false, b: false }, output: false },
      { type: 'NOT', position: { x: 350, y: 150 }, inputs: { a: false }, output: false }
    ],
    connections: []
  }
];

export function CircuitTemplates({ onLoadTemplate }: CircuitTemplatesProps) {
  const getCategoryColor = (category: CircuitTemplate['category']) => {
    switch (category) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      case 'arithmetic': return 'bg-blue-100 text-blue-800';
      case 'memory': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: CircuitTemplate['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-50 text-green-700 border-green-200';
      case 'intermediate': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'advanced': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Circuit Templates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {predefinedTemplates.map((template) => (
            <div key={template.id} className="border rounded-lg p-4 space-y-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">{template.name}</h4>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => onLoadTemplate(template)}
                  className="ml-2"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Load
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={getCategoryColor(template.category)}>
                  {template.category}
                </Badge>
                <Badge variant="outline" className={getDifficultyColor(template.difficulty)}>
                  {template.difficulty}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {template.gates.length} gates
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Template Actions */}
        <div className="pt-4 border-t mt-4 space-y-2">
          <Button variant="outline" className="w-full" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Template
          </Button>
          <Button variant="outline" className="w-full" size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Save as Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}