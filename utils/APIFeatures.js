class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryobj = { ...this.queryString };
    const excludeFields = ["page", "limit", "sort", "fields"];
    excludeFields.forEach((el) => delete queryobj[el]);

    let querystr = JSON.stringify(queryobj);
    querystr = querystr.replace(
      /\b(gte|gt|lte|lt|eq|in)\b/g,
      (match) => `$${match}`
    );
    this.query = this.query.find(JSON.parse(querystr));
    return this;
  }
  sorting() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }
  limiting() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }
  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
