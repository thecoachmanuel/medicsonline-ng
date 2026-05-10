import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  answers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer'
  }],
  isResolved: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

const Question = mongoose.models.Question || mongoose.model('Question', questionSchema)

export default Question