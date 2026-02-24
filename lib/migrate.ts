
import mongoose from 'mongoose';
import Annee from '@/models/Annee';
import Student from '@/models/Student';

export async function runMigrations() {
  console.log('--- Vérification des modèles pour migration ---');
  
  try {
    const result = await Student.updateMany(
      { 
        $or: [
          { matricule: { $exists: false } },
          { date_naissance: { $exists: false } },
          { lieu_naissance: { $exists: false } }
        ]
      },
      { 
        $set: { 
          matricule: "TEMP",
          date_naissance: new Date('2000-01-01'), 
          lieu_naissance: 'Inconnu' 
        } 
      }
    );
    console.log(`--- Migration terminée : ${result.modifiedCount} documents mis à jour ---`);
  } catch (err) {
    console.error('Erreur migration:', err);
  }
}