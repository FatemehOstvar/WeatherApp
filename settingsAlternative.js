



const body = document.querySelector("body");
const p = document.createElement("p");
body.appendChild(p);
const settingList = {setting:"mock from front end",setting2:"another mock from front end"}; // TODO comes from outside! from server sent json
const list = document.createElement("ul");

for (const { Key, val } in settingList) {
  const tempElement = document.createElement("li");
  tempElement.value = `${Key}: ${val}`;
  list.append(tempElement);
}

body.appendChild(list);
