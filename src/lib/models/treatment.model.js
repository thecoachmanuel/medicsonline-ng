import mongoose from 'mongoose'

const treatmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
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
  specialty: {
    type: String,
    required: true
  },
  medicalCategory: {
    type: String,
    required: true
  },
  symptoms: [{
    type: String
  }],
  causes: [{
    type: String
  }],
  riskFactors: [{
    type: String
  }],
  diagnosis: [{
    type: String
  }],
  treatments: [{
    type: String
  }],
  prevention: [{
    type: String
  }],
  faqs: [{
    question: String,
    answer: String
  }],
  images: [{
    type: String
  }],
  references: [{
    type: String
  }],
  metaTitle: {
    type: String
  },
  metaDescription: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

const Treatment = mongoose.models.Treatment || mongoose.model('Treatment', treatmentSchema)

export default Treatment