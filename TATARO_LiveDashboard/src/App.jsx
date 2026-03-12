import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Legend, Cell, ReferenceLine
} from "recharts";

// ─── PALETTE (print-friendly light) ─────────────────────────────────────────
const OT  = "#06B6D4";      // Cyan (primary from presentation)
const PT  = "#0891B2";      // Teal (secondary)
const PGY = "#0E7490";      // Dark teal
const PGN = "#0369A1";      // Blue (accent)
const BG    = "#F0FDFF";    // Light cyan background (from presentation)
const CARD  = "#FFFFFF";
const BORD  = "#CFFAFE";    // Light cyan border
const TXT   = "#0E7490";    // Dark teal text
const MUTED = "#06B6D4";    // Cyan for secondary text
const GRID  = "#E0F2FE";    // Very light blue
const SIG   = "#0369A1";    // Blue asterisk for p<0.05
// ─── DATA (n=40: OT=25, PT=15) ───────────────────────────────────────────────
// Statistically significant differences marked with sig:true (p<0.05, Mann-Whitney / Fisher)

const tabletopPhase = [
  { phase: "Acute\n(1–7 days)",       OT: 3.24, PT: 2.64, sig: true,  p: "p=0.046" },
  { phase: "Sub-acute\n(2–26 wks)",   OT: 4.44, PT: 3.87, sig: true,  p: "p=0.013" },
  { phase: "Chronic\n(≥27 wks)",      OT: 4.40, PT: 4.14, sig: false, p: "p=0.383" },
];

// Q7 — % prescribing task for given severity (Fisher p noted)
const taskSevere = [
  { task: "B. Gross Reach\n(no grasp)",      OT: 60, PT: 33, sig: false, note: "p=0.19" },
  { task: "C. Reach+Grasp\n& Release",        OT: 16, PT: 47, sig: false, note: "p=0.065~" },
  { task: "D. In-hand\nManipulation",         OT: 16, PT: 40, sig: false, note: "p=0.14" },
  { task: "E. ADL / IADL\nTasks",             OT: 24, PT: 47, sig: false, note: "p=0.18" },
];
const taskMild = [
  { task: "D. In-hand\nManipulation", OT: 84, PT: 80, sig: false },
  { task: "E. ADL / IADL\nTasks",     OT: 88, PT: 60, sig: false, note: "p=0.057~" },
  { task: "C. Reach+Grasp", OT: 52, PT: 53, sig: false },
  { task: "B. Gross Reach",           OT: 28, PT: 47, sig: false },
];

// Q10 — % selecting grading strategy (Fisher)
const gradingStrats = [
  { strategy: "Task sequencing\n& adding steps",       OT: 96, PT: 67, sig: true,  note: "p=0.021" },
  { strategy: "Altering motor\ndemand",                OT: 84, PT: 53, sig: false, note: "p=0.065~" },
  { strategy: "Varying levels\nof assistance",         OT: 88, PT: 67, sig: false, note: "p=0.126" },
  { strategy: "Customising to\ngoals/preferences",     OT: 96, PT: 87, sig: false, note: "p=0.545" },
];

// Q11 — weighted mean tailoring triggers (Mann-Whitney)
const tailoringTriggers = [
  { trigger: "A. Trunk\ncompensation",    OT: 4.00, PT: 3.20, sig: true,  note: "p=0.036" },
  { trigger: "C. Limited\nROM",           OT: 4.08, PT: 3.73, sig: false, note: "p=0.308" },
  { trigger: "F. In-hand\nmanip. diff.",  OT: 3.80, PT: 3.33, sig: false, note: "p=0.157" },
  { trigger: "G. Fatigue\nor pain",       OT: 3.64, PT: 3.40, sig: false, note: "p=0.515" },
];

// Q14 — weighted mean assessment (Mann-Whitney)
const assessment = [
  { method: "D. Observation\nof task perform.", OT: 4.64, PT: 4.00, sig: true,  note: "p=0.025" },
  { method: "A. Patient\nself-reports",         OT: 4.28, PT: 3.67, sig: false, note: "p=0.159" },
  { method: "C. Standardised\nassessments",     OT: 4.32, PT: 3.93, sig: false, note: "p=0.964" },
  { method: "E. Task\nmetrics",                 OT: 4.16, PT: 3.93, sig: false, note: "p=0.700" },
];

