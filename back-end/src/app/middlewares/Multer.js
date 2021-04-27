import multer from 'multer';
import Slugify from '@/utils/Slugify';
import filesConfig from '@/config/files';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${filesConfig.uploadsPath}/images/`);
  },
  filename: (req, file, cb) => {
    const split = file.originalname.split('.');
    const filename = split[0];
    const extension = split[split.length - 1];
    cb(null, `${Slugify(filename)}-${new Date().getTime()}.${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (/image.*$/.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Arquivo enviado não é uma imagem!'), false);
  }
};

export default multer({
  storage,
  fileFilter,
});
