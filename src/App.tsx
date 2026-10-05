import React, { useState } from 'react';
import { 
  Trip, 
  Rider, 
  Vehicle, 
  SplitMode, 
  CurbsideStatus, 
  SharedPoolTrip 
} from './types';
import { 
  INITIAL_ACTIVE_TRIP, 
  FLEET_VEHICLES 
} from './data/mockData';
import { TopNav } from './components/TopNav';
import { InteractiveMap } from './components/InteractiveMap';
import { FareSplitHub } from './components/FareSplitHub';
import { VehicleSelector } from './components/VehicleSelector';
import { SharedPoolMarketplace } from './components/SharedPoolMarketplace';
import { ActiveTripControls } from './components/ActiveTripControls';
import { RosterManager } from './components/RosterManager';
import { GroupChatDrawer } from './components/GroupChatDrawer';
import { TripBuilderModal } from './components/TripBuilderModal';
import { 
  MessageSquare, 
  MapPin, 
  Clock, 
  Users, 
  DollarSign, 
  ShieldCheck, 
  Share2, 
  Sparkles,
  Luggage,
  CheckCircle2,
  Navigation
} from 'lucide-react';

export default function App() {
  const [trip, setTrip] = useState<Trip>(INITIAL_ACTIVE_TRIP);
  const [activeTab, setActiveTab] = useState<'active_route' | 'roster' | 'fleet' | 'fare_split' | 'shared_pools'>('active_route');
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTripBuilderOpen, setIsTripBuilderOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handler: Update cost split mode
  const handleUpdateSplitMode = (mode: SplitMode) => {
    setTrip((prev) => ({ ...prev, splitMode: mode }));
    showToast(`Fare split updated to: ${mode === 'distance_proportional' ? 'Proportional by Distance' : mode === 'equal' ? 'Equal Split' : 'Host Subsidized'}`);
  };

  // Handler: Mark rider paid or pending
  const handleMarkRiderPaid = (riderId: string) => {
    setTrip((prev) => {
      const updatedRiders = prev.riders.map((r) => {
        if (r.id === riderId) {
          const newStatus = r.paymentStatus === 'paid' ? 'pending' : 'paid';
          return { ...r, paymentStatus: newStatus as any };
        }
        return r;
      });
      return { ...prev, riders: updatedRiders };
    });

    const target = trip.riders.find((r) => r.id === riderId);
    if (target) {
      const isNowPaid = target.paymentStatus !== 'paid';
      showToast(isNowPaid ? `${target.name} marked as PAID via Escrow` : `${target.name} marked as Pending`);
    }
  };

  // Handler: Change vehicle
  const handleSelectVehicle = (v: Vehicle) => {
    const newTotal = v.baseRate + trip.totalDistanceMiles * v.perMileRate;
    setTrip((prev) => ({
      ...prev,
      vehicle: v,
      baseTotalFare: newTotal,
    }));
    showToast(`Vehicle updated to ${v.name}`);
  };

  // Handler: Curbside status change
  const handleUpdateCurbsideStatus = (riderId: string, status: CurbsideStatus) => {
    setTrip((prev) => {
      const updated = prev.riders.map((r) => (r.id === riderId ? { ...r, curbsideStatus: status } : r));
      return { ...prev, riders: updated };
    });
    const target = trip.riders.find((r) => r.id === riderId);
    if (target) {
      showToast(`${target.name} is now ${status.toUpperCase()}`);
    }
  };

  // Handler: Jukebox add song
  const handleAddSong = (title: string, artist: string) => {
    const newTrack = {
      id: `trk-${Date.now()}`,
      title,
      artist,
      addedBy: 'You',
      votes: 1,
      isPlaying: false,
      duration: '3:30',
    };
    setTrip((prev) => ({
      ...prev,
      jukebox: [...prev.jukebox, newTrack],
    }));
    showToast(`Queued "${title}" in car playlist`);
  };

  // Handler: Jukebox vote
  const handleVoteSong = (songId: string) => {
    setTrip((prev) => ({
      ...prev,
      jukebox: prev.jukebox.map((s) => (s.id === songId ? { ...s, votes: s.votes + 1 } : s)),
    }));
  };

  // Handler: Cabin climate
  const handleUpdateCabinTemp = (temp: number) => {
    const clamped = Math.min(78, Math.max(64, temp));
    setTrip((prev) => ({
      ...prev,
      cabinSettings: { ...prev.cabinSettings, temperatureF: clamped },
    }));
  };

  const handleToggleQuietMode = () => {
    setTrip((prev) => ({
      ...prev,
      cabinSettings: { ...prev.cabinSettings, quietMode: !prev.cabinSettings.quietMode },
    }));
    showToast(!trip.cabinSettings.quietMode ? 'Quiet Ride mode activated' : 'Quiet Ride mode off');
  };

  // Handler: Send chat message
  const handleSendMessage = (text: string) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId: 'me',
      senderName: 'Maya Lin (You)',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      text,
      timestamp: 'Just now',
    };

    setTrip((prev) => ({
      ...prev,
      groupChat: [...prev.groupChat, newMsg],
    }));

    // Auto-reply simulation from driver if curbside message
    if (text.toLowerCase().includes('curb') || text.toLowerCase().includes('down')) {
      setTimeout(() => {
        const replyMsg = {
          id: `msg-reply-${Date.now()}`,
          senderId: trip.driver.id,
          senderName: trip.driver.name + ' (Driver)',
          senderAvatar: trip.driver.avatar,
          text: 'Copy that! Hazard lights are flashing, rolling up now.',
          timestamp: 'Just now',
        };
        setTrip((p) => ({ ...p, groupChat: [...p.groupChat, replyMsg] }));
      }, 1500);
    }
  };

  // Handler: Add rider to trip
  const handleAddRider = (newRiderData: Omit<Rider, 'id' | 'allocatedFare' | 'distanceMiles'>) => {
    const distanceEst = Number((8 + Math.random() * 8).toFixed(1));
    const newRider: Rider = {
      ...newRiderData,
      id: `rider-${Date.now()}`,
      distanceMiles: distanceEst,
      allocatedFare: Number((trip.baseTotalFare / (trip.riders.length + 1)).toFixed(2)),
      x: 30 + (trip.riders.length * 12) % 45,
      y: 35 + (trip.riders.length * 10) % 40,
    };

    setTrip((prev) => ({
      ...prev,
      riders: [...prev.riders, newRider],
    }));
    showToast(`Added ${newRider.name} to group roster`);
  };

  // Handler: Remove rider
  const handleRemoveRider = (riderId: string) => {
    setTrip((prev) => ({
      ...prev,
      riders: prev.riders.filter((r) => r.id !== riderId),
    }));
    showToast('Passenger removed from group');
  };

  // Handler: Reorder riders
  const handleReorderRiders = (src: number, dest: number) => {
    if (dest < 0 || dest >= trip.riders.length) return;
    const reordered = [...trip.riders];
    const [moved] = reordered.splice(src, 1);
    reordered.splice(dest, 0, moved);
    setTrip((prev) => ({ ...prev, riders: reordered }));
  };

  // Handler: Route optimization calculation
  const handleOptimizeRoute = () => {
    // Sort riders by distance to destination to minimize backtracking
    const sorted = [...trip.riders].sort((a, b) => b.distanceMiles - a.distanceMiles);
    setTrip((prev) => ({
      ...prev,
      riders: sorted,
      estimatedDurationMins: Math.max(26, prev.estimatedDurationMins - 6),
    }));
    showToast('Pickups reordered for optimal traffic flow. Saved 14 minutes!');
  };

  // Handler: Join shared pool
  const handleJoinPool = (pool: SharedPoolTrip, bookedSeats: number) => {
    showToast(`Reserved ${bookedSeats} seat(s) in "${pool.title}"`);
    setActiveTab('active_route');
  };

  const pendingPayments = trip.riders.filter((r) => r.paymentStatus === 'pending').length;
  const totalBags = trip.riders.reduce((acc, r) => acc + r.luggage.carryOn + r.luggage.checked, 0);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-neutral-900 border border-emerald-500/80 text-emerald-200 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 backdrop-blur-md animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Primary Top Bar Contract */}
      <TopNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewTripClick={() => setIsTripBuilderOpen(true)}
        isMobilePreview={isMobilePreview}
        onToggleMobilePreview={() => setIsMobilePreview(!isMobilePreview)}
        pendingPaymentCount={pendingPayments}
      />

      {/* Main Container - Supports Desktop baseline or Mobile Frame preview */}
      <main className="flex-1 w-full flex justify-center py-6 px-4 sm:px-6">
        <div
          className={`w-full transition-all duration-300 ${
            isMobilePreview
              ? 'max-w-[420px] bg-neutral-925 rounded-[36px] border-[8px] border-neutral-800 p-4 shadow-2xl overflow-hidden'
              : 'max-w-7xl'
          }`}
        >
          {/* Trip Header Status Strip */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4 sm:p-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Trip Active
                </span>
                <span>·</span>
                <span>{trip.date}</span>
                <span>·</span>
                <span className="text-neutral-300 font-mono-nums">Target: {trip.targetArrivalTime}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-display">
                {trip.title}
              </h1>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span>To: <strong className="text-white">{trip.destination.name}</strong></span>
                <span>·</span>
                <span>Vehicle: <strong className="text-neutral-200">{trip.vehicle.name}</strong></span>
              </div>
            </div>

            {/* Quick Metrics & Dispatch Chat Action */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-4 bg-neutral-950/80 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs">
                <div>
                  <div className="text-neutral-400">Group Fare</div>
                  <div className="text-sm font-bold text-white font-mono-nums">
                    ${trip.baseTotalFare.toFixed(2)}
                  </div>
                </div>
                <div className="h-6 w-px bg-neutral-800" />
                <div>
                  <div className="text-neutral-400">Passengers</div>
                  <div className="text-sm font-bold text-white font-mono-nums">
                    {trip.riders.length} / {trip.vehicle.maxPassengers}
                  </div>
                </div>
                <div className="h-6 w-px bg-neutral-800" />
                <div>
                  <div className="text-neutral-400">Luggage</div>
                  <div className="text-sm font-bold text-white font-mono-nums">
                    {totalBags} / {trip.vehicle.maxLuggage}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsChatOpen(true)}
                className="relative flex items-center gap-2 px-3.5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-xs font-semibold rounded-xl border border-neutral-700 transition-colors shadow-sm"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Chat</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-2 right-2" />
              </button>
            </div>
          </div>

          {/* View Tab Contents */}
          {activeTab === 'active_route' && (
            <div className="space-y-6">
              {/* Interactive Vector Route Map */}
              <InteractiveMap
                trip={trip}
                onOptimizeRoute={handleOptimizeRoute}
              />

              {/* In-Ride Group Controls & Driver Info */}
              <ActiveTripControls
                trip={trip}
                onUpdateCurbsideStatus={handleUpdateCurbsideStatus}
                onAddSong={handleAddSong}
                onVoteSong={handleVoteSong}
                onUpdateCabinTemp={handleUpdateCabinTemp}
                onToggleQuietMode={handleToggleQuietMode}
                onOpenChat={() => setIsChatOpen(true)}
              />
            </div>
          )}

          {activeTab === 'fare_split' && (
            <FareSplitHub
              trip={trip}
              onUpdateSplitMode={handleUpdateSplitMode}
              onMarkRiderPaid={handleMarkRiderPaid}
            />
          )}

          {activeTab === 'roster' && (
            <RosterManager
              trip={trip}
              onAddRider={handleAddRider}
              onRemoveRider={handleRemoveRider}
              onReorderRiders={handleReorderRiders}
              onOptimizeOrder={handleOptimizeRoute}
            />
          )}

          {activeTab === 'fleet' && (
            <VehicleSelector
              currentVehicle={trip.vehicle}
              onSelectVehicle={handleSelectVehicle}
              trip={trip}
            />
          )}

          {activeTab === 'shared_pools' && (
            <SharedPoolMarketplace
              onJoinPool={handleJoinPool}
            />
          )}
        </div>
      </main>

      {/* Floating Quick Group Chat Drawer */}
      <GroupChatDrawer
        trip={trip}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onSendMessage={handleSendMessage}
      />

      {/* New Group Trip Builder Modal */}
      <TripBuilderModal
        isOpen={isTripBuilderOpen}
        onClose={() => setIsTripBuilderOpen(false)}
        onCreateTrip={(newTrip) => {
          setTrip(newTrip);
          setActiveTab('active_route');
          showToast(`Group trip "${newTrip.title}" launched!`);
        }}
      />

      {/* Quiet, Anti-slop Footer */}
      <footer className="mt-auto border-t border-neutral-900 bg-neutral-950 py-6 px-4 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-300">Wayfare Technologies</span>
            <span>·</span>
            <span>Group Mobility &amp; Multi-Stop Carpooling Platform</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>24/7 Escrow Settlement</span>
            <span>·</span>
            <span>Commercial Fleet Insurance</span>
            <span>·</span>
            <span>Carbon-Offset Certified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
