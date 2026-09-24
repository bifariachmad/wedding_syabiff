export const storage = {
  get(key) {try{return JSON.parse(localStorage.getItem(key));}catch{return null;}},
  set(key,value) {try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}},
  remove(key) {try{localStorage.removeItem(key);}catch{}},
};
