const { Schema, model, SchemaTypes } = require("mongoose");
const { ValidateLengthContactName } = require("../config/constants");
const mongoosePaginate = require("mongoose-paginate-v2");

const contactSchema = new Schema(
  {
    name: {
      type: String,
      minLength: ValidateLengthContactName.MIN_LENGTH_NAME,
      maxLength: ValidateLengthContactName.MAX_LENGTH_NAME,
      required: [true, "Name for contact i require"],
    },
    surname: {
      type: String,
      minLength: ValidateLengthContactName.MIN_LENGTH_NAME,
      maxLength: ValidateLengthContactName.MAX_LENGTH_NAME,
      required: [true, "Surname for contact is require"],
    },
    email: {
      type: String,
      required: [true, "Email for contact is require"],
      unique: true,
    },
    phone: {
      type: String,
      required: [true, "Phone for contact is require"],
      unique: true,
    },
    favorite: { type: Boolean, default: false },
    owner: {
      type: SchemaTypes.ObjectId,
      ref: "user",
    },
  },
  {
    versionKey: false,
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

contactSchema.virtual("fullname").get(function () {
  return `${this.name} ${this.surname}`;
});

contactSchema.plugin(mongoosePaginate);

const Contact = model("Contact", contactSchema);

module.exports = {
  Contact,
};
