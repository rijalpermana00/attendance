import { BaseMailer, MessageContract } from '@ioc:Adonis/Addons/Mail'
import Env from '@ioc:Adonis/Core/Env'

export default class ForgotPassword extends BaseMailer {
	constructor(private request:any){
		super();
	}
  /**
   * WANT TO USE A DIFFERENT MAILER?
   *
   * Uncomment the following line of code to use a different
   * mailer and chain the ".options" method to pass custom
   * options to the send method
   */
  // public mailer = this.mail.use()

  /**
   * The prepare method is invoked automatically when you run
   * "ForgotPassword.send".
   *
   * Use this method to prepare the email message. The method can
   * also be async.
   */
  public prepare(message: MessageContract) {
		message
			.subject('Hey '+this.request.name+'!')
			.from(Env.get('SMTP_USER'))
			.to(this.request.email)
			.htmlView('emails/forgot', { 
				name: this.request.name,
				password: this.request.newPassword,
			})
  }
}
