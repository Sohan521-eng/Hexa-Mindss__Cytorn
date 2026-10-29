# 🛡️ CYCLO-AI: Autonomous Disaster Grid (`/autonomous-grid`)
### *Essential Specification — Clean & Practical Command Center*

---

## 🎯 1. Core Real-World Purpose

During a severe cyclone, standard emergency portals only show passive weather charts.  
**Page 11 (`/autonomous-grid`) performs 3 critical automated actions:**

1. **Flood-Aware Evacuation Rerouting:** Automatically detects submerged roads from the Digital Twin and reroutes evacuation bus convoys to dry roads before they get trapped.
2. **Shelter Load Balancing:** Tracks live shelter occupancies and diverts incoming buses away from full shelters to safe, elevated shelters with empty beds.
3. **Emergency Drone Dispatch:** Coordinates medical relief drones (carrying blood, anti-venom, and food) to cut-off coastal communities.

---

## 🗺️ 2. Navigation & Query Ingestion

### Incoming Query Parameters:
- `?district=puri` *(Default: Puri — selectable: Kendrapara, Balasore, Bhadrak)*
- `?status=evac` *(Triggered from Page 6 `/alerts` or Page 9 `/digital-twin`)*
- `?storm=arnab` *(Active storm context)*

---

## 📐 3. Clean 3-Section Layout Wireframe

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🛡️ AUTONOMOUS DISASTER GRID  [District: Puri ▼]  [Status: EVACUATION ACTIVE]  [Mode: AUTONOMOUS] │
├──────────────────────────────────────────────────────────────┬───────────────────────────────────┤
│ 🗺️ TACTICAL EVACUATION & ROUTING MAP (Canvas)                 │ 🏥 SHELTERS & DRONES PANEL        │
│                                                              │                                   │
│ • Live Road Network:                                         │ 🏢 CYCLONE SHELTER CAPACITY       │
│   🟢 Safe Dry Road                                           │ • Shelter A (Town Hall): 92% ⚠️   │
│   🔴 Submerged / Flooded Chokepoint (Bridge underwater)      │   [Diverting incoming buses]      │
│                                                              │ • Shelter B (Govt College): 45%   │
│ • Moving Bus Convoys:                                        │   [Receiving diverted convoys]    │
│   🚍 Convoy Alpha (24 Buses) -> Heading to Shelter B         │ • Shelter C (Badasankha): 62%     │
│                                                              │   [Optimal capacity]              │
│ • Reroute Alert Banner (Top of map):                         │                                   │
│   ⚠️ "NH-316 Bridge flooded (+0.9m) — Convoy Alpha           │ ───────────────────────────────── │
│       autonomously rerouted via Highway 13 (+8 mins)"        │ 🛸 MEDICAL RELIEF DRONES          │
│                                                              │ • Drone Garuda-1: Airborne (88%)  │
│ • Drone Flight Corridors & Drop Points                       │   Payload: Anti-Venom Serums      │
│                                                              │ • Drone Garuda-2: Standby (100%)  │
│                                                              │   Payload: Satellite SOS Beacons  │
│                                                              │ [⚡ Instant Drone Dispatch Button] │
├──────────────────────────────────────────────────────────────┴───────────────────────────────────┤
│ ⚡ QUICK ACTIONS:  [ 📢 Send CAP Alert ]   [ 📄 Export SITREP PDF ]   [ 🌊 Launch Digital Twin ]   │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ 4. The 4 Essential Modules To Build

### Module A: Top Tactical Bar (`#auto-grid-top-bar`)
- **District Selector:** Dropdown for coastal districts (`Puri`, `Kendrapara`, `Balasore`, `Bhadrak`).
- **Operation Status Badge:** High-visibility pill: `EVACUATION STAGE 4 ACTIVE` (Coral `#FF5E36`).
- **Autonomous Mode Switch:** Toggle between `Autonomous Auto-Reroute` (AI reroutes automatically) and `Manual Confirmation` (DM approves reroutes).
- **Quick Headcount Counter:** `Evacuated: 42,800 / 48,000 (89.1%)`.

### Module B: Tactical Evacuation Map Canvas (`#tactical-evacuation-map`)
- Clean 2D / Canvas map rendering the coastal road network of the selected district.
- **Road States:**
  - **Green (`#10E7A2`):** Clear, safe for bus convoys.
  - **Red (`#FF5E36`):** Submerged ($>0.3\text{m}$ water depth, closed to traffic).
- **Convoy Markers:** Interactive moving bus icons showing passenger count and destination.
- **Dynamic Reroute Banner:** Pops up when a road cuts off, showing the new dry route.

