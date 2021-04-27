import fs from 'fs';
import path from 'path';

function existe(diretorio) {
  return fs.existsSync(path.resolve(diretorio));
}

export default () => {
  if (!existe('../uploads')) {
    fs.mkdirSync('../uploads');
    fs.mkdirSync('../uploads/images');
  } else if (!existe('../uploads/images')) {
    fs.mkdirSync('../uploads/images');
  }
};
