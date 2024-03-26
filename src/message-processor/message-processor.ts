export interface MessageProcessor {
  process(message: string): Transaction;
}

export type Transaction = {
  id: string;
  amount: number;
  date: string;
  contact: string;
};
