import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function PhaseProgressChart({ roadmap }) {
  if (!roadmap || !roadmap.phases || roadmap.phases.length === 0) {
    return null;
  }

  const data = roadmap.phases.map((phase) => {
    const completed = phase.subtasks.filter((s) => s.completed).length;
    const total = phase.subtasks.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      name: phase.phase_title.substring(0, 25),
      progress,
      completed,
      total,
      fullName: phase.phase_title,
    };
  });

  const colors = ['#6D28D9', '#7C3AED', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'];

  return (
    <div className="bg-white border border-paper-200 rounded-2xl p-6 sm:p-8 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-ink-900">Phase Progress</h3>
        <p className="text-sm text-ink-600 mt-1">Completion percentage for each phase</p>
      </div>

      <ResponsiveContainer width="100%" height={Math.max(300, data.length * 50)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 250, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#EBF0F8" />
          <XAxis type="number" domain={[0, 100]} stroke="#94A3B8" />
          <YAxis
            dataKey="name"
            type="category"
            width={240}
            tick={{ fontSize: 12, fill: '#334155' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FAFBFE',
              border: '1px solid #EBF0F8',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
            formatter={(value, name, props) => {
              if (name === 'progress') {
                return [
                  `${value}% (${props.payload.completed}/${props.payload.total} subtasks)`,
                  'Progress',
                ];
              }
              return [value, name];
            }}
            labelFormatter={(label, payload) => {
              if (payload && payload.length > 0) {
                return payload[0].payload.fullName;
              }
              return label;
            }}
          />
          <Bar dataKey="progress" fill="#6D28D9" radius={[0, 8, 8, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
