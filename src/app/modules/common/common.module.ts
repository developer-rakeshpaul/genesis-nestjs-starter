import { Module } from '@nestjs/common';
import { AppService } from './../../app.service';

@Module({
  // imports: [forwardRef(() => AuthModule)],
  exports: [AppService],
  providers: [AppService],
})
export class CommonModule {}
