import { Clock, Droplet, Minus } from 'lucide-react';
import { DrinkRecord } from '../types';

interface DrinkRecordsCardProps {
  drinkRecords: DrinkRecord[];
  onRemove: (id: string) => Promise<void> | void;
}

const DrinkRecordsCard = ({ drinkRecords, onRemove }: DrinkRecordsCardProps) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <Clock className="text-purple-500" />
      今日の記録
    </h2>

    <div className="max-h-48 overflow-y-auto space-y-2">
      {drinkRecords.length === 0 ? (
        <p className="text-gray-500 text-center py-4">まだ記録がありません</p>
      ) : (
        drinkRecords
          .slice()
          .reverse()
          .map((record) => (
            <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Droplet className="w-4 h-4 text-blue-500" />
                <span className="font-medium">{record.amount}ml</span>
                <span className="text-gray-500 text-sm">{record.time}</span>
              </div>
              <button
                onClick={() => onRemove(record.id)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          ))
      )}
    </div>
  </div>
);

export default DrinkRecordsCard;
