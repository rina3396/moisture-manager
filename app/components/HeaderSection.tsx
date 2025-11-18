import { Download, Droplet } from 'lucide-react';

interface HeaderSectionProps {
  isInstallable: boolean;
  onInstallApp: () => void;
  notificationPermission: NotificationPermission;
}

const HeaderSection = ({
  isInstallable,
  onInstallApp,
  notificationPermission
}: HeaderSectionProps) => (
  <div className="text-center mb-8">
    <div className="flex items-center justify-center gap-4 mb-4">
      <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-2">
        <Droplet className="text-blue-500" />
        水分摂取量管理アプリ
      </h1>
      {isInstallable && (
        <button
          onClick={onInstallApp}
          className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          アプリをインストール
        </button>
      )}
    </div>
    <p className="text-gray-600">Chrome対応の健康的な水分補給をサポートします。</p>
    {notificationPermission !== 'granted' && (
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 text-sm">📱 通知を有効にすると、より便利にご利用いただけます。</p>
      </div>
    )}
  </div>
);

export default HeaderSection;
