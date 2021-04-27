import mongoose from '@/database';
import { Schema } from 'mongoose';

const StatusSchema = new mongoose.Schema({
  process: {
    type: Schema.Types.ObjectId,
    ref: 'Processo',
    required: true,
  },

  date: {
    type: Date,
    default: Date.now,
  },

  text: {
    type: String,
    required: true,
  }
});

export default mongoose.model('Status', StatusSchema);