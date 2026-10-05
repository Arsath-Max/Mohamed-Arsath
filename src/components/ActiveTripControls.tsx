import React, { useState } from 'react';
import { Trip, CurbsideStatus, JukeboxTrack } from '../types';
import { 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  Music, 
  ThumbsUp, 
  Plus, 
  Thermometer, 
  Volume2, 
  VolumeX, 
  Share2, 
  Check, 
  UserCheck,
  AlertCircle
} from 'lucide-react';

interface ActiveTripControlsProps {
  trip: Trip;
  onUpdateCurbsideStatus: (riderId: string, status: CurbsideStatus) => void;
  onAddSong: (title: string, artist: string) => void;
  onVoteSong: (songId: string) => void;
  onUpdateCabinTemp: (temp: number) => void;
  onToggleQuietMode: () => void;
  onOpenChat: () => void;
}

export const ActiveTripControls: React.FC<ActiveTripControlsProps> = ({
  trip,
  onUpdateCurbsideStatus,
  onAddSong,
  onVoteSong,
  onUpdateCabinTemp,
  onToggleQuietMode,
  onOpenChat,
}) => {
  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongArtist, setNewSongArtist] = useState('');
  const [showAddSong, setShowAddSong] = useState(false);
  const [sharedToast, setSharedToast] = useState(false);
  const [callingDriver, setCallingDriver] = useState(false);

  const handleShareLiveTrack = () => {
    navigator.clipboard.writeText(`https://wayfare.travel/live/${trip.id}?pin=${trip.emergencyPin}`);
    setSharedToast(true);
    setTimeout(() => setSharedToast(false), 3000);
  };

  const handleCallDriver = () => {
    setCallingDriver(true);
    setTimeout(() => setCallingDriver(false), 2500);
  };

  const handleAddSongSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSongTitle.trim()) return;
    onAddSong(newSongTitle, newSongArtist || 'Various Artists');
    setNewSongTitle('');
    setNewSongArtist('');
    setShowAddSong(false);
  };

  return (
    <div className="space-y-6">
      {/* Driver Card & Safety Verification */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={trip.driver.avatar}
                alt={trip.driver.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-neutral-900" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{trip.driver.name}</h3>
                <span className="text-xs text-amber-400 font-bold font-mono-nums">
                  ★ {trip.driver.rating}
                </span>
                <span className="text-xs text-neutral-400 font-mono-nums">
                  ({trip.driver.totalTrips} trips)
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-0.5">{trip.driver.carModel}</p>
              <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
                <span>Plate: <strong className="text-white font-mono-nums tracking-wider">{trip.driver.licensePlate}</strong></span>
                <span>·</span>
                <span>PIN: <strong className="text-emerald-400 font-mono-nums tracking-wider">{trip.emergencyPin}</strong></span>
              </div>
            </div>
          </div>

          {/* Contact actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCallDriver}
              className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{callingDriver ? 'Dialing Driver...' : 'Call Driver'}</span>
            </button>
            <button
              onClick={onOpenChat}
              className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
              <span>Group Chat</span>
            </button>
            <button
              onClick={handleShareLiveTrack}
              title="Share live link with flight coordinators or family"
              className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg border border-neutral-700 transition-colors"
            >
              {sharedToast ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {sharedToast && (
          <div className="mt-3 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 rounded-lg px-3 py-2 flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Live family tracking URL copied! Recipients can view ETA without installing any app.</span>
          </div>
        )}
      </div>

      {/* Two Column Grid: Rider Curbside Status & Group In-Cabin Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Curbside Check-In Sync */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Curbside Pickup Status</h3>
              <p className="text-xs text-neutral-400">
                Tap your status when you step down to the curb to alert the driver.
              </p>
            </div>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="space-y-3">
            {trip.riders.map((rider, index) => {
              const isBoarded = rider.curbsideStatus === 'boarded';
              const isCurbside = rider.curbsideStatus === 'curbside';

              return (
                <div
                  key={rider.id}
                  className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={rider.avatar}
                      alt={rider.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover border border-neutral-700"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div>
                      <div className="text-xs font-semibold text-white">
                        {rider.name} {rider.isHost && '(Host)'}
                      </div>
                      <div className="text-[10px] text-neutral-400 truncate max-w-[180px]">
                        {rider.pickupAddress}
                      </div>
                    </div>
                  </div>

                  {/* Status Segmented Buttons */}
                  <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
                    <button
                      onClick={() => onUpdateCurbsideStatus(rider.id, 'waiting')}
                      className={`px-2 py-1 text-[10px] font-medium rounded transition-colors ${
                        rider.curbsideStatus === 'waiting'
                          ? 'bg-neutral-800 text-neutral-200'
                          : 'text-neutral-500 hover:text-neutral-300'
                      }`}
                    >
                      Waiting
                    </button>
                    <button
                      onClick={() => onUpdateCurbsideStatus(rider.id, 'curbside')}
                      className={`px-2 py-1 text-[10px] font-medium rounded transition-colors ${
                        isCurbside
                          ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                          : 'text-neutral-400 hover:text-amber-300'
                      }`}
                    >
                      Curbside
                    </button>
                    <button
                      onClick={() => onUpdateCurbsideStatus(rider.id, 'boarded')}
                      className={`px-2 py-1 text-[10px] font-medium rounded transition-colors ${
                        isBoarded
                          ? 'bg-emerald-500 text-neutral-950 font-bold shadow'
                          : 'text-neutral-400 hover:text-emerald-300'
                      }`}
                    >
                      Boarded
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Group Cabin Preferences: Jukebox & AC */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Group Cabin Jukebox</h3>
              <p className="text-xs text-neutral-400">
                Collaborative playlist stream synced to vehicle speakers.
              </p>
            </div>
            <button
              onClick={() => setShowAddSong(!showAddSong)}
              className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Track</span>
            </button>
          </div>

          {/* Add Song Form */}
          {showAddSong && (
            <form onSubmit={handleAddSongSubmit} className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-2">
              <input
                type="text"
                placeholder="Song title..."
                value={newSongTitle}
                onChange={(e) => setNewSongTitle(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Artist name (optional)..."
                  value={newSongArtist}
                  onChange={(e) => setNewSongArtist(e.target.value)}
                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded transition-colors"
                >
                  Queue
                </button>
              </div>
            </form>
          )}

          {/* Jukebox Track List */}
          <div className="space-y-2">
            {trip.jukebox.map((track) => (
              <div
                key={track.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                  track.isPlaying
                    ? 'bg-emerald-950/30 border-emerald-800/60 text-white'
                    : 'bg-neutral-950/60 border-neutral-800/80 text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    track.isPlaying ? 'bg-emerald-500 text-neutral-950' : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    <Music className="w-3 h-3" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{track.title}</div>
                    <div className="text-[10px] text-neutral-400 truncate">
                      {track.artist} · Added by {track.addedBy}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onVoteSong(track.id)}
                    className="flex items-center gap-1 px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded font-mono-nums text-[10px] border border-neutral-700 transition-colors"
                  >
                    <ThumbsUp className="w-3 h-3 text-emerald-400" />
                    <span>{track.votes}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cabin Temperature & Mode Bar */}
          <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-neutral-300">
              <Thermometer className="w-4 h-4 text-sky-400" />
              <span>Cabin Climate:</span>
              <span className="font-mono-nums font-bold text-white">{trip.cabinSettings.temperatureF}°F</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateCabinTemp(trip.cabinSettings.temperatureF - 1)}
                className="w-6 h-6 bg-neutral-800 hover:bg-neutral-700 text-white rounded flex items-center justify-center font-bold"
              >
                -
              </button>
              <button
                onClick={() => onUpdateCabinTemp(trip.cabinSettings.temperatureF + 1)}
                className="w-6 h-6 bg-neutral-800 hover:bg-neutral-700 text-white rounded flex items-center justify-center font-bold"
              >
                +
              </button>
              <div className="h-4 w-px bg-neutral-800 mx-1" />
              <button
                onClick={onToggleQuietMode}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  trip.cabinSettings.quietMode
                    ? 'bg-sky-500 text-neutral-950 font-bold'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {trip.cabinSettings.quietMode ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{trip.cabinSettings.quietMode ? 'Quiet Ride On' : 'Quiet Mode'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
