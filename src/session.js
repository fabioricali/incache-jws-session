const jws = require('jws')
const InCache = require('incache')
const store = new InCache()
const TOKEN_NOT_VALID = 'Token is not valid'

class Session {
  /**
   * constructor config
   * @param  {string} secret a secret key used to generate the token
   * @param  {string} serverHost hostname of the server
   * @param  {int}    time minutes of life for the token
   */
  constructor(config){
    this.secret = config.secret
    this.server = config.serverHost
    this.time = config.time
  }

  /**
   * insert admin or user session
   * @param  {int}  session.user id of the user
   * @param  {string}  session.token generated token
   * @param  {unixtime}  session.exp expiration time of token
   */
  insert(session){
    store.set(`${session.type}-${session.user}`, session)
  }

  /**
   * deleteToken description
   * @param  {type}  token user token
   */
  async deleteToken(token){
    const decoded = await this.decodeToken(token)
    store.remove(`${decoded.type}-${decoded.id}`)
  }

  /**
   * check the token status
   * @param  {string}  token        user token
   * @param  {object}  error        internal error list params
   * @return {Object}  isLogged: boolean, token: 'string', message: 'string', updated: boolean
   */
  async check(token){

    let isLogged = false
    let message = null

    const decoded = await this.decodeToken(token)

    if(!decoded){

      message = TOKEN_NOT_VALID

    } else {

      if(new Date() > new Date(decoded.exp)){

        store.remove(`${decoded.type}-${decoded.id}`)
        message = TOKEN_NOT_VALID

      } else {

        const storedSession = store.get(`${decoded.type}-${decoded.id}`)

        if(storedSession !== null && storedSession.hasOwnProperty('token') && storedSession.token === token)
          isLogged = true

      }
    }

    return { isLogged, token, message }
  }

  /**
   * createToken
   * @param  {type}  id user id or anything that you like to use as identificator
   * @return {string}   token
   */
  async createToken(id, type) {
    const time = new Date()
    time.setMinutes(time.getMinutes() + this.time)

    const payload = {
      iss: this.server,
      exp: time,
      id: id,
      type: type
    }

    return await jws.sign({ header: { alg: 'HS256' }, payload: payload, secret: this.secret })
  }

  /**
   * decodeToken return the information crypted inside the token
   * @param  {type}    token description
   * @return {decoded} contain serverHost, expiration date and an identificator
   */
  async decodeToken(token) {
  	let decoded = false
    try {
      await jws.verify(String(token), 'HS256', String(this.secret))
  		decoded = await jws.decode(token)
  		decoded = JSON.parse(decoded.payload)
  	}
  	catch(error) {
      if(error){
        return false
      }
    }
  	return decoded
  }

}

module.exports = Session
