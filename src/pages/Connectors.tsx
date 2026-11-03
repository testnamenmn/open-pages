import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { connectors, OAuthState } from '../data/connectors';
import { ConnectorId } from '../types/schema';
import {
  ExternalLink,
  Check,
  AlertCircle,
  Loader2,
  Shield,
  Key,
  RefreshCw,
  Info,
} from 'lucide-react';

export default function Connectors() {
  const [oauthStates, setOauthStates] = useState<Record<ConnectorId, OAuthState>>({
    github: { connectorId: 'github', status: 'idle' },
    strava: { connectorId: 'strava', status: 'idle' },
    goodreads: { connectorId: 'goodreads', status: 'idle' },
    manual: { connectorId: 'manual', status: 'success', username: 'Manual Entry' },
  });

  const [showOAuthModal, setShowOAuthModal] = useState<ConnectorId | null>(null);

  const initiateOAuth = (connectorId: ConnectorId) => {
    setShowOAuthModal(connectorId);
    setOauthStates((prev) => ({
      ...prev,
      [connectorId]: { ...prev[connectorId], status: 'connecting' },
    }));

    // Simulate OAuth flow
    setTimeout(() => {
      setOauthStates((prev) => ({
        ...prev,
        [connectorId]: {
          ...prev[connectorId],
          status: 'success',
          username: connectorId === 'github' ? 'octocat' : connectorId === 'strava' ? 'runner42' : 'bookworm',
        },
      }));
      setShowOAuthModal(null);
    }, 2500);
  };

  const disconnect = (connectorId: ConnectorId) => {
    setOauthStates((prev) => ({
      ...prev,
      [connectorId]: { connectorId, status: 'idle' },
    }));
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <Key size={18} className="text-brand-400" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">API Connectors</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Connect Your Data</h1>
          <p className="text-gray-400">
            Securely link your accounts to automatically populate widgets with real data.
          </p>
        </motion.div>

        {/* OAuth Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-4 mb-6 flex items-start gap-3 border border-brand-500/20"
        >
          <Shield size={18} className="text-brand-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-white font-medium">OAuth 2.0 Secure Authentication</p>
            <p className="text-xs text-gray-400 mt-1">
              All connections use industry-standard OAuth 2.0. We never see your passwords.
              You can revoke access at any time from your connected services.
            </p>
          </div>
        </motion.div>

        {/* Connectors Grid */}
        <div className="space-y-4">
          {connectors.map((connector, i) => {
            const state = oauthStates[connector.id];
            const isConnected = state.status === 'success';

            return (
              <motion.div
                key={connector.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="glass-card rounded-2xl p-5 relative overflow-hidden"
              >
                {/* Background glow */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10"
                  style={{ background: connector.color }}
                />

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: `${connector.color}15` }}
                  >
                    {connector.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-white">{connector.name}</h3>
                      {isConnected && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-accent-green/10 rounded-full">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent-green" />
                          <span className="text-[10px] text-accent-green">Connected</span>
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{connector.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {connector.widgets.map((w) => (
                        <span
                          key={w}
                          className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-gray-500"
                        >
                          {w.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                    {isConnected && state.username && (
                      <p className="text-xs text-gray-500 mt-2">
                        Logged in as <span className="text-brand-300">{state.username}</span>
                      </p>
                    )}
                  </div>

                  {/* Action */}
                  <div className="shrink-0">
                    {state.status === 'connecting' ? (
                      <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-3 rounded-lg">
                        <Loader2 size={14} className="animate-spin text-brand-400" />
                        <span className="text-xs text-gray-400">Connecting...</span>
                      </div>
                    ) : state.status === 'error' ? (
                      <div className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <AlertCircle size={14} className="text-red-400" />
                        <span className="text-xs text-red-400">{state.error || 'Failed'}</span>
                      </div>
                    ) : isConnected ? (
                      <div className="flex gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:bg-white/10">
                          <RefreshCw size={12} />
                          Sync
                        </button>
                        <button
                          onClick={() => disconnect(connector.id)}
                          className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 hover:bg-red-500/20"
                        >
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => initiateOAuth(connector.id)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
                        style={{ background: connector.color }}
                      >
                        <ExternalLink size={14} />
                        Connect
                      </button>
                    )}
                  </div>
                </div>

                {/* Scopes */}
                {connector.scopes.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Info size={10} className="text-gray-600" />
                      <span className="text-[10px] text-gray-600">Requested permissions:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {connector.scopes.map((scope) => (
                        <span
                          key={scope}
                          className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-gray-500 font-mono"
                        >
                          {scope}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* OAuth Modal */}
        <AnimatePresence>
          {showOAuthModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="glass-card rounded-2xl p-6 max-w-sm w-full border border-white/10"
              >
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-surface-3 flex items-center justify-center mx-auto mb-4">
                    <Loader2 size={24} className="animate-spin text-brand-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Connecting to {connectors.find((c) => c.id === showOAuthModal)?.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Redirecting to authorization page...
                  </p>
                  <div className="mt-4 p-3 bg-surface-3 rounded-lg">
                    <p className="text-[10px] text-gray-500 font-mono">
                      {connectors.find((c) => c.id === showOAuthModal)?.oauthUrl}
                      ?client_id=openpages&scope=read
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
