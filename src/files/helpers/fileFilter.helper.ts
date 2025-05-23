import { BadRequestException } from '@nestjs/common';
export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {
    
    // console.log({file});
    if(!file) return callback(new Error('No file provided'), false); /// si el archivo no existe regresa un error que el archivo no se proporciono ademas de que no se esta subiendo el mismo

    const fileExptension = file.mimetype.split('/')[1]; // obtiene el tipo de archivo
    const validExtensions = ['png', 'jpg', 'jpeg', 'gif']; // tipos de archivos validos

    if (!validExtensions.includes(fileExptension)) {
        return callback(new BadRequestException(`File type not supported. Valid extensions: ${validExtensions.join(', ')}`), false); // rechaza el archivo con error
    }
    callback(null, true);
}