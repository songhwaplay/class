import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const arithmeticRaces = sqliteTable("arithmetic_races", {
  roomCode: text("room_code").primaryKey(),
  teacherToken: text("teacher_token").notNull(),
  worksheetName: text("worksheet_name").notNull(),
  worksheetRoute: text("worksheet_route").notNull(),
  seed: integer("seed").notNull(),
  status: text("status").notNull().default("waiting"),
  createdAt: integer("created_at").notNull(),
  startedAt: integer("started_at"),
});

export const arithmeticRaceParticipants = sqliteTable("arithmetic_race_participants", {
  id: text("id").primaryKey(),
  roomCode: text("room_code").notNull().references(() => arithmeticRaces.roomCode, { onDelete: "cascade" }),
  name: text("name").notNull(),
  participantToken: text("participant_token").notNull(),
  joinedAt: integer("joined_at").notNull(),
  submittedAt: integer("submitted_at"),
  correctCount: integer("correct_count"),
  totalCount: integer("total_count"),
}, (table) => [
  uniqueIndex("arithmetic_race_room_name_unique").on(table.roomCode, table.name),
]);
