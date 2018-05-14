import { Get, Post, Controller, Body, HttpStatus, Param, HttpException, ValidationPipe, UsePipes, Res, Inject, Delete, Put, Req } from '@nestjs/common';
import { Response, Request } from "express";
import DI from '../../di';
import { BaseController } from '../shared/base.controller';
import { IRecipeService } from './recipe.service';
import {Recipe, DirectionStep, IngredientGroup, Ingredient} from './recipe';
import { RecipeEdit } from './recipe-edit';


@Controller()  
export class RecipeController extends BaseController {

    private readonly _recipeService: IRecipeService;

    constructor(@Inject(DI.IRecipeService) recipeService: IRecipeService) {
        super();
        this._recipeService = recipeService;
    }

    /**
     * GET: /[slug]
     * 
     * Get's the recipe for the given slug. If the slug isn't found
     * it redirects to the edit page for that recipe
     */
    @Get(":slug")
    async details(@Res() res, @Param() params) {
        if (params.slug == null)
            return this.Redirect(res, "/");
        
        // find the recipe matching the slug
        const result = await this._recipeService.getAsync(params.slug);
        if (!result.success)
            return this.Redirect(res, params.slug+"/edit");
        
        // parse the content into html for rendering
        const recipe = result.data;
        
        // return view
        return this.View(res, "recipe", { recipe: recipe});
    }

    /**
     * GET : /[slug]/edit
     * 
     * Displays the edit form for a recipe
     */
    @Get(":slug/edit")
    async edit(@Req() req : Request, @Res() res : Response, @Param() params) {
        if (params.slug == null)
            this.BadRequest();
        
        // get the recipe associated with the slug
        const result = await this._recipeService.getAsync(params.slug);
        
        // if it was found, use that, if not, create a new doc
        let recipe = result.success ? result.data : new Recipe({ slug: params.slug });
        let editModel = this.mapRecipeToRecipeEdit(recipe);

        
        // return edit view
        return this.View(res, "edit", { recipe: editModel});
    }

    /**
     * Post : /[slug]
     * 
     * Updates an existing recipe or creates a new recipe for the give
     * slug
     * 
     * @param recipe recipe posted directly from form
     */
    @Post(":slug")
    async create(@Res() res: Response, @Param() params, @Body() editModel: RecipeEdit) {
        // ensure we have a slug
        if (params.slug == null)
            this.BadRequest();
        
        // check if the recipe exists
        const existsResult = await this._recipeService.existsAsync(params.slug);
        if (!existsResult.success)
            return Error(existsResult.message);
        
        // if it exists, call update. If not, call add
        const docExists = existsResult.data;
        let recipe = this.mapRecipeEditToRecipe(editModel);
        const result = docExists ?
            await this._recipeService.updateAsync(recipe) :
            await this._recipeService.addAsync(recipe);
        
        // validate recipe service action
        if (!result.success)
            this.BadRequest(result.message);
        
        // redirect to new / updated recipe
        return this.Redirect(res, params.slug);
    }

    /**
     * POST : /[slug]/delete
     * 
     * Call to delete a recipe associate with the given slug
     */
    @Post(":slug/delete")
    async delete(@Res() res : Response, @Param() params) {
        if (params.slug == null)
            this.BadRequest();
        
        // call to delete the recipe and validate success
        const result = await this._recipeService.deleteAsync(params.slug);
        if (!result.success)
            this.BadRequest(result.message);
        
        // redirect to home
        return this.Redirect(res, "/");
    }

    private mapRecipeEditToRecipe(editModel: RecipeEdit): Recipe{
        return new Recipe({
            slug: editModel.slug,
            title: editModel.title,
            description: editModel.description,
            directions: this.mapDirectionStringToDirectionList(editModel.directions),
            ingredientGroups: this.mapIngredientGroupsStringToList(editModel.ingredientGroups)
        })
    }

    private mapRecipeToRecipeEdit(recipe: Recipe): RecipeEdit{
        return new RecipeEdit({
            slug: recipe.slug,
            title: recipe.title,
            description: recipe.description,
            directions: this.mapDirectionListToDirectionString(recipe.directions),
            ingredientGroups: this.mapIngredientGroupsListToString(recipe.ingredientGroups)
        });
    }

    private mapIngredientGroupsStringToList(groupsString : string) : Array<IngredientGroup> {
        if (groupsString == null || groupsString.length <= 0) return new Array<IngredientGroup>();

        let groups = groupsString.split("#").filter((val) => val.length > 0).map((val) => val.trim());
        return groups.map((group) => this.parseIngredientGoupText(group));
    };

    private parseIngredientGoupText(group: string): IngredientGroup {
        let items = group.split("\n").map((x) => x.trim());
        let title = items.shift();

        return new IngredientGroup({ title: title, ingredients: items.map((x) => new Ingredient({ text: x.replace("-", "").trim() })) });
    };

    private mapIngredientGroupsListToString(groups : Array<IngredientGroup>) : string {
        let output = "";
        groups.forEach((group) => {
            output += `# ${group.title}\n`;
            group.ingredients.forEach((ingredient) => {
                output += `- ${ingredient.text}\n`;
            });
        });

        return output;
    }

    private mapDirectionStringToDirectionList(directionString: string): Array<DirectionStep>{
        if (directionString == null || directionString.length <= 0) return new Array<DirectionStep>();

        return directionString.split("\n").map((val: string) => new DirectionStep({ text: val }));
    }

    private mapDirectionListToDirectionString(directionList: Array<DirectionStep>): string{
        if (directionList == null) return "";

        return directionList.map((step: DirectionStep) => step.text).join("\n")
    }
}
