import mongoose from '@/database';

const AboutSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },

  imageUrl: {
    type: String,
    required: true,
  },
});

export default mongoose.model('Sobre', AboutSchema);
