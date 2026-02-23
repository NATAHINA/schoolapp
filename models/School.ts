import mongoose, { Schema, model, models } from 'mongoose';

const SchoolSchema = new Schema({
	name: {type: String, required: true},
	address: {type: String},
	phone: {type: String, required: true, unique: true},
	email: {type: String, unique: true},
	logo: { type: String },
	nif: { type: String },
	stat: { type: String },
	rcs: { type: String },
	city: { type: String },
	website: { type: String },
	subscriptionStatus: {
		type: String,
		enum: ['active', 'inactive', 'trial'],
		default: 'trial'
	},
	smsBalance: {type: Number, default: 100},
	createdAt: {type: Date, default: Date.now},
});

const School = models.School || model('School', SchoolSchema);

export default School;