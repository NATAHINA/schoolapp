import mongoose from 'mongoose';
import { runMigrations } from './migrate';

import '@/models/Annee';
import '@/models/Student';
import '@/models/Class';
import '@/models/School';
import '@/models/User';
import '@/models/Parent';
import '@/models/Payment';

const MONGODB_URI = process.env.MONGODB_URI;

if(!MONGODB_URI){
	throw new Error(
		'Veuillez définir la variable MONGODB_URI dans votre fichier .env.local'
	);
}

let cached = (global as any).mongoose;

if(!cached){
	cached = (global as any).mongoose = {conn: null, promise: null};
}

async function dbConnect(){
	if(cached.conn){
		return cached.conn;
	}

	if(!cached.promise){
		const opts = {
			bufferCommands: false,
		};
		cached.promise = mongoose.connect(MONGODB_URI!, opts).then(async(m) => {
			console.log('Connexion à MongoDB établie');
			if (process.env.NODE_ENV === 'development') {
		        try {
		          await runMigrations();
		        } catch (error) {
		          console.error('Erreur lors des migrations:', error);
		        }
		      }

		      return m;
		});
	}

	try{
		cached.conn = await cached.promise;
	}catch(e){
		cached.promise = null;
		throw e;
	}

	return cached.conn;
}

export default dbConnect;