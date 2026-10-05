import React, { useState } from 'react';
import { Trip, TripCategory, Vehicle, Rider } from '../types';
import { FLEET_VEHICLES, PRIMARY_DRIVER } from '../data/mockData';
import { X, Plane, Mountain, Music, Building, Plus, Trash2, Check, Sparkles } from 'lucide-react';

interface TripBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTrip: (newTrip: Trip) => void;
}

export const TripBuilderModal: React.FC<TripBuilderModalProps> = ({
  isOpen,
  onClose,
  onCreateTrip,
}) => {
  const [category, setCategory] = useState<TripCategory>('airport');
  const [title, setTitle] = useState('JFK Terminal 4 Group Departure');
  const [destinationName, setDestinationName] = useState('JFK International Airport Terminal 4');
  const [destinationAddress, setDestinationAddress] = useState('JFK Airport, Queens, NY 11430');
  const [date, setDate] = useState('Tomorrow, 4:00 PM');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>(FLEET_VEHICLES[0]);

  // Initial group stops
  const [stops, setStops] = useState<{ name: string; address: string; carryOn: number; checked: number }[]>([
    { name: 'You (Organizer)', address: '120 Broadway, Financial District, NY', carryOn: 1, checked: 1 },
    { name: 'Chloe Vance', address: '240 Bedford Ave, Williamsburg, Brooklyn', carryOn: 1, checked: 1 },
    { name: 'Mateo Chen', address: '480 Atlantic Ave, Downtown Brooklyn', carryOn: 1, checked: 2 },
  ]);

  if (!isOpen) return null;

  const handleAddStop = () => {
    setStops([...stops, { name: `Rider ${stops.length + 1}`, address: 'Enter address...', carryOn: 1, checked: 1 }]);
  };

  const handleRemoveStop = (index: number) => {
    if (stops.length <= 1) return;
    setStops(stops.filter((_, i) => i !== index));
  };

  const handleApplyPreset = (presetType: 'airport' | 'ski' | 'festival') => {
    if (presetType === 'airport') {
      setCategory('airport');
      setTitle('SFO International Flight Express');
      setDestinationName('SFO International Terminal 3');
      setDestinationAddress('San Francisco International Airport (SFO)');
      setStops([
        { name: 'You (Organizer)', address: 'Marina District, SF', carryOn: 1, checked: 1 },
        { name: 'Alex Rivera', address: 'Mission District, SF', carryOn: 1, checked: 1 },
        { name: 'Taylor Swift fan', address: 'Noe Valley, SF', carryOn: 1, checked: 0 },
      ]);
    } else if (presetType === 'ski') {
      setCategory('getaway');
      setTitle('Lake Tahoe Ski Cabin Group Express');
      setDestinationName('Palisades Tahoe Mountain Village');
      setDestinationAddress('1960 Squaw Valley Rd, Olympic Valley, CA');
      setSelectedVehicle(FLEET_VEHICLES[1]);
      setStops([
        { name: 'You (Organizer)', address: 'Embarcadero, San Francisco', carryOn: 1, checked: 2 },
        { name: 'Sammy Brooks', address: 'Rockridge, Oakland', carryOn: 1, checked: 2 },
        { name: 'Chris Miller', address: 'Davis Park & Ride, CA', carryOn: 1, checked: 1 },
        { name: 'Morgan Lee', address: 'Roseville Galleria, CA', carryOn: 1, checked: 1 },
      ]);
    } else {
      setCategory('festival');
      setTitle('Austin Grand Prix COTA Group Shuttle');
      setDestinationName('Circuit of the Americas Gate 3');
      setDestinationAddress('9201 Circuit of the Americas Blvd, Austin, TX');
      setSelectedVehicle(FLEET_VEHICLES[0]);
      setStops([
        { name: 'You (Organizer)', address: 'Downtown Austin, Congress Ave', carryOn: 0, checked: 1 },
        { name: 'Jordan Hayes', address: 'East 6th St, Austin', carryOn: 0, checked: 1 },
        { name: 'Hannah Scott', address: 'South Congress Hotel', carryOn: 0, checked: 0 },
      ]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const riders: Rider[] = stops.map((s, idx) => ({
      id: `rider-new-${idx}`,
      name: s.name,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + idx * 100}?w=150&auto=format&fit=crop&q=80`,
      phone: '+1 (415) 555-010' + idx,
      email: `${s.name.toLowerCase().replace(/[^a-z]/g, '')}@example.com`,
      pickupAddress: s.address,
      pickupTime: `Pickup #${idx + 1}`,
      luggage: { carryOn: s.carryOn, checked: s.checked },
      curbsideStatus: idx === 0 ? 'boarded' : 'waiting',
      paymentStatus: idx === 0 ? 'paid' : 'pending',
      paymentMethod: 'apple_pay',
      distanceMiles: Number((18 - idx * 3.5).toFixed(1)),
      allocatedFare: Number((selectedVehicle.baseRate / stops.length).toFixed(2)),
      isHost: idx === 0,
      x: 20 + idx * 18,
      y: 24 + idx * 15,
    }));

    const totalMiles = 24.5;
    const totalFare = selectedVehicle.baseRate + totalMiles * selectedVehicle.perMileRate;

    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      title,
      category,
      date,
      targetArrivalTime: '6:30 PM',
      status: 'en_route',
      origin: {
        name: stops[0]?.name || 'Origin Hub',
        address: stops[0]?.address || 'Start location',
        x: 18,
        y: 22,
      },
      destination: {
        name: destinationName,
        address: destinationAddress,
        x: 82,
        y: 78,
      },
      riders,
      vehicle: selectedVehicle,
      splitMode: 'distance_proportional',
      driver: PRIMARY_DRIVER,
      totalDistanceMiles: totalMiles,
      estimatedDurationMins: 38,
      baseTotalFare: totalFare,
      emergencyPin: Math.floor(1000 + Math.random() * 9000).toString(),
      inviteCode: `WAY-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      cabinSettings: {
        temperatureF: 70,
        quietMode: false,
        acFanSpeed: 'auto',
        moodLightColor: '#10b981',
      },
      jukebox: [
        {
          id: 'trk-p1',
          title: 'Electric Feel',
          artist: 'MGMT',
          addedBy: 'Organizer',
          votes: 3,
          isPlaying: true,
          duration: '3:49',
        },
      ],
      groupChat: [
        {
          id: 'c-init',
          senderId: PRIMARY_DRIVER.id,
          senderName: PRIMARY_DRIVER.name + ' (Driver)',
          senderAvatar: PRIMARY_DRIVER.avatar,
          text: `Hello group! I am assigned as your driver in the ${selectedVehicle.name}. All luggage space is prepped!`,
          timestamp: 'Just now',
        },
      ],
    };

    onCreateTrip(newTrip);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-xl w-full p-6 space-y-6 my-8">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white font-display">Create Custom Group Trip</h2>
            <p className="text-xs text-neutral-400">
              Set multi-stop pickup locations, invite travelers, and configure group vehicle.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div>
          <span className="text-[11px] text-neutral-400 font-medium block mb-1.5">
            Quick Demo Scenarios:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleApplyPreset('airport')}
              className="px-2.5 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-left text-xs text-neutral-300 transition-colors flex items-center gap-1.5"
            >
              <Plane className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="truncate">Airport Shuttle</span>
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('ski')}
              className="px-2.5 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-left text-xs text-neutral-300 transition-colors flex items-center gap-1.5"
            >
              <Mountain className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Tahoe Ski Trip</span>
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('festival')}
              className="px-2.5 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-left text-xs text-neutral-300 transition-colors flex items-center gap-1.5"
            >
              <Music className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">COTA Festival</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-neutral-300 font-medium mb-1">Trip Name</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">Destination Name</label>
              <input
                type="text"
                required
                value={destinationName}
                onChange={(e) => setDestinationName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-neutral-300 font-medium mb-1">Destination Address</label>
              <input
                type="text"
                required
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Group Stops / Pickups */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-neutral-300 font-medium">
                Passenger Pickup Stops ({stops.length})
              </label>
              <button
                type="button"
                onClick={handleAddStop}
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stop</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {stops.map((stop, idx) => (
                <div
                  key={idx}
                  className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 flex items-center gap-2"
                >
                  <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-300 flex items-center justify-center font-mono-nums font-bold text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    placeholder="Passenger Name"
                    value={stop.name}
                    onChange={(e) => {
                      const updated = [...stops];
                      updated[idx].name = e.target.value;
                      setStops(updated);
                    }}
                    className="w-1/3 bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-white text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Pickup Address"
                    value={stop.address}
                    onChange={(e) => {
                      const updated = [...stops];
                      updated[idx].address = e.target.value;
                      setStops(updated);
                    }}
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-white text-xs"
                  />
                  {stops.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStop(idx)}
                      className="p-1 text-neutral-500 hover:text-red-400 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle Selection */}
          <div>
            <label className="block text-neutral-300 font-medium mb-1.5">Select Vehicle</label>
            <div className="grid grid-cols-3 gap-2">
              {FLEET_VEHICLES.map((v) => (
                <div
                  key={v.id}
                  onClick={() => setSelectedVehicle(v)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-colors ${
                    selectedVehicle.id === v.id
                      ? 'bg-neutral-800 border-emerald-500 text-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="font-semibold text-xs text-white truncate">{v.name}</div>
                  <div className="text-[10px] opacity-75">{v.maxPassengers} seats · {v.maxLuggage} bags</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-bold rounded-lg shadow-sm transition-all active:scale-95"
            >
              Confirm &amp; Launch Trip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
