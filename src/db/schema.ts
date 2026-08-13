import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const entries = pgTable('entries', {
  id: serial('id').primaryKey(),
  tanggal: text('tanggal').notNull(), // Format 'YYYY-MM-DD'
  sesi: text('sesi').$type<'pagi' | 'siang' | 'sore' | 'malam'>().notNull().default('pagi'),
  no_hp: text('no_hp').notNull(),
  jumlah_bea_otp: integer('jumlah_bea_otp').notNull().default(0),
  jumlah_bea_regis: integer('jumlah_bea_regis').notNull().default(0),
  jumlah_omset: integer('jumlah_omset').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;
