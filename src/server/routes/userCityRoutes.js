import {
  createCityController,
  deleteCityController,
  getCityController,
  listCitiesController,
  updateCityController,
} from "../controllers/userCityController.js";
import { requireAuth } from "../middleware/authentication.js";
import { Router } from "../utils/router.js";

export const userCityRouter = new Router();

userCityRouter.add("GET", "/api/user-cities", requireAuth(listCitiesController));
userCityRouter.add("POST", "/api/user-cities", requireAuth(createCityController));
userCityRouter.add("GET", "/api/user-cities/:id", requireAuth(getCityController));
userCityRouter.add("PUT", "/api/user-cities/:id", requireAuth(updateCityController));
userCityRouter.add("DELETE", "/api/user-cities/:id", requireAuth(deleteCityController));
