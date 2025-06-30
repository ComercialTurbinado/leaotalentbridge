import mongoose from 'mongoose';

declare global {
  var mongoose: any;
}

const MONGODB_URI = process.env.MONGODB_URI;

// Verificação condicional para permitir desenvolvimento sem MongoDB
async function connectMongoDB() {
  if (!MONGODB_URI) {
    console.warn('MONGODB_URI não definido. Funcionando sem banco de dados.');
    return null;
  }

  let cached = global.mongoose;

  if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('Conectado ao MongoDB');
        return mongoose;
      })
      .catch((err) => {
        console.error('Erro ao conectar ao MongoDB:', err);
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('Erro na conexão com MongoDB:', e);
    return null;
  }

  return cached.conn;
}

export default connectMongoDB; 