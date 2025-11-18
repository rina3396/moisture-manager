import { Target } from "lucide-react";

interface DailyIntakeCardProps {
  currentIntake: number;
  dailyGoal: number;
  progress: number;
  remainingAmount: number;
}

const DailyIntakeCard = ({
  currentIntake,
  dailyGoal,
  progress,
  remainingAmount
}: DailyIntakeCardProps) => {
  const progressValue = Math.min(progress, 100);
  const circleSize = 180;
  const strokeWidth = 12;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressValue / 100) * circumference;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Target className="text-blue-500" />
          今日の摂取量
        </h2>
        <span className="text-2xl font-bold text-blue-600">{currentIntake}ml</span>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full" viewBox={`0 0 ${circleSize} ${circleSize}`}>
            <circle
              className="text-gray-200"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              r={radius}
              cx={circleSize / 2}
              cy={circleSize / 2}
            />
            <circle
              className="text-blue-500"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="transparent"
              r={radius}
              cx={circleSize / 2}
              cy={circleSize / 2}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-blue-700">
            <p className="text-xs text-gray-500">進捗率</p>
            <p className="text-3xl font-semibold">{Math.round(progressValue)}%</p>
          </div>
        </div>

        <div className="w-full text-sm text-gray-600 text-center space-y-1">
          <p>目標: {dailyGoal}ml</p>
          <p>残り: {remainingAmount}ml</p>
        </div>
      </div>
    </div>
  );
};

export default DailyIntakeCard;


