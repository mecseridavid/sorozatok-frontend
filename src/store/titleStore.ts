import $axios from "./axios.instance";
import { defineStore } from "pinia";
import { Notify, Loading } from "quasar";
import { IEpisode } from "./episodeStore";

Notify.setDefaults({
  position: "bottom",
  textColor: "yellow",
  timeout: 3000,
  actions: [{ icon: "close", color: "white" }],
});

export interface ITitle {
  _id?: number;
  title?: string;
  img?: string;
  episodes?: IEpisode[];
}

interface IState {
  titles: Array<ITitle>; // store documents (records) after get method
  title: ITitle;
  titleOld: ITitle;
  numberOfTitles: number;
}

interface IPaginatedParams {
  offset: number;
  limit: string;
  order: string;
  sort: string;
  keyword?: string;
}

function ShowErrorWithNotify(error: any): void {
  Loading.hide();
  let msg = `Error with title: ${error.response.status} ${error.response.statusText}`;
  if (error.response.data) {
    msg += ` - ${error.response.data}`;
  }
  Notify.create({ message: msg, color: "negative" });
}

export const useTitleStore = defineStore({
  id: "titles",
  state: (): IState => ({
    titles: [],
    title: {},
    titleOld: {},
    numberOfTitles: 0,
  }),
  getters: {
    getNumberOfTitles(): number {
      return this.numberOfTitles;
    },
  },
  actions: {
    async getAll(): Promise<void> {
      Loading.show();
      this.titles = [];
      $axios
        .get("titles")
        .then((res) => {
          Loading.hide();
          if (res && res.data) {
            this.titles = res.data;
            this.numberOfTitles = res.data.length;
          }
        })
        .catch((error) => {
          ShowErrorWithNotify(error);
        });
    },
    async getById(id: number): Promise<void> {
      Loading.show();
      $axios
        .get(`title/${id}`)
        .then((res) => {
          Loading.hide();
          if (res && res.data) {
            this.title = res.data;
            Object.assign(this.titleOld, this.title);
          }
        })
        .catch((error) => {
          ShowErrorWithNotify(error);
        });
    },
    async editById(): Promise<void> {
      if (this.title && this.title._id) {
        const diff: any = {};
        Object.keys(this.title).forEach((k, i) => {
          const newValue = Object.values(this.title)[i];
          const oldValue = Object.values(this.titleOld)[i];
          if (newValue != oldValue) diff[k] = newValue;
        });
        if (Object.keys(diff).length == 0) {
          Notify.create({
            message: "Nothing changed!",
            color: "negative",
          });
          process.exit(0);
        }
        // console.log(diff, this.title);
        Loading.show();
        $axios
          .patch(`title/${this.title._id}`, diff)
          .then((res) => {
            Loading.hide();
            if (res && res.data) {
              this.title = {};
              this.getAll();
              Notify.create({
                message: `Title with id=${res.data._id} has been edited successfully!`,
                color: "positive",
              });
            }
          })
          .catch((error) => {
            ShowErrorWithNotify(error);
          });
      }
      // console.log("title: ", this.title, "oldTitle", this.titleOld);
    },
    async fetchPaginatedTitles(params: IPaginatedParams): Promise<void> {
      Loading.show();
      // console.log(
      //   `title/${params.offset}/${params.limit}/${params.order}/${params.sort}/${params.keyword}`
      // );
      $axios
        .get(
          `title/${params.offset}/${params.limit}/${params.order}/${params.sort}/${params.keyword}`
        )
        .then((res) => {
          if (res && res.data) {
            this.titles = res.data.titles;
            this.numberOfTitles = res.data.count;
          }
          Loading.hide();
        })
        .catch((error) => {
          console.error("hiba: " + error);
          Loading.hide();
          Notify.create({
            message: `Error in paginated fetch posts: ${error.message}`,
            color: "negative",
          });
        });
      // console.log(this.titles);
    },
    async deleteById(id: number): Promise<void> {
      Loading.show();
      const response = await $axios.delete(`title/${id}`);
      if (response.status == 200) {
        console.log("success");
        Notify.create({
          message: `Title with id=${id} has been deleted successfully!`,
          color: "positive",
        });
      } else {
        ShowErrorWithNotify(response.statusText);
      }
    },
  },
});
