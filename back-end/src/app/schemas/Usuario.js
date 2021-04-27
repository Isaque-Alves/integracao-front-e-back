import mongoose from '@/database';

const UsuarioSchema = new mongoose.Schema({
  nome: {
    type: String,
    trim: true,
    required: true,
  },

  email: {
    type: String,
    lowercase: true,
    trim: true,
    required: true,
    unique: true,
  },

  documento: {
    type: String,
    required: true,
    trim: true,
  },

  senha: {
    type: String,
    required: true,
    select: false,
  },

  nivel: {
    type: String,
    default: 'usuario',
  },

  tokenRecuperacao: {
    type: String,
    select: false,
  },

  expiracaoTokenRecuperacao: {
    type: Date,
    select: false,
  },
});

export default mongoose.model('Usuarios', UsuarioSchema);
