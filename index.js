
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "server", "public")));

app.use(express.static(path.join(__dirname, "server", "public")));

// Connect to MongoDB
mongoose.connect(
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/vehicleServiceDB"
)
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch(error => console.error("MongoDB Error:", error.message));

// Define Schema
const bookingSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    vehicleNumber: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    vehicleType: {
        type: String,
        required: true
    },
    serviceType: {
        type: String,
        required: true
    },
    serviceDate: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Booked", "In Progress", "Completed", "Cancelled"],
        default: "Booked"
    }
});

// Create Model
const Booking = mongoose.model("Booking", bookingSchema);

// CREATE: Save a new booking
app.post("/api/bookings", async (req, res) => {
    try {
        const booking = await Booking.create(req.body);

        res.status(201).json({
            message: "Booking saved successfully",
            booking: booking
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// READ: Retrieve all bookings
app.get("/api/bookings", async (req, res) => {
    try {
        const bookings = await Booking.find().sort({
            createdAt: -1
        });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({
            message: "Unable to retrieve bookings"
        });
    }
});

// READ: Retrieve one booking
app.get("/api/bookings/:id", async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        res.json(booking);
    } catch (error) {
        res.status(400).json({
            message: "Invalid booking ID"
        });
    }
});

// UPDATE: Modify an existing booking
app.put("/api/bookings/:id", async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        res.json({
            message: "Booking updated successfully",
            booking: booking
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// DELETE: Remove a booking
app.delete("/api/bookings/:id", async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(
            req.params.id
        );

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        res.json({
            message: "Booking deleted successfully"
        });
    } catch (error) {
        res.status(400).json({
            message: "Invalid booking ID"
        });
    }
});

// Start server only after MongoDB connects
mongoose.connection.once("open", () => {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
});

