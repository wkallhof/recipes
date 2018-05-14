import { App } from './app';
import { AppConfig } from './app.config';

async function server() {

    const config = new AppConfig({
        authEnabled: false,
        authSettings: {
            username: "test",
            password: "test"
        }
    });

    const app = new App(config);
    await app.init();

    const port = process.env.PORT || 3000;
    const ip = process.env.IP || "127.0.0.1";

    await app.start(ip, port);
}

server();
