import { Download } from 'lucide-react';

interface PwaStatusCardProps {
  isInstallable: boolean;
}

const PwaStatusCard = ({ isInstallable }: PwaStatusCardProps) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <Download className="text-indigo-500" />
      Chrome PWA機能
    </h2>
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">アプリ状態</span>
        <span
          className={`px-2 py-1 rounded text-xs ${isInstallable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
        >
          {isInstallable ? '利用可能' : '設定済み'}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">オフライン対応</span>
        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">対応済み</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">バックグラウンド通知</span>
        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">対応済み</span>
      </div>
      <p className="text-xs text-gray-600 mt-2">
        Chrome メニュー から「アプリをインストール」でデスクトップアプリのようにご利用いただけます。
      </p>
    </div>
  </div>
);

export default PwaStatusCard;