// Q17 — weighted mean challenge (Mann-Whitney)
const challenges = [
  { challenge: "D. Need to guide/\nsequence tasks",   OT: 2.52, PT: 3.20, sig: true,  note: "p=0.026" },
  { challenge: "C. Monitor\npatient progress",        OT: 2.92, PT: 3.47, sig: true,  note: "p=0.048" },
  { challenge: "A. Caregiver\navailability",          OT: 3.04, PT: 3.27, sig: false, note: "p=0.252" },
  { challenge: "B. Patient\nmotivation",              OT: 3.40, PT: 3.47, sig: false, note: "p=0.640" },
  { challenge: "H. Caregiver\nconfidence",            OT: 2.92, PT: 3.27, sig: false, note: "p=0.165" },
];

// Q18 — % selecting caregiver training area (Fisher)
const cgTraining = [
  { area: "H. Task tailoring\nby ability/response",    OT: 92, PT: 47, sig: true,  note: "p=0.002" },
  { area: "D. Physical/verbal\nsupport",               OT: 88, PT: 47, sig: true,  note: "p=0.009" },
  { area: "I. Reporting\nconcerns to therapist",       OT: 80, PT: 73, sig: false, note: "p=0.717" },
  { area: "G. Safety &\nproper setup",                 OT: 76, PT: 53, sig: false, note: "p=0.175" },
  { area: "E. Motivational/\ninstructional feedback",  OT: 68, PT: 67, sig: false, note: "p=1.000" },
];

// Radar — 7 dimensions for overall profile
const radarDims = [
  { dim: "Acute-phase use",     OT: 3.24, PT: 2.64 },
  { dim: "Sub-acute use",       OT: 4.44, PT: 3.87 },
  { dim: "Chronic use",         OT: 4.40, PT: 4.14 },
  { dim: "Verbal feedback",     OT: 4.44, PT: 4.00 },
  { dim: "Observation assess.", OT: 4.64, PT: 4.00 },
  { dim: "Caregiver-incl. FB",  OT: 3.96, PT: 3.53 },
  { dim: "Patient self-report", OT: 4.28, PT: 3.67 },
];

// ─── ATOMS ────────────────────────────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{ background: CARD, border: `1px solid ${BORD}`, borderRadius: 10,
    padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,.06)", ...style }}>
    {children}
  </div>
);

const PTitle = ({ children, sub, color = OT }) => (
  <div style={{ marginBottom: 8 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 4, height: 16, background: color, borderRadius: 2 }} />
      <h3 style={{ margin: 0, fontSize: 11, fontWeight: 800, color: TXT, textTransform: "uppercase", letterSpacing: 1 }}>{children}</h3>
    </div>
    {sub && <p style={{ margin: "3px 0 0 12px", fontSize: 9.5, color: MUTED, lineHeight: 1.4 }}>{sub}</p>}
  </div>
);

const SigBadge = ({ note, sig }) => (
  <span style={{
    fontSize: 9, padding: "1px 5px", borderRadius: 4, marginLeft: 4,
    background: sig ? "#FEE2E2" : "#F1F5F9",
    color: sig ? SIG : MUTED, fontWeight: 700,
  }}>{sig ? `★ ${note}` : note}</span>
);

const LegendRow = ({ ot, pt }) => (
  <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
    {[["OT (n=25)", OT], ["PT (n=15)", PT]].map(([label, color]) => (
      <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <div style={{ width: 12, height: 12, borderRadius: 3, background: color }} />
        <span style={{ fontSize: 10, color: MUTED, fontWeight: 600 }}>{label}</span>
      </div>
    ))}
    <span style={{ fontSize: 9, color: SIG, fontWeight: 700, marginLeft: 4 }}>★ p&lt;0.05</span>
  </div>
);

const Insight = ({ children, color = OT }) => (
  <div style={{ display: "flex", gap: 7, padding: "7px 10px",
    background: `${color}10`, borderRadius: 7, border: `1px solid ${color}25`,
    marginTop: 9 }}>
    <span style={{ color, fontWeight: 800, fontSize: 13, flexShrink: 0 }}>→</span>
    <p style={{ margin: 0, fontSize: 10, color: TXT, lineHeight: 1.5 }}>{children}</p>
  </div>
);

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: `1px solid ${BORD}`, borderRadius: 7,
      padding: "7px 11px", boxShadow: "0 4px 12px rgba(0,0,0,.1)", fontSize: 11 }}>
      {label && <p style={{ margin: "0 0 4px", color: MUTED, fontSize: 10 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ margin: "2px 0", color: p.fill || TXT }}>
          {p.name}: <b>{p.value}{typeof p.value === "number" && p.value > 5 ? "%" : ""}</b>
        </p>
      ))}
    </div>
  );
};

