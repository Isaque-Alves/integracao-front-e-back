import mongoose from '@/database';
import mongoosePaginate from 'mongoose-paginate-v2';
import Slugify from '@/utils/Slugify';
import calcReadTime from '@/utils/ReadTime';

const ArticleSchema = new mongoose.Schema({
  slug: {
    type: String,
    unique: true,
  },

  title: {
    type: String,
    required: true,
  },

  author: {
    type: String,
    required: true,
  },

  text: {
    type: String,
    required: true,
  },

  date: {
    type: Date,
    default: Date.now,
  },

  spotlight: {
    type: Boolean,
    default: false
  },

  readTime: {
    type: String,
  },
});

ArticleSchema.pre('save', function (next) {
  const title = this.title;
  this.slug = Slugify(title);

  const text = this.text;
  this.readTime = calcReadTime(text);
  next();
});

ArticleSchema.plugin(mongoosePaginate);

export default mongoose.model('Artigo', ArticleSchema);
