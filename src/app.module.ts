import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ClienteModule } from './cliente/cliente.module';
import { EmpresaModule } from './empresa/empresa.module';
import { TicketModule } from './ticket/ticket.module';
import { CuponModule } from './cupon/cupon.module';
import { AuthModule } from './auth/auth.module';
import { ClienteService } from './cliente/cliente.service';
import { FilesModule } from './files/files.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';



@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true, // Solo en desarrollo
    }),
    ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', 'public'),
   }),

  

    ClienteModule,

    EmpresaModule,

    TicketModule,

    CuponModule,

    AuthModule,

    FilesModule,
  ],
  controllers: [],
  
})
export class AppModule {}
