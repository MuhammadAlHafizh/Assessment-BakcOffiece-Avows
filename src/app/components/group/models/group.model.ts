export interface Group {
  uuid: string;
  name: string;
  status: 'Active' | 'Inactive';
  history?: {
    date: string;
    time: string;
    name: string;
    action: string;
  }[];
}
