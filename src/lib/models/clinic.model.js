import mongoose from 'mongoose'

const clinicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  services: [{
    type: String
  }],
  doctors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DoctorForm'
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    default: null
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  }
}, { timestamps: true })

const Clinic = mongoose.models.Clinic || mongoose.model('Clinic', clinicSchema)

export default Clinic