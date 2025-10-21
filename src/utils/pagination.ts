export function paginate(page: number, limit: number) {
  const take = limit;
  const skip = (page - 1) * limit;
  return { take, skip };
}
