const { Schema, model } = require("mongoose");
const slugify = require("slugify");

const { customTransliterateUkr } = require("../utils/customTransliterateUkr");

//SCHEMA
//embedded schema
const socialSchema = new Schema({
  googleAcademy: {
    type: String,
    validate: [
      (value) =>
        /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/\S*)?$/.test(
          value,
        ),
      "Будь-ласка вкажіть дійсне посилання",
    ],
  },
  orcid: {
    type: String,
    validate: [
      (value) =>
        /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/\S*)?$/.test(
          value,
        ),
      "Будь-ласка вкажіть дійсне посилання",
    ],
  },
  WoSRID: {
    type: String,
    validate: [
      (value) =>
        /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/\S*)?$/.test(
          value,
        ),
      "Будь-ласка вкажіть дійсне посилання",
    ],
  },
  publons: {
    type: String,
    validate: [
      (value) =>
        /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/\S*)?$/.test(
          value,
        ),
      "Будь-ласка вкажіть дійсне посилання",
    ],
  },
  rGate: {
    type: String,
    validate: [
      (value) =>
        /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/\S*)?$/.test(
          value,
        ),
      "Будь-ласка вкажіть дійсне посилання",
    ],
  },
  scopusID: {
    type: String,
    validate: [
      (value) =>
        /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/\S*)?$/.test(
          value,
        ),
      "Будь-ласка вкажіть дійсне посилання",
    ],
  },
  bibliometrics: {
    type: String,
    validate: [
      (value) =>
        /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/\S*)?$/.test(
          value,
        ),
      "Будь-ласка вкажіть дійсне посилання",
    ],
  },
  scienceUkr: {
    type: String,
    validate: [
      (value) =>
        /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/\S*)?$/.test(
          value,
        ),
      "Будь-ласка вкажіть дійсне посилання",
    ],
  },
});

//main schema
const staffSchema = new Schema(
  {
    slug: String,
    name: {
      type: String,
      required: [true, "Будь-ласка вкажіть повне ім'я працівника"],
      unique: true,
      trim: true,
      match: [
        /^[А-ЯІЇЄҐа-яіїєґ'’-]{2,}\s[А-ЯІЇЄҐа-яіїєґ'’-]{2,}(-[А-ЯІЇЄҐа-яіїєґ'’-]{2,})?(\s[А-ЯІЇЄҐа-яіїєґ'’-]{2,})?$/,
        "Вкажіть дійсне повне ім'я",
      ],
      // validate: [
      //   (value) =>
      //     /^[А-ЯІЇЄҐа-яіїєґ'’-]{2,}\s[А-ЯІЇЄҐа-яіїєґ'’-]{2,}(-[А-ЯІЇЄҐа-яіїєґ'’-]{2,})?(\s[А-ЯІЇЄҐа-яіїєґ'’-]{2,})?$/.test(
      //       value,
      //     ),
      //   "Будь-ласка вкажіть дійсне повне ім'я працівника українською мовою",
      // ],
    },
    photo: {
      type: String,
      required: [true, "Будь-ласка надайте шлях до фото працівника"],
      match: [
        /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/\S*)?$/,
        "Будь-ласка вкажіть дійсну адресу зберігання зображення",
      ],
    },
    email: {
      type: String,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Будь-ласка вкажіть дійсну адресу електронної пошти",
      ],
    },
    phone: {
      type: String,
      match: [/^\+?3?8?(0\d{9})$/, "Будь-ласка вкажіть дійсний номер телефону"],
    },
    department: {
      type: String,
      required: [true, "Будь-ласка вкажіть кафедру працівника"],
      enum: {
        values: ["ktmfv", "ktmdo", "kdpp"],
        message: "Виберіть дійсну кафедру",
      },
    },

    position: {
      type: String,
      enum: {
        values: [
          "завідувач",
          "професор",
          "доцент",
          "старший викладач",
          "викладач",
          "асистент",
          "старший лаборант",
        ],
        message: "Виберіть дійсну посаду",
      },
      required: [true, "Будь-ласка вкажіть посаду працівника"],
    },
    positionRank: { type: Number },

    social: socialSchema,
    qualification: String,
    education: {
      type: [String],
      required: [true, "Будь-ласка вкажіть роки та місце навчання працівника"],
    },
    degree: [String],
    dissertationTopic: [String],
    academicTitle: [String],
    awardsAndHonors: [String],
    supervision: [String],
    scientificWorksList: String,
    professionalDevelopment: [String],
    certificationTable: String,
    certificates: [String],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

staffSchema.methods.setPositionRank = function () {
  const positionRankMap = {
    завідувач: 1,
    професор: 2,
    доцент: 3,
    "старший викладач": 4,
    викладач: 5,
    асистент: 6,
    "старший лаборант": 7,
  };

  this.positionRank = positionRankMap[this.position];
};

//Doc pre-MIDDLEWARE : runs before .save() and .create()
staffSchema.pre("save", function (next) {
  const transliteratedName = customTransliterateUkr(this.name);

  this.slug = slugify(transliteratedName, {
    lower: true,
    remove: /[*+~.()'"!:@]/g,
    strict: true,
    locale: "uk",
  });

  next();
});

//add calculated -positionRank- field
staffSchema.pre("save", function (next) {
  if (this.isModified("position")) {
    this.setPositionRank();
  }
  next();
});
//Doc post-MIDDLEWARE : staffSchema.post('save',(doc, next)=>{console.log(doc);next();})

//ensures that uniqueness is set
staffSchema.index({ name: 1 }, { unique: true });

//MODEL
const Staff = model("Staff", staffSchema);

//somehow without this unique property do not apply immediately
(async () => await Staff.syncIndexes())();

module.exports = Staff;
