interface MaybeMongoEntity {
  _id?: any
}

export function stripMongoId<T>(entity: T) {
  const mongoEntity = entity as MaybeMongoEntity
  delete mongoEntity._id
  return entity
}
