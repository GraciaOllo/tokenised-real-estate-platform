import { Module } from '@nestjs/common';
import { BlockchainController } from './blockchain.controller';
import { BlockchainService } from './blockchain.service';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [AuthModule],
  controllers: [BlockchainController],
  providers: [BlockchainService],
  exports: [BlockchainService], // Export the service so other modules can use it
})
export class BlockchainModule {}