import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, devices, locations } from './schema';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is missing in .env');
}

const sql = postgres(connectionString, { max: 1, ssl: 'require' });
const db = drizzle(sql);

const VENDOR_TYPES = ['Desayuno', 'Snack', 'Bebidas', 'Postres', 'Almuerzo'];
const PRICE_RANGES = ['$1 - $3', '$0.5 - $2', '$1.5 - $4', '$2 - $5', '$1 - $2'];

const MOCK_NAMES = [
  'Doña Flor', 'El Tío', 'María Jugos', 'Don Pepe', 'Rosa Empanadas',
  'Carlos Desayunos', 'Juana Postres', 'Luis Snacks', 'Ana Bebidas', 'Pedro Almuerzos',
  'Carmen Tamales', 'Jorge Sanguches', 'Lucía Arepas', 'Miguel Tacos', 'Elena Churros',
  'Andrés Ceviche', 'Sofía Helados', 'Diego Anticuchos', 'Valeria Picarones', 'Hugo Salchipapas'
];

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    const passwordHash = await bcrypt.hash('vendor123', 10);
    const vendors: any[] = [];

    // Base coordinates (Lima, Peru center as an example)
    const baseLat = -12.0464;
    const baseLng = -77.0428;

    for (let i = 0; i < 20; i++) {
      const vendorId = uuidv4();
      const deviceId = uuidv4();
      const locationId = uuidv4();

      const name = MOCK_NAMES[i % MOCK_NAMES.length];
      const type = VENDOR_TYPES[i % VENDOR_TYPES.length];
      const priceRange = PRICE_RANGES[i % PRICE_RANGES.length];
      // Generates a mock photo using an avatar service
      const photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=150`;

      // Insert User
      await db.insert(users).values({
        id: vendorId,
        email: `vendor${i}@godeyes.test`,
        passwordHash,
        name,
        photoUrl,
        vendorType: type,
        priceRange,
        role: 'vendor',
      });

      // Insert Device
      await db.insert(devices).values({
        id: deviceId,
        userId: vendorId,
        name: `Device Vendor ${i}`,
        status: 'online',
      });

      // Offset location slightly for each vendor so they don't overlap
      // Approx 1km radius dispersion
      const latOffset = (Math.random() - 0.5) * 0.02;
      const lngOffset = (Math.random() - 0.5) * 0.02;

      // Insert Location
      await db.insert(locations).values({
        id: locationId,
        deviceId: deviceId,
        latitude: (baseLat + latOffset).toString() as any,
        longitude: (baseLng + lngOffset).toString() as any,
      });

      vendors.push({ vendorId, name });
    }

    console.log(`✅ Seeded ${vendors.length} vendors with devices and locations.`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await sql.end();
  }
}

seed();
