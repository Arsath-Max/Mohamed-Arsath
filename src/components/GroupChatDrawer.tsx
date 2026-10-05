import React, { useState } from 'react';
import { Trip, ChatMessage } from '../types';
import { X, Send, User, Sparkles } from 'lucide-react';

interface GroupChatDrawerProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (text: string) => void;
}

export const GroupChatDrawer: React.FC<GroupChatDrawerProps> = ({
  trip,
  isOpen,
  onClose,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const quickReplies = [
    'Waiting curbside now!',
    'Coming down elevator',
    'Just paid my split',
    'Have 2 heavy suitcases',
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-neutral-900 border-l border-neutral-800 flex flex-col h-full shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          <div>
            <h3 className="text-sm font-bold text-white">Group Ride Dispatch Chat</h3>
            <p className="text-xs text-neutral-400">
              {trip.riders.length} Riders · Driver {trip.driver.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {trip.groupChat.map((msg) => {
            const isDriver = msg.senderId === trip.driver.id;
            const isMe = msg.senderName.includes('(You)');

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <img
                  src={msg.senderAvatar}
                  alt={msg.senderName}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border border-neutral-700 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />

                <div className={`max-w-[80%] ${isMe ? 'text-right' : 'text-left'}`}>
                  <div className="text-[10px] text-neutral-400 mb-0.5">
                    {msg.senderName} · {msg.timestamp}
                  </div>
                  <div
                    className={`rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                      isMe
                        ? 'bg-emerald-500 text-neutral-950 font-medium rounded-tr-none'
                        : isDriver
                          ? 'bg-neutral-800 text-white border border-emerald-500/40 rounded-tl-none'
                          : 'bg-neutral-800 text-neutral-200 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2 border-t border-neutral-800/80 bg-neutral-950/60 flex items-center gap-1.5 overflow-x-auto">
          {quickReplies.map((q) => (
            <button
              key={q}
              onClick={() => onSendMessage(q)}
              className="text-[11px] text-neutral-300 hover:text-white bg-neutral-800/80 hover:bg-neutral-800 px-2.5 py-1 rounded-full whitespace-nowrap border border-neutral-700/60 transition-colors shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-neutral-800 bg-neutral-950 flex items-center gap-2">
          <input
            type="text"
            placeholder="Message group and driver..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 bg-emerald-400 disabled:opacity-40 hover:bg-emerald-300 text-neutral-950 rounded-xl font-bold transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
