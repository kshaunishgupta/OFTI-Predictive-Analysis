import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, TrendingUp, AlertTriangle, Users, Activity,
  Shield, Globe, Wallet, Store, BarChart3, LineChart,
  Layers, Target, Bell, Eye, FileText, Zap, Database,
  ChevronDown, Network, ArrowUp
} from 'lucide-react';

const OOREDOO_RED = '#ed1c24';
const CHARCOAL = '#1a1a1a';
const LIGHT_GRAY = '#f3f4f6';

// ── Data ──────────────────────────────────────────────────────────────────────

const capabilities = [
  { id: 'classification', label: 'Classification',        icon: Brain },
  { id: 'forecasting',    label: 'Forecasting',           icon: TrendingUp },
  { id: 'anomaly',        label: 'Anomaly Detection',     icon: AlertTriangle },
  { id: 'clustering',     label: 'Clustering',            icon: Users },
  { id: 'timeseries',     label: 'Time Series Analytics', icon: Activity },
];

const factors = [
  { id: 'customer',    label: 'Customer Behavior',                     icon: Users },
  { id: 'transaction', label: 'Transaction-Level Factors',             icon: Activity },
  { id: 'remittance',  label: 'International Remittance (IR) Factors', icon: Globe },
  { id: 'wallet',      label: 'Wallet Cash Flow & Liquidity',          icon: Wallet },
  { id: 'merchant',    label: 'Business & Merchant Factors',           icon: Store },
  { id: 'fraud',       label: 'Fraud & Risk',                          icon: Shield },
  { id: 'macro',       label: 'External & Macro Factors',              icon: BarChart3 },
];

const deliverables = [
  { id: 'ml_risk',         label: 'ML Risk Models',                   icon: Brain },
  { id: 'forecasting_eng', label: 'Forecasting Engines',              icon: TrendingUp },
  { id: 'fraud_algo',      label: 'Fraud Detection Algorithms',       icon: AlertTriangle },
  { id: 'liquidity_dash',  label: 'Liquidity Monitoring Dashboards',  icon: LineChart },
  { id: 'segmentation',    label: 'Customer Segmentation Models',     icon: Layers },
  { id: 'kpi_dash',        label: 'Executive KPI Dashboards',         icon: Target },
  { id: 'risk_scoring',    label: 'Predictive Risk Scoring',          icon: Shield },
  { id: 'txn_monitor',     label: 'Transaction Monitoring Systems',   icon: Eye },
  { id: 'merchant_intel',  label: 'Merchant Intelligence Reports',    icon: FileText },
  { id: 'alerting',        label: 'Real-Time Alerting Systems',       icon: Bell },
];

const capToFactor = {
  classification: ['customer', 'fraud', 'merchant', 'transaction'],
  forecasting:    ['wallet', 'remittance', 'macro', 'transaction'],
  anomaly:        ['fraud', 'transaction', 'wallet'],
  clustering:     ['customer', 'merchant', 'macro'],
  timeseries:     ['transaction', 'wallet', 'remittance', 'macro'],
};

const factorToDeliverable = {
  customer:    ['segmentation', 'kpi_dash', 'ml_risk'],
  transaction: ['txn_monitor', 'alerting', 'ml_risk', 'forecasting_eng'],
  remittance:  ['forecasting_eng', 'kpi_dash', 'alerting'],
  wallet:      ['liquidity_dash', 'forecasting_eng', 'alerting'],
  merchant:    ['merchant_intel', 'kpi_dash', 'segmentation'],
  fraud:       ['fraud_algo', 'risk_scoring', 'alerting', 'txn_monitor', 'ml_risk'],
  macro:       ['forecasting_eng', 'kpi_dash', 'risk_scoring'],
};

// ── SVG Connections ───────────────────────────────────────────────────────────

