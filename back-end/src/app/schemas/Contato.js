import mongoose from '@/database';

const ContatoSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },

  telephone: {
    type: String,
    required: true,
  },

  address: {
    type: String,
    required: true,
  },

  socialMedia: [
    {
      type: {
        type: String,
        required: true,
      },

      iconName: {
        type: String,
        required: true,
      },

      url: {
        type: String,
        required: true,
      },
    },
  ],
});

export default mongoose.model('Contato', ContatoSchema);
