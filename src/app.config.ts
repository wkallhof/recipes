export class AppConfig{

    public appTitle: string = "WMK - Recipes";
    public viewsDirectory: string = __dirname + "/views";
    public publicDirectory: string = __dirname + "/public";
    public dataDirectory: string = __dirname + "/data";
    public viewEngine: string = "ejs";

    public authEnabled: boolean = false;
    public authSettings: any;

    public custom: any;

    public constructor(init?:Partial<AppConfig>) {
        Object.assign(this, init);
    }
}