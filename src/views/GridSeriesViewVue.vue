<script setup lang="ts">
  import { useTitleStore, ITitle } from "../store/titleStore";
  import { useUsersStore } from "../store/usersStore";
  import { useEpisodeStore, IEpisode } from "../store/episodeStore";
  import { Loading, Notify, QTableProps } from "quasar";

  const titleStore = useTitleStore();
  const episodeStore = useEpisodeStore();
  const userStore = useUsersStore();

  const openEpisodeForm = ref(false);
  const openTitleForm = ref(false);

  const editingEpisode = ref(false);
  const editingTitle = ref(false);

  const openEpisodesOfSelectedTitle = ref(false);
  const maximizedToggle = ref(false);
  const selectedTitle = ref<ITitle>({});
  const selectedEpisodes = ref<IEpisode[]>([]);
  const pagination = ref({
    sortBy: "title",
    descending: false,
    page: 1,
    rowsPerPage: 6,
    rowsNumber: titleStore.getNumberOfTitles,
    filter: "",
  });
  const filter = ref("");

  function sendTitle() {
    if (editingTitle.value) {
      titleStore.editById().finally(() => {
        deleteTitleFromVar();
      });
    }
  }

  function editTitle(row: any) {
    // console.log("row: ", row);
    titleStore.getById(row._id!);
    openTitleForm.value = editingTitle.value = true;
    // console.log("title: ", titleStore.title, "oldTitle", titleStore.titleOld);
  }

  function deleteTitleFromVar() {
    openTitleForm.value = false;
    editingTitle.value = false;
    onRequest({
      pagination: pagination.value,
    });
    titleStore.titleOld = {};
  }

  function deleteTitle(row: any) {
    console.log(row);
    if (row.episodes.length > 0) {
      Notify.create({
        message: "You can't delete title if episodes is not empty!",
        color: "negative",
      });
    } else {
      titleStore.deleteById(row._id).then(() => {
        onRequest({
          pagination: pagination.value,
        });
      });
    }
  }

  function sendEpisode() {
    // console.log(selectedTitle.value.title);
    if (editingEpisode.value) {
      episodeStore
        .editById()
        .then(() => {
          selectedTitle.value.episodes?.find((title, index) => {
            if (title._id == episodeStore.episode._id) {
              selectedTitle.value.episodes![index] = episodeStore.episode;
              return true;
            }
          });
        })
        .finally(() => {
          deleteEpisodeFromVar();
        });
    } else {
      episodeStore
        .create(selectedTitle.value._id!)
        .then(() => {
          selectedTitle.value.episodes!.push(episodeStore.episode);
        })
        .finally(() => {
          // console.log(selectedTitle.value.episodes);
          deleteEpisodeFromVar();
        });
    }
  }

  function editEpisode() {
    // console.log("---------------editing---------------------");
    episodeStore.getById(selectedEpisodes.value[0]._id!);
    openEpisodeForm.value = editingEpisode.value = true;
  }

  function deleteEpisodeFromVar() {
    openEpisodeForm.value = false;
    editingEpisode.value = false;
    onRequest({
      pagination: pagination.value,
    });
    // episodeStore.episode = {};
    episodeStore.episodeOld = {};
  }

  function deleteOneOrMoreEpisode(): void {
    const episodes = [...selectedEpisodes.value];
    selectedEpisodes.value = [];

    for (const e of episodes) {
      episodeStore.deleteById({ _id: e._id! }).then(() => {
        const tempArr: IEpisode[] = selectedTitle.value.episodes!.filter(
          (selectedE: IEpisode) => selectedE._id != e._id
        );
        // console.log(tempArr);
        selectedTitle.value.episodes = tempArr;
      });
    }
    console.log("this supposed to be the last");
    Loading.hide();
  }

  const episodeCols: QTableProps["columns"] = [
    {
      name: "_id",
      label: "",
      field: "_id",
      style: "display: none",
      headerStyle: "display: none",
    },
    {
      name: "date",
      label: "Date",
      field: "date",
      align: "center",
      sortable: true,
    },
    {
      name: "season",
      label: "Season",
      field: "season",
      align: "center",
      sortable: true,
      headerStyle: "max-width: 60px",
    },
    {
      name: "episode",
      label: "Episode",
      field: "episode",
      align: "center",
      sortable: true,
      headerStyle: "max-width: 60px",
    },
    {
      name: "duration",
      label: "Duration (min)",
      field: "duration",
      align: "center",
      sortable: true,
      headerStyle: "max-width: 80px",
    },
    {
      name: "watched",
      label: "Watched",
      field: "watched",
      align: "center",
      sortable: true,
      headerStyle: "max-width: 50px",
    },
  ];
  const titleCols: QTableProps["columns"] = [
    {
      name: "_id",
      label: "",
      field: "_id",
      style: "display: none",
      headerStyle: "display: none",
    },
    {
      name: "title",
      label: "Title",
      field: "title",
      align: "left",
      sortable: true,
    },
    { name: "img", label: "Image", field: "img", align: "left" },
    {
      name: "deleteBtn",
      label: "Delete",
      field: "deleteBtn",
      style: "max-width: 30px",
    },
    {
      name: "editBtn",
      label: "Edit",
      field: "editBtn",
      style: "max-width: 30px",
    },
  ];

  watch(titleStore, () => {
    pagination.value.rowsNumber = titleStore.numberOfTitles;
  });

  function onRequest(props: any) {
    const { page, rowsPerPage, sortBy, descending } = props.pagination;

    titleStore.fetchPaginatedTitles({
      offset: (page - 1) * rowsPerPage,
      limit: rowsPerPage,
      order: sortBy,
      sort: descending ? "-1" : "1",
      keyword: filter.value,
    });

    pagination.value.page = page;
    pagination.value.rowsPerPage = rowsPerPage;
    pagination.value.sortBy = sortBy;
    pagination.value.descending = descending;
  }

  function onOpenEpisodes(row: any) {
    selectedTitle.value = row;
    openEpisodesOfSelectedTitle.value = true;
  }

  function onCloseEpisodes() {
    maximizedToggle.value = false;
    selectedEpisodes.value = [];
    onRequest({
      pagination: pagination.value,
    });
  }

  onMounted(() => {
    onRequest({
      pagination: pagination.value,
    });
  });
