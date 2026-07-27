import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { VisitService, VisitStats } from './visit.service';
import { Auth } from '../auth/decorator/auth.decorator';

@Controller('visits')
export class VisitController {
    constructor(private readonly visitService: VisitService) {}
    @Auth()
    @Get('stats')
    async getStats(): Promise<VisitStats> {
        return this.visitService.getStats();
    }

    @Get('track')
    async track(@Req() req: Request) {
        const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
        const path = req.originalUrl;

        return this.visitService.trackVisit(ip, userAgent, path);
    }
}
