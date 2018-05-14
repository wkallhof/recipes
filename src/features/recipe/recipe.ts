import { IsNotEmpty } from "class-validator";

export class Recipe{
    @IsNotEmpty()
    public title: string = "";
    @IsNotEmpty()
    public slug: string = "";

    public imageUrl: string = "";
    public description: string = "";
    public source: string = "";
    
    public updateDate : number = null;
    public createDate : number = null;
    public tags: Array<string> = new Array<string>();
    
    public ingredientGroups: Array<IngredientGroup> = new Array<IngredientGroup>();
    public directions: Array<DirectionStep> = new Array<DirectionStep>();
    
    public constructor(init?:Partial<Recipe>) {
        Object.assign(this, init);
    }
}

export class IngredientGroup{
    public title: string = "";
    public ingredients: Array<Ingredient> = new Array<Ingredient>();

    public constructor(init?:Partial<IngredientGroup>) {
        Object.assign(this, init);
    }
}

export class Ingredient{
    public unit: string = "";
    public quantity: number;
    public name: string = "";
    public prep: string = "";
    public text: string = "";

    public constructor(init?:Partial<Ingredient>) {
        Object.assign(this, init);
    }
}

export class DirectionStep{
    @IsNotEmpty()
    public text: string = "";

    public constructor(init?:Partial<DirectionStep>) {
        Object.assign(this, init);
    }
}