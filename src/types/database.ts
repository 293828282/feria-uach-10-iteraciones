export interface Judge {
  id: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface Stand {
  id: string;
  stand_number: string;
  project_name: string;
  category: string;
  team_members: string;
  is_active: boolean;
  image_url?: string | null;
  created_at: string;
}

export interface EvaluationCriteria {
  id: string;
  order_index: number;
  question_text: string;
  description: string;
  max_score: number;
  weight: number;
  is_active: boolean;
  created_at: string;
}

export interface Evaluation {
  id: string;
  judge_id: string;
  stand_id: string;
  criteria_id: string;
  score: number;
  feedback?: string | null;
  created_at: string;
}

export interface StandEvaluationSummary {
  stand: Stand;
  evaluationsCount: number;
  judgesCount: number;
  weightedScore: number;
  rawAverage: number;
  criteriaScores: { [criteriaId: string]: number };
  feedbacks: string[];
}
