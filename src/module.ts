import * as dotenv from 'dotenv';
dotenv.config()

import { Application } from 'express';
import cors from 'cors';
import { json, urlencoded } from 'body-parser';
import cookieSession from 'cookie-session';
import mongoose from 'mongoose';
import { errorHandler } from '@shopping-app/cammon';
import { authRouters } from './auth/auth.routers';

export class AppModule {
    constructor(public app: Application) {
        app.set('trust-proxy', true)

        app.use(cors({
            credentials: true,
            optionsSuccessStatus: 200
        }))

        app.use(urlencoded({ extended: false }))
        app.use(json())
        app.use(cookieSession({
            signed: false,
            secure: false
        }))

        app.use(authRouters)
        app.use(errorHandler)

        Object.setPrototypeOf(this, AppModule.prototype)
    }

    async start() { 
        if(!process.env.MONGO_URI) {
            throw new Error('mongo_uri must be defined')
        }
    
        if(!process.env.JWT_KEY) {
            throw new Error('mongo_uri must be defined')
        }

        try {
            await mongoose.connect(process.env.MONGO_URI)
        } catch(err) {
            throw new Error('database connection error')
        }

        const PORT = process.env.PORT || 8080

        this.app.listen(PORT , () => console.log('OK! port: '+ PORT))
    }
}