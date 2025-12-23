import { createApp } from "./app.js";

const PORT = process.env.PORT || 3001;
const server = createApp();

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
