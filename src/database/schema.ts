import { pgTable, text, timestamp, boolean, decimal } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  photoUrl: text('photo_url'),
  vendorType: text('vendor_type'),
  priceRange: text('price_range'),
  role: text('role').default('vendor').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const plans = pgTable('plans', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  description: text('description').notNull(),
  isPopular: boolean('is_popular').default(false).notNull(),
});

export const devices = pgTable('devices', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  batteryLevel: decimal('battery_level', { precision: 5, scale: 2 }),
  status: text('status').default('offline').notNull(),
  lastConnection: timestamp('last_connection'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const locations = pgTable('locations', {
  id: text('id').primaryKey(),
  deviceId: text('device_id').references(() => devices.id).notNull(),
  latitude: decimal('latitude', { precision: 10, scale: 8 }).notNull(),
  longitude: decimal('longitude', { precision: 11, scale: 8 }).notNull(),
  speed: decimal('speed', { precision: 5, scale: 2 }),
  accuracy: decimal('accuracy', { precision: 10, scale: 2 }),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const geofences = pgTable('geofences', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  latitude: decimal('latitude', { precision: 10, scale: 8 }).notNull(),
  longitude: decimal('longitude', { precision: 11, scale: 8 }).notNull(),
  radius: decimal('radius', { precision: 10, scale: 2 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const alerts = pgTable('alerts', {
  id: text('id').primaryKey(),
  deviceId: text('device_id').references(() => devices.id).notNull(),
  type: text('type').notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
