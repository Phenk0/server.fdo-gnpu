exports.processQuery = async function (ModelRaw, queryRaw, defaultSortBy = "") {
  //BUILD QUERY
  const queryObj = { ...queryRaw };

  // 1) Filtering & mutating -queryObj-
  const excludedFields = ["page", "sort", "limit", "fields"];
  excludedFields.forEach((fieldToDelete) => delete queryObj[fieldToDelete]);

  //1A) Advanced filtering
  const queryStr = JSON.stringify(queryObj).replace(
    /\b(gt|gte|lt|lte|in|all|eq)\b/g,
    (match) => `$${match}`,
  );

  const query = ModelRaw.find(JSON.parse(queryStr));

  // 2) Sorting
  if (queryRaw.sort) {
    const sortBy = queryRaw.sort.split(",").join(" ");
    query.sort(sortBy);
  } else if (defaultSortBy) {
    query.sort(defaultSortBy);
  }

  //3) Field limiting
  if (queryRaw.fields) {
    const fields = queryRaw.fields.split(",").join(" ");
    query.select(fields);
  } else {
    query.select("-__v");
  }

  //4) Pagination
  const page = queryRaw.page * 1 || 1;
  const limit = queryRaw.limit * 1 || 10;
  const skip = (page - 1) * limit;

  query.skip(skip).limit(limit);

  if (queryRaw.page) {
    const numDocs = await ModelRaw.countDocuments();
    if (skip >= numDocs) throw new Error("This page does not exist");
  }

  //RESULT
  return query;
};
