const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/registration_db'

const registrationSchema = new mongoose.Schema({
	studentName: { type: String, required: true },
	rollNo: { type: String, required: true },
	dateOfBirth: { type: String, required: true },
	bloodGroup: { type: String, required: true },
	phone: { type: String, required: true },
	email: { type: String, required: true },
	address: { type: String, required: true },
	department: { type: String, required: true },
	gender: { type: String, required: true },
	year: { type: String, required: true },
	section: { type: String, required: true },
	backlogs: { type: String, required: true },
	companies: { type: [String], required: true, validate: (companies) => companies.length === 4 },
}, { timestamps: true })

const Registration = mongoose.model('Registration', registrationSchema)

app.use(cors())
app.use(express.json())

app.get('/', (_request, response) => {
	response.send('Registration server is running')
})

app.get('/api/registrations', async (_request, response) => {
	try {
		const registrations = await Registration.find().sort({ createdAt: -1 })
		response.json(registrations)
	} catch (error) {
		response.status(500).json({ message: 'Unable to load registrations' })
	}
})

app.post('/api/registrations', async (request, response) => {
	try {
		const registration = await Registration.create(request.body)
		response.status(201).json(registration)
	} catch (error) {
		response.status(400).json({ message: 'Unable to save registration', error: error.message })
	}
})

app.get('/api/health', (_request, response) => {
	response.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' })
})

mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
	.then(() => {
		app.listen(port, () => {
			console.log(`Server running on http://localhost:${port}`)
		})
	})
	.catch((error) => {
		console.error(`MongoDB connection failed: ${error.message}`)
		process.exit(1)
	})
