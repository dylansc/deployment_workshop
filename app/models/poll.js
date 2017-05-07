import mongoose, { Schema } from 'mongoose';

const PollSchema = new Schema({
  text: String,
  imageURL: String,
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
}, {
  toJSON: {
    virtuals: true,
  },
});

PollSchema.virtual('score').get(function scoreCalc() {
  return this.upvotes - this.downvotes;
});

// create model class
const PollModel = mongoose.model('Poll', PollSchema);

export default PollModel;
