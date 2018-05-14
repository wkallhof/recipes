import { Component, Inject } from "@nestjs/common";
import { ServiceDataResult, ServiceResult } from "../shared/service-result";
import DI from "../../di";
import { SearchResult } from "./search-result";
import * as _ from "lodash";
import { IRecipeService } from "../recipe/recipe.service";
import {Recipe} from "../recipe/recipe";

/**
 * 
 * @export
 * @interface ISearchService
 */
export interface ISearchService{
    searchAsync(term: string): Promise<ServiceDataResult<Array<SearchResult>>>
    indexAddAsync(recipe: Recipe): Promise<ServiceResult>
    indexUpdateAsync(recipe: Recipe): Promise<ServiceResult>
    indexRemoveAsync(recipe: Recipe): Promise<ServiceResult>
}


    /*--------------------------------------------*
     *          SERVICE IMPLEMENTATION            *
     *--------------------------------------------*/

@Component()
export class SimpleRegexSearchService implements ISearchService {

    private readonly _recipeService: IRecipeService;

    constructor(@Inject(DI.IRecipeService) recipeService: IRecipeService) {
        this._recipeService = recipeService;
    }

    public async searchAsync(term: string): Promise<ServiceDataResult<Array<SearchResult>>> {
        var allRecipesResult = await this._recipeService.allAsync();
        if (!allRecipesResult.success)
            return new ServiceDataResult<Array<SearchResult>>({success: false, message: allRecipesResult.message}); 
        
        var results = _.chain(allRecipesResult.data)
            .map((d: Recipe) => new SearchResult({ recipe: d, score: this.GetMatchingResult(term, d) }))
            .filter((r: SearchResult) => r.score != 0 )
            .orderBy((r: SearchResult) => r.score)
            .value();

        return new ServiceDataResult<Array<SearchResult>>({ success: true, data: results });
    }

    public async indexAddAsync(recipe: Recipe): Promise<ServiceResult> {
        return new ServiceResult({ success: true });
    }

    public async indexUpdateAsync(recipe: Recipe): Promise<ServiceResult> {
        return new ServiceResult({ success: true });
    }

    public async indexRemoveAsync(recipe: Recipe): Promise<ServiceResult> {
        return new ServiceResult({ success: true });
    }

    public GetMatchingResult(searchTerm: string, recipe: Recipe): number {
        var matches = recipe.title.toLowerCase().match(searchTerm.toLowerCase());
        return matches == null ? 0 : matches.length;
    }
}