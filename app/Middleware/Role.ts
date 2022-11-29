import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Role {
  public async handle({}: HttpContextContract, next: () => Promise<void>, guards: string[]) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    await next()
  }
}
