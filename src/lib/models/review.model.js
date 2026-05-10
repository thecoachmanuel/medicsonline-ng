import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DoctorForm',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema)

export default Review