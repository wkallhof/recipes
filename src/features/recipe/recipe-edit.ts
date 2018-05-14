import { IsNotEmpty } from "class-validator";

export class RecipeEdit {
    @IsNotEmpty()
    public title: string = "";
    @IsNotEmpty()
    public slug: string = "";

    public imageUrl: string = "";
    public description: string = "";
    public source: string = "";
    
    public updateDate: number = null;
    public createDate: number = null;
    public tags: Array<string> = new Array<string>();
    
    public ingredientGroups: string;
    public directions: string;
    
    public constructor(init?: Partial<RecipeEdit>) {
        Object.assign(this, init);
    }
}