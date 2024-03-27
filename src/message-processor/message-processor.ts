export interface MessageProcessor {
  process(message: string): Transaction;
  getExampleMessage(): string;
}

export type Transaction = {
  id: string;
  amount: number;
  date: string;
  contact: string;
};
