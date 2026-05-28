import mongoose from 'mongoose';

export const getDatabaseUrl = (): string => {
    const user = encodeURIComponent(process.env['MDB_DB_USER'] || 'user');
    const password = encodeURIComponent(process.env['MDB_DB_PASSWORD'] || 'password');
    const host = process.env['MDB_DB_HOST'] || 'localhost';
    const name = process.env['MDB_DB_NAME'] || 'mongo';
    const isAtlas = host.includes('mongodb.net');
    if (isAtlas) {
        const appName = process.env['MDB_APP_NAME'] || 'Cluster0';
        return `mongodb+srv://${user}:${password}@${host}/${name}?appName=${appName}&retryWrites=true&w=majority`;
    }
    const port = process.env['MDB_DB_PORT'] || '27017';
    return `mongodb://${user}:${password}@${host}:${port}/${name}?authSource=admin`;
};

export const connectDB = async () => {
    try {
        await mongoose.connect(getDatabaseUrl());
    } catch (err) {
        console.error('Mongoose initial connection error:', err);
    }
};

mongoose.connection.on('connected', () => {
    console.log(`Mongoose connected`);
});

mongoose.connection.on('error', (err: Error) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

const gracefulShutdown = (msg: string, callback: () => void): void => {
    mongoose.connection.close().then(() => {
        console.log(`Mongoose disconnected through ${msg}`);
        callback();
    });
};

process.once('SIGUSR2', () => {
    gracefulShutdown('nodemon restart', () => {
        process.kill(process.pid, 'SIGUSR2');
    });
});

process.on('SIGINT', () => {
    gracefulShutdown('app termination', () => {
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    gracefulShutdown('app termination', () => {
        process.exit(0);
    });
});
