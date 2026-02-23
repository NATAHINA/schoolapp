
import mongoose from 'mongoose';

export async function runMigrations() {
  const Student = mongoose.models.Student || (await import('@/models/Student')).default;

  console.log('--- Migration en cours ---');
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
    console.log(`--- Migration Student terminée : ${result.modifiedCount} documents mis à jour ---`);
  } catch (err) {
    console.error('Erreur migration:', err);
  }
}