import React, { useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Color scheme matching the reference dashboard
const COLORS = {
  primary: '#0891b2',
  primaryLight: '#06b6d4',
  primaryDark: '#0e7490',
  secondary: '#64748b',
  background: '#f8fafc',
  cardBg: '#ffffff',
  text: '#1e293b',
  textLight: '#64748b',
  border: '#e2e8f0',
  success: '#10b981',
  warning: '#f59e0b',
  accent: '#6366f1'
};

const CHART_COLORS = [COLORS.primary, COLORS.primaryLight, COLORS.secondary, COLORS.accent, '#8b5cf6', '#ec4899'];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const totalRespondents = 50;

  // ========== DEMOGRAPHICS DATA ==========
  const experienceData = [
    { name: '0-2 years', value: 20, percent: 40 },
    { name: '3-5 years', value: 21, percent: 42 },
    { name: '6-10 years', value: 5, percent: 10 },
    { name: '11+ years', value: 4, percent: 8 }
  ];

  const pgEducation = [
    { name: 'Yes', value: 17, percent: 34 },
    { name: 'No', value: 33, percent: 66 }
  ];

  const caseloadData = [
    { name: 'Less than 25%', value: 9, percent: 18 },
    { name: '25-50%', value: 12, percent: 24 },
    { name: '51-75%', value: 16, percent: 32 },
    { name: 'More than 75%', value: 13, percent: 26 }
  ];

  const clinicalSettings = [
    { name: 'Inpatient', percent: 80 },
    { name: 'Outpatient', percent: 58 },
    { name: 'Home (Therapist)', percent: 18 },
    { name: 'Home (Caregiver)', percent: 16 },
    { name: 'Telehealth', percent: 12 },
    { name: 'Community', percent: 10 }
  ];

  // ========== PHASE USAGE DATA (COMPLETE) ==========
  const phaseUsageData = [
    { name: 'Acute', Never: 6, Rarely: 20, Sometimes: 44, Often: 14, Always: 14 },
    { name: 'Subacute', Never: 0, Rarely: 0, Sometimes: 21, Often: 43, Always: 36 },
    { name: 'Chronic', Never: 0, Rarely: 2, Sometimes: 21, Often: 25, Always: 52 }
  ];

  // ========== PRACTICE PATTERNS DATA ==========
  const taskComplexityData = [
    { name: 'Grooming &\nSelf-Care', task: 'Task 1', Mild: 30, Moderate: 36, Severe: 46 },
    { name: 'Functional\nReach', task: 'Task 2', Mild: 32, Moderate: 62, Severe: 48 },
    { name: 'Object\nManipulation', task: 'Task 3', Mild: 50, Moderate: 70, Severe: 28 },
    { name: 'Fine Motor\nTasks', task: 'Task 4', Mild: 80, Moderate: 36, Severe: 24 },
    { name: 'Bilateral\nActivities', task: 'Task 5', Mild: 76, Moderate: 40, Severe: 30 }
  ];

  const therapistRolesByTask = [
    { task: 'Task 1:\nGrooming', Instruction: 43, Demonstrate: 45, Assist: 69, Train: 43 },
    { task: 'Task 2:\nReach', Instruction: 54, Demonstrate: 60, Assist: 58, Train: 28 },
    { task: 'Task 3:\nManipulation', Instruction: 67, Demonstrate: 65, Assist: 41, Train: 26 },
    { task: 'Task 4:\nFine Motor', Instruction: 69, Demonstrate: 49, Assist: 18, Train: 33 },
    { task: 'Task 5:\nBilateral', Instruction: 63, Demonstrate: 49, Assist: 33, Train: 33 }
  ];

  // ========== ACTIVITY TOOLS DATA ==========
  const materialsByType = [
    { name: 'ADL Materials', Mild: 76, Moderate: 74, Severe: 36 },
    { name: 'Therapy Equipment', Mild: 58, Moderate: 72, Severe: 52 },
    { name: 'Fine Motor Tools', Mild: 90, Moderate: 34, Severe: 8 },
    { name: 'Games & Recreation', Mild: 82, Moderate: 54, Severe: 34 }
  ];

  // ========== STRATEGIES DATA ==========
  const adjustmentStrategies = [
    { name: 'Goals & Preferences', percent: 94 },
    { name: 'Sequencing Steps', percent: 84 },
    { name: 'Fatigue Tolerance', percent: 80 },
    { name: 'Increase Repetitions', percent: 80 },
    { name: 'Assistance Levels', percent: 78 },
    { name: 'Speed & Precision', percent: 76 },
    { name: 'Motor Demand', percent: 74 },
    { name: 'Object Placement', percent: 68 }
  ];

  const tailoringFrequency = [
    { scenario: 'Environmental Barriers', percent: 84 },
    { scenario: 'Difficulty with Task', percent: 81 },
    { scenario: 'Cognitive Overload', percent: 81 },
    { scenario: 'Safety Concerns', percent: 80 },
    { scenario: 'Patient Shows Fatigue', percent: 79 },
    { scenario: 'Bilateral Deficits', percent: 78 },
    { scenario: 'Motivation Issues', percent: 78 },
    { scenario: 'Attention Deficits', percent: 78 },
    { scenario: 'Limited ROM', percent: 73 },
    { scenario: 'Pain Response', percent: 71 },
    { scenario: 'Coordination Issues', percent: 69 }
  ];

  // ========== FEEDBACK DATA ==========
  const feedbackTiming = [
    { name: 'During Task', percent: 52 },
    { name: 'After Task', percent: 66 }
  ];

  const feedbackTypes = [
    { type: 'Performance Feedback', percent: 88 },
    { type: 'Progress Updates', percent: 76 },
    { type: 'Error Correction', percent: 73 },
    { type: 'Goal Achievement', percent: 72 },
    { type: 'Corrective Guidance', percent: 69 },
    { type: 'Strategy Suggestions', percent: 65 },
    { type: 'Encouragement', percent: 61 }
  ];

  // ========== INTERVENTION REVIEW DATA ==========
  const reviewMethods = [
    { method: 'Direct Observation', percent: 92 },
    { method: 'Standardized Assessments', percent: 90 },
    { method: 'Patient Self-Reports', percent: 88 },
    { method: 'Task Performance Metrics', percent: 84 },
    { method: 'Caregiver Feedback', percent: 71 }
  ];

  // ========== CHALLENGES DATA ==========
  const challengesData = [
    { name: 'Patient Motivation', percent: 86 },
    { name: 'Caregiver Availability', percent: 78 },
    { name: 'Materials Access', percent: 74 },
    { name: 'Monitor Progress', percent: 72 },
    { name: 'Safety Concerns', percent: 72 },
    { name: 'Caregiver Confidence', percent: 70 },
    { name: 'Tailored Instructions', percent: 70 },
    { name: 'Task Sequencing', percent: 62 }
  ];

  const caregiverTrainingNeeds = [
    { area: 'Reporting Concerns', percent: 78 },
    { area: 'Physical/Verbal Support', percent: 72 },
    { area: 'Task Tailoring', percent: 72 },
    { area: 'Object Difficulty', percent: 70 },
    { area: 'Target Positioning', percent: 70 },
    { area: 'Motivational Feedback', percent: 70 },
    { area: 'Safety Setup', percent: 70 },
    { area: 'Tracking Progress', percent: 62 },
    { area: 'Fatigue Compensation', percent: 60 }
  ];

  // ========== COMPONENTS ==========
  const StatCard = ({ title, value, subtitle, icon, color = COLORS.primary }) => (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-icon" style={{ backgroundColor: `${color}20`, color: color }}>
          {icon}
        </span>
        <h3 className="stat-title">{title}</h3>
      </div>
      <div className="stat-value" style={{ color: color }}>{value}</div>
      {subtitle && <div className="stat-subtitle">{subtitle}</div>}
    </div>
  );

  const TabButton = ({ label, active, onClick }) => (
    <button
      className={`tab-button ${active ? 'active' : ''}`}
      onClick={onClick}
      style={{
        backgroundColor: active ? COLORS.primary : 'transparent',
        color: active ? 'white' : COLORS.textLight,
        borderBottom: active ? `3px solid ${COLORS.primary}` : '3px solid transparent'
      }}
    >
      {label}
    </button>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label" style={{ fontWeight: 'bold', marginBottom: '8px' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, margin: '4px 0' }}>
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        .dashboard {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: ${COLORS.background};
          min-height: 100vh;
          padding: 24px;
          color: ${COLORS.text};
        }
        
        .header {
          background: white;
          padding: 32px;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          margin-bottom: 32px;
          border-left: 6px solid ${COLORS.primary};
        }
        
        .header h1 {
          font-size: 32px;
          font-weight: 700;
          color: ${COLORS.text};
          margin-bottom: 8px;
        }
        
        .header p {
          color: ${COLORS.textLight};
          font-size: 16px;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }
        
        .stat-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .stat-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: bold;
        }
        
        .stat-title {
          font-size: 14px;
          color: ${COLORS.textLight};
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .stat-value {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        
        .stat-subtitle {
          color: ${COLORS.textLight};
          font-size: 14px;
        }
        
        .tabs {
          display: flex;
          gap: 8px;
          background: white;
          padding: 8px;
          border-radius: 12px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          overflow-x: auto;
        }
        
        .tab-button {
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        
        .tab-button:hover {
          background: ${COLORS.primary}10 !important;
        }
        
        .content-section {
          background: white;
          padding: 32px;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          margin-bottom: 24px;
        }
        
        .section-title {
          font-size: 20px;
          font-weight: 700;
          color: ${COLORS.text};
          margin-bottom: 24px;
          padding-bottom: 12px;
          border-bottom: 2px solid ${COLORS.border};
        }
        
        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
          gap: 32px;
        }
        
        .chart-container {
          background: ${COLORS.background};
          padding: 24px;
          border-radius: 12px;
          border: 1px solid ${COLORS.border};
        }
        
        .chart-title {
          font-size: 16px;
          font-weight: 600;
          color: ${COLORS.text};
          margin-bottom: 20px;
          text-align: center;
        }
        
        .custom-tooltip {
          background: white;
          padding: 12px 16px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          border: 1px solid ${COLORS.border};
        }
        
        .list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: ${COLORS.background};
          border-radius: 8px;
          margin-bottom: 12px;
          border-left: 4px solid ${COLORS.primary};
        }
        
        .list-item-name {
          font-weight: 600;
          color: ${COLORS.text};
          flex: 1;
        }
        
        .list-item-value {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .badge {
          background: ${COLORS.primary};
          color: white;
          padding: 6px 14px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          min-width: 60px;
          text-align: center;
        }
        
        .progress-bar {
          width: 200px;
          height: 8px;
          background: ${COLORS.border};
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: ${COLORS.primary};
          transition: width 0.3s;
        }

        @media (max-width: 768px) {
          .dashboard {
            padding: 16px;
          }
          .charts-grid {
            grid-template-columns: 1fr;
          }
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .progress-bar {
            width: 120px;
          }
        }
      `}</style>

      <div className="header">
        <h1>TATARO Survey Dashboard</h1>
        <p>Task-Adapted Training for Arm Rehabilitation - Analysis of 50 Therapists</p>
      </div>

      <div className="stats-grid">
        <StatCard 
          title="Total Respondents" 
          value={totalRespondents}
          subtitle="All Therapists Combined"
          icon="👥"
          color={COLORS.primary}
        />
        <StatCard 
          title="With PG Education" 
          value="34%"
          subtitle="17 out of 50 respondents"
          icon="🎓"
          color={COLORS.success}
        />
        <StatCard 
          title="High UL Caseload" 
          value="58%"
          subtitle=">50% upper limb patients"
          icon="📊"
          color={COLORS.accent}
        />
        <StatCard 
          title="Primary Setting" 
          value="Inpatient"
          subtitle="80% work in this setting"
          icon="🏥"
          color={COLORS.warning}
        />
      </div>

      <div className="tabs">
        <TabButton label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
        <TabButton label="Demographics" active={activeTab === 'demographics'} onClick={() => setActiveTab('demographics')} />
        <TabButton label="Practice Patterns" active={activeTab === 'practice'} onClick={() => setActiveTab('practice')} />
        <TabButton label="Activity Tools" active={activeTab === 'tools'} onClick={() => setActiveTab('tools')} />
        <TabButton label="Strategies" active={activeTab === 'strategies'} onClick={() => setActiveTab('strategies')} />
        <TabButton label="Feedback" active={activeTab === 'feedback'} onClick={() => setActiveTab('feedback')} />
        <TabButton label="Intervention Review" active={activeTab === 'review'} onClick={() => setActiveTab('review')} />
        <TabButton label="Challenges" active={activeTab === 'challenges'} onClick={() => setActiveTab('challenges')} />
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="content-section">
            <h2 className="section-title">Key Insights</h2>
            <div className="charts-grid">
              <div className="chart-container">
                <h3 className="chart-title">Years of Experience</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={experienceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${percent}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {experienceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <h3 className="chart-title">Upper Limb Caseload Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={caseloadData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={80} />
                    <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="value" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="content-section">
            <h2 className="section-title">Phase Usage Frequency (% of Respondents)</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={phaseUsageData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="Never" stackId="a" fill="#e2e8f0" />
                <Bar dataKey="Rarely" stackId="a" fill="#94a3b8" />
                <Bar dataKey="Sometimes" stackId="a" fill={COLORS.secondary} />
                <Bar dataKey="Often" stackId="a" fill={COLORS.primaryLight} />
                <Bar dataKey="Always" stackId="a" fill={COLORS.primary} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {activeTab === 'demographics' && (
        <div className="content-section">
          <h2 className="section-title">Demographics & Background</h2>
          <div className="charts-grid">
            <div className="chart-container">
              <h3 className="chart-title">Clinical Settings (% Using Each Setting)</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={clinicalSettings} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                  <XAxis type="number" label={{ value: 'Percentage (%)', position: 'insideBottom', offset: -5 }} />
                  <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="percent" fill={COLORS.primary} radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h3 className="chart-title">Postgraduate Education</h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={pgEducation}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${percent}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pgEducation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? COLORS.primary : COLORS.secondary} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'practice' && (
        <div className="content-section">
          <h2 className="section-title">Task Practice Patterns</h2>
          
          <div className="chart-container" style={{ marginBottom: '32px' }}>
            <h3 className="chart-title">Task Complexity Levels (% Addressing Each Level)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={taskComplexityData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="Mild" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Moderate" fill={COLORS.primaryLight} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Severe" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h3 className="chart-title">Therapist Roles by Task Type (% Using Each Role)</h3>
            <ResponsiveContainer width="100%" height={450}>
              <BarChart data={therapistRolesByTask}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="task" tick={{ fontSize: 10 }} />
                <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="Instruction" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Demonstrate" fill={COLORS.primaryLight} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Assist" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Train" fill={COLORS.secondary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'tools' && (
        <div className="content-section">
          <h2 className="section-title">Activity Tools & Materials Used</h2>
          <div className="chart-container">
            <h3 className="chart-title">Materials Used by Severity Level (% of Respondents)</h3>
            <ResponsiveContainer width="100%" height={450}>
              <BarChart data={materialsByType}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="name" angle={-15} textAnchor="end" height={100} tick={{ fontSize: 11 }} />
                <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="Mild" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Moderate" fill={COLORS.primaryLight} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Severe" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'strategies' && (
        <>
          <div className="content-section">
            <h2 className="section-title">Top Adjustment Strategies Used</h2>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              {adjustmentStrategies.map((strategy, index) => (
                <div key={index} className="list-item">
                  <span className="list-item-name">{strategy.name}</span>
                  <div className="list-item-value">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${strategy.percent}%` }}></div>
                    </div>
                    <span className="badge">{strategy.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="content-section">
            <h2 className="section-title">When Therapists Tailor Activities</h2>
            <div className="chart-container">
              <h3 className="chart-title">Frequency of Activity Tailoring by Scenario (% Often/Always)</h3>
              <ResponsiveContainer width="100%" height={500}>
                <BarChart data={tailoringFrequency} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                  <XAxis type="number" domain={[0, 100]} label={{ value: 'Percentage (%)', position: 'insideBottom', offset: -5 }} />
                  <YAxis type="category" dataKey="scenario" width={180} tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="percent" fill={COLORS.primary} radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {activeTab === 'feedback' && (
        <div className="content-section">
          <h2 className="section-title">Feedback Practices</h2>
          <div className="charts-grid">
            <div className="chart-container">
              <h3 className="chart-title">Feedback Timing (% of Therapists)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={feedbackTiming}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="percent" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h3 className="chart-title">Feedback Types Used (% Often/Always)</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={feedbackTypes} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="type" width={160} tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="percent" fill={COLORS.primary} radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'review' && (
        <div className="content-section">
          <h2 className="section-title">Intervention Review Methods</h2>
          <div className="chart-container">
            <h3 className="chart-title">Assessment Methods Used (% Often/Always)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={reviewMethods} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis type="number" domain={[0, 100]} label={{ value: 'Percentage (%)', position: 'insideBottom', offset: -5 }} />
                <YAxis type="category" dataKey="method" width={200} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="percent" fill={COLORS.primary} radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'challenges' && (
        <>
          <div className="content-section">
            <h2 className="section-title">Implementation Challenges</h2>
            <div className="chart-container">
              <h3 className="chart-title">Challenge Severity (% Moderate/Major Challenge)</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={challengesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                  <XAxis type="number" domain={[0, 100]} label={{ value: 'Percentage (%)', position: 'insideBottom', offset: -5 }} />
                  <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="percent" fill={COLORS.primary} radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="content-section">
            <h2 className="section-title">Caregiver Training Needs</h2>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              {caregiverTrainingNeeds.map((item, index) => (
                <div key={index} className="list-item">
                  <span className="list-item-name">{item.area}</span>
                  <div className="list-item-value">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${item.percent}%` }}></div>
                    </div>
                    <span className="badge">{item.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
