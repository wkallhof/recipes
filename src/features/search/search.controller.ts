import { Get, Controller, Inject, Res, Param, HttpException, Query } from '@nestjs/common';
import { Response } from "express";
import DI from '../../di';
import { BaseController } from '../shared/base.controller';
import { AppConfig } from '../../app.config';
import SearchViewModel from './search.viewModel';
import { ISearchService } from './search.service';

@Controller()
export class SearchController extends BaseController {

    private readonly _searchService: ISearchService;
    private readonly _config: AppConfig;

    constructor(@Inject(DI.ISearchService) searchService: ISearchService,
                @Inject(DI.AppConfig) config: AppConfig)
    {
        super();

        this._config = config;
        this._searchService = searchService;
    }
    
	@Get("search")
    async index(@Res() res: Response, @Query() params) {
        
        if (params.term == null)
            this.BadRequest();
        
        var searchResponse = await this._searchService.searchAsync(params.term);
        if (!searchResponse.success)
            return Error(searchResponse.message);    
        
        var model = new SearchViewModel();
        model.title = "Search";
        model.term = params.term;
        model.results = searchResponse.data;

        return this.View(res, "search", model);
    }
}
