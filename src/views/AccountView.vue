<script setup lang="ts">
  import { useUsersStore } from "../store/usersStore";

  const usersStore = useUsersStore();

  const anyLoggedUser = computed(() => (usersStore.getLoggedUser ? true : false));

  interface IReactiveData {
    usernameOrEmail: string;
    password: string;
  }

  // const r = reactive<IReactiveData>({
  //   usernameOrEmail: "student001@jedlik.eu",
  //   password: "student001",
  // });
  const r = reactive<IReactiveData>({
    usernameOrEmail: "test",
    password: "test1234",
  });

  function Submit() {
    if (!anyLoggedUser.value) {
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
          <h5 v-if="!anyLoggedUser" class="text-center q-mt-sm q-mb-none">Login</h5>
          <h5 v-else class="text-center q-mt-sm q-mb-none">Logout</h5>
          <q-input
            v-model="r.usernameOrEmail"
            :disable="anyLoggedUser"
            filled
            label="e-mail:"
            :rules="[(v) => (v != null && v != '') || 'Please fill in!']"
            type="text"
          />
          <q-input
            v-if="!anyLoggedUser"
            v-model="r.password"
            filled
            label="Password:"
            :rules="[(v) => (v != null && v != '') || 'Please fill in!']"
            type="text"
          />
          <div class="row justify-center">
            <q-btn
              class="q-mr-md"
              color="green"
              :label="anyLoggedUser ? 'Logout' : 'Login'"
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
