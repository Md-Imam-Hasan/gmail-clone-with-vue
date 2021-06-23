<template>
  <h1>{{ emailSelection.emails.size }}</h1>
  <table class="mail-table">
    <tbody>
      <tr
        v-for="email in unarchivedEmails"
        :key="email.id"
        :class="['clickable', email.read ? 'read' : '']"
      >
        <td>
          <input
            type="checkbox"
            @click="emailSelection.toggle(email)"
            :selected="emailSelection.emails.has(email)"
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
import { reactive } from "@vue/reactivity";
export default {
  components: { MailView, ModalView },
  async setup() {
    let selected = reactive(new Set());
    const emailSelection = {
      emails: selected,
      toggle(email) {
        if (selected.has(email)) {
          selected.delete(email);
        } else {
          selected.add(email);
        }
      },
    };
    const { data: emails } = await axios(`http://localhost:3000/emails`);
    return {
      format,
      emails,
      openedMail: null,
      emailSelection,
    };
  },
  computed: {
    sortedEmail() {
      return this.emails.sort((e1, e2) => {
        return e1.sentAt < e2.sentAt ? 1 : -1;
      });
    },
    unarchivedEmails() {
      return this.sortedEmail.filter((e) => e.archived != true);
    },
  },
  methods: {
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
        const emails = this.unarchivedEmails;
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