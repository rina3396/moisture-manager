import { BarChart3 } from 'lucide-react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import { WeeklyData } from '../types';

interface WeeklyChartCardProps {
  weeklyData: WeeklyData[];
}

const WeeklyChartCard = ({ weeklyData }: WeeklyChartCardProps) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <BarChart3 className="text-indigo-500" />
      週間推移
    </h2>

    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={weeklyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip
            formatter={(value, name) => [
              `${value}ml`,
              name === 'intake' ? '摂取量' : '目標'
            ]}
          />
          <Bar dataKey="intake" fill="#3b82f6" name="摂取量" />
          <Bar dataKey="goal" fill="#e5e7eb" name="目標" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default WeeklyChartCard;
