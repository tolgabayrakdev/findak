import 'dotenv/config';
import app from "./app.js";
import { config } from "./config/environment.js";

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});