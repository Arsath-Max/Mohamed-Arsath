import React from 'react';
import { Plus, Smartphone, Monitor } from 'lucide-react';

interface TopNavProps {
  activeTab: 'active_route' | 'roster' | 'fleet' | 'fare_split' | 'shared_pools';
  onTabChange: (tab: 'active_route' | 'roster' | 'fleet' | 'fare_split' | 'shared_pools') => void;
  onNewTripClick: () => void;
  isMobilePreview: boolean;
  onToggleMobilePreview: () => void;
  pendingPaymentCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  onNewTripClick,
  isMobilePreview,
  onToggleMobilePreview,
  pendingPaymentCount,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => onTabChange('active_route')}
            className="text-left text-xl font-extrabold tracking-tight text-white hover:text-emerald-400 transition-colors font-display"
          >
            Wayfare
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400">
          <button
            onClick={() => onTabChange('active_route')}
            className={`transition-colors relative py-1 ${
              activeTab === 'active_route' ? 'text-white' : 'hover:text-neutral-200'
            }`}
          >
            Live Trip
            {activeTab === 'active_route' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onTabChange('fare_split')}
            className={`transition-colors relative py-1 flex items-center gap-1.5 ${
              activeTab === 'fare_split' ? 'text-white' : 'hover:text-neutral-200'
            }`}
          >
            Split Fare
            {pendingPaymentCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
            {activeTab === 'fare_split' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onTabChange('roster')}
            className={`transition-colors relative py-1 ${
              activeTab === 'roster' ? 'text-white' : 'hover:text-neutral-200'
            }`}
          >
            Riders &amp; Bags
            {activeTab === 'roster' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onTabChange('fleet')}
            className={`transition-colors relative py-1 ${
              activeTab === 'fleet' ? 'text-white' : 'hover:text-neutral-200'
            }`}
          >
            Fleet Options
            {activeTab === 'fleet' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => onTabChange('shared_pools')}
            className={`transition-colors relative py-1 flex items-center gap-1.5 ${
              activeTab === 'shared_pools' ? 'text-white' : 'hover:text-neutral-200'
            }`}
          >
            Shared Pools
            <span className="text-[10px] text-emerald-400 font-mono-nums bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">
              Save 65%
            </span>
            {activeTab === 'shared_pools' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile frame preview toggle */}
          <button
            onClick={onToggleMobilePreview}
            title={isMobilePreview ? 'Switch to Full Desktop View' : 'Preview in Mobile Device Frame'}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-900 hover:bg-neutral-800 rounded-lg border border-neutral-800 transition-colors"
          >
            {isMobilePreview ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-neutral-400" />
                <span>Desktop</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-neutral-400" />
                <span>Mobile View</span>
              </>
            )}
          </button>

          <button
            onClick={onNewTripClick}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all active:scale-[0.98] whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Plan Group Trip</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-neutral-800/80 bg-neutral-950/95 px-2 py-2 text-xs">
        <button
          onClick={() => onTabChange('active_route')}
          className={`px-2.5 py-1 rounded-md transition-colors ${
            activeTab === 'active_route' ? 'text-emerald-400 font-medium' : 'text-neutral-400'
          }`}
        >
          Live Route
        </button>
        <button
          onClick={() => onTabChange('fare_split')}
          className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
            activeTab === 'fare_split' ? 'text-emerald-400 font-medium' : 'text-neutral-400'
          }`}
        >
          Split Fare
          {pendingPaymentCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
        </button>
        <button
          onClick={() => onTabChange('roster')}
          className={`px-2.5 py-1 rounded-md transition-colors ${
            activeTab === 'roster' ? 'text-emerald-400 font-medium' : 'text-neutral-400'
          }`}
        >
          Riders
        </button>
        <button
          onClick={() => onTabChange('shared_pools')}
          className={`px-2.5 py-1 rounded-md transition-colors ${
            activeTab === 'shared_pools' ? 'text-emerald-400 font-medium' : 'text-neutral-400'
          }`}
        >
          Pools
        </button>
      </div>
    </header>
  );
};
