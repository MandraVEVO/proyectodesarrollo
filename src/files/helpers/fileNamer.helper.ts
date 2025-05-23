import { v4 as uuid} from 'uuid'; // importamos la libreria para generar un id unico
export const fileNamer = (req: Express.Request, file: Express.Multer.File, callback: Function) => {
    
    // console.log({file});
    if(!file) return callback(new Error('No file provided'), false); /// si el archivo no existe regresa un error que el archivo no se proporciono ademas de que no se esta subiendo el mismo
    //esta no deberia de estar ya que se supone que ya hay una validacion de archivo
const fileExtension = file.mimetype.split('/')[1]; // obtiene el tipo de archivo

const fileName = `${uuid()}.${fileExtension}`; // genera el nombre del archivo
  
    callback(null, fileName); // regresa el nombre del archivo
}