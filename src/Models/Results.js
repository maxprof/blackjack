import mongoose from 'mongoose';

const resultsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    default: false,
    type: Boolean
  },
  userScore: String,
  dealerScore: String
});

export default mongoose.model('Results', resultsSchema);
