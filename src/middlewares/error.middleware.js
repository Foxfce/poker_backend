export default (error, req, res, next) => {
  console.log(error)
  const statusCode = error.statusCode || 500
  res.status(statusCode).json({ error: error.message })
}