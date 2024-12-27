const express = require('express');
const bodyParser = require('body-parser');
const oracledb = require('oracledb');
const path = require('path');
require('dotenv').config();

oracledb.initOracleClient({ libDir: process.env.DB_LIBDIR });

const app = express();
const PORT = 3000;

// Middleware для обработки JSON
app.use(bodyParser.json());
app.use(express.static(`${__dirname}`));

app.get('/', async (req, res) => {
  res.redirect('/index.html')
})

// Конфигурация базы данных
const dbConfig = {
  user: process.env.DB_USER, // Замените на имя пользователя Oracle XE
  password: process.env.DB_PASSWORD, // Замените на пароль
  connectString: 'localhost/XE' // Подключение к Oracle XE
};

// Асинхронная обработка запросов
app.post('/query', async (req, res) => {
  const sqlQuery = req.body.query;

  if (!sqlQuery) {
    return res.status(400).json({ error: 'Запрос не предоставлен' });
  }

  let connection;

  try {
    // Устанавливаем соединение с базой данных
    connection = await oracledb.getConnection(dbConfig);
    console.log(sqlQuery)
    // Выполняем запрос
    const result = await connection.execute(sqlQuery);
    console.log(result.rows)
    // Возвращаем результат клиенту
    res.json({ success: true, result: result.rows, metaData: result.metaData });
  } catch (err) {
    console.error('Ошибка выполнения запроса:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    // Закрываем соединение
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Ошибка закрытия соединения:', err);
      }
    }
  }
});

// Запускаем сервер
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
