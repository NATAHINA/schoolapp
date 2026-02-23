

import Parent from '@/models/Parent';

async function linkStudentToParent(studentId: string, parentPhone: string) {
  // On cherche le parent par son téléphone (car c'est le lien commun)
  const parent = await Parent.findOneAndUpdate(
    { phone: parentPhone }, 
    { $addToSet: { children: studentId } },
    { new: true }
  );
  return parent;
}