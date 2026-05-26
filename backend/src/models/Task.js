const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'title is required'],
      minlength: [3, 'title must be at least 3 characters'],
      maxlength: [100, 'title must be at most 100 characters'],
      trim: true,
    },
    description: {
      type: String,
      maxlength: [500, 'description must be at most 500 characters'],
      default: '',
      trim: true,
    },
    importance: {
      type: Number,
      required: [true, 'importance is required'],
      min: [1, 'importance must be at least 1'],
      max: [5, 'importance must be at most 5'],
    },
    dueDate: {
      type: Date,
      required: [true, 'dueDate is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'completed'],
        message: 'status must be pending or completed',
      },
      default: 'pending',
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    versionKey: false,
  }
);

module.exports = mongoose.model('Task', taskSchema);
