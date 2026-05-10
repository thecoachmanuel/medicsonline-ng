import mongoose from 'mongoose'

const doctorAvailabilitySchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DoctorForm',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  isBooked: {
    type: Boolean,
    default: false
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  }
}, { timestamps: true })

const DoctorAvailability = mongoose.models.DoctorAvailability || mongoose.model('DoctorAvailability', doctorAvailabilitySchema)

export default DoctorAvailability