import * as Db from 'src/db'

export namespace PostLogin {
  export const path = '/v1.0/login'

  export interface Body {
    username: string
    password: string
  }

  export type Response = Omit<Db.User, 'passwordHash'>
}

export namespace GetProfile {
  export const path = '/v1.0/profile'

  export type Response = Omit<Db.User, 'passwordHash'>
}

export namespace PostLogout {
  export const path = '/v1.0/logout'
}
