/**
 * type-safe `Array.prototyp.includes`
 */
export const tsIncludes = <TestType, ListType extends TestType[]>(
  test: TestType,
  list: ListType
) => list.includes(test);
