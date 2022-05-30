import $axios from "./axios.instance";
import { defineStore } from "pinia";
import { Notify, Loading } from "quasar";

Notify.setDefaults({
  position: "bottom",
  textColor: "white",
  timeout: 3000,
  actions: [{ icon: "close", color: "white" }],
});

export interface IEpisode {
  _id?: number;
  title?: {
    _id?: number;
    title?: string;
  };
  date?: string | null;
  season?: number;
  episode?: number;
  duration?: number;
  watched?: boolean;
}

interface IIdParams {
  _id: number | number[];
}

interface IState {
  episodes: Array<IEpisode>;
  episode: IEpisode;
  episodeOld: IEpisode;
}

function ShowErrorWithNotify(error: any): void {
  Loading.hide();
  let msg = `Error on N-side: ${error.response.status} ${error.response.statusText}`;
  if (error.response.data) {
    msg += ` - ${error.response.data}`;
  }
  Notify.create({ message: msg, color: "negative" });
}

export const useEpisodeStore = defineStore({
  id: "episodes",
  state: (): IState => ({
    episodes: [],
    episode: {},
    episodeOld: {},
  }),
  getters: {
    getEpisodes(): Array<IEpisode> {
      return this.episodes;
    },
    getEpisode(): IEpisode {
      return this.episode;
    },
  },
  actions: {
    async getAll(): Promise<void> {
      Loading.show();
      this.episodes = [];
      $axios
        .get("episodes")
        .then((res) => {
          if (res && res.data) {
            this.episodes = res.data;
          }
          Loading.hide();
        })
        .catch((error) => {
          ShowErrorWithNotify(error);
        });
    },
    // async getById(id: number): Promise<IEpisode> {
    //   Loading.show();
    //   $axios
    //     .get(`episode/${id}`)
    //     .then((res) => {
    //       Loading.hide();
    //       if (res && res.data) {
    //         this.episode = res.data;
    //         Object.assign(this.episodeOld, this.episode);
    //       }
    //     })
    //     .catch((error) => {
    //       ShowErrorWithNotify(error);
    //     });
    //   console.log("episode after res:", this.episode);
    //   return this.episode;
    // },
    async getById(id: number): Promise<void> {
      // console.log(id);
      Loading.show();
      $axios
        .get(`episode/${id}`)
        .then((res) => {
          // console.log(res);
          Loading.hide();
          if (res && res.data) {
            this.episode = {
              ...res.data,
              date: res.data.date != null ? res.data.date.split(".").join("-") : null,
            };
            Object.assign(this.episodeOld, this.episode);
          }
          // console.log("episode after res:", this.episode);
        })
        .catch((error) => {
          ShowErrorWithNotify(error);
        });
    },
    async editById(): Promise<void> {
      if (this.episode && this.episode._id) {
        const diff: any = {};
        Object.keys(this.episode).forEach((k, i) => {
          const newValue = Object.values(this.episode)[i];
          const oldValue = Object.values(this.episodeOld)[i];
          if (newValue != oldValue) diff[k] = newValue;
        });
        if (Object.keys(diff).length == 0) {
          Notify.create({
            message: "Nothing changed!",
            color: "negative",
          });
          process.exit(0);
        }
        // console.log(diff, this.episode);
        Loading.show();
        $axios
          .patch(`episode/${this.episode._id}`, { ...diff, date: diff.date || null })
          .then((res) => {
            Loading.hide();
            if (res && res.data) {
              this.episode = {};
              this.getAll();
              Notify.create({
                message: `Episode with id=${res.data._id} has been edited successfully!`,
                color: "positive",
              });
            }
          })
          .catch((error) => {
            ShowErrorWithNotify(error);
          });
      }
    },
    async deleteById(params: IIdParams): Promise<void> {
      Loading.show();
      // const id = this.episode._id;
      console.log("delete: ", params._id);
      const response = await $axios.delete(`episode/${params._id}`);
      if (response.status == 200) {
        console.log("success");
        Notify.create({
          message: `Episode with id=${params._id} has been deleted successfully!`,
          color: "positive",
        });
      } else {
        ShowErrorWithNotify(response.statusText);
      }
      // $axios
      //   .delete(`episode/${params._id}`)
      //   .then(() => {
      //     Loading.hide();
      //     this.getAll();
      //     this.episode = {};
      //     Notify.create({
      //       message: `Document with id=${params._id} has been deleted successfully!`,
      //       color: "positive",
      //     });
      //   })
      //   .catch((error) => {
      //     ShowErrorWithNotify(error);
      //   });
    },

    // csináld meg az dátumot rendesen!
    async create(titleID: number): Promise<void> {
      if (this.episode) {
        Loading.show();
        delete this.episode.title;
        $axios
          .post("episode", {
            ...this.episode,
            title: titleID,
            date: this.episode.date != null ? this.episode.date!.split("-").join(".") : null,
          })
          .then((res) => {
            Loading.hide();
            if (res && res.data) {
              this.getAll();
              this.episode._id = res.data._id!;
              Notify.create({
                message: `New document with id=${res.data._id} has been saved successfully!`,
                color: "positive",
              });
            }
          })
          .catch((error) => {
            ShowErrorWithNotify(error);
          });
      }
    },
  },
});
