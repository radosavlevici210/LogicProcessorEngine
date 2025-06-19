// ========================================================
// LOGIC PROCESSOR + AI API SYSTEM – Real World Integration
// © 2025 Ervin Remus Radosavlevici – All Rights Reserved
// Email: ervin210@icloud.com
// Timestamp: 2025-06-09T00:00Z
// License: Use allowed for educational, production, and AI system integration
// ========================================================

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { TrendingUp, Zap, Database, Cpu } from "lucide-react";
import { useWebSocket } from "@/lib/websocket";

interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  responseTime: number;
  throughput: number;
  activeConnections: number;
  systemLoad: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cpuUsage: 25,
    memoryUsage: 45,
    responseTime: 120,
    throughput: 1500,
    activeConnections: 8,
    systemLoad: 0.65
  });

  const { isConnected } = useWebSocket((message) => {
    if (message.type === 'performance_metrics') {
      setMetrics(message.data);
    }
  });

  useEffect(() => {
    // Simulate real-time performance data
    const interval = setInterval(() => {
      setMetrics(prev => ({
        cpuUsage: Math.max(0, Math.min(100, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(0, Math.min(100, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        responseTime: Math.max(10, prev.responseTime + (Math.random() - 0.5) * 20),
        throughput: Math.max(0, prev.throughput + (Math.random() - 0.5) * 100),
        activeConnections: Math.max(0, Math.floor(prev.activeConnections + (Math.random() - 0.5) * 2)),
        systemLoad: Math.max(0, Math.min(3, prev.systemLoad + (Math.random() - 0.5) * 0.2))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number, threshold: number) => {
    if (value < threshold * 0.6) return "text-green-600";
    if (value < threshold * 0.8) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Performance Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* CPU Usage */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">CPU Usage</span>
            </div>
            <Badge variant="outline" className={getStatusColor(metrics.cpuUsage, 100)}>
              {metrics.cpuUsage.toFixed(1)}%
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${metrics.cpuUsage}%` }}
            />
          </div>
        </div>

        {/* Memory Usage */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Memory Usage</span>
            </div>
            <Badge variant="outline" className={getStatusColor(metrics.memoryUsage, 100)}>
              {metrics.memoryUsage.toFixed(1)}%
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${metrics.memoryUsage}%` }}
            />
          </div>
        </div>

        {/* Response Time */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Response Time</span>
          </div>
          <span className="text-sm font-mono">{metrics.responseTime.toFixed(0)}ms</span>
        </div>

        {/* System Load */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">System Load</span>
          <span className="text-sm font-mono">{metrics.systemLoad.toFixed(2)}</span>
        </div>

        {/* Active Connections */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Active Connections</span>
          <Badge variant="outline">{metrics.activeConnections}</Badge>
        </div>

        {/* Throughput */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Throughput</span>
          <span className="text-sm font-mono">{metrics.throughput.toFixed(0)} req/min</span>
        </div>

        {/* Production Status */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Production Status</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className={`text-sm ${
                isConnected ? 'text-green-600' : 'text-red-600'
              }`}>
                {isConnected ? 'Operational' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}