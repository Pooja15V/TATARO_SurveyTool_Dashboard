import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

// ─────────────────────────────────────────────────────────────────────────────
//  GOOGLE SHEET CONFIG
//  Sheet ID: 1RQcenkryZTMUwN3i6j_carRtyTjRQJXZTu-fsauPlUg  (already public ✓)
//  Tab name: Res
// ─────────────────────────────────────────────────────────────────────────────
const SHEET_ID  = "1RQcenkryZTMUwN3i6j_carRtyTjRQJXZTu-fsauPlUg";
const TAB_NAME  = "Res";
const GVIZ_URL  = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(TAB_NAME)}`;
const REFRESH_S = 60;   // auto-refresh every 60 s

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const C = {
  bg:"#0F172A", card:"#1E293B", border:"#334155",
  text:"#F1F5F9", muted:"#94A3B8",
  teal:"#0D9488", amber:"#D97706", rose:"#E11D48",
  violet:"#7C3AED", blue:"#2563EB", green:"#16A34A",
  freq:["#E11D48","#F97316","#EAB308","#0D9488","#2563EB"],
  chall:["#16A34A","#EAB308","#F97316","#E11D48"],
};
const FREQ  = ["Never","Rarely","Sometimes","Often","Always"];
const CHALL = ["Not a challenge","Minor challenge","Moderate challenge","Major challenge"];

// ─────────────────────────────────────────────────────────────────────────────
//  PARSE GOOGLE'S GVIZ JSON  →  array of plain row objects  {colLabel: value}
// ─────────────────────────────────────────────────────────────────────────────
function parseGviz(raw) {
  // Google wraps the JSON: google.visualization.Query.setResponse({...});
  const json = raw.replace(/^[^\(]+\(/, "").replace(/\);?\s*$/, "");
  const obj  = JSON.parse(json);
  const cols = obj.table.cols.map(c => c.label);
  return obj.table.rows
    .filter(r => r && r.c)
    .map(r => {
      const row = {};
      cols.forEach((col, i) => { row[col] = r.c[i]?.v ?? null; });
      return row;
    });
}

// ─────────────────────────────────────────────────────────────────────────────
//  PROCESS ROWS  →  chart-ready data objects
//  Column names verified against actual sheet (see Q9 individual flag columns,
//  Q17 exact labels, etc.)
// ─────────────────────────────────────────────────────────────────────────────
function processRows(rows) {
  const n   = rows.length;
  const val = (row, col) => row[col] ?? null;

  // helpers
  const countEq  = (col, v)   => rows.filter(r => val(r,col) === v).length;
  const countHas = (col, sub) => rows.filter(r => String(val(r,col)||"").includes(sub)).length;
  const wmean    = (col, w)   => {
    const vals = rows.map(r=>val(r,col)).filter(Boolean);
    return vals.length ? +(vals.reduce((s,v)=>s+(w[v]||0),0)/vals.length).toFixed(2) : 0;
  };

  // ── Q1 Professional background ──────────────────────────────────────────
  const q1 = [
    { name:"Occupational Therapist (OT)", value: countEq("Q1 Background","OT") },
    { name:"Physiotherapist (PT)",         value: countEq("Q1 Background","PT") },
  ];

  // ── Q2 Experience ────────────────────────────────────────────────────────
  const q2 = [
    { label:"0–2 years",  value: rows.filter(r=>String(val(r,"Q2 Experience")||"").startsWith("0")).length },
    { label:"3–5 years",  value: rows.filter(r=>String(val(r,"Q2 Experience")||"").startsWith("3")).length },
    { label:"6–10 years", value: rows.filter(r=>String(val(r,"Q2 Experience")||"").startsWith("6")).length },
    { label:"11+ years",  value: rows.filter(r=>String(val(r,"Q2 Experience")||"").startsWith("11")).length },
  ];

  // ── Q3 PG qualification ──────────────────────────────────────────────────
  const q3 = [
    { name:"No PG qualification", value: countEq("Q3 PG Yes/No","No")  },
    { name:"Has PG qualification", value: countEq("Q3 PG Yes/No","Yes") },
  ];

  // ── Q4 Caseload % ────────────────────────────────────────────────────────
  const q4 = [
    { label:"< 25%",   value: countEq("Q4 Caseload %","Less than 25%") },
    { label:"25–50%",  value: countEq("Q4 Caseload %","25–50%")  },
    { label:"51–75%",  value: countEq("Q4 Caseload %","51–75%")  },
    { label:"> 75%",   value: countEq("Q4 Caseload %","More than 75%") },
  ];

  // ── Q6 Recovery phase usage ──────────────────────────────────────────────
  const q6 = [
    { phase:"Acute (1–7 days)",    ...Object.fromEntries(FREQ.map(f=>[f,countEq("Q6 Acute Usage",f)])) },
    { phase:"Sub-acute (2–26 wks)",...Object.fromEntries(FREQ.map(f=>[f,countEq("Q6 Subacute Usage",f)])) },
    { phase:"Chronic (≥27 wks)",   ...Object.fromEntries(FREQ.map(f=>[f,countEq("Q6 Chronic Usage",f)])) },
  ];

  // ── Q7 Task type × impairment level (pipe-delimited multi-select) ────────
  const taskDefs = [
    { label:"A. UL Strengthening",       col:"Q7 Task1 Levels" },
    { label:"B. Gross Reach (no grasp)", col:"Q7 Task2 Levels" },
    { label:"C. Reach + Grasp & Release",col:"Q7 Task3 Levels" },
    { label:"D. In-hand Manipulation",   col:"Q7 Task4 Levels" },
    { label:"E. Patient-Specific ADL/IADL",col:"Q7 Task5 Levels"},
  ];
  const q7 = taskDefs.map(({label,col}) => ({
    task: label,
    Mild:     countHas(col,"Mild"),
    Moderate: countHas(col,"Moderate"),
    Severe:   countHas(col,"Severe"),
    "Not Used": countHas(col,"Not Used"),
  }));

  // ── Q8 Therapist roles (pipe-delimited multi-select) ─────────────────────
  const q8 = taskDefs.map(({label},i) => ({
    task: label.replace(/^[A-Z]\.\s/,""),
    "Verbal Instruction": countHas(`Q8 Role Task${i+1}`,"Instruction"),
    "Demonstration":      countHas(`Q8 Role Task${i+1}`,"Demonstrate"),
    "Physical Assist":    countHas(`Q8 Role Task${i+1}`,"Assist"),
    "Caregiver Training": countHas(`Q8 Role Task${i+1}`,"Train"),
  }));

  // ── Q9 Materials — each severity is a SEPARATE column (flag = text value)
  //    e.g. "Q9 ADL Mild" contains "Mild" when selected, else null
  const matDefs = [
    { label:"ADL-based items (Cup, Spoon…)",          base:"Q9 ADL"     },
    { label:"Therapy-specific tools (Putty, Weights…)",base:"Q9 Therapy" },
    { label:"Fine motor/dexterity (Coins, Pegs…)",    base:"Q9 Fine"    },
    { label:"Game-based/cognitive (Puzzles, Sorting…)",base:"Q9 Game"   },
  ];
  const q9 = matDefs.map(({label,base}) => ({
    material: label,
    Mild:     rows.filter(r=>val(r,`${base} Mild`)    != null).length,
    Moderate: rows.filter(r=>val(r,`${base} Moderate`)!= null).length,
    Severe:   rows.filter(r=>val(r,`${base} Severe`)  != null).length,
  }));

  // ── Q10 Grading strategies (pipe-delimited) ──────────────────────────────
  const stratDefs = [
    ["Goals preferences",      "Customising to individual goals/preferences"],
    ["Sequencing steps",       "Sequencing tasks or adding steps"],
    ["Assistance levels",      "Varying levels of assistance"],
    ["Motor demand",           "Altering motor demand"],
    ["Speed precision",        "Modifying task speed or precision"],
    ["Object placement",       "Varying object placement"],
    ["Increase repetitions",   "Increasing movement repetitions"],
    ["Tolerance fatigue",      "Adjusting for patient tolerance/fatigue"],
    ["Object parameters",      "Using smaller/irregular objects"],
    ["Motivation engagement",  "Adapting to motivation/engagement"],
    ["Posture",                "Change posture"],
    ["Increase duration",      "Increasing duration of movement/hold"],
    ["Environmental distractions","Modifying environmental distractions"],
    ["Caregiver support",      "Considering caregiver support availability"],
  ];
  const q10 = stratDefs
    .map(([key,label]) => ({ strategy:label, count:countHas("Q10 Strategies",key) }))
    .sort((a,b)=>b.count-a.count);

  // ── Q11 Observation triggers → weighted mean ─────────────────────────────
  const w5 = {Never:1,Rarely:2,Sometimes:3,Often:4,Always:5};
  const scenDefs = [
    ["Q11 Scenario A","A. Trunk compensation observed"],
    ["Q11 Scenario B","B. Delayed/hesitant movement"],
    ["Q11 Scenario C","C. Limited shoulder/elbow ROM"],
    ["Q11 Scenario D","D. Frequent object drops/slips"],
    ["Q11 Scenario E","E. Poor hand pre-shaping"],
    ["Q11 Scenario F","F. Difficulty with in-hand manipulation"],
    ["Q11 Scenario G","G. Signs of fatigue or pain"],
    ["Q11 Scenario H","H. Poor sequencing/disorganised flow"],
    ["Q11 Scenario I","I. Unsafe handling of tools/objects"],
    ["Q11 Scenario J","J. Inconsistent reach & grasp timing"],
    ["Q11 Scenario K","K. Poor bilateral coordination"],
  ];
  const q11 = scenDefs
    .map(([col,name]) => ({ name, score:wmean(col,w5) }))
    .sort((a,b)=>b.score-a.score);

  // ── Q12 Feedback phase ───────────────────────────────────────────────────
  const q12 = [
    { name:"After task completion only",  value: countEq("Q12 Feedback Phase","After") },
    { name:"During task execution only",  value: countEq("Q12 Feedback Phase","During") },
    { name:"Both during & after",         value: countEq("Q12 Feedback Phase","During | After") },
  ];

  // ── Q13 Feedback types ───────────────────────────────────────────────────
  const fbDefs = [
    ["Q13 Feedback A","A. Verbal feedback on performance"],
    ["Q13 Feedback B","B. Visual demonstration/mirroring"],
    ["Q13 Feedback C","C. Manual/tactile guidance"],
    ["Q13 Feedback D","D. Motivational encouragement"],
    ["Q13 Feedback E","E. Functional relevance cues"],
    ["Q13 Feedback F","F. Patient self-reflection prompts"],
    ["Q13 Feedback G","G. Caregiver-inclusive feedback"],
  ];
  const q13 = fbDefs.map(([col,type]) => ({
    type,
    ...Object.fromEntries(FREQ.map(f=>[f,countEq(col,f)])),
  }));

  // ── Q14 Assessment methods ───────────────────────────────────────────────
  const assDefs = [
    ["Q14 Patient Self Reports",     "A. Patient self-reports"],
    ["Q14 Caregiver Feedback",       "B. Caregiver feedback"],
    ["Q14 Standardized Assessments", "C. Standardised assessments (FMA-UE, ARAT…)"],
    ["Q14 Observation",              "D. Observation of task performance"],
    ["Q14 Task Metrics",             "E. Task metrics (reps, task time)"],
  ];
  const q14 = assDefs.map(([col,method]) => ({
    method,
    ...Object.fromEntries(FREQ.map(f=>[f,countEq(col,f)])),
  }));

  // ── Q15 Behaviour aspects (pipe-delimited) ───────────────────────────────
  const behDefs = [
    ["Movement quality", "Movement quality (smoothness, coordination, compensations)"],
    ["Fatigue signs",    "Fatigue signs (slowing down, posture slump)"],
    ["Attention engagement","Attention and engagement"],
    ["Assistive strategies","Use of assistive strategies"],
    ["Safety tools",     "Safety in handling therapy tools"],
    ["Emotional responses","Emotional responses (frustration, motivation)"],
  ];
  const q15 = behDefs
    .map(([key,label]) => ({ aspect:label, count:countHas("Q15 Behaviour Aspects",key) }))
    .sort((a,b)=>b.count-a.count);

  // ── Q16 Home methods (pipe-delimited) ────────────────────────────────────
  const homeDefs = [
    ["Handouts",           "Home program handouts (paper ± illustrations)"],
    ["Caregiver delivery", "Caregiver-assisted delivery"],
    ["Demo videos",        "Therapist-recorded demonstration videos"],
    ["Clinic reviews",     "Periodic in-clinic reviews"],
    ["Video checkins",     "Phone/video-based check-ins"],
    ["Digital monitoring", "Digital monitoring or reminders"],
  ];
  const q16 = homeDefs
    .map(([key,label]) => ({ method:label, count:countHas("Q16 Implementation Methods",key) }))
    .sort((a,b)=>b.count-a.count);

  // ── Q17 Challenges ───────────────────────────────────────────────────────
  //  Exact column names: Q17 Caregiver Availability, Q17 Patient Motivation, etc.
  const challDefs = [
    ["Q17 Patient Motivation",    "B. Lack of patient motivation"],
    ["Q17 Caregiver Availability","A. Caregiver availability/involvement"],
    ["Q17 Monitor Progress",      "C. Inability to monitor patient progress"],
    ["Q17 Caregiver Confidence",  "H. Caregiver not confident in feedback/adapting"],
    ["Q17 Materials Access",      "F. Limited access to materials/tools"],
    ["Q17 Safety Concerns",       "G. Safety concerns when unsupervised"],
    ["Q17 Task Sequencing",       "D. Need to guide/sequence tasks properly"],
    ["Q17 Tailored Instructions", "E. Lack of tailored instructions for home"],
  ];
  const q17 = challDefs.map(([col,challenge]) => ({
    challenge,
    ...Object.fromEntries(CHALL.map(c=>[c,countEq(col,c)])),
  }));

  // ── Q18 Caregiver training areas (pipe-delimited) ────────────────────────
  const trainDefs = [
    ["Reporting concerns",   "I. Reporting concerns to therapist"],
    ["Safety setup",         "G. Ensuring safety & proper setup"],
    ["Physical verbal support","D. Providing physical/verbal support"],
    ["Motivational feedback","E. Giving motivational/instructional feedback"],
    ["Task tailoring",       "H. Tailoring tasks based on ability/response"],
    ["Object difficulty",    "B. Adjusting object difficulty or size"],
    ["Target position",      "C. Adjusting target position"],
    ["Tracking progress",    "F. Tracking patient progress"],
    ["Fatigue compensation", "A. Identifying signs of fatigue or compensation"],
  ];
  const q18 = trainDefs
    .map(([key,area]) => ({ area, count:countHas("Q18 Training Areas",key) }))
    .sort((a,b)=>b.count-a.count);

  return { n, q1, q2, q3, q4, q6, q7, q8, q9, q10, q11, q12, q13, q14, q15, q16, q17, q18 };
}

// ─── UI ATOMS ─────────────────────────────────────────────────────────────────
const Card = ({ children, style={} }) => (
  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12,
    padding:"18px 22px", ...style }}>{children}</div>
);
const STitle = ({ children, color=C.teal }) => (
  <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:8 }}>
    <div style={{ width:4, height:16, background:color, borderRadius:2, flexShrink:0 }} />
    <h2 style={{ margin:0, fontSize:11.5, fontWeight:700, color:C.text,
      textTransform:"uppercase", letterSpacing:1.2 }}>{children}</h2>
  </div>
);
const Note = ({ children }) =>
  <p style={{ margin:"0 0 10px", fontSize:10.5, color:C.muted, lineHeight:1.55 }}>{children}</p>;

const KPI = ({ label, value, sub, color=C.teal }) => (
  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10,
    padding:"13px 16px", borderTop:`3px solid ${color}` }}>
    <p style={{ margin:"0 0 3px", fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:1 }}>{label}</p>
    <p style={{ margin:"0 0 2px", fontSize:22, fontWeight:700, color:C.text }}>{value}</p>
    {sub && <p style={{ margin:0, fontSize:10, color:C.muted }}>{sub}</p>}
  </div>
);

const TT = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{ background:"#0F172A", border:`1px solid ${C.border}`,
      borderRadius:8, padding:"8px 12px" }}>
      {label && <p style={{ margin:"0 0 4px", color:C.muted, fontSize:10 }}>{label}</p>}
      {payload.map((p,i) => (
        <p key={i} style={{ margin:"2px 0", fontSize:11, color:p.fill||C.text }}>
          {p.name}: <b>{typeof p.value==="number"&&p.value%1!==0 ? p.value.toFixed(2) : p.value}</b>
        </p>
      ))}
    </div>
  );
};

const TABS = [
  "A · Therapist Profile",
  "B · Task Prescription",
  "C · Materials",
  "D · Grading & Tailoring",
  "E · Feedback & Assessment",
  "F · Home Programme",
];

// ─────────────────────────────────────────────────────────────────────────────
//  ROOT
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,       setTab]       = useState(0);
  const [data,      setData]      = useState(null);
  const [status,    setStatus]    = useState("loading");
  const [lastTime,  setLastTime]  = useState(null);
  const [countdown, setCountdown] = useState(REFRESH_S);

  const fetchData = useCallback(async () => {
    setStatus("loading");
    try {
      const res  = await fetch(GVIZ_URL);
      const text = await res.text();
      const rows = parseGviz(text);
      if (!rows.length) throw new Error("empty");
      setData(processRows(rows));
      setLastTime(new Date());
      setStatus("ok");
      setCountdown(REFRESH_S);
    } catch (err) {
      console.error("Fetch error:", err);
      setStatus("error");
    }
  }, []);

  // initial load
  useEffect(() => { fetchData(); }, [fetchData]);

  // auto-refresh
  useEffect(() => {
    const id = setInterval(fetchData, REFRESH_S * 1000);
    return () => clearInterval(id);
  }, [fetchData]);

  // countdown tick
  useEffect(() => {
    if (status !== "ok") return;
    const id = setInterval(() => setCountdown(c => c > 0 ? c - 1 : REFRESH_S), 1000);
    return () => clearInterval(id);
  }, [status, lastTime]);

  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", background:C.bg,
      minHeight:"100vh", color:C.text, paddingBottom:56 }}>

      {/* ── Header ── */}
      <div style={{ background:"linear-gradient(135deg,#0F172A,#1E293B)",
        borderBottom:`1px solid ${C.border}`, padding:"20px 24px 0" }}>
        <div style={{ maxWidth:1220, margin:"0 auto" }}>

          <div style={{ display:"flex", alignItems:"flex-start",
            justifyContent:"space-between", flexWrap:"wrap", gap:14, marginBottom:16 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                <span style={{ width:8, height:8, borderRadius:"50%",
                  background: status==="ok" ? "#22C55E" : status==="error" ? C.rose : C.amber,
                  display:"inline-block", boxShadow: status==="ok" ? "0 0 6px #22C55E" : "none" }} />
                <span style={{ fontSize:10, color:C.muted, fontWeight:600 }}>
                  {status==="ok"    ? `Live · refreshes in ${countdown}s · last updated ${lastTime?.toLocaleTimeString()}` :
                   status==="error" ? "Connection error — retrying…" : "Fetching data…"}
                </span>
              </div>
              <h1 style={{ margin:"0 0 3px", fontSize:19, fontWeight:700, color:C.text }}>
                TATARO Survey — Live Descriptive Statistics
              </h1>
              <p style={{ margin:0, fontSize:11.5, color:C.muted }}>
                Upper-limb tabletop functional training · Neuro-rehabilitation clinicians (OT & PT)
              </p>
            </div>

            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <button onClick={fetchData} style={{
                background:C.teal, color:"#fff", border:"none", borderRadius:8,
                padding:"8px 14px", fontSize:11, fontWeight:700, cursor:"pointer",
              }}>↻ Refresh now</button>

              {data && (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                  <KPI label="Total Responses" value={data.n}
                    sub="Live from Google Sheets" color={C.teal} />
                  <KPI label="OT : PT"
                    value={`${data.q1[0].value} : ${data.q1[1].value}`}
                    sub={`${Math.round(data.q1[0].value/data.n*100)}% OT · ${Math.round(data.q1[1].value/data.n*100)}% PT`}
                    color={C.amber} />
                  <KPI label="PG Qualified"
                    value={data.q3[1].value}
                    sub={`${Math.round(data.q3[1].value/data.n*100)}% of respondents`}
                    color={C.violet} />
                </div>
              )}
            </div>
          </div>

          {/* Status banners */}
          {status==="loading" && !data && (
            <div style={{ textAlign:"center", padding:"32px 0 20px", color:C.muted }}>
              <div style={{ fontSize:28, marginBottom:8 }}>⏳</div>
              <p style={{ margin:0 }}>Fetching latest responses from Google Sheets…</p>
            </div>
          )}
          {status==="error" && (
            <div style={{ background:"#7F1D1D", border:`1px solid #EF4444`,
              borderRadius:8, padding:"12px 16px", marginBottom:12, fontSize:12 }}>
              ⚠ Could not reach Google Sheets. Check your connection or try refreshing.
            </div>
          )}

          {/* Tab bar */}
          <div style={{ display:"flex", gap:3, overflowX:"auto", paddingBottom:2 }}>
            {TABS.map((t,i) => (
              <button key={i} onClick={()=>setTab(i)} style={{
                background: tab===i ? C.teal : "transparent",
                color:      tab===i ? "#fff" : C.muted,
                border:`1px solid ${tab===i ? C.teal : C.border}`,
                borderBottom:"none", borderRadius:"7px 7px 0 0",
                padding:"7px 13px", fontSize:11, fontWeight:600,
                cursor:"pointer", whiteSpace:"nowrap",
              }}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab content ── */}
      <div style={{ maxWidth:1220, margin:"22px auto", padding:"0 20px" }}>
        {data && (
          <>
            {tab===0 && <TabA d={data} />}
            {tab===1 && <TabB d={data} />}
            {tab===2 && <TabC d={data} />}
            {tab===3 && <TabD d={data} />}
            {tab===4 && <TabE d={data} />}
            {tab===5 && <TabF d={data} />}
          </>
        )}
      </div>
    </div>
  );
}

