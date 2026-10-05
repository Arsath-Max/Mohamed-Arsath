import React, { useState } from 'react';
import { SharedPoolTrip, TripCategory } from '../types';
import { SHARED_POOL_LISTINGS } from '../data/mockData';
import { 
  Users, 
  MapPin, 
  Calendar, 
  Clock, 
  Check, 
  ShieldCheck, 
  ArrowRight, 
  Luggage, 
  Sparkles,
  Search,
  Filter
} from 'lucide-react';

interface SharedPoolMarketplaceProps {
  onJoinPool: (pool: SharedPoolTrip, bookedSeats: number) => void;
}

export const SharedPoolMarketplace: React.FC<SharedPoolMarketplaceProps> = ({
  onJoinPool,
}) => {
  const [pools, setPools] = useState<SharedPoolTrip[]>(SHARED_POOL_LISTINGS);
  const [selectedCategory, setSelectedCategory] = useState<TripCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reservingPool, setReservingPool] = useState<SharedPoolTrip | null>(null);
  const [seatCount, setSeatCount] = useState(1);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const filteredPools = pools.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.destinationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.originName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleConfirmReservation = () => {
    if (!reservingPool) return;
    onJoinPool(reservingPool, seatCount);
    // Update local state to reflect seat count reduction
    setPools((prev) =>
      prev.map((item) =>
        item.id === reservingPool.id
          ? { ...item, bookedSeats: Math.min(item.totalSeats, item.bookedSeats + seatCount) }
          : item
      )
    );
    setBookingSuccess(reservingPool.title);
    setReservingPool(null);
    setTimeout(() => setBookingSuccess(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner Section */}
      <div className="relative rounded-2xl bg-gradient-to-r from-emerald-950/60 via-neutral-900 to-neutral-900 border border-emerald-900/40 p-6 sm:p-8 overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>COMMUNITY TRAVEL POOLS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display">
            Hop into an Existing Group Ride. Save up to 65%.
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Solo or pair heading to the airport, ski slopes, or a weekend festival? Join open seats in verified executive vans and SUVs traveling your direction.
          </p>
        </div>

        {/* Decorative corner ambient glow */}
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {bookingSuccess && (
        <div className="p-4 bg-emerald-950/70 border border-emerald-700/80 rounded-xl text-emerald-200 text-sm flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              <strong>Seats Reserved!</strong> You’re confirmed for <em>{bookingSuccess}</em>. The group chat and driver itinerary are now synchronized.
            </span>
          </div>
          <button
            onClick={() => setBookingSuccess(null)}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-lg border border-neutral-800 overflow-x-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            All Pools ({pools.length})
          </button>
          <button
            onClick={() => setSelectedCategory('airport')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              selectedCategory === 'airport'
                ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Airport Shuttles
          </button>
          <button
            onClick={() => setSelectedCategory('getaway')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              selectedCategory === 'getaway'
                ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Ski &amp; Mountains
          </button>
          <button
            onClick={() => setSelectedCategory('festival')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              selectedCategory === 'festival'
                ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Festivals &amp; Events
          </button>
        </div>

        {/* Search input */}
        <div className="relative sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search destination, airport..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Grid of Shared Pools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPools.map((pool) => {
          const availableSeats = pool.totalSeats - pool.bookedSeats;
          const isFull = availableSeats <= 0;

          return (
            <div
              key={pool.id}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-neutral-700 transition-all duration-200 shadow-lg"
            >
              <div>
                {/* Header card info */}
                <div className="p-5 border-b border-neutral-800/80 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-white leading-snug">{pool.title}</h3>
                      {/* Unboxed metadata line with typographic bullet separators */}
                      <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-1">
                        <span>{pool.departureDate}</span>
                        <span>·</span>
                        <span className="text-emerald-400 font-mono-nums">{pool.departureTime}</span>
                        <span>·</span>
                        <span className="font-mono-nums">{pool.vehicleModel.split(' ')[0]}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xl font-extrabold text-white font-mono-nums">
                        ${pool.pricePerSeat}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-medium">per seat</div>
                    </div>
                  </div>

                  {/* Route corridor */}
                  <div className="bg-neutral-950/80 rounded-xl p-3 border border-neutral-800/80 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-neutral-300">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <span className="font-medium text-white">{pool.originName}</span>
                    </div>
                    <div className="pl-3 border-l border-neutral-800 ml-1 space-y-1 text-neutral-400 text-[11px]">
                      <div>Pickup Corridor: {pool.pickupCorridor.join(' → ')}</div>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-300">
                      <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="font-medium text-white">{pool.destinationName}</span>
                    </div>
                  </div>
                </div>

                {/* Host & Features */}
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={pool.host.avatar}
                        alt={pool.host.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover border border-neutral-700"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div>
                        <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                          <span>Hosted by {pool.host.name}</span>
                          <span className="text-amber-400 font-mono-nums">★ {pool.host.rating}</span>
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          {pool.host.completedSharedTrips} verified group rides hosted
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-semibold text-neutral-200 font-mono-nums">
                        {availableSeats} of {pool.totalSeats} seats left
                      </div>
                      <div className="w-24 bg-neutral-800 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${(pool.bookedSeats / pool.totalSeats) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Feature perks */}
                  <div className="flex flex-wrap gap-2 text-[11px] text-neutral-400">
                    {pool.features.map((feat) => (
                      <span key={feat} className="text-neutral-300 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>{feat}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 bg-neutral-950/60 border-t border-neutral-800/80 flex items-center justify-between gap-3">
                <span className="text-xs text-neutral-400">
                  {pool.allowLuggage ? 'Suitcases permitted' : 'Daypacks only'}
                </span>

                <button
                  disabled={isFull}
                  onClick={() => {
                    setReservingPool(pool);
                    setSeatCount(1);
                  }}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all active:scale-95 ${
                    isFull
                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                      : 'bg-emerald-400 hover:bg-emerald-300 text-neutral-950 shadow-sm'
                  }`}
                >
                  <span>{isFull ? 'Sold Out' : 'Join Pool'}</span>
                  {!isFull && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reservation Dialog Modal */}
      {reservingPool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-5">
            <div>
              <div className="text-xs text-emerald-400 font-semibold">RESERVE GROUP SEAT</div>
              <h3 className="text-lg font-bold text-white mt-1">{reservingPool.title}</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Departure: {reservingPool.departureDate} at {reservingPool.departureTime}
              </p>
            </div>

            <div className="bg-neutral-950 rounded-xl p-4 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Select Seats:</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSeatCount((s) => Math.max(1, s - 1))}
                    className="w-7 h-7 bg-neutral-800 hover:bg-neutral-700 text-white rounded flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold text-white font-mono-nums">{seatCount}</span>
                  <button
                    onClick={() =>
                      setSeatCount((s) =>
                        Math.min(reservingPool.totalSeats - reservingPool.bookedSeats, s + 1)
                      )
                    }
                    className="w-7 h-7 bg-neutral-800 hover:bg-neutral-700 text-white rounded flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-800/80">
                <span className="text-neutral-400">Estimated Total:</span>
                <span className="text-base font-bold text-emerald-400 font-mono-nums">
                  ${(reservingPool.pricePerSeat * seatCount).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Your Pickup Point along Corridor:
                </label>
                <select className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-200 text-xs focus:outline-none focus:border-emerald-500">
                  {reservingPool.pickupCorridor.map((stop) => (
                    <option key={stop} value={stop}>
                      {stop}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Luggage &amp; Gear details:
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 roller bag + 1 backpack"
                  defaultValue="1 roller bag + 1 backpack"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-200 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setReservingPool(null)}
                className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReservation}
                className="flex-1 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95"
              >
                Confirm &amp; Join Pool
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
