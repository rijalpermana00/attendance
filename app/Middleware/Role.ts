import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Roles } from 'App/Enums/Roles'

export default class Role {
  // .middleware(['auth', 'role:admin'])
  public async handle({ response, auth }: HttpContextContract, next: () => Promise<void>, guards: string[]) {
    const roleIds = guards.map(guard => Roles[guard.toUpperCase()])
    
    // code for middleware goes here. ABOVE THE NEXT CALL
    if (!roleIds.includes(auth.user?.role_id)) {
      return response.unauthorized({ error: `This is restricted to ${guards.join(', ')} users` })
    }

    await next()
  }
}