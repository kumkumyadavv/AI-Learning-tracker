import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function GoalProgressChart({ goals }) {
  if (!goals || goals.length === 0) {
    return null;
  }

  const data = goals.map((goal) => ({
    name: goal.title.substring(0, 20),
    progress: goal.progress,
    fullName: goal.title,
  }));

  const colors = ['#2F5BFF', '#5277FF', '#7894FF', '#9DB2FF'];

  return (
    <div className="bg-white border border-paper-200 rounded-xl p-6 sm:p-8">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-ink-900">Goal Progress Overview</h3>
        <p className="text-sm text-ink-600 mt-1">Current progress for all your goals</p>
      </div>
      
      <ResponsiveContainer width="100%" height={Math.max(300, goals.length * 50)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 250, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#292F40" />
          <XAxis type="number" domain={[0, 100]} stroke="#697287" tick={{ fill: '#98A0B3', fontFamily: 'Inter' }} />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={240}
            tick={{ fontSize: 12, fill: '#98A0B3', fontFamily: 'Inter' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#171B27',
              border: '1px solid #292F40',
              borderRadius: '8px',
              color: '#F2F4F8',
              padding: '8px 12px',
            }}
            formatter={(value) => [`${value}%`, 'Progress']}
            labelFormatter={(label, payload) => {
              if (payload && payload.length > 0) {
                return payload[0].payload.fullName;
              }
              return label;
            }}
          />
          <Bar dataKey="progress" fill="#2F5BFF" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
