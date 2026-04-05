import mongoose from 'mongoose';
import * as mockData from './data/mockData.js';

// Define loose schemas for all entities from mockData
const UserSchema = new mongoose.Schema({}, { strict: false });
export const User = mongoose.model('User', UserSchema);

const AlertSchema = new mongoose.Schema({}, { strict: false });
export const Alert = mongoose.model('Alert', AlertSchema);

const SensorSchema = new mongoose.Schema({}, { strict: false });
export const Sensor = mongoose.model('Sensor', SensorSchema);

const ResourceSchema = new mongoose.Schema({}, { strict: false });
export const Resource = mongoose.model('Resource', ResourceSchema);

const TeamSchema = new mongoose.Schema({}, { strict: false });
export const Team = mongoose.model('Team', TeamSchema);

const EquipmentSchema = new mongoose.Schema({}, { strict: false });
export const Equipment = mongoose.model('Equipment', EquipmentSchema);

const MessageSchema = new mongoose.Schema({}, { strict: false });
export const Message = mongoose.model('Message', MessageSchema);

const TrainingModuleSchema = new mongoose.Schema({}, { strict: false });
export const TrainingModule = mongoose.model('TrainingModule', TrainingModuleSchema);

export const seedDatabase = async () => {
    try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            console.log('Seeding initial mock data to MongoDB...');

            // Do NOT insert mock alerts anymore, we only want real Ambee alerts
            await User.insertMany(mockData.users);
            await Sensor.insertMany(mockData.sensorData);
            await Resource.insertMany(mockData.resources);
            await Team.insertMany(mockData.rescueTeams);
            await Equipment.insertMany(mockData.equipment);
            await Message.insertMany(mockData.messages);
            await TrainingModule.insertMany(mockData.trainingModules);

            console.log('Database seeded successfully!');
        } else {
            console.log('Database already has data. Skipping seed.');
        }
    } catch (error) {
        console.error('Error seeding database:', error);
    }
};
