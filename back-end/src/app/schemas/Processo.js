import mongoose from '@/database';
import { Schema } from 'mongoose';

const ProcessSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'Usuarios',
    required: true,
  },

  number: {
    type: String,
    required: true,
    unique: true,
  },

  name: {
    type: String,
    required: true,
  },

  processingLocation: {
    type: String,
    required: true,
  },
});

export default mongoose.model('Processo', ProcessSchema);
