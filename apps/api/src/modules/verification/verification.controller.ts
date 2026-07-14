import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  PayloadTooLargeException,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { memoryStorage } from 'multer';
import { CreateVerificationDto } from './dto/create-verification.dto';
import { VerificationService } from './verification.service';
@ApiTags('verifications')
@Controller('verifications')
export class VerificationController {
  constructor(
    private readonly service: VerificationService,
    private readonly config: ConfigService,
  ) {}
  @Post()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseInterceptors(
    FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 5242880, files: 1 } }),
  )
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['inputType'],
      properties: {
        inputType: { type: 'string', enum: ['TEXT', 'URL', 'IMAGE'] },
        content: { type: 'string' },
        url: { type: 'string' },
        forceRefresh: { type: 'boolean' },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Run the synchronous evidence-verification pipeline' })
  verify(@Body() dto: CreateVerificationDto, @UploadedFile() file?: Express.Multer.File) {
    if (file && file.size > this.config.get('MAX_IMAGE_BYTES', 5242880))
      throw new PayloadTooLargeException('Image exceeds configured size limit');
    return this.service.verify(dto, file);
  }
  @Get(':id') get(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getVerification(id);
  }
}
