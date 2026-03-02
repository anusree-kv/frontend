export interface User {
  id?: number; 

  name: string;
  email: string;
  phone: string;
  summary?: string;

  experiences?: {
    title: string;
    company: string;
    start: string;
    end?: string;
  }[];

  education?: {
    degree: string;
    institution: string;
    year: string;
  }[];

  skills?: string;
}