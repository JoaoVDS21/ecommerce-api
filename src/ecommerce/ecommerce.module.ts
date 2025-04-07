import { Module } from '@nestjs/common';
import { VtexService } from './providers/vtex/vtex.service';
import { UappiService } from './providers/uappi/uappi.service';
import { EcommerceFactory } from './ecommerce.factory';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [VtexService, UappiService, EcommerceFactory],
  exports: [EcommerceFactory],
})
export class EcommerceModule {}