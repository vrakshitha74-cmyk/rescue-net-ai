import React, { useState } from 'react';
import { 
  Shield, MapPin, AlertTriangle, Radio, Building2, Users, 
  Truck, Search, Bell, Navigation, Plus, Eye, Flame, Waves, Key,
  Activity, Zap, CheckCircle2, Siren
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Rectangle, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix missing default marker icons in Leaflet + React/Vite builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Spatial distance formula (Haversine)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 'N/A';
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Active Emergency Incidents
  const [incidents, setIncidents] = useState([
    { id: 101, title: 'Monsoon Flooding Response', location: 'Dibrugarh, Assam', lat: 27.4728, lon: 94.9120, status: 'ACTIVE', severity: 'HIGH', type: 'FLOOD', time: 'Aug 15, 2026, 7:49 PM' },
    { id: 102, title: 'Industrial Fire Coordination', location: 'Surat, Gujarat', lat: 21.1702, lon: 72.8311, status: 'MONITORING', severity: 'MODERATE', type: 'FIRE', time: 'Aug 15, 2026, 7:49 PM' },
    { id: 103, title: 'Coastal Surge Warning', location: 'Puri, Odisha', lat: 19.8135, lon: 85.8312, status: 'ACTIVE', severity: 'HIGH', type: 'FLOOD', time: 'Aug 15, 2026, 8:15 PM' }
  ]);

  const [selectedIncident, setSelectedIncident] = useState(incidents[0]);

  // Registered Agencies Database
  const [agencies, setAgencies] = useState([
    { id: 1, name: 'Indian Red Cross Society', code: 'IRC', city: 'Bhubaneswar, Odisha', lat: 20.2961, lon: 85.8245, status: 'Deployed', boats: 4, amb: 6, rations: 400, personnel: 186, phone: '+91 98765 43210' },
    { id: 2, name: 'Kerala Fire & Rescue Services', code: 'KFR', city: 'Kochi, Kerala', lat: 9.9312, lon: 76.2673, status: 'Available', boats: 12, amb: 4, rations: 800, personnel: 260, phone: '+91 94470 12345' },
    { id: 3, name: 'National Disaster Response Force', code: 'NDR', city: 'New Delhi, Delhi', lat: 28.6139, lon: 77.2090, status: 'Available', boats: 20, amb: 10, rations: 1000, personnel: 420, phone: '+91 11 2341 2222' },
    { id: 4, name: 'SEEDS India', code: 'SEE', city: 'Guwahati, Assam', lat: 26.1445, lon: 91.7362, status: 'Available', boats: 2, amb: 3, rations: 350, personnel: 95, phone: '+91 98100 99999' }
  ]);

  // Form States
  const [newAgency, setNewAgency] = useState({ name: '', code: '', city: '', lat: '', lon: '', phone: '', personnel: '', boats: '', amb: '' });
  const [sosText, setSosText] = useState('');
  const [sosQueue, setSosQueue] = useState([]);

  // Simulator State
  const [simEvent, setSimEvent] = useState('Urban Flood');
  const [simSeverity, setSimSeverity] = useState('High');
  const [simResults, setSimResults] = useState(null);

  // Proximity calculations
  const agenciesWithDistance = agencies.map(agency => ({
    ...agency,
    distanceKm: calculateDistance(selectedIncident.lat, selectedIncident.lon, agency.lat, agency.lon)
  })).sort((a, b) => parseFloat(a.distanceKm) - parseFloat(b.distanceKm));

  const handleRegisterAgency = (e) => {
    e.preventDefault();
    if (!newAgency.name || !newAgency.city) return;
    const added = {
      id: Date.now(),
      name: newAgency.name,
      code: newAgency.code || 'NGO',
      city: newAgency.city,
      lat: parseFloat(newAgency.lat) || 20.0,
      lon: parseFloat(newAgency.lon) || 78.0,
      status: 'Available',
      boats: parseInt(newAgency.boats) || 0,
      amb: parseInt(newAgency.amb) || 0,
      rations: 500,
      personnel: parseInt(newAgency.personnel) || 10,
      phone: newAgency.phone || '+91 90000 00000'
    };
    setAgencies([...agencies, added]);
    setNewAgency({ name: '', code: '', city: '', lat: '', lon: '', phone: '', personnel: '', boats: '', amb: '' });
  };

  // Innovative Smart AI Distress Message Parser
  const parseDistressSignal = (text) => {
    const lower = text.toLowerCase();
    
    // Extract numbers of people if mentioned (e.g., "50 trapped")
    const matchNumbers = text.match(/\d+/);
    const estimatedCount = matchNumbers ? matchNumbers[0] : 'Unspecified';

    // Categories extraction
    const needs = [];
    if (lower.includes('water') || lower.includes('flood') || lower.includes('trapped') || lower.includes('river')) needs.push('Boats & Rescue');
    if (lower.includes('hospital') || lower.includes('injured') || lower.includes('medical') || lower.includes('blood') || lower.includes('doctor')) needs.push('Medical Unit');
    if (lower.includes('food') || lower.includes('ration') || lower.includes('starving') || lower.includes('supplies')) needs.push('Rations');
    if (lower.includes('fire') || lower.includes('smoke') || lower.includes('burn')) needs.push('Fire Control');
    if (needs.length === 0) needs.push('General Evacuation');

    // Priority scoring calculation
    let priority = 'STANDARD';
    let pColor = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (lower.includes('critical') || lower.includes('trapped') || lower.includes('child') || lower.includes('urgent') || lower.includes('death') || lower.includes('emergency') || matchNumbers) {
      priority = 'CRITICAL P1';
      pColor = 'bg-red-500/20 text-red-400 border-red-500/30';
    }

    return {
      id: Date.now(),
      rawText: text,
      priority,
      pColor,
      needs: needs.join(', '),
      estimatedCount,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: needs.includes('Boats & Rescue') ? 'Deploy NDRF Water Rescue' : 'Dispatch Field Team'
    };
  };

  const handleSosSubmit = () => {
    if (!sosText.trim()) return;
    const parsedSignal = parseDistressSignal(sosText);
    setSosQueue([parsedSignal, ...sosQueue]);
    setSosText('');
  };

  // Run Disaster Scenario Simulator calculations
  const handleRunSimulation = () => {
    const isFlood = simEvent === 'Urban Flood';
    const isCritical = simSeverity === 'Critical';

    setSimResults({
      affectedPop: isCritical ? '125,000 People' : '45,000 People',
      casualtyRisk: isCritical ? 'HIGH (18-24%)' : 'MODERATE (5-8%)',
      radius: isFlood ? (isCritical ? '85 km Zone' : '40 km Zone') : (isCritical ? '25 km Radius' : '10 km Radius'),
      reqPersonnel: isCritical ? '650 Trained Personnel' : '220 Trained Personnel',
      reqBoats: isFlood ? (isCritical ? '48 Rescue Boats' : '16 Rescue Boats') : 'N/A (Ground Fire Units)',
      urgency: isCritical ? 'EVACUATE WITHIN 4 HOURS' : 'MONITOR & STAGE UNITS'
    });
  };

  // 1. AUTHENTICATION VIEW
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0d1619] text-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="bg-[#142227] border border-emerald-900/40 rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-amber-400 p-2 rounded-xl text-slate-950">
                <Shield className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Rescue Network Command</h1>
                <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Authorized Access Portal</p>
              </div>
            </div>
            <span className="bg-red-500/10 text-red-400 text-[10px] px-2.5 py-1 rounded-full font-bold border border-red-500/30 font-mono">RESTRICTED</span>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); setIsAuthenticated(true); }} className="space-y-4">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 block mb-1 font-mono">OFFICIAL AGENCY EMAIL</label>
              <input type="email" defaultValue="officer.name@rescuenetwork.gov" className="w-full bg-[#091013] border border-slate-700/60 rounded-lg p-2.5 text-xs text-emerald-400 focus:outline-none focus:border-amber-400 font-mono" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1 font-mono">BADGE / OFFICER ID</label>
                <input type="text" defaultValue="NDRF-8821" className="w-full bg-[#091013] border border-slate-700/60 rounded-lg p-2.5 text-xs focus:outline-none focus:border-amber-400 font-mono" required />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1 font-mono">CLEARANCE LEVEL</label>
                <select className="w-full bg-[#091013] border border-slate-700/60 rounded-lg p-2.5 text-xs focus:outline-none focus:border-amber-400 font-mono">
                  <option>Central Dispatcher</option>
                  <option>Field Coordinator</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-400 block mb-1 font-mono">SECURITY PASSKEY</label>
              <input type="password" defaultValue="••••••••••••" className="w-full bg-[#091013] border border-slate-700/60 rounded-lg p-2.5 text-xs focus:outline-none focus:border-amber-400 font-mono" required />
            </div>

            <button type="submit" className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold p-3 rounded-xl flex items-center justify-center gap-2 text-xs transition-colors mt-2">
              <Key className="w-4 h-4" /> Authenticate & Unlock Command Desk
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1215] text-slate-100 flex font-sans">
      {/* SIDEBAR NAVIGATION */}
      <div className="w-64 bg-[#0f191d] border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="bg-amber-400 text-slate-950 p-1.5 rounded-lg">
              <Shield className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="font-bold text-xs tracking-wider uppercase">Rescue Network</h1>
              <p className="text-[9px] text-red-400 font-mono">INTERNAL DESK</p>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase px-3 block mb-2">Command Desk</span>
            {[
              { id: 'overview', label: 'Operations overview', icon: Shield },
              { id: 'proximity', label: 'Nearby Agency Radar', icon: Navigation, highlight: true },
              { id: 'map', label: 'Response map & Geofence', icon: MapPin },
              { id: 'registry', label: 'Agency registry', icon: Building2 },
              { id: 'incidents', label: 'Incident notices', icon: Bell }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-colors ${
                    activeTab === tab.id 
                      ? 'bg-[#1b2b32] text-amber-400 font-semibold border border-amber-400/20' 
                      : 'text-slate-400 hover:bg-[#142126] hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.highlight && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-3 text-[10px] font-mono text-slate-400">
          <p className="text-emerald-400 font-semibold">• CLEARANCE LEVEL 3</p>
          <p className="mt-1 font-bold text-slate-200">OFFICER NAME</p>
          <p className="text-slate-500">Central Dispatcher • ID: NDRF-8821</p>
        </div>
      </div>

      {/* MAIN CONTENT DASHBOARD */}
      <div className="flex-1 bg-[#0b1215] overflow-y-auto p-8">

        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-6 text-xs border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 uppercase font-mono text-[10px]">Rescue Network &gt;</span>
            <span className="font-semibold text-slate-200 capitalize font-mono text-[10px]">{activeTab}</span>
          </div>
          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2.5 py-1 rounded-full border border-emerald-500/20 font-mono">
            • Restricted Session Active
          </span>
        </div>

        {/* 1. OPERATIONS OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <p className="text-[10px] text-red-400 font-mono uppercase tracking-wider">LIVE NETWORK PICTURE</p>
              <h2 className="text-2xl font-bold">Good morning, operations.</h2>
              <p className="text-xs text-slate-400 mt-1">A clear view of who is ready, where coverage is thin, and what needs coordination next.</p>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="bg-[#121d22] border border-slate-800 p-4 rounded-xl">
                <p className="text-[10px] text-slate-400 font-mono uppercase">REGISTERED AGENCIES</p>
                <p className="text-3xl font-bold mt-1 font-mono">{agencies.length}</p>
              </div>
              <div className="bg-[#121d22] border border-slate-800 p-4 rounded-xl">
                <p className="text-[10px] text-slate-400 font-mono uppercase">AVAILABLE TO DEPLOY</p>
                <p className="text-3xl font-bold mt-1 text-emerald-400 font-mono">
                  {agencies.filter(a => a.status === 'Available').length}
                </p>
              </div>
              <div className="bg-[#121d22] border border-slate-800 p-4 rounded-xl">
                <p className="text-[10px] text-slate-400 font-mono uppercase">PERSONNEL NETWORK</p>
                <p className="text-3xl font-bold mt-1 font-mono">961</p>
              </div>
              <div className="bg-[#121d22] border border-slate-800 p-4 rounded-xl">
                <p className="text-[10px] text-slate-400 font-mono uppercase">NEAREST HUB DISTANCE</p>
                <p className="text-3xl font-bold mt-1 text-amber-400 font-mono">{agenciesWithDistance[0].distanceKm} km</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              
              {/* INNOVATIVE NLP DISTRESS ENGINE */}
              <div className="bg-[#121d22] border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold uppercase font-mono tracking-wider">Smart AI Emergency NLP Triage</h3>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">Auto-Keyword Parsing</span>
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={sosText}
                    onChange={(e) => setSosText(e.target.value)}
                    placeholder="e.g. 60 residents trapped by river flood needing urgent medical water rescue"
                    className="flex-1 bg-[#091013] border border-slate-700/60 rounded-lg p-2.5 text-xs focus:outline-none focus:border-amber-400 text-slate-200"
                  />
                  <button 
                    onClick={handleSosSubmit}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs px-4 rounded-lg font-bold transition-colors"
                  >
                    Analyze & Route
                  </button>
                </div>
                {/* Parsed Output Queue */}
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {sosQueue.length === 0 ? (
                    <div className="p-4 border border-dashed border-slate-800 rounded-lg text-center text-slate-500 text-xs">
                      Type an emergency report above to test automatic AI NLP parsing.
                    </div>
                  ) : (
                    sosQueue.map((item) => (
                      <div key={item.id} className="bg-[#091013] p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
                        <div className="flex justify-between items-start">
                          <p className="text-slate-200 font-medium">{item.rawText}</p>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold border ${item.pColor}`}>
                            {item.priority}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-[10px] font-mono bg-[#142227] p-2 rounded text-slate-300">
                          <div>Victims: <strong className="text-amber-400">{item.estimatedCount}</strong></div>
                          <div>Extracted Needs: <strong className="text-emerald-400">{item.needs}</strong></div>
                          <div>Action: <strong className="text-blue-400">{item.action}</strong></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* DISASTER SCENARIO SIMULATOR (DYNAMIC WORKING RESULTS) */}
              <div className="bg-[#121d22] border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-bold uppercase font-mono tracking-wider">Predictive Disaster Simulator</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Disaster Event</label>
                    <select 
                      value={simEvent} 
                      onChange={e => setSimEvent(e.target.value)}
                      className="w-full bg-[#091013] border border-slate-700/60 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="Urban Flood">Urban Flood</option>
                      <option value="Industrial Fire">Industrial Fire</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Severity Rating</label>
                    <select 
                      value={simSeverity} 
                      onChange={e => setSimSeverity(e.target.value)}
                      className="w-full bg-[#091013] border border-slate-700/60 rounded-lg p-2 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={handleRunSimulation}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold p-2.5 rounded-lg text-xs transition-colors shadow-lg shadow-purple-900/20"
                >
                  Run Predictive Impact Model
                </button>

                {/* SIMULATION OUTPUT RESULTS */}
                {simResults && (
                  <div className="bg-[#091013] border border-purple-500/30 rounded-lg p-3 space-y-2 animate-fadeIn">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                      <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">⚡ MODEL SIMULATION REPORT</span>
                      <span className="text-[9px] font-mono text-red-400 font-bold">{simResults.urgency}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div className="bg-[#121d22] p-2 rounded">
                        <span className="text-slate-400 block">EST. AFFECTED POPULATION</span>
                        <strong className="text-slate-200">{simResults.affectedPop}</strong>
                      </div>
                      <div className="bg-[#121d22] p-2 rounded">
                        <span className="text-slate-400 block">CASUALTY RISK MODEL</span>
                        <strong className="text-amber-400">{simResults.casualtyRisk}</strong>
                      </div>
                      <div className="bg-[#121d22] p-2 rounded">
                        <span className="text-slate-400 block">REQUIRED PERSONNEL</span>
                        <strong className="text-emerald-400">{simResults.reqPersonnel}</strong>
                      </div>
                      <div className="bg-[#121d22] p-2 rounded">
                        <span className="text-slate-400 block">REQUIRED ASSETS</span>
                        <strong className="text-blue-400">{simResults.reqBoats}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* 2. NEARBY AGENCY RADAR */}
        {activeTab === 'proximity' && (
          <div className="space-y-6">
            <div>
              <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">GEOSPATIAL DISTANCE ENGINE</p>
              <h2 className="text-2xl font-bold">Nearby Agency Proximity Analysis</h2>
              <p className="text-xs text-slate-400 mt-1">Calculates spatial distance (in km) from affected disaster zones to available units.</p>
            </div>

            <div className="bg-[#121d22] border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <span className="text-xs text-slate-300 font-semibold font-mono">SELECT AFFECTED DISASTER AREA:</span>
              <select 
                value={selectedIncident.id}
                onChange={(e) => setSelectedIncident(incidents.find(i => i.id === parseInt(e.target.value)))}
                className="bg-[#091013] border border-slate-700/60 text-amber-400 font-mono font-bold text-xs rounded-lg px-4 py-2 focus:outline-none"
              >
                {incidents.map(inc => (
                  <option key={inc.id} value={inc.id}>{inc.title} - ({inc.location})</option>
                ))}
              </select>
            </div>

            <div className="bg-[#121d22] border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold uppercase font-mono">Agencies Ranked by Distance to {selectedIncident.location}</h3>
                  <p className="text-[10px] text-slate-400">Lat: {selectedIncident.lat} | Lon: {selectedIncident.lon}</p>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2.5 py-1 rounded-full border border-emerald-500/20 font-mono">
                  Live Haversine Calculation
                </span>
              </div>

              <div className="divide-y divide-slate-800">
                {agenciesWithDistance.map((agency, idx) => (
                  <div key={agency.id} className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono text-xs ${idx === 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'}`}>
                        #{idx + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-xs text-slate-200">{agency.name}</h4>
                        <p className="text-[10px] text-slate-400">{agency.city} • Code: {agency.code}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 uppercase font-mono block">Resources</span>
                        <span className="text-xs font-mono text-slate-300">{agency.personnel} Staff | {agency.boats} Boats</span>
                      </div>
                      <div className="text-right min-w-[120px]">
                        <span className="text-[9px] text-slate-400 uppercase font-mono block">Distance to Site</span>
                        <span className={`text-sm font-bold font-mono ${idx === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {agency.distanceKm} km
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. MULTI-ZONE GEOFENCE MAP */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-amber-400 font-mono uppercase tracking-wider">GEOGRAPHIC RESPONSE VIEW</p>
              <h2 className="text-2xl font-bold font-mono">Multi-Zone Geofence Command Center</h2>
              <p className="text-xs text-slate-400 mt-1">Simultaneous spatial monitoring of High Danger, Safe Evacuation, and Tactical Defense zones.</p>
            </div>

            <div className="bg-[#121d22] border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span>
                  Focus Location: <strong className="text-slate-200">{selectedIncident.location}</strong>
                </span>
              </div>
              <div className="flex gap-2 font-mono text-[10px]">
                <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/30">● Circle: Danger Area</span>
                <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30">■ Rectangle: Safe Zone</span>
                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded border border-blue-500/30">▲ Polygon: Defense Zone</span>
              </div>
            </div>

            <div className="bg-[#121d22] border border-slate-800 rounded-xl h-[520px] overflow-hidden relative">
              <MapContainer 
                center={[selectedIncident.lat, selectedIncident.lon]} 
                zoom={7} 
                scrollWheelZoom={true} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* 🔴 1. DANGER AREA (Circle Geofence centered around disaster point) */}
                <Circle
                  center={[selectedIncident.lat, selectedIncident.lon]}
                  pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.25, weight: 2 }}
                  radius={50000}
                >
                  <Popup>
                    <div className="text-slate-900 font-sans">
                      <strong className="text-red-600 font-mono text-xs block">🚨 DANGER ZONE (50KM RADIUS)</strong>
                      <span className="text-[11px] text-slate-600 block">High-impact active disaster zone. Mandatory evacuation area.</span>
                    </div>
                  </Popup>
                </Circle>

                {/* 🟩 2. SAFE AREA (Green Rectangle Geofence offset to East side) */}
                <Rectangle
                  bounds={[
                    [selectedIncident.lat - 0.4, selectedIncident.lon + 0.6],
                    [selectedIncident.lat + 0.4, selectedIncident.lon + 1.4]
                  ]}
                  pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.2, weight: 2 }}
                >
                  <Popup>
                    <div className="text-slate-900 font-sans">
                      <strong className="text-emerald-600 font-mono text-xs block">🟢 SAFE ASSEMBLY AREA</strong>
                      <span className="text-[11px] text-slate-600 block font-sans">Field hospitals, food distribution hubs, and relief camps set up here.</span>
                    </div>
                  </Popup>
                </Rectangle>

                {/* 🟦 3. DEFENSE / CONTAINMENT AREA (Blue Polygon Geofence offset to North-West) */}
                <Polygon
                  positions={[
                    [selectedIncident.lat + 0.5, selectedIncident.lon - 0.8],
                    [selectedIncident.lat + 1.2, selectedIncident.lon - 0.2],
                    [selectedIncident.lat + 0.8, selectedIncident.lon - 1.2],
                    [selectedIncident.lat + 0.2, selectedIncident.lon - 1.0],
                  ]}
                  pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.2, weight: 2, dashArray: '4, 4' }}
                >
                  <Popup>
                    <div className="text-slate-900 font-sans">
                      <strong className="text-blue-600 font-mono text-xs block">🛡️ DEFENSE & SECURITY PERIMETER</strong>
                      <span className="text-[11px] text-slate-600 block">National Defense and barricade line to block unauthorized entry.</span>
                    </div>
                  </Popup>
                </Polygon>

                {/* Agency Markers */}
                {agencies.map((agency) => (
                  <Marker key={agency.id} position={[agency.lat, agency.lon]}>
                    <Popup>
                      <div className="text-slate-900 font-sans">
                        <strong className="block text-sm">{agency.name}</strong>
                        <span className="text-xs text-slate-600 block">{agency.city}</span>
                        <div className="mt-2 text-xs font-mono bg-slate-100 p-1.5 rounded">
                          Status: <strong>{agency.status}</strong><br />
                          Personnel: {agency.personnel} | Boats: {agency.boats}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        )}

        {/* 4. AGENCY REGISTRY */}
        {activeTab === 'registry' && (
          <div className="space-y-6">
            <div className="bg-[#121d22] border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-amber-400">+ REGISTER NEW AGENCY</h3>
              <form onSubmit={handleRegisterAgency} className="grid grid-cols-4 gap-3 text-xs">
                <input type="text" placeholder="Agency Name" value={newAgency.name} onChange={e => setNewAgency({...newAgency, name: e.target.value})} className="bg-[#091013] border border-slate-700 p-2 rounded-lg" required />
                <input type="text" placeholder="Short Code (e.g. IRC)" value={newAgency.code} onChange={e => setNewAgency({...newAgency, code: e.target.value})} className="bg-[#091013] border border-slate-700 p-2 rounded-lg" />
                <input type="text" placeholder="Location (City, State)" value={newAgency.city} onChange={e => setNewAgency({...newAgency, city: e.target.value})} className="bg-[#091013] border border-slate-700 p-2 rounded-lg" required />
                <input type="text" placeholder="Phone Number" value={newAgency.phone} onChange={e => setNewAgency({...newAgency, phone: e.target.value})} className="bg-[#091013] border border-slate-700 p-2 rounded-lg" />
                <input type="number" step="any" placeholder="Latitude" value={newAgency.lat} onChange={e => setNewAgency({...newAgency, lat: e.target.value})} className="bg-[#091013] border border-slate-700 p-2 rounded-lg" />
                <input type="number" step="any" placeholder="Longitude" value={newAgency.lon} onChange={e => setNewAgency({...newAgency, lon: e.target.value})} className="bg-[#091013] border border-slate-700 p-2 rounded-lg" />
                <input type="number" placeholder="Personnel Count" value={newAgency.personnel} onChange={e => setNewAgency({...newAgency, personnel: e.target.value})} className="bg-[#091013] border border-slate-700 p-2 rounded-lg" />
                <input type="number" placeholder="Boats Count" value={newAgency.boats} onChange={e => setNewAgency({...newAgency, boats: e.target.value})} className="bg-[#091013] border border-slate-700 p-2 rounded-lg" />
                <button type="submit" className="col-span-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-2.5 rounded-lg text-xs transition-colors mt-1">
                  Register Unit On Network
                </button>
              </form>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {agencies.map(agency => (
                <div key={agency.id} className="bg-[#121d22] border border-slate-800 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase">{agency.code}</span>
                      <h4 className="font-bold text-sm text-slate-200">{agency.name}</h4>
                      <p className="text-[10px] text-slate-400">{agency.city}</p>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${agency.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                      {agency.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-mono bg-[#091013] p-2 rounded-lg text-slate-300">
                    <div>Boats: {agency.boats}</div>
                    <div>Ambulances: {agency.amb}</div>
                    <div>Crew: {agency.personnel}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. INCIDENT DESK */}
        {activeTab === 'incidents' && (
          <div className="space-y-6">
            <div>
              <p className="text-[10px] text-red-400 font-mono uppercase tracking-wider">COORDINATION NOTICES</p>
              <h2 className="text-2xl font-bold">Incident desk</h2>
              <p className="text-xs text-slate-400 mt-1">Publish and monitor events shaping the operational picture.</p>
            </div>

            <div className="space-y-3">
              {incidents.map(inc => (
                <div key={inc.id} className="bg-[#121d22] border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex gap-2">
                    <span className="bg-red-500/20 text-red-400 text-[9px] px-2 py-0.5 rounded font-mono font-bold">{inc.status}</span>
                    <span className="bg-slate-800 text-slate-300 text-[9px] px-2 py-0.5 rounded font-mono font-bold">{inc.severity}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-200">{inc.title}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">📍 {inc.location} • Started {inc.time}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}