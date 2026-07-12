const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    userEmail: {
      type: String,
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    status: {
      type: String,
      enum: ['new', 'read', 'resolved'],
      default: 'new'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);