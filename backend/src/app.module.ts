import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PropertiesModule } from './properties/properties.module';
import { PaymentsModule } from './payments/payments.module';
import { TenantsModule } from './tenants/tenants.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/green-real-estate'),
    AuthModule,
    UsersModule,
    PropertiesModule,
    PaymentsModule,
    TenantsModule,
    BlockchainModule,
    ChatModule,
  ],
})
export class AppModule {}
