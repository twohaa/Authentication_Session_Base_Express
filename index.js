require("dotenv").config();
const app = require("./app");
// const app = require("./app2");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
