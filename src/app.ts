import { Module, DynamicModule, ValidationPipe, INestApplication, MiddlewaresConsumer, NestModule, InternalServerErrorException } from '@nestjs/common';
import { HomeController } from './features/home/home.controller';
import DI from './di';
import { ServiceResult } from './features/shared/service-result';
import { NestFactory } from '@nestjs/core';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import * as express from 'express';
import * as path from 'path';
import { AppConfig } from './app.config';
import { ICacheService, MemoryCacheService } from './features/caching/cache.service';
import { IStorageService, JsonDiskStorageService } from './features/storage/storage.service';
import { IAuthService, BasicAuthService } from './features/auth/auth.service';
import { IRecipeService, RecipeService } from './features/recipe/recipe.service';
import { ISearchService, SimpleRegexSearchService } from './features/search/search.service';
import { RecipeController } from './features/recipe/recipe.controller';
import { SearchController } from './features/search/search.controller';

/**
 * APP : Recipes Application
 * 
 * @export
 * @class App
 */
export class App {
    private _config: AppConfig;
    private _app: INestApplication;

    constructor(config: AppConfig) {
        this._config = config;
    }
    
    /**
     * Initializes the WADAR application and returns a new Next Application
     * 
     * @returns {Promise<INestApplication>} 
     * @memberof App
     */
    async init(): Promise<INestApplication> {
        // initialize services
        var storageService = new JsonDiskStorageService(this._config);
        let storageResult = await storageService.initializeAsync();
        if (!storageResult.success)
            throw new InternalServerErrorException("Error initializing storage service : " + storageResult.message);
        
        var recipeService = new RecipeService(storageService);
        let recipeResult = await recipeService.initializeAsync();
        if (!recipeResult.success)
            throw new InternalServerErrorException("Error initializing recipe service : " + recipeResult.message);
        
        var searchService = new SimpleRegexSearchService(recipeService);
        
        var authService = new BasicAuthService(this._config);

        // create application module
        console.log("Creating app");
        this._app = await NestFactory.create(RecipesModule.create(this._config, storageService, authService, recipeService, searchService));

        // setup server and middleware
        this._app.useGlobalPipes(new ValidationPipe());
        this._app.useGlobalFilters(new GlobalExceptionFilter());
        this._app.use(express.static(this._config.publicDirectory));
        this._app.set('views',this._config.viewsDirectory);
        this._app.set('view engine', this._config.viewEngine);

        return this._app;
    }

    /**
     * Starts the Recipes application service
     * @param ip IP to registed app on
     * @param port PORT to register app on
     */
    async start(ip: any, port: any) {
        await this._app.listen(port, ip, () => {
            console.log("✔ Recipes server listening at %s:%d ", ip, port);
        });
    }
}

/**
 * Register main Recipes Nest Module along with services
 * for DI
 * 
 * @class RecipesModule
 * @implements {NestModule}
 */
class RecipesModule implements NestModule {

    configure(consumer: MiddlewaresConsumer): void { }
    
    static create(config: AppConfig, storageService: IStorageService, authService: IAuthService, recipeService : IRecipeService, searchService : ISearchService): DynamicModule {

        return {
            module: RecipesModule,
            controllers: [HomeController, RecipeController, SearchController],
            components: [
                { provide: DI.IRecipeService, useFactory: () => recipeService },
                { provide: DI.IStorageService, useFactory: () => storageService },
                { provide: DI.IAuthService, useFactory: () => authService },
                { provide: DI.ISearchService, useFactory: () => searchService },
                { provide: DI.AppConfig, useFactory: () => config }
            ],
          };
    }
}
