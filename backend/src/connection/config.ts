/** Server configuration. Keep credentials in environment variables. */

export const mongooseUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/ticket-tracker';
export const mongoDatabaseName = process.env.MONGO_DB || 'ticket-tracker';
