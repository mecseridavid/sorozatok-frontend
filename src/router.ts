import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import AccountView from "./views/AccountView.vue";
import GridSeriesViewVue from "./views/GridSeriesViewVue.vue";
import StartPageView from "./views/StartPageView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "StartPage",
    component: StartPageView,
  },
  {
    path: "/account",
    name: "Account",
    component: AccountView,
  },
  {
    path: "/grid",
    name: "grid-series",
    component: GridSeriesViewVue,
  },
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((_to, _from, next) => {
  next();
});
export default router;
