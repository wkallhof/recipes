import { Component, Inject } from '@nestjs/common';
import { ServiceResult, ServiceDataResult } from '../shared/service-result';
import * as _ from "lodash";
import DI from '../../di';
import { IStorageService } from '../storage/storage.service';
import {Recipe} from './recipe';

/**
 * Service to manage recipes
 * 
 * @export
 * @interface IRecipeService
 */
export interface IRecipeService{
    allAsync(): Promise<ServiceDataResult<Array<Recipe>>>;
    getAsync(slug : string): Promise<ServiceDataResult<Recipe>>;
    addAsync(recipe : Recipe): Promise<ServiceResult>;
    updateAsync(recipe: Recipe): Promise<ServiceResult>;
    existsAsync(slug: string): Promise<ServiceDataResult<boolean>>;
    deleteAsync(slug: string): Promise<ServiceResult>;
}

@Component()
export class RecipeService implements IRecipeService {

    private _recipes: Array<Recipe>;
    private readonly _storageService: IStorageService;
    private readonly _storageKey: string = "recipes";

    constructor(@Inject(DI.IStorageService) storageService: IStorageService) {
        this._recipes = new Array<Recipe>();
        this._storageService = storageService;
    }

    /*--------------------------------------------*
     *          SERVICE IMPLEMENTATION            *
     *--------------------------------------------*/
    
    /**
     * Initializes the recipe service by getting all recipes up front
     * for our in-memory storage for performance reasons.
     */
    public async initializeAsync(): Promise<ServiceResult>{
        var result = await this._storageService.readObjectAsync<Array<Recipe>>(this._storageKey);
        
        this._recipes = result.data || new Array<Recipe>();
        return new ServiceResult({ success: true });
    }
    
    /**
     * Gets all recipes in the recipe service
     * 
     * @returns {Promise<ServiceDataResult<Recipe[]>>} 
     * @memberof recipeService
     */
    public async allAsync(): Promise<ServiceDataResult<Recipe[]>> {
        const result = _.chain(this._recipes)
            .map((recipe) => _.clone(recipe))
            .compact()
            .value();
        
        return new ServiceDataResult({success : true, data : result});
    }

    /**
     * Gets a single recipe by recipe slug
     * 
     * @param {string} slug : recipe slug
     * @returns {Promise<ServiceDataResult<Recipe>>} 
     * @memberof recipeService
     */
    public async getAsync(slug: string): Promise<ServiceDataResult<Recipe>> {
        const match = _.clone(_.find(this._recipes, { "slug": slug }));
        return match == null ?
            new ServiceDataResult<Recipe>({ success: false, message: "Recipe not found" }) :
            new ServiceDataResult<Recipe>({ success: true, data: match });
    }

    /**
     * Adds a new recipe
     * 
     * @param {recipe} recipe : recipe to add
     * @returns {Promise<ServiceResult>} 
     * @memberof recipeService
     */
    public async addAsync(recipe: Recipe): Promise<ServiceResult> {
        if (recipe == null)
            return new ServiceResult({ success: false, message: "Null recipe while adding" });
        
        var match = _.find(this._recipes, { "slug": recipe.slug });
        if (match != null)
            return new ServiceResult({ success: false, message: "recipe already exists" });
        
        recipe.createDate = Date.now();
        recipe.updateDate = recipe.createDate;
        recipe.tags = recipe.tags || [];

        this._recipes.push(recipe);

        return await this.persistList();
    }

    /**
     * Update an existing recipe
     * 
     * @param {recipe} recipe : recipe to update
     * @returns {Promise<ServiceResult>} 
     * @memberof recipeService
     */
    public async updateAsync(recipe : Recipe): Promise<ServiceResult> {
        if (recipe == null)
            return new ServiceResult({ success: false, message: "Null recipe while updating" });
        
        // update date
        recipe.updateDate = Date.now();

        // ensure we have an existing doc by finding the index
        var index = _.findIndex(this._recipes, { slug: recipe.slug });
        if (index < 0)
            return new ServiceResult({ success: false, message: "Recipe doesn't exists" });    

        // slip the new recipe into to the array over the old one
        this._recipes.splice(index, 1, recipe);

        return await this.persistList();
    }

    /**
     * Delete a recipe by slug
     * 
     * @param {string} slug : Slug of recipe to delete
     * @returns {Promise<ServiceResult>} 
     * @memberof recipeService
     */
    public async deleteAsync(slug: string): Promise<ServiceResult> {
        var match = _.find(this._recipes, { "slug": slug });
        if (match == null)
            return new ServiceResult({ success: false, message: "Recipe doesn't exists" });
        
        _.remove(this._recipes, { "slug": slug });

        return await this.persistList();
    }

    /**
     * Checks if a recipe exists
     * 
     * @param slug recipe slug
     * @returns {Promise<ServiceDataResult<boolean>>} 
     */
    public async existsAsync(slug: string): Promise<ServiceDataResult<boolean>> {
        if (!slug)
            return new ServiceDataResult<boolean>({ success: false, message: "No slug provided" });
        
        var index = _.findIndex(this._recipes, { slug: slug });
        return new ServiceDataResult<boolean>({
            success: true,
            data : index >= 0 
        });
    }

    private async persistList(): Promise<ServiceResult>{
        let result = await this._storageService.storeObjectAsync(this._storageKey, this._recipes);
        return result;
    }
}