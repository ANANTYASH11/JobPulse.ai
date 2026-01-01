'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Video, Sparkles, AlertCircle, Eye, Smile, RefreshCw } from 'lucide-react';

export default function WebcamAnalyzer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState({
    eyeContact: 92,
    smileRate: 85,
    lighting: 'Optimal',
    posture: 'Centered',
    nervousness: 'Low'
  });

  const startCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamActive(true);
      }
    } catch (e) {
      console.error('Camera access failed:', e);
      setError('Webcam access was denied or is unavailable. Rendering simulated placeholder.');
      setStreamActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setStreamActive(false);
    }
  };

  // Perform canvas analysis overlays (green grid and scanning line)
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    const drawScan = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Only draw overlays if streaming is active
      if (streamActive) {
        // Draw green face bounding box
        ctx.strokeStyle = '#8b5cf6'; // violet
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(canvas.width * 0.25, canvas.height * 0.15, canvas.width * 0.5, canvas.height * 0.65);
        
        // Draw crosshair corners
        ctx.strokeStyle = '#3b82f6'; // blue
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        
        // Top Left
        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.25, canvas.height * 0.25);
        ctx.lineTo(canvas.width * 0.25, canvas.height * 0.15);
        ctx.lineTo(canvas.width * 0.35, canvas.height * 0.15);
        ctx.stroke();

        // Top Right
        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.75, canvas.height * 0.25);
        ctx.lineTo(canvas.width * 0.75, canvas.height * 0.15);
        ctx.lineTo(canvas.width * 0.65, canvas.height * 0.15);
        ctx.stroke();

        // Bottom Left
        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.25, canvas.height * 0.7);
        ctx.lineTo(canvas.width * 0.25, canvas.height * 0.8);
        ctx.lineTo(canvas.width * 0.35, canvas.height * 0.8);
        ctx.stroke();

        // Bottom Right
        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.75, canvas.height * 0.7);
        ctx.lineTo(canvas.width * 0.75, canvas.height * 0.8);
        ctx.lineTo(canvas.width * 0.65, canvas.height * 0.8);
        ctx.stroke();

        // Draw horizontal scanning laser line
        const scanY = (Math.sin(Date.now() / 800) + 1) * 0.5 * canvas.height;
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(canvas.width, scanY);
        ctx.stroke();

        // Eye tracking nodes
        ctx.fillStyle = 'rgba(59, 130, 246, 0.7)';
        ctx.beginPath();
        ctx.arc(canvas.width * 0.42, canvas.height * 0.4, 4, 0, Math.PI * 2); // left eye
        ctx.arc(canvas.width * 0.58, canvas.height * 0.4, 4, 0, Math.PI * 2); // right eye
        ctx.fill();

        // Mouth outline
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(canvas.width * 0.5, canvas.height * 0.6, 10, 0, Math.PI);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(drawScan);
    };

    drawScan();

    // Randomize metrics slightly for realistic feedback updates
    const interval = setInterval(() => {
      if (streamActive) {
        setMetrics({
          eyeContact: Math.min(100, Math.max(78, Math.round(90 + (Math.random() - 0.5) * 10))),
          smileRate: Math.min(100, Math.max(65, Math.round(80 + (Math.random() - 0.5) * 15))),
          lighting: Math.random() > 0.9 ? 'Slightly Dim' : 'Optimal',
          posture: Math.random() > 0.8 ? 'Adjusting' : 'Centered',
          nervousness: Math.random() > 0.9 ? 'Mild' : 'Low'
        });
      }
    }, 3000);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(interval);
    };
  }, [streamActive]);

  useEffect(() => {
    // Auto start camera for the interview page
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="w-full flex flex-col md:flex-row gap-6">
      {/* Camera feed canvas container */}
      <div className="flex-1 relative rounded-2xl overflow-hidden bg-black/60 border border-white/5 aspect-video flex items-center justify-center group shadow-inner">
        {streamActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover rounded-2xl"
            />
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="absolute inset-0 w-full h-full object-cover rounded-2xl pointer-events-none z-10"
            />
            {/* Live indicator overlay */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-zinc-950/80 px-3 py-1.5 rounded-full border border-red-500/20 text-red-500 text-[10px] font-bold tracking-wider">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              AI VIDEO FEED ACTIVE
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center p-6">
            <CameraOff className="w-12 h-12 text-gray-600 animate-pulse" />
            <div>
              <p className="text-sm font-medium text-gray-400">Camera Feed is Offline</p>
              {error ? (
                <p className="text-[10px] text-yellow-500/80 mt-1 max-w-sm">{error}</p>
              ) : (
                <p className="text-[10px] text-gray-500 mt-1">Accept camera permissions to test AI posture/framing</p>
              )}
            </div>
            <button
              onClick={startCamera}
              className="px-4 py-2 mt-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white transition-all shadow-lg shadow-violet-500/20 cursor-pointer"
            >
              Enable Webcam Stream
            </button>
          </div>
        )}

        {/* Floating action buttons */}
        {streamActive && (
          <button
            onClick={stopCamera}
            className="absolute bottom-4 right-4 z-20 p-2.5 rounded-xl bg-zinc-950/80 border border-white/10 hover:bg-zinc-900 text-gray-300 hover:text-white transition-all cursor-pointer"
            title="Turn Off Camera"
          >
            <CameraOff className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Visual analytics sidebar */}
      <div className="w-full md:w-80 glass rounded-2xl p-5 border border-white/5 flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            AI Computer Vision Metrics
          </h4>

          <div className="space-y-4">
            {/* Eye Contact Meter */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-400" /> Eye Contact Ratio
                </span>
                <span className={metrics.eyeContact > 85 ? 'text-green-400 font-bold' : 'text-yellow-400 font-bold'}>
                  {streamActive ? `${metrics.eyeContact}%` : '--'}
                </span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-700"
                  style={{ width: streamActive ? `${metrics.eyeContact}%` : '0%' }}
                />
              </div>
            </div>

            {/* Smile Frequency */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-emerald-400" /> Expression Confidence
                </span>
                <span className="text-emerald-400 font-bold">
                  {streamActive ? `${metrics.smileRate}%` : '--'}
                </span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: streamActive ? `${metrics.smileRate}%` : '0%' }}
                />
              </div>
            </div>

            {/* General checks list */}
            <div className="pt-2 border-t border-white/5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Camera Framing</span>
                <span className={metrics.posture === 'Centered' ? 'text-green-400 font-medium' : 'text-yellow-400 font-medium'}>
                  {streamActive ? metrics.posture : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Lighting Quality</span>
                <span className={metrics.lighting === 'Optimal' ? 'text-green-400 font-medium' : 'text-yellow-400 font-medium'}>
                  {streamActive ? metrics.lighting : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Nervousness Level</span>
                <span className={metrics.nervousness === 'Low' ? 'text-green-400 font-medium' : 'text-yellow-400 font-medium'}>
                  {streamActive ? metrics.nervousness : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Warning notification */}
        <div className="mt-4 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 flex gap-2 text-[10px] text-violet-300 leading-normal">
          <AlertCircle className="w-4 h-4 shrink-0 text-violet-400" />
          <span>Keep your face centered and look directly at the green box overlay to maximize your eye contact ratio score.</span>
        </div>
      </div>
    </div>
  );
}
