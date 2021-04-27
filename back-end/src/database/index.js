import mongoose from 'mongoose';

const db =
  process.env.NODE_ENV == 'development'
    ? 'mongodb://MongoDB/daniel-e-thais?authSource=admin'
    : 'mongodb://localhost/daniel-e-thais';
const opcoes =
  process.env.NODE_ENV == 'development'
    ? {
        user: 'juno',
        pass: 'Juno.CPJR.dppq2020',
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
      }
    : {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
      };
mongoose.connect(db, opcoes);

mongoose.Promise = global.Promise;

export default mongoose;
