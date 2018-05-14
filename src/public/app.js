class App {
    
    constructor() {
        this._app = Stimulus.Application.start();
        this._app.register("edit", EditController);
    }
};

w.ready(() => new App());
