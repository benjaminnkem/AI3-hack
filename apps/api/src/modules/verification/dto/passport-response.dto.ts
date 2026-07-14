import { ApiProperty } from '@nestjs/swagger';

export class PassportResponseDto {
  @ApiProperty()
  publicId!: string;

  @ApiProperty()
  verificationId!: string;

  @ApiProperty()
  truthScore!: number;

  @ApiProperty()
  verdict!: string;

  @ApiProperty()
  summary!: string;

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  claims!: unknown[];

  @ApiProperty({ type: 'object' })
  consensus!: unknown;

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  modelResponses!: unknown[];

  @ApiProperty({ type: [String] })
  requestIds!: string[];

  @ApiProperty()
  passportHash!: string;

  @ApiProperty({ nullable: true, type: 'object' })
  attestation!: unknown | null;

  @ApiProperty()
  timestamp!: string;
}
