import mongoose from '@/database';

const MembroSchema = new mongoose.Schema({
  nome: {
    type: String,
    trim: true,
    required: true,
  },
  descricao: {
    type: String,
    trim: true,
  },
  urlImagem: {
    type: String,
    trim: true,
  },
  urlOAB: {
    type: String,
    trim: true,
  },
});

export default mongoose.model('Membros', MembroSchema);
