import $axios from "./axios.instance";
import { defineStore } from "pinia";
import {
  Notify,
  Loading,
  // Cookies,
} from "quasar";

Notify.setDefaults({
  position: "bottom",
  textColor: "white",
  timeout: 3000,
  actions: [{ icon: "close", color: "white" }],
});

interface IUser {
  _id?: string;
  name?: string;
  username?: string;
  email?: string;
  password?: string;
}

interface IState {
  loggedUser: null | IUser;
}

export const useUsersStore = defineStore({
  id: "usersStore",
  state: (): IState => ({
    loggedUser: null,
  }),
  getters: {
    getLoggedUser(): null | IUser {
      return this.loggedUser;
    },
  },
  actions: {
    async loginUser(usernameOrEmail: string, password: string): Promise<void> {
      Loading.show();
      $axios
        .post("auth/login", {
          usernameOrEmail: usernameOrEmail,
          password: password,
        })
        .then(async (res) => {
          this.loggedUser = res.data;
          Loading.hide();
          Notify.create({
            message: `${res.data.name} is logged in`,
            color: "positive",
          });
          // console.log(await Cookies.get("Authorization"));
        })
        .catch(() => {
          this.loggedUser = null;
          Loading.hide();
          Notify.create({ message: "Error on Authentication", color: "negative" });
        });
    },
    async logOut(): Promise<void> {
      Loading.show();
      $axios
        .post("auth/logout")
        .then(() => {
          this.loggedUser = null;
          Loading.hide();
          Notify.create({
            message: "Successful logout",
            color: "positive",
          });
        })
        .catch(() => {
          this.loggedUser = null;
          Loading.hide();
          Notify.create({ message: "Error on log out", color: "negative" });
        });
    },
  },
});
