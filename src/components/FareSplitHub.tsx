import React, { useState } from 'react';
import { Trip, Rider, SplitMode } from '../types';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Send, 
  QrCode, 
  Copy, 
  Sparkles, 
  DollarSign, 
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';

interface FareSplitHubProps {
  trip: Trip;
  onUpdateSplitMode: (mode: SplitMode) => void;
  onMarkRiderPaid: (riderId: string) => void;
  onInviteRider?: () => void;
}

export const FareSplitHub: React.FC<FareSplitHubProps> = ({
  trip,
  onUpdateSplitMode,
  onMarkRiderPaid,
  onInviteRider,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [customHostCover, setCustomHostCover] = useState<number>(30);

  const totalFare = trip.baseTotalFare;
  const riders = trip.riders;
  const riderCount = riders.length;

  // Compute splits based on selected mode
  const getRiderShare = (rider: Rider): number => {
    if (trip.splitMode === 'equal') {
      return Number((totalFare / riderCount).toFixed(2));
    }
    if (trip.splitMode === 'distance_proportional') {
      const totalRiderMiles = riders.reduce((acc, r) => acc + r.distanceMiles, 0);
      const ratio = rider.distanceMiles / (totalRiderMiles || 1);
      return Number((totalFare * ratio).toFixed(2));
    }
    // Custom: Host pays customHostCover, rest is split evenly among non-hosts
    if (rider.isHost) {
      return customHostCover;
    } else {
      const remaining = Math.max(0, totalFare - customHostCover);
      const nonHostCount = Math.max(1, riderCount - 1);
      return Number((remaining / nonHostCount).toFixed(2));
    }
  };

  const totalCollected = riders.reduce((acc, r) => {
    return r.paymentStatus === 'paid' ? acc + getRiderShare(r) : acc;
  }, 0);

  const percentCollected = Math.min(100, Math.round((totalCollected / totalFare) * 100));
  const paidCount = riders.filter((r) => r.paymentStatus === 'paid').length;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://wayfare.travel/join/${trip.inviteCode}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4">
          <span className="text-xs text-neutral-400">Total Group Fare</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-white font-mono-nums">${totalFare.toFixed(2)}</span>
            <span className="text-xs text-neutral-500">incl. tolls &amp; fees</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-2">
            Average ${(totalFare / Math.max(1, riderCount)).toFixed(2)} / passenger
          </div>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Escrow Collection</span>
            <span className="text-xs font-semibold text-emerald-400 font-mono-nums">{percentCollected}%</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-400 font-mono-nums">${totalCollected.toFixed(2)}</span>
            <span className="text-xs text-neutral-500">/ ${totalFare.toFixed(2)}</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentCollected}%` }}
            />
          </div>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-xs text-neutral-400">Rider Settlement</span>
            <div className="text-xl font-bold text-white mt-1">
              {paidCount} of {riderCount} Settled
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleCopyLink}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg border border-neutral-700 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied Link' : 'Copy Split Link'}</span>
            </button>
            <button
              onClick={() => setShowQrModal(true)}
              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg border border-neutral-700 transition-colors"
              title="Show Group QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Split Logic Selection Tabs */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Select Cost Split Algorithm</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Choose how the multi-stop transit fare is apportioned across the group.
            </p>
          </div>

          {/* Interactive Filter Control Tabs */}
          <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded-lg border border-neutral-800/80 self-start sm:self-auto">
            <button
              onClick={() => onUpdateSplitMode('distance_proportional')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                trip.splitMode === 'distance_proportional'
                  ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Proportional by Miles
            </button>
            <button
              onClick={() => onUpdateSplitMode('equal')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                trip.splitMode === 'equal'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Equal Split
            </button>
            <button
              onClick={() => onUpdateSplitMode('custom')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                trip.splitMode === 'custom'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Host Subsidized
            </button>
          </div>
        </div>

        {trip.splitMode === 'distance_proportional' && (
          <div className="text-xs text-neutral-400 bg-neutral-950/60 rounded-lg p-3 border border-neutral-800/60 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-neutral-200">Smart Distance Fair-Share Active: </span>
              Each rider pays proportional to the distance of their individual pickup to the destination. Riders picked up closer pay less, preventing unfair splits.
            </div>
          </div>
        )}

        {trip.splitMode === 'custom' && (
          <div className="text-xs text-neutral-300 bg-neutral-950/60 rounded-lg p-3 border border-neutral-800/60 flex items-center justify-between gap-4">
            <span>Organizer Contribution:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono-nums text-emerald-400 font-bold">${customHostCover}</span>
              <input
                type="range"
                min="0"
                max={totalFare}
                step="5"
                value={customHostCover}
                onChange={(e) => setCustomHostCover(Number(e.target.value))}
                className="w-32 accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Rider Split Breakdown Table / Cards */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Individual Fare Allocation</h3>
          <span className="text-xs text-neutral-400 font-mono-nums">{riders.length} Passengers</span>
        </div>

        <div className="divide-y divide-neutral-800/60">
          {riders.map((rider, index) => {
            const share = getRiderShare(rider);
            const isPaid = rider.paymentStatus === 'paid';

            return (
              <div
                key={rider.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-850/50 transition-colors"
              >
                {/* Rider Info */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={rider.avatar}
                      alt={rider.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border border-neutral-700"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    {isPaid ? (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 text-neutral-950 rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 text-neutral-950 rounded-full flex items-center justify-center">
                        <Clock className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{rider.name}</span>
                      {rider.isHost && (
                        <span className="text-[10px] text-neutral-400 font-mono-nums">Host</span>
                      )}
                    </div>
                    {/* Unboxed metadata line with typographic bullet separators */}
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-0.5">
                      <span>Stop #{index + 1}</span>
                      <span>·</span>
                      <span className="font-mono-nums">{rider.distanceMiles} mi segment</span>
                      <span>·</span>
                      <span>{rider.luggage.carryOn} carry-on, {rider.luggage.checked} checked</span>
                    </div>
                  </div>
                </div>

                {/* Amount & Payment Action */}
                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <div className="text-base font-bold text-white font-mono-nums">
                      ${share.toFixed(2)}
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      {isPaid ? (
                        <span className="text-emerald-400 flex items-center gap-1 justify-end">
                          <CheckCircle2 className="w-3 h-3" />
                          Paid via {rider.paymentMethod.replace('_', ' ').toUpperCase()}
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3" />
                          Payment Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {!isPaid ? (
                    <button
                      onClick={() => onMarkRiderPaid(rider.id)}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-xs rounded-lg transition-colors shadow-sm active:scale-95"
                    >
                      Simulate Payment
                    </button>
                  ) : (
                    <button
                      onClick={() => onMarkRiderPaid(rider.id)}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded-lg transition-colors border border-neutral-700"
                      title="Toggle payment status for testing"
                    >
                      Mark Pending
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Escrow Guarantee Notice */}
      <div className="p-4 bg-neutral-900/40 border border-neutral-800/80 rounded-xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-neutral-400">
          <strong className="text-neutral-200">Wayfare Escrow Protection:</strong> Funds are pre-authorized and held securely until the driver drops off all group passengers at {trip.destination.name}. If a friend cancels 2+ hours ahead, their seat is automatically refunded and re-calculated.
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-sm w-full text-center">
            <h3 className="text-base font-semibold text-white">Scan to Pay Your Split</h3>
            <p className="text-xs text-neutral-400 mt-1 mb-4">
              Hold camera over code to open Apple Pay or Venmo split link.
            </p>

            <div className="p-4 bg-white rounded-xl mx-auto w-48 h-48 flex items-center justify-center shadow-lg">
              {/* Synthetic Vector QR Code */}
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <rect x="0" y="0" width="30" height="30" fill="#000" />
                <rect x="5" y="5" width="20" height="20" fill="#fff" />
                <rect x="10" y="10" width="10" height="10" fill="#000" />

                <rect x="70" y="0" width="30" height="30" fill="#000" />
                <rect x="75" y="5" width="20" height="20" fill="#fff" />
                <rect x="80" y="10" width="10" height="10" fill="#000" />

                <rect x="0" y="70" width="30" height="30" fill="#000" />
                <rect x="5" y="75" width="20" height="20" fill="#fff" />
                <rect x="10" y="80" width="10" height="10" fill="#000" />

                {/* Pattern dots */}
                <rect x="35" y="10" width="10" height="10" fill="#000" />
                <rect x="50" y="15" width="15" height="10" fill="#000" />
                <rect x="35" y="35" width="30" height="30" fill="#000" />
                <rect x="42" y="42" width="16" height="16" fill="#fff" />
                <rect x="70" y="40" width="10" height="20" fill="#000" />
                <rect x="40" y="75" width="20" height="15" fill="#000" />
                <rect x="70" y="75" width="20" height="20" fill="#000" />
              </svg>
            </div>

            <div className="mt-4 text-xs font-mono-nums text-neutral-300">
              Trip PIN: <span className="font-bold text-emerald-400">{trip.emergencyPin}</span> · {trip.inviteCode}
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="mt-6 w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
