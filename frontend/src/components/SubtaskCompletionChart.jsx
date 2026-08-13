import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function SubtaskCompletionChart({ roadmap }) {
  if (!roadmap || !roadmap.phases || roadmap.phases.length === 0) {
    return null;
  }

  // Calculate total completed and remaining subtasks
  let totalCompleted = 0;
  let totalRemaining = 0;

  roadmap.phases.forEach((phase) => {
    phase.subtasks.forEach((subtask) => {
      if (subtask.completed) {
        totalCompleted++;
      } else {
        totalRemaining++;
      }
    });
  });

  const total = totalCompleted + totalRemaining;
  if (total === 0) {
    return null;
  }

  const data = [
    {
      name: 'Completed',
      value: totalCompleted,
      percentage: Math.round((totalCompleted / total) * 100),
    },
    {
      name: 'Remaining',
      value: totalRemaining,
      percentage: Math.round((totalRemaining / total) * 100),
    },
  ];

  const COLORS = ['#22C55E', '#E2E8F0'];

  const renderCustomLabel = (entry) => {
    return `${entry.percentage}%`;
  };

  return (
    <div className="bg-white border border-paper-200 rounded-2xl p-6 sm:p-8 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-ink-900">Subtask Completion</h3>
        <p className="text-sm text-ink-600 mt-1">{totalCompleted} of {total} subtasks completed</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              label={renderCustomLabel}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#FAFBFE',
                border: '1px solid #EBF0F8',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
              formatter={(value, name, props) => [
                `${value} task${value !== 1 ? 's' : ''} (${props.payload.percentage}%)`,
                props.payload.name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="flex flex-col gap-3 mt-6 sm:mt-0 sm:ml-6">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[idx] }}
              />
              <span className="text-sm font-medium text-ink-700">
                {item.name}: {item.value} ({item.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