</script>

<template>
  <q-page>
    <q-table
      v-model:pagination="pagination"
      binary-state-sort
      class="row justify-around"
      :columns="titleCols"
      :filter="filter"
      grid
      row-key="_id"
      :rows="titleStore.titles"
      title="All Series"
      title-class="text-h4 text-italic"
      @request="onRequest"
    >
      <template #top-right>
        <q-input v-model="filter" debounce="300" dense placeholder="Search">
          <template #append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>

      <template #item="props">
        <div class="col-xs-12 col-sm-6 col-md-4">
          <q-card class="q-ma-md">
            <div v-for="col in props.cols" :key="col._id">
              <div v-if="col.name == 'img'">
                <q-img :fit="'fill'" :src="col.value" style="height: 400px">
                  <div class="flex justify-between items-center absolute-top text-h5">
                    <span>{{ props.row.title }}</span>
                    <q-btn-dropdown
                      v-if="userStore.loggedUser"
                      class="float-right"
                      content-class="transparent no-shadow"
                      dense
                      dropdown-icon="menu"
                      flat
                      no-caps
                      size="lg"
                    >
                      <q-list>
                        <q-item dense>
                          <q-btn color="red" label="Delete" @click="deleteTitle(props.row)" />
                        </q-item>
                        <q-item dense>
                          <q-btn
                            class="full-width"
                            color="blue"
                            label="Edit"
                            @click="editTitle(props.row)"
                          />
                        </q-item>
                      </q-list>
                    </q-btn-dropdown>
                  </div>
                  <div class="absolute-bottom" style="padding: 0">
                    <q-btn
                      class="full-width q-ma-none"
                      dense
                      label="Episodes"
                      @click="onOpenEpisodes(props.row)"
                    />
                  </div>
                </q-img>
              </div>
            </div>
          </q-card>
        </div>
      </template>
    </q-table>
    <q-dialog
      :key="selectedTitle._id"
      v-model="openEpisodesOfSelectedTitle"
      :maximized="maximizedToggle"
      persistent
    >
      <q-card style="min-width: 700px">
        <q-bar>
          Episodes of {{ selectedTitle.title }}
          <q-space />
          <q-btn
            dense
            :disable="!maximizedToggle"
            flat
            icon="minimize"
            @click="maximizedToggle = false"
          >
            <q-tooltip v-if="maximizedToggle" class="bg-white text-primary">Minimize</q-tooltip>
          </q-btn>
          <q-btn
            dense
            :disable="maximizedToggle"
            flat
            icon="crop_square"
            @click="maximizedToggle = true"
          >
            <q-tooltip v-if="!maximizedToggle" class="bg-white text-primary">Maximize</q-tooltip>
          </q-btn>
          <q-btn v-close-popup dense flat icon="close" @click="onCloseEpisodes">
            <q-tooltip class="bg-white text-primary">Close</q-tooltip>
          </q-btn>
        </q-bar>
        <q-table
          v-model:selected="selectedEpisodes"
          :columns="episodeCols"
          hide-selected-banner
          :pagination="{ rowsPerPage: 10 }"
          row-key="_id"
          :rows="selectedTitle.episodes"
          :selection="userStore.loggedUser ? 'multiple' : 'none'"
          separator="vertical"
        >
          <template #no-data="{ message }">
            <div class="full-width flex justify-between items-center">
              <div>
                <q-btn v-if="userStore.loggedUser" color="green" @click="openEpisodeForm = true">
                  Add
                </q-btn>
              </div>
              <div>
                <q-icon name="sentiment_dissatisfied" size="2em" />
                <span>Well this is sad... {{ message }}</span>
              </div>
            </div>
          </template>
          <template #bottom="props">
            <div class="full-width flex justify-between">
              <div>
                <q-btn
                  v-if="userStore.loggedUser && selectedEpisodes.length == 0"
                  color="green"
                  @click="(episodeStore.episode = {}) && (openEpisodeForm = true)"
                >
                  Add
                </q-btn>
                <q-btn
                  v-else-if="selectedEpisodes.length != 0"
                  class="q-mr-sm"
                  color="red"
                  @click="deleteOneOrMoreEpisode()"
                >
                  Delete
                </q-btn>
                <q-btn
                  v-if="selectedEpisodes.length == 1"
                  class="q-ml-sm"
                  color="blue"
                  @click="editEpisode()"
                >
                  Edit
                </q-btn>
              </div>
              <div class="flex row">
                <q-select
                  v-model="props.pagination.rowsPerPage"
                  borderless
                  dense
                  emit-value
                  map-options
                  :options="[3, 5, 7, 10, 15, 20, { label: 'All', value: 0 }]"
                  options-dense
                />
                <q-btn
                  v-if="props.pagesNumber > 2"
                  color="grey-8"
                  dense
                  :disable="props.isFirstPage"
                  flat
                  icon="first_page"
                  round
                  @click="props.firstPage"
                ></q-btn>
                <q-btn
                  color="grey-8"
                  dense
                  :disable="props.isFirstPage"
                  flat
                  icon="chevron_left"
                  round
                  @click="props.prevPage"
                ></q-btn>
                <q-btn
                  color="grey-8"
                  dense
                  :disable="props.isLastPage"
                  flat
                  icon="chevron_right"
                  round
                  @click="props.nextPage"
                ></q-btn>
                <q-btn
                  v-if="props.pagesNumber > 2"
                  color="grey-8"
                  dense
                  :disable="props.isLastPage"
                  flat
                  icon="last_page"
                  round
                  @click="props.lastPage"
                ></q-btn>
              </div>
            </div>
          </template>
          <template #body-cell-date="props">
            <q-td :props="props">
              <span class="text-center text-overline text-weight-bold">
                {{ props.value ? props.value : "-" }}
              </span>
            </q-td>
          </template>
          <template #body-cell-watched="props">
            <q-td :props="props">
              <q-badge v-if="props.value" color="green" label="Yes" outline />
              <q-badge v-else color="red" label="No" outline />
            </q-td>
          </template>
          <template #header="props">
            <q-tr class="bg-primary" :props="props">
              <q-th v-if="userStore.loggedUser">
                <q-checkbox v-model="props.selected" color="secondary" keep-color />
              </q-th>
              <q-th v-for="col in props.cols" :key="col.name" :props="props">
                <span class="text-center text-overline text-weight-bold text-grey-1">
                  {{ col.label }}
                </span>
              </q-th>
            </q-tr>
          </template>
        </q-table>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openEpisodeForm" persistent transition-hide="scale" transition-show="scale">
      <q-card style="min-width: 700px">
        <q-card-section>
          <div class="q-px-xl text-h5 text-center">
            {{ editingEpisode ? "Edit episode of " : "Add episode to " }}{{ selectedTitle.title }}
          </div>
        </q-card-section>
        <q-card-section>
          <q-form @submit="sendEpisode()">
            <q-list dense>
              <q-item dense>
                <q-item-section>
                  <q-item-label>Date</q-item-label>
                </q-item-section>
                <q-item-section>
                  <!-- :rules="[(v) => (v != null && v != '') || 'Date - Choose!']" -->
                  <q-input v-model="episodeStore.episode.date" clearable filled mask="####-##-##">
                    <template #append>
                      <q-icon class="cursor-pointer" name="event">
                        <q-popup-proxy cover transition-hide="scale" transition-show="scale">
                          <q-date
                            v-model="episodeStore.episode.date"
                            subtitle="Years"
                            title="Calendar"
                            today-btn
                          >
                            <div class="row items-center justify-end">
                              <q-btn v-close-popup color="primary" flat label="Close" />
                            </div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </q-item-section>
              </q-item>
              <q-item dense>
                <q-item-section>
                  <q-item-label>Season</q-item-label>
                </q-item-section>
                <q-item-section>
                  <q-input
                    v-model.number="episodeStore.episode.season"
                    filled
                    :rules="[(v) => (v != null && v != '') || 'Please fill in!']"
                    type="number"
                  />
                </q-item-section>
              </q-item>
              <q-item dense>
                <q-item-section>
                  <q-item-label>Episode</q-item-label>
                </q-item-section>
                <q-item-section>
                  <q-input
                    v-model.number="episodeStore.episode.episode"
                    filled
                    :rules="[(v) => (v != null && v != '') || 'Please fill in!']"
                    type="number"
                  />
                </q-item-section>
              </q-item>
              <q-item dense>
                <q-item-section>
                  <q-item-label>Duration</q-item-label>
                </q-item-section>
                <q-item-section>
                  <q-input
                    v-model.number="episodeStore.episode.duration"
                    filled
                    :rules="[(v) => (v != null && v != '') || 'Please fill in!']"
                    type="number"
                  />
                </q-item-section>
              </q-item>
              <q-item dense>
                <q-item-section>
                  <q-item-label>Had you watched?</q-item-label>
                </q-item-section>
                <q-item-section>
                  <q-toggle
                    v-model="episodeStore.episode.watched"
                    checked-icon="check"
                    unchecked-icon="clear"
                  />
                </q-item-section>
              </q-item>
            </q-list>

            <div class="q-mt-xl row justify-center">
              <q-btn class="q-mr-md" color="green" label="Submit" no-caps type="submit" />
              <q-btn
                class="q-mr-md"
                color="red"
                label="Cancel"
                no-caps
                @click="deleteEpisodeFromVar"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="openTitleForm" persistent transition-hide="scale" transition-show="scale">
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="q-px-xl text-h5 text-center">
            {{ editingTitle ? `Edit ${titleStore.title.title}` : "Add new title " }}
          </div>
        </q-card-section>
        <q-card-section>
          <q-form @submit="sendTitle()">
            <q-list dense>
              <q-item dense>
                <q-item-section>
                  <q-item-label>Title</q-item-label>
                </q-item-section>
                <q-item-section>
                  <q-input
                    v-model="titleStore.title.title"
                    filled
                    :rules="[(v) => (v != null && v != '') || 'Cannot be empty!']"
                    type="text"
                  />
                </q-item-section>
              </q-item>
              <q-item dense>
                <q-item-section>
                  <q-item-label>Image</q-item-label>
                </q-item-section>
                <q-item-section>
                  <q-input v-model="titleStore.title.img" filled type="url" />
                  <q-linear-progress />
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section></q-item-section>
                <q-item-section>
                  <q-btn disable icon="cloud_upload" label="Upload" no-caps></q-btn>
                </q-item-section>
              </q-item>
            </q-list>

            <div class="q-mt-xl row justify-center">
              <q-btn class="q-mr-md" color="green" label="Submit" no-caps type="submit" />
              <q-btn
                class="q-mr-md"
                color="red"
                label="Cancel"
                no-caps
                @click="deleteTitleFromVar"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<style scoped></style>
