class ApiResponce {
   constructor(statusCode,data,message="success"){
    this.data=data
    this.message=message
    this.success = statusCode < 400

   }

}

export { ApiResponce }