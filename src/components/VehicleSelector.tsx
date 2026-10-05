import React from 'react';
import { Vehicle, Trip } from '../types';
import { FLEET_VEHICLES } from '../data/mockData';
import { Users, Briefcase, Leaf, Check, Sparkles } from 'lucide-react';

interface VehicleSelectorProps {
  currentVehicle: Vehicle;
  onSelectVehicle: (vehicle: Vehicle) => void;
  trip: Trip;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  currentVehicle,
  onSelectVehicle,
  trip,
}) => {
  const currentRidersCount = trip.riders.length;
  const currentBagsCount = trip.riders.reduce(
    (acc, r) => acc + r.luggage.carryOn + r.luggage.checked,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-white font-display">Specialized Group Fleet</h2>
          <p className="text-xs text-neutral-400">
            Vehicles certified for multi-passenger transit, extra cargo bays, and licensed commercial drivers.
          </p>
        </div>
        <div className="text-xs text-neutral-400 font-mono-nums">
          Current Demand: {currentRidersCount} Passengers · {currentBagsCount} Bags
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FLEET_VEHICLES.map((v) => {
          const isSelected = v.id === currentVehicle.id;
          const isCapacityOk = currentRidersCount <= v.maxPassengers && currentBagsCount <= v.maxLuggage;
          const estimatedCost = v.baseRate + trip.totalDistanceMiles * v.perMileRate;
          const perPersonCost = estimatedCost / Math.max(1, currentRidersCount);

          return (
            <div
              key={v.id}
              onClick={() => onSelectVehicle(v)}
              className={`group relative flex flex-col justify-between bg-neutral-900 border rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 ${
                isSelected
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xl shadow-emerald-950/30'
                  : 'border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div>
                {/* Vehicle Photography */}
                <div className="relative aspect-[4/3] bg-neutral-950 overflow-hidden">
                  <img
                    src={v.image}
                    alt={v.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />
                  
                  {isSelected && (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-neutral-950 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Selected</span>
                    </div>
                  )}

                  {v.carbonOffsetKg === 0 && (
                    <div className="absolute top-3 left-3 bg-neutral-900/90 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-800/60 backdrop-blur-sm flex items-center gap-1">
                      <Leaf className="w-3 h-3" />
                      <span>Zero Emission EV</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-base font-semibold text-white leading-tight">{v.name}</h3>
                    <p className="text-xs text-neutral-400 font-mono-nums mt-0.5">{v.model}</p>
                  </div>

                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {v.description}
                  </p>

                  {/* Capacities */}
                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-neutral-800/80">
                    <div className="flex items-center gap-1.5 text-neutral-300">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span>Up to <strong className="text-white font-mono-nums">{v.maxPassengers}</strong> seats</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-neutral-300">
                      <Briefcase className="w-4 h-4 text-emerald-400" />
                      <span>Up to <strong className="text-white font-mono-nums">{v.maxLuggage}</strong> bags</span>
                    </div>
                  </div>

                  {/* Features list */}
                  <div className="space-y-1">
                    {v.features.slice(0, 3).map((feat) => (
                      <div key={feat} className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-emerald-400/80" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pricing Footer */}
              <div className="p-4 bg-neutral-950/60 border-t border-neutral-800/80 flex items-center justify-between">
                <div>
                  <div className="text-xs text-neutral-400">Total Group Fare</div>
                  <div className="text-lg font-bold text-white font-mono-nums">
                    ${estimatedCost.toFixed(2)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-emerald-400 font-semibold font-mono-nums">
                    ${perPersonCost.toFixed(2)} / person
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono-nums">
                    Split across {currentRidersCount} riders
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
