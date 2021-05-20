process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS || 'three-monkeys-hackweek-844be021a66d.json';
import vision from '@google-cloud/vision';

const client = new vision.ImageAnnotatorClient();
export default client;
