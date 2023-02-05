import {fileURLToPath} from 'url';
import * as dotenv from 'dotenv';
import path from 'path';

const __filename = fileURLToPath(import.meta.url), __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'dev') {
    dotenv.config({path: path.join(__dirname, '../environments', 'dev.env')});
}
