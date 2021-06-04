import vision from '@google-cloud/vision';

export const isEnabled = ():boolean => !!(process.env.GOOGLE_APPLICATION_CREDENTIALS?.length);

let credentials;

if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  credentials = JSON.parse(
    Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'base64').toString()
  );
}

const client = new vision.ImageAnnotatorClient({
  credentials,
});

export default client;