### Module C: Shelter Capacity Balancer (`#shelter-capacity-card`)
- Clean progress meters for 3 to 5 key district shelters:
  - **Occupancy %** with color coding (Green $<75\%$, Amber $75\text{–}90\%$, Red $>90\%$).
  - **Available Beds & Elevation** (e.g. `+8.2m MSL • 350 beds left`).
  - **Auto-Diversion Indicator:** If a shelter reaches $90\%$, an amber arrow points to the destination shelter taking the overflow.

### Module D: Relief Drone Dispatcher (`#drone-dispatch-card`)
- Status cards for 3 Garuda UAVs:
  - **Garuda-1:** `EN_ROUTE` • Battery: $84\%$ • Payload: *Anti-Venom & First Aid*.
  - **Garuda-2:** `STANDBY` • Battery: $100\%$ • Payload: *Satellite SOS Beacons*.
  - **Garuda-3:** `RETURNING` • Battery: $38\%$ • Payload: *Purified Water Packets*.
- **One-Click Dispatch Button:** `[ 🛸 Quick Dispatch Drone to Isolated Village ]`.

### Module E: Bottom Operational Action Strip (`#grid-action-strip`)
- **`[ 📢 Broadcast CAP Emergency Alert ]`** — Triggers simulated broadcast to sirens & phones.
- **`[ 📄 Export Situation Report (SITREP) ]`** — Downloads quick 1-page summary report.
- **`[ 🌊 Open Inundation on Digital Twin ]`** — Direct link to `/digital-twin?district=puri`.

---

## 📊 5. Minimal Data Schemas (TypeScript)

```typescript
export interface ConvoyItem {
  id: string;
  name: string;              // e.g. "Convoy Alpha (Buses)"
  peopleCount: number;       // e.g. 1450
  assignedShelter: string;   // e.g. "Govt College Shelter"
  status: "nominal" | "rerouted" | "arrived";
  rerouteNote?: string;      // e.g. "NH-316 Bridge flooded -> Rerouted via SH-13"
}

export interface ShelterItem {
  id: string;
  name: string;              // e.g. "Town Hall MPCS"
  occupancy: number;         // e.g. 1850
  capacity: number;          // e.g. 2000
  elevationMeters: number;   // e.g. 8.4m
  status: "optimal" | "diverting" | "full";
}

export interface DroneItem {
  id: string;
  callsign: string;          // e.g. "Garuda-1"
  battery: number;           // e.g. 85%
  payload: string;           // e.g. "Anti-Venom & First Aid"
  status: "airborne" | "standby" | "returning";
}
```

---

## 🎨 6. Design Tokens & Styling

- **Background (60%):** `#050B14` (Deep Void Abyss) with subtle noise texture.
- **Surface Panels (30%):** `#0F1B2F` with `1.5px solid rgba(0, 242, 254, 0.35)` borders.
- **Accents (10%):**
  - **Green (`#10E7A2`):** Safe roads, available shelter capacity, ready drones.
  - **Cyan (`#00F2FE`):** Active UI buttons, live convoys, selection pills.
  - **Coral (`#FF5E36`):** Flooded roads, emergency alerts, shelter overcapacity.
  - **Amber (`#F59E0B`):** Convoys being rerouted, moderate risks.
- **Typography:** `font-orbitron` for titles, `font-rajdhani` for labels, `font-jetbrains` for metrics and numbers.
- **Text Shadows:** Crisp `[text-shadow:0_2px_4px_rgba(0,0,0,0.95)]` with prominent cutout borders and zero outer glow.

---

## 📁 7. File Structure to Implement

```
src/
├── app/
│   └── (main)/
│       └── autonomous-grid/
│           └── page.tsx                      # Clean master page shell (<Suspense>)
└── components/
    └── autonomous-grid/
        ├── types.ts                          # Minimal TypeScript types
        ├── autoGridData.ts                   # Presets for Puri, Kendrapara, Balasore
        ├── AutoGridTopBar.tsx                # District dropdown, status badge & mode switch
        ├── TacticalEvacuationMap.tsx         # 2D Canvas map with road lines, convoys & reroutes
        ├── ShelterCapacityCard.tsx           # Shelter progress bars & overflow diversion
        ├── DroneDispatchCard.tsx             # 3 drone cards + quick dispatch action
        └── GridActionStrip.tsx               # CAP Alert, SITREP download & Digital Twin link
```

---

## 🏆 8. Key Talking Point for Judges

> *"While other projects merely display passive storm tracks, CYCLO-AI's Autonomous Grid solves the real-world life-saving problem: keeping evacuation convoys out of rising floodwaters and automatically balancing shelter capacities in real time."*