function ConnectionLayer({ capRefs, factorRefs, deliverableRefs, activeNode, containerRef }) {
  const [paths, setPaths] = useState([]);

  const getCenter = (el, container) => {
    if (!el || !container) return null;
    const r = el.getBoundingClientRect();
    const c = container.getBoundingClientRect();
    return { x: r.left + r.width / 2 - c.left, top: r.top - c.top, bottom: r.bottom - c.top };
  };

  const ARROW_W = 10;
  const PATH_SHORTEN = 1;

  const buildCurve = (x1, y1, x2, y2) => {
    const endY = y2 - ARROW_W - PATH_SHORTEN;
    const dy = endY - y1;
    return `M ${x1} ${y1} C ${x1} ${y1 + dy * 0.5}, ${x2} ${endY - dy * 0.5}, ${x2} ${endY}`;
  };

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const np = [];
      Object.entries(capToFactor).forEach(([capId, factIds]) => {
        const c1 = getCenter(capRefs.current[capId], containerRef.current);
        if (!c1) return;
        factIds.forEach(fId => {
          const c2 = getCenter(factorRefs.current[fId], containerRef.current);
          if (!c2) return;
          np.push({ id: `${capId}-${fId}`, d: buildCurve(c1.x, c1.bottom, c2.x, c2.top), capId, factId: fId, type: 'cf' });
        });
      });
      Object.entries(factorToDeliverable).forEach(([fId, delIds]) => {
        const c1 = getCenter(factorRefs.current[fId], containerRef.current);
        if (!c1) return;
        delIds.forEach(dId => {
          const c2 = getCenter(deliverableRefs.current[dId], containerRef.current);
          if (!c2) return;
          np.push({ id: `${fId}-${dId}`, d: buildCurve(c1.x, c1.bottom, c2.x, c2.top), factId: fId, delId: dId, type: 'fd' });
        });
      });
      setPaths(np);
    };
    update();
    window.addEventListener('resize', update);
    const t = setTimeout(update, 150);
    return () => { window.removeEventListener('resize', update); clearTimeout(t); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isActive = (path) => {
    if (!activeNode) return false;
    if (activeNode.layer === 'cap') {
      if (path.type === 'cf') return path.capId === activeNode.id;
      if (path.type === 'fd') return (capToFactor[activeNode.id] || []).includes(path.factId);
    }
    if (activeNode.layer === 'factor') {
      if (path.type === 'cf') return path.factId === activeNode.id;
      if (path.type === 'fd') return path.factId === activeNode.id;
    }
    if (activeNode.layer === 'deliverable') {
      if (path.type === 'fd') return path.delId === activeNode.id;
      if (path.type === 'cf') {
        const cf = Object.entries(factorToDeliverable).filter(([, ds]) => ds.includes(activeNode.id)).map(([f]) => f);
        return cf.includes(path.factId);
      }
    }
    return false;
  };

  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible', zIndex: 0 }} shapeRendering="geometricPrecision">
      <defs>
        <marker id="arr"     markerWidth="7" markerHeight="7" refX="0" refY="3.5" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M0,0 L0,7 L7,3.5 z" fill={OOREDOO_RED} />
        </marker>
        <marker id="arr-dim" markerWidth="7" markerHeight="7" refX="0" refY="3.5" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M0,0 L0,7 L7,3.5 z" fill="#adb2bb" />
        </marker>
      </defs>
      {paths.map(path => {
        const active = isActive(path);
        const dimmed = activeNode && !active;
        return (
          <path
            key={path.id}
            d={path.d}
            fill="none"
            stroke={dimmed ? '#d1d5db' : active ? OOREDOO_RED : '#b0b6be'}
            strokeWidth={active ? 1.8 : 1}
            strokeDasharray={active ? 'none' : '5 5'}
            opacity={dimmed ? 0.25 : active ? 1 : 0.72}
            markerEnd={active ? 'url(#arr)' : 'url(#arr-dim)'}
            style={{ transition: 'all 0.3s ease' }}
          />
        );
      })}
    </svg>
  );
}

// ── Node Card ─────────────────────────────────────────────────────────────────

