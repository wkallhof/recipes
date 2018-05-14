import {Recipe} from "../recipe/recipe";

export class SearchResult{
    public recipe: Recipe;
    public score: number;
    public excerpt: string;

    public constructor(init?:Partial<SearchResult>) {
        Object.assign(this, init);
    }
}