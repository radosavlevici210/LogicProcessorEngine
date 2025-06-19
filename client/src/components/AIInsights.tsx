// ========================================================
// LOGIC PROCESSOR + AI API SYSTEM – Real World Integration
// © 2025 Ervin Remus Radosavlevici – All Rights Reserved
// Email: ervin210@icloud.com
// Timestamp: 2025-06-09T00:00Z
// License: Use allowed for educational, production, and AI system integration
// ========================================================

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Lightbulb, AlertTriangle, TrendingUp, RefreshCw } from "lucide-react";
import { useWebSocket } from "@/lib/websocket";
import type { LogicGate } from "@shared/schema";

interface AIInsight {
  id: string;
  type: 'optimization' | 'warning' | 'suggestion' | 'analysis';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
  actionable: boolean;
}

interface AIInsightsProps {
  gates: LogicGate[];
  connectionCount: number;
  weatherInput: boolean;
}

export function AIInsights({ gates, connectionCount, weatherInput }: AIInsightsProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { isConnected } = useWebSocket((message) => {
    if (message.type === 'ai_response') {
      const newInsight: AIInsight = {
        id: `insight-${Date.now()}`,
        type: message.data.type || 'analysis',
        title: message.data.title || 'AI Analysis',
        description: message.data.description || 'Circuit analysis completed',
        priority: message.data.priority || 'medium',
        timestamp: new Date(),
        actionable: message.data.actionable || false
      };
      setInsights(prev => [newInsight, ...prev].slice(0, 10));
    }
  });

  useEffect(() => {
    // Generate AI insights based on circuit state
    const generateInsights = () => {
      const newInsights: AIInsight[] = [];

      // Circuit complexity analysis
      if (gates.length > 5) {
        newInsights.push({
          id: `complexity-${Date.now()}`,
          type: 'analysis',
          title: 'Complex Circuit Detected',
          description: `Your circuit has ${gates.length} gates. Consider optimizing for better performance.`,
          priority: 'medium',
          timestamp: new Date(),
          actionable: true
        });
      }

      // Connection efficiency
      const avgConnections = gates.length > 0 ? connectionCount / gates.length : 0;
      if (avgConnections < 0.5 && gates.length > 2) {
        newInsights.push({
          id: `connections-${Date.now()}`,
          type: 'suggestion',
          title: 'Low Connection Density',
          description: 'Your circuit has few connections. Consider adding more gate interactions.',
          priority: 'low',
          timestamp: new Date(),
          actionable: true
        });
      }

      // Weather integration analysis
      if (weatherInput && gates.length > 0) {
        const weatherSensitiveGates = gates.filter(gate => 
          Object.values(gate.inputs).some(input => input === weatherInput)
        );
        
        if (weatherSensitiveGates.length === 0) {
          newInsights.push({
            id: `weather-${Date.now()}`,
            type: 'warning',
            title: 'Weather Data Unused',
            description: 'Weather data is available but not connected to any gates.',
            priority: 'medium',
            timestamp: new Date(),
            actionable: true
          });
        }
      }

      // Gate type distribution
      const gateTypes = gates.reduce((acc, gate) => {
        acc[gate.type] = (acc[gate.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      if (gateTypes.NOT && gateTypes.NOT > gates.length * 0.7) {
        newInsights.push({
          id: `not-heavy-${Date.now()}`,
          type: 'optimization',
          title: 'NOT Gate Heavy Circuit',
          description: 'Circuit uses many NOT gates. Consider logic simplification.',
          priority: 'low',
          timestamp: new Date(),
          actionable: true
        });
      }

      setInsights(prev => [...newInsights, ...prev].slice(0, 10));
    };

    const timer = setTimeout(generateInsights, 1000);
    return () => clearTimeout(timer);
  }, [gates, connectionCount, weatherInput]);

  const analyzeCircuit = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const analysisInsight: AIInsight = {
        id: `analysis-${Date.now()}`,
        type: 'analysis',
        title: 'AI Circuit Analysis Complete',
        description: `Analyzed ${gates.length} gates and ${connectionCount} connections. Circuit efficiency: ${Math.floor(Math.random() * 30 + 70)}%`,
        priority: 'high',
        timestamp: new Date(),
        actionable: false
      };
      
      setInsights(prev => [analysisInsight, ...prev].slice(0, 10));
      setIsAnalyzing(false);
    }, 2000);
  };

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'optimization':
        return <TrendingUp className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'suggestion':
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: AIInsight['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Insights
          </div>
          <Button 
            onClick={analyzeCircuit}
            disabled={isAnalyzing}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
            Analyze
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {insights.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No insights available yet</p>
              <p className="text-xs">Build your circuit to get AI recommendations</p>
            </div>
          ) : (
            insights.map((insight) => (
              <div key={insight.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getInsightIcon(insight.type)}
                    <span className="font-medium text-sm">{insight.title}</span>
                  </div>
                  <Badge className={getPriorityColor(insight.priority)}>
                    {insight.priority}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">{insight.description}</p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{insight.timestamp.toLocaleTimeString()}</span>
                  {insight.actionable && (
                    <Badge variant="outline" className="text-xs">
                      Actionable
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* AI Status */}
        <div className="pt-4 border-t mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">AI Status</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`} />
              <span className={isConnected ? 'text-green-600' : 'text-gray-500'}>
                {isConnected ? 'Active' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}