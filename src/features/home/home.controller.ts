import { Get, Controller, Inject, Res, Param, HttpException } from '@nestjs/common';
import DI from '../../di';
import { BaseController } from '../shared/base.controller';
import * as _ from "lodash";
import * as moment from "moment";
import { IRecipeService } from '../recipe/recipe.service';
import { AppConfig } from '../../app.config';

/**
 * Main Home controller to handle routing in the application
 * 
 * @export
 * @class HomeController
 * @extends {BaseController}
 */
@Controller()
export class HomeController extends BaseController {

    private readonly _recipeService: IRecipeService;
    private readonly _config: AppConfig;

    constructor(@Inject(DI.IRecipeService) recipeService: IRecipeService,
                @Inject(DI.AppConfig) config: AppConfig)
    {
        super();
        this._recipeService = recipeService;
        this._config = config;
    }
    
    /**
     * GET : /
     * 
     * Main Home landing page route.
     */
	@Get("")
    async index(@Res() res, @Param() params) {
        let recipes = await this._recipeService.allAsync();
        return this.View(res, "home", {title : this._config.appTitle, recipes: recipes.data});
    }
}
