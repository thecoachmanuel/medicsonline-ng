import mongoose from 'mongoose'

const appointmentSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DoctorForm',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  reason: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentReference: {
    type: String,
    default: ''
  },
  consultationFee: {
    type: Number,
    required: true
  }
}, { timestamps: true })

const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema)

export default Appointment