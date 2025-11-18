import { Bell, Clock } from 'lucide-react';

interface ChromeNotificationCardProps {
  notificationPermission: NotificationPermission;
  isAlarmEnabled: boolean;
  alarmInterval: number;
  onToggleAlarm: () => void;
  onChangeInterval: (value: number) => void;
  nextAlarmTime: Date | null;
}

const ChromeNotificationCard = ({
  notificationPermission,
  isAlarmEnabled,
  alarmInterval,
  onToggleAlarm,
  onChangeInterval,
  nextAlarmTime
}: ChromeNotificationCardProps) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <Bell className="text-amber-500" />
      Chrome通知アラーム
    </h2>

    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-gray-700">デスクトップ通知</span>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded text-xs ${notificationPermission === 'granted'
                ? 'bg-green-100 text-green-800'
                : notificationPermission === 'denied'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
          >
            {notificationPermission === 'granted'
              ? '許可済み'
              : notificationPermission === 'denied'
                ? '拒否済み'
                : '未設定'}
          </span>
          <button
            onClick={onToggleAlarm}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${isAlarmEnabled && notificationPermission === 'granted'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700'
              }`}
            disabled={notificationPermission !== 'granted'}
          >
            {isAlarmEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-gray-700">通知間隔</span>
        <select
          value={alarmInterval}
          onChange={(e) => onChangeInterval(Number(e.target.value))}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={15}>15分</option>
          <option value={30}>30分</option>
          <option value={60}>1時間</option>
          <option value={90}>1時間30分</option>
          <option value={120}>2時間</option>
        </select>
      </div>

      {nextAlarmTime && isAlarmEnabled && (
        <div className="text-sm text-gray-600 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          次の通知: {nextAlarmTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
        <p>🔔 Chrome通知の強化ポイント</p>
        <p>・デスクトップ通知でリマインド</p>
        <p>・通知からワンクリックで記録</p>
        <p>・バックグラウンドでも稼働</p>
        <p>・PWAインストールでさらに便利</p>
      </div>
    </div>
  </div>
);

export default ChromeNotificationCard;
