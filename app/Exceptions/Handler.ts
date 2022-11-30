/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| AdonisJs will forward all exceptions occurred during an HTTP request to
| the following class. You can learn more about exception handling by
| reading docs.
|
| The exception handler extends a base `HttpExceptionHandler` which is not
| mandatory, however it can do lot of heavy lifting to handle the errors
| properly.
|
*/

import Logger from '@ioc:Adonis/Core/Logger'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import I18n from '@ioc:Adonis/Addons/I18n'

export default class ExceptionHandler extends HttpExceptionHandler {
    protected statusPages = {
        '403': 'errors/unauthorized',
        '404': 'errors/not-found',
        '500..599': 'errors/server-error',
    }

    constructor () {
        super(Logger)
    }

    public async handle(error: any, ctx: HttpContextContract) {
        /**
         * Self handle the validation exception
         */
        const locale = I18n.locale('en')
        
        if (error.code === 'E_VALIDATION_FAILURE') {
            return {
                code : 401,
                info : locale.formatMessage('auth.E_VALIDATION_FAILURE'),
                data : null
            }
        }
        
        if(error.code === 'E_UNAUTHORIZED_ACCESS'){
            return {
                code : 401,
                info : locale.formatMessage('auth.E_UNAUTHORIZED_ACCESS'),
                data : null
            }
        }
        
        if(error.code === 'E_ROUTE_NOT_FOUND'){
            
            return {
                code : 404,
                info : locale.formatMessage('auth.E_ROUTE_NOT_FOUND'),
                data : null
            }
        }

        /**
         * Forward rest of the exceptions to the parent class
         */
        return super.handle(error, ctx)
    }
}
