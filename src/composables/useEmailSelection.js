import { reactive } from "@vue/reactivity";
import axios from "axios";

let emails = reactive(new Set());
export const useEmailSelection = () => {
  const toggle = email => {
    if (emails.has(email)) {
      emails.delete(email);
    } else {
      emails.add(email);
    }
  };
  const removeAll = () => {
    emails.clear();
  };
  const addAll = newEmails => {
    newEmails.forEach(email => {
      emails.add(email);
    });
  };
  const markSelected = fn => {
    emails.forEach(email => {
      fn(email);
      axios.put(`http://localhost:3000/emails/${email.id}`, email);
    });
  };
  const markRead = () => markSelected(e => (e.read = true));
  const markUnread = () => markSelected(e => (e.read = false));
  const archive = () => {
    markSelected(e => (e.archived = true));
    removeAll();
  };
  return {
    emails,
    toggle,
    removeAll,
    addAll,
    markRead,
    markUnread,
    archive
  };
};

export default useEmailSelection;
