import { BadRequestException } from '@nestjs/common';

// Из 'multer' больше ничего импортировать не нужно
export const pdfFileFilter = (req: any, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
    const isPdfMime = file.mimetype === 'application/pdf';
    const isPdfExt = /\.pdf$/i.test(file.originalname);

    if (!isPdfMime || !isPdfExt) {
        return callback(new BadRequestException('Разрешена загрузка только PDF файлов'), false);
    }
    callback(null, true);
};
