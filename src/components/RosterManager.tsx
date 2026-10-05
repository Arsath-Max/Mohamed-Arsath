import React, { useState } from 'react';
import { Trip, Rider } from '../types';
import { 
  Users, 
  Briefcase, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Sparkles, 
  Phone, 
  Mail, 
  MapPin,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface RosterManagerProps {
  trip: Trip;
  onAddRider: (newRider: Omit<Rider, 'id' | 'allocatedFare' | 'distanceMiles'>) => void;
  onRemoveRider: (riderId: string) => void;
  onReorderRiders: (sourceIndex: number, destIndex: number) => void;
  onOptimizeOrder: () => void;
}

export const RosterManager: React.FC<RosterManagerProps> = ({
  trip,
  onAddRider,
  onRemoveRider,
  onReorderRiders,
  onOptimizeOrder,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [carryOn, setCarryOn] = useState(1);
  const [checked, setChecked] = useState(1);
  const [sportsGear, setSportsGear] = useState('');
  const [notes, setNotes] = useState('');

  const totalCarryOn = trip.riders.reduce((acc, r) => acc + r.luggage.carryOn, 0);
  const totalChecked = trip.riders.reduce((acc, r) => acc + r.luggage.checked, 0);
  const totalLuggage = totalCarryOn + totalChecked;
  const isLuggageFull = totalLuggage >= trip.vehicle.maxLuggage;
  const isSeatsFull = trip.riders.length >= trip.vehicle.maxPassengers;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;

    onAddRider({
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      phone: phone.trim() || '+1 (415) 555-0199',
      pickupAddress: address.trim(),
      pickupTime: 'Estimated on arrival',
      luggage: {
        carryOn,
        checked,
        sportsGear: sportsGear.trim() || undefined,
      },
      curbsideStatus: 'waiting',
      paymentStatus: 'pending',
      paymentMethod: 'apple_pay',
      isHost: false,
      notes: notes.trim(),
      avatar: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 500)}?w=150&auto=format&fit=crop&q=80`,
    });

    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setSportsGear('');
    setNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Capacity & Luggage Diagnostic Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Passenger capacity */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Group Passenger Capacity</span>
            <span className="font-mono-nums font-semibold text-white">
              {trip.riders.length} / {trip.vehicle.maxPassengers} Seats
            </span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-2 mt-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isSeatsFull ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${(trip.riders.length / trip.vehicle.maxPassengers) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-neutral-500 mt-2">
            Vehicle: {trip.vehicle.name} ({trip.vehicle.maxPassengers - trip.riders.length} seats open)
          </p>
        </div>

        {/* Luggage compartment capacity */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Luggage Bay Volume</span>
            <span className="font-mono-nums font-semibold text-white">
              {totalLuggage} / {trip.vehicle.maxLuggage} Pieces
            </span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-2 mt-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isLuggageFull ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${(totalLuggage / trip.vehicle.maxLuggage) * 100}%` }}
            />
          </div>
          <div className="flex items-center gap-3 text-[11px] text-neutral-400 mt-2">
            <span>{totalCarryOn} Carry-on</span>
            <span>·</span>
            <span>{totalChecked} Checked bags</span>
          </div>
        </div>
      </div>

      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white font-display">Group Passenger Roster</h2>
          <p className="text-xs text-neutral-400">
            Stops are sequenced in order of pickup. Re-order stops or use automated route optimization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOptimizeOrder}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg border border-neutral-700 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Smart Reorder</span>
          </button>
          <button
            disabled={isSeatsFull}
            onClick={() => setShowAddModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              isSeatsFull
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : 'bg-emerald-400 hover:bg-emerald-300 text-neutral-950 shadow-sm'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Passenger</span>
          </button>
        </div>
      </div>

      {/* Rider List Rows */}
      <div className="space-y-3">
        {trip.riders.map((rider, index) => {
          return (
            <div
              key={rider.id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-neutral-700 transition-colors"
            >
              {/* Left Slot: Order number, Avatar, Info */}
              <div className="flex items-start sm:items-center gap-3">
                <div className="flex flex-col items-center justify-center w-7 h-7 rounded-lg bg-neutral-950 text-neutral-300 font-mono-nums font-bold text-xs border border-neutral-800 shrink-0">
                  {index + 1}
                </div>

                <img
                  src={rider.avatar}
                  alt={rider.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-neutral-700 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{rider.name}</span>
                    {rider.isHost && (
                      <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">
                        Trip Host
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-0.5">
                    <MapPin className="w-3 h-3 text-neutral-500 shrink-0" />
                    <span>{rider.pickupAddress}</span>
                  </div>

                  {rider.notes && (
                    <div className="text-[11px] text-neutral-400 mt-1 italic">
                      Note: {rider.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Middle / Right: Luggage, Re-order, Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-800">
                {/* Luggage summary */}
                <div className="text-right text-xs">
                  <div className="flex items-center gap-1.5 text-neutral-300 justify-end">
                    <Briefcase className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="font-mono-nums">
                      {rider.luggage.carryOn} carry-on · {rider.luggage.checked} checked
                    </span>
                  </div>
                  {rider.luggage.sportsGear && (
                    <div className="text-[11px] text-amber-400 font-medium">
                      + {rider.luggage.sportsGear}
                    </div>
                  )}
                </div>

                {/* Reorder Arrows */}
                <div className="flex items-center gap-1">
                  <button
                    disabled={index === 0}
                    onClick={() => onReorderRiders(index, index - 1)}
                    className="p-1.5 bg-neutral-950 hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-neutral-950 text-neutral-300 rounded border border-neutral-800 transition-colors"
                    title="Move stop earlier"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={index === trip.riders.length - 1}
                    onClick={() => onReorderRiders(index, index + 1)}
                    className="p-1.5 bg-neutral-950 hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-neutral-950 text-neutral-300 rounded border border-neutral-800 transition-colors"
                    title="Move stop later"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Remove rider */}
                {!rider.isHost && (
                  <button
                    onClick={() => onRemoveRider(rider.id)}
                    className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-950/30 rounded transition-colors"
                    title="Remove from trip"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Passenger Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Add Passenger to Group</h3>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sam Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Pickup Address</label>
                <input
                  type="text"
                  required
                  placeholder="Street address, city"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (415) 555-..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Carry-on Bags</label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    value={carryOn}
                    onChange={(e) => setCarryOn(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white font-mono-nums focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Checked Suitcases</label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    value={checked}
                    onChange={(e) => setChecked(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white font-mono-nums focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Special Gear (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Ski bag, golf clubs, musical instrument"
                  value={sportsGear}
                  onChange={(e) => setSportsGear(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Flight or Meeting Note</label>
                <input
                  type="text"
                  placeholder="e.g. Flight UA 412, Gate 65"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-bold rounded-lg transition-colors"
                >
                  Add Passenger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
