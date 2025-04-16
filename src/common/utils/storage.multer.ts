import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer'
import { extname } from 'path';

export const storage = diskStorage({
  destination: (req: any, file, cb) => {
    const uploadPath = `uploads`;
    
    // Cria o diretório se não existir
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});