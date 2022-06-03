<script setup lang="ts">
  import { useTitleStore } from "../store/titleStore";

  const titleStore = useTitleStore();

  const props = defineProps<{
    modelValue: boolean;
    editing?: boolean;
    titleId?: number;
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

  async function send() {
    if (props.editing) {
      await titleStore.editById();
    } else {
      await titleStore.create();
    }
    show.value = false;
    emit("close", true);
  }

  function cancel() {
    show.value = false;
    emit("close");
  }

  function validateUrl(url: string) {
    if (url) {
      return /\/\/(\S+?(?:jpe?g|png|gif))/.test(url);
    }
    return true;
  }

  onMounted(() => {
    if (props.editing) {
      titleStore.getById(props.titleId!);
    }
  });
</script>

<template>
  <q-dialog v-model="show" persistent transition-hide="scale" transition-show="scale">
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="q-px-xl text-h5 text-center">
          {{ editing ? `Edit ${titleStore.title.title}` : "Add new title " }}
        </div>
      </q-card-section>
      <q-card-section>
        <q-form @submit="send">
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
                <q-input
                  v-model="titleStore.title.img"
                  filled
                  :rules="[(url) => validateUrl(url) || 'This must be an image or empty!']"
                  type="url"
                />
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
            <q-btn class="q-mr-md" color="red" label="Cancel" no-caps @click="cancel" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style lang="scss" scoped></style>
