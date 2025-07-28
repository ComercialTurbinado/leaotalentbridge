import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion {
  id: number;
  text: string;
  tips?: string[];
}

export interface ISimulation extends Document {
  title: string;
  description: string;
  questions: IQuestion[];
  estimatedTime: number;
  category: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema({
  id: {
    type: Number,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  tips: [{
    type: String
  }]
});

const SimulationSchema = new Schema<ISimulation>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  questions: [QuestionSchema],
  estimatedTime: {
    type: Number,
    required: true,
    min: 1
  },
  category: {
    type: String,
    required: true,
    enum: ['behavioral', 'technical', 'situational', 'general']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['basic', 'intermediate', 'advanced'],
    default: 'basic'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para performance
SimulationSchema.index({ category: 1, difficulty: 1 });
SimulationSchema.index({ isActive: 1 });
SimulationSchema.index({ createdAt: -1 });

export default mongoose.models.Simulation || mongoose.model<ISimulation>('Simulation', SimulationSchema); 