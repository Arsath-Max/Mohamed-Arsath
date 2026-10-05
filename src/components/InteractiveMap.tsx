import React, { useState, useEffect, useRef } from 'react';
import { Trip, Rider } from '../types';
import { 
  Navigation, 
  Play, 
  Pause, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Compass, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Car
} from 'lucide-react';

interface InteractiveMapProps {
  trip: Trip;
  onRiderClick?: (rider: Rider) => void;
  onOptimizeRoute?: () => void;
  selectedRiderId?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  trip,
  onRiderClick,
  onOptimizeRoute,
  selectedRiderId,
}) => {
  const [zoom, setZoom] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [carProgress, setCarProgress] = useState<number>(0.38); // 0 to 1 along the path
  const [isOptimizedAlert, setIsOptimizedAlert] = useState(false);
  const animRef = useRef<number | null>(null);

  // Generate smooth road path points
  const points = [
    { x: trip.origin.x, y: trip.origin.y, name: trip.origin.name, isOrigin: true },
    ...trip.riders.map((r, idx) => ({
      x: r.x ?? (25 + idx * 16),
      y: r.y ?? (28 + idx * 14),
      name: r.name,
      rider: r,
      isStop: true,
      index: idx + 1,
    })),
    { x: trip.destination.x, y: trip.destination.y, name: trip.destination.name, isDestination: true },
  ];

  // Build SVG path
  const pathD = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[i - 1];
    // Bezier curve control points
    const cp1x = prev.x + (pt.x - prev.x) * 0.5;
    const cp1y = prev.y;
    const cp2x = prev.x + (pt.x - prev.x) * 0.5;
    const cp2y = pt.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pt.x} ${pt.y}`;
  }, '');

  // Calculate vehicle coordinates along path
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const [carPos, setCarPos] = useState({ x: 38, y: 44, angle: 35 });

  useEffect(() => {
    if (!pathRef.current) return;
    const path = pathRef.current;
    const totalLen = path.getTotalLength();
    const currentLen = totalLen * Math.min(Math.max(carProgress, 0.01), 0.99);
    const p1 = path.getPointAtLength(currentLen);
    const p2 = path.getPointAtLength(Math.min(currentLen + 1.5, totalLen));
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
    setCarPos({ x: p1.x, y: p1.y, angle });
  }, [carProgress, points]);

  // Simulation animation loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCarProgress((prev) => {
        const next = prev + 0.003 * simulationSpeed;
        return next > 0.96 ? 0.05 : next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying, simulationSpeed]);

  const handleOptimizeClick = () => {
    if (onOptimizeRoute) {
      onOptimizeRoute();
      setIsOptimizedAlert(true);
      setTimeout(() => setIsOptimizedAlert(false), 4000);
    }
  };

  // Find next stop based on carProgress
  const currentStopIndex = Math.min(
    Math.floor(carProgress * (trip.riders.length + 1)),
    trip.riders.length - 1
  );
  const nextRider = trip.riders[Math.max(0, currentStopIndex)];

  return (
    <div className="relative w-full h-[380px] lg:h-[480px] bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl select-none">
      {/* Map Surface Grid & Topo Background */}
      <div 
        className="absolute inset-0 bg-[#0a0d14] opacity-95 transition-transform duration-300"
        style={{ transform: `scale(${zoom})` }}
      >
        {/* Synthetic Map Water & Parks Grid */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" />
              </pattern>
              <pattern id="roadGrid" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#475569" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#smallGrid)" />
            <rect width="100%" height="100%" fill="url(#roadGrid)" />
            
            {/* Ambient Water Bay Shape */}
            <path 
              d="M 0,0 L 400,0 C 350,150 500,280 900,220 L 1200,300 L 1200,0 Z" 
              fill="#0f172a" 
              opacity="0.8" 
            />
            {/* Park / Green Reserve */}
            <path 
              d="M 50,260 C 120,240 180,310 140,390 C 80,420 30,340 50,260 Z" 
              fill="#064e3b" 
              opacity="0.3" 
            />
          </svg>
        </div>

        {/* Route Paths & Waypoints Vector Layer */}
        <svg 
          ref={svgRef}
          viewBox="0 0 100 100" 
          preserveAspectRatio="none" 
          className="absolute inset-0 w-full h-full pointer-events-auto"
        >
          {/* Base Road Glow */}
          <path
            d={pathD}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.8"
            strokeOpacity="0.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Main Transit Corridor Route Path */}
          <path
            ref={pathRef}
            d={pathD}
            fill="none"
            stroke="#10b981"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="3 1.5"
            className="transition-all duration-300"
          />

          {/* Completed Segment Glow */}
          <path
            d={pathD}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeDasharray="100"
            strokeDashoffset={100 - carProgress * 100}
            className="transition-all duration-100"
          />

          {/* Destination Radial Pulse */}
          <circle 
            cx={trip.destination.x} 
            cy={trip.destination.y} 
            r="3" 
            fill="#38bdf8" 
            opacity="0.2"
            className="animate-ping"
          />
        </svg>

        {/* Origin Pin */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
          style={{ left: `${trip.origin.x}%`, top: `${trip.origin.y}%` }}
        >
          <div className="flex items-center gap-1.5 bg-neutral-900/90 text-neutral-300 text-[11px] font-medium px-2 py-0.5 rounded-md border border-neutral-700/60 shadow-lg backdrop-blur-sm whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Origin: {trip.origin.name}</span>
          </div>
        </div>

        {/* Intermediate Rider Stops */}
        {trip.riders.map((rider, idx) => {
          const rx = rider.x ?? (25 + idx * 16);
          const ry = rider.y ?? (28 + idx * 14);
          const isSelected = selectedRiderId === rider.id;
          const isBoarded = rider.curbsideStatus === 'boarded';
          const isCurbside = rider.curbsideStatus === 'curbside';

          return (
            <div
              key={rider.id}
              onClick={() => onRiderClick?.(rider)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group transition-transform hover:scale-110 active:scale-95"
              style={{ left: `${rx}%`, top: `${ry}%` }}
            >
              {/* Ping Ring for Curbside */}
              {isCurbside && (
                <span className="absolute -inset-2 rounded-full bg-amber-400/20 animate-ping pointer-events-none" />
              )}

              <div 
                className={`relative flex items-center gap-1.5 p-1 pr-2.5 rounded-full border shadow-xl backdrop-blur-md transition-all ${
                  isSelected 
                    ? 'bg-emerald-500 text-neutral-950 border-emerald-300 ring-2 ring-emerald-400/50' 
                    : isBoarded 
                      ? 'bg-neutral-900/95 text-neutral-300 border-neutral-700' 
                      : isCurbside 
                        ? 'bg-amber-950/90 text-amber-200 border-amber-600/70' 
                        : 'bg-neutral-900/90 text-neutral-400 border-neutral-800'
                }`}
              >
                <div className="relative">
                  <img
                    src={rider.avatar}
                    alt={rider.name}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full object-cover border border-white/20"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-neutral-950 text-white rounded-full flex items-center justify-center text-[8px] font-bold border border-neutral-700">
                    {idx + 1}
                  </span>
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[11px] font-semibold whitespace-nowrap">{rider.name.split(' ')[0]}</span>
                  <span className="text-[9px] opacity-75 whitespace-nowrap">
                    {isBoarded ? 'On Board' : isCurbside ? 'At Curbside' : 'Waiting'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Destination Pin */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
          style={{ left: `${trip.destination.x}%`, top: `${trip.destination.y}%` }}
        >
          <div className="flex items-center gap-1.5 bg-sky-950/90 text-sky-200 text-[11px] font-medium px-2.5 py-1 rounded-md border border-sky-600/50 shadow-xl backdrop-blur-sm whitespace-nowrap">
            <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>{trip.destination.name}</span>
          </div>
        </div>

        {/* Live Traveling Van / Vehicle Icon */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 transition-transform duration-75"
          style={{ 
            left: `${carPos.x}%`, 
            top: `${carPos.y}%`,
          }}
        >
          <div 
            className="relative flex items-center justify-center"
            style={{ transform: `rotate(${carPos.angle}deg)` }}
          >
            {/* Glowing headlight beams */}
            <div className="absolute right-0 w-8 h-4 bg-gradient-to-r from-emerald-400/40 to-transparent blur-[3px] transform translate-x-5 pointer-events-none" />
            
            {/* Vehicle body marker */}
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-neutral-950 shadow-lg shadow-emerald-500/50 flex items-center justify-center border-2 border-white ring-2 ring-emerald-400/30">
              <Car className="w-4 h-4 text-neutral-950" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating HUD: Live Route Progress Banner */}
      <div className="absolute top-3 left-3 right-3 sm:right-auto sm:max-w-md z-40 bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-3 shadow-xl backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live En-Route
              </span>
              <span>·</span>
              <span>Stop {currentStopIndex + 1} of {trip.riders.length}</span>
              <span>·</span>
              <span className="font-mono-nums text-neutral-300">ETA {trip.estimatedDurationMins}m</span>
            </div>
            <p className="text-sm font-semibold text-neutral-100 mt-0.5">
              Next: Pick up {nextRider?.name || 'Destination'}
            </p>
            <p className="text-xs text-neutral-400 truncate max-w-[280px]">
              {nextRider?.pickupAddress || trip.destination.address}
            </p>
          </div>

          <button
            onClick={handleOptimizeClick}
            title="Reorder waypoints for minimum travel duration"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg border border-neutral-700 transition-colors shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Optimize</span>
          </button>
        </div>

        {isOptimizedAlert && (
          <div className="mt-2 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 rounded-md px-2 py-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Route optimized: Saved 14 minutes &amp; reduced emissions by 18%.</span>
          </div>
        )}
      </div>

      {/* Bottom Floating Map Controls */}
      <div className="absolute bottom-3 left-3 z-40 flex items-center gap-1.5 bg-neutral-900/90 border border-neutral-800/90 rounded-lg p-1 shadow-lg backdrop-blur-md">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-1.5 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded transition-colors"
          title={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          onClick={() => setCarProgress(0.02)}
          className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
          title="Restart Route"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <div className="h-4 w-px bg-neutral-800 mx-0.5" />
        <button
          onClick={() => setSimulationSpeed(simulationSpeed === 1 ? 2 : simulationSpeed === 2 ? 4 : 1)}
          className="px-2 py-1 text-[11px] font-mono-nums font-semibold text-neutral-300 hover:bg-neutral-800 rounded"
          title="Simulation Speed"
        >
          {simulationSpeed}x
        </button>
      </div>

      {/* Zoom & Reset Controls */}
      <div className="absolute bottom-3 right-3 z-40 flex flex-col gap-1 bg-neutral-900/90 border border-neutral-800/90 rounded-lg p-1 shadow-lg backdrop-blur-md">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.15, 1.6))}
          className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.15, 0.85))}
          className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
          title="Reset View"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
