
import { Middleware, NestMiddleware, ExpressMiddleware, Inject } from '@nestjs/common';
import { IAuthService } from './auth.service';
import DI from '../../di';
import { AppConfig } from '../../app.config';

@Middleware()
export class AuthMiddleware implements NestMiddleware {

    private readonly _config: AppConfig;
    private readonly _authService: IAuthService;

    constructor(@Inject(DI.IAuthService) authService: IAuthService,
        @Inject(DI.AppConfig) config: AppConfig) {
        
        this._config = config;
        this._authService = authService;
    }

    async resolve(name: string): Promise<ExpressMiddleware> {
        if (!this._config.authEnabled)
            return async (req, res, next) => { next(); };
        
        return async (req, res, next) => await this._authService.authenticateRequestAsync(req, res, next);
    }
}