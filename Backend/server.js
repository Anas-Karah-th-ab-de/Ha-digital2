const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3910;
app.get('/api2/test', (req, res) => {
  res.json({ message: 'Test endpoint is working!' });
});
app.listen(PORT,process.env.App_URL, () => {
  logger.info(`Server is running on port ${PORT}`);
});
