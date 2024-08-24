const AppError = require("./appError");

class AppQuery {
  constructor(Model, queryRaw) {
    this.Model = Model;
    this.queryRaw = queryRaw;
    this.query = null;
  }
  filter() {
    const queryObj = { ...this.queryRaw };

    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((fieldToDelete) => delete queryObj[fieldToDelete]);

    const queryStr = JSON.stringify(queryObj).replace(
      /\b(gt|gte|lt|lte|in|all|eq)\b/g,
      (match) => `$${match}`,
    );
    this.query = this.Model.find(JSON.parse(queryStr));

    return this;
  }

  sort(defaultSortBy = "") {
    if (this.queryRaw.sort) {
      const sortBy = this.queryRaw.sort.split(",").join(" ");
      this.query.sort(sortBy);
    } else {
      this.query.sort(defaultSortBy);
    }
    return this;
  }

  limitFields() {
    if (this.queryRaw.fields) {
      const fields = this.queryRaw.fields.split(",").join(" ");
      this.query.select(fields);
    } else {
      //excluding unnecessary fields
      this.query.select("-__v");
    }
    return this;
  }

  async paginate() {
    const page = Number(this.queryRaw.page) || 1;
    const limit = Number(this.queryRaw.limit) || 10;
    const skip = (page - 1) * limit;

    this.query.skip(skip).limit(limit);

    if (this.queryRaw.page) {
      const numDocs = await this.Model.countDocuments();
      if (skip >= numDocs) throw new AppError("This page does not exist", 404);
    }
    return this;
  }
}

module.exports = AppQuery;

// exports.processQuery = async function (ModelRaw, queryRaw, defaultSortBy = "") {
//   //BUILD QUERY
//   const queryObj = { ...queryRaw };
//
//   // 1) Filtering & mutating -queryObj-
//   const excludedFields = ["page", "sort", "limit", "fields"];
//   excludedFields.forEach((fieldToDelete) => delete queryObj[fieldToDelete]);
//
//   //1A) Advanced filtering
//   const queryStr = JSON.stringify(queryObj).replace(
//     /\b(gt|gte|lt|lte|in|all|eq)\b/g,
//     (match) => `$${match}`,
//   );
//
//   const query = ModelRaw.find(JSON.parse(queryStr));
//
//   // 2) Sorting
//   if (queryRaw.sort) {
//     const sortBy = queryRaw.sort.split(",").join(" ");
//     query.sort(sortBy);
//   } else if (defaultSortBy) {
//     query.sort(defaultSortBy);
//   }
//
//   //3) Field limiting
//   if (queryRaw.fields) {
//     const fields = queryRaw.fields.split(",").join(" ");
//     query.select(fields);
//   } else {
//     query.select("-__v");
//   }
//
//   //4) Pagination
//   const page = queryRaw.page * 1 || 1;
//   const limit = queryRaw.limit * 1 || 10;
//   const skip = (page - 1) * limit;
//
//   query.skip(skip).limit(limit);
//
//   if (queryRaw.page) {
//     const numDocs = await ModelRaw.countDocuments();
//     if (skip >= numDocs) throw new Error("This page does not exist");
//   }
//
//   //RESULT
//   return query;
// };
