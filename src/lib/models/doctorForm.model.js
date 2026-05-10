import mongoose from 'mongoose'

const doctorFormSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
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
  gender: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  medicalLicenseNumber: {
    type: String,
    required: true
  },
  yearsOfExperience: {
    type: Number,
    required: true
  },
  medicalCategory: {
    type: String,
    required: true
  },
  specialty: {
    type: String,
    required: true
  },
  subSpecialty: {
    type: String,
    default: ''
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
  address: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  education: [{
    degree: String,
    institution: String,
    year: String
  }],
  certifications: [{
    name: String,
    issuingOrganization: String,
    issueDate: Date,
    expirationDate: Date
  }],
  languages: [{
    type: String
  }],
  consultationFee: {
    type: Number,
    default: 0
  },
  availability: [{
    day: String,
    startTime: String,
    endTime: String
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
  },
  planId: {
    type: String,
    default: 'free'
  },
  planCycle: {
    type: String,
    default: null
  },
  planStatus: {
    type: String,
    default: 'active'
  },
  currentPeriodEnd: {
    type: Date,
    default: null
  },
  paystackLastReference: {
    type: String,
    default: null
  }
}, { timestamps: true })

const DoctorForm = mongoose.models.DoctorForm || mongoose.model('DoctorForm', doctorFormSchema)

export default DoctorForm