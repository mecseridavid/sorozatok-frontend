<script setup lang="ts">
  import { useUsersStore } from "../store/usersStore";

  const usersStore = useUsersStore();

  interface IReactiveData {
    usernameOrEmail: string;
    password: string;
  }
  const r = reactive<IReactiveData>({
    usernameOrEmail: "test",
    password: "test1234",
  });

  function Submit() {
    if (!usersStore.loggedUser) {
      usersStore.loginUser(r.usernameOrEmail, r.password);
    } else {
      usersStore.logOut();
    }
  }
</script>

<template>
  <q-page>
    <div class="row justify-center">
      <div class="col-12 col-sm-8 col-md-6 col-lg-4 q-gutter-md">
        <q-form @submit="Submit">
          <h5 v-if="!usersStore.loggedUser" class="text-center q-mt-sm q-mb-none">
            {{ $t("login") }}
          </h5>
          <h5 v-else class="text-center q-mt-sm q-mb-none">{{ $t("logout") }}</h5>
          <q-input
            v-model="r.usernameOrEmail"
            :disable="usersStore.loggedUser != null"
            filled
            :label="$t('unameOrEmail') + ':'"
            :rules="[(v) => (v != null && v != '') || 'Please fill in!']"
            type="text"
          />
          <q-input
            v-if="!usersStore.loggedUser"
            v-model="r.password"
            filled
            :label="$t('password') + ':'"
            :rules="[(v) => (v != null && v != '') || 'Please fill in!']"
            type="text"
          />
          <div class="row justify-center">
            <q-btn
              class="q-mr-md"
              color="green"
              :label="usersStore.loggedUser ? $t('logout') : $t('login')"
              no-caps
              type="submit"
            />
          </div>
        </q-form>
      </div>
    </div>
  </q-page>
</template>

<style scoped></style>
