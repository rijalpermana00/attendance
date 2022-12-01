/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from '@ioc:Adonis/Core/Route'
import HealthCheck from '@ioc:Adonis/Core/HealthCheck'
import { DateTime } from 'luxon'
import User from 'App/Models/User'

// Route.get('/', async ({ view }) => {
//   return view.render('welcome')
// })

Route.get('health', async ({ response }) => {
  const report = await HealthCheck.getReport()

return report.healthy
? response.ok(report)
: response.badRequest(report)
})

Route.get('/', async () => {
	return { 
	   hello: `let's get started`
   }
})

Route.post('register', 'UsersController.register')
Route.post('login', 'UsersController.login')
Route.get('logout', 'UsersController.logout').middleware("auth:api")

Route.group(() => {
	Route.get('/users', 'UsersController.list').middleware(["auth:api","role:admin"])
	
	Route.group(() => {
		Route.post('/create', 'ShiftsController.store').middleware(["auth:api","role:admin"])
		Route.post('/map', 'ShiftsController.map').middleware(["auth:api","role:admin"])
	}).prefix('/shift')
	
}).prefix('/api')

Route.get('/index', 'UsersController.index').middleware("auth:api")

Route.post('send-email', 'UsersController.sendEmail')
Route.post('forgot-password', 'UsersController.forgotPassword')

Route.get('/verify/:email', async ({ request }) => {

	if (request.hasValidSignature()) {
		
		const query = request.url()
		const url = query.split("/");

		const user = await User.findByOrFail('email', url[2])
		user.updatedAt = DateTime.local() // Luxon dateTime is used
		user.auth_dtm = DateTime.local() // Luxon dateTime is used
		user.status_id = 1

		await user.save();

		return {
			code:'0',
			info:'Email Verified'
		}
		
	}

  	return {code:'1',info:'Url is not valid'}
	  
}).as('verifyEmail')

Route.get('/locked/:email', async ({ request }) => {

	if (request.hasValidSignature()) {
		
		const query = request.url()
		const url = query.split("/");

		const user = await User.findByOrFail('email', url[2])
		user.updatedAt = DateTime.local() // Luxon dateTime is used
		user.status_id = 1
		user.attempts = 0

		await user.save();

		return {code:'0',info:'Account Unlocked'}
		
	}

  	return {code:'1',info:'Url is not valid'}
	  
}).as('lockedAccount')