function NodeCard({ id, label, icon: Icon, layer, activeNode, onHover, onClick, nodeRef }) {
  const isActive = activeNode?.id === id;
  const isRelated = activeNode && !isActive && (() => {
    if (activeNode.layer === 'cap' && layer === 'factor') return (capToFactor[activeNode.id] || []).includes(id);
    if (activeNode.layer === 'cap' && layer === 'deliverable')
      return (capToFactor[activeNode.id] || []).some(f => (factorToDeliverable[f] || []).includes(id));
    if (activeNode.layer === 'factor' && layer === 'cap') return (capToFactor[id] || []).includes(activeNode.id);
    if (activeNode.layer === 'factor' && layer === 'deliverable') return (factorToDeliverable[activeNode.id] || []).includes(id);
    if (activeNode.layer === 'deliverable' && layer === 'factor') return (factorToDeliverable[id] || []).includes(activeNode.id);
    if (activeNode.layer === 'deliverable' && layer === 'cap') {
      const cf = Object.entries(factorToDeliverable).filter(([, ds]) => ds.includes(activeNode.id)).map(([f]) => f);
      return cf.some(f => (capToFactor[id] || []).includes(f));
    }
    return false;
  })();
  const isDimmed = activeNode && !isActive && !isRelated;

  return (
    <div
      ref={nodeRef}
      className="node-hover"
      style={{
        background: isActive ? OOREDOO_RED : '#ffffff',
        border: `1.5px solid ${isActive ? OOREDOO_RED : isRelated ? 'rgba(237,28,36,0.5)' : '#e5e7eb'}`,
        boxShadow: isActive
          ? '0 0 24px rgba(237,28,36,0.4), 0 4px 16px rgba(237,28,36,0.25)'
          : isRelated
          ? '0 0 14px rgba(237,28,36,0.2), 0 2px 10px rgba(0,0,0,0.08)'
          : '0 2px 8px rgba(0,0,0,0.06)',
        opacity: isDimmed ? 0.3 : 1,
        borderRadius: 14, padding: '10px 14px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        cursor: 'pointer', userSelect: 'none', transition: 'all 0.22s ease',
        minWidth: layer === 'deliverable' ? 175 : 130,
        maxWidth: layer === 'deliverable' ? 210 : 168,
        position: 'relative', zIndex: 1,
      }}
      onMouseEnter={() => onHover({ id, layer })}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick({ id, layer })}
    >
      <div style={{ borderRadius: 8, padding: 7, background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(237,28,36,0.1)' }}>
        <Icon size={18} color={isActive ? '#ffffff' : OOREDOO_RED} strokeWidth={1.8} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: isActive ? '#ffffff' : CHARCOAL, textAlign: 'center', lineHeight: 1.35 }}>
        {label}
      </span>
    </div>
  );
}

// ── Ooredoo Logo Watermark — interactive ──────────────────────────────────────

