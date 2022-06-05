<script setup lang="ts">
  import { computed } from "vue";
  import { useEpisodeStore } from "../store/episodeStore";

  const episodeStore = useEpisodeStore();

  const props = defineProps<{
    modelValue: boolean;
    editing?: boolean;
    selectedTitle: {
      id: number;
      title: string;
    };
    episodeId?: number;
  }>();
  const emit = defineEmits<{
    // eslint-disable-next-line no-unused-vars
    (event: "update:modelValue", value: boolean): void;
    // eslint-disable-next-line no-unused-vars
    (event: "close", save?: boolean): void;
  }>();

  const show = computed({
    get() {
      return props.modelValue;
    },
    set(value: boolean) {
      return emit("update:modelValue", value);
    },
  });

  function send() {
    if (props.editing) {
      episodeStore.editById();
    } else {
      episodeStore.create(props.selectedTitle.id);
    }
    show.value = false;
    emit("close", true);
  }

  function cancel() {
    episodeStore.episode = {};
    show.value = false;
    emit("close");
  }

  onMounted(() => {
    if (props.editing) {
      episodeStore.getById(props.episodeId!);
    } else {
      episodeStore.episode = { date: "", watched: 0 };
    }
  });
</script>

<template>
  <q-dialog v-model="show" persistent transition-hide="scale" transition-show="scale">
    <q-card style="min-width: 700px">
      <q-card-section>
        <div class="q-px-xl text-h5 text-center">
          {{ editing ? "Edit episode of " : "Add episode to " }}{{ props.selectedTitle.title }}
        </div>
      </q-card-section>
      <q-card-section>
        <q-form @submit="send">
          <q-list dense>
            <q-item dense>
              <q-item-section>
                <q-item-label>Date</q-item-label>
              </q-item-section>
              <q-item-section>
                <q-input
                  v-model="episodeStore.episode.date"
                  clearable
                  filled
                  mask="####-##-##"
                  @clear="episodeStore.episode.date = ''"
                >
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
                  :false-value="0"
                  :toggle-indeterminate="false"
                  :true-value="1"
                  unchecked-icon="clear"
                />
              </q-item-section>
            </q-item>
          </q-list>

          <div class="q-mt-xl row justify-center">
            <q-btn class="q-mr-md" color="green" label="Submit" no-caps type="submit" />
            <q-btn class="q-mr-md" color="red" label="Cancel" no-caps @click="cancel" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped></style>
