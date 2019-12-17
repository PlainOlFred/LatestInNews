const usersSchema = new mongoose.Schema({
    firstName: {
      type: String,
      trim: true,
      required: "Must have"
    },
    lasttName: {
      type: String, 
      trim: true,
      required: "Must have"
    },
    userName: {
      type: String,
      trim: true,
      required: "Must have"
    }
  });