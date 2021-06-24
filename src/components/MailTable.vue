<template>
  <button @click="changeScreen('inbox')" :disabled="selectedScreen === 'inbox'">
    Inbox
  </button>
  <button
    @click="changeScreen('archive')"
    :disabled="selectedScreen === 'archive'"
  >
    Archive
  </button>
  <bulk-action-bar :emails="filteredEmails" />
  <table class="mail-table">
    <tbody>
      <tr
        v-for="email in filteredEmails"
        :key="email.id"
        :class="['clickable', email.read ? 'read' : '']"
      >
        <td>
          <input
            type="checkbox"
            @click="emailSelection.toggle(email)"
            :checked="emailSelection.emails.has(email)"
          />
        </td>
        <td @click="openMail(email)">{{ email.from }}</td>
        <td @click="openMail(email)">
          <p>
            <strong>{{ email.subject }}</strong> - {{ email.body }}
          </p>
        </td>
        <td class="date" @click="openMail(email)">
          {{ format(new Date(email.sentAt), "MMM do YYY") }}
        </td>
        <td>
          <button @click="archiveMail(email)">Archive</button>
        </td>
      </tr>
    </tbody>
  </table>
  <modal-view v-if="openedMail" @closeModal="openedMail = null">
    <mail-view :email="openedMail" @changeEmail="changeEmail" />
  </modal-view>
</template>

<script>
import { format } from "date-fns";
import axios from "axios";
import MailView from "./MailView.vue";
import ModalView from "./ModalView.vue";
import useEmailSelection from "../composables/useEmailSelection";
import BulkActionBar from "./BulkActionBar.vue";
import { ref } from "@vue/reactivity";

export default {
  components: { MailView, ModalView, BulkActionBar },
  async setup() {
    const { data: emails } = await axios(`http://localhost:3000/emails`);
    return {
      format,
      emails: ref(emails),
      openedMail: ref(null),
      emailSelection: useEmailSelection(),
      selectedScreen: ref("inbox"),
    };
  },
  computed: {
    sortedEmail() {
      return this.emails.sort((e1, e2) => {
        return e1.sentAt < e2.sentAt ? 1 : -1;
      });
    },
    filteredEmails() {
      if (this.selectedScreen === "inbox") {
        return this.sortedEmail.filter((e) => e.archived !== true);
      } else {
        return this.sortedEmail.filter((e) => e.archived === true);
      }
    },
  },
  methods: {
    changeScreen(screen) {
      this.selectedScreen = screen;
      this.emailSelection.removeAll();
    },
    openMail(email) {
      this.openedMail = email;
      if (email) {
        email.read = true;
        this.updateEmail(email);
      }
    },
    archiveMail(email) {
      email.archived = true;
      this.updateEmail(email);
    },
    updateEmail(email) {
      axios.put(`http://localhost:3000/emails/${email.id}`, email);
    },
    changeEmail({ toggleRead, toggleArchive, save, closeModal, changeIndex }) {
      const email = this.openedMail;
      if (toggleRead) {
        email.read = !email.read;
      }
      if (toggleArchive) {
        email.archived = !email.archived;
      }
      if (save) {
        this.updateEmail(email);
      }
      if (closeModal) {
        this.openedMail = null;
      }
      if (changeIndex) {
        const emails = this.filteredEmails;
        const currentIndex = emails.indexOf(this.openedMail);
        const newEmail = emails[currentIndex + changeIndex];
        this.openMail(newEmail);
      }
    },
  },
};
</script>

<style>
</style>