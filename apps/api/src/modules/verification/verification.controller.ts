import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateVerificationDto } from './dto/create-verification.dto';
import { PassportResponseDto } from './dto/passport-response.dto';
import { VerificationService } from './verification.service';

@ApiTags('verification')
@Controller('api')
export class VerificationController {
  constructor(private readonly service: VerificationService) {}

  @Post('verify')
  @ApiOperation({ summary: 'Run a full multi-model verification and mint an Evidence Passport.' })
  @ApiResponse({ status: 201, type: PassportResponseDto })
  async verify(@Body() dto: CreateVerificationDto): Promise<PassportResponseDto> {
    const result = await this.service.verify(dto);
    return {
      publicId: result.publicId,
      verificationId: result.verificationId,
      truthScore: result.truthScore,
      verdict: result.verdict,
      summary: result.summary,
      claims: result.claims,
      consensus: result.consensus,
      modelResponses: result.modelResponses,
      requestIds: result.requestIds,
      passportHash: result.passportHash,
      attestation: result.attestation,
      timestamp: result.timestamp,
    };
  }

  @Get('passports/:id')
  @ApiOperation({ summary: 'Fetch a public Evidence Passport by its public id.' })
  async passport(@Param('id') id: string) {
    const passport = await this.service.findByPublicId(id);
    return {
      publicId: passport.publicId,
      passportHash: passport.passportHash,
      verification: passport.verification,
      attestations: passport.attestations,
      createdAt: passport.createdAt,
    };
  }

  @Get('verifications')
  @ApiOperation({ summary: 'List recent verifications.' })
  async verifications(@Query('limit') limit?: string) {
    return this.service.listVerifications(limit ? Number(limit) : undefined);
  }

  @Get('history')
  @ApiOperation({ summary: 'Alias of /verifications for the history view.' })
  async history() {
    return this.service.listVerifications();
  }
}
