/* saas-backend/src/prisma/prisma.service.ts */
import 'dotenv/config';
import { Injectable, OnModuleDestroy, OnModuleInit, } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {
    constructor() {
        const cadenaConexion = process.env.DATABASE_URL;
        if (!cadenaConexion) {
            throw new Error(
                'La variable DATABASE_URL no está definida en el archivo .env',
            );
        }

        const adaptadorPostgresql = new PrismaPg({
            connectionString: cadenaConexion,
        });

        super({
            adapter: adaptadorPostgresql,
        });
    }

    async onModuleInit(): Promise<void> {
        await this.$connect();
    }

    async onModuleDestroy(): Promise<void> {
        await this.$disconnect();
    }
}