export interface DrinkRecord {
  id: string;
  amount: number;
  time: string;
  timestamp: Date;
}

export interface WeeklyData {
  date: string;
  intake: number;
  goal: number;
}