// Custom bar label showing significance asterisk
const SigLabel = ({ x, y, width, value, sig }) => {
  if (!sig) return null;
  return <text x={x + width / 2} y={y - 3} textAnchor="middle" fill={SIG} fontSize={11} fontWeight={800}>★</text>;
};

const VIEWS = ["OT vs PT: Key Findings", "Full Comparison Table", "Poster Summary"];

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function PosterApp() {
  const [view, setView] = useState(0);

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: BG,
      minHeight: "100vh", color: TXT, paddingBottom: 56 }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0F172A,#1E3A5F)",
        padding: "20px 28px 16px", color: "#fff" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 10, color: "#5EEAD4", textTransform: "uppercase",
                letterSpacing: 2, fontWeight: 700 }}>
                Subgroup Comparisons · Poster Analysis · n = 40
              </span>
              <h1 style={{ margin: "5px 0 4px", fontSize: 18, fontWeight: 800, lineHeight: 1.3 }}>
                TATARO Survey — OT vs PT Clinical Practice Differences
              </h1>
              <p style={{ margin: 0, fontSize: 11.5, color: "#94A3B8" }}>
                Upper-limb tabletop functional training in stroke neuro-rehabilitation ·
                Mann-Whitney U & Fisher's Exact tests · ★ = statistically significant (p&lt;0.05)
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              {[["OT", "25", OT], ["PT", "15", PT]].map(([g, n, c]) => (
                <div key={g} style={{ background: `${c}30`, border: `1px solid ${c}60`,
                  borderRadius: 8, padding: "7px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{g}</span>
                  <span style={{ fontSize: 12, color: "#94A3B8" }}>n = {n}</span>
                </div>
              ))}
              <div style={{ display: "flex", gap: 3 }}>
                {VIEWS.map((v, i) => (
                  <button key={i} onClick={() => setView(i)} style={{
                    background: view === i ? "#0D9488" : "rgba(255,255,255,.1)",
                    color: "#fff", border: `1px solid ${view === i ? "#0D9488" : "rgba(255,255,255,.25)"}`,
                    borderRadius: 7, padding: "7px 13px", fontSize: 11, fontWeight: 600, cursor: "pointer"
                  }}>{v}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1300, margin: "18px auto", padding: "0 20px" }}>

        {/* ════════ VIEW 0: KEY FINDINGS ═══════════════════════════════════ */}
        {view === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Row 1 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>

              {/* Q6 Phase */}
              <Card>
                <PTitle sub="Q6 · Weighted mean frequency of tabletop UL training use (1=Never → 5=Always) · Mann-Whitney U">
                  Tabletop Use by Recovery Phase
                </PTitle>
                <LegendRow />
                <ResponsiveContainer width="100%" height={175}>
                  <BarChart data={tabletopPhase} barSize={22} margin={{ top: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                    <XAxis dataKey="phase" tick={{ fill: MUTED, fontSize: 9.5 }} axisLine={false} />
                    <YAxis domain={[1, 5]} tick={{ fill: MUTED, fontSize: 9 }} axisLine={false}
                      label={{ value: "Mean score (1–5)", angle: -90, position: "insideLeft", fill: MUTED, fontSize: 9, dx: -2 }} />
                    <ReferenceLine y={3} stroke="#CBD5E1" strokeDasharray="4 2" />
                    <Tooltip content={<TT />} />
                    <Bar dataKey="OT" fill={OT} radius={[4,4,0,0]}
                      label={({ x, y, width, index }) => <SigLabel x={x} y={y} width={width} sig={tabletopPhase[index].sig} />} />
                    <Bar dataKey="PT" fill={PT} radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 4 }}>
                  {tabletopPhase.map(d => <SigBadge key={d.phase} note={d.p} sig={d.sig} />)}
                </div>
                <Insight color={OT}>OTs use tabletop training significantly more in <b>Acute</b> (3.24 vs 2.64, p=0.046) and <b>Sub-acute</b> (4.44 vs 3.87, p=0.013) phases — consistent with OT's earlier functional engagement role post-stroke.</Insight>
              </Card>

              {/* Q11 Tailoring triggers */}
              <Card>
                <PTitle color={PT} sub="Q11 · Weighted mean frequency of task tailoring when each observation is made (1=Never → 5=Always) · Mann-Whitney U">
                  Observation Triggers for Task Tailoring
                </PTitle>
                <LegendRow />
                <ResponsiveContainer width="100%" height={175}>
                  <BarChart data={tailoringTriggers} barSize={20} margin={{ top: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                    <XAxis dataKey="trigger" tick={{ fill: MUTED, fontSize: 9.5 }} axisLine={false} interval={0} />
                    <YAxis domain={[1, 5]} tick={{ fill: MUTED, fontSize: 9 }} axisLine={false}
                      label={{ value: "Mean score (1–5)", angle: -90, position: "insideLeft", fill: MUTED, fontSize: 9, dx: -2 }} />
                    <ReferenceLine y={3} stroke="#CBD5E1" strokeDasharray="4 2" />
                    <Tooltip content={<TT />} />
                    <Bar dataKey="OT" fill={OT} radius={[4,4,0,0]}
                      label={({ x, y, width, index }) => <SigLabel x={x} y={y} width={width} sig={tailoringTriggers[index].sig} />} />
                    <Bar dataKey="PT" fill={PT} radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 4 }}>
                  {tailoringTriggers.map(d => <SigBadge key={d.trigger} note={d.note} sig={d.sig} />)}
                </div>
                <Insight color={OT}>OTs are significantly more likely to tailor tasks in response to <b>trunk compensation</b> (4.00 vs 3.20, p=0.036), reflecting OT's postural and movement-quality focus during activity.</Insight>
              </Card>

              {/* Q14 Assessment */}
              <Card>
                <PTitle sub="Q14 · Weighted mean frequency of assessment method use (1=Never → 5=Always) · Mann-Whitney U">
                  Progress Assessment Methods
                </PTitle>
                <LegendRow />
                <ResponsiveContainer width="100%" height={175}>
                  <BarChart data={assessment} barSize={20} margin={{ top: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                    <XAxis dataKey="method" tick={{ fill: MUTED, fontSize: 9.5 }} axisLine={false} interval={0} />
                    <YAxis domain={[1, 5]} tick={{ fill: MUTED, fontSize: 9 }} axisLine={false}
                      label={{ value: "Mean score (1–5)", angle: -90, position: "insideLeft", fill: MUTED, fontSize: 9, dx: -2 }} />
                    <ReferenceLine y={3} stroke="#CBD5E1" strokeDasharray="4 2" />
                    <Tooltip content={<TT />} />
                    <Bar dataKey="OT" fill={OT} radius={[4,4,0,0]}
                      label={({ x, y, width, index }) => <SigLabel x={x} y={y} width={width} sig={assessment[index].sig} />} />
                    <Bar dataKey="PT" fill={PT} radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 4 }}>
                  {assessment.map(d => <SigBadge key={d.method} note={d.note} sig={d.sig} />)}
                </div>
                <Insight color={OT}>OTs rely significantly more on <b>direct task observation</b> (4.64 vs 4.00, p=0.025) as a primary assessment modality, suggesting greater emphasis on qualitative performance analysis.</Insight>
              </Card>
            </div>

            {/* Row 2 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>

              {/* Q10 grading */}
              <Card>
                <PTitle color={OT} sub="Q10 · % of therapists selecting each grading strategy (multi-select) · Fisher's Exact">
                  Task Grading Strategy Use
                </PTitle>
                <LegendRow />
                <ResponsiveContainer width="100%" height={175}>
                  <BarChart data={gradingStrats} barSize={20} margin={{ top: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                    <XAxis dataKey="strategy" tick={{ fill: MUTED, fontSize: 9.5 }} axisLine={false} interval={0} />
                    <YAxis domain={[0, 100]} tick={{ fill: MUTED, fontSize: 9 }} axisLine={false}
                      label={{ value: "% of therapists", angle: -90, position: "insideLeft", fill: MUTED, fontSize: 9, dx: -2 }} />
                    <Tooltip content={<TT />} />
                    <Bar dataKey="OT" fill={OT} radius={[4,4,0,0]}
                      label={({ x, y, width, index }) => <SigLabel x={x} y={y} width={width} sig={gradingStrats[index].sig} />} />
                    <Bar dataKey="PT" fill={PT} radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 4 }}>
                  {gradingStrats.map(d => <SigBadge key={d.strategy} note={d.note} sig={d.sig} />)}
                </div>
                <Insight color={OT}>OTs significantly more often use <b>task sequencing</b> (96% vs 67%, p=0.021) as a grading strategy — structuring activity demands step-by-step aligns with occupational analysis practice.</Insight>
              </Card>

              {/* Q17 challenges */}
              <Card>
                <PTitle color={PT} sub="Q17 · Weighted mean challenge severity (1=Not a challenge → 4=Major challenge) · Mann-Whitney U">
                  Challenges in Therapist's Absence
                </PTitle>
                <LegendRow />
                <ResponsiveContainer width="100%" height={175}>
                  <BarChart data={challenges} barSize={18} margin={{ top: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                    <XAxis dataKey="challenge" tick={{ fill: MUTED, fontSize: 9.5 }} axisLine={false} interval={0} />
                    <YAxis domain={[1, 4]} tick={{ fill: MUTED, fontSize: 9 }} axisLine={false}
                      label={{ value: "Mean severity (1–4)", angle: -90, position: "insideLeft", fill: MUTED, fontSize: 9, dx: -2 }} />
                    <ReferenceLine y={2.5} stroke="#CBD5E1" strokeDasharray="4 2" />
                    <Tooltip content={<TT />} />
                    <Bar dataKey="OT" fill={OT} radius={[4,4,0,0]} />
                    <Bar dataKey="PT" fill={PT} radius={[4,4,0,0]}
                      label={({ x, y, width, index }) => <SigLabel x={x+width} y={y} width={0} sig={challenges[index].sig} />} />
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 4 }}>
                  {challenges.map(d => <SigBadge key={d.challenge} note={d.note} sig={d.sig} />)}
                </div>
                <Insight color={PT}>PTs rate <b>guiding/sequencing tasks</b> (3.20 vs 2.52, p=0.026) and <b>monitoring progress</b> (3.47 vs 2.92, p=0.048) as significantly greater challenges, highlighting greater need for structured remote support tools.</Insight>
              </Card>

              {/* Q18 caregiver training */}
              <Card>
                <PTitle sub="Q18 · % of therapists selecting each caregiver/assistant training area (multi-select) · Fisher's Exact">
                  Caregiver Training Priorities
                </PTitle>
                <LegendRow />
                <ResponsiveContainer width="100%" height={175}>
                  <BarChart data={cgTraining} barSize={18} margin={{ top: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                    <XAxis dataKey="area" tick={{ fill: MUTED, fontSize: 9.5 }} axisLine={false} interval={0} />
                    <YAxis domain={[0, 100]} tick={{ fill: MUTED, fontSize: 9 }} axisLine={false}
                      label={{ value: "% of therapists", angle: -90, position: "insideLeft", fill: MUTED, fontSize: 9, dx: -2 }} />
                    <Tooltip content={<TT />} />
                    <Bar dataKey="OT" fill={OT} radius={[4,4,0,0]}
                      label={({ x, y, width, index }) => <SigLabel x={x} y={y} width={width} sig={cgTraining[index].sig} />} />
                    <Bar dataKey="PT" fill={PT} radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 4 }}>
                  {cgTraining.map(d => <SigBadge key={d.area} note={d.note} sig={d.sig} />)}
                </div>
                <Insight color={OT}>OTs significantly prioritise training caregivers in <b>task tailoring</b> (92% vs 47%, p=0.002) and <b>physical/verbal support</b> (88% vs 47%, p=0.009) — the two largest gaps in the entire dataset.</Insight>
              </Card>
            </div>
          </div>
        )}

        {/* ════════ VIEW 1: FULL COMPARISON TABLE ══════════════════════════ */}
        {view === 1 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

            <Card>
              <PTitle sub="All tested metrics with Mann-Whitney U / Fisher's Exact p-values">
                Complete Statistical Comparison — OT vs PT
              </PTitle>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, marginTop: 4 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${BORD}` }}>
                    <th style={{ textAlign: "left", padding: "7px 10px", color: MUTED, fontSize: 10, fontWeight: 700 }}>Metric</th>
                    <th style={{ textAlign: "center", padding: "7px 8px", color: OT, fontWeight: 800 }}>OT (25)</th>
                    <th style={{ textAlign: "center", padding: "7px 8px", color: PT, fontWeight: 800 }}>PT (15)</th>
                    <th style={{ textAlign: "center", padding: "7px 8px", color: MUTED, fontSize: 10 }}>p</th>
                    <th style={{ textAlign: "center", padding: "7px 8px", color: MUTED, fontSize: 10 }}>Sig</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Q6: Acute-phase use (mean 1–5)", "3.24", "2.64", "0.046", true],
                    ["Q6: Sub-acute use (mean 1–5)", "4.44", "3.87", "0.013", true],
                    ["Q6: Chronic use (mean 1–5)", "4.40", "4.14", "0.383", false],
                    ["Q7: Task E (ADL/IADL) for Mild (%)", "88%", "60%", "0.057", false],
                    ["Q7: Task C (Reach+Grasp) for Severe (%)", "16%", "47%", "0.065", false],
                    ["Q10: Task sequencing (%)", "96%", "67%", "0.021", true],
                    ["Q10: Altering motor demand (%)", "84%", "53%", "0.065", false],
                    ["Q10: Varying assistance levels (%)", "88%", "67%", "0.126", false],
                    ["Q11: Trunk compensation trigger (mean)", "4.00", "3.20", "0.036", true],
                    ["Q13: Verbal feedback (mean 1–5)", "4.44", "4.00", "0.341", false],
                    ["Q13: Caregiver-inclusive FB (mean 1–5)", "3.96", "3.53", "0.327", false],
                    ["Q14: Observation assessment (mean 1–5)", "4.64", "4.00", "0.025", true],
                    ["Q14: Patient self-reports (mean 1–5)", "4.28", "3.67", "0.159", false],
                    ["Q17: Need to guide/sequence (mean 1–4)", "2.52", "3.20", "0.026", true],
                    ["Q17: Monitor progress (mean 1–4)", "2.92", "3.47", "0.048", true],
                    ["Q17: Caregiver availability (mean 1–4)", "3.04", "3.27", "0.252", false],
                    ["Q18: Task tailoring training (%)", "92%", "47%", "0.002", true],
                    ["Q18: Physical/verbal support training (%)", "88%", "47%", "0.009", true],
                    ["Q18: Reporting concerns training (%)", "80%", "73%", "0.717", false],
                    ["Q16: Demo videos for home (%)", "32%", "60%", "0.107", false],
                  ].map(([m, o, p, pv, sig], i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${GRID}`, background: sig ? `${SIG}06` : i % 2 === 0 ? BG : CARD }}>
                      <td style={{ padding: "6px 10px", color: TXT, fontSize: 10.5 }}>{m}</td>
                      <td style={{ padding: "6px 8px", textAlign: "center", fontWeight: 700, color: OT }}>{o}</td>
                      <td style={{ padding: "6px 8px", textAlign: "center", fontWeight: 700, color: PT }}>{p}</td>
                      <td style={{ padding: "6px 8px", textAlign: "center", fontSize: 10, color: sig ? SIG : MUTED, fontWeight: sig ? 700 : 400 }}>{pv}</td>
                      <td style={{ padding: "6px 8px", textAlign: "center", color: sig ? SIG : GRID, fontSize: 14 }}>{sig ? "★" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ margin: "10px 0 0", fontSize: 9.5, color: MUTED }}>
                Mann-Whitney U (ordinal scales) · Fisher's Exact (proportions) · ★ p&lt;0.05 · ~ p&lt;0.10 (trend) · No correction for multiple comparisons applied (exploratory)
              </p>
            </Card>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Radar */}
              <Card>
                <PTitle sub="Weighted mean scores across 7 clinical practice dimensions (all on 1–5 scale)">
                  Clinical Practice Profile — Radar
                </PTitle>
                <LegendRow />
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarDims} cx="50%" cy="50%" outerRadius={100}>
                    <PolarGrid stroke={GRID} />
                    <PolarAngleAxis dataKey="dim" tick={{ fill: MUTED, fontSize: 9.5 }} />
                    <PolarRadiusAxis angle={30} domain={[1, 5]} tick={{ fill: MUTED, fontSize: 8 }} />
                    <Radar name="OT (n=25)" dataKey="OT" stroke={OT} fill={OT} fillOpacity={0.18} strokeWidth={2.5} />
                    <Radar name="PT (n=15)" dataKey="PT" stroke={PT} fill={PT} fillOpacity={0.12} strokeWidth={2.5} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 10, color: MUTED }} />
                    <Tooltip content={<TT />} />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>

              {/* PG supplementary */}
              <Card>
                <PTitle color={PGY} sub="Q17 safety concerns — the only near-significant PG difference (p=0.080)">
                  Supplementary: PG Qualification — Safety Concerns
                </PTitle>
                <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
                  {[["PG Qualified (n=16)", PGY], ["No PG Qual. (n=24)", PGN]].map(([l, c]) => (
                    <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, background: c }} />
                      <span style={{ fontSize: 10, color: MUTED, fontWeight: 600 }}>{l}</span>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={130}>
                  <BarChart data={[
                    { challenge: "Safety concerns\nwhen unsupervised", PGY: 2.62, PGN: 3.12 },
                    { challenge: "Caregiver\navailability", PGY: 3.38, PGN: 2.96 },
                    { challenge: "Monitor\nprogress", PGY: 3.38, PGN: 2.96 },
                  ]} barSize={22}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                    <XAxis dataKey="challenge" tick={{ fill: MUTED, fontSize: 9.5 }} axisLine={false} interval={0} />
                    <YAxis domain={[1, 4]} tick={{ fill: MUTED, fontSize: 9 }} axisLine={false} />
                    <Tooltip content={<TT />} />
                    <Bar dataKey="PGY" name="PG Qualified" fill={PGY} radius={[4,4,0,0]} />
                    <Bar dataKey="PGN" name="No PG Qual." fill={PGN} radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
                <p style={{ margin: "8px 0 0", fontSize: 10, color: MUTED }}>
                  No PG subgroup differences reached p&lt;0.05. PG-qualified therapists trend toward lower safety concerns (2.62 vs 3.12, p=0.080), suggesting specialised training may build confidence in unsupervised programme prescription.
                </p>
              </Card>
            </div>
          </div>
        )}

        {/* ════════ VIEW 2: POSTER SUMMARY ══════════════════════════════════ */}
        {view === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Abstract-style header */}
            <Card style={{ background: "linear-gradient(135deg,#EFF6FF,#F0FDF4)", border: `1px solid #BFDBFE` }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: 16 }}>
                <div>
                  <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: 1 }}>Study Context</p>
                  <p style={{ margin: "0 0 10px", fontSize: 11, color: TXT, lineHeight: 1.55 }}>
                    40 clinicians (25 OT, 15 PT) completed the TATARO survey on upper-limb tabletop functional task training in stroke rehabilitation. Statistical subgroup analysis was conducted using Mann-Whitney U (ordinal) and Fisher's Exact (proportions) tests.
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[["6 significant differences", OT], ["OT vs PT primary", OT], ["PG: no sig. differences", PGY]].map(([l,c]) => (
                      <span key={l} style={{ fontSize: 10, background: `${c}15`, color: c, border: `1px solid ${c}30`, borderRadius: 20, padding: "3px 10px", fontWeight: 700 }}>{l}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                  {[
                    { area: "Phase of Use", ot: "Significantly more Acute & Sub-acute use", pt: "More Chronic-focused pattern", winner: OT },
                    { area: "Grading Strategies", ot: "Task sequencing ★ (96% vs 67%)", pt: "Motor demand & exercise focus", winner: OT },
                    { area: "Unsupervised Challenges", ot: "Lower perceived barriers overall", pt: "Sequencing ★ & monitoring ★ harder", winner: PT },
                    { area: "Assessment", ot: "Observation-led ★ (4.64 vs 4.00)", pt: "Standardised tools prioritised equally", winner: OT },
                    { area: "Caregiver Training", ot: "Task tailoring ★★ & support ★★", pt: "Fewer priorities across all areas", winner: OT },
                    { area: "Observation Triggers", ot: "Trunk compensation ★ (4.0 vs 3.2)", pt: "ROM & manipulation differences", winner: OT },
                  ].map(({ area, ot, pt, winner }, i) => (
                    <div key={i} style={{ padding: "10px 12px", background: CARD, borderRadius: 8,
                      border: `1px solid ${BORD}`, borderTop: `3px solid ${winner}` }}>
                      <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 800, color: TXT, textTransform: "uppercase", letterSpacing: 0.5 }}>{area}</p>
                      <div style={{ display: "flex", gap: 5, marginBottom: 3 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: OT, marginTop: 2, flexShrink: 0 }} />
                        <p style={{ margin: 0, fontSize: 10, color: TXT }}>{ot}</p>
                      </div>
                      <div style={{ display: "flex", gap: 5 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: PT, marginTop: 2, flexShrink: 0 }} />
                        <p style={{ margin: 0, fontSize: 10, color: MUTED }}>{pt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* 6 discussion points */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
              {[
                {
                  n: "01", title: "OTs integrate tabletop training earlier in stroke recovery",
                  text: "OTs report significantly higher tabletop use in Acute (3.24 vs 2.64, p=0.046) and Sub-acute (4.44 vs 3.87, p=0.013) phases. This aligns with occupational therapy's scope of early functional engagement and purposeful activity as a therapeutic medium post-stroke.",
                  tag: "Q6 · p<0.05", color: OT
                },
                {
                  n: "02", title: "Task sequencing as a grading strategy is OT-dominant",
                  text: "96% of OTs vs 67% of PTs use task sequencing to grade activities (p=0.021). This reflects occupational analysis, where activity is broken into components and reconstructed progressively — a foundational OT practice framework.",
                  tag: "Q10 · p<0.05", color: OT
                },
                {
                  n: "03", title: "Observation-based assessment is more central to OT practice",
                  text: "OTs score significantly higher on observation of task performance (4.64 vs 4.00, p=0.025). OTs may integrate continuous qualitative performance observation into every session, whereas PTs may balance this with exercise metrics.",
                  tag: "Q14 · p<0.05", color: OT
                },
                {
                  n: "04", title: "PTs face greater challenges in unsupervised programme delivery",
                  text: "PTs rate the challenge of guiding/sequencing tasks (3.20 vs 2.52, p=0.026) and monitoring progress (3.47 vs 2.92, p=0.048) significantly higher. This has implications for the design of technology that automates task sequencing guidance without direct therapist input.",
                  tag: "Q17 · p<0.05", color: PT
                },
                {
                  n: "05", title: "OTs strongly prioritise caregiver capacity-building for occupation",
                  text: "The largest gaps in the dataset were in caregiver training: task tailoring (92% vs 47%, p=0.002) and physical/verbal support (88% vs 47%, p=0.009). OTs appear to view caregiver training as a core component of extending occupational rehabilitation into the home.",
                  tag: "Q18 · p<0.01 / p<0.05", color: OT
                },
                {
                  n: "06", title: "Professional background shapes when and how tasks are tailored",
                  text: "OTs more consistently tailor activities in response to trunk compensation (4.00 vs 3.20, p=0.036), reflecting biomechanical observation skills. Collectively, OT–PT differences suggest discipline-specific clinical reasoning influences technology feature priorities differently.",
                  tag: "Q11 · p<0.05", color: OT
                },
              ].map(({ n, title, text, tag, color }) => (
                <div key={n} style={{ padding: "13px 14px", background: CARD, borderRadius: 10,
                  border: `1px solid ${BORD}`, borderLeft: `4px solid ${color}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color, background: `${color}15`,
                      padding: "2px 7px", borderRadius: 20 }}>{n}</span>
                    <span style={{ fontSize: 9, color: MUTED, background: GRID,
                      padding: "2px 7px", borderRadius: 20 }}>{tag}</span>
                  </div>
                  <p style={{ margin: "0 0 5px", fontWeight: 800, fontSize: 11, color: TXT }}>{title}</p>
                  <p style={{ margin: 0, fontSize: 10.5, color: MUTED, lineHeight: 1.6 }}>{text}</p>
                </div>
              ))}
            </div>

            <p style={{ textAlign: "center", fontSize: 10, color: MUTED, marginTop: 4 }}>
              Note: n=40 is a small sample; results are exploratory. No correction for multiple comparisons applied.
              Statistically significant findings should be interpreted cautiously and in context of effect sizes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}