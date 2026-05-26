import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const loadRoutes = async (app) => {
  const modulesPath = path.resolve("src/modules");
  const modules = fs.readdirSync(modulesPath);

  for (const moduleName of modules) {
    const modulePath = path.join(modulesPath, moduleName);

    if (!fs.lstatSync(modulePath).isDirectory()) {
      continue;
    }

    const routeFile = path.join(modulePath, `${moduleName}.routes.js`);

    if (!fs.existsSync(routeFile)) {
      continue;
    }

    const routesModule = await import(pathToFileURL(routeFile).href);
    const routes = routesModule.default ?? routesModule;

    app.use(`/${moduleName}`, routes);
    console.log(`Loaded: /${moduleName}`);
  }
};

export default loadRoutes;
