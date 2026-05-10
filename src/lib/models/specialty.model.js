import mongoose from 'mongoose'

const specialtySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  medicalCategory: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

const Specialty = mongoose.models.Specialty || mongoose.model('Specialty', specialtySchema)

export default Specialty
