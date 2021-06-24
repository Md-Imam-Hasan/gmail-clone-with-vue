<template>
  <div class="bulk-action-bar">
    <span class="checkbox">
      <input
        type="checkbox"
        :checked="allEmailSelected"
        :class="[someEmailSelected ? 'partial-check' : '']"
        @click="toogleAllSelect"
      />
    </span>
    <span class="button">
      <button
        @click="emailSelection.markRead"
        :disabled="[...emailSelection.emails].every((e) => e.read)"
      >
        Mark Read
      </button>
      <button
        @click="emailSelection.markUnread"
        :disabled="[...emailSelection.emails].every((e) => !e.read)"
      >
        Mark Unread
      </button>
      <button @click="emailSelection.archive" :disabled="selectedEmail === 0">
        Archive
      </button>
    </span>
  </div>
</template>

<script>
import { computed } from "@vue/runtime-core";
import useEmailSelection from "../composables/useEmailSelection";

export default {
  setup(props) {
    const emailSelection = useEmailSelection();
    const totalEmailNumber = computed(() => props.emails.length);
    const selectedEmail = computed(() => emailSelection.emails.size);
    const allEmailSelected = computed(
      () => totalEmailNumber.value === selectedEmail.value
    );
    const someEmailSelected = computed(
      () =>
        selectedEmail.value > 0 && selectedEmail.value < totalEmailNumber.value
    );

    const toogleAllSelect = () => {
      if (allEmailSelected.value) {
        emailSelection.removeAll();
      } else {
        emailSelection.addAll(props.emails);
      }
    };

    return {
      selectedEmail,
      emailSelection,
      allEmailSelected,
      someEmailSelected,
      toogleAllSelect,
    };
  },
  props: {
    emails: {
      type: Array,
      require: true,
    },
  },
  computed: {
    print() {},
  },
};
</script>

<style>
</style>