function OoredooWatermark({ onHover, onToggleLock, locked }) {
  const [hovered, setHovered] = useState(false);
  const active = locked || hovered;

  const handleEnter = () => { if (locked) return; setHovered(true); onHover(true); };
  const handleLeave = () => { if (locked) return; setHovered(false); onHover(false); };
  const handleClick = () => { onToggleLock(); };

  // circumference of orbit ring at r=192: 2π×192 ≈ 1206
  // dasharray: one ~80° arc (267px) + gap for the rest
  const orbitDash = '267 939';

  return (
    <div
      style={{
        position: 'relative',
        width: 440,
        height: 520,
        zIndex: active ? 10 : 2,
        pointerEvents: 'none',
        opacity: 1,
        filter: 'none',
        transform: 'none',
        transition: 'transform 0.35s ease, opacity 0.35s ease, filter 0.35s ease',
      }}
    >
      <svg viewBox="0 0 580 640" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">

        {/* Sonar ripple rings — expand outward from the main circle */}
        {[0, 0.75, 1.5].map((delay, i) => (
          <motion.circle
            key={i}
            cx="230" cy="315" r="170"
            fill="none"
            stroke={OOREDOO_RED}
            strokeWidth="2.5"
            style={{ transformOrigin: '230px 315px' }}
            animate={{ scale: active ? [1, 1.6] : 1, opacity: active ? [0.6, 0] : 0 }}
            transition={active
              ? { duration: 2.2, delay, repeat: Infinity, ease: 'easeOut' }
              : { duration: 0.3 }
            }
          />
        ))}

        {/* Rotating orbit arc */}
        <motion.circle
          cx="230" cy="315" r="196"
          fill="none"
          stroke={OOREDOO_RED}
          strokeWidth="3"
          strokeDasharray={orbitDash}
          style={{ transformOrigin: '230px 315px' }}
          animate={{ rotate: 360, opacity: active ? 0.65 : 0 }}
          transition={{
            rotate: { duration: 7, repeat: Infinity, ease: 'linear' },
            opacity: { duration: 0.4 },
          }}
        />

        {/* Main ring */}
        <circle
          cx="230" cy="315" r="136"
          stroke={OOREDOO_RED} strokeWidth="68" fill="none"
          pointerEvents="stroke"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          onClick={handleClick}
          style={{ cursor: 'pointer' }}
        />

        {/* Small circle */}
        <circle
          cx="442" cy="122" r="64"
          fill={OOREDOO_RED}
          pointerEvents="all"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          onClick={handleClick}
          style={{ cursor: 'pointer' }}
        />

        <text
          x="272" y="609"
          textAnchor="middle"
          fontSize="130"
          fontWeight="700"
          textLength="446"
          lengthAdjust="spacing"
          fill="#6b6b6b"
          fontFamily="'Inter', -apple-system, sans-serif"
          pointerEvents="all"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          onClick={handleClick}
          style={{ cursor: 'pointer' }}
        >fintech</text>
      </svg>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function HeroSection() {
  const [logoHovered, setLogoHovered] = useState(false);
  const [logoLocked, setLogoLocked] = useState(false);

  const handleLogoHover = (val) => { if (!logoLocked) setLogoHovered(val); };
  const handleLogoToggleLock = () => {
    setLogoLocked(prev => {
      const next = !prev;
      setLogoHovered(next);
      return next;
    });
  };

  return (
    <section style={{ background: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', position: 'relative', overflow: 'hidden', zoom: 1.1 }}>
      {/* Grid bg */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none' }}>
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke={CHARCOAL} strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>


      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '16px 40px 48px', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }} className="hero-grid">

          {/* Left column */}
          <div style={{ position: 'relative', paddingTop: 64 }}>

            <div style={{ opacity: logoHovered ? 0 : 1, transition: 'opacity 0.35s ease' }}>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              style={{ fontSize: 'clamp(2.8rem, 5vw, 4.4rem)', fontWeight: 800, color: OOREDOO_RED, letterSpacing: '-0.025em', lineHeight: 1.05, marginBottom: 0 }}
            >
              Ooredoo<br />Fintech
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              style={{ fontSize: 'clamp(2.8rem, 5vw, 4.4rem)', fontWeight: 800, color: CHARCOAL, letterSpacing: '-0.025em', lineHeight: 1.05, marginBottom: 20, marginTop: 0 }}
            >
              Predictive Analytics Capabilities
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              style={{ fontSize: 19, color: '#4b5563', lineHeight: 1.7, marginBottom: 10, maxWidth: 480 }}
            >
              Transforming fintech intelligence through predictive analytics — from transaction signals to enterprise-grade ML outcomes. Click the logo to know more about OFTI.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28 }}
              style={{ fontSize: 16, color: CHARCOAL, fontStyle: 'italic', fontWeight: 500, marginBottom: 32 }}
            >
              by Ilyas Mellakh and Kshaunish Gupta
            </motion.p>

            {/* 4 nav buttons — single horizontal line, no wrap */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.38 }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}
            >
              {[
                { href: '#architecture', label: 'Architecture',    Icon: Network },
                { href: '#capabilities', label: 'ML Capabilities', Icon: Brain },
                { href: '#impact',       label: 'Impact',          Icon: TrendingUp },
                { href: '#deliverables', label: 'Deliverables',    Icon: Target },
              ].map(({ href, label, Icon }) => (
                <a key={href} href={href} className="nav-btn" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, whiteSpace: 'nowrap',
                  padding: '20px 24px', borderRadius: 14, fontWeight: 700, fontSize: 16,
                  background: LIGHT_GRAY, color: CHARCOAL, textDecoration: 'none',
                  border: '1.5px solid #e5e7eb',
                }}>
                  <Icon size={18} /> {label}
                </a>
              ))}
            </motion.div>
            </div>{/* end fade wrapper */}

            {/* Logo hover/click reveal */}
            <div style={{
              position: 'absolute', inset: 0,
              opacity: logoHovered ? 1 : 0,
              pointerEvents: 'none',
              transition: 'opacity 0.35s ease',
              paddingTop: 125,
              display: 'flex',
              flexDirection: 'column',
            }}>
              <h2 style={{ fontSize: 'clamp(2.8rem, 5vw, 4.4rem)', fontWeight: 800, color: CHARCOAL, letterSpacing: '-0.025em', lineHeight: 1.05, margin: 0, marginBottom: 24 }}>
                <span style={{ color: OOREDOO_RED }}>Enriching</span>{' '}
                your everyday{' '}
                <span style={{ color: OOREDOO_RED }}>money</span>{' '}
                moments
              </h2>
              <p style={{ fontSize: 17, color: '#4b5563', lineHeight: 1.7, maxWidth: 480, margin: 0, marginBottom: 28 }}>
                Ooredoo Financial Technology International operates across the Middle East, Africa, and South Asia — driving financial inclusion through predictive intelligence and data-driven innovation.
              </p>
              <img
                src={process.env.PUBLIC_URL + '/impact-globe.png'}
                alt="Making an impact in the fintech industry"
                style={{ width: '200%', height: '200%', borderRadius: 16, display: 'block', alignSelf: 'flex-start', marginLeft: 0 }}
              />
            </div>
          </div>

          {/* Right column — logo on top, stat cards below */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, position: 'relative' }}>

            <OoredooWatermark onHover={handleLogoHover} onToggleLock={handleLogoToggleLock} locked={logoLocked} />

            {/* Stat cards */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
              width: '100%', position: 'relative', zIndex: 1,
              opacity: logoHovered ? 0 : 1, transition: 'opacity 0.35s ease',
            }}>
              {[
                { v: '5',         l: 'ML Capability Layers',    icon: Brain },
                { v: '7',         l: 'Business Factor Domains', icon: Database },
                { v: '10',        l: 'Deliverable Systems',      icon: Target },
                { v: 'Real-Time', l: 'Intelligence Delivery',   icon: Zap },
              ].map(({ v, l, icon: Ic }, i) => (
                <motion.div
                  key={l}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="card-hover"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: 22, borderRadius: 16,
                    background: '#ffffff',
                    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
                    border: '1px solid #f0f0f0',
                  }}
                >
                  <div style={{ borderRadius: 12, padding: 10, background: 'rgba(237,28,36,0.1)', flexShrink: 0 }}>
                    <Ic size={22} color={OOREDOO_RED} strokeWidth={1.8} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 26, color: OOREDOO_RED, letterSpacing: '-0.02em' }}>{v}</div>
                    <div style={{ fontSize: 13, color: '#4b5563', marginTop: 3 }}>{l}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <motion.div
        style={{ position: 'absolute', bottom: 36, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span style={{ fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9ca3af' }}>Scroll to explore</span>
        <ChevronDown size={14} color="#9ca3af" />
      </motion.div>
    </section>
  );
}

// ── Architecture Diagram ──────────────────────────────────────────────────────

function ArchitectureDiagram() {
  const [activeNode, setActiveNode] = useState(null);
  const [clicked, setClicked] = useState(null);
  const containerRef = useRef(null);
  const capRefs = useRef({});
  const factorRefs = useRef({});
  const deliverableRefs = useRef({});
  const effectiveActive = clicked || activeNode;

  const handleHover = useCallback((node) => { if (!clicked) setActiveNode(node); }, [clicked]);
  const handleClick = useCallback((node) => {
    setClicked(prev => prev?.id === node.id ? null : node);
    setActiveNode(null);
  }, []);

  const layerLabel = (text) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18 }}>
      <div style={{ width: 11, height: 11, borderRadius: '50%', background: OOREDOO_RED, flexShrink: 0 }} />
      <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#4b5563' }}>{text}</span>
    </div>
  );

  return (
    <section id="architecture" style={{ padding: '96px 24px', background: OOREDOO_RED }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 18px', borderRadius: 40, marginBottom: 18, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)' }}>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#ffffff' }}>Interactive Architecture</span>
          </div>
          <h2 style={{ fontSize: 'clamp(2.2rem, 3.5vw, 3.2rem)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: 14 }}>
            Three-Layer Capability Framework
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.82)', maxWidth: 520, margin: '0 auto' }}>
            Hover or click any node to trace its full connection path across the intelligence pipeline.
          </p>
          {clicked && (
            <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              onClick={() => setClicked(null)}
              style={{ marginTop: 16, padding: '7px 18px', borderRadius: 40, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'rgba(255,255,255,0.2)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.4)' }}>
              Clear Selection ✕
            </motion.button>
          )}
        </motion.div>

        <div ref={containerRef} style={{ position: 'relative', background: '#ffffff', borderRadius: 24, padding: 40, boxShadow: '0 4px 48px rgba(0,0,0,0.07)', border: '1px solid #f0f0f0' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            {layerLabel('Predictive Analytics Capabilities')}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
              {capabilities.map(cap => (
                <NodeCard key={cap.id} {...cap} layer="cap" activeNode={effectiveActive}
                  onHover={handleHover} onClick={handleClick}
                  nodeRef={el => (capRefs.current[cap.id] = el)} />
              ))}
            </div>
          </div>
          <div style={{ height: 96 }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            {layerLabel('Business Factors')}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
              {factors.map(f => (
                <NodeCard key={f.id} {...f} layer="factor" activeNode={effectiveActive}
                  onHover={handleHover} onClick={handleClick}
                  nodeRef={el => (factorRefs.current[f.id] = el)} />
              ))}
            </div>
          </div>
          <div style={{ height: 96 }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            {layerLabel('Deliverables')}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
              {deliverables.map(d => (
                <NodeCard key={d.id} {...d} layer="deliverable" activeNode={effectiveActive}
                  onHover={handleHover} onClick={handleClick}
                  nodeRef={el => (deliverableRefs.current[d.id] = el)} />
              ))}
            </div>
          </div>
          <ConnectionLayer capRefs={capRefs} factorRefs={factorRefs} deliverableRefs={deliverableRefs}
            activeNode={effectiveActive} containerRef={containerRef} />
        </div>
      </div>
    </section>
  );
}

// ── Capabilities Grid ─────────────────────────────────────────────────────────

const CAP_ACCENTS = [
  { bg: '#fdf0f0', topBorder: '#7a0010', iconBg: 'rgba(122,0,16,0.1)',   iconColor: '#7a0010', impactColor: '#7a0010' },
  { bg: '#fdf2f2', topBorder: '#b01020', iconBg: 'rgba(176,16,32,0.1)',  iconColor: '#b01020', impactColor: '#b01020' },
  { bg: '#fdf4f4', topBorder: '#ed1c24', iconBg: 'rgba(237,28,36,0.1)',  iconColor: '#ed1c24', impactColor: '#c8101a' },
  { bg: '#fef5f5', topBorder: '#f04e55', iconBg: 'rgba(240,78,85,0.12)', iconColor: '#d93840', impactColor: '#d93840' },
  { bg: '#fef7f7', topBorder: '#e8323a', iconBg: 'rgba(232,50,58,0.1)',  iconColor: '#c82030', impactColor: '#c82030' },
];

function CapabilityGrid() {
  const cards = [
    {
      icon: Brain, title: 'Classification',
      desc: 'Segment customers, transactions, and merchants into risk and behavioural classes.',
      impacts: [
        'Assists with KYC risk assessment during customer onboarding',
        'Helps identify elevated-risk merchant profiles for review',
      ],
    },
    {
      icon: TrendingUp, title: 'Forecasting',
      desc: 'Project wallet flows, remittance volumes, and revenue trajectories with precision.',
      impacts: [
        'Supports remittance volume planning over rolling horizons',
        'Provides early signals of potential liquidity pressure',
      ],
    },
    {
      icon: AlertTriangle, title: 'Anomaly Detection',
      desc: 'Surface transaction irregularities and fraud patterns before exposure escalates.',
      impacts: [
        'Flags suspicious transactions for analyst investigation',
        'Highlights behavioural patterns consistent with AML risk',
        'Supports detection of unusual account activity',
      ],
    },
    {
      icon: Users, title: 'Clustering',
      desc: 'Group users and merchants by behaviour, spend, and lifecycle stage for personalisation.',
      impacts: [
        'Informs segment-based product and offer design',
        'Supports identification of high-value customer groups',
        'Provides churn risk signals to guide retention efforts',
      ],
    },
    {
      icon: Activity, title: 'Time Series Analytics',
      desc: 'Detect cyclical patterns, macro shifts, and seasonal trends across financial data streams.',
      impacts: [
        'Anticipates seasonal demand shifts for liquidity planning',
        'Monitors macro and FX trends affecting cross-border flows',
      ],
    },
  ];

  return (
    <section id="capabilities" style={{ padding: '96px 24px', background: '#ffffff', zoom: 1.1 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 52 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 18px', borderRadius: 40, marginBottom: 14, background: 'rgba(237,28,36,0.08)', border: '1px solid rgba(237,28,36,0.15)' }}>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: OOREDOO_RED }}>Core ML Capabilities</span>
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 3vw, 2.8rem)', fontWeight: 800, color: CHARCOAL, letterSpacing: '-0.02em' }}>
            Five Engines of Predictive Power
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {cards.map((card, i) => {
            const acc = CAP_ACCENTS[i];
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card-hover"
                style={{
                  borderRadius: 20, padding: 26,
                  background: acc.bg,
                  border: `1.5px solid ${acc.topBorder}22`,
                  borderTop: `4px solid ${acc.topBorder}`,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                  cursor: 'default',
                }}
              >
                <div style={{ borderRadius: 12, padding: 11, background: acc.iconBg, width: 'fit-content', marginBottom: 18 }}>
                  <card.icon size={22} color={acc.iconColor} strokeWidth={1.8} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 18, color: CHARCOAL, marginBottom: 10 }}>{card.title}</h3>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.65, marginBottom: 18 }}>{card.desc}</p>

                {/* Business impact phrases — stacked vertically, one per line */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {card.impacts.map((impact, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: acc.impactColor, flexShrink: 0, marginTop: 6,
                      }} />
                      <span style={{ fontSize: 12.5, color: '#374151', lineHeight: 1.55, fontWeight: 500 }}>
                        {impact}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Impact Section ────────────────────────────────────────────────────────────

function ImpactSection() {
  const impacts = [
    { icon: Shield,     metric: 'Fraud Detection',    value: 'TBD', sub: 'transaction accuracy' },
    { icon: TrendingUp, metric: 'Revenue Forecasting', value: 'TBD', sub: 'margin of error' },
    { icon: Zap,        metric: 'Alert Latency',       value: 'TBD', sub: 'real-time signals' },
    { icon: Users,      metric: 'Customer Segments',   value: 'TBD', sub: 'behavioural clusters' },
  ];

  return (
    <section id="impact" style={{ padding: '96px 24px', background: OOREDOO_RED, position: 'relative', overflow: 'hidden', zoom: 1.1 }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.08, pointerEvents: 'none' }}>
        <svg width="100%" height="100%">
          <defs>
            <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#ffffff" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>
      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 52 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 18px', borderRadius: 40, marginBottom: 16, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)' }}>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#ffffff' }}>Strategic Impact</span>
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 3vw, 2.8rem)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Measurable Intelligence. Executive Outcomes.
          </h2>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {impacts.map((item, i) => (
            <motion.div key={item.metric}
              initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="card-hover"
              style={{ borderRadius: 20, padding: 30, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              <item.icon size={32} color="#ffffff" strokeWidth={1.6} style={{ marginBottom: 18 }} />
              <div style={{ fontWeight: 800, fontSize: 44, color: '#ffffff', letterSpacing: '-0.03em', marginBottom: 6 }}>{item.value}</div>
              <div style={{ fontWeight: 600, fontSize: 17, color: '#ffffff', marginBottom: 5 }}>{item.metric}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>{item.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Deliverables ──────────────────────────────────────────────────────────────

function DeliverablesSection() {
  const items = [
    { icon: Brain,         title: 'ML Risk Models',                   desc: 'Dynamic risk scoring across fraud and operational dimensions.' },
    { icon: TrendingUp,    title: 'Forecasting Engines',              desc: 'Wallet balance, remittance volume, and revenue projections.' },
    { icon: AlertTriangle, title: 'Fraud Detection Algorithms',       desc: 'Pattern-based anomaly classifiers with quicker response.' },
    { icon: LineChart,     title: 'Liquidity Monitoring Dashboards',  desc: 'Daily visibility into cash flow and reserve positions.' },
    { icon: Layers,        title: 'Customer Segmentation Models',     desc: 'Micro-cohort models driving personalised financial journeys.' },
    { icon: Target,        title: 'Executive KPI Dashboards',         desc: 'C-suite intelligence on fintech performance and growth vectors.' },
    { icon: Shield,        title: 'Predictive Risk Scoring',          desc: 'Forward-looking scores for onboarding and limits.' },
    { icon: Eye,           title: 'Transaction Monitoring Systems',   desc: 'Continuous surveillance across all transactions and destinations.' },
    { icon: FileText,      title: 'Merchant Intelligence Reports',    desc: 'GMV trends, category performance, and churn risk per merchant.' },
    { icon: Bell,          title: 'Real-Time Alerting Systems',       desc: 'Event-driven triggers for fraud, liquidity, and compliance breaches.' },
  ];

  return (
    <section id="deliverables" style={{ padding: '96px 24px', background: '#ffffff', zoom: 1.1 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 52 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 18px', borderRadius: 40, marginBottom: 16, background: 'rgba(237,28,36,0.08)', border: '1px solid rgba(237,28,36,0.15)' }}>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: OOREDOO_RED }}>Deliverables</span>
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 3vw, 2.8rem)', fontWeight: 800, color: CHARCOAL, letterSpacing: '-0.02em' }}>
            10 Enterprise-Grade Outputs
          </h2>
        </motion.div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((item, i) => (
            <motion.div key={item.title}
              initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="row-hover"
              style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '18px 24px', borderRadius: 14, background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}
            >
              <div style={{ minWidth: 36, height: 36, borderRadius: 10, background: OOREDOO_RED, color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, flexShrink: 0 }}>
                {i + 1}
              </div>
              <div style={{ borderRadius: 10, padding: 9, background: 'rgba(237,28,36,0.08)', flexShrink: 0 }}>
                <item.icon size={19} color={OOREDOO_RED} strokeWidth={1.8} />
              </div>
              <div style={{ minWidth: 240, flexShrink: 0 }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: CHARCOAL }}>{item.title}</span>
              </div>
              <div style={{ width: 1, height: 32, background: '#e5e7eb', flexShrink: 0 }} />
              <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer style={{ padding: '44px 32px', background: CHARCOAL, borderTop: '1px solid rgba(255,255,255,0.07)', zoom: 1.1 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* Top row: brand + copyright */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: OOREDOO_RED, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Brain size={20} color="#fff" strokeWidth={1.8} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 17, color: '#f9fafb' }}>Ooredoo Financial Technology International</span>
            <span style={{ fontSize: 15, color: '#9ca3af' }}>OFTI · Predictive Analytics Framework</span>
          </div>
        </div>

        {/* Bottom row: back-to-top button */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 24, display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={scrollToTop}
            className="nav-btn"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '13px 28px', borderRadius: 12, fontWeight: 700, fontSize: 15,
              background: LIGHT_GRAY, color: CHARCOAL, border: '1.5px solid #e5e7eb',
              cursor: 'pointer',
            }}
          >
            <ArrowUp size={16} /> Back to Top
          </button>
        </div>
      </div>
    </footer>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif; -webkit-font-smoothing: antialiased; }
        a { text-decoration: none; }

        .card-hover {
          transition: transform 0.22s ease, box-shadow 0.22s ease !important;
        }
        .card-hover:hover {
          transform: scale(1.04) translateY(-3px) !important;
          box-shadow: 0 12px 36px rgba(0,0,0,0.13) !important;
        }
        .row-hover {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease !important;
        }
        .row-hover:hover {
          transform: scaleX(1.015) translateX(4px) !important;
          box-shadow: 0 4px 24px rgba(237,28,36,0.1) !important;
          border-color: rgba(237,28,36,0.35) !important;
        }
        .node-hover {
          transition: transform 0.18s ease, box-shadow 0.18s ease !important;
        }
        .node-hover:hover {
          transform: scale(1.07) !important;
        }
        .nav-btn {
          transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease, transform 0.18s ease !important;
        }
        .nav-btn:hover {
          background: ${OOREDOO_RED} !important;
          color: #ffffff !important;
          border-color: ${OOREDOO_RED} !important;
          transform: scale(1.05) !important;
        }

        @media (max-width: 1024px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
        @media (max-width: 600px) {
          section { padding-left: 16px !important; padding-right: 16px !important; }
        }
      `}</style>
      <HeroSection />
      <ArchitectureDiagram />
      <CapabilityGrid />
      <ImpactSection />
      <DeliverablesSection />
      <Footer />
    </div>
  );
}
