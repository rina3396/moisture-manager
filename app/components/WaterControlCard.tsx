import { Droplet, Minus, Plus } from 'lucide-react';

interface WaterControlCardProps {
  drinkAmount: number;
  onDecrease: () => void;
  onIncrease: () => void;
  onAddWater: () => Promise<void> | void;
  nextDrinkTimeText: string;
}

const WaterControlCard = ({
  drinkAmount,
  onDecrease,
  onIncrease,
  onAddWater,
  nextDrinkTimeText
}: WaterControlCardProps) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <Plus className="text-green-500" />
      水分補給
    </h2>

    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-gray-700">量</span>
        <div className="flex items-center gap-2">
          <button
            onClick={onDecrease}
            className="w-8 h-8 bg-gray-300 text-gray-800 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-16 text-center font-semibold text-gray-900">{drinkAmount}ml</span>
          <button
            onClick={onIncrease}
            className="w-8 h-8 bg-gray-300 text-gray-800 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <button
        onClick={onAddWater}
        className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
      >
        <Droplet className="w-5 h-5" />
        水を飲む
      </button>

      <div className="text-sm text-gray-600 text-center">次の目安時間: {nextDrinkTimeText}</div>
    </div>
  </div>
);

export default WaterControlCard;
