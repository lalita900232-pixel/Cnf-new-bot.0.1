const fs = require("fs");

let data = {
  users: {},
  settings: {
    customSlots: [
      { roleId: null, msg: null },
      { roleId: null, msg: null },
      { roleId: null, msg: null }
    ]
  }
};

if (fs.existsSync("./data.json")) {
  try {
    data = JSON.parse(fs.readFileSync("./data.json"));
  } catch (e) { console.log("New data file created."); }
}

function saveData() {
  fs.writeFileSync("./data.json", JSON.stringify(data, null, 2));
}

function ensureUser(id) {
  if (!data.users[id]) {
    data.users[id] = { total: 0, sessions: [], start: null };
  }
}

module.exports = { data, saveData, ensureUser };

