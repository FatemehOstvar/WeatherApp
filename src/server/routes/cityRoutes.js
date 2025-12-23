import { searchCityController } from "../controllers/cityController.js";
import { Router } from "../utils/router.js";

export const cityRouter = new Router();

cityRouter.add("GET", "/api/cities/search", searchCityController);
