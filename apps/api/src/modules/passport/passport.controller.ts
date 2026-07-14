import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PassportService } from './passport.service';
@ApiTags('passports')
@Controller('passports')
export class PassportController {
  constructor(private readonly service: PassportService) {}
  @Get() list(
    @Query() query: { cursor?: string; limit?: string; verdict?: string; inputType?: string },
  ) {
    return this.service.list(query);
  }
  @Get(':publicId') get(@Param('publicId') id: string) {
    return this.service.get(id);
  }
  @Get(':publicId/integrity') integrity(@Param('publicId') id: string) {
    return this.service.verifyIntegrity(id);
  }
  @Post(':publicId/attest') attest(@Param('publicId') id: string) {
    return this.service.retry(id);
  }
  @Get(':publicId/badge') badge(@Param('publicId') id: string) {
    return this.service.badge(id);
  }
}
