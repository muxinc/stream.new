export interface RobotsModerationOutputs {
  maxScores: { sexual: number; violence: number };
  exceedsThreshold: boolean;
}

export interface RobotsSummaryOutputs {
  title: string;
  description: string;
  tags: string[];
}

export interface RobotsQuestionAnswer {
  question: string;
  answer: string;
  confidence: number;
  reasoning: string;
}

export interface RobotsAskQuestionsOutputs {
  answers: RobotsQuestionAnswer[];
}

export interface RobotsModerationWebhookOutputs {
  thumbnail_scores: Array<{
    url: string;
    sexual: number;
    violence: number;
  }>;
  max_scores: { sexual: number; violence: number };
  exceeds_threshold: boolean;
}

export interface RobotsSummaryWebhookOutputs {
  title: string;
  description: string;
  tags: string[];
}

export interface RobotsAskQuestionsWebhookOutputs {
  answers: Array<{
    question: string;
    answer: string;
    confidence: number;
    reasoning: string;
  }>;
}
