import { Settings } from 'lucide-react';

interface SettingsCardProps {
  dailyGoal: number;
  onChangeDailyGoal: (value: number) => void;
}

const SettingsCard = ({ dailyGoal, onChangeDailyGoal }: SettingsCardProps) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <Settings className="text-gray-500" />
      基本設定
    </h2>
    <div className="flex items-center justify-between">
      <span className="text-gray-700">1日の目標摂取量</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          //設定した目標摂取量
          value={dailyGoal}
          onChange={(e) => onChangeDailyGoal(Number(e.target.value))}
          className="w-24 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-semibold text-gray-900"
          min="500"
          max="5000"
          step="100"
        />
        <span className="text-gray-600">ml</span>
      </div>
    </div>
  </div>
);

export default SettingsCard;
