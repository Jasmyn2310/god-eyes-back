import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { v4 as uuidv4 } from 'uuid';
import { alerts, devices, geofences, locations, plans, users } from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is missing in .env');
}

const sql = postgres(connectionString, { max: 1, ssl: 'require' });
const db = drizzle(sql);

const VENDOR_TYPES = ['Desayuno', 'Snack', 'Bebidas', 'Postres', 'Almuerzo'];
const PRICE_RANGES = ['$1 - $3', '$0.5 - $2', '$1.5 - $4', '$2 - $5', '$1 - $2'];

const MOCK_NAMES = [
  'Doña Flor',
  'El Tío',
  'María Jugos',
  'Don Pepe',
  'Rosa Empanadas',
  'Carlos Desayunos',
  'Juana Postres',
  'Luis Snacks',
  'Ana Bebidas',
  'Pedro Almuerzos',
  'Carmen Tamales',
  'Jorge Sanguches',
  'Lucía Arepas',
  'Miguel Tacos',
  'Elena Churros',
  'Andrés Ceviche',
  'Sofía Helados',
  'Diego Anticuchos',
  'Valeria Picarones',
  'Hugo Salchipapas',
];

interface SeedPlan {
  id: string;
  name: string;
  price: string;
  description: string;
  isPopular: boolean;
}

const SEED_PLANS: SeedPlan[] = [
  {
    id: 'plan-basic',
    name: 'Plan Básico',
    price: '0.00',
    description: 'Aparece en el mapa, Actualiza tu ubicación manual, Perfil básico',
    isPopular: false,
  },
  {
    id: 'plan-premium',
    name: 'Plan Premium',
    price: '4.99',
    description: 'Todo lo del plan básico, Seguimiento en tiempo real automático, Destacado en las búsquedas, Catálogo de productos con fotos',
    isPopular: true,
  },
];

async function seed(): Promise<void> {
  try {
    await db.delete(alerts);
    await db.delete(locations);
    await db.delete(geofences);
    await db.delete(devices);
    await db.delete(users);
    await db.delete(plans);

    for (const plan of SEED_PLANS) {
      await db.insert(plans).values(plan);
    }

    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    await db.insert(users).values({
      id: uuidv4(),
      email: 'admin@godeyes.com',
      passwordHash: adminPasswordHash,
      name: 'Administrador GodEyes',
      photoUrl: 'https://ui-avatars.com/api/?name=Admin+GodEyes&background=0D8ABC&color=fff&size=150',
      role: 'ADMIN',
    });

    const vendorPasswordHash = await bcrypt.hash('vendor123', 10);
    const baseLatitude = -12.0464;
    const baseLongitude = -77.0428;

    for (let index = 0; index < 20; index++) {
      const vendorId = uuidv4();
      const deviceId = uuidv4();
      const locationId = uuidv4();

      const name = MOCK_NAMES[index % MOCK_NAMES.length];
      const vendorType = VENDOR_TYPES[index % VENDOR_TYPES.length];
      const priceRange = PRICE_RANGES[index % PRICE_RANGES.length];
      const photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=150`;

      await db.insert(users).values({
        id: vendorId,
        email: `vendor${index}@godeyes.test`,
        passwordHash: vendorPasswordHash,
        name,
        photoUrl,
        vendorType,
        priceRange,
        role: 'vendor',
      });

      const calculatedBattery = (70 + ((index * 3) % 28)).toFixed(2);
      await db.insert(devices).values({
        id: deviceId,
        userId: vendorId,
        name: `Dispositivo ${name}`,
        batteryLevel: calculatedBattery,
        status: 'online',
        lastConnection: new Date(),
      });

      const latitudeOffset = (Math.random() - 0.5) * 0.02;
      const longitudeOffset = (Math.random() - 0.5) * 0.02;
      const currentLatitude = (baseLatitude + latitudeOffset).toFixed(8);
      const currentLongitude = (baseLongitude + longitudeOffset).toFixed(8);

      await db.insert(locations).values({
        id: locationId,
        deviceId,
        latitude: currentLatitude,
        longitude: currentLongitude,
        speed: index % 2 === 0 ? '1.20' : '0.00',
        accuracy: '5.00',
        timestamp: new Date(),
      });

      if (index < 5) {
        await db.insert(geofences).values({
          id: uuidv4(),
          userId: vendorId,
          name: `Zona Operativa ${name}`,
          latitude: currentLatitude,
          longitude: currentLongitude,
          radius: '500.00',
          isActive: true,
        });
      }

      if (index === 0 || index === 3) {
        await db.insert(alerts).values({
          id: uuidv4(),
          deviceId,
          type: 'battery_warning',
          message: `Dispositivo ${name} con batería al ${calculatedBattery}%`,
          isRead: false,
        });
      }
    }
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

void seed();
