const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' }); //we always need to use in up side
const app = require('./app');

const DB = process.env.MONGO_STRING.replace('<PASSWORD>', process.env.PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log('DB connected successfully 🔥🎉');
  });

//define port
const port = process.env.PORT;
//for start the server of express
app.listen(port, () => {
  console.log(`the server start on port ${port} 🤡`);
});
