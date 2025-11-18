'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import HeaderSection from './components/HeaderSection';
import DailyIntakeCard from './components/DailyIntakeCard';
import ChromeNotificationCard from './components/ChromeNotificationCard';
import WaterControlCard from './components/WaterControlCard';
import DrinkRecordsCard from './components/DrinkRecordsCard';
import WeeklyChartCard from './components/WeeklyChartCard';
import SettingsCard from './components/SettingsCard';
import PwaStatusCard from './components/PwaStatusCard';
import { DrinkRecord, WeeklyData } from './types';
import { supabase } from '../lib/supabaseClient';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

const PROFILE_ID = 'default_profile';

const formatRecordTime = (date: Date) =>
  date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return {
    start: start.toISOString(),
    end: end.toISOString()
  };
};

const WaterIntakeContent = ({ supabaseClient }: { supabaseClient: SupabaseClient }) => {
  //一日の目標摂取量　初期値は1000ml
  const [dailyGoal, setDailyGoal] = useState(1000);
  const [currentIntake, setCurrentIntake] = useState(0);
  //水分補給カードの量の初期値　初期値は20ml
  const [drinkAmount, setDrinkAmount] = useState(20);
  const [drinkRecords, setDrinkRecords] = useState<DrinkRecord[]>([]);
  const [alarmInterval, setAlarmInterval] = useState(60);
  const [isAlarmEnabled, setIsAlarmEnabled] = useState(false);
  const [nextAlarmTime, setNextAlarmTime] = useState<Date | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date().toDateString());
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const addWater = useCallback(async () => {
    const now = new Date();
    const { data, error } = await supabaseClient
      .from('drink_records')
      .insert({
        profile_id: PROFILE_ID,
        amount: drinkAmount,
        timestamp: now.toISOString()
      })
      .select('id, amount, timestamp')
      .single();

    if (error) {
      console.error('飲水記録の保存に失敗しました:', error.message);
      return;
    }

    const timestamp = new Date(data.timestamp as string);
    const newRecord: DrinkRecord = {
      id: String(data.id),
      amount: data.amount as number,
      time: formatRecordTime(timestamp),
      timestamp
    };

    setDrinkRecords(prev => [...prev, newRecord]);
    setCurrentIntake(prev => prev + newRecord.amount);
  }, [drinkAmount, supabaseClient]);

  const removeRecord = useCallback(
    async (id: string) => {
      const record = drinkRecords.find(r => r.id === id);
      if (!record) return;

      const { error } = await supabaseClient
        .from('drink_records')
        .delete()
        .eq('id', id)
        .eq('profile_id', PROFILE_ID);

      if (error) {
        console.error('飲水記録の削除に失敗しました:', error.message);
        return;
      }

      setDrinkRecords(prev => prev.filter(r => r.id !== id));
      setCurrentIntake(prev => prev - record.amount);
    },
    [drinkRecords, supabaseClient]
  );

  const getProgress = () => (currentIntake / dailyGoal) * 100;

  const getRemainingAmount = () => Math.max(0, dailyGoal - currentIntake);

  const getNextDrinkTime = () => {
    if (drinkRecords.length === 0) return '今すぐ';

    const lastDrink = drinkRecords[drinkRecords.length - 1];
    const nextTime = new Date(lastDrink.timestamp.getTime() + alarmInterval * 60000);
    const now = new Date();

    if (nextTime <= now) return '今すぐ';

    return nextTime.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleAlarm = () => {
    if (isAlarmEnabled) {
      setIsAlarmEnabled(false);
      setNextAlarmTime(null);
    } else {
      setIsAlarmEnabled(true);
    }
  };

  /* 水分補給カードの量の増減値を設定 */
  // 量の減値設定「20ml」ずつ減で設定
  const handleDecreaseDrinkAmount = () => {
    setDrinkAmount(prev => Math.max(20, prev - 20));
  };
  // 量の増値設定「20ml」ずつ増で設定
  const handleIncreaseDrinkAmount = () => {
    setDrinkAmount(prev => prev + 20);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchSettings = async () => {
      const { data, error } = await supabaseClient
        .from('user_settings')
        .select('daily_goal, alarm_interval, is_alarm_enabled')
        .eq('profile_id', PROFILE_ID)
        .maybeSingle();

      if (!isMounted) return;

      if (error && error.code !== 'PGRST116') {
        console.error('設定情報の取得に失敗しました:', error.message);
        setSettingsLoaded(true);
        return;
      }

      if (data) {
        if (typeof data.daily_goal === 'number') setDailyGoal(data.daily_goal);
        if (typeof data.alarm_interval === 'number') setAlarmInterval(data.alarm_interval);
        if (typeof data.is_alarm_enabled === 'boolean') setIsAlarmEnabled(data.is_alarm_enabled);
      }

      setSettingsLoaded(true);
    };

    fetchSettings();

    return () => {
      isMounted = false;
    };
  }, [supabaseClient]);

  useEffect(() => {
    let isMounted = true;

    const fetchDrinkRecords = async () => {
      const { start, end } = getTodayRange();
      const { data, error } = await supabaseClient
        .from('drink_records')
        .select('id, amount, timestamp')
        .eq('profile_id', PROFILE_ID)
        .gte('timestamp', start)
        .lte('timestamp', end)
        .order('timestamp', { ascending: true });

      if (!isMounted) return;

      if (error) {
        console.error('飲水記録の取得に失敗しました:', error.message);
        return;
      }

      const parsed: DrinkRecord[] =
        data?.map((record: { id: string | number; amount: number; timestamp: string }) => {
          const timestamp = new Date(record.timestamp);
          return {
            id: String(record.id),
            amount: record.amount,
            timestamp,
            time: formatRecordTime(timestamp)
          };
        }) ?? [];

      setDrinkRecords(parsed);
      setCurrentIntake(parsed.reduce((sum, record) => sum + record.amount, 0));
    };

    fetchDrinkRecords();

    return () => {
      isMounted = false;
    };
  }, [currentDate, supabaseClient]);

  useEffect(() => {
    const initWeeklyData = () => {
      const data: WeeklyData[] = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        data.push({
          date: date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }),
          intake: Math.floor(Math.random() * 1000) + 1500,
          goal: dailyGoal
        });
      }
      data[6].intake = currentIntake;
      setWeeklyData(data);
    };
    initWeeklyData();
  }, [dailyGoal, currentIntake]);

  useEffect(() => {
    if (!settingsLoaded) return;

    const persistSettings = async () => {
      const { error } = await supabaseClient.from('user_settings').upsert({
        profile_id: PROFILE_ID,
        daily_goal: dailyGoal,
        alarm_interval: alarmInterval,
        is_alarm_enabled: isAlarmEnabled
      });

      if (error) {
        console.error('設定の保存に失敗しました:', error.message);
      }
    };

    persistSettings();
  }, [dailyGoal, alarmInterval, isAlarmEnabled, settingsLoaded, supabaseClient]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    const initializeNotifications = async () => {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
      }

      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered:', registration);
        } catch (error) {
          console.log('Service Worker registration failed:', error);
        }
      }
    };

    initializeNotifications();
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    }
  };

  const sendNotification = useCallback(async () => {
    if ('Notification' in window && notificationPermission === 'granted') {
      const remaining = Math.max(0, dailyGoal - currentIntake);
      const notificationOptions = {
        body: `?? ${drinkAmount}ml の水を飲んで健康を保ちましょう！\n目標まで残り ${remaining}ml です`,
        icon: '/favicon-192x192.png',
        badge: '/favicon-96x96.png',
        tag: 'water-reminder',
        requireInteraction: true,
        silent: false,
        vibrate: [200, 100, 200, 100, 200],
        data: {
          timestamp: Date.now(),
          amount: drinkAmount,
          url: window.location.href
        }
      };

      try {
        const notification = new Notification('?? 水分補給の時間です！', notificationOptions);

        notification.onclick = async (event) => {
          event.preventDefault();
          window.focus();
          await addWater();
          notification.close();
        };

        setTimeout(() => {
          notification.close();
        }, 10000);

        return notification;
      } catch (error) {
        console.error('通知送信エラー:', error);
        return null;
      }
    } else {
      const result = confirm(`?? 水分補給の時間です！\n\n${drinkAmount}ml の水を飲みますか？`);
      if (result) {
        await addWater();
      }
      return null;
    }
  }, [drinkAmount, notificationPermission, addWater, dailyGoal, currentIntake]);

  useEffect(() => {
    if (!isAlarmEnabled) {
      return;
    }

    let timeoutId: NodeJS.Timeout | undefined;

    const scheduleNotification = () => {
      const nextTime = new Date(Date.now() + alarmInterval * 60000);
      setNextAlarmTime(nextTime);
      timeoutId = setTimeout(() => {
        sendNotification();
        scheduleNotification();
      }, alarmInterval * 60000);
    };

    scheduleNotification();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isAlarmEnabled, alarmInterval, sendNotification]);

  useEffect(() => {
    const checkDateChange = () => {
      const today = new Date().toDateString();
      if (today !== currentDate) {
        setCurrentDate(today);
        setCurrentIntake(0);
        setDrinkRecords([]);
      }
    };

    const interval = setInterval(checkDateChange, 60000);
    return () => clearInterval(interval);
  }, [currentDate]);

  const progress = getProgress();
  const remainingAmount = getRemainingAmount();
  const nextDrinkTimeText = getNextDrinkTime();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-cyan-50 min-h-screen">
      <HeaderSection
        isInstallable={isInstallable}
        onInstallApp={handleInstallApp}
        notificationPermission={notificationPermission}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 今日の摂取量 */}
        <DailyIntakeCard
          currentIntake={currentIntake}
          dailyGoal={dailyGoal}
          progress={progress}
          remainingAmount={remainingAmount}
        />
        {/* 水分補給 */}
        <WaterControlCard
          drinkAmount={drinkAmount}
          onDecrease={handleDecreaseDrinkAmount}
          onIncrease={handleIncreaseDrinkAmount}
          onAddWater={addWater}
          nextDrinkTimeText={nextDrinkTimeText}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 今日の記録 */}
        <DrinkRecordsCard drinkRecords={drinkRecords} onRemove={removeRecord} />
        {/* 基本設定 */}
        <SettingsCard
          dailyGoal={dailyGoal}
          onChangeDailyGoal={(value) => setDailyGoal(value)}
        />
      </div>

      {/* 週間推移 */}
      <WeeklyChartCard weeklyData={weeklyData} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* 通知アラーム */}
        <ChromeNotificationCard
          notificationPermission={notificationPermission}
          isAlarmEnabled={isAlarmEnabled}
          alarmInterval={alarmInterval}
          onToggleAlarm={toggleAlarm}
          onChangeInterval={(value) => setAlarmInterval(value)}
          nextAlarmTime={nextAlarmTime}
        />
        {/* PWA機能 */}
        <PwaStatusCard isInstallable={isInstallable} />
      </div>
    </div>
  );
};

const WaterIntakeApp = () => {
  if (!supabase) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center space-y-4">
        <h1 className="text-2xl font-bold text-red-600">Supabase の設定が見つかりません</h1>
        <p className="text-gray-700">環境変数 NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してから再度実行してください。</p>
      </div>
    );
  }

  return <WaterIntakeContent supabaseClient={supabase} />;
};

export default WaterIntakeApp;
