import mongoose, { Document, Schema } from 'mongoose';

export interface IAnswer {
  questionId: number;
  text: string;
  timestamp: Date;
}

export interface ISimulationAnswer extends Document {
  userId: mongoose.Types.ObjectId;
  simulationId: mongoose.Types.ObjectId;
  answers: IAnswer[];
  completedAt?: Date;
  score?: number;
  feedback?: string;
  status: 'in_progress' | 'completed' | 'reviewed';
  createdAt: Date;
  updatedAt: Date;
}

const AnswerSchema = new Schema({
  questionId: {
    type: Number,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const SimulationAnswerSchema = new Schema<ISimulationAnswer>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  simulationId: {
    type: Schema.Types.ObjectId,
    ref: 'Simulation',
    required: true
  },
  answers: [AnswerSchema],
  completedAt: {
    type: Date
  },
  score: {
    type: Number,
    min: 0,
    max: 10
  },
  feedback: {
    type: String
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'reviewed'],
    default: 'in_progress'
  }
}, {
  timestamps: true
});

// Índices para performance
SimulationAnswerSchema.index({ userId: 1, simulationId: 1 });
SimulationAnswerSchema.index({ userId: 1, status: 1 });
SimulationAnswerSchema.index({ completedAt: -1 });

export default mongoose.models.SimulationAnswer || mongoose.model<ISimulationAnswer>('SimulationAnswer', SimulationAnswerSchema); 