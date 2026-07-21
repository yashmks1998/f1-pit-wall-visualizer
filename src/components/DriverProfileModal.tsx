import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Trophy, Award, User, Calendar, Globe, Hash } from 'lucide-react';
import { DriverStanding } from '../types/f1';
import { FLAG_MAP } from '../utils/f1Constants';

interface DriverProfileModalProps {
  driverId: string;
  driverStandings: DriverStanding[];
  getDriverDetails: (code: string, constructorId: string, url?: string) => { headshot: string; color: string };
  onClose: () => void;
}

interface WikiSummary {
  extract?: string;
  thumbnail?: { source: string };
  description?: string;
}

export function DriverProfileModal({
  driverId,
  driverStandings,
  getDriverDetails,
  onClose,
}: DriverProfileModalProps) {
  const [wikiSummary, setWikiSummary] = useState<WikiSummary | null>(null);
  const [loadingBio, setLoadingBio] = useState(false);

  // Determine mobile purely via window.innerWidth so it's reliable
  const isMobileNow = typeof window !== 'undefined' && window.innerWidth < 768;

  const standing = driverStandings.find(s => s.Driver.driverId === driverId);

  useEffect(() => {
    if (!standing) return;
    const fetchWikiBio = async () => {
      setLoadingBio(true);
      try {
        const urlParts = standing.Driver.url.split('/wiki/');
        const title = urlParts.length > 1 ? urlParts[1] : '';
        if (title) {
          const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`);
          if (res.ok) {
            const data = await res.json();
            setWikiSummary(data);
          }
        }
      } catch (err) {
        console.error('Error fetching driver biography:', err);
      } finally {
        setLoadingBio(false);
      }
    };
    fetchWikiBio();
  }, [standing]);

  if (!standing) return null;

  const { Driver, Constructors, points, wins, position } = standing;
  const constructor = Constructors[0];
  const colorInfo = getDriverDetails(Driver.code, constructor?.constructorId, Driver.url);
  const flag = FLAG_MAP[Driver.nationality] || '';
  const heroImage = wikiSummary?.thumbnail?.source || colorInfo.headshot;

  return (
    // Overlay — always fixed, always full viewport, always on top
    <div
      style={{
        position: 'fixed',
        inset: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: isMobileNow ? 'flex-end' : 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: isMobileNow ? 0 : '1rem',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: isMobileNow ? '100%' : 0, opacity: isMobileNow ? 1 : 0, scale: isMobileNow ? 1 : 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: isMobileNow ? '100%' : 0, opacity: isMobileNow ? 1 : 0, scale: isMobileNow ? 1 : 0.95 }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: isMobileNow ? '100%' : '680px',
          maxHeight: isMobileNow ? '90dvh' : '85dvh',
          overflowY: 'auto',
          position: 'relative',
          backgroundColor: 'var(--modal-bg, #ffffff)',
          borderRadius: isMobileNow ? '24px 24px 0 0' : '24px',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
        }}
        className="dark:[--modal-bg:#0f0f0f] [--modal-bg:#ffffff]"
      >
        {/* Glow accent */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            left: -80,
            width: 200,
            height: 200,
            borderRadius: '50%',
            backgroundColor: colorInfo.color,
            filter: 'blur(60px)',
            opacity: 0.15,
            pointerEvents: 'none',
          }}
        />

        {/* Drag handle for mobile */}
        {isMobileNow && (
          <div
            style={{
              width: 48,
              height: 4,
              borderRadius: 9999,
              backgroundColor: 'rgba(150,150,150,0.4)',
              margin: '12px auto 4px',
              cursor: 'pointer',
            }}
            onClick={onClose}
          />
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 10,
            padding: '8px',
            borderRadius: '50%',
            border: '1px solid rgba(128,128,128,0.3)',
            background: 'rgba(128,128,128,0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#888',
          }}
        >
          <X size={16} />
        </button>

        {/* Content layout */}
        <div style={{ display: 'flex', flexDirection: isMobileNow ? 'column' : 'row' }}>

          {/* Portrait section */}
          <div
            style={{
              padding: '2rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              borderBottom: isMobileNow ? '1px solid rgba(128,128,128,0.2)' : 'none',
              borderRight: isMobileNow ? 'none' : '1px solid rgba(128,128,128,0.2)',
              minWidth: isMobileNow ? 'auto' : '220px',
              position: 'relative',
            }}
          >
            {/* Driver photo */}
            <div
              style={{
                width: isMobileNow ? 96 : 128,
                height: isMobileNow ? 96 : 128,
                borderRadius: 16,
                overflow: 'hidden',
                border: `2px solid ${colorInfo.color}40`,
                flexShrink: 0,
              }}
            >
              <img
                src={heroImage}
                alt={Driver.familyName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { (e.target as HTMLImageElement).src = colorInfo.headshot; }}
              />
            </div>

            {/* Team badge */}
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                padding: '4px 12px',
                borderRadius: 9999,
                color: '#fff',
                backgroundColor: colorInfo.color,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {constructor?.name || 'F1 Team'}
            </span>
          </div>

          {/* Info section */}
          <div
            style={{
              flex: 1,
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              minWidth: 0,
            }}
          >
            {/* Name & number */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 16, color: '#888' }}>
                  #{Driver.permanentNumber}
                </span>
                <span style={{ fontSize: 20 }}>{flag}</span>
              </div>
              <h3
                style={{
                  margin: '4px 0 0',
                  fontSize: isMobileNow ? 22 : 28,
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.1,
                  color: 'inherit',
                }}
                className="text-gray-900 dark:text-gray-100"
              >
                {Driver.givenName} {Driver.familyName}
              </h3>
              <p style={{ marginTop: 4, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: colorInfo.color }}>
                {wikiSummary?.description || `${Driver.nationality} Racing Driver`}
              </p>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, borderTop: '1px solid rgba(128,128,128,0.2)', paddingTop: 12 }}>
              {[
                { icon: <User size={14} />, label: 'Standing', value: `P${position}`, accent: '#ff1801' },
                { icon: <Trophy size={14} />, label: 'Wins', value: String(wins), accent: undefined },
                { icon: <Award size={14} />, label: 'Points', value: String(points), accent: undefined },
              ].map(({ icon, label, value, accent }) => (
                <div
                  key={label}
                  style={{
                    border: '1px solid rgba(128,128,128,0.2)',
                    borderRadius: 12,
                    padding: '10px 6px',
                    textAlign: 'center',
                    background: 'rgba(128,128,128,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', color: '#888', marginBottom: 4 }}>{icon}</div>
                  <span style={{ display: 'block', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888' }}>{label}</span>
                  <span style={{ display: 'block', fontSize: 16, fontWeight: 900, fontFamily: 'monospace', marginTop: 4, color: accent || 'inherit' }}
                    className={accent ? '' : 'text-gray-900 dark:text-gray-100'}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Biography */}
            <div style={{ borderTop: '1px solid rgba(128,128,128,0.2)', paddingTop: 12 }}>
              <h4 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}
                className="text-gray-900 dark:text-gray-100"
              >
                Biography
              </h4>
              {loadingBio ? (
                <div style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="w-5 h-5 border-2 border-gray-200/20 border-t-[#ff1801] rounded-full animate-spin" />
                </div>
              ) : (
                <p style={{ fontSize: 11, lineHeight: 1.65, maxHeight: 120, overflowY: 'auto', textAlign: 'justify' }}
                  className="text-gray-700 dark:text-gray-300"
                >
                  {wikiSummary?.extract || 'No biographical data available.'}
                </p>
              )}
            </div>

            {/* Footer meta */}
            <div style={{ borderTop: '1px solid rgba(128,128,128,0.2)', paddingTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="text-gray-500 dark:text-gray-400">
                <Calendar size={12} />
                <span style={{ fontSize: 11, fontWeight: 600 }}>
                  Born: {new Date(Driver.dateOfBirth).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="text-gray-500 dark:text-gray-400">
                <Globe size={12} />
                <span style={{ fontSize: 11, fontWeight: 600 }}>Nation: {Driver.nationality}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, gridColumn: '1 / -1' }}>
                <Hash size={12} className="text-gray-400" />
                <a
                  href={Driver.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 11, fontWeight: 600, color: '#ff1801', textDecoration: 'none' }}
                >
                  Wiki Reference Log →
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
