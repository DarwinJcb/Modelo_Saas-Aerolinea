/* saas-backend/src/boletos/dto/update-boleto.dto.ts */
import { OmitType, PartialType, } from '@nestjs/mapped-types';
import { CreateBoletoDto } from './create-boleto.dto';

export class UpdateBoletoDto extends PartialType(
    OmitType(CreateBoletoDto, [
        'fkAerolineaBoleto',
        'fkReservaBoleto',
    ] as const),
) { }