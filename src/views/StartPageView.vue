<script setup lang="ts">
  import { useEpisodeStore, IEpisode } from "../store/episodeStore";
  import { useTitleStore } from "../store/titleStore";

  const episodeStore = useEpisodeStore();
  const titleStore = useTitleStore();
  const weekDays = ["vasárnap", "hétfő", "kedd", "szerda", "csütörtök", "péntek", "szombat"];
  const episodesByWeekDays = (): { [index: string]: Set<string> } => {
    const months = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
    let temp: { [index: string]: Set<string> } = {};
    weekDays.forEach((day) => (temp[day] = new Set()));
    for (let i = 0; i < episodeStore.episodes.length; i++) {
      if (episodeStore.episodes[i].date != null) {
        const [, month, day] = episodeStore.episodes[i].date!.split(".");
        let year = parseInt(episodeStore.episodes[i].date!.split(".")[0]);
        if (parseInt(month) < 3) {
          year -= 1;
        }
        const weekDay =
          weekDays[
            Math.floor(
              (year +
                year / 4 -
                year / 100 +
                year / 400 +
                months[parseInt(month) - 1] +
                parseInt(day)) %
                7
            )
          ];
        temp[weekDay].add(episodeStore.episodes[i].title!.title!);
      }
    }
    return temp;
  };

  let selectedDate = ref("2017.10.18");
  let selectedWeekDay = ref(weekDays[3]);

  const getReleasedates = (): string[] => {
    let temp: Set<string> = new Set();
    for (let i = 0; i < episodeStore.episodes.length; i++) {
      if (episodeStore.episodes[i].date != null) {
        temp.add(episodeStore.episodes[i].date ?? "");
      }
    }
    return Array.from(temp).sort((a, b) => (a > b ? 1 : -1));
  };

  const allEpisodeWithDate = () => {
    let counter = 0;
    for (const e of episodeStore.episodes) {
      if (e.date != null) {
        counter++;
      }
    }
    return counter;
  };

  const watchedEpisodes = () => {
    let counter = 0;
    for (const e of episodeStore.episodes) {
      if (e.watched) {
        counter++;
      }
    }
    return ((counter / episodeStore.episodes.length) * 100).toFixed(2);
  };

  const watchingTime = () => {
    let time = 0;
    for (const e of episodeStore.episodes) {
      if (e.watched) {
        time += e.duration || 0;
      }
    }
    const day = Math.floor(time / (24 * 60)),
      hour = Math.floor((time - day * 24 * 60) / 60),
      minute = time % 60;
    return [day, hour, minute];
  };

  const getEpisodesByDate = (date: string) =>
    episodeStore.episodes.filter((ep: IEpisode) => {
      if (ep.date && date && ep.watched == false && ep.date <= date) {
        return ep;
      }
      return;
    });

  const getTitlesScreenTimeAndSumOfEp = () => {
    interface TitleArr {
      id: number;
      title: string;
      time?: number;
      ep?: number;
    }
    const titles = titleStore.titles;
    const titleArr: TitleArr[] = [];
    titles.forEach((title) => {
      titleArr.push({ id: title._id!, title: title.title!, time: 0, ep: title.episodes!.length });
    });
    for (let t = 0; t < titles.length; t++) {
      let count = 0;
      for (let e = 0; e < titles[t].episodes!.length; e++) {
        count += titles![t].episodes![e]!.duration!;
      }
      titleArr[t].time = count;
    }
    return titleArr;
  };

  onMounted(() => {
    episodeStore.getAll();
    titleStore.getAll();
  });
</script>
<template>
  <q-page>
    <div>
      <p>2. feladat</p>
      <div class="task">
        <p class="solution">
          A listában {{ allEpisodeWithDate() }} db vetítési dátummal rendelkező epizód van.
        </p>
      </div>
    </div>
    <div>
      <p>3. feladat</p>
      <div class="task">
        <p class="solution">A listában lévő epizódok {{ watchedEpisodes() }}%-át látta.</p>
      </div>
    </div>
    <div>
      <p>4. feladat</p>
      <div class="task">
        <p class="solution">
          Sorozatnézéssel {{ watchingTime()[0] }} napot {{ watchingTime()[1] }} órát és
          {{ watchingTime()[2] }} percet töltött.
        </p>
      </div>
    </div>
    <div>
      <p>5. feladat</p>
      <div class="task">
        <div style="display: flex">
          <span>Adjon meg egy dátumot!</span>
          <!-- <q-input
            v-model="selectedDate"
            :dense="true"
            label="Dátum"
            style="max-width: 50%; max-height: 10px"
            type="text"
          >
            <template #prepend>
              <q-icon name="event" />
            </template>
          </q-input> -->
          <q-select
            v-model="selectedDate"
            class="q-mx-lg"
            :dense="true"
            label="Dátum"
            option-label="date"
            :options="getReleasedates()"
            outlined
            square
          >
            <!-- class="q-mx-lg" -->
            <template #prepend>
              <q-icon name="event" />
            </template>
          </q-select>
        </div>
        <div v-for="ep in getEpisodesByDate(selectedDate)" :key="ep._id" class="feladat">
          <p class="solution">
            {{
              ep.season
            }}x{{ (ep.episode!).toString().length > 1 ? ep.episode : "0" + ep.episode }}
            {{ ep.title!.title! }}
          </p>
        </div>
      </div>
    </div>
    <div>
      <p>6. feladat</p>
      <q-expansion-item class="solution" expand-separator label="summa.txt" style="max-width: 50%">
        <div v-for="title in getTitlesScreenTimeAndSumOfEp()" :key="title.id" class="solution">
          <code>{{ title.title }} {{ title.time }} {{ title.ep }}</code>
        </div>
      </q-expansion-item>
    </div>
    <div>
      <p>7. feladat</p>
      <div class="task">
        <div style="display: flex">
          <span>Adja meg a hét egy napját:</span>
          <q-select
            v-model="selectedWeekDay"
            class="q-mx-lg"
            :dense="true"
            label="Nap"
            :options="weekDays"
            outlined
            square
          ></q-select>
        </div>
        <div v-if="episodesByWeekDays()[selectedWeekDay].size > 0">
          <div v-for="title in episodesByWeekDays()[selectedWeekDay]" :key="title" class="solution">
            <!-- <p v-if="episodesByWeekDays()[selectedWeekDay].size > 0">{{ title }}</p> -->
            <p>{{ title }}</p>
          </div>
        </div>
        <p v-else class="solution">Az adott napon nem kerül adásba sorozat.</p>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
  p {
    margin-bottom: 1px;
  }
  .task {
    margin-bottom: 10px;
    margin-left: 10px;
  }
  .solution {
    margin-left: 10px;
    margin-bottom: 0;
  }
</style>
