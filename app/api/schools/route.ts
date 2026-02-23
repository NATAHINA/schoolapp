import dbConnect from '@/lib/dbConnect';
import School from '@/models/School';
import { NextResponse } from 'next/server';

export async function GET(){
	await dbConnect();

	try{
		const newSchool = await School.create({
			name: "École Excellence",
			phone: "0341693668",
			address: "123 Rue de l'Éducation",
			email: "contact@excelence.edu",
		});

		return NextResponse.json({
			message: "Base de données et École créées !",
			data: newSchool
		})
	}catch(error){
		return NextResponse.json({error: "Erreur lors de la création"}, { status: 500 });
	}
}


