import { buildFilterQuery } from "./url";

describe("buildFilterQuery", () => {
  it("should return an empty object when there are no filterQuery or sort parameters", () => {
    const context = {
      query: {
        otherParam: "value",
      },
    } as any;

    const result = buildFilterQuery(context);
    expect(result).toEqual({});
  });

  it("should return an object with filterQuery parameters", () => {
    const context = {
      query: {
        "filterQuery[name]": "John",
        "filterQuery[age]": "30",
        otherParam: "value",
      },
    } as any;

    const result = buildFilterQuery(context);
    expect(result).toEqual({
      "filterQuery[name]": "John",
      "filterQuery[age]": "30",
    });
  });

  it("should return an object with sort parameters", () => {
    const context = {
      query: {
        "sort[name]": "asc",
        "sort[age]": "desc",
        otherParam: "value",
      },
    } as any;

    const result = buildFilterQuery(context);
    expect(result).toEqual({
      "sort[name]": "asc",
      "sort[age]": "desc",
    });
  });

  it("should return an object with both filterQuery and sort parameters", () => {
    const context = {
      query: {
        "filterQuery[name]": "John",
        "filterQuery[age]": "30",
        "sort[name]": "asc",
        "sort[age]": "desc",
        otherParam: "value",
      },
    } as any;

    const result = buildFilterQuery(context);
    expect(result).toEqual({
      "filterQuery[name]": "John",
      "filterQuery[age]": "30",
      "sort[name]": "asc",
      "sort[age]": "desc",
    });
  });
});