// ─── SHARED CHART HELPERS ─────────────────────────────────────────────────────
const yLabel = (txt) => ({
  value:txt, angle:-90, position:"insideLeft",
  fill:C.muted, fontSize:9, dx:-2
});
const xLabel = (txt) => ({
  value:txt, position:"insideBottom",
  fill:C.muted, fontSize:9, dy:12
});

// ═══════════════════════════════════════════════════════════════════════════════
// A · Therapist Profile & Clinical Context  (Q1 Q2 Q3 Q4 Q6)
// ═══════════════════════════════════════════════════════════════════════════════
function TabA({ d }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>

        <Card>
          <STitle>Q1 · Professional Background</STitle>
          <Note>Distribution by discipline (OT vs PT)</Note>
          <ResponsiveContainer width="100%" height={185}>
            <PieChart>
              <Pie data={d.q1} dataKey="value" nameKey="name" cx="50%" cy="50%"
                outerRadius={70}
                label={({name,percent})=>`${name.split(" ")[0]}: ${(percent*100).toFixed(0)}%`}
                labelLine={false}>
                <Cell fill={C.teal}/><Cell fill={C.amber}/>
              </Pie>
              <Tooltip content={<TT/>}/>
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <STitle color={C.rose}>Q3 · Post-Graduate UL Stroke Qualification</STitle>
          <Note>Holds a PG qualification in UL stroke rehabilitation?</Note>
          <ResponsiveContainer width="100%" height={185}>
            <PieChart>
              <Pie data={d.q3} dataKey="value" nameKey="name" cx="50%" cy="50%"
                innerRadius={45} outerRadius={70} label={({value})=>value}>
                <Cell fill={C.muted}/><Cell fill={C.rose}/>
              </Pie>
              <Tooltip content={<TT/>}/>
              <Legend iconSize={9} wrapperStyle={{fontSize:10,color:C.muted}}/>
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <STitle color={C.violet}>Q4 · Proportion of Caseload: Stroke UL Impairment</STitle>
          <Note>What % of each therapist's caseload includes stroke survivors with UL impairment?</Note>
          <ResponsiveContainer width="100%" height={185}>
            <BarChart data={d.q4} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
              <XAxis dataKey="label" tick={{fill:C.muted,fontSize:10}} axisLine={false}/>
              <YAxis tick={{fill:C.muted,fontSize:9}} axisLine={false} label={yLabel("No. of therapists")}/>
              <Tooltip content={<TT/>}/>
              <Bar dataKey="value" name="Therapists" radius={[5,5,0,0]} fill={C.violet}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <Card>
          <STitle color={C.amber}>Q2 · Years of Clinical Experience in Stroke Rehabilitation</STitle>
          <Note>How many years of experience in stroke rehabilitation?</Note>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={d.q2} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
              <XAxis dataKey="label" tick={{fill:C.text,fontSize:11}} axisLine={false}/>
              <YAxis tick={{fill:C.muted,fontSize:9}} axisLine={false} label={yLabel("No. of therapists")}/>
              <Tooltip content={<TT/>}/>
              <Bar dataKey="value" name="Therapists" radius={[6,6,0,0]}>
                {d.q2.map((_,i)=><Cell key={i} fill={[C.amber,C.teal,C.violet,C.rose][i]}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <STitle>Q6 · Frequency of Tabletop UL Task Training by Stroke Recovery Phase</STitle>
          <Note>How often is tabletop UL training used in each recovery phase? (Never → Always, stacked)</Note>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={d.q6} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
              <XAxis dataKey="phase" tick={{fill:C.text,fontSize:10}} axisLine={false}/>
              <YAxis tick={{fill:C.muted,fontSize:9}} axisLine={false} label={yLabel("No. of therapists")}/>
              <Tooltip content={<TT/>}/>
              <Legend iconSize={8} wrapperStyle={{fontSize:9,color:C.muted}}/>
              {FREQ.map((f,i)=>
                <Bar key={f} dataKey={f} stackId="a" fill={C.freq[i]}
                  radius={i===4?[4,4,0,0]:[0,0,0,0]}/>)}
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// B · Task Prescription & Therapist Role  (Q7 Q8)
// ═══════════════════════════════════════════════════════════════════════════════
function TabB({ d }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <Card>
        <STitle>Q7 · Task Type Prescribed by UL Impairment Level (FMA-UE)</STitle>
        <Note>For which FMA-UE severity level is each task type prescribed?  Mild=50–66 · Moderate=35–49 · Severe=0–34</Note>
        <ResponsiveContainer width="100%" height={270}>
          <BarChart data={d.q7} barSize={14}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
            <XAxis dataKey="task" tick={{fill:C.text,fontSize:10}} axisLine={false} interval={0}/>
            <YAxis tick={{fill:C.muted,fontSize:9}} axisLine={false} domain={[0,Math.max(d.n,10)]}
              label={yLabel("No. of therapists selecting impairment level")}/>
            <Tooltip content={<TT/>}/>
            <Legend iconSize={9} wrapperStyle={{fontSize:10,color:C.muted}}/>
            <Bar dataKey="Mild"     fill={C.teal}   radius={[4,4,0,0]}/>
            <Bar dataKey="Moderate" fill={C.amber}  radius={[4,4,0,0]}/>
            <Bar dataKey="Severe"   fill={C.rose}   radius={[4,4,0,0]}/>
            <Bar dataKey="Not Used" fill={C.muted}  radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <STitle color={C.amber}>Q8 · Therapist's Role During Delivery of Each Task Type</STitle>
        <Note>What roles do therapists perform when delivering each task type? (multi-select)</Note>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={d.q8} barSize={12}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
            <XAxis dataKey="task" tick={{fill:C.text,fontSize:10}} axisLine={false} interval={0}/>
            <YAxis tick={{fill:C.muted,fontSize:9}} axisLine={false} domain={[0,Math.max(d.n,10)]}
              label={yLabel("No. of therapists selecting role")}/>
            <Tooltip content={<TT/>}/>
            <Legend iconSize={9} wrapperStyle={{fontSize:10,color:C.muted}}/>
            <Bar dataKey="Verbal Instruction" fill={C.teal}   radius={[4,4,0,0]}/>
            <Bar dataKey="Demonstration"      fill={C.amber}  radius={[4,4,0,0]}/>
            <Bar dataKey="Physical Assist"    fill={C.rose}   radius={[4,4,0,0]}/>
            <Bar dataKey="Caregiver Training" fill={C.violet} radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// C · Activity Materials & Tools  (Q9)
// ═══════════════════════════════════════════════════════════════════════════════
function TabC({ d }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <Card>
        <STitle>Q9 · Training Material Category by UL Impairment Severity (FMA-UE)</STitle>
        <Note>Which material categories are used at each impairment severity?  Mild=50–66 · Moderate=35–49 · Severe=0–34</Note>
        <ResponsiveContainer width="100%" height={270}>
          <BarChart data={d.q9} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
            <XAxis dataKey="material" tick={{fill:C.text,fontSize:10}} axisLine={false} interval={0}/>
            <YAxis tick={{fill:C.muted,fontSize:9}} axisLine={false} domain={[0,Math.max(d.n,10)]}
              label={yLabel("No. of therapists selecting material at severity level")}/>
            <Tooltip content={<TT/>}/>
            <Legend iconSize={9} wrapperStyle={{fontSize:10,color:C.muted}}/>
            <Bar dataKey="Mild"     fill={C.teal}  radius={[5,5,0,0]}/>
            <Bar dataKey="Moderate" fill={C.amber} radius={[5,5,0,0]}/>
            <Bar dataKey="Severe"   fill={C.rose}  radius={[5,5,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {d.q9.map(mat=>(
          <Card key={mat.material}>
            <STitle color={C.teal}>{mat.material.split("(")[0].trim()}</STitle>
            <p style={{fontSize:10,color:C.muted,margin:"0 0 10px"}}>
              Examples: {mat.material.match(/\(([^)]+)\)/)?.[1]}
            </p>
            <div style={{ display:"flex", gap:8 }}>
              {[["Mild (50–66)",mat.Mild,C.teal],["Moderate (35–49)",mat.Moderate,C.amber],["Severe (0–34)",mat.Severe,C.rose]]
                .map(([lbl,val,col])=>(
                <div key={lbl} style={{ flex:1, background:C.bg, borderRadius:8,
                  padding:"10px 12px", borderTop:`3px solid ${col}` }}>
                  <p style={{margin:0,fontSize:20,fontWeight:700,color:col}}>{val}</p>
                  <p style={{margin:"2px 0 0",fontSize:10,color:C.muted}}>{lbl}</p>
                  <p style={{margin:"1px 0 0",fontSize:10,color:C.muted}}>
                    {Math.round(val/d.n*100)}% of therapists
                  </p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// D · Grading, Tailoring & Feedback Phase  (Q10 Q11 Q12)
// ═══════════════════════════════════════════════════════════════════════════════
function TabD({ d }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <Card>
        <STitle>Q10 · Task Grading Strategies Applied During UL Functional Therapy</STitle>
        <Note>Which strategies do therapists use when adjusting task difficulty? (multi-select, sorted by frequency)</Note>
        <ResponsiveContainer width="100%" height={330}>
          <BarChart data={d.q10} layout="vertical" barSize={15} margin={{left:8}}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false}/>
            <XAxis type="number" domain={[0,Math.max(d.n,10)]} tick={{fill:C.muted,fontSize:9}} axisLine={false}
              label={xLabel("No. of therapists selecting strategy")}/>
            <YAxis dataKey="strategy" type="category" tick={{fill:C.text,fontSize:10}}
              axisLine={false} width={250}/>
            <Tooltip content={<TT/>}/>
            <Bar dataKey="count" name="Therapists" radius={[0,5,5,0]}>
              {d.q10.map((_,i)=><Cell key={i} fill={`hsl(${172-i*6},60%,${44+i}%)`}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16 }}>
        <Card>
          <STitle color={C.amber}>Q11 · Observation Triggers for Task Tailoring — Weighted Mean Frequency</STitle>
          <Note>Weighted score: Never=1 · Rarely=2 · Sometimes=3 · Often=4 · Always=5.  Higher = more consistently triggers task adaptation.</Note>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={d.q11} layout="vertical" barSize={15} margin={{left:8}}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false}/>
              <XAxis type="number" domain={[1,5]} tick={{fill:C.muted,fontSize:9}} axisLine={false}
                label={xLabel("Weighted mean (1=Never → 5=Always)")}/>
              <YAxis dataKey="name" type="category" tick={{fill:C.text,fontSize:10}}
                axisLine={false} width={205}/>
              <Tooltip content={<TT/>} formatter={v=>v.toFixed(2)}/>
              <Bar dataKey="score" name="Mean Score" radius={[0,5,5,0]}>
                {d.q11.map((s,i)=>
                  <Cell key={i} fill={s.score>=3.8?C.teal:s.score>=3.4?C.amber:C.rose}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <STitle color={C.violet}>Q12 · Feedback Delivery Phase</STitle>
          <Note>At which point do therapists most emphasise delivering feedback?</Note>
          <ResponsiveContainer width="100%" height={225}>
            <PieChart>
              <Pie data={d.q12} dataKey="value" nameKey="name"
                cx="50%" cy="44%" outerRadius={70} label={({value})=>value}>
                {d.q12.map((_,i)=><Cell key={i} fill={[C.amber,C.teal,C.violet][i]}/>)}
              </Pie>
              <Tooltip content={<TT/>}/>
              <Legend iconSize={8} wrapperStyle={{fontSize:10,color:C.muted}}/>
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// E · Feedback Types & Progress Assessment  (Q13 Q14 Q15)
// ═══════════════════════════════════════════════════════════════════════════════
function TabE({ d }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <Card>
        <STitle>Q13 · Frequency of Feedback Type Used in UL Tabletop Training Sessions</STitle>
        <Note>How often is each feedback modality used? (Never → Always, stacked)</Note>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={d.q13} barSize={12}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
            <XAxis dataKey="type" tick={{fill:C.text,fontSize:10}} axisLine={false} interval={0}/>
            <YAxis tick={{fill:C.muted,fontSize:9}} axisLine={false}
              label={yLabel("No. of therapists")}/>
            <Tooltip content={<TT/>}/>
            <Legend iconSize={8} wrapperStyle={{fontSize:10,color:C.muted}}/>
            {FREQ.map((f,i)=>
              <Bar key={f} dataKey={f} stackId="a" fill={C.freq[i]}
                radius={i===4?[4,4,0,0]:[0,0,0,0]}/>)}
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <STitle color={C.amber}>Q14 · Frequency of Progress Assessment Methods</STitle>
        <Note>How frequently is each assessment method used? (Never → Always, stacked)</Note>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={d.q14} barSize={12}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
            <XAxis dataKey="method" tick={{fill:C.text,fontSize:10}} axisLine={false} interval={0}/>
            <YAxis tick={{fill:C.muted,fontSize:9}} axisLine={false}
              label={yLabel("No. of therapists")}/>
            <Tooltip content={<TT/>}/>
            <Legend iconSize={8} wrapperStyle={{fontSize:10,color:C.muted}}/>
            {FREQ.map((f,i)=>
              <Bar key={f} dataKey={f} stackId="a" fill={C.freq[i]}
                radius={i===4?[4,4,0,0]:[0,0,0,0]}/>)}
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <STitle color={C.violet}>Q15 · Patient Behaviour Aspects Observed When Assessing Task Performance</STitle>
        <Note>Which observable behaviours do therapists monitor during performance assessment? (multi-select)</Note>
        <ResponsiveContainer width="100%" height={215}>
          <BarChart data={d.q15} layout="vertical" barSize={20} margin={{left:8}}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false}/>
            <XAxis type="number" domain={[0,Math.max(d.n,10)]} tick={{fill:C.muted,fontSize:9}} axisLine={false}
              label={xLabel("No. of therapists selecting behaviour")}/>
            <YAxis dataKey="aspect" type="category" tick={{fill:C.text,fontSize:10}}
              axisLine={false} width={295}/>
            <Tooltip content={<TT/>}/>
            <Bar dataKey="count" name="Therapists" radius={[0,5,5,0]} fill={C.violet}/>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// F · Home Programme & Service Continuity  (Q16 Q17 Q18)
// ═══════════════════════════════════════════════════════════════════════════════
function TabF({ d }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <Card>
        <STitle>Q16 · Methods Used to Continue UL Training in Therapist's Absence</STitle>
        <Note>How do therapists implement tabletop UL training for patients at home/unsupervised? (multi-select)</Note>
        <ResponsiveContainer width="100%" height={205}>
          <BarChart data={d.q16} layout="vertical" barSize={18} margin={{left:8}}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false}/>
            <XAxis type="number" domain={[0,Math.max(d.n,10)]} tick={{fill:C.muted,fontSize:9}} axisLine={false}
              label={xLabel("No. of therapists using method")}/>
            <YAxis dataKey="method" type="category" tick={{fill:C.text,fontSize:10}}
              axisLine={false} width={295}/>
            <Tooltip content={<TT/>}/>
            <Bar dataKey="count" name="Therapists" radius={[0,5,5,0]}>
              {d.q16.map((_,i)=>
                <Cell key={i} fill={[C.teal,C.amber,C.violet,C.blue,C.rose,C.green][i]}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <STitle color={C.rose}>Q17 · Challenges in Implementing Therapy Programme Without Direct Supervision</STitle>
        <Note>Extent of each challenge when the therapist is absent (Not a challenge → Major challenge, stacked)</Note>
        <ResponsiveContainer width="100%" height={285}>
          <BarChart data={d.q17} layout="vertical" barSize={17} margin={{left:8}}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false}/>
            <XAxis type="number" tick={{fill:C.muted,fontSize:9}} axisLine={false}
              label={xLabel("No. of therapists")}/>
            <YAxis dataKey="challenge" type="category" tick={{fill:C.text,fontSize:10}}
              axisLine={false} width={240}/>
            <Tooltip content={<TT/>}/>
            <Legend iconSize={8} wrapperStyle={{fontSize:10,color:C.muted}}/>
            {CHALL.map((c,i)=>
              <Bar key={c} dataKey={c} stackId="a" fill={C.chall[i]}
                radius={i===3?[0,5,5,0]:[0,0,0,0]}/>)}
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <STitle color={C.amber}>Q18 · Competency Areas Prioritised When Training a Caregiver/Therapy Assistant</STitle>
        <Note>Which training areas would therapists prioritise for a caregiver/assistant? (multi-select, sorted by frequency)</Note>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={d.q18} layout="vertical" barSize={18} margin={{left:8}}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false}/>
            <XAxis type="number" domain={[0,Math.max(d.n,10)]} tick={{fill:C.muted,fontSize:9}} axisLine={false}
              label={xLabel("No. of therapists selecting training area")}/>
            <YAxis dataKey="area" type="category" tick={{fill:C.text,fontSize:10}}
              axisLine={false} width={255}/>
            <Tooltip content={<TT/>}/>
            <Bar dataKey="count" name="Therapists" radius={[0,5,5,0]}>
              {d.q18.map((_,i)=>
                <Cell key={i} fill={`hsl(${38+i*12},68%,${50+i}%)`}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
