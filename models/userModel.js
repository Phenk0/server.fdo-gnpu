const crypto = require("crypto");
const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new Schema({
  email: {
    type: String,
    required: [true, "Поле обов'язкове для заповнення"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
      "Вкажіть дійсну електронну пошту",
    ],
  },
  password: {
    type: String,
    required: [true, "Поле обов'язкове для заповнення"],
    minLength: [6, "Мінімальна довжина пароля 6 символів"],
    maxLength: [20, "Максимальна довжина пароля 20 символів"],
    select: false, ////??
  },
  passwordConfirm: {
    type: String,
    required: [true, "Поле обов'язкове для заповнення"],
    select: false, ////??
    validate: [
      //works only for Create OR Save
      function (value) {
        return value === this.password;
      },
      "Паролі не співпадають",
    ],
  },
  name: {
    type: String,
    required: [true, "Поле 'ПІБ' обов'язкове для заповнення"],
    trim: true,
    match: [
      /^[А-ЯІЇЄҐа-яіїєґ'’-]{2,}\s[А-ЯІЇЄҐа-яіїєґ'’-]{2,}(-[А-ЯІЇЄҐа-яіїєґ'’-]{2,})?(\s[А-ЯІЇЄҐа-яіїєґ'’-]{2,})?$/,
      "Вкажіть дійсні: Прізвище Ім'я та По-батькові(за наявності)",
    ],
  },
  nameShort: { type: String },
  photo: {
    type: String,
    trim: true,
    match: [
      /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/\S*)?$/,
      "Будь-ласка вкажіть дійсну адресу зберігання зображення: 'https://.../*.png'",
    ],
  },
  role: {
    type: String,
    enum: ["user", "student", "teacher", "moderator", "admin"],
    default: "user",
  },
  roleRequested: { type: String, select: false },
  passwordChangedAt: { type: Date },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: { type: Boolean, default: true, select: false },
});

// Password confirmation validation and encryption
userSchema.pre("save", async function (next) {
  // Run only if the password was modified
  if (!this.isModified("password")) return next();

  // Validate password confirmation, only if passwordConfirm is provided
  if (this.passwordConfirm && this.password !== this.passwordConfirm) {
    this.invalidate("passwordConfirm", "Паролі не співпадають");
    return next();
  }

  // Encrypt password
  this.password = await bcrypt.hash(this.password, 12);

  // Remove the passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

// Adding short name like: "Іван І." on save
userSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    const [lastName, firstName, ..._] = this.name.split(" ");
    this.nameShort = `${firstName} ${lastName[0]}.`;
  }
  next();
});
// Adding short name like: "Іван І." on update
userSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  if (update.name) {
    const [lastName, firstName, ..._] = update.name.split(" ");
    const shortName = `${firstName} ${lastName[0]}.`;
    this.setUpdate({
      ...update,
      nameShort: shortName,
    });
  }

  next();
});

// Sanitizing user role
userSchema.pre("save", function (next) {
  if (this.isModified("role")) {
    this.roleRequested = this.role;
    this.role = "user";
  }
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find().where("active").ne(false);
  next();
});

// method for comparing given password with stored encrypted password
userSchema.methods.comparePassword = async (candidatePassword, userPassword) =>
  await bcrypt.compare(candidatePassword, userPassword);

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// method for creating password reset token on -forgotPassword- routeHandler
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 1000 * 60 * 10;
  return resetToken;
};

module.exports = model("User", userSchema);
