import mongoose from '@/database';

const AreasAtuacaoSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
  },
  descricao: {
    type: String,
    required: true,
  },
});

export default mongoose.model('AreasAtuacao', AreasAtuacaoSchema